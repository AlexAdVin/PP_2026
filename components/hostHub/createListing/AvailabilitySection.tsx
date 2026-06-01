import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Entypo } from "@expo/vector-icons";
import styles from "@/global/style/styles";
import stylesBtns from "@/global/style/stylesBtns";

const { width } = Dimensions.get("screen");
const EMPTY_AVAILABILITY: any[] = [];

type AvailabilitySectionProps = {
  checkedLot: number;
  lotState: any[];
  handleChange: (lotIndex: number, key: string, value: any) => void;
  handleAvlChange: (
    lotIndex: number,
    entry: string,
    avlIndex: number | string,
    key: string,
    value: any,
    key2?: string,
    value2?: any,
  ) => void;
};

const dayOptions = [
  { title: "Weekdays", subtitle: "Monday - Friday", target: "Weekdays" },
  { title: "Weekend", subtitle: "Saturday & Sunday", target: "Weekend" },
  { title: "Custom", subtitle: "Tap to edit", target: "Custom" },
];

const formatDateRange = (startDate: Date, endDate: Date) =>
  `${startDate.toLocaleString("en", { dateStyle: "medium" })} - ${endDate.toLocaleString("en", { dateStyle: "medium" })}`;

const formatTimeRange = (startDate: Date, endDate: Date) =>
  `${startDate.toLocaleString("en", { timeStyle: "short" })} - ${endDate.toLocaleString("en", { timeStyle: "short" })}`;

