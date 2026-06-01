import React from "react";
import { View } from "react-native";
import CreateListingTabs from "@/components/hostHub/createListing/CreateListingTabs";
import AvailabilitySection from "@/components/hostHub/createListing/AvailabilitySection";
import FacilitiesSection from "@/components/hostHub/createListing/FacilitiesSection";

type LotSettingsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
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

export default function LotSettings({
  activeTab,
  setActiveTab,
  checkedLot,
  lotState,
  handleChange,
  handleAvlChange,
}: LotSettingsProps) {
  return (
    <View>
      <CreateListingTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "Availability" ? (
        <AvailabilitySection checkedLot={checkedLot} lotState={lotState} handleAvlChange={handleAvlChange} />
      ) : null}

      {activeTab === "Facilities" ? (
        <FacilitiesSection checkedLot={checkedLot} lotState={lotState} handleChange={handleChange} handleAvlChange={handleAvlChange} />
      ) : null}
    </View>
  );
}