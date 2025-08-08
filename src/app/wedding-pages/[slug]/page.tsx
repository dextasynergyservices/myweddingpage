import { notFound } from "next/navigation";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { WeddingPageData } from "@/types/types";
import { JSX } from "react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function WeddingPage({ params }: PageProps): Promise<JSX.Element> {
  const slug = params.slug;

  const page = await prisma.weddingPage.findUnique({
    where: { slug },
    include: {
      template: true,
      mediaUploads: true,
      comments: {
        where: { approved: true },
      },
    },
  });

  if (!page || !page.is_live) {
    notFound();
  }

  const typedPage = page as WeddingPageData;

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">{typedPage.title}</h1>
      <p className="text-gray-600 mb-2">Template: {typedPage.template?.name ?? "No template"}</p>
      {typedPage.description && <p className="mb-4 text-gray-700">{typedPage.description}</p>}

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {typedPage.mediaUploads?.length > 0 ? (
          typedPage.mediaUploads.map((media) => (
            <div key={media.id} className="relative w-full h-48">
              <Image
                src={media.cloudinary_url}
                alt={media.type}
                fill
                className="object-cover rounded-md"
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500">No media uploaded yet.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Guest Comments</h2>
        {typedPage.comments.length === 0 && <p className="text-gray-500">No comments yet.</p>}
        <ul className="space-y-4">
          {typedPage.comments.map((comment) => (
            <li key={comment.id} className="bg-gray-100 p-4 rounded">
              <p className="font-semibold">{comment.author_name}</p>
              <p>{comment.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export async function generateStaticParams() {
  return [];
}
