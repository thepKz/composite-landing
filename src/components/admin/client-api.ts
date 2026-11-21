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

/** Kiểm tệp ở máy trước khi gửi. Trả về câu báo lỗi tiếng Việt hoặc chuỗi rỗng. */
export function checkUpload(file: File, imagesOnly = false): string {
  const isImage = imageTypes.includes(file.type);
  const isVideo = videoTypes.includes(file.type);
  if (!isImage && !(isVideo && !imagesOnly)) return imagesOnly ? 'Chỉ nhận ảnh JPG, PNG, WebP hoặc AVIF.' : 'Chỉ nhận ảnh JPG, PNG, WebP, AVIF hoặc video MP4, WebM.';
  if (isImage && file.size > 10 * 1024 * 1024) return `Ảnh "${file.name}" nặng ${(file.size / 1048576).toFixed(1)} MB, tối đa 10 MB. Hãy giảm dung lượng rồi tải lại.`;
  if (isVideo && file.size > 100 * 1024 * 1024) return `Video "${file.name}" nặng ${(file.size / 1048576).toFixed(0)} MB, tối đa 100 MB.`;
  return '';
}

/** Tải một tệp lên thư viện, báo tiến trình theo phần trăm. */
export function uploadFile<T = { id: string }>(file: File, onProgress?: (percent: number) => void): Promise<T> {
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
