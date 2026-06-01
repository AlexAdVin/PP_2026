import React, { useMemo, useState } from "react";
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Entypo, SimpleLineIcons } from "@expo/vector-icons";
import styles from "@/global/style/styles";
import stylesBtns from "@/global/style/stylesBtns";

const { width } = Dimensions.get("screen");

const chargerTypes = [
  { label: "Type 1", value: "TYPE1" },
  { label: "Type 2", value: "TYPE2" },
  { label: "CCS", value: "CCS_COMBO" },
  { label: "CHAdeMO", value: "CHADEMO" },
];

const chargerPowers = [4, 11, 22, 43, 50, 120, 175];

type FacilitiesSectionProps = {
  checkedLot: number;
  lotState: any[];
  handleChange: (lotIndex: number, key: string, value: any) => void;
  handleAvlChange: (
    lotIndex: number,
    entry: string,
    avlIndex: number,
    key: string,
    value: any,
    key2?: string,
    value2?: any,
  ) => void;
};

export default function FacilitiesSection({ checkedLot, lotState, handleChange, handleAvlChange }: FacilitiesSectionProps) {
  const [showPower, setShowPower] = useState(false);
  const lot = lotState?.[checkedLot];
  const charger = lot?.charger?.[0] ?? {};
  const selectedCharger = useMemo(() => chargerTypes.find((entry) => entry.value === charger.plugType), [charger.plugType]);

  return (
    <>
      <View style={[styles.fieldContainer, styles.fieldPadding]}>
        <Text style={[styles.txtFieldTitle, { marginBottom: width * 0.05 }]}>Chargers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
          {chargerTypes.map((entry) => {
            const selected = entry.value === charger.plugType;

            return (
              <TouchableOpacity
                key={entry.value}
                onPress={() => {
                  handleAvlChange(checkedLot, "charger", 0, "plugType", entry.value);
                  handleChange(checkedLot, "chargerBool", true);
                }}
                style={[
                  stylesBtns.optionBtn,
                  stylesBtns.glow,
                  {
                    backgroundColor: selected ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)",
                    shadowColor: selected ? "rgba(255,255,255,0.9)" : "#00000000",
                  },
                ]}
                activeOpacity={0.85}
              >
                <View style={localStyles.chargerOptionInner}>
                  <Text style={[stylesBtns.cardTitle, { color: selected ? "black" : "white" }]}>{entry.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {selectedCharger ? (
        <View style={[styles.fieldContainer, styles.fieldPadding, { width }]}> 
          <TouchableOpacity style={[styles.rowSpaceBAlignItem, { marginVertical: 20 }]} onPress={() => setShowPower(true)} activeOpacity={0.85}>
            <SimpleLineIcons name="energy" size={24} style={styles.txtInIcon} />
            <Text style={[styles.exText, { flex: 1 }]}>Rated power: {charger.power ? `${charger.power} kW` : "Select charging power"}</Text>
            <Entypo name="chevron-thin-right" size={18} color="#fff" style={{ marginRight: width * 0.05 }} />
          </TouchableOpacity>
        </View>
      ) : null}

      <Modal visible={showPower} transparent animationType="fade" onRequestClose={() => setShowPower(false)}>
        <View style={localStyles.modalBackdrop}>
          <View style={localStyles.modalCard}>
            <Text style={localStyles.modalTitle}>Charging power for Lot {lot?.lotNr ?? checkedLot + 1}</Text>
            <Text style={localStyles.modalSubtitle}>Select charging power</Text>

            <View style={localStyles.powerGrid}>
              {chargerPowers.map((power) => {
                const selected = Number(charger.power) === power;

                return (
                  <TouchableOpacity
                    key={`${power}`}
                    onPress={() => handleAvlChange(checkedLot, "charger", 0, "power", power)}
                    style={[localStyles.powerPill, selected && localStyles.powerPillSelected]}
                    activeOpacity={0.85}
                  >
                    <Text style={[localStyles.powerPillText, selected && localStyles.powerPillTextSelected]}>{power} kW</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Pressable onPress={() => setShowPower(false)} style={localStyles.modalAction}>
              <Text style={localStyles.modalActionText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const localStyles = StyleSheet.create({
  chargerOptionInner: {
    width: width * 0.23,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 18,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    alignSelf: "center",
    color: "#0F172A",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 18,
    marginTop: 8,
    marginBottom: 16,
    color: "#334155",
    textAlign: "center",
  },
  powerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  powerPill: {
    minWidth: 90,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.08)",
  },
  powerPillSelected: {
    backgroundColor: "#0F172A",
  },
  powerPillText: {
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "center",
  },
  powerPillTextSelected: {
    color: "#fff",
  },
  modalAction: {
    alignSelf: "center",
    marginTop: 20,
    backgroundColor: "#0F172A",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  modalActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});