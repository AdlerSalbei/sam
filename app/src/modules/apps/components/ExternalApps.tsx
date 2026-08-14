"use client";

import { deleteExternalApp } from "@/modules/apps/actions/deleteExternalApp";
import {Button2,Button2ColorSchema,Button2Variant,} from "@/modules/common/components/Button2";
import Modal from "@/modules/common/components/Modal";
import type { Upload } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import * as FaIcons from "react-icons/fa";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";
import { CreateExternalAppsForm } from "./CreateExternalAppsForm";

interface UploadContextValue {
  uploads: Upload[];
}

const UploadContext = createContext<UploadContextValue>({ uploads: [] });

export const useUploadContext = () => useContext(UploadContext);

export const UploadProvider = ({
  children,
  uploads,
}: {
  children: ReactNode;
  uploads: Upload[];
}) => {
  const value = useMemo(() => ({ uploads }), [uploads]);
  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
};

interface ExternalApp {
  id: string;
  name: string;
  url: string;
  description?: string;
  slug?: string;
  team?: string | string[];
  icon?: string;
  imageSrc?: string;
  tags?: { id: string; name: string }[];
}

interface AppTag {
  id: string;
  name: string;
}

interface Props {
  existingApps: ExternalApp[];
  availableTags: AppTag[];
}

const appToInitial = (app: ExternalApp) => ({
  id: app.id,
  name: app.name ?? "",
  slug: app.slug ?? "",
  description: app.description ?? "",
  icon: app.icon ?? "",
  imageSrc: app.imageSrc ?? "",
  tags: app.tags ?? [],
  url: app.url ?? "",
  team: Array.isArray(app.team) ? app.team : app.team ? [app.team] : [],
});

const cellStyle: React.CSSProperties = {
  padding: "8px 8px",
  borderRight: "1px solid #e5e7eb",
};
const headerStyle: React.CSSProperties = {
  ...cellStyle,
  borderBottom: "4px solid #ccc",
  textAlign: "left",
};
const iconBtnStyle = (color: string): React.CSSProperties => ({
  padding: "5px 8px",
  background: color,
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
  display: "inline-flex",
  alignItems: "center",
});

export const ExternalApps = ({ existingApps, availableTags }: Props) => {
  const [editingApp, setEditingApp] = useState<ExternalApp | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const router = useRouter();

  const openEdit = (app: ExternalApp) => {
    setEditingApp(app);
  };

  const closeEdit = () => {
    setEditingApp(null);
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

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "8px",
        }}
      >
        <Button2
          variant={Button2Variant.Secondary}
          onClick={() => setCreating(true)}
        >
          <FaPlus /> Externe App hinzufügen
        </Button2>
      </div>

      {/* Table */}
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          border: "1px solid #e5e7eb",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #ccc" }}>
            {[
              "Name",
              "Beschreibung",
              "Slug",
              "Team",
              "Icon",
              "Bild",
              "Tags",
              "URL",
              "Aktionen",
            ].map((h) => (
              <th key={h} style={headerStyle}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {existingApps.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={cellStyle}>{u.name}</td>
              <td style={cellStyle}>{u.description}</td>
              <td style={cellStyle}>{u.slug}</td>
              <td style={cellStyle}>
                {Array.isArray(u.team) ? u.team.join(", ") : u.team}
              </td>
              <td style={cellStyle}>
                {u.icon
                  ? (() => {
                      const Icon = (FaIcons as Record<string, React.ElementType>)[u.icon];
                      return Icon ? <Icon /> : u.icon;
                    })()
                  : null}
              </td>
              <td style={cellStyle}>
                {u.imageSrc && (
                  <div
                    style={{
                      position: "relative",
                      width: "32px",
                      height: "32px",
                    }}
                  >
                    <Image
                      src={u.imageSrc}
                      alt={u.name}
                      fill
                      style={{ objectFit: "contain", borderRadius: "4px" }}
                    />
                  </div>
                )}
              </td>
              <td style={cellStyle}>
                {u.tags?.map((t) => t.name).join(", ")}
              </td>
              <td style={cellStyle}>{u.url}</td>
              <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => openEdit(u)}
                    style={iconBtnStyle("#3b82f6")}
                    title="Bearbeiten"
                  >
                    <FaPen />
                  </button>
                  <button
                    onClick={() => setDeleteId(u.id)}
                    style={iconBtnStyle("#ef4444")}
                    title="Löschen"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        heading="Neue App erstellen"
        isOpen={creating}
        onRequestClose={() => setCreating(false)}
      >
        <CreateExternalAppsForm
          availableTags={availableTags}
          onSuccess={() => setCreating(false)}
        />
      </Modal>

      <Modal
        heading="App bearbeiten"
        isOpen={editingApp !== null}
        onRequestClose={closeEdit}
      >
        {editingApp && (
          <CreateExternalAppsForm
            initial={appToInitial(editingApp)}
            availableTags={availableTags}
            onSuccess={closeEdit}
          />
        )}
      </Modal>

      <Modal
        heading="Eintrag löschen"
        isOpen={deleteId !== null}
        onRequestClose={() => setDeleteId(null)}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            minWidth: "320px",
          }}
        >
          <p style={{ color: "#d1d5db", margin: 0, fontSize: "14px" }}>
            Möchtest du diesen Eintrag wirklich löschen? Diese Aktion kann nicht
            rückgängig gemacht werden.
          </p>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Button2
              variant={Button2Variant.Secondary}
              colorSchema={Button2ColorSchema.Interaction}
              onClick={() => setDeleteId(null)}
            >
              Abbrechen
            </Button2>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: deleteLoading ? "#6b7280" : "#ef4444",
                color: "white",
                fontSize: "14px",
                fontWeight: 500,
                cursor: deleteLoading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
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