"use client";

import React from "react";
import clsx from "clsx";
import { ExternalLink } from "lucide-react";

export default function EditorRenderer({ data }: any) {
  if (!data || !data.blocks) return null;

  const renderNestedList = (items: any[], style = "unordered") => {
    const Tag = style === "ordered" ? "ol" : "ul";
    const listClass = style === "ordered" ? "list-decimal" : "list-disc";

    return (
      <Tag className={`${listClass} pl-8 my-4 space-y-3`}>
        {items.map((item: any, i: number) => (
          <li key={i} className="my-2 leading-7">
            {/* Handle both string content and object with content property */}
            {typeof item === "string" ? (
              <span dangerouslySetInnerHTML={{ __html: item }} />
            ) : item.content ? (
              <span dangerouslySetInnerHTML={{ __html: item.content }} />
            ) : (
              <span>{item.text || item}</span>
            )}

            {/* Recursively render nested items */}
            {item.items && item.items.length > 0 && (
              <div className="ml-6 mt-2">
                {renderNestedList(item.items, item.style || style)}
              </div>
            )}
          </li>
        ))}
      </Tag>
    );
  };

  return (
    <div className="prose prose-lg max-w-none text-base-content leading-relaxed space-y-8">
      {data.blocks.map((block: any) => {
        switch (block.type) {
          /* -------------------------------- PARAGRAPH -------------------------------- */
          case "paragraph":
            return (
              <p
                key={block.id}
                dangerouslySetInnerHTML={{ __html: block.data.text }}
                className="text-base leading-8 my-6 text-base-content/90"
              />
            );

          /* ---------------------------------- HEADER --------------------------------- */
          case "header": {
            const Tag =
              `h${block.data.level}` as keyof React.JSX.IntrinsicElements;
            return React.createElement(Tag, {
              key: block.id,
              className: clsx(
                "font-bold mt-12 mb-6 leading-tight text-base-content border-b border-base-300/30 pb-4",
                {
                  "text-4xl": block.data.level === 1,
                  "text-3xl": block.data.level === 2,
                  "text-2xl": block.data.level === 3,
                  "text-xl": block.data.level === 4,
                }
              ),
              dangerouslySetInnerHTML: { __html: block.data.text },
            });
          }

          /* ----------------------------------- IMAGE ---------------------------------- */
          case "image":
            return (
              <figure
                key={block.id}
                className="my-12 rounded-2xl overflow-hidden bg-base-200/50 p-4 border border-base-300/20"
              >
                <img
                  src={block.data.file?.url}
                  alt={block.data.caption || "Blog image"}
                  className="w-full h-auto rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
                />
                {block.data.caption && (
                  <figcaption className="mt-4 text-center text-sm text-base-content/70 italic">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            );

          /* ----------------------------------- QUOTE ---------------------------------- */
          case "quote":
            return (
              <blockquote
                key={block.id}
                className="border-l-4 border-primary bg-linear-to-r from-primary/5 to-transparent py-6 px-8 my-10 rounded-r-2xl italic text-lg"
              >
                <p
                  className="text-base-content/90 leading-8"
                  dangerouslySetInnerHTML={{ __html: block.data.text }}
                />
                {block.data.caption && (
                  <footer className="mt-4 text-right text-base-content/60 font-semibold not-italic">
                    — {block.data.caption}
                  </footer>
                )}
              </blockquote>
            );

          /* ---------------------------------- LINK TOOL ------------------------------ */
          case "linkTool":
            const { link, meta } = block.data || {};
            if (!link) return null;

            const title = meta?.title || link;
            const description = meta?.description || "";
            const image = meta?.image?.url || meta?.image || "";

            const finalUrl = meta?.url || link;

            if (meta?.success === 0 || !meta?.url) return null;

            return (
              <div key={block.id} className="my-8">
                <a
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border-2 border-base-300/30 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl bg-base-100 no-underline"
                >
                  {image && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-base-content mb-2 line-clamp-2">
                          {title}
                        </h3>
                        {description && (
                          <p className="text-base-content/70 text-sm leading-6 mb-3 line-clamp-2">
                            {description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-base-content/50">
                          <ExternalLink className="w-4 h-4" />
                          <span className="truncate">{finalUrl}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            );

          /* ---------------------------------- LIST ---------------------------------- */
          case "list":
            // FIRST handle checklist
            if (block.data.style === "checklist") {
              return (
                <div
                  key={block.id}
                  className="my-8 space-y-4 bg-base-200/30 rounded-2xl p-6"
                >
                  {block.data.items.map((item: any, i: number) => (
                    <label
                      key={i}
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-base-300/30 transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={item.meta?.checked}
                        className="checkbox checkbox-primary mt-1 checkbox-md"
                      />
                      <span
                        dangerouslySetInnerHTML={{ __html: item.content }}
                        className={clsx(
                          "flex-1 leading-7",
                          item.meta?.checked &&
                            "line-through text-base-content/50"
                        )}
                      />
                    </label>
                  ))}
                </div>
              );
            }

            // DEFAULT: ordered or unordered lists
            const getText = (item: any) =>
              typeof item === "string" ? item : item.content || item.text || "";

            return block.data.style === "ordered" ? (
              <ol
                key={block.id}
                className="list-decimal pl-8 space-y-3 my-8 text-base-content/90 leading-7"
              >
                {block.data.items.map((item: any, i: number) => (
                  <li
                    key={i}
                    dangerouslySetInnerHTML={{ __html: getText(item) }}
                  />
                ))}
              </ol>
            ) : (
              <ul
                key={block.id}
                className="list-disc pl-8 space-y-3 my-8 text-base-content/90 leading-7"
              >
                {block.data.items.map((item: any, i: number) => (
                  <li
                    key={i}
                    dangerouslySetInnerHTML={{ __html: getText(item) }}
                  />
                ))}
              </ul>
            );

          /* ------------------------------- NESTED LIST ------------------------------- */
          case "nestedList":
            return (
              <div
                key={block.id}
                className="my-8 bg-base-200/30 rounded-2xl p-6"
              >
                {renderNestedList(block.data.items, block.data.style)}
              </div>
            );

          /* ---------------------------------- TABLE ---------------------------------- */
          case "table":
            return (
              <div key={block.id} className="overflow-x-auto my-12">
                <table className="table table-zebra w-full border border-base-300 rounded-2xl shadow-lg">
                  <thead>
                    {block.data.withHeadings && block.data.content[0] && (
                      <tr className="bg-base-200">
                        {block.data.content[0].map(
                          (cell: string, c: number) => (
                            <th
                              key={c}
                              className="font-bold text-base-content border border-base-300 px-6 py-4 text-left"
                              dangerouslySetInnerHTML={{ __html: cell }}
                            />
                          )
                        )}
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {(block.data.withHeadings
                      ? block.data.content.slice(1)
                      : block.data.content
                    ).map((row: any[], r: number) => (
                      <tr
                        key={r}
                        className="hover:bg-base-300/30 transition-colors duration-200"
                      >
                        {row.map((cell: string, c: number) => (
                          <td
                            key={c}
                            className="border border-base-300 px-6 py-4 text-base-content/90 leading-7"
                            dangerouslySetInnerHTML={{ __html: cell }}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          /* ---------------------------------- WARNING -------------------------------- */
          case "warning":
            return (
              <div
                key={block.id}
                className="p-6 border-l-4 border-warning bg-warning/10 rounded-2xl my-10 shadow-lg"
              >
                <strong className="block mb-3 text-warning-content text-lg font-semibold">
                  {block.data.title}
                </strong>
                <p className="text-warning-content/90 leading-7">
                  {block.data.message}
                </p>
              </div>
            );

          /* ----------------------------------- RAW ----------------------------------- */
          case "raw":
            return (
              <div
                key={block.id}
                className="my-8 p-6 bg-base-200 rounded-2xl overflow-x-auto border border-base-300/30"
                dangerouslySetInnerHTML={{ __html: block.data.html }}
              />
            );

          /* ---------------------------------- DELIMITER ------------------------------ */
          case "delimiter":
            return (
              <div key={block.id} className="my-12 text-center">
                <div className="inline-flex items-center gap-4 text-base-content/30">
                  <div className="w-16 h-1 bg-base-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-base-300 rounded-full"></div>
                  <div className="w-16 h-1 bg-base-300 rounded-full"></div>
                </div>
              </div>
            );

          /* ----------------------------------- CODE ---------------------------------- */
          case "code":
            return (
              <pre
                key={block.id}
                className="bg-base-300 p-6 rounded-2xl overflow-x-auto my-10 text-sm border border-base-300/50 shadow-lg"
              >
                <code className="text-base-content font-mono">
                  {block.data.code}
                </code>
              </pre>
            );

          /* -------------------------------- INLINE CODE ------------------------------ */
          case "inlineCode":
            return (
              <code
                key={block.id}
                className="bg-base-300 px-3 py-1 rounded-lg text-sm font-mono text-base-content border border-base-300/50"
              >
                {block.data.code}
              </code>
            );

          /* -------------------------------- SIMPLE IMAGE ------------------------------ */
          case "simpleImage":
            return (
              <div key={block.id} className="my-12 text-center">
                <img
                  src={block.data.url}
                  alt=""
                  className="rounded-2xl shadow-lg mx-auto max-w-full h-auto border border-base-300/30"
                />
              </div>
            );

          /* --------------------------------- ATTACHES -------------------------------- */
          case "attaches":
            return (
              <div
                key={block.id}
                className="p-6 border-2 border-dashed border-base-300 rounded-2xl bg-base-200 my-10 hover:border-primary transition-all duration-300 shadow-lg"
              >
                <div className="flex items-center gap-6">
                  <div className="flex-1 min-w-0">
                    <a
                      href={block.data.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:text-primary-focus block truncate text-lg"
                    >
                      {block.data.file.name}
                    </a>
                    <div className="text-sm text-base-content/60 mt-2">
                      {Math.round(block.data.file.size / 1024)} KB •{" "}
                      {block.data.file.extension?.toUpperCase()}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button className="btn btn-primary btn-md rounded-xl">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            );

          /* ---------------------------------- EMBED ---------------------------------- */
          case "embed":
            return (
              <div key={block.id} className="my-12">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-base-300/30 bg-base-200">
                  <iframe
                    src={block.data.embed}
                    className="w-full aspect-video"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
                {block.data.caption && (
                  <div className="text-center text-sm text-base-content/60 mt-4 italic">
                    {block.data.caption}
                  </div>
                )}
              </div>
            );

          /* ---------------------------------- MARKER --------------------------------- */
          case "marker":
            return (
              <mark
                key={block.id}
                className="bg-yellow-200 text-base-content px-2 py-1 rounded-lg font-medium"
              >
                {block.data.text}
              </mark>
            );

          /* ---------------------------- UNSUPPORTED FALLBACK --------------------------- */
          default:
            console.log("Unsupported block:", block.type, block);
            return (
              <div
                key={block.id}
                className="opacity-50 italic my-8 p-6 bg-base-200 rounded-2xl border border-base-300/30 text-center"
              >
                <div className="text-lg font-semibold text-base-content/70 mb-2">
                  Unsupported Content
                </div>
                <div className="text-sm text-base-content/50">
                  Block type: {block.type}
                </div>
              </div>
            );
        }
      })}
    </div>
  );
}
