import React, { useState } from "react";

import AuthFlowScreen from "@/components/auth/AuthFlowScreen";
import LiquidGlassModal from "@/components/modals/LiquidGlassModal";
import { useAuthStore } from "@/src/store/authStore";

export default function AuthModalHost() {
  const modalVisible = useAuthStore((state) => state.modalVisible);
  const modalReason = useAuthStore((state) => state.modalReason);
  const closeModal = useAuthStore((state) => state.closeModal);
  const [heightPercent, setHeightPercent] = useState(0.56);

  if (!modalVisible || !modalReason) {
    return null;
  }

  return (
    <LiquidGlassModal heightPercent={heightPercent} onClose={closeModal}>
      <AuthFlowScreen
        reason={modalReason}
        onClose={closeModal}
        onStepChange={(step, method) => {
          if (step === "choose") {
            setHeightPercent(0.56);
            return;
          }

          if (step === "verify") {
            setHeightPercent(0.48);
            return;
          }

          setHeightPercent(method === "phone" ? 0.6 : 0.44);
        }}
      />
    </LiquidGlassModal>
  );
}