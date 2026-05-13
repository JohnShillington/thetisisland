/**
 * Cloudflare Worker: GitHub OAuth proxy for Decap CMS.
 *
 * Handles the OAuth dance so Decap CMS can authenticate with GitHub
 * without exposing client secrets in the browser.
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

    // CORS preflight for the /callback endpoint
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
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
  // Preserve site_id so we can pass it through the OAuth flow
  const siteId = url.searchParams.get("site_id") || "";
  const state = siteId; // Pass site_id as OAuth state so we get it back in the callback

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope,
    redirect_uri: `${url.origin}/callback`,
    state,
  });

  return Response.redirect(`${GITHUB_AUTH_URL}?${params}`, 302);
}

async function handleCallback(url: URL, env: Env): Promise<Response> {
  const code = url.searchParams.get("code");
  const siteId = url.searchParams.get("state") || "";

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
  const content = isError
    ? `authorization:github:error:${JSON.stringify(data)}`
    : `authorization:github:success:${JSON.stringify({ token: data.access_token, provider: "github" })}`;

  // Build the script that delivers the token to Decap CMS.
  // Strategy 1: postMessage to opener (standard popup flow)
  // Strategy 2: If opener is null (Safari strips it for cross-origin),
  //             redirect back to the CMS with the message in a hash fragment
  //             so Decap can read it on page load.
  const siteOrigin = siteId ? `https://${siteId}` : "";
  const cmsUrl = siteOrigin ? `${siteOrigin}/admin/` : "";

  return new Response(
    `<!doctype html>
<html>
<head><title>Authorizing…</title></head>
<body>
<p id="status">Completing authentication…</p>
<script>
(function() {
  var msg = ${JSON.stringify(content)};
  var status = document.getElementById("status");

  // Strategy 1: popup with window.opener
  if (window.opener) {
    window.opener.postMessage(msg, "*");
    status.textContent = "Done — closing window.";
    window.close();
    return;
  }

  // Strategy 2: not a popup (Safari may navigate the main window).
  // Store the auth result and redirect back to the CMS.
  try {
    sessionStorage.setItem("decap-cms-auth", msg);
  } catch(e) {}

  ${cmsUrl ? `status.textContent = "Redirecting to CMS…"; window.location.replace(${JSON.stringify(cmsUrl)});` : `status.textContent = "Authentication complete but unable to return to CMS. Please close this tab and refresh the admin page.";`}
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
