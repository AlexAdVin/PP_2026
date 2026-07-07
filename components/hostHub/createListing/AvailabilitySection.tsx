import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
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
import LiquidGlassModal from "@/components/modals/LiquidGlassModal";
import styles from "@/global/style/styles";

const { width } = Dimensions.get("screen");
const EMPTY_AVAILABILITY: any[] = [];
const DEFAULT_END_MONTHS = 12;

type AvailabilityDayEntry = {
  day: string;
  bool?: boolean;
  sT?: Date | string;
  eT?: Date | string;
};

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

const formatDateRange = (startDate: Date, endDate: Date) =>
  `${startDate.toLocaleString("en", { dateStyle: "medium" })} - ${endDate.toLocaleString("en", { dateStyle: "medium" })}`;

const formatTimeRange = (startDate: Date, endDate: Date) =>
  `${startDate.toLocaleString("en", { timeStyle: "short" })} - ${endDate.toLocaleString("en", { timeStyle: "short" })}`;

const addMonthsToDate = (date: Date, months: number) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const isSameDay = (firstDate: Date, secondDate: Date) =>
  firstDate.getFullYear() === secondDate.getFullYear()
  && firstDate.getMonth() === secondDate.getMonth()
  && firstDate.getDate() === secondDate.getDate();

export default function AvailabilitySection({ checkedLot, lotState, handleChange, handleAvlChange }: AvailabilitySectionProps) {
  const lot = lotState?.[checkedLot];
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimerStart, setShowTimerStart] = useState(false);
  const [isCustomEndDateEnabled, setIsCustomEndDateEnabled] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const avlDates = useMemo(() => lot?.avlDates ?? EMPTY_AVAILABILITY, [lot?.avlDates]);
  const startAvl = useMemo(() => (avlDates?.[0]?.startAvl ? new Date(avlDates[0].startAvl) : new Date()), [avlDates]);
  const defaultEndAvl = useMemo(() => addMonthsToDate(startAvl, DEFAULT_END_MONTHS), [startAvl]);
  const endAvl = useMemo(() => (avlDates?.[1]?.endAvl ? new Date(avlDates[1].endAvl) : defaultEndAvl), [avlDates, defaultEndAvl]);
  const avlDaysNTime = lot?.avlDaysNTime ?? EMPTY_AVAILABILITY;

  const weekdayEnabled = useMemo(() => avlDaysNTime.slice(0, 5).every((entry: AvailabilityDayEntry) => entry?.bool), [avlDaysNTime]);
  const weekendEnabled = useMemo(() => avlDaysNTime.slice(5).every((entry: AvailabilityDayEntry) => entry?.bool), [avlDaysNTime]);
  const usesAutomaticEndDate = useMemo(() => isSameDay(endAvl, defaultEndAvl), [defaultEndAvl, endAvl]);
  const availabilitySummary = useMemo(() => {
    if (usesAutomaticEndDate) {
      return `Starts ${startAvl.toLocaleString("en", { dateStyle: "medium" })} • Auto-ends ${endAvl.toLocaleString("en", { dateStyle: "medium" })}`;
    }

    return formatDateRange(startAvl, endAvl);
  }, [endAvl, startAvl, usesAutomaticEndDate]);

  useEffect(() => {
    if (!showCalendar) {
      return;
    }

    setIsCustomEndDateEnabled(!usesAutomaticEndDate);
  }, [showCalendar, usesAutomaticEndDate, checkedLot]);

  const syncStartDate = (nextDate: Date) => {
    const normalizedStartDate = new Date(nextDate);
    const nextEndDate = isCustomEndDateEnabled
      ? (endAvl < normalizedStartDate ? normalizedStartDate : endAvl)
      : addMonthsToDate(normalizedStartDate, DEFAULT_END_MONTHS);

    handleAvlChange(checkedLot, "avlDates", 0, "startAvl", normalizedStartDate, "boolStart", true);

    if (!isSameDay(nextEndDate, endAvl)) {
      handleAvlChange(checkedLot, "avlDates", 1, "endAvl", nextEndDate, "boolEnd", true);
    }
  };

  const handleEndDateToggle = (enabled: boolean) => {
    setIsCustomEndDateEnabled(enabled);

    if (!enabled) {
      handleAvlChange(checkedLot, "avlDates", 1, "endAvl", defaultEndAvl, "boolEnd", true);
    }
  };

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
    {/* Availability period */}
      <TouchableOpacity style={[styles.txtInC, { padding: width * 0.03 }]} onPress={() => setShowCalendar(true)} activeOpacity={0.85}>
        <View style={styles.txtInCFlex}>
          <Text style={localStyles.rowTitle}>Availability period</Text>
          <Text style={localStyles.rowSubtitle}>{availabilitySummary}</Text>
        </View>
        <Entypo name="chevron-thin-right" size={18} color="#fff" style={styles.chevIcon} />
      </TouchableOpacity>

    {/* Start & end time */}
      <TouchableOpacity style={[styles.txtInC, { padding: width * 0.025 }]} onPress={() => setShowTimerStart(true)} activeOpacity={0.85}>
        <View style={{ flex: 1 }}>
          <Text style={localStyles.rowTitle}>Start & end time</Text>
          <Text style={localStyles.rowSubtitle}>{formatTimeRange(startAvl, endAvl)}</Text>
        </View>
        <Entypo name="chevron-thin-right" size={18} color="#fff" style={styles.chevIcon} />
      </TouchableOpacity>

      <LiquidGlassModal
        visible={showCalendar}
        useNativeModal
        heightPercent={0.84}
        onClose={() => setShowCalendar(false)}
        onBackdropPress={() => setShowCalendar(false)}
        titleSlot={(
          <View style={localStyles.modalHeader}>
            <Text style={localStyles.modalEyebrow}>Availability period</Text>
            <Text style={localStyles.modalTitle}>Choose when this lot first goes live</Text>
            <Text style={localStyles.modalSubtitle}>The start date is the primary control. By default, the end date stays one year ahead and automatically follows any start-date change.</Text>
          </View>
        )}
      >
        <ScrollView style={localStyles.modalScroll} contentContainerStyle={localStyles.modalScrollContent} showsVerticalScrollIndicator={false}>
          <View style={localStyles.summaryCard}>
            <View style={localStyles.summaryBlock}>
              <Text style={localStyles.summaryLabel}>Start</Text>
              <Text style={localStyles.summaryValue}>{startAvl.toLocaleString("en", { dateStyle: "medium" })}</Text>
            </View>
            <View style={localStyles.summaryDivider} />
            <View style={localStyles.summaryBlock}>
              <Text style={localStyles.summaryLabel}>End</Text>
              <Text style={localStyles.summaryValue}>{endAvl.toLocaleString("en", { dateStyle: "medium" })}</Text>
              <Text style={localStyles.summaryMeta}>{usesAutomaticEndDate && !isCustomEndDateEnabled ? "Auto-updating" : "Customizable"}</Text>
            </View>
          </View>

          <View style={localStyles.pickerCard}>
            <Text style={localStyles.pickerCardTitle}>Start date</Text>
            <Text style={localStyles.pickerCardSubtitle}>Bookings can begin from this day onward.</Text>
            <DateTimePicker
              value={startAvl}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              onChange={(_, nextDate) => {
                if (!nextDate) {
                  return;
                }

                syncStartDate(nextDate);
              }}
            />
          </View>

          <View style={localStyles.autoEndCard}>
            <View style={localStyles.autoEndCopy}>
              <Text style={localStyles.autoEndTitle}>Default end date</Text>
              <Text style={localStyles.autoEndBody}>The lot is set to end after {DEFAULT_END_MONTHS} months and automatically rolls forward whenever the start date changes.</Text>
            </View>
            <Switch
              value={isCustomEndDateEnabled}
              onValueChange={handleEndDateToggle}
              trackColor={{ false: "rgba(148,163,184,0.35)", true: "rgba(15,23,42,0.32)" }}
              thumbColor={isCustomEndDateEnabled ? "#0F172A" : "#E2E8F0"}
            />
          </View>

          <Text style={localStyles.customizeHint}>{isCustomEndDateEnabled ? "Custom end date enabled" : "Turn this on only if the lot should stop being bookable before the rolling one-year window."}</Text>

          {isCustomEndDateEnabled ? (
            <View style={localStyles.pickerCard}>
              <Text style={localStyles.pickerCardTitle}>Custom end date</Text>
              <Text style={localStyles.pickerCardSubtitle}>Use this only when the lot should stop being available on a specific day.</Text>
              <DateTimePicker
                value={endAvl < startAvl ? startAvl : endAvl}
                mode="date"
                minimumDate={startAvl}
                display={Platform.OS === "ios" ? "inline" : "calendar"}
                onChange={(_, nextDate) => {
                  if (!nextDate) {
                    return;
                  }

                  handleAvlChange(checkedLot, "avlDates", 1, "endAvl", nextDate, "boolEnd", true);
                }}
              />
            </View>
          ) : null}

          <Pressable onPress={() => setShowCalendar(false)} style={localStyles.modalAction}>
            <Text style={localStyles.modalActionText}>Done</Text>
          </Pressable>
        </ScrollView>
      </LiquidGlassModal>

      <LiquidGlassModal
        visible={showTimerStart}
        useNativeModal
        heightPercent={0.82}
        onClose={() => setShowTimerStart(false)}
        onBackdropPress={() => setShowTimerStart(false)}
        titleSlot={(
          <View style={localStyles.modalHeader}>
            <Text style={localStyles.modalEyebrow}>Weekly availability</Text>
            <Text style={localStyles.modalTitle}>Tune the hours for each day</Text>
            <Text style={localStyles.modalSubtitle}>Choose the days this lot can be booked and refine the time range for the selected day.</Text>
          </View>
        )}
      >
        <ScrollView style={localStyles.modalScroll} contentContainerStyle={localStyles.modalScrollContent} showsVerticalScrollIndicator={false}>
          <View style={localStyles.quickPresetRow}>
            {[
              { label: "Weekdays", active: weekdayEnabled },
              { label: "Weekend", active: weekendEnabled },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.85}
                onPress={() => handleDaySelect(item.label)}
                style={[localStyles.quickPresetPill, item.active && localStyles.quickPresetPillActive]}
              >
                <Text style={[localStyles.quickPresetText, item.active && localStyles.quickPresetTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={localStyles.dayPillsRow}>
            {avlDaysNTime.map((entry: AvailabilityDayEntry, index: number) => (
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

          <View style={localStyles.toggleRowCard}>
            <View style={localStyles.toggleCopy}>
              <Text style={localStyles.pickerCardTitle}>Available on {avlDaysNTime[selectedDayIndex]?.day}</Text>
              <Text style={localStyles.pickerCardSubtitle}>Turn this day off without changing the rest of the week.</Text>
            </View>
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
              <Text style={[localStyles.toggleButtonText, avlDaysNTime[selectedDayIndex]?.bool && localStyles.toggleButtonTextActive]}>
                {avlDaysNTime[selectedDayIndex]?.bool ? "On" : "Off"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={localStyles.pickerCard}>
            <Text style={localStyles.pickerCardTitle}>Start availability</Text>
            <Text style={localStyles.pickerCardSubtitle}>Choose when bookings can begin on the selected day.</Text>
            <DateTimePicker
              value={new Date(avlDaysNTime[selectedDayIndex]?.sT ?? new Date())}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
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

          <View style={localStyles.pickerCard}>
            <Text style={localStyles.pickerCardTitle}>End availability</Text>
            <Text style={localStyles.pickerCardSubtitle}>Choose when bookings should stop on the selected day.</Text>
            <DateTimePicker
              value={new Date(avlDaysNTime[selectedDayIndex]?.eT ?? new Date())}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
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
        </ScrollView>
      </LiquidGlassModal>
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
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  modalHeader: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  modalEyebrow: {
    color: "rgba(15,23,42,0.52)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 29,
    color: "#0F172A",
    marginBottom: 8,
    fontWeight: "700",
    letterSpacing: -0.9,
  },
  modalSubtitle: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 22,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "rgba(255,255,255,0.52)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.78)",
    marginTop: 10,
    marginBottom: 14,
  },
  summaryBlock: {
    flex: 1,
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.45,
    marginBottom: 6,
  },
  summaryValue: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
  },
  summaryMeta: {
    color: "#475569",
    fontSize: 12,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(148,163,184,0.28)",
    marginHorizontal: 16,
  },
  pickerCard: {
    backgroundColor: "rgba(255,255,255,0.66)",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    marginBottom: 14,
  },
  pickerCardTitle: {
    fontSize: 18,
    color: "#0F172A",
    fontWeight: "700",
  },
  pickerCardSubtitle: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  autoEndCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
  },
  autoEndCopy: {
    flex: 1,
    paddingRight: 16,
  },
  autoEndTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "700",
  },
  autoEndBody: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  customizeHint: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 14,
    marginHorizontal: 8,
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
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: "#0F172A",
    paddingHorizontal: 34,
    paddingVertical: 14,
    borderRadius: 999,
  },
  modalActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  quickPresetRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  quickPresetPill: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.44)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.74)",
  },
  quickPresetPillActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  quickPresetText: {
    color: "#0F172A",
    fontWeight: "700",
  },
  quickPresetTextActive: {
    color: "#FFFFFF",
  },
  dayPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  dayPill: {
    minWidth: 54,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.46)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },
  dayPillActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  dayPillText: {
    color: "#0F172A",
    textAlign: "center",
    fontWeight: "600",
  },
  dayPillTextActive: {
    color: "#FFFFFF",
  },
  toggleRowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
  },
  toggleCopy: {
    flex: 1,
    paddingRight: 12,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.08)",
  },
  toggleButtonActive: {
    backgroundColor: "#0F172A",
  },
  toggleButtonText: {
    color: "#0F172A",
    fontWeight: "700",
  },
  toggleButtonTextActive: {
    color: "#FFFFFF",
  },
});