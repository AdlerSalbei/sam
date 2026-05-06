"use client";

import { useState, useMemo } from "react";
import Modal from "@/modules/common/components/Modal";
import { Button2, Button2Variant, Button2ColorSchema } from "@/modules/common/components/Button2";
import Image from "next/image";
import type { ExternalApps as ExternalAppsType, Upload } from "@prisma/client";
import { ImageUpload } from "@/modules/common/components/ImageUpload";
import clsx from "clsx";

interface Props {
  value: string;
  onChange: (url: string) => void;
  uploads: Upload[];
  readonly externalApp?: ExternalAppsType & {
    icon: Upload | null;
  };
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

export const ImageSourcePicker = ({ value, onChange, uploads, externalApp }: Props) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  //if (!externalApp) return null;

  const filteredUploads = useMemo(
    () =>
      uploads.filter((u: any) => {
        const searchable = `${u.filename ?? ""} ${u.url ?? ""}`.toLowerCase();
        return searchable.includes(search.toLowerCase());
      }),
    [uploads, search],
  );

  const close = () => {
    setPickerOpen(false);
    setSearch("");
    setUploadError(null);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Button2
          variant={Button2Variant.Primary}
          colorSchema={Button2ColorSchema.Interaction}
          onClick={() => setPickerOpen(true)}
        >
          Bild auswählen / hochladen
        </Button2>

        {value && (
          <div style={{ position: "relative", width: "40px", height: "40px" }}>
            <Image
              src={value}
              alt="Vorschau"
              fill
              style={{
                objectFit: "contain",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </div>
        )}
      </div>

      <Modal heading="Bild auswählen" isOpen={pickerOpen} onRequestClose={close}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "520px" }}>

          <input
            placeholder="Uploads durchsuchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          <label style={{ cursor: "pointer" }}>
            <ImageUpload
              resourceType="ExternalApps"
              resourceId={String(externalApp.id)}
              resourceAttribute="iconId"
              imageId={externalApp.icon?.id}
              imageMimeType={externalApp.icon?.mimeType}
              width={128}
              height={128}
              className={clsx(
                "mt-2 size-32 border border-neutral-700 hover:border-neutral-500 text-neutral-500 hover:text-neutral-300 transition-colors group rounded-secondary",
                {
                  "after:content-['Bild_hochladen'] flex items-center justify-center":
                    !externalApp.iconId,
                },
              )}
              imageClassName="size-32"
              pendingClassName="size-32"
            />
          </label>

          {uploadError && (
            <p style={{ fontSize: "12px", color: "#f87171" }}>
              {uploadError}
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {filteredUploads.map((upload: any) => {
              const url = upload.url ?? "";
              const filename = upload.filename ?? url.split("/").pop() ?? "–";

              return (
                <Button2
                  key={upload.id}
                  title={filename}
                  onClick={() => {
                    onChange(url);
                    close();
                  }}
                >
                  <div style={{ position: "relative", width: "64px", height: "64px" }}>
                    <Image
                      src={url}
                      alt={filename}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {filename}
                  </span>
                </Button2>
              );
            })}

            {filteredUploads.length === 0 && (
              <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                Keine Uploads gefunden.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};