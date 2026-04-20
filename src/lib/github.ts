const GITHUB_API = "https://api.github.com";

export interface GitHubOptions {
  owner: string;
  repo: string;
  token: string; // personal/service token with repo scopes
}

async function ghRequest(
  opts: GitHubOptions,
  path: string,
  method = "GET",
  body?: unknown
) {
  const url = `${GITHUB_API}${path}`;
  const headers: Record<string, string> = {
    Authorization: `token ${opts.token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "myweddingpage-template-importer",
  };

  const globalWithFetch = globalThis as unknown as { fetch?: typeof fetch };
  const fetchFn = globalWithFetch.fetch;
  if (!fetchFn) throw new Error("fetch is not available in this runtime");

  const res = body
    ? await fetchFn(url, { method, headers, body: JSON.stringify(body) })
    : await fetchFn(url, { method, headers });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    const err = new Error(
      `GitHub API error ${res.status} ${res.statusText}`
    ) as Error & {
      status?: number;
      body?: unknown;
    };
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

export async function getRef(opts: GitHubOptions, ref: string) {
  return ghRequest(
    opts,
    `/repos/${opts.owner}/${opts.repo}/git/ref/${encodeURIComponent(ref)}`
  );
}

export async function createRef(opts: GitHubOptions, ref: string, sha: string) {
  return ghRequest(opts, `/repos/${opts.owner}/${opts.repo}/git/refs`, "POST", {
    ref,
    sha,
  });
}

export async function createBlob(opts: GitHubOptions, content: string) {
  return ghRequest(
    opts,
    `/repos/${opts.owner}/${opts.repo}/git/blobs`,
    "POST",
    {
      content,
      encoding: "utf-8",
    }
  );
}

export async function createBlobWithEncoding(
  opts: GitHubOptions,
  content: string,
  encoding: "utf-8" | "base64" = "utf-8"
) {
  return ghRequest(
    opts,
    `/repos/${opts.owner}/${opts.repo}/git/blobs`,
    "POST",
    {
      content,
      encoding,
    }
  );
}

export interface GitTreeEntry {
  path: string;
  mode: string;
  type: "blob" | "tree" | "commit";
  sha?: string;
  content?: string;
}

export async function createTree(
  opts: GitHubOptions,
  tree: GitTreeEntry[],
  base_tree?: string
) {
  return ghRequest(
    opts,
    `/repos/${opts.owner}/${opts.repo}/git/trees`,
    "POST",
    {
      tree,
      base_tree,
    }
  );
}

export async function getCommit(opts: GitHubOptions, sha: string) {
  return ghRequest(
    opts,
    `/repos/${opts.owner}/${opts.repo}/git/commits/${encodeURIComponent(sha)}`
  );
}

export async function getContent(
  opts: GitHubOptions,
  filePath: string,
  ref?: string
) {
  const q = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const res = (await ghRequest(
    opts,
    `/repos/${opts.owner}/${opts.repo}/contents/${encodeURIComponent(filePath)}${q}`
  )) as { content?: string; encoding?: string; sha?: string } | null;
  // res.content is base64-encoded when file exists
  if (res && typeof res.content === "string" && res.encoding === "base64") {
    const buff = Buffer.from(res.content, "base64");
    return { content: buff.toString("utf-8"), sha: res.sha };
  }
  return { content: null, sha: res?.sha };
}

export async function createCommit(
  opts: GitHubOptions,
  message: string,
  tree: string,
  parents: string[]
) {
  return ghRequest(
    opts,
    `/repos/${opts.owner}/${opts.repo}/git/commits`,
    "POST",
    {
      message,
      tree,
      parents,
    }
  );
}

export async function updateRef(
  opts: GitHubOptions,
  ref: string,
  sha: string,
  force = false
) {
  return ghRequest(
    opts,
    `/repos/${opts.owner}/${opts.repo}/git/refs/${encodeURIComponent(ref)}`,
    "PATCH",
    { sha, force }
  );
}

export async function createPR(
  opts: GitHubOptions,
  head: string,
  base: string,
  title: string,
  body?: string
) {
  return ghRequest(opts, `/repos/${opts.owner}/${opts.repo}/pulls`, "POST", {
    head,
    base,
    title,
    body,
  });
}

const github = {
  ghRequest,
  getRef,
  createRef,
  createBlob,
  createTree,
  createCommit,
  getCommit,
  getContent,
  updateRef,
  createPR,
};

export default github;
