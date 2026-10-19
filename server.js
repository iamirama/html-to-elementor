"use strict";

const path = require("path");
const express = require("express");
const { convertUrlToElementorJson } = require("./lib/elementorConverter");
const { validateTemplate } = require("./lib/validateTemplate");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

app.post("/api/convert", async (req, res) => {
  const { url } = req.body || {};

  if (!url || typeof url !== "string" || !isHttpUrl(url)) {
    return res.status(400).json({ error: "یک URL معتبر (http/https) وارد کنید." });
  }

  try {
    const { template, warnings, sourceUrl } = await convertUrlToElementorJson(url);
    const { valid, errors } = validateTemplate(template);

    if (!valid) {
      return res.status(500).json({
        error: "JSON تولید شده معتبر نیست.",
        details: errors,
      });
    }

    const fileNameSafe =
      (template.title || "elementor-template")
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "elementor-template";

    res.json({
      fileName: `${fileNameSafe}.json`,
      sourceUrl,
      warnings,
      template,
    });
  } catch (err) {
    const status = err.response ? 502 : 500;
    const message = err.response
      ? `دریافت صفحه ناموفق بود (کد ${err.response.status}).`
      : err.code === "ECONNABORTED"
      ? "زمان درخواست به پایان رسید (timeout)."
      : `خطا در پردازش: ${err.message}`;
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Elementor URL Converter running on http://localhost:${PORT}`);
});
