/**
 * Cloudflare Worker: GitHub OAuth proxy for Decap CMS.
 *
 * Based on sveltia-cms-auth pattern. Handles the OAuth dance so Decap CMS
 * can authenticate with GitHub without exposing client secrets in the browser.
 *
 * Required secrets (set via `wrangler secret put`):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 */

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ALLOWED_DOMAINS: string;
}

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      return handleAuth(url, env);
    }

    if (url.pathname === "/callback") {
      return handleCallback(url, env);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

function handleAuth(url: URL, env: Env): Response {
  const scope = url.searchParams.get("scope") || "repo,user";
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope,
    redirect_uri: `${url.origin}/callback`,
  });

  return Response.redirect(`${GITHUB_AUTH_URL}?${params}`, 302);
}

async function handleCallback(url: URL, env: Env): Promise<Response> {
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = (await response.json()) as
    | { access_token: string; error?: undefined }
    | { error: string; access_token?: undefined };

  const content =
    data.error !== undefined
      ? `authorization:github:error:${JSON.stringify(data)}`
      : `authorization:github:success:${JSON.stringify({ token: data.access_token, provider: "github" })}`;

  return new Response(
    `<!doctype html>
<html><body><script>
(function() {
  window.opener.postMessage(${JSON.stringify(content)}, "*");
  window.close();
})();
</script></body></html>`,
    {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    },
  );
}
