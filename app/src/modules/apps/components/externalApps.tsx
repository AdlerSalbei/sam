"use client";

import { useState, useMemo } from "react";
import { Button2, Button2Variant, Button2ColorSchema } from "@/modules/common/components/Button2";
import Modal from "@/modules/common/components/Modal";
import * as FaIcons from "react-icons/fa";
import { FaTrash, FaPen } from "react-icons/fa";
import Image from "next/image";
import { registerExternalApp } from "@/modules/apps/actions/registerExternalApp";
import { deleteExternalApp } from "@/modules/apps/actions/deleteExternalApp";
import { useRouter } from "next/navigation";

const ICON_LIST = Object.keys(FaIcons).filter((key) => key.startsWith("Fa"));

interface ExternalApp {
  id: string;
  name: string;
  url: string;
  description?: string;
  slug?: string;
  team?: string | string[];
  icon?: string;
  imageSrc?: string;
  tags?: string | string[];
}

interface Props {
  existingApps: ExternalApp[];
}

const emptyForm = {
  name: "", slug: "", description: "", icon: "",
  imageSrc: "", tags: "", url: "", team: "",
};

const cellStyle: React.CSSProperties = { padding: "8px 12px", borderRight: "1px solid #e5e7eb" };
const headerStyle: React.CSSProperties = { ...cellStyle, borderBottom: "4px solid #ccc", textAlign: "left" };

const appToForm = (app: ExternalApp) => ({
  name:        app.name        ?? "",
  slug:        app.slug        ?? "",
  description: app.description ?? "",
  icon:        app.icon        ?? "",
  imageSrc:    app.imageSrc    ?? "",
  tags:        Array.isArray(app.tags) ? app.tags.join(", ") : (app.tags ?? ""),
  url:         app.url         ?? "",
  team:        Array.isArray(app.team) ? app.team.join(", ") : (app.team ?? ""),
});

