"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Loader2, FileText } from "lucide-react";
import { toast } from "react-toastify";

export default function TemplateDropdown({ selectedTemplate, onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // 🧠 Fetch templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/email-templates");
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
      else throw new Error();
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (tpl) => {
    onSelectTemplate(tpl);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="btn btn-sm md:btn-md btn-outline flex items-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <FileText className="w-4 h-4 opacity-70" />
            <span className="truncate max-w-[130px]">
              {selectedTemplate?.name || "Select Template"}
            </span>
            <ChevronDown className="w-4 h-4 opacity-70" />
          </>
        )}
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 w-64 bg-base-100 shadow-lg border border-base-300 rounded-xl z-50 max-h-72 overflow-y-auto">
          {loading ? (
            <li className="p-3 text-sm text-center text-base-content/60">
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            </li>
          ) : templates.length === 0 ? (
            <li className="p-3 text-sm text-center text-base-content/60">
              No templates found
            </li>
          ) : (
            templates.map((tpl) => (
              <li
                key={tpl.id}
                onClick={() => handleSelect(tpl)}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md hover:bg-base-200 transition ${
                  selectedTemplate?.id === tpl.id
                    ? "bg-primary/10 text-primary"
                    : ""
                }`}
              >
                <FileText className="w-4 h-4 opacity-70" />
                <span className="truncate">{tpl.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
