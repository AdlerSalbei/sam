"use client";

import { useState, useMemo, useEffect, type ChangeEventHandler } from "react";
import Modal from "@/modules/common/components/Modal";
import { Button2, Button2Variant, Button2ColorSchema } from "@/modules/common/components/Button2";
import Image from "next/image";
import type { ExternalApps, Upload } from "@prisma/client";
import { ImageUpload } from "@/modules/common/components/ImageUpload";
import clsx from "clsx";
import useUpload from "@/modules/common/utils/useUpload";
import { FaSpinner } from "react-icons/fa";

interface Props {
  value: string;
  onChange: (url: string) => void;
  uploads: Upload[];
  readonly externalApp?: ExternalApps & {
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

const InlineUploadButton = ({
  onUploaded,
  currentUrl,
}: {
  onUploaded: (url: string) => void;
  currentUrl: string;
}) => {
  const { setFile, upload, setUpload } = useUpload();
  const [isPending, setIsPending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!upload) return;

    fetch(`/api/upload/assign`, {
      method: "PATCH",
      body: JSON.stringify({
        resourceType: "ExternalApps",
        resourceId: "pending",
        resourceAttribute: "iconId",
        imageId: upload,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const publicUrl: string = data.url ?? data.item?.url ?? "";
        if (publicUrl) onUploaded(publicUrl);
      })
      .catch(console.error)
      .finally(() => {
        setUpload(null);
        setIsPending(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upload]);

  const changeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsPending(true);
    setFile(file);
  };

  const displayUrl = previewUrl ?? currentUrl ?? null;

  return (
    <div
      className={clsx(
        "relative mt-2 size-32 border border-neutral-700 hover:border-neutral-500",
        "text-neutral-500 hover:text-neutral-300 transition-colors group rounded-secondary",
        "flex items-center justify-center",
      )}
    >
      {displayUrl && !isPending ? (
        <Image
          src={displayUrl}
          alt="Vorschau"
          width={128}
          height={128}
          className="size-32 object-contain object-center"
          unoptimized
        />
      ) : isPending ? (
        <FaSpinner className="animate-spin text-brand-red-500" />
      ) : (
        <span className="text-xs text-center px-2">Bild hochladen</span>
      )}

      <input
        type="file"
        onChange={changeHandler}
        accept="image/*"
        disabled={isPending}
        className="absolute inset-0 cursor-pointer opacity-0 text-[0]"
      />
    </div>
  );
};

export const ImageSourcePicker = ({ value, onChange, uploads, externalApp }: Props) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

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
            {externalApp ? (
              // Edit-Modus: externalApp existiert → ImageUpload wie in OverviewTab
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
            ) : (
              <InlineUploadButton
                currentUrl={value}
                onUploaded={(url) => {
                  onChange(url);
                  close();
                }}
              />
            )}
          </label>

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
