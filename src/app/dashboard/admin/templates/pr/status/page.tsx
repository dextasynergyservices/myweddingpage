import PRStatusClient from "./PRStatusClient";

export default function PRStatusPage({
  searchParams,
}: {
  searchParams?: { prUrl?: string };
}) {
  const prUrl = (searchParams?.prUrl as string) || "";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">PR Status</h1>
      {!prUrl ? (
        <p>No PR URL provided.</p>
      ) : (
        <div>
          <p>
            PR link:{" "}
            <a
              className="text-blue-600 hover:underline"
              href={prUrl}
              target="_blank"
              rel="noreferrer"
            >
              {prUrl}
            </a>
          </p>

          <PRStatusClient prUrl={prUrl} />
        </div>
      )}
    </div>
  );
}
