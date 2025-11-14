// utils/convertToHTML.js
export function convertToHTML({ canvasItems = [], layoutRows = [] } = {}) {
  const safe = (s = "") => String(s || "");
  const esc = (s = "") =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const px = (v, d = 0) => `${Number.isFinite(+v) ? parseInt(v, 10) : d}px`;
  const pad4 = (item = {}) =>
    `${px(item.paddingTop || 0)} ${px(item.paddingRight || 0)} ${px(
      item.paddingBottom || 0
    )} ${px(item.paddingLeft || 0)}`;
  const tdAlign = (item = {}) => item.alignment || "left";

  const radiusMap = {
    "rounded-none": "0px",
    rounded: "4px",
    "rounded-md": "6px",
    "rounded-lg": "8px",
    "rounded-full": "9999px",
  };

  const sanitize = (html = "") => {
    let out = String(html || "");
    out = out.replace(/<\/?(head|style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
    out = out.replace(/<\/?(html|body|meta|title|doctype)\b[^>]*>/gi, "");
    out = out.replace(/\son\w+="[^"]*"/gi, "");
    out = out.replace(
      /\s(href|src)\s*=\s*["']\s*javascript:[^"']*["']/gi,
      '$1="#"'
    );
    return out.trim();
  };

  // ---- ELEMENT RENDERERS ----
  const renderText = (item) => {
    const {
      fontSize = "16px",
      color = "#000",
      backgroundColor = "transparent",
      fontFamily = "'Helvetica Neue', Arial, sans-serif",
      fontStyles = [],
    } = item;

    const style = [
      `font-size:${safe(fontSize)}`,
      `color:${safe(color)}`,
      `background-color:${safe(backgroundColor)}`,
      `text-align:${tdAlign(item)}`,
      `font-family:${safe(fontFamily)}`,
      `font-weight:${fontStyles.includes("bold") ? "bold" : "normal"}`,
      `font-style:${fontStyles.includes("italic") ? "italic" : "normal"}`,
      `text-decoration:${
        fontStyles.includes("underline") ? "underline" : "none"
      }`,
      `padding:${pad4(item)}`,
      `border-radius:4px`,
      `line-height:1.6`,
    ].join(";");

    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="${tdAlign(item)}" style="${style}">
            ${esc(item.content || "")}
          </td>
        </tr>
      </table>`;
  };

  const renderButton = (item) => {
    const bg = safe(item.buttonColor || "#8B5CF6");
    const br = radiusMap[item.buttonShape] || "8px";
    const href = safe(item.buttonUrl || "#");
    const label = esc(item.content || "Click Here");
    const p = pad4(item);

    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="${tdAlign(item)}" style="padding:${p};background:${safe(
      item.backgroundColor || "transparent"
    )};">
            <a href="${href}" target="_blank"
              style="display:inline-block;background:${bg};color:#fff;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;font-size:${safe(
      item.fontSize || "16px"
    )};padding:12px 24px;border-radius:${br};">
              ${label}
            </a>
          </td>
        </tr>
      </table>`;
  };

  const renderImage = (item) => {
    const w = parseInt(item.imageWidth || 400, 10);
    const h = parseInt(item.imageHeight || 300, 10);
    const br = parseInt(item.borderRadius || 0, 10);

    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="${tdAlign(item)}" style="padding:${pad4(
      item
    )};background:${safe(item.backgroundColor || "transparent")};">
            <img src="${safe(item.content || "")}" 
              width="${w}" height="${h}" alt=""
              style="display:block;width:100%;max-width:${w}px;height:auto;border-radius:${br}px;object-fit:${safe(
      item.objectFit || "cover"
    )};" />
          </td>
        </tr>
      </table>`;
  };

  const renderDivider = (item) => {
    let content = `<div style="width:100%;height:1px;background:#ccc;"></div>`;
    if (item.dividerStyle === "dotted")
      content = `<div style="width:100%;border-top:2px dotted #ccc;"></div>`;
    if (item.dividerStyle === "double-arrow")
      content = `<div style="text-align:center;color:#999;font-size:18px;">⇔</div>`;

    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:${pad4(item)};background:${safe(
      item.backgroundColor || "transparent"
    )};">
            ${content}
          </td>
        </tr>
      </table>`;
  };

  const renderSocial = (item) => {
    const size = parseInt(item.socialSize || 24, 10);
    const color = safe(item.socialColor || "#000");
    const href = safe(item.socialUrl || "#");
    const bg = safe(item.backgroundColor || "transparent");

    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="${tdAlign(item)}" style="padding:${pad4(
      item
    )};background:${bg};">
            <a href="${href}" target="_blank" style="text-decoration:none;display:inline-block;">
              <span style="display:inline-block;width:${size}px;height:${size}px;background:${color};border-radius:9999px;"></span>
            </a>
          </td>
        </tr>
      </table>`;
  };

  const renderHTML = (item) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="${tdAlign(item)}" style="padding:${pad4(item)};background:${safe(
    item.backgroundColor || "transparent"
  )};font-family:'Helvetica Neue',Arial,sans-serif;">
          ${sanitize(item.content || "")}
        </td>
      </tr>
    </table>`;

  const renderElement = (item) => {
    switch (item.name) {
      case "Text":
        return renderText(item);
      case "Button":
        return renderButton(item);
      case "Image":
        return renderImage(item);
      case "Divider":
        return renderDivider(item);
      case "Social Icon":
        return renderSocial(item);
      case "HTML Block":
        return renderHTML(item);
      default:
        return renderText(item);
    }
  };

  // ---- LAYOUT RENDERING ----
  const renderColumn = (els = []) =>
    `<td valign="top" style="padding:12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${els.map((e) => `<tr><td>${renderElement(e)}</td></tr>`).join("")}
      </table>
    </td>`;

  const renderRow = (row) => {
    const cols = row.elements || {};
    const keys = Object.keys(cols).sort(
      (a, b) =>
        parseInt(a.match(/col-(\d+)/)?.[1] || "0") -
        parseInt(b.match(/col-(\d+)/)?.[1] || "0")
    );
    return `<tr>${keys.map((k) => renderColumn(cols[k] || [])).join("")}</tr>`;
  };

  const renderSingles = (items = []) =>
    items
      .map(
        (it) => `<tr><td style="padding:12px;">${renderElement(it)}</td></tr>`
      )
      .join("");

  // ---- FINAL HTML ----
  const body = layoutRows.map(renderRow).join("") + renderSingles(canvasItems);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Responsive Template</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }
    table {
      border-collapse: collapse;
    }
    @media only screen and (max-width: 600px) {
      table[class="main"] {
        width: 100% !important;
        border-radius: 0 !important;
      }
      td[class="column"] {
        display: block;
        width: 100% !important;
      }
      a {
        padding: 10px 18px !important;
        font-size: 14px !important;
      }
      img {
        width: 100% !important;
        height: auto !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:24px;">
        <table class="main" role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:8px;
          box-shadow:0 2px 6px rgba(0,0,0,0.05);">
          ${body}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
