import React, { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";

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
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={closeModal}
    >
      <View pointerEvents="box-none" style={styles.overlayHost}>
        <LiquidGlassModal heightPercent={heightPercent} onClose={closeModal}>
          <AuthFlowScreen
            reason={modalReason}
            onClose={closeModal}
            onStepChange={(step, method) => {
              if (step === "choose") {
                setHeightPercent(0.58);
                return;
              }

              if (step === "verify") {
                setHeightPercent(0.48);
                return;
              }

              if (method === "phone") {
                setHeightPercent(0.6);
                return;
              }

              if (method === "email") {
                setHeightPercent(0.68);
                return;
              }

              setHeightPercent(0.44);
            }}
          />
        </LiquidGlassModal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
});