import ComingSoon from "@/components/ComingSoon";
import type { PageParams } from "@/types/next-auth";

export default function WeddingPage({ params }: PageParams<"slug">) {
  return <ComingSoon title={`Wedding Page: ${params.slug}`} />;
}
