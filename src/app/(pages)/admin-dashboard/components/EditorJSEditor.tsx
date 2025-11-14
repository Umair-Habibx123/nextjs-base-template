"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";

// Lazy-load all EditorJS tools in the browser only
export default function EditorJSEditor({ initialData, onChange }: any) {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    let editorInstance: any = null;

    // Load EditorJS dynamically — prevents SSR issues
    const init = async () => {
      if (typeof window === "undefined") return;

      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const List = (await import("@editorjs/list")).default;
      const Table = (await import("@editorjs/table")).default;
      const Quote = (await import("@editorjs/quote")).default;
      const Embed = (await import("@editorjs/embed")).default;
      const ImageTool = (await import("@editorjs/image")).default;
      const LinkTool = (await import("@editorjs/link")).default;
      const CodeTool = (await import("@editorjs/code")).default;
      const Paragraph = (await import("@editorjs/paragraph")).default;

      editorInstance = new EditorJS({
        holder: "editorjs",
        tools: {
          header: Header,
          list: { class: List, inlineToolbar: true },
          table: Table,
          quote: Quote,
          embed: {
            class: Embed,
            config: { services: { youtube: true, vimeo: true, twitter: true } },
          },
          linkTool: {
            class: LinkTool,
            config: { endpoint: "/api/admin/fetch-url" },
          },
          code: CodeTool,
          paragraph: { class: Paragraph, inlineToolbar: true },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const formData = new FormData();
                  formData.append("file", file);
                  try {
                    const res = await fetch("/api/admin/upload", {
                      method: "POST",
                      body: formData,
                    });
                    const data = await res.json();
                    if (res.ok && data.url) {
                      toast.success("Image uploaded!");
                      return { success: 1, file: { url: data.url } };
                    }
                    toast.error("Image upload failed");
                    return { success: 0 };
                  } catch {
                    toast.error("Image upload failed");
                    return { success: 0 };
                  }
                },
              },
            },
          },
        },
        data: (() => {
          if (!initialData) return undefined;
          try {
            return typeof initialData === "string"
              ? JSON.parse(initialData)
              : initialData;
          } catch {
            console.warn("Invalid EditorJS data");
            return undefined;
          }
        })(),

        placeholder: "Start writing your blog...",
        async onChange(api) {
          const data = await api.saver.save();
          onChange?.(data);
        },
      });

      editorRef.current = editorInstance;
    };

    init();

    return () => {
      if (editorInstance && typeof editorInstance.destroy === "function") {
        editorInstance.destroy();
      }
      editorRef.current = null;
    };
  }, []);

  return (
    <div
      id="editorjs"
      className="min-h-[400px] bg-base-100 p-4 rounded-lg border border-base-300"
    />
  );
}
