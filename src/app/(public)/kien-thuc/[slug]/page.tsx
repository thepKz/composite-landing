import { notFound } from 'next/navigation';

// Published legacy URLs resolve in the proxy; drafts and unknown slugs stay hidden.
export default function LegacyArticle() { notFound(); }
