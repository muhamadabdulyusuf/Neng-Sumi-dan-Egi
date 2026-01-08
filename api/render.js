const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  try {
    const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
    const slug = pathname.replace(/^\/api\/render\/?/, "");

    function fmtName(text) {
      if (!text) return "Tamu Undangan";
      text = decodeURIComponent(text);
      text = text.replace(/-/g, " ");
      text = text.replace(/\s+/g, " ").trim();
      return text
        .split(" ")
        .map((w) =>
          w.toLowerCase() === "dan"
            ? "dan"
            : w.charAt(0).toUpperCase() + w.slice(1)
        )
        .join(" ");
    }
    const guestName = slug ? fmtName(slug) : "Tamu Undangan";
    const filePath = path.join(process.cwd(), "index.html");
    let html = fs.readFileSync(filePath, "utf8");
    const desc =
      "Yth. " +
      guestName +
      ", merupakan suatu kehormatan bagi kami jika Anda berkenan hadir. Klik untuk informasi selengkapnya.";
    html = html.replace(
      /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
      '<meta name="description" content="' + desc + '" />'
    );
    if (/property=["']og:description["']/.test(html)) {
      html = html.replace(
        /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
        '<meta property="og:description" content="' + desc + '" />'
      );
    } else {
      html = html.replace(
        /<\/head>/i,
        '<meta property="og:description" content="' + desc + '" />\n</head>'
      );
    }
    html = html.replace(/(data-guest-name[^>]*>)([^<]*)/gi, `$1${guestName}`);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (e) {
    res.status(500).send("Render error");
  }
};