export default function AvailabilitySection({ checkedLot, lotState, handleChange, handleAvlChange }: AvailabilitySectionProps) {
  const lot = lotState?.[checkedLot];
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimerStart, setShowTimerStart] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const avlDates = lot?.avlDates ?? [];
  const startAvl = avlDates?.[0]?.startAvl ? new Date(avlDates[0].startAvl) : new Date();
  const endAvl = avlDates?.[1]?.endAvl ? new Date(avlDates[1].endAvl) : new Date();
  const avlDaysNTime = lot?.avlDaysNTime ?? EMPTY_AVAILABILITY;

  const weekdayEnabled = useMemo(() => avlDaysNTime.slice(0, 5).every((entry) => entry?.bool), [avlDaysNTime]);
  const weekendEnabled = useMemo(() => avlDaysNTime.slice(5).every((entry) => entry?.bool), [avlDaysNTime]);

  const handleDaySelect = (target: string) => {
    if (target === "Custom") {
      setShowTimerStart(true);
      return;
    }

    handleAvlChange(checkedLot, "avlDaysNTime", target, "bool", target === "Weekdays" ? !weekdayEnabled : !weekendEnabled);
  };

  return (
    <>
      <View style={[styles.fieldContainer, styles.fieldPadding, localStyles.switchCard]}>
        <View style={localStyles.switchCopy}>
          <Text style={localStyles.switchTitle}>Lot {lot?.lotNr ?? checkedLot + 1} availability</Text>
          <Text style={localStyles.switchSubtitle}>Pause only this lot while the rest of the listing stays live.</Text>
        </View>
        <Switch
          value={lot?.avlBool !== false}
          onValueChange={(value) => handleChange(checkedLot, "avlBool", value)}
          trackColor={{ false: "rgba(148,163,184,0.35)", true: "rgba(255,255,255,0.55)" }}
          thumbColor={lot?.avlBool !== false ? "#0F172A" : "#CBD5E1"}
        />
      </View>

      <View style={[styles.fieldContainer, styles.fieldPadding]}>
        <Text style={styles.txtFieldTitle}>Make this parking available to others</Text>
        <View style={stylesBtns.daySelectContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
            {dayOptions.map((option) => {
              const selected =
                option.target === "Weekdays" ? weekdayEnabled : option.target === "Weekend" ? weekendEnabled : false;

              return (
                <TouchableOpacity
                  key={option.target}
                  activeOpacity={0.85}
                  onPress={() => handleDaySelect(option.target)}
                  style={[
                    stylesBtns.optionBtn,
                    stylesBtns.glow,
                    {
                      backgroundColor: selected ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)",
                      shadowColor: selected ? "rgba(255,255,255,0.9)" : "#00000000",
                    },
                  ]}
                >
                  <View style={localStyles.dayOptionInner}>
                    <Text style={[stylesBtns.cardTitle, { color: selected ? "black" : "white" }]}>{option.title}</Text>
                    <Text style={{ color: selected ? "black" : "white", textAlign: "center" }}>{option.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <TouchableOpacity style={[styles.txtInC, { padding: width * 0.03 }]} onPress={() => setShowCalendar(true)} activeOpacity={0.85}>
        <View style={styles.txtInCFlex}>
          <Text style={localStyles.rowTitle}>Availability period</Text>
          <Text style={localStyles.rowSubtitle}>{formatDateRange(startAvl, endAvl)}</Text>
        </View>
        <Entypo name="chevron-thin-right" size={18} color="#fff" style={styles.chevIcon} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.txtInC, { padding: width * 0.025 }]} onPress={() => setShowTimerStart(true)} activeOpacity={0.85}>
        <View style={{ flex: 1 }}>
          <Text style={localStyles.rowTitle}>Start & end time</Text>
          <Text style={localStyles.rowSubtitle}>{formatTimeRange(startAvl, endAvl)}</Text>
        </View>
        <Entypo name="chevron-thin-right" size={18} color="#fff" style={styles.chevIcon} />
      </TouchableOpacity>

      <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
        <View style={localStyles.modalBackdrop}>
          <View style={localStyles.modalCard}>
            <Text style={localStyles.modalTitle}>Make this parking lot available to others</Text>
            {[0, 1].map((index) => {
              const currentValue = index === 0 ? startAvl : endAvl;
              const boolKey = index === 0 ? "boolStart" : "boolEnd";
              const fieldKey = index === 0 ? "startAvl" : "endAvl";

              return (
                <View key={fieldKey} style={localStyles.pickerBlock}>
                  <Text style={localStyles.pickerLabel}>{index === 0 ? "Start date" : "End date"}</Text>
                  <DateTimePicker
                    value={currentValue}
                    mode="date"
                    minimumDate={new Date()}
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={(_, nextDate) => {
                      if (!nextDate) {
                        return;
                      }

                      handleAvlChange(checkedLot, "avlDates", index, fieldKey, nextDate, boolKey, true);
                    }}
                  />
                </View>
              );
            })}

            <Pressable onPress={() => setShowCalendar(false)} style={localStyles.modalAction}>
              <Text style={localStyles.modalActionText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showTimerStart} transparent animationType="fade" onRequestClose={() => setShowTimerStart(false)}>
        <View style={localStyles.modalBackdrop}>
          <View style={localStyles.modalCard}>
            <Text style={localStyles.modalTitle}>Make this parking lot available to others</Text>

            <View style={localStyles.dayPillsRow}>
              {avlDaysNTime.map((entry, index) => (
                <TouchableOpacity
                  key={`${entry.day}-${index}`}
                  activeOpacity={0.85}
                  onPress={() => setSelectedDayIndex(index)}
                  style={[localStyles.dayPill, selectedDayIndex === index && localStyles.dayPillActive]}
                >
                  <Text style={[localStyles.dayPillText, selectedDayIndex === index && localStyles.dayPillTextActive]}>{entry.day.slice(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={localStyles.toggleRow}>
              <Text style={localStyles.pickerLabel}>Available on {avlDaysNTime[selectedDayIndex]?.day}</Text>
              <TouchableOpacity
                onPress={() =>
                  handleAvlChange(
                    checkedLot,
                    "avlDaysNTime",
                    selectedDayIndex,
                    "bool",
                    !(avlDaysNTime[selectedDayIndex]?.bool ?? false),
                  )
                }
                style={[localStyles.toggleButton, avlDaysNTime[selectedDayIndex]?.bool && localStyles.toggleButtonActive]}
              >
                <Text style={localStyles.toggleButtonText}>{avlDaysNTime[selectedDayIndex]?.bool ? "On" : "Off"}</Text>
              </TouchableOpacity>
            </View>

            <View style={localStyles.pickerBlock}>
              <Text style={localStyles.pickerLabel}>Start availability</Text>
              <DateTimePicker
                value={new Date(avlDaysNTime[selectedDayIndex]?.sT ?? new Date())}
                mode="time"
                display="spinner"
                is24Hour
                minuteInterval={15}
                onChange={(_, nextDate) => {
                  if (!nextDate) {
                    return;
                  }

                  handleAvlChange(checkedLot, "avlDaysNTime", selectedDayIndex, "sT", nextDate);
                }}
              />
            </View>

            <View style={localStyles.pickerBlock}>
              <Text style={localStyles.pickerLabel}>End availability</Text>
              <DateTimePicker
                value={new Date(avlDaysNTime[selectedDayIndex]?.eT ?? new Date())}
                mode="time"
                display="spinner"
                is24Hour
                minuteInterval={15}
                onChange={(_, nextDate) => {
                  if (!nextDate) {
                    return;
                  }

                  handleAvlChange(checkedLot, "avlDaysNTime", selectedDayIndex, "eT", nextDate);
                }}
              />
            </View>

            <Pressable onPress={() => setShowTimerStart(false)} style={localStyles.modalAction}>
              <Text style={localStyles.modalActionText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const localStyles = StyleSheet.create({
  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: width * 0.06,
  },
  switchCopy: {
    flex: 1,
    paddingRight: 16,
  },
  switchTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  switchSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  dayOptionInner: {
    width: width * 0.23,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    color: "#fff",
    marginLeft: width * 0.03,
    fontSize: 20,
  },
  rowSubtitle: {
    color: "rgba(255,255,255,0.6)",
    marginLeft: width * 0.03,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: "#1C2833",
    borderRadius: 20,
    paddingVertical: 16,
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 26,
    color: "rgba(255,255,255,0.78)",
    marginBottom: 12,
    marginHorizontal: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  pickerBlock: {
    backgroundColor: "rgba(255,255,255,0.95)",
    marginBottom: 12,
    paddingVertical: 8,
  },
  pickerLabel: {
    fontSize: 18,
    color: "#0F172A",
    marginHorizontal: 16,
    marginTop: 8,
    fontWeight: "600",
  },
  modalAction: {
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  modalActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  dayPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  dayPill: {
    minWidth: 54,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  dayPillActive: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  dayPillText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  dayPillTextActive: {
    color: "#0F172A",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  toggleButtonActive: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  toggleButtonText: {
    color: "#0F172A",
    fontWeight: "700",
  },
});