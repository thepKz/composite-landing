export class RequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function readJson(request: Request, maximumBytes = 12000): Promise<unknown> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new RequestError('Dữ liệu gửi lên không đúng định dạng.', 415);
  if (!request.body) throw new RequestError('Yêu cầu không có nội dung.', 400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel();
        throw new RequestError('Nội dung gửi lên quá lớn.', 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new RequestError('Dữ liệu gửi lên chưa hợp lệ.', 400); }
}
