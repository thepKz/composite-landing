// Ảnh trang chủ đã xử lý bằng scripts/xu-ly-anh-trang-chu.mjs (cắt đúng tỉ lệ, cân sáng, webp nhiều cỡ). Tệp gốc ở products-2026 giữ nguyên.
// lqip: bản thu nhỏ làm mờ nhúng sẵn làm nền, để ô ảnh chưa tải xong vẫn có màu và hình, không bao giờ trống.
export type Processed = { base: string; widths: readonly number[]; ratio: number; alt: string; lqip: string };

const dir = '/images/home/';
export const srcSet = (image: Processed) => image.widths.map(width => `${dir}${image.base}-${width}.webp ${width}w`).join(', ');
export const srcOf = (image: Processed, width?: number) => `${dir}${image.base}-${width ?? image.widths[image.widths.length - 1]}.webp`;
export const heightOf = (image: Processed, width: number) => Math.round(width / image.ratio);

export const photos = {
  heroInstall: { base: 'hero-lap-dat', widths: [960, 1600, 2000], ratio: 16 / 9, alt: 'Công nhân lắp ghép bể composite tròn màu xanh ngoài trời', lqip: 'data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAADwAwCdASoYAA4APu1orU6ppiSiMAgBMB2JbACdACFp3AqjmTjD22eAAP5w0iDzA9ynwCADsm8qu+Gq54v4U7OSozMN1jH6PEEzUci0HbpEU1Edzj14eYFZ+0P23XzZGy10l/D7eXAAAA==' },
  heroPickup: { base: 'hero-xe-ban-tai', widths: [960, 1600], ratio: 16 / 9, alt: 'Thùng composite xanh đặt trên xe bán tải màu cam', lqip: 'data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAABQBACdASoYAA4APu1kqU2ppaQiMAgBMB2JaACdIIjC4HCwH2M94jm1wv4AAP01S3T2xh90UOjhIxtkLK8s+GyOpooQ+QTrO3BHc2gB8x3+RABXIK3joNNNu/WwlZYbDSJ8AA==' },
  heroBiogas: { base: 'hero-be-biogas', widths: [480, 720, 1080], ratio: 3 / 4, alt: 'Bể composite dạng cầu màu trắng có chữ Thành Lợi', lqip: 'data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAABwBQCdASoYACAAPu1orVAppaQisBgIATAdiWUAwoBpXt9zPrLboueUPsMlLkqPtYe5b1gAAP766iT8ufN/GIIsSY2kEAzNSBtpfl7rDrLPD8tGsCmN/tNH3aFxbMCsJN6187hafwrS+moiA1Ex4+eJSAQAAA==' },
  workshop: { base: 'gioi-thieu-xuong', widths: [640, 960, 1276], ratio: 4 / 3, alt: 'Các chi tiết composite nhiều hình dáng trong nhà xưởng', lqip: 'data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAACQBACdASoYABIAPu1mqU2ppaQiMAgBMB2JYwC/OBIhRZVg7207/TR5HtEu74AA/qbGa4xoLR4qgEPK0Biq7E3Ch4PjJXUO5ZFbdp0KcQSIWBFGk0lEiyycTQAAAA==' },
  structure: { base: 'ket-cau-be-mat', widths: [640, 960, 1280], ratio: 16 / 10, alt: 'Thành bể composite xanh có gân gia cường và bề mặt bóng', lqip: 'data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAABQBACdASoYAA8APu1qrU8ppiQiMAgBMB2JbACdLwGUACLsufNCIAhhSjmgAOAqfu8NenOxI2o5Ukoljvwbj//AdPReZCVagrqb/5O9/OkZI/FcecHzzHN6wirjhuogR0f8KbG96QAAAA==' },
  fishTank: { base: 'be-tron-lap-dat', widths: [480, 720, 960], ratio: 4 / 3, alt: 'Công nhân lắp ghép bể composite tròn màu xanh bên hồ nước', lqip: 'data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAADwBACdASoYABIAPulep02pJSOiN/VYASAdCWYArAANtgjYsFfPu2fKnBW0LCNoigAA/nGZw9YTw5vWxGCEVM9IG4BA9EvqzK/yO/sMkoIRs/i9HAITGK1WhZ5Ft1jCIRLiK6WkW6IZvSdoxhQG6VzznFtyAAAA' },
  loading: { base: 'giao-hang-boc-xep', widths: [480, 720, 960], ratio: 4 / 3, alt: 'Bốc xếp bể composite màu xanh lên xe vận chuyển', lqip: 'data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAAAQBQCdASoYABIAPuFgqE2opaQiMAwBEBwJbAC7L9SByafnAnbahtnqfi7XkbbQtEIAAP6h49/2DWBzRp+06+8g7Kfqx4l272v0zzPr8N8b6Fd7iHVLtS7iddI4qzT+arFtKRWWnt2l9KVqyOwc4U+kRHgBEyUAAAA=' },
} as const satisfies Record<string, Processed>;

