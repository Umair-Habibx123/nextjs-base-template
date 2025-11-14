"use client";

import React from "react";
import clsx from "clsx";

interface EditorRendererProps {
  data: any; // Editor.js JSON data
}

export default function EditorRenderer({ data }: EditorRendererProps) {
  if (!data || !data.blocks) return null;

  return (
    <div className="prose prose-lg max-w-none text-base-content/80 leading-relaxed">
      {data.blocks.map((block: any) => {
        switch (block.type) {
          /** 📝 PARAGRAPH */
          case "paragraph":
            return (
              <p
                key={block.id}
                className="my-4"
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            );

          /** 🔠 HEADER */
          case "header": {
            const Tag =
              `h${block.data.level}` as keyof React.JSX.IntrinsicElements;
            return React.createElement(Tag, {
              key: block.id,
              className: clsx(
                "font-bold text-base-content mt-8 mb-4 leading-snug",
                {
                  "text-4xl": block.data.level === 1,
                  "text-3xl": block.data.level === 2,
                  "text-2xl": block.data.level === 3,
                  "text-xl": block.data.level === 4,
                  "text-lg": block.data.level === 5,
                }
              ),
              dangerouslySetInnerHTML: { __html: block.data.text },
            });
          }

          /** 📸 IMAGE */
          case "image":
            return (
              <figure
                key={block.id}
                className="my-10 flex flex-col items-center rounded-2xl overflow-hidden shadow-md border border-base-300/40 bg-base-100"
              >
                <img
                  src={block.data.file?.url}
                  alt={block.data.caption || ""}
                  className={clsx("rounded-2xl object-cover", {
                    "w-full": block.data.stretched,
                    "max-w-4xl": !block.data.stretched,
                  })}
                />
                {block.data.caption && (
                  <figcaption className="mt-3 text-sm text-base-content/60 text-center italic">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            );

          /** 💬 QUOTE */
          case "quote":
            return (
              <blockquote
                key={block.id}
                className="my-8 border-l-4 border-primary/70 bg-primary/5 rounded-xl p-6 italic text-base-content/80"
              >
                <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                {block.data.caption && (
                  <footer className="mt-2 text-right text-sm text-base-content/60">
                    — {block.data.caption}
                  </footer>
                )}
              </blockquote>
            );

          /** 📋 LIST */
          case "list": {
            const isOrdered =
              block.data.style === "ordered" ||
              block.data?.meta?.counterType === "numeric";

            // Normalize list items (support string or object format)
            const normalizeItems = (items: any[]) =>
              items.map((item) => {
                if (typeof item === "string") return item;
                if (item && typeof item === "object") {
                  const content = item.content || "";
                  const nested = item.items?.length
                    ? normalizeItems(item.items)
                    : [];
                  return { content, items: nested };
                }
                return "";
              });

            const renderList = (items: any[], ordered = false) => {
              const ListTag = ordered ? "ol" : "ul";
              return (
                <ListTag
                  className={clsx(
                    "pl-6 my-4 space-y-2",
                    ordered
                      ? "list-decimal marker:text-primary"
                      : "list-disc marker:text-primary"
                  )}
                >
                  {items.map((item, i) => {
                    if (typeof item === "string") {
                      return (
                        <li
                          key={i}
                          dangerouslySetInnerHTML={{ __html: item }}
                        />
                      );
                    }

                    return (
                      <li key={i}>
                        <span
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                        {item.items?.length > 0 &&
                          renderList(item.items, ordered)}
                      </li>
                    );
                  })}
                </ListTag>
              );
            };

            const normalizedItems = normalizeItems(block.data.items || []);
            return (
              <div key={block.id}>{renderList(normalizedItems, isOrdered)}</div>
            );
          }

          
          default:
            return (
              <p key={block.id} className="italic text-base-content/50">
                Unsupported block type: <code>{block.type}</code>
              </p>
            );
        }
      })}
    </div>
  );
}
