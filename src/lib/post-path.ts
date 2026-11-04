export function postPath(post: { slug: string; kind: string }): string {
  return `/${post.kind === 'project' ? 'du-an' : 'tin-tuc'}/${post.slug}`;
}
