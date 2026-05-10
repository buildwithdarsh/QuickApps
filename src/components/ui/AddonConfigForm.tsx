"use client";

import { useState } from "react";
import { Save, Loader2, CheckCircle2, Upload, Plus, Trash2 } from "lucide-react";
import { IconPicker } from "./IconPicker";

interface FieldSchema {
  type: string;
  required: boolean;
  label: string;
  options?: string[];
}

interface AddonConfigFormProps {
  addonSlug: string;
  addonName: string;
  configSchema: Record<string, FieldSchema>;
  savedConfig: Record<string, unknown> | null;
  onSave: (config: Record<string, unknown>) => Promise<void>;
}

// ── Array item templates per addon slug ──────────────

const ARRAY_TEMPLATES: Record<string, { fields: { key: string; label: string; type: string; placeholder?: string; options?: string[] }[] }> = {
  // Bottom nav / advanced nav tabs
  "tabs": {
    fields: [
      { key: "label", label: "Label", type: "string", placeholder: "Home" },
      { key: "url", label: "URL path", type: "string", placeholder: "/home" },
      { key: "icon", label: "Icon name", type: "string", placeholder: "home" },
    ],
  },
  // Side drawer / secondary nav items
  "items": {
    fields: [
      { key: "label", label: "Label", type: "string", placeholder: "Menu Item" },
      { key: "url", label: "URL", type: "string", placeholder: "/page" },
      { key: "icon", label: "Icon", type: "string", placeholder: "menu" },
    ],
  },
  // Onboarding screens
  "screens": {
    fields: [
      { key: "title", label: "Title", type: "string", placeholder: "Welcome to our app" },
      { key: "description", label: "Description", type: "string", placeholder: "Discover amazing features" },
      { key: "imageUrl", label: "Image URL", type: "string", placeholder: "https://..." },
      { key: "buttonText", label: "Button text", type: "string", placeholder: "Next" },
    ],
  },
  // App shortcuts
  "shortcuts": {
    fields: [
      { key: "label", label: "Label", type: "string", placeholder: "Quick Action" },
      { key: "url", label: "URL", type: "string", placeholder: "/action" },
      { key: "icon", label: "Icon", type: "string", placeholder: "star" },
    ],
  },
  // Dynamic app icons
  "icons": {
    fields: [
      { key: "name", label: "Variant name", type: "string", placeholder: "Diwali Edition" },
      { key: "iconUrl", label: "Icon URL", type: "string", placeholder: "https://..." },
    ],
  },
  // Razorpay accepted methods
  "acceptedMethods": {
    fields: [
      { key: "method", label: "Payment method", type: "select", options: ["card", "upi", "netbanking", "wallet", "emi", "paylater"] },
    ],
  },
  // Indian language overlay
  "languages": {
    fields: [
      { key: "code", label: "Language code", type: "string", placeholder: "hi" },
      { key: "label", label: "Display name", type: "string", placeholder: "Hindi" },
    ],
  },
};

function getArrayTemplate(fieldKey: string) {
  return ARRAY_TEMPLATES[fieldKey] ?? {
    fields: [{ key: "value", label: "Value", type: "string", placeholder: "Enter value" }],
  };
}

// ── Array Item Builder ──────────────────────────────

