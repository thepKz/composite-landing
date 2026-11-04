import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, stat, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import busboy from 'busboy';
import { fileTypeFromFile } from 'file-type';
import sharp from 'sharp';
import { RequestError } from './http';

// Media is supplied by a persistent runtime volume, never bundled into the server build.
export const uploadRoot=()=>path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR||'./data/uploads');
export async function receiveUpload(request:Request){
  const root=uploadRoot();await mkdir(root,{recursive:true});
  const id=randomUUID();const temporary=path.join(root,`${id}.part`);
  let finalPath='';let filename='';let fileCount=0;let truncated=false;let writer:Promise<void>|undefined;let parseError:Error|undefined;
  const maximum=100*1024*1024;
  try{
    if(!request.body)throw new RequestError('Vui lòng chọn tệp.',400);
    let parser;
    try{parser=busboy({headers:Object.fromEntries(request.headers),limits:{files:1,fields:0,fileSize:maximum,parts:2}});}catch{throw new RequestError('Định dạng tải tệp chưa đúng.',400);}
    parser.on('file',(_field,file,info)=>{
      fileCount++;filename=path.basename((info.filename||'media').replaceAll('\\','/')).slice(0,200);
      file.on('limit',()=>{truncated=true;});
      writer=pipeline(file,createWriteStream(temporary,{flags:'wx'}));
      writer.catch(error=>{parseError=error;});
    });
    parser.on('filesLimit',()=>{parseError=new RequestError('Mỗi lần chỉ tải một tệp.',400);});
    parser.on('fieldsLimit',()=>{parseError=new RequestError('Chỉ gửi tệp, không thêm trường dữ liệu.',400);});
    parser.on('partsLimit',()=>{parseError=new RequestError('Mỗi lần chỉ tải một tệp.',400);});
    let received=0;
    const limiter=new Transform({transform(chunk,_encoding,callback){received+=chunk.length;callback(received>maximum+65536?new RequestError('Video tối đa 100 MB.',413):null,chunk);}});
    await pipeline(Readable.fromWeb(request.body as never),limiter,parser);
    if(writer)await writer;
    if(parseError)throw parseError;
    if(fileCount!==1)throw new RequestError('Vui lòng chọn một tệp.',400);
    if(truncated)throw new RequestError('Video tối đa 100 MB.',413);
    const detected=await fileTypeFromFile(temporary).catch(()=>undefined);
    const images=['image/jpeg','image/png','image/webp','image/avif'];
    const videos=['video/mp4','video/webm'];
    if(!detected||(!images.includes(detected.mime)&&!videos.includes(detected.mime)))throw new RequestError('Chỉ nhận JPG, PNG, WebP, AVIF, MP4 hoặc WebM.',415);
    const size=(await stat(temporary)).size;
    if(images.includes(detected.mime)){
      if(size>10*1024*1024)throw new RequestError('Ảnh tối đa 10 MB.',413);
      const key=`${id}.webp`;finalPath=path.join(root,key);
      try{await sharp(temporary,{limitInputPixels:40000000}).rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toFile(finalPath);}catch{throw new RequestError('Không đọc được ảnh hoặc kích thước ảnh quá lớn.',400);}
      await unlink(temporary);
      return {id,storage_key:key,original_name:filename,mime_type:'image/webp',size_bytes:(await stat(/* turbopackIgnore: true */ finalPath)).size};
    }
    const key=`${id}.${detected.ext}`;finalPath=path.join(/* turbopackIgnore: true */ root,key);await rename(temporary,finalPath);
    return {id,storage_key:key,original_name:filename,mime_type:detected.mime,size_bytes:size};
  }catch(error){
    if(writer)await writer.catch(()=>{});
    await unlink(temporary).catch(()=>{});
    if(finalPath)await unlink(finalPath).catch(()=>{});
    throw error;
  }
}
