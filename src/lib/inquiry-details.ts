import { z } from 'zod';

// Các trường mới (tỉnh thành, quy mô) chỉ thêm vào: yêu cầu cũ không có chúng vẫn hợp lệ.
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s().-]{9,20}$/).refine(value => /^\d{9,15}$/.test(value.replace(/\D/g, ''))),
  email: z.string().trim().max(254).email().or(z.literal('')).default(''),
  product: z.string().max(200).default(''),
  dimensions: z.string().trim().max(160).default(''),
  location: z.string().trim().max(200).default(''),
  province: z.string().trim().max(100).default(''),
  scale: z.string().trim().max(160).default(''),
  scaleHint: z.string().trim().max(160).default(''),
  purpose: z.enum(['consultation', 'quotation', 'support']).default('consultation'),
  message: z.string().trim().max(2000).default(''),
  consent: z.literal('yes'),
  website: z.string().max(0).optional(),
});

export function inquiryMessage(input: z.infer<typeof inquirySchema>) {
  const purpose = { consultation: 'Tư vấn sản phẩm', quotation: 'Yêu cầu báo giá', support: 'Hỗ trợ kỹ thuật' };
  const scale = input.scale && (input.scaleHint ? `${input.scale} (${input.scaleHint.charAt(0).toLowerCase()}${input.scaleHint.slice(1)})` : input.scale);
  return [
    `Nội dung liên hệ: ${purpose[input.purpose]}`,
    input.email && `Email: ${input.email}`,
    input.province && `Tỉnh thành: ${input.province}`,
    scale && `Quy mô: ${scale}`,
    input.dimensions && `Kích thước / dung tích: ${input.dimensions}`,
    input.location && `Địa điểm: ${input.location}`,
    input.message,
  ].filter(Boolean).join('\n');
}
