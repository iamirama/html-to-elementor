"use strict";

const Ajv = require("ajv");

const ALLOWED_WIDGET_TYPES = new Set([
  "heading",
  "text-editor",
  "image",
  "button",
  "video",
  "divider",
  "icon-list",
  "form",
  "image-box",
  "icon-box",
  "testimonial",
  "tabs",
  "accordion",
  "counter",
  "progress",
]);

// Recursive schema describing a minimal, valid Elementor "page" template.
const elementSchema = {
  $id: "elementorElement",
  type: "object",
  required: ["id", "elType", "isInner", "settings", "elements"],
  properties: {
    id: { type: "string", pattern: "^[a-f0-9]{8}$" },
    elType: { type: "string", enum: ["container", "section", "column", "widget"] },
    isInner: { type: "boolean" },
    widgetType: { type: "string" },
    settings: { type: "object" },
    elements: { type: "array", items: { $ref: "elementorElement" } },
  },
  allOf: [
    {
      if: { properties: { elType: { const: "widget" } } },
      then: { required: ["widgetType"] },
    },
  ],
};

const templateSchema = {
  $id: "elementorTemplate",
  type: "object",
  required: ["title", "type", "version", "page_settings", "content"],
  properties: {
    title: { type: "string" },
    type: { type: "string", enum: ["page", "section", "container"] },
    version: { type: "string" },
    page_settings: {}, // {} in modern exports, [] in some older ones — either is fine
    content: { type: "array", items: { $ref: "elementorElement" } },
  },
};

/* ------------------------------------------------------------------ */
/* Cross-cutting checks ajv's per-node schema can't express on its own */
/* ------------------------------------------------------------------ */

const REPEATER_KEYS = ["icon_list", "form_fields", "slides", "tabs", "accordion"];

function collectNodeIds(node, seen, duplicates) {
  if (seen.has(node.id)) duplicates.add(node.id);
  seen.add(node.id);
  for (const child of node.elements || []) collectNodeIds(child, seen, duplicates);
}

/** Walks every widget's settings looking for repeater arrays (icon_list,
 *  form_fields, slides, tabs, accordion) and checks each item has a unique,
 *  present `_id`. */
function checkRepeaters(node, errors, seenRepeaterIds, path) {
  if (node.elType === "widget" && node.settings) {
    for (const key of REPEATER_KEYS) {
      const value = node.settings[key];
      if (!Array.isArray(value)) continue;
      value.forEach((item, i) => {
        const itemPath = `${path}.settings.${key}[${i}]`;
        if (!item || typeof item._id !== "string" || item._id.length === 0) {
          errors.push(`${itemPath} فاقد _id است`);
          return;
        }
        if (seenRepeaterIds.has(item._id)) {
          errors.push(`${itemPath} دارای _id تکراری است: ${item._id}`);
        }
        seenRepeaterIds.add(item._id);
      });
    }

    const link = node.settings.link;
    if (link !== undefined) {
      const hasShape =
        link &&
        typeof link === "object" &&
        "url" in link &&
        "is_external" in link &&
        "nofollow" in link;
      if (!hasShape) {
        errors.push(`${path}.settings.link باید ساختار {url, is_external, nofollow} داشته باشد`);
      }
    }

    if (node.widgetType && !ALLOWED_WIDGET_TYPES.has(node.widgetType)) {
      errors.push(`${path}.widgetType مقدار نامعتبر دارد: "${node.widgetType}"`);
    }
  }

  (node.elements || []).forEach((child, i) =>
    checkRepeaters(child, errors, seenRepeaterIds, `${path}.elements[${i}]`)
  );
}

function validateTemplate(template) {
  const ajv = new Ajv({ allErrors: true, schemas: [elementSchema] });
  const validate = ajv.compile(templateSchema);
  const schemaValid = validate(template);

  const errors = (validate.errors || []).map((e) => `${e.instancePath || "/"} ${e.message}`);

  // Uniqueness of top-level element ids.
  const seenIds = new Set();
  const duplicateIds = new Set();
  for (const node of template.content || []) collectNodeIds(node, seenIds, duplicateIds);
  if (duplicateIds.size > 0) {
    errors.push(`شناسه‌های تکراری پیدا شد: ${[...duplicateIds].join(", ")}`);
  }

  // Repeater-level checks: _id presence/uniqueness, widgetType allow-list, link shape.
  const seenRepeaterIds = new Set();
  (template.content || []).forEach((node, i) =>
    checkRepeaters(node, errors, seenRepeaterIds, `content[${i}]`)
  );

  return { valid: schemaValid && errors.length === 0, errors };
}

module.exports = { validateTemplate, ALLOWED_WIDGET_TYPES };
