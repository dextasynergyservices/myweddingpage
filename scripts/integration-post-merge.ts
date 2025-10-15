import { handle } from "@/app/api/admin/templates/post-merge/route";
import { Readable } from "stream";

function buildRequest(body: unknown): Request {
  const json = JSON.stringify(body);
  const stream = new Readable();
  stream.push(json);
  stream.push(null);
  const headers: Record<string, string> = { "content-type": "application/json" };
  // If a webhook secret is configured in the environment, send it so the
  // in-process handler's secret check passes.
  const secret = process.env.TEMPLATE_WEBHOOK_SECRET;
  if (secret) headers["x-template-webhook-secret"] = secret;

  const req = new Request("http://localhost/api/admin/templates/post-merge", {
    method: "POST",
    headers,
    body: json,
  });
  return req;
}

async function main() {
  const payload = {
    name: "Integration Test Template",
    slug: "integration-test-template",
    description: "from integration test",
    sections: [{ type: "HERO", layout: "hero_default", order: 0 }],
  };

  console.log("Invoking handle first time...");
  const res1 = await handle(buildRequest(payload) as Request);
  console.log("First response status:", res1.status);
  console.log("First response body:", await res1.json());

  console.log("Invoking handle second time (idempotency)...");
  const res2 = await handle(buildRequest(payload) as Request);
  console.log("Second response status:", res2.status);
  console.log("Second response body:", await res2.json());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
