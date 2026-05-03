"use client";

import { useState, useMemo } from "react";
import { Button2, Button2Variant, Button2ColorSchema } from "@/modules/common/components/Button2";
import Modal from "@/modules/common/components/Modal";
import * as FaIcons from "react-icons/fa";
import Image from "next/image";
import { registerExternalApp } from "@/modules/apps/actions/externalApps";

const ICON_LIST = Object.keys(FaIcons).filter((key) => key.startsWith("Fa"));

type ImageMode = "icon" | "src";

interface ExternalApp {
  id: string;
  name: string;
  url: string;
}

interface Props {
  existingApps: ExternalApp[];
}

const emptyForm = {
  name: "", slug: "", description: "", icon: "",
  imageSrc: "", tags: "", url: "", team: "",
};

export const ExternalApps = ({ existingApps }: Props) => {
  const [isOpen, setIsOpen]                 = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch]         = useState("");
  const [imageMode, setImageMode]           = useState<ImageMode>("icon");
  const [form, setForm]                     = useState(emptyForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const nameLower = form.name.trim().toLowerCase();
    const urlLower  = form.url.trim().toLowerCase();

    const duplicate = existingApps.find(
      (app) =>
        app.name.trim().toLowerCase() === nameLower ||
        app.url.trim().toLowerCase()  === urlLower,
    );

    const formData = new FormData();

    if (duplicate?.id) formData.append("id", duplicate.id);
    formData.append("name",        form.name);
    formData.append("slug",        form.slug);
    formData.append("description", form.description);
    formData.append("icon",        imageMode === "icon" ? form.icon     : "");
    formData.append("imageSrc",    imageMode === "src"  ? form.imageSrc : "");
    formData.append("url",         form.url);
    formData.append("tags",        JSON.stringify(form.tags.split(",").map((t) => t.trim())));
    formData.append("team",        JSON.stringify(form.team.split(",").map((t) => t.trim())));

    await registerExternalApp(formData);

    setIsOpen(false);
    setForm(emptyForm);
  };

  const filteredIcons = useMemo(
    () =>
      ICON_LIST.filter((n) =>
        n.toLowerCase().includes(iconSearch.toLowerCase()),
      ).slice(0, 100),
    [iconSearch],
  );

  const SelectedIcon = form.icon
    ? (FaIcons as Record<string, React.ElementType>)[form.icon]
    : null;

  const fields: { label: string; name: keyof typeof emptyForm; placeholder?: string }[] = [
    { label: "Name",        name: "name",        placeholder: "My App" },
    { label: "Description", name: "description", placeholder: "My awesome App..." },
    { label: "Team",        name: "team",        placeholder: "Index, GeronBraginson" },
    { label: "Tags",        name: "tags",        placeholder: "tag1, tag2" },
    { label: "URL",         name: "url",         placeholder: "https://..." },
  ];

  const inputStyle: React.CSSProperties = {
    padding: "8px 10px", borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "white", fontSize: "14px", outline: "none", width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "13px", fontWeight: 500, color: "#9ca3af",
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "6px 0", fontSize: "13px", fontWeight: 500,
    borderRadius: "6px", border: "none", cursor: "pointer",
    background: active ? "rgba(255,255,255,0.1)" : "transparent",
    color: active ? "white" : "#6b7280",
    transition: "background 0.15s, color 0.15s",
  });

  return (
    <>
      <Button2
        variant={Button2Variant.Primary}
        colorSchema={Button2ColorSchema.Interaction}
        onClick={() => setIsOpen(true)}
      >
        Add External App
      </Button2>

      {/* ── Main form modal ── */}
      <Modal
        heading="Add External App"
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "400px" }}>

          {fields.map(({ label, name, placeholder }) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>{label}</label>
              <input
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                style={inputStyle}
              />
            </div>
          ))}

          {/* Image toggle */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={labelStyle}>Image</label>

            <div style={{
              display: "flex", gap: "4px", padding: "4px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <button style={tabStyle(imageMode === "icon")} onClick={() => setImageMode("icon")}>
                React Icon
              </button>
              <button style={tabStyle(imageMode === "src")} onClick={() => setImageMode("src")}>
                Image URL
              </button>
            </div>

            {imageMode === "icon" && (
              <button
                onClick={() => setIconPickerOpen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 10px", borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white", fontSize: "14px", cursor: "pointer", textAlign: "left",
                }}
              >
                {SelectedIcon ? (
                  <><SelectedIcon style={{ fontSize: "18px" }} /><span>{form.icon}</span></>
                ) : (
                  <span style={{ color: "#6b7280" }}>Click to select an icon…</span>
                )}
              </button>
            )}

            {imageMode === "src" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  name="imageSrc"
                  value={form.imageSrc}
                  onChange={handleChange}
                  placeholder="https://example.com/image.png"
                  style={inputStyle}
                />
                {form.imageSrc && (
                  <Image
                    src={form.imageSrc}
                    alt="Preview"
                    style={{
                      width: "48px", height: "48px", objectFit: "contain",
                      borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
            <Button2
              variant={Button2Variant.Secondary}
              colorSchema={Button2ColorSchema.Interaction}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button2>
            <Button2
              variant={Button2Variant.Primary}
              colorSchema={Button2ColorSchema.Interaction}
              onClick={handleSubmit}
            >
              Save
            </Button2>
          </div>
        </div>
      </Modal>

      {/* ── Icon picker modal ── */}
      <Modal
        heading="Select an Icon"
        isOpen={iconPickerOpen}
        onRequestClose={() => setIconPickerOpen(false)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "520px" }}>
          <input
            placeholder="Search icons…"
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            style={inputStyle}
            autoFocus
          />

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(8, 1fr)",
            gap: "8px", maxHeight: "360px", overflowY: "auto", paddingRight: "4px",
          }}>
            {filteredIcons.map((iconName) => {
              const Icon = (FaIcons as Record<string, React.ElementType>)[iconName];
              const isSelected = form.icon === iconName;
              return (
                <button
                  key={iconName}
                  title={iconName}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, icon: iconName }));
                    setIconPickerOpen(false);
                    setIconSearch("");
                  }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    aspectRatio: "1", borderRadius: "6px", border: "1px solid",
                    borderColor: isSelected ? "rgb(99,102,241)" : "rgba(255,255,255,0.08)",
                    background: isSelected ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                    color: isSelected ? "rgb(165,180,252)" : "white",
                    fontSize: "18px", cursor: "pointer",
                    transition: "background 0.1s, border-color 0.1s",
                  }}
                >
                  <Icon />
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
            Showing {filteredIcons.length} of {ICON_LIST.length} icons. Use search to narrow down.
          </p>
        </div>
      </Modal>
    </>
  );
};