import PostDetail, { postMetadata } from '@/components/post-detail';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) { return postMetadata({ slug: (await params).slug }); }
export default async function Article({ params }: Props) { return <PostDetail slug={(await params).slug}/>; }
