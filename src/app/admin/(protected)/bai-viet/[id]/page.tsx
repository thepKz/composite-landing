import PostEditor from '@/components/admin/post-editor';
export default async function EditPost({params}:{params:Promise<{id:string}>}){return <PostEditor id={(await params).id}/>;}
