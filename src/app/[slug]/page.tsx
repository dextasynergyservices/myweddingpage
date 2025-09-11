import { notFound } from "next/navigation";
import { DynamicTemplateRenderer } from "@/components/DynamicTemplateRenderer";
import WeddingViewIncrementer from "@/components/WeddingViewIncrementer";
import WeddingPageHeader from "@/components/WeddingPageHeader";
import WeddingPageFooter from "@/components/WeddingPageFooter";
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
    // because server-side fetches would double-count. The client will call the
    // increment endpoint once on mount.
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
        {/* Wedding Page Header */}
        <WeddingPageHeader
          brideName={userData.brideName}
          groomName={userData.groomName}
          logoUrl={userData.logoUrl}
          logoAlt={userData.logoAlt}
          sections={
            template.sections?.map((section: { id: string; type: string }) => ({
              id: section.id,
              type: section.type,
              title: section.type,
            })) || []
          }
        />
        {/* Client-side view increment: runs once per browser (sets cookie on server) */}
        <WeddingViewIncrementer slug={slug} />

        {/* Main Content with top padding to account for fixed header */}
        <div className="pt-16 md:pt-20">
          {/* Render the wedding page using DynamicTemplateRenderer */}
          <DynamicTemplateRenderer
            template={template}
            userPlan={plan || { id: "public", name: "Public", maxComponents: 10 }}
            userData={userData}
            colorScheme={userTemplate?.colorScheme}
            editable={false} // Public pages are not editable
            isPreview={false} // This is the live page
          />
        </div>

        {/* Wedding Page Footer */}
        <WeddingPageFooter
          brideName={userData.brideName}
          groomName={userData.groomName}
          weddingDate={userData.weddingDate}
          venue={userData.venue}
          logoUrl={userData.logoUrl}
          logoAlt={userData.logoAlt}
          guestMessageCount={comments?.length || 0}
        />
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
