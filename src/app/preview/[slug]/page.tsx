import { notFound } from "next/navigation";
import { DynamicTemplateRenderer } from "@/components/DynamicTemplateRenderer";
import WeddingPageHeader from "@/components/WeddingPageHeader";
import WeddingPageFooter from "@/components/WeddingPageFooter";
import PreviewModalFooter from "@/components/PreviewModalFooter";
import { JSX } from "react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PageProps = {
  params: {
    slug: string;
  };
  searchParams: {
    modal?: string;
  };
};

export default async function WeddingPreviewPage({
  params,
  searchParams,
}: PageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const isModal = searchParams.modal === "true";

  try {
    // Fetch wedding data for preview (include not-live pages)
    // Use relative URL for server-side fetches to avoid connection issues
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const apiUrl = `${baseUrl}/api/public/wedding-data/${slug}?preview=true&noIncrement=1`;

    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error("Failed to fetch wedding data");
    }

    const data = await response.json();
    const { template, userData, userTemplate, plan } = data;

    // For preview mode, we want to show the page regardless of live status
    // The preview is specifically for viewing not-live pages in modal/preview context

    if (!template) {
      notFound();
    }

    // Preview mode styling
    const previewBanner = !isModal && (
      <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 text-center">
        <div className="flex items-center justify-center">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium">
                🔍 You&apos;re viewing a preview of this wedding page. This page
                is no longer live.
              </p>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div
        className={`min-h-screen bg-white ${isModal ? "modal-content" : ""}`}
      >
        {/* Preview banner for non-modal view */}
        {previewBanner}

        {/* Wedding Page Header - same as live pages */}
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

        {/* Main Content with top padding to account for fixed header - same as live pages */}
        <div className="pt-16 md:pt-20">
          <DynamicTemplateRenderer
            template={template}
            userPlan={
              plan || { id: "public", name: "Public", maxComponents: 10 }
            }
            userData={userData}
            colorScheme={userTemplate?.colorScheme}
            editable={false} // Preview is never editable
            isPreview={true} // This is a preview
          />
        </div>

        {/* Wedding Page Footer - same as live pages */}
        <WeddingPageFooter
          brideName={userData.brideName}
          groomName={userData.groomName}
          weddingDate={userData.weddingDate}
          venue={userData.venue}
          logoUrl={userData.logoUrl}
          logoAlt={userData.logoAlt}
          email={userData.email}
        />

        {/* Modal-specific footer */}
        <PreviewModalFooter isModal={isModal} />
      </div>
    );
  } catch (error) {
    console.error("Error rendering wedding preview page:", error);
    notFound();
  }
}

export async function generateStaticParams() {
  return [];
}
