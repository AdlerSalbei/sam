"use client";

import { CitizenInput } from "@/modules/citizen/components/CitizenInput";
import { Button2, Button2Variant, Button2ColorSchema } from "@/modules/common/components/Button2";
import toast from "react-hot-toast";
import { useActionState } from "react";
import { unstable_rethrow } from "next/navigation";
import Modal from "@/modules/common/components/Modal";
import * as FaIcons from "react-icons/fa";
import { FaTrash, FaPen } from "react-icons/fa";
import { registerExternalApp } from "@/modules/apps/actions/handleExternalApp";
import { deleteExternalApp } from "@/modules/apps/actions/deleteExternalApp";


interface Props {
  readonly onSuccess?: () => void;
}

export const CreateExternalAppsForm = ({ onSuccess }: Props) => {
  const [state, formAction, isPending] = useActionState(
      async (previousState: unknown, formData: FormData) => {
        try {
          const response = await registerExternalApp(formData);
  
          if (response.error) {
            toast.error(response.error);
            console.error(response);
            return response;
          }
  
          toast.success(response.success!);
          if (formData.has("createAnother")) {
            return response;
          }
  
          onSuccess?.();
          return response;
        } catch (error) {
          unstable_rethrow(error);
          toast.error(
            "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
          );
          console.error(error);
          return {
            error:
              "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
            requestPayload: formData,
          };
        }
      },
      null,
    );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
        <Button2
          variant={Button2Variant.Primary}
          colorSchema={Button2ColorSchema.Interaction}
          onClick={() => { setEditId(null); setIsOpen(true); }}
        >
          Externe App hinzufügen
        </Button2>
      </div>

      {/* Table */}
      <table style={{ borderCollapse: "collapse", width: "100%", border: "1px solid #e5e7eb" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ccc" }}>
            {["Name", "Beschreibung", "Slug", "Team", "Icon", "Bild", "Tags", "URL", "Aktionen"].map((h) => (
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
              <td style={cellStyle}>
                {u.imageSrc && (
                  <div style={{ position: "relative", width: "32px", height: "32px" }}>
                    <Image
                      src={u.imageSrc}
                      alt={u.name}
                      fill
                      style={{ objectFit: "contain", borderRadius: "4px" }}
                    />
                  </div>
                )}
              </td>
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

      

      <Modal heading="Icon auswählen" isOpen={iconPickerOpen} onRequestClose={() => setIconPickerOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "520px" }}>
          <input
            placeholder="Icons durchsuchen…"
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
            {filteredIcons.length} von {ICON_LIST.length} Icons. Suche zum Eingrenzen nutzen.
          </p>
        </div>
      </Modal>

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
