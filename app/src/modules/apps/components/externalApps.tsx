"use client";

import Modal from "@/modules/common/components/Modal";
import { useState } from "react";
import { Button2, Button2Variant, Button2ColorSchema } from "@/modules/common/components/Button2";


export const AddAppModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    icon: "",
    imageSrc: "",
    tags: "",
    url: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    await externalapps({
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()),
    });
    setIsOpen(false);
    setForm({ name: "", slug: "", icon: "", imageSrc: "", tags: "", url: "" });
  };

  const fields: { label: string; name: keyof typeof form; placeholder?: string }[] = [
    { label: "Name",      name: "name",     placeholder: "My App" },
    { label: "Slug",      name: "slug",     placeholder: "my-app" },
    { label: "Icon",      name: "icon",     placeholder: "🚀 or icon class" },
    { label: "Image Src", name: "imageSrc", placeholder: "https://..." },
    { label: "Tags",      name: "tags",     placeholder: "tag1, tag2" },
    { label: "URL",       name: "url",      placeholder: "https://..." },
  ];

  return (
    <>
      <Button2
        variant={Button2Variant.Primary}
        colorSchema={Button2ColorSchema.Interaction}
        onClick={() => setIsOpen(true)}
      >
        Add External App
      </Button2>

      <Modal
        heading="Add External App"
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "400px" }}>
          {fields.map(({ label, name, placeholder }) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#9ca3af" }}>
                {label}
              </label>
              <input
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                style={{
                  padding: "8px 10px", borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white", fontSize: "14px", outline: "none",
                }}
              />
            </div>
          ))}

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
    </>
  );
};