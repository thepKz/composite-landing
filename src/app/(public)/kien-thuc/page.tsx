import { notFound } from 'next/navigation';

// The proxy redirects this legacy index with HTTP 301 before rendering.
export default function LegacyNews() { notFound(); }
