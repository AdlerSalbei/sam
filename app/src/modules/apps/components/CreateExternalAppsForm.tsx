"use client";

import Modal from "@/modules/common/components/Modal";
import { createAppTag } from "@/modules/apps/actions/createAppTag";
import { registerExternalApp } from "@/modules/apps/actions/handleExternalApp";
import { CitizenInput } from "@/modules/citizen/components/CitizenInput";
import {Button2,Button2ColorSchema,Button2Variant,} from "@/modules/common/components/Button2";
import useUpload from "@/modules/common/utils/useUpload";
import { env } from "@/env";
import Image from "next/image";
import { unstable_rethrow } from "next/navigation";
import { type ChangeEventHandler, useActionState, useEffect, useId, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import * as FaIcons from "react-icons/fa";
import { FaSave, FaSpinner, FaTimes, FaChevronDown, FaPlus } from "react-icons/fa";

interface AppTag {
  id: string;
  name: string;
}

interface ExternalAppInitialValues {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  imageSrc?: string;
  tags?: AppTag[];
  team?: string[];
  url?: string;
}

interface Props {
  readonly className?: string;
  readonly initial?: ExternalAppInitialValues;
  readonly availableTags: AppTag[];
  readonly onSuccess?: () => void;
}

const inputStyle: React.CSSProperties = {
  padding: "8px 8px",
  borderRadius: "6px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const ALL_FA_ICONS = Object.keys(FaIcons).filter((k) => k.startsWith("Fa"));

const TagPicker = ({
  selected,
  available,
  onChange,
  id,
}: {
  selected: AppTag[];
  available: AppTag[];
  onChange: (tags: AppTag[]) => void;
  id?: string;
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const [localAvailable, setLocalAvailable] = useState(available);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const toggle = (tag: AppTag) => {
    const isSelected = selected.some((t) => t.id === tag.id);
    onChange(isSelected ? selected.filter((t) => t.id !== tag.id) : [...selected, tag]);
  };

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    setCreating(true);
    const fd = new FormData();
    fd.set("name", newTagName.trim());
    const result = await createAppTag(fd);
    setCreating(false);
    if (result.tag) {
      setLocalAvailable((prev) =>
        prev.some((t) => t.id === result.tag!.id) ? prev : [...prev, result.tag!],
      );
      onChange([...selected, result.tag]);
      setNewTagName("");
      setCreateOpen(false);
    } else {
      toast.error(result.error ?? "Fehler beim Erstellen des Tags.");
    }
  };

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
      {/* Multi-select dropdown */}
      <div ref={ref} id={id} style={{ position: "relative", flex: 1 }}>
        <div
          onClick={() => setDropdownOpen((o) => !o)}
          style={{
            ...inputStyle,
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            cursor: "pointer",
            minHeight: "36px",
            alignItems: "center",
          }}
        >
          {selected.length === 0 ? (
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Tags auswählen…</span>
          ) : (
            selected.map((tag) => (
              <span
                key={tag.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "1px 7px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "999px",
                  fontSize: "12px",
                }}
              >
                {tag.name}
                <FaTimes
                  style={{ cursor: "pointer", fontSize: "9px", opacity: 0.7 }}
                  onClick={(e) => { e.stopPropagation(); toggle(tag); }}
                />
              </span>
            ))
          )}
        </div>

        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              zIndex: 50,
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "#1e1e2e",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            {localAvailable.length === 0 ? (
              <div style={{ padding: "10px 12px", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                Noch keine Tags vorhanden.
              </div>
            ) : (
              localAvailable.map((tag) => {
                const isSelected = selected.some((t) => t.id === tag.id);
                return (
                  <div
                    key={tag.id}
                    onClick={() => toggle(tag)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      background: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
                      fontSize: "13px",
                    }}
                  >
                    <span
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "3px",
                        background: isSelected ? "rgba(255,255,255,0.6)" : "transparent",
                        flexShrink: 0,
                      }}
                    />
                    {tag.name}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Create tag button */}
      <Button2
        type="button"
        variant={Button2Variant.Secondary}
        colorSchema={Button2ColorSchema.Interaction}
        onClick={() => { setCreateOpen(true); setDropdownOpen(false); }}
        title="Neuen Tag erstellen"
        style={{ flexShrink: 0 }}
      >
        <FaPlus />
      </Button2>

      {/* Create tag modal */}
      <Modal heading="Neuen Tag erstellen" isOpen={createOpen} onRequestClose={() => { setCreateOpen(false); setNewTagName(""); }}>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", minWidth: "280px" }}>
          <input
            autoFocus
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleCreate(); } }}
            placeholder="Tag-Name…"
            style={inputStyle}
            disabled={creating}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button2
              type="button"
              variant={Button2Variant.Secondary}
              colorSchema={Button2ColorSchema.Interaction}
              onClick={() => { setCreateOpen(false); setNewTagName(""); }}
            >
              Abbrechen
            </Button2>
            <Button2
              type="button"
              variant={Button2Variant.Primary}
              colorSchema={Button2ColorSchema.Interaction}
              onClick={() => void handleCreate()}
              disabled={creating || !newTagName.trim()}
            >
              {creating ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Erstellen
            </Button2>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const IconPicker = ({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (name: string) => void;
  id?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_FA_ICONS.filter((n) => n.toLowerCase().includes(q));
  }, [search]);

  const SelectedIcon = value
    ? (FaIcons as Record<string, React.ElementType>)[value] ?? null
    : null;

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <div
          id={id}
          onClick={() => setOpen((o) => !o)}
          style={{
            width: "64px",
            height: "64px",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px",
            background: "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            fontSize: "24px",
            color: "white",
          }}
        >
          {SelectedIcon ? (
            <SelectedIcon />
          ) : (
            <FaChevronDown style={{ opacity: 0.4, fontSize: "16px" }} />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {value && (
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>{value}</span>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: "12px",
                padding: 0,
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <FaTimes style={{ fontSize: "10px" }} /> Entfernen
            </button>
          )}
        </div>
      </div>

      {/* Modal picker */}
      <Modal
        heading="Icon auswählen"
        isOpen={open}
        onRequestClose={() => setOpen(false)}
        className="w-[600px]"
      >
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen…"
            style={inputStyle}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(10, 1fr)",
              gap: "6px",
              maxHeight: "420px",
              overflowY: "auto",
            }}
          >
            {filtered.map((name) => {
              const Icon = (FaIcons as Record<string, React.ElementType>)[name];
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                    background:
                      value === name
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.05)",
                    border: "none",
                    borderRadius: "4px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  <Icon />
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
              Kein Icon gefunden
            </span>
          )}
        </div>
      </Modal>
    </div>
  );
};

export const CreateExternalAppsForm = ({
  className,
  initial,
  availableTags,
  onSuccess,
}: Props) => {
  const nameId = useId();
  const slugId = useId();
  const descriptionId = useId();
  const iconId = useId();
  const imageSrcId = useId();
  const tagsId = useId();
  const urlId = useId();

  const [selectedTags, setSelectedTags] = useState<AppTag[]>(initial?.tags ?? []);
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [imageSrc, setImageSrc] = useState(initial?.imageSrc ?? "");
  const [imageUploading, setImageUploading] = useState(false);
  const { setFile, upload, setUpload } = useUpload();

  useEffect(() => {
    if (!upload) return;
    setImageSrc(`https://${env.NEXT_PUBLIC_S3_PUBLIC_URL}/${upload}`);
    setUpload(null);
    setImageUploading(false);
  }, [upload]);

  const handleImageChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setFile(file);
  };

  const [, formAction, isPending] = useActionState(
    async (previousState: unknown, formData: FormData) => {
      for (const tag of selectedTags) {
        formData.append("tagIds[]", tag.id);
      }

      try {
        const response = await registerExternalApp(formData);

        if (response.error) {
          toast.error(response.error);
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
    <form
      action={formAction}
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div>
        <label className="block" htmlFor={nameId}>
          Name
        </label>
        <input
          id={nameId}
          name="name"
          defaultValue={initial?.name}
          style={inputStyle}
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block" htmlFor={slugId}>
          Slug
        </label>
        <input
          id={slugId}
          name="slug"
          defaultValue={initial?.slug}
          style={inputStyle}
          required
        />
      </div>

      <div>
        <label className="block" htmlFor={descriptionId}>
          Beschreibung
        </label>
        <textarea
          id={descriptionId}
          name="description"
          defaultValue={initial?.description}
          style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", gap: "24px" }}>
        <div>
          <label className="block" htmlFor={iconId}>
            Icon
          </label>
          <input type="hidden" name="icon" value={icon} />
          <IconPicker id={iconId} value={icon} onChange={setIcon} />
        </div>

        <div>
          <label className="block" htmlFor={imageSrcId}>
            Bild
          </label>
          <input type="hidden" name="imageSrc" value={imageSrc} />
          <div
            id={imageSrcId}
            style={{
              position: "relative",
              width: "128px",
              height: "128px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              marginTop: "4px",
            }}
          >
            {imageSrc && !imageUploading ? (
              <Image
                src={imageSrc}
                alt="Vorschau"
                fill
                style={{ objectFit: "contain" }}
                unoptimized
              />
            ) : imageUploading ? (
              <FaSpinner
                className="animate-spin"
                style={{ color: "#ef4444", fontSize: "24px" }}
              />
            ) : (
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.5)",
                  textAlign: "center",
                  padding: "8px",
                }}
              >
                Bild hochladen
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={imageUploading || isPending}
              onChange={handleImageChange}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
                fontSize: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* CitizenInput renders its own hidden team[] inputs per selected
          citizen and submits directly as part of the native FormData. */}
      <CitizenInput name="team" multiple defaultValue={initial?.team} />

      <div>
        <label className="block" htmlFor={tagsId}>
          Tags
        </label>
        <TagPicker
          id={tagsId}
          selected={selectedTags}
          available={availableTags}
          onChange={setSelectedTags}
        />
      </div>

      <div>
        <label className="block" htmlFor={urlId}>
          URL
        </label>
        <input
          id={urlId}
          name="url"
          type="url"
          defaultValue={initial?.url}
          placeholder="https://…"
          style={inputStyle}
          required
        />
      </div>

      <div className="flex justify-end mt-2">
        <Button2
          type="submit"
          variant={Button2Variant.Primary}
          colorSchema={Button2ColorSchema.Interaction}
          disabled={isPending}
        >
          {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
          Speichern
        </Button2>
      </div>
    </form>
  );
};