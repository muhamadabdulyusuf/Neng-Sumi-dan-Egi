module.exports = (req, res) => {
  const slug = req.query.slug || "";

  function fmtName(text) {
    if (!text) return "Tamu Undangan";
    return text
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map(w =>
        w.toLowerCase() === "dan"
          ? "dan"
          : w.charAt(0).toUpperCase() + w.slice(1)
      )
      .join(" ");
  }

  const guestName = fmtName(slug);

  const desc = `Yth. ${guestName}, merupakan suatu kehormatan bagi kami jika Anda berkenan hadir. Klik untuk informasi selengkapnya.`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  res.end(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Neng Sumi & Egi | Untuk ${guestName}</title>

<meta name="description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:title" content="Neng Sumi & Egi | Untuk ${guestName}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="https://neng-sumi-dan-egi.vercel.app/themes/peppy/Thumbnail/Thumbnail.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta http-equiv="refresh" content="0;url=/${slug}">
</head>
<body></body>
</html>`);
};
