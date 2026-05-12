export const config = {
  runtime: "edge"
};

const ROUTES = {
  infinitecampus: "https://infinitecampus.xyz",
  orbit: "https://orbit.foo.ng"
};

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length === 0) {
      return html(pageHome());
    }

    const app = parts[0];
    const targetBase = ROUTES[app];

    if (!targetBase) {
      return new Response("Not found", { status: 404 });
    }

    const subPath = "/" + parts.slice(1).join("/");
    const targetUrl = new URL(subPath + url.search, targetBase).toString();

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      redirect: "follow"
    });

    const newHeaders = new Headers(response.headers);
    newHeaders.delete("content-security-policy");
    newHeaders.delete("x-frame-options");

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    });

  } catch (err) {
    return new Response("Proxy Error:\n" + err.toString(), { status: 500 });
  }
}

function pageHome() {
  return `
  <html>
  <head>
    <title>LSYN</title>
    <style>
      body {
        background:#0f0f0f;
        color:white;
        font-family:sans-serif;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        height:100vh;
        gap:20px;
        margin:0;
      }
      h1 { color:#7c3aed; }
      .btn {
        width:220px;
        padding:15px 0;
        background:#7c3aed;
        border:none;
        border-radius:10px;
        color:white;
        font-size:18px;
        cursor:pointer;
        transition: 0.2s;
      }
      .btn:hover { background: #6d28d9; }
    </style>
  </head>
  <body>
    <h1>LSYN</h1>
    <p>We have a bunch of cool stuff</p>
    <button class="btn" onclick="go('/infinitecampus')">Infinite Campus</button>
    <button class="btn" onclick="go('/orbit')">OrbitUBG</button>
    <script>
      function go(p){ location.href = p }
    </script>
  </body>
  </html>
  `;
}

function html(content) {
  return new Response(content, {
    headers: { "content-type": "text/html" }
  });
}
