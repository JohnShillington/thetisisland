/**
 * Cloudflare Worker: GitHub OAuth proxy for Decap CMS.
 *
 * Implements the Decap CMS v3 two-step handshake protocol:
 *   1. Callback sends "authorizing:github" to opener
 *   2. Opener (Decap) echoes it back, confirming it's ready
 *   3. Callback sends "authorization:github:success:{token}" to opener
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

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (url.pathname === "/auth") {
      return handleAuth(url, env);
    }

    if (url.pathname === "/callback") {
      return handleCallback(url, env);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function handleAuth(url: URL, env: Env): Response {
  const scope = url.searchParams.get("scope") || "repo,user";
  const siteId = url.searchParams.get("site_id") || "";

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope,
    redirect_uri: `${url.origin}/callback`,
    state: siteId,
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

  const isError = data.error !== undefined;
  const authContent = isError
    ? `authorization:github:error:${JSON.stringify(data)}`
    : `authorization:github:success:${JSON.stringify({ token: data.access_token, provider: "github" })}`;

  // Decap CMS v3 requires a two-step handshake:
  // 1. Send "authorizing:github" and wait for the echo
  // 2. Then send the actual auth result
  return new Response(
    `<!doctype html>
<html>
<head><title>Authorizing…</title></head>
<body>
<p id="status">Completing authentication…</p>
<script>
(function() {
  var authContent = ${JSON.stringify(authContent)};
  var provider = "github";
  var status = document.getElementById("status");

  if (!window.opener) {
    status.textContent = "Error: no window.opener. Please close this window and try again.";
    return;
  }

  // Step 1: Send the handshake message and wait for Decap to echo it back
  window.addEventListener("message", function onMessage(e) {
    if (e.data === "authorizing:" + provider) {
      // Step 2: Decap echoed the handshake — now send the auth result
      window.removeEventListener("message", onMessage);
      window.opener.postMessage(authContent, e.origin);
      setTimeout(function() { window.close(); }, 250);
    }
  });

  // Initiate the handshake
  window.opener.postMessage("authorizing:" + provider, "*");
})();
</script>
</body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        ...corsHeaders(),
      },
    },
  );
}
