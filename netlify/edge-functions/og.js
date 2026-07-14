// Rewrites the Open Graph tags per request so chat link previews show the
// sender's name (crawlers don't run JavaScript, so this must happen server-side).
export default async (request, context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const url = new URL(request.url);
  let sender = (url.searchParams.get("from") || "").trim();
  let name = (
    url.searchParams.get("HappyBirthdaySurprise") ||
    url.searchParams.get("name") ||
    ""
  ).trim();

  // legacy ?w= token links
  const token = url.searchParams.get("w");
  if (token && !sender && !name) {
    try {
      const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const wish = JSON.parse(new TextDecoder().decode(bytes));
      sender = String(wish.f || "").trim();
      name = String(wish.n || "").trim();
    } catch {
      // malformed token: fall through to the default tags
    }
  }

  if (!sender && !name) return response;

  const esc = (s) =>
    s
      .slice(0, 30)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const who = sender ? esc(sender) : "Someone";
  const forWhom = name ? esc(name) : "you";
  const title = sender
    ? `🎂 A birthday surprise from ${who}`
    : "A Birthday Surprise 🎂";
  const description =
    `${who} made an interactive birthday surprise just for ${forWhom}. ` +
    `Open the gift, blow out the candles, cut the cake.`;

  let html = await response.text();
  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${title}"`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${description}"`
    )
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${description}"`
    );

  return new Response(html, {
    status: response.status,
    headers: response.headers,
  });
};

export const config = { path: ["/", "/index.html"] };
