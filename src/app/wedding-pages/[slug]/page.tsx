import ComingSoon from "@/components/ComingSoon";

export default function WeddingPage({ params }: { params: { slug: string } }) {
  return <ComingSoon title={`Wedding Page: ${params.slug}`} />;
}
