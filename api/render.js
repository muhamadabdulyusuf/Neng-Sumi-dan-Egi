const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  try {
    // =============================
    // PARSE PATH & SLUG
    // =============================
    const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
    const parts = pathname.split("/").filter(Boolean);
    const slug = parts[0] || "";

    // =============================
    // FORMAT NAMA TAMU
    // =============================
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

    // =============================
    // DATA DINAMIS
    // =============================
    const guestName = slug ? fmtName(slug) : "Tamu Undangan";

    const title = `Neng Sumi & Egi | Untuk ${guestName}`;

    const desc =
      "Yth. " +
      guestName +
      ", merupakan suatu kehormatan bagi kami jika Anda berkenan hadir. Klik untuk informasi selengkapnya.";

    // =============================
    // LOAD HTML
    // =============================
    const filePath = path.join(process.cwd(), "index.html");
    let html = fs.readFileSync(filePath, "utf8");

    // =============================
    // TITLE
    // =============================
    html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

    // =============================
    // META DESCRIPTION
    // =============================
    if (/<meta\s+name=["']description["']/.test(html)) {
      html = html.replace(
        /<meta\s+name=["']description["'][^>]*>/i,
        `<meta name="description" content="${desc}">`
      );
    } else {
      html = html.replace(
        /<\/head>/i,
        `<meta name="description" content="${desc}">\n</head>`
      );
    }

    // =============================
    // OG TAGS (SEKALI SAJA)
    // =============================
    html = html.replace(
      /<\/head>/i,
      `
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="https://neng-sumi-dan-egi.vercel.app/themes/peppy/Thumbnail/Thumbnail.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
</head>`
    );

    // =============================
    // ISI NAMA TAMU DI BODY
    // =============================
    html = html.replace(/(data-guest-name[^>]*>)([^<]*)/gi, `$1${guestName}`);

    // =============================
    // RESPONSE
    // =============================
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (e) {
    console.error(e);
    res.status(500).send("Render error");
  }
};