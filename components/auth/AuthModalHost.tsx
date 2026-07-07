import React, { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

import AuthFlowScreen from "./AuthFlowScreen";
import LiquidGlassModal from "@/components/modals/LiquidGlassModal";
import { useAuthStore } from "@/src/store/authStore";

export default function AuthModalHost() {
  const modalVisible = useAuthStore((state) => state.modalVisible);
  const modalReason = useAuthStore((state) => state.modalReason);
  const closeModal = useAuthStore((state) => state.closeModal);
  const [heightPercent, setHeightPercent] = useState(0.7);
  const [modalTitle, setModalTitle] = useState("Enter your email or phone");

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
        <LiquidGlassModal
          heightPercent={heightPercent}
          onClose={closeModal}
          titleSlot={<Text style={styles.modalTitle}>{modalTitle}</Text>}
        >
          <AuthFlowScreen
            reason={modalReason}
            onClose={closeModal}
            onTitleChange={setModalTitle}
            showTitle={false}
            onStepChange={(step) => {
              if (step === "entry") {
                setHeightPercent(0.72);
                return;
              }

              if (step === "verify") {
                setHeightPercent(0.58);
                return;
              }

              if (step === "profile-name") {
                setHeightPercent(0.56);
                return;
              }

              if (step === "password-fallback" || step === "password-setup") {
                setHeightPercent(0.68);
                return;
              }

              if (step === "success") {
                setHeightPercent(0.56);
                return;
              }

              setHeightPercent(0.62);
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
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
});