"use client";

import { Button2, Button2Variant } from "@/modules/common/components/Button2";
import { useCreateContext } from "@/modules/common/components/CreateContext";
import { FaPlus } from "react-icons/fa";

export const CreateExternalAppsButton = () => {
  const { openCreateModal } = useCreateContext();

  return (
    <Button2
      variant={Button2Variant.Secondary}
      onClick={() => openCreateModal("externalApps")}
      title="Neuen External Apps"
    >
      <FaPlus />
      Externe App Hinzufügen
    </Button2>
  );
};
