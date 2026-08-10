"use client";

import { registerExternalApp } from "@/modules/apps/actions/handleExternalApp";
import { CitizenInput } from "@/modules/citizen/components/CitizenInput";
import {
  Button2,
  Button2ColorSchema,
  Button2Variant,
} from "@/modules/common/components/Button2";
import { unstable_rethrow } from "next/navigation";
import { useActionState, useId, useState } from "react";
import toast from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";

interface ExternalAppInitialValues {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  imageSrc?: string;
  tags?: string[];
  team?: string[];
  url?: string;
}

interface Props {
  readonly className?: string;
  readonly initial?: ExternalAppInitialValues;
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

export const CreateExternalAppsForm = ({
  className,
  initial,
  onSuccess,
}: Props) => {
  const nameId = useId();
  const slugId = useId();
  const descriptionId = useId();
  const iconId = useId();
  const imageSrcId = useId();
  const tagsId = useId();
  const urlId = useId();

  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));

  const [, formAction, isPending] = useActionState(
    async (previousState: unknown, formData: FormData) => {
      formData.set(
        "tags",
        JSON.stringify(
          tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      );

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

      <div>
        <label className="block" htmlFor={iconId}>
          Icon
        </label>
        <input
          id={iconId}
          name="icon"
          defaultValue={initial?.icon}
          placeholder="z. B. FaAppStore"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block" htmlFor={imageSrcId}>
          Bild-URL
        </label>
        <input
          id={imageSrcId}
          name="imageSrc"
          defaultValue={initial?.imageSrc}
          style={inputStyle}
        />
      </div>

      {/* CitizenInput renders its own hidden team[] inputs per selected
          citizen and submits directly as part of the native FormData. */}
      <CitizenInput name="team" multiple defaultValue={initial?.team} />

      <div>
        <label className="block" htmlFor={tagsId}>
          Tags
        </label>
        <input
          id={tagsId}
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="tag1, tag2, …"
          style={inputStyle}
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
