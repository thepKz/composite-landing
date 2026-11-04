import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const font=localFont({src:[{path:'../../public/fonts/BeVietnamPro-Regular.ttf',weight:'400'},{path:'../../public/fonts/BeVietnamPro-Medium.ttf',weight:'500'},{path:'../../public/fonts/BeVietnamPro-Bold.ttf',weight:'700'}],variable:'--font-brand',display:'swap'});
export const metadata:Metadata={metadataBase:new URL(process.env.SITE_URL || 'http://localhost:3000'),title:{default:'Thành Lợi Composite | Bồn bể theo nhu cầu',template:'%s | Thành Lợi Composite'},description:'Bể biogas, bể phốt, bể xử lý nước thải và bồn bể composite theo nhu cầu. Khám phá sản phẩm và gửi yêu cầu tư vấn.',openGraph:{locale:'vi_VN',type:'website',siteName:'Thành Lợi Composite'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="vi" className={font.variable} data-scroll-behavior="smooth"><body>{children}</body></html>;}
