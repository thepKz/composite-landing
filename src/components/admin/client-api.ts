/** Lỗi từ máy chủ, giữ mã trạng thái để giao diện nói đúng tình huống (ví dụ 409 là xung đột phiên bản). */
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await fetch(url, options); }
  catch { throw new ApiError('Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.', 0); }
  let data;
  try { data = await response.json(); } catch { throw new ApiError('Không đọc được phản hồi. Vui lòng thử lại.', response.status); }
  if (!response.ok) throw new ApiError(data.error || 'Thao tác chưa thành công.', response.status);
  return data as T;
}

export function jsonOptions(method: string, value: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) };
}

export const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const videoTypes = ['video/mp4', 'video/webm'];
export const videoUploadLimit = Math.min(100 * 1048576, Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_BYTES) || 100 * 1048576);

/** Kiểm tệp ở máy trước khi gửi. Trả về câu báo lỗi tiếng Việt hoặc chuỗi rỗng. */
export function checkUpload(file: File, imagesOnly = false): string {
  const isImage = imageTypes.includes(file.type);
  const isVideo = videoTypes.includes(file.type);
  if (!isImage && !(isVideo && !imagesOnly)) return imagesOnly ? 'Chỉ nhận ảnh JPG, PNG, WebP hoặc AVIF.' : 'Chỉ nhận ảnh JPG, PNG, WebP, AVIF hoặc video MP4, WebM.';
  if (isImage && file.size > 10 * 1024 * 1024) return `Ảnh "${file.name}" nặng ${(file.size / 1048576).toFixed(1)} MB, tối đa 10 MB. Hãy giảm dung lượng rồi tải lại.`;
  if (isVideo && file.size > videoUploadLimit) return `Video "${file.name}" nặng ${(file.size / 1048576).toFixed(0)} MB, tối đa ${Math.floor(videoUploadLimit / 1048576)} MB.`;
  return '';
}

/** Tải một tệp lên thư viện, báo tiến trình theo phần trăm. */
export async function uploadFile<T = { id: string }>(file: File, onProgress?: (percent: number) => void): Promise<T> {
  const problem = checkUpload(file);
  if (problem) throw new ApiError(problem, 400);
  const target = await api<{ mode: 'local' | 'supabase'; url?: string; ticket?: string; publicKey?: string }>('/api/admin/media/upload', jsonOptions('POST', { name: file.name.slice(0,200), size: file.size, type: file.type }));
  if (target.mode === 'supabase') {
    if (!target.url || !target.ticket) throw new ApiError('Thiếu thông tin tải tệp. Vui lòng thử lại.', 503);
    await new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('PUT', target.url!);
      request.setRequestHeader('Content-Type', file.type);
      if (target.publicKey) request.setRequestHeader('apikey', target.publicKey);
      request.timeout = 300000;
      request.upload.onprogress = event => { if (event.lengthComputable) onProgress?.(Math.round(event.loaded / event.total * 90)); };
      request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new ApiError('Chưa tải được tệp lên kho lưu trữ. Vui lòng thử lại.', request.status));
      request.onerror = () => reject(new ApiError('Mất kết nối khi tải tệp. Vui lòng thử lại.', 0));
      request.ontimeout = () => reject(new ApiError('Tải tệp quá lâu. Vui lòng thử lại.', 0));
      request.send(file);
    });
    const result = await api<T>('/api/admin/media/upload', jsonOptions('PUT', { ticket: target.ticket }));
    onProgress?.(100);
    return result;
  }
  return new Promise((resolve, reject) => {
    const data = new FormData();
    data.append('file', file);
    const request = new XMLHttpRequest();
    request.open('POST', '/api/admin/media');
    request.upload.onprogress = event => { if (event.lengthComputable) onProgress?.(Math.round(event.loaded / event.total * 100)); };
    request.onload = () => {
      try {
        const result = JSON.parse(request.responseText);
        if (request.status >= 400) reject(new ApiError(result.error || 'Tải tệp chưa thành công.', request.status));
        else resolve(result as T);
      } catch { reject(new ApiError('Không đọc được phản hồi. Vui lòng thử lại.', request.status)); }
    };
    request.onerror = () => reject(new ApiError('Mất kết nối khi tải tệp. Vui lòng thử lại.', 0));
    request.send(data);
  });
}
