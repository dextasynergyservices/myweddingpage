import ComingSoon from "@/components/ComingSoon";
import { PageParams } from "@/types/page";

export default async function WeddingPage({ params }: PageParams<"slug">) {
  return <ComingSoon title={`Wedding Page: ${params.slug}`} />;
}
