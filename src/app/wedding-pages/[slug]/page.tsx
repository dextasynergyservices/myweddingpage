import { notFound } from "next/navigation";
import { DynamicTemplateRenderer } from "@/components/DynamicTemplateRenderer";
import WeddingViewIncrementer from "@/components/WeddingViewIncrementer";
import { JSX } from "react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function WeddingPage({ params }: PageProps): Promise<JSX.Element> {
  const { slug } = await params;

  try {
    // Fetch complete wedding data using our new API route. We avoid incrementing here
    // because server-side fetches (ISR/SSR) would double-count. The client will
    // call the increment endpoint once on mount.
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/public/wedding-data/${slug}?noIncrement=1`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error("Failed to fetch wedding data");
    }

    const data = await response.json();
    const { template, userData, userTemplate, plan, comments } = data;

    if (!template) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-white">
        {/* Render the wedding page using DynamicTemplateRenderer */}
        <DynamicTemplateRenderer
          template={template}
          userPlan={plan || { id: "public", name: "Public", maxComponents: 10 }}
          userData={userData}
          colorScheme={userTemplate?.colorScheme}
          editable={false} // Public pages are not editable
          isPreview={false} // This is the live page
        />

        {/* Client-side view increment: runs once per browser (sets cookie on server) */}
        {/* Use a client component to reliably POST to the increment endpoint */}
        <WeddingViewIncrementer slug={slug} />

        {/* Optional: Add a footer with wedding page info */}
        <footer className="bg-gray-50 py-8 mt-16">
          <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">
            <p className="text-sm">Created with using our wedding page builder</p>
            {comments && comments.length > 0 && (
              <p className="text-xs mt-2">
                {comments.length} guest {comments.length === 1 ? "message" : "messages"}
              </p>
            )}
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    console.error("Error rendering wedding page:", error);
    notFound();
  }
}

export async function generateStaticParams() {
  return [];
}
