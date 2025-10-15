import * as gh from "../src/lib/github";

// Simple mock of fetch to simulate GitHub API response for blob creation
(globalThis as any).fetch = async (url: string, opts: any) => {
  console.log("Mock fetch called:", url);
  const body = JSON.parse(opts.body);
  // Validate encoding and content
  if (!body || !body.content || !body.encoding) {
    return {
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: "invalid request" }),
    };
  }
  return {
    ok: true,
    status: 201,
    text: async () => JSON.stringify({ sha: "deadbeefsha1234" }),
  };
};

async function run() {
  const opts = { owner: "owner", repo: "repo", token: "token" } as any;
  // text blob
  const textRes = await gh.createBlobWithEncoding(opts, "hello world", "utf-8");
  console.log("Text blob result:", textRes);

  // binary blob (base64)
  const sample = Buffer.from([0, 1, 2, 3, 4, 5]).toString("base64");
  const binRes = await gh.createBlobWithEncoding(opts, sample, "base64");
  console.log("Binary blob result:", binRes);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
