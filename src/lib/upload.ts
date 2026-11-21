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

// Tắt bộ nhớ đệm tệp của sharp để Windows không giữ khoá trên ảnh vừa xử lý (cần khi xoá ảnh sau khi chỉnh).
sharp.cache(false);

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

// ---------------------------------------------------------------------------
// Chỉnh sửa ảnh phía máy chủ. Luôn tạo tệp MỚI, không bao giờ ghi đè ảnh gốc.
// ---------------------------------------------------------------------------
export type ImageEdit = {
  rotate: 0 | 90 | 180 | 270;
  flip_h: boolean;
  flip_v: boolean;
  /** Vùng cắt tính theo phần trăm (0 đến 1) của ảnh SAU khi xoay và lật. */
  crop: { x: number; y: number; width: number; height: number } | null;
};

const minimumCrop = 0.02;
const tolerance = 1.0001;

/** Kiểm tham số chỉnh ảnh. Ném RequestError tiếng Việt khi không hợp lệ. */
export function parseImageEdit(input: unknown): ImageEdit {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new RequestError('Thông tin chỉnh ảnh chưa hợp lệ.', 400);
  const value = input as Record<string, unknown>;
  const rotate = value.rotate ?? 0;
  if (![0, 90, 180, 270].includes(rotate as number)) throw new RequestError('Góc xoay chỉ nhận 0, 90, 180 hoặc 270 độ.', 400);
  for (const key of ['flip_h', 'flip_v']) {
    if (value[key] !== undefined && typeof value[key] !== 'boolean') throw new RequestError('Thông tin lật ảnh chưa hợp lệ.', 400);
  }
  let crop: ImageEdit['crop'] = null;
  if (value.crop !== undefined && value.crop !== null) {
    const raw = value.crop as Record<string, unknown>;
    if (typeof raw !== 'object' || Array.isArray(raw)) throw new RequestError('Vùng cắt chưa hợp lệ.', 400);
    const numbers = [raw.x, raw.y, raw.width, raw.height];
    if (!numbers.every(number => typeof number === 'number' && Number.isFinite(number))) throw new RequestError('Vùng cắt chưa hợp lệ.', 400);
    const [x, y, width, height] = numbers as number[];
    if (x < 0 || y < 0 || width < minimumCrop || height < minimumCrop || x + width > tolerance || y + height > tolerance) {
      throw new RequestError('Vùng cắt nằm ngoài ảnh hoặc quá nhỏ.', 400);
    }
    crop = { x, y, width: Math.min(width, 1 - x), height: Math.min(height, 1 - y) };
  }
  const edit: ImageEdit = { rotate: rotate as ImageEdit['rotate'], flip_h: value.flip_h === true, flip_v: value.flip_v === true, crop };
  if (!edit.rotate && !edit.flip_h && !edit.flip_v && !edit.crop) throw new RequestError('Chưa có thay đổi nào để lưu.', 400);
  return edit;
}

/** Đổi vùng cắt theo phần trăm sang điểm ảnh nguyên, luôn nằm trong ảnh và rộng ít nhất 1 điểm. */
export function cropRectangle(width: number, height: number, crop: NonNullable<ImageEdit['crop']>) {
  const left = Math.min(width - 1, Math.max(0, Math.round(crop.x * width)));
  const top = Math.min(height - 1, Math.max(0, Math.round(crop.y * height)));
  return {
    left,
    top,
    width: Math.max(1, Math.min(width - left, Math.round(crop.width * width))),
    height: Math.max(1, Math.min(height - top, Math.round(crop.height * height))),
  };
}

/** Xoay, lật rồi cắt theo đúng thứ tự mà màn xem trước dùng. Ghi ra tệp WebP mới. */
export async function applyImageEdit(source: string, destination: string, edit: ImageEdit) {
  let stage = sharp(source, { limitInputPixels: 40000000 });
  if (edit.rotate) stage = stage.rotate(edit.rotate);
  const rotated = await stage.png({ compressionLevel: 1 }).toBuffer();
  const flipped = await sharp(rotated).flip(edit.flip_v).flop(edit.flip_h).png({ compressionLevel: 1 }).toBuffer({ resolveWithObject: true });
  let pipeline = sharp(flipped.data);
  if (edit.crop) pipeline = pipeline.extract(cropRectangle(flipped.info.width, flipped.info.height, edit.crop));
  const info = await pipeline.webp({ quality: 88 }).toFile(destination);
  return { width: info.width, height: info.height, size: (await stat(/* turbopackIgnore: true */ destination)).size };
}