// Dải ảnh thật: không chú thích, người xem nhìn là hiểu. Mô tả chỉ nằm trong alt cho trình đọc màn hình.
export const strip = [
  { base: 'dai-xe-ban-tai', widths: [480, 720, 960], ratio: 4 / 3, alt: 'Thùng composite xanh đặt trên xe bán tải màu cam', lqip: 'data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAAAQBQCdASoYABIAPu1irVAppSQisBgIATAdiWIAnTLfAMCReCVoQBNzE57mW65pcHZQAPDVYuGbwXIrHIp/UIbihCsM/O0JofOHHd1F94zg5WsC1ZdCwOmpLcL+kH5B+xjdda5VR6MddBDrwQAAAA==' },
  { base: 'dai-be-chu-nhat', widths: [480, 720, 960], ratio: 4 / 3, alt: 'Các bể composite chữ nhật màu xanh xếp trong xưởng', lqip: 'data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAABQBQCdASoYABIAPu1qqk8ppiOiMBgIATAdiWgAnTMOgX+mkrf0LkvM/2O/JhYKeW7CdFAA/IyX/GixBsROohFel63Tf5zJq0mUMm+/SU4yQabI2eS2nigZFIzvVh09cs6XWPyQTIJkFvWjd9AAAA==' },
  { base: 'dai-bon-trang', widths: [360, 540, 720], ratio: 3 / 4, alt: 'Các bồn composite trắng đặt tại khu vực ngoài trời', lqip: 'data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAACwBACdASoYACAAPu1or1CppaQiqAqpMB2JZAC7MtDBdz2EuwfhVq4dS4CZMv8AAP3MT8NuvLKVctpA0WmE/I4m3820QD7VK/GHQXCg/btBVE3B84JFoydVcofyehq3xhC0XwlTJpu3Rj9FPL7IpuS/slVR/WDbpex/vgAA' },
  { base: 'dai-cau-kien-xanh-la', widths: [480, 720, 960], ratio: 4 / 3, alt: 'Các cấu kiện composite màu xanh lá trong nhà xưởng', lqip: 'data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAADQBQCdASoYABIAPuVepk2pJSOiN/VYASAciWQAuxf/4BhUJLOsXBEaxQzpmNDW05vsp+4mmFwAAPziIYhwfYhUkaT6TBxsb2N4Ug+nJodlG/caOUOK+7zKqkyN/Qxlvo8CaZ0jgeQoGzK8/My0Cc12ZJ7qz/I9uKjaF/bhPtL3hJFHopEAAA==' },
  { base: 'dai-thung-co-nap', widths: [480, 720, 960], ratio: 4 / 3, alt: 'Thùng composite xanh và trắng có nắp mở tại xưởng', lqip: 'data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAABQBACdASoYABIAPu1iqE2ppaOiMAgBMB2JQBdgBDpo6wkxfpMQTIuT/inwAP7kWQ4MFo5jjRIagvFnAF++4b1yw8xH2kAYaGs2MHBGy1YgsDGVeaqk13/HCCd8zZVrhoUB+YxWCL3xWm8AAAAAAA==' },
  { base: 'dai-be-ho-nhieu-kieu', widths: [480, 720, 960], ratio: 4 / 3, alt: 'Các bể composite xanh nhiều hình dạng trong sân xưởng', lqip: 'data:image/webp;base64,UklGRngAAABXRUJQVlA4IGwAAABQBACdASoYABIAPu1mrE+ppaQiMBgIATAdiUAToAHqpTGKCBkvR/9zpHgAAP7dV6fyEd+bm6pNNAvSlTMX5ob03U80ALQdPMI3Lw+NvbTByQHrN0yTJty4xKoIO993nzfqyndKI+WooQAAAAA=' },
] as const satisfies readonly Processed[];
