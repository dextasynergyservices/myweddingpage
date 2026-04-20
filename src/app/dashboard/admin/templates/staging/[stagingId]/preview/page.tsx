import React from "react";
import StagingPreviewClient from "@/app/dashboard/admin/templates/staging/[stagingId]/preview/StagingPreviewClient";

export default function StagingPreviewPage({ params }: { params: { stagingId: string } }) {
  const { stagingId } = params;
  return <StagingPreviewClient stagingId={stagingId} />;
}
