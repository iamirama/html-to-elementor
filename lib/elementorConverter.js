"use strict";

const axios = require("axios");
const cheerio = require("cheerio");
const crypto = require("crypto");

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Elementor requires an 8-char hex id, unique across the whole document. */
function newId() {
  return crypto.randomBytes(4).toString("hex");
}

/** 7-char id required by Elementor Pro repeater items (icon_list items,
 *  form_fields, slides, tabs, accordion items, ...). */
function newRepeaterId() {
  return newId().slice(0, 7);
}

/** Strip scripts/styles/comments and collapse whitespace from inline HTML. */
function cleanInlineHtml($, el) {
  const $el = $(el).clone();
  $el.find("script, style").remove();
  return $el.html() ? $el.html().trim() : "";
}

function textOf($, el) {
  return $(el).text().replace(/\s+/g, " ").trim();
}

function absoluteUrl(base, maybeRelative) {
  if (!maybeRelative) return "";
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return maybeRelative;
  }
}

function isEmptyNode($, el) {
  const txt = textOf($, el);
  const hasMedia =
    $(el).find("img,video,svg,iframe,input,textarea,select").length > 0;
  return txt.length === 0 && !hasMedia;
}

/** Stable hash of a repeater's content, used to detect duplicate menus. */
function hashContent(value) {
  return crypto.createHash("sha1").update(JSON.stringify(value)).digest("hex");
}

/* ------------------------------------------------------------------ */
/* Widget builders                                                     */
/* ------------------------------------------------------------------ */

function widgetHeading($, el) {
  const tag = el.tagName.toLowerCase();
  return {
    id: newId(),
    elType: "widget",
    widgetType: "heading",
    isInner: false,
    settings: {
      title: textOf($, el),
      header_size: tag,
    },
    elements: [],
  };
}

function widgetTextFromHtml(html) {
  return {
    id: newId(),
    elType: "widget",
    widgetType: "text-editor",
    isInner: false,
    settings: {
      editor: `<div>${html}</div>`,
    },
    elements: [],
  };
}

function widgetText($, el) {
  return widgetTextFromHtml(cleanInlineHtml($, el));
}

function widgetBlockquote($, el) {
  return {
    id: newId(),
    elType: "widget",
    widgetType: "text-editor",
    isInner: false,
    settings: {
      editor: `<blockquote>${cleanInlineHtml($, el)}</blockquote>`,
    },
    elements: [],
  };
}

function widgetImage($, el, baseUrl) {
  const src =
    $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src") || "";
  return {
    id: newId(),
    elType: "widget",
    widgetType: "image",
    isInner: false,
    settings: {
      image: {
        url: absoluteUrl(baseUrl, src),
        id: "",
        alt: $(el).attr("alt") || "",
        source: "url",
      },
    },
    elements: [],
  };
}

function widgetButton($, el, baseUrl) {
  return {
    id: newId(),
    elType: "widget",
    widgetType: "button",
    isInner: false,
    settings: {
      text: textOf($, el) || "کلیک کنید",
      link: {
        url: absoluteUrl(baseUrl, $(el).attr("href") || "#"),
        is_external: "",
        nofollow: "",
      },
    },
    elements: [],
  };
}

function widgetVideoHosted($, el, baseUrl) {
  const src = $(el).attr("src") || $(el).find("source").attr("src") || "";
  return {
    id: newId(),
    elType: "widget",
    widgetType: "video",
    isInner: false,
    settings: {
      video_type: "hosted",
      hosted_url: { url: absoluteUrl(baseUrl, src), id: "" },
    },
    elements: [],
  };
}

function widgetVideoEmbed(provider, src) {
  const key = provider === "youtube" ? "youtube_url" : "vimeo_url";
  return {
    id: newId(),
    elType: "widget",
    widgetType: "video",
    isInner: false,
    settings: {
      video_type: provider,
      [key]: { url: src, id: "" },
    },
    elements: [],
  };
}

function widgetDivider() {
  return {
    id: newId(),
    elType: "widget",
    widgetType: "divider",
    isInner: false,
    settings: {},
    elements: [],
  };
}

function buildIconListItems($, el) {
  const items = [];
  $(el)
    .children("li")
    .each((_, li) => {
      const $li = $(li).clone();
      $li.find("ul, ol").remove();
      const t = $li.text().replace(/\s+/g, " ").trim();
      if (t) {
        items.push({
          _id: newRepeaterId(),
          text: t,
          selected_icon: { value: "fas fa-check", library: "fa-solid" },
        });
      }
    });
  return items.length ? items : null;
}

function widgetIconList(items) {
  return {
    id: newId(),
    elType: "widget",
    widgetType: "icon-list",
    isInner: false,
    settings: { icon_list: items },
    elements: [],
  };
}

function widgetForm($, el) {
  const fields = [];
  $(el)
    .find("input, textarea, select")
    .each((_, input) => {
      const type = ($(input).attr("type") || "text").toLowerCase();
      if (["submit", "button", "hidden"].includes(type)) return;
      fields.push({
        _id: newRepeaterId(),
        custom_id: $(input).attr("name") || `field_${fields.length + 1}`,
        field_type: type === "textarea" ? "textarea" : type === "email" ? "email" : "text",
        field_label: $(input).attr("placeholder") || $(input).attr("name") || "فیلد",
        placeholder: $(input).attr("placeholder") || "",
        required: $(input).attr("required") !== undefined ? "true" : "",
        width: "100",
        field_options: [],
      });
    });
  return {
    id: newId(),
    elType: "widget",
    widgetType: "form",
    isInner: false,
    settings: {
      form_name: "Imported Form",
      form_fields: fields.length
        ? fields
        : [
            {
              _id: newRepeaterId(),
              custom_id: "field_1",
              field_type: "text",
              field_label: "نام",
              placeholder: "",
              required: "",
              width: "100",
              field_options: [],
            },
          ],
    },
    elements: [],
  };
}

/* ------------------------------------------------------------------ */
/* DOM walking                                                         */
/* ------------------------------------------------------------------ */

const LEAF_MAP = {
  h1: widgetHeading,
  h2: widgetHeading,
  h3: widgetHeading,
  h4: widgetHeading,
  h5: widgetHeading,
  h6: widgetHeading,
  img: widgetImage,
  video: widgetVideoHosted,
  hr: widgetDivider,
  blockquote: widgetBlockquote,
};

const SKIP_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "svg",
  "path",
  "link",
  "meta",
]);

const MAX_DEPTH = 12;

function looksLikeButtonLink($, el) {
  const cls = ($(el).attr("class") || "").toLowerCase();
  const role = ($(el).attr("role") || "").toLowerCase();
  return /\b(btn|button|cta|elementor-button)\b/.test(cls) || role === "button";
}

function handleParagraph($, el, baseUrl) {
  const hasOnlyImage = $(el).children("img").length === 1 && textOf($, el).length === 0;
  if (hasOnlyImage) {
    return widgetImage($, $(el).children("img").get(0), baseUrl);
  }
  return widgetText($, el);
}

function handleAnchor($, el, baseUrl) {
  if (!textOf($, el)) return null;
  if (looksLikeButtonLink($, el)) return widgetButton($, el, baseUrl);
  const $a = $(el).clone();
  $a.find("script, style").remove();
  $a.attr("href", absoluteUrl(baseUrl, $a.attr("href") || ""));
  return widgetTextFromHtml($.html($a) || textOf($, el));
}

function handleList($, el, stats) {
  const items = buildIconListItems($, el);
  if (!items) return null;

  const hash = hashContent(items.map((i) => i.text));
  if (stats.seenIconListHashes.has(hash)) {
    stats.warnings.push(
      "یک icon-list با محتوای تکراری (مثل منوی موبایل/دسکتاپ) حذف شد."
    );
    return "duplicate";
  }
  stats.seenIconListHashes.add(hash);
  return widgetIconList(items);
}

function handleFigure($, el, baseUrl) {
  const out = [];
  const img = $(el).find("img").first();
  if (img.length) out.push(widgetImage($, img.get(0), baseUrl));
  const caption = $(el).find("figcaption").first();
  if (caption.length) {
    const t = textOf($, caption.get(0));
    if (t) out.push(widgetTextFromHtml(`<p>${t}</p>`));
  }
  return out;
}

function handleIframe($, el, stats) {
  const src = $(el).attr("src") || "";
  if (/youtube\.com|youtu\.be/i.test(src)) return widgetVideoEmbed("youtube", src);
  if (/vimeo\.com/i.test(src)) return widgetVideoEmbed("vimeo", src);
  stats.warnings.push(`iframe ناشناخته نادیده گرفته شد: ${src}`);
  return null;
}

function isStructuralWrapper($, el) {
  const tag = el.tagName ? el.tagName.toLowerCase() : "";
  if (tag !== "div" && tag !== "span") return false;
  const cls = ($(el).attr("class") || "").toLowerCase();
  if (/\b(elementor-(element|widget-container|column|section|container)|et_pb_|vc_row|fusion-)/.test(cls)) {
    return true;
  }
  const childCount = $(el).children().length;
  const directText = $(el).clone().children().remove().end().text().trim();
  return childCount <= 1 && directText.length === 0;
}

function buildWidgetsFromChildren($, container, baseUrl, stats, depth, budget) {
  const out = [];
  container.children().each((_, el) => {
    if (budget.remaining <= 0) {
      if (!stats.hitWidgetCap) {
        stats.hitWidgetCap = true;
        stats.warnings.push(`بخش به حداکثر تعداد ویجت (${MAX_WIDGETS_PER_SECTION}) رسید؛ بقیه نادیده گرفته شد.`);
      }
      return;
    }
    const tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (!tag || SKIP_TAGS.has(tag)) return;
    if (isEmptyNode($, el) && !["img", "hr", "video", "iframe"].includes(tag)) return;

    try {
      if (tag === "p") {
        budget.remaining--;
        out.push(handleParagraph($, el, baseUrl));
        return;
      }

      if (LEAF_MAP[tag]) {
        budget.remaining--;
        out.push(LEAF_MAP[tag]($, el, baseUrl));
        return;
      }

      if (tag === "iframe") {
        const w = handleIframe($, el, stats);
        if (w) {
          budget.remaining--;
          out.push(w);
        }
        return;
      }

      if (tag === "a") {
        const w = handleAnchor($, el, baseUrl);
        if (w) {
          budget.remaining--;
          out.push(w);
        }
        return;
      }

      if (tag === "ul" || tag === "ol") {
        const w = handleList($, el, stats);
        if (w && w !== "duplicate") {
          budget.remaining--;
          out.push(w);
        }
        return;
      }

      if (tag === "form") {
        budget.remaining--;
        out.push(widgetForm($, el));
        return;
      }

      if (tag === "figure") {
        const figWidgets = handleFigure($, el, baseUrl);
        budget.remaining -= figWidgets.length;
        out.push(...figWidgets);
        return;
      }

      if (isStructuralWrapper($, el)) {
        const nested = buildWidgetsFromChildren($, $(el), baseUrl, stats, depth, budget);
        out.push(...nested);
        return;
      }

      if (depth < MAX_DEPTH) {
        const nested = buildWidgetsFromChildren(
          $,
          $(el),
          baseUrl,
          stats,
          depth + 1,
          budget
        );
        out.push(...nested);
      } else {
        const txt = textOf($, el);
        if (txt) {
          stats.warnings.push(
            `عمق پیمایش در <${tag}> به حد مجاز رسید؛ محتوا به متن ساده تبدیل شد.`
          );
          budget.remaining--;
          out.push(widgetTextFromHtml(`<p>${txt}</p>`));
        }
      }
    } catch (err) {
      stats.warnings.push(`عنصر <${tag}> نادیده گرفته شد: ${err.message}`);
    }
  });
  return out;
}

// هدر، فوتر، منو و سایدبار حذف شدن، پس اینجا فقط دنبال بخش‌های اصلی محتوا می‌گردیم
const SEMANTIC_TAGS = new Set(["main", "section", "article"]);

function findSections($) {
  const body = $("body");
  if (!body.length) return [$.root().get(0)];

  const semantic = [];
  body.children().each((_, el) => {
    const tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (tag === "main") {
      $(el)
        .children()
        .each((__, child) => {
          const childTag = child.tagName ? child.tagName.toLowerCase() : "";
          if (SEMANTIC_TAGS.has(childTag)) semantic.push(child);
        });
    } else if (SEMANTIC_TAGS.has(tag)) {
      semantic.push(el);
    }
  });
  if (semantic.length >= 2) return semantic;

  const direct = body
    .children()
    .filter((_, el) => {
      const tag = el.tagName ? el.tagName.toLowerCase() : "";
      return tag && !SKIP_TAGS.has(tag) && tag !== "script" && tag !== "style";
    })
    .toArray();

  return direct.length ? direct : [body.get(0)];
}

/* ------------------------------------------------------------------ */
/* Section-level layout heuristics                                     */
/* ------------------------------------------------------------------ */

const ROW_CLASS_RE = /\b(col-|column|grid-item|card)\b/i;

function detectRowLayout($, $section) {
  const children = $section.children().toArray();
  if (children.length < 2) return false;

  let rowLike = 0;
  for (const el of children) {
    const cls = ($(el).attr("class") || "").toLowerCase();
    const styleWidth = ($(el).attr("style") || "").match(/width\s*:\s*([\d.]+)%/i);
    const widthPct = styleWidth ? parseFloat(styleWidth[1]) : null;
    if (ROW_CLASS_RE.test(cls) || (widthPct !== null && widthPct < 50)) {
      rowLike += 1;
    }
  }
  return rowLike > children.length / 2;
}

function classifySectionContent($, $section) {
  const hasMedia = $section.find("img, video, iframe").length > 0;
  const hasCardClass = ROW_CLASS_RE.test(($section.find("[class]").toArray() || [])
    .map((el) => $(el).attr("class"))
    .join(" "));
  return hasMedia || hasCardClass ? "media" : "text";
}

function paddingBox(top, right, bottom, left) {
  return {
    unit: "px",
    top: String(top),
    right: String(right),
    bottom: String(bottom),
    left: String(left),
    isLinked: top === right && right === bottom && bottom === left,
  };
}

function containerSettings($, $section, isFirstSection) {
  const isRow = detectRowLayout($, $section);
  const contentType = classifySectionContent($, $section);

  const padding = isFirstSection
    ? paddingBox(60, 20, 60, 20)
    : contentType === "media"
    ? paddingBox(40, 20, 40, 20)
    : paddingBox(20, 20, 20, 20);

  const settings = {
    content_width: "boxed",
    flex_direction: isRow ? "row" : "column",
    padding,
  };

  if (isRow) {
    settings.flex_wrap = "wrap";
    settings.flex_gap = { unit: "px", size: 24, column: "24", row: "24", isLinked: true };
  }

  return settings;
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

const MAX_SECTIONS = 40;
const MAX_WIDGETS_PER_SECTION = 60;

async function fetchHtml(url) {
  const res = await axios.get(url, {
    timeout: 15000,
    maxRedirects: 5,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1"
    },
    responseType: "text",
    validateStatus: (s) => s >= 200 && s < 400,
  });
  return res.data;
}

function cleanTitle(title) {
  return (title || "صفحه بدون عنوان").replace(/\s+/g, " ").trim();
}

async function convertUrlToElementorJson(url) {
  const stats = { warnings: [], seenIconListHashes: new Set(), hitWidgetCap: false };
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  // حذف کامل هدر، فوتر، منوها و سایدبارها (چون در المنتور خودمان داریم)
  $('header, footer, nav, aside, .header, .footer, .nav, .menu, .sidebar, #header, #footer, #nav, #sidebar, .site-header, .site-footer').remove();

  const title = cleanTitle($("title").first().text());
  const sections = findSections($).slice(0, MAX_SECTIONS);

  const content = [];
  sections.forEach((sectionEl, index) => {
    stats.hitWidgetCap = false;
    const $section = $(sectionEl);
    const budget = { remaining: MAX_WIDGETS_PER_SECTION };
    const widgets = buildWidgetsFromChildren(
      $,
      $section,
      url,
      stats,
      0,
      budget
    );
    if (budget.remaining <= 0) {
      stats.warnings.push(`بخش به حداکثر ${MAX_WIDGETS_PER_SECTION} ویجت رسید؛ بقیه نادیده گرفته شد.`);
    }
    if (widgets.length === 0) return;

    content.push({
      id: newId(),
      elType: "container",
      isInner: false,
      settings: containerSettings($, $section, content.length === 0 && index === 0),
      elements: widgets,
    });
  });

  if (content.length === 0) {
    stats.warnings.push(
      "هیچ محتوای قابل نگاشتی پیدا نشد؛ یک کانتینر خالی ساخته شد."
    );
    content.push({
      id: newId(),
      elType: "container",
      isInner: false,
      settings: {},
      elements: [],
    });
  }

  const template = {
    title,
    type: "page",
    version: "0.4",
    page_settings: {},
    content,
  };

  return { template, warnings: stats.warnings, sourceUrl: url };
}

module.exports = { convertUrlToElementorJson, newId };
