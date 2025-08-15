import Image from "next/image";
import Link from "next/link";
import { fetchPosts, getFeaturedImage } from "@/lib/wordpress";

export const revalidate = 60;

export default async function BlogIndex() {
  const posts = await fetchPosts(12);
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-center text-gray-600">No hay entradas aún.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => {
            const img = getFeaturedImage(p);
            return (
              <Link key={p.id} href={`/blog/${p.slug}`} className="block bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition">
                {img && (
                  <div className="relative aspect-[16/9]">
                    <Image src={img} alt={p.title.rendered} fill className="object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2" dangerouslySetInnerHTML={{ __html: p.title.rendered }} />
                  <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: p.excerpt?.rendered || '' }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
