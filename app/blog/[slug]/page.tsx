import Image from "next/image";
import { fetchPostBySlug, getFeaturedImage } from "@/lib/wordpress";
import Link from "next/link";

export const revalidate = 60;

interface Params { slug: string }

export default async function BlogPost({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Entrada no encontrada</h1>
        <Link href="/blog" className="text-eym-accent-orange">Volver al blog</Link>
      </div>
    );
  }
  const img = getFeaturedImage(post);
  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/blog" className="text-sm text-gray-500 hover:text-eym-accent-orange">← Volver</Link>
      <h1 className="text-3xl font-bold mt-2 mb-4" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
      {img && (
        <div className="relative aspect-[16/9] mb-6 rounded-lg overflow-hidden">
          <Image src={img} alt={post.title.rendered} fill className="object-cover" />
        </div>
      )}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
    </article>
  );
}