export const ExternalApps = ({ existingApps }: Props) => {
  const [isOpen, setIsOpen]                 = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch]         = useState("");
  const [form, setForm]                     = useState(emptyForm);
  const [editId, setEditId]                 = useState<string | null>(null);
  const [deleteId, setDeleteId]             = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openEdit = (app: ExternalApp) => {
    setForm(appToForm(app));
    setEditId(app.id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const handleSubmit = async () => {
    const nameLower = form.name.trim().toLowerCase();
    const urlLower  = form.url.trim().toLowerCase();

    const duplicate = !editId
      ? existingApps.find(
          (app) =>
            app.name.trim().toLowerCase() === nameLower ||
            app.url.trim().toLowerCase()  === urlLower,
        )
      : undefined;

    const formData = new FormData();

    const resolvedId = editId ?? duplicate?.id;
    if (resolvedId) formData.append("id", resolvedId);

    formData.append("name",        form.name);
    formData.append("slug",        form.slug);
    formData.append("description", form.description);
    formData.append("icon",        form.icon);
    formData.append("imageSrc",    form.imageSrc);
    formData.append("url",         form.url);
    formData.append("tags",        JSON.stringify(form.tags.split(",").map((t) => t.trim())));
    formData.append("team",        JSON.stringify(form.team.split(",").map((t) => t.trim())));

    await registerExternalApp(formData);
    closeModal();
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteExternalApp(deleteId);
      setDeleteId(null);
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredIcons = useMemo(
    () => ICON_LIST.filter((n) => n.toLowerCase().includes(iconSearch.toLowerCase())).slice(0, 100),
    [iconSearch],
  );

  const SelectedIcon = form.icon
    ? (FaIcons as Record<string, React.ElementType>)[form.icon]
    : null;

  const fields: { label: string; name: keyof typeof emptyForm; placeholder?: string }[] = [
    { label: "Name",        name: "name",        placeholder: "SILO-Anfrage" },
    { label: "Description", name: "description", placeholder: "Kurze Beschreibung…" },
    { label: "Slug",        name: "slug",        placeholder: "silo-request" },
    { label: "Team",        name: "team",        placeholder: "Waffelkeks" },
    { label: "Tags",        name: "tags",        placeholder: "featured, economics" },
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

  const iconBtnStyle = (color: string): React.CSSProperties => ({
    padding: "5px 8px", background: color, color: "#fff",
    border: "none", borderRadius: "4px", cursor: "pointer",
    fontSize: "13px", display: "inline-flex", alignItems: "center",
  });

  return (
    <>
      {/* ── Toolbar ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <Button2
          variant={Button2Variant.Primary}
          colorSchema={Button2ColorSchema.Interaction}
          onClick={() => { setEditId(null); setIsOpen(true); }}
        >
          Add External App
        </Button2>
      </div>

      {/* ── Tabelle ── */}
      <table style={{ borderCollapse: "collapse", width: "100%", border: "1px solid #e5e7eb" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ccc" }}>
            {["Name", "Beschreibung", "Slug", "Team", "Icon", "Image Source", "Tags", "URL", "Aktionen"].map((h) => (
              <th key={h} style={headerStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {existingApps.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={cellStyle}>{u.name}</td>
              <td style={cellStyle}>{u.description}</td>
              <td style={cellStyle}>{u.slug}</td>
              <td style={cellStyle}>{Array.isArray(u.team) ? u.team.join(", ") : u.team}</td>
              <td style={cellStyle}>{u.icon}</td>
              <td style={cellStyle}>{u.imageSrc}</td>
              <td style={cellStyle}>{Array.isArray(u.tags) ? u.tags.join(", ") : u.tags}</td>
              <td style={cellStyle}>{u.url}</td>
              <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => openEdit(u)} style={iconBtnStyle("#3b82f6")} title="Bearbeiten">
                    <FaPen />
                  </button>
                  <button onClick={() => setDeleteId(u.id)} style={iconBtnStyle("#ef4444")} title="Löschen">
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Add / Edit Modal ── */}
      <Modal
        heading={editId ? "App bearbeiten" : "Add External App"}
        isOpen={isOpen}
        onRequestClose={closeModal}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "400px" }}>

          {fields.map(({ label, name, placeholder }) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>{label}</label>
              <input
                name={name} value={form[name]} onChange={handleChange}
                placeholder={placeholder} style={inputStyle}
              />
            </div>
          ))}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Icon Picker */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Icon</label>
              <button
                onClick={() => setIconPickerOpen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 10px", borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white", fontSize: "14px", cursor: "pointer", textAlign: "left",
                  width: "100%", boxSizing: "border-box",
                }}
              >
                {SelectedIcon ? (
                  <><SelectedIcon style={{ fontSize: "18px" }} /><span>{form.icon}</span></>
                ) : (
                  <span style={{ color: "#6b7280" }}>Icon auswählen…</span>
                )}
              </button>
            </div>

            {/* Image URL */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Image URL</label>
              <input
                name="imageSrc" value={form.imageSrc} onChange={handleChange}
                placeholder="https://example.com/image.png" style={inputStyle}
              />
              {form.imageSrc && (
                <div style={{ position: "relative", width: "40px", height: "40px", marginTop: "4px" }}>
                  <Image
                    src={form.imageSrc}
                    alt="Preview"
                    fill
                    style={{ objectFit: "contain", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              )}
            </div>


          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
            <Button2 variant={Button2Variant.Secondary} colorSchema={Button2ColorSchema.Interaction} onClick={closeModal}>
              Cancel
            </Button2>
            <Button2 variant={Button2Variant.Primary} colorSchema={Button2ColorSchema.Interaction} onClick={handleSubmit}>
              {editId ? "Speichern" : "Save"}
            </Button2>
          </div>
        </div>
      </Modal>

      {/* ── Icon-Picker-Modal ── */}
      <Modal heading="Select an Icon" isOpen={iconPickerOpen} onRequestClose={() => setIconPickerOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "520px" }}>
          <input
            placeholder="Search icons…" value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            style={inputStyle} autoFocus
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
                  key={iconName} title={iconName}
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

      {/* ── Delete-Bestätigungs-Modal ── */}
      <Modal heading="Eintrag löschen" isOpen={deleteId !== null} onRequestClose={() => setDeleteId(null)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: "320px" }}>
          <p style={{ color: "#d1d5db", margin: 0, fontSize: "14px" }}>
            Möchtest du diesen Eintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button2 variant={Button2Variant.Secondary} colorSchema={Button2ColorSchema.Interaction} onClick={() => setDeleteId(null)}>
              Abbrechen
            </Button2>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              style={{
                padding: "8px 16px", borderRadius: "6px", border: "none",
                background: deleteLoading ? "#6b7280" : "#ef4444",
                color: "white", fontSize: "14px", fontWeight: 500,
                cursor: deleteLoading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                display: "inline-flex", alignItems: "center", gap: "8px",
              }}
            >
              <FaTrash />
              {deleteLoading ? "Wird gelöscht…" : "Löschen"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};