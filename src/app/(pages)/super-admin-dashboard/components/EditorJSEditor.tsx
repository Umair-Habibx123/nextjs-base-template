"use client";

import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";

export default function EditorJSEditor({ initialData, onChange }: any) {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    let editor: any = null;

    async function init() {
      if (typeof window === "undefined") return;

      // CORE EDITOR
      const EditorJS = (await import("@editorjs/editorjs")).default;

      // BASIC TOOLS
      const Header = (await import("@editorjs/header")).default;
      const Paragraph = (await import("@editorjs/paragraph")).default;
      const List = (await import("@editorjs/list")).default;
      const NestedList = (await import("@editorjs/nested-list")).default;
      const Table = (await import("@editorjs/table")).default;
      const Quote = (await import("@editorjs/quote")).default;
      const Checklist = (await import("@editorjs/checklist")).default;
      const Delimiter = (await import("@editorjs/delimiter")).default;
      const Raw = (await import("@editorjs/raw")).default;

      const Warning = (await import("@editorjs/warning")).default;
      const Marker = (await import("@editorjs/marker")).default;
      const InlineCode = (await import("@editorjs/inline-code")).default;
      const Code = (await import("@editorjs/code")).default;

      // MEDIA + ADVANCED
      const Embed = (await import("@editorjs/embed")).default;
      const ImageTool = (await import("@editorjs/image")).default;
      const SimpleImage = (await import("@editorjs/simple-image")).default;
      const Attaches = (await import("@editorjs/attaches")).default;

      // LINKS
      const LinkTool = (await import("@editorjs/link")).default;

      editor = new EditorJS({
        holder: "editorjs",

        /** --- ALL TOOLS ENABLED --- **/
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: { levels: [1, 2, 3, 4], defaultLevel: 2 },
          },

          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },

          list: {
            class: List,
            inlineToolbar: true,
          },

          nestedList: {
            class: NestedList as any,
            inlineToolbar: true,
          },

          table: Table,
          quote: Quote,
          // checklist: Checklist,
          delimiter: Delimiter,
          raw: Raw,

          marker: Marker,
          inlineCode: InlineCode,
          code: Code,

          warning: Warning,

          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                twitter: true,
                vimeo: true,
              },
            },
          },

          // linkTool: {
          //   class: LinkTool,
          //   config: {
          //     endpoint: "/api/super-admin/fetch-url",
          //   },
          // },

          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/super-admin/fetch-url",
              on: {
                error(error) {
                  toast.error(`Invalid URL. error : ${error} Please paste a valid link.`);
                },
              },
            },
          },

          /** IMAGE WITH FULL UPLOAD SUPPORT */
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const formData = new FormData();
                  formData.append("file", file);

                  try {
                    const res = await fetch("/api/super-admin/upload", {
                      method: "POST",
                      body: formData,
                    });

                    const data = await res.json();

                    if (res.ok && data.url) {
                      toast.success("Image uploaded!");
                      return {
                        success: 1,
                        file: { url: data.url },
                      };
                    }
                    toast.error("Image upload failed");
                    return { success: 0 };
                  } catch (e) {
                    toast.error("Image upload failed");
                    return { success: 0 };
                  }
                },

                async uploadByUrl(url: string) {
                  return fetch("/api/super-admin/upload-by-url", {
                    method: "POST",
                    body: JSON.stringify({ url }),
                  })
                    .then((res) => res.json())
                    .then((data) => data);
                },
              },
            },
          },

          simpleImage: SimpleImage,

          attaches: {
            class: Attaches,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const formData = new FormData();
                  formData.append("file", file);

                  const res = await fetch("/api/super-admin/upload", {
                    method: "POST",
                    body: formData,
                  });

                  const data = await res.json();

                  return {
                    success: 1,
                    file: {
                      url: data.url,
                      size: file.size,
                      name: file.name,
                      extension: file.name.split(".").pop(),
                    },
                  };
                },
              },
            },
          },
        },

        /** --- DATA LOADING SAFETY --- */
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

        placeholder: "Start writing your blog with all features...",

        /** --- CHANGE EVENT --- */
        async onChange(api) {
          const data = await api.saver.save();
          onChange?.(data);
        },
      });

      editorRef.current = editor;
    }

    init();

    return () => {
      if (editor && typeof editor.destroy === "function") {
        editor.destroy();
      }
      editorRef.current = null;
    };
  }, []);

  return (
    <div
      id="editorjs"
      className="min-h-[500px] bg-base-100 p-4 rounded-lg border border-base-300"
    />
  );
}