function ArrayBuilder({ fieldKey, label, value, onChange }: {
  fieldKey: string;
  label: string;
  value: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
}) {
  const template = getArrayTemplate(fieldKey);

  const addItem = () => {
    const empty: Record<string, unknown> = {};
    template.fields.forEach((f) => { empty[f.key] = ""; });
    onChange([...value, empty]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: string, val: string) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="rounded-lg p-3 flex items-start gap-2" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
              <span className="text-xs font-bold mt-2.5 shrink-0 w-5 text-center" style={{ color: "var(--text-tertiary)" }}>{index + 1}</span>
              <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(template.fields.length, 3)}, 1fr)` }}>
                {template.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>{field.label}</label>
                    {field.key === "icon" ? (
                      <IconPicker
                        value={(item[field.key] as string) ?? ""}
                        onChange={(name) => updateItem(index, field.key, name)}
                      />
                    ) : field.type === "select" && field.options ? (
                      <select
                        value={(item[field.key] as string) ?? ""}
                        onChange={(e) => updateItem(index, field.key, e.target.value)}
                        className="w-full px-2.5 py-2 rounded-md text-xs outline-none qa-input"
                        style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                      >
                        <option value="">Select...</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={(item[field.key] as string) ?? ""}
                        onChange={(e) => updateItem(index, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-2.5 py-2 rounded-md text-xs outline-none qa-input"
                        style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => removeItem(index)} className="mt-2 p-1 rounded hover:bg-red-500/10 transition-colors" title="Remove">
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={addItem}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-brand-500/10"
        style={{ color: "var(--text-secondary)", border: "1.5px dashed var(--border-strong, var(--border-default))" }}
      >
        <Plus size={14} /> Add {label.replace(/\(.*\)/, "").trim().toLowerCase()}
      </button>
    </div>
  );
}

// ── Main Form ───────────────────────────────────────

export function AddonConfigForm({ addonName, configSchema, savedConfig, onSave }: AddonConfigFormProps) {
  const fields = Object.entries(configSchema);
  const [config, setConfig] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const [key, schema] of fields) {
      if (schema.type === "array") {
        initial[key] = (savedConfig?.[key] as Record<string, unknown>[]) ?? [];
      } else if (schema.type === "boolean") {
        initial[key] = savedConfig?.[key] ?? false;
      } else if (schema.type === "number") {
        initial[key] = savedConfig?.[key] ?? 0;
      } else {
        initial[key] = savedConfig?.[key] ?? "";
      }
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onSave(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  if (fields.length === 0) {
    return (
      <div className="py-4 text-center">
        <CheckCircle2 size={20} className="mx-auto mb-2 text-green-500" />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          No configuration needed — this addon works out of the box.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map(([key, schema]) => (
        <div key={key}>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            {schema.label}
            {schema.required && <span className="text-red-400 ml-1">*</span>}
          </label>

          {schema.type === "string" && (
            <input
              type="text"
              value={(config[key] as string) ?? ""}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={schema.label}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none qa-input"
              style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
            />
          )}

          {schema.type === "number" && (
            <input
              type="number"
              value={(config[key] as number) ?? ""}
              onChange={(e) => updateField(key, Number(e.target.value))}
              placeholder={schema.label}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none qa-input"
              style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
            />
          )}

          {schema.type === "boolean" && (
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{schema.label}</span>
              <button
                type="button"
                onClick={() => updateField(key, !config[key])}
                className={`w-11 h-6 rounded-full relative transition-colors ${config[key] ? "bg-brand-500" : ""}`}
                style={!config[key] ? { background: "var(--bg-secondary)" } : undefined}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${config[key] ? "translate-x-[22px]" : "translate-x-0.5"}`} />
              </button>
            </label>
          )}

          {schema.type === "select" && schema.options && (
            <select
              value={(config[key] as string) ?? ""}
              onChange={(e) => updateField(key, e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none qa-input"
              style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
            >
              <option value="">Select {schema.label}</option>
              {schema.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {schema.type === "file" && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-brand-500/10"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1.5px dashed var(--border-strong, var(--border-default))" }}>
                <Upload size={14} />
                {config[key] ? "File selected" : "Choose file"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => updateField(key, reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              {Boolean(config[key]) && (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Uploaded
                </span>
              )}
            </div>
          )}

          {schema.type === "array" && (
            <ArrayBuilder
              fieldKey={key}
              label={schema.label}
              value={(config[key] as Record<string, unknown>[]) ?? []}
              onChange={(items) => updateField(key, items)}
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition-colors"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
        {saving ? "Saving..." : saved ? "Saved!" : `Save ${addonName} Config`}
      </button>
    </div>
  );
}
