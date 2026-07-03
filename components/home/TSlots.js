import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'

import stylesBtns from '../../global/style/stylesBtns';
const { width, height } = Dimensions.get("screen");

const DEFAULT_OPTIONS = [15, 30, 45, 60, 120, 240];

function formatDurationLabel(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hr` : `${hours.toFixed(1)} hr`;
}

export default function TSlots({ tsTab, setTsTab, options = DEFAULT_OPTIONS }) {
  const durationOptions = Array.isArray(options) ? options : DEFAULT_OPTIONS;

  return (
    <View style={{ flexDirection: "row", paddingVertical: width * 0.05, justifyContent: "center", backgroundColor:"rgba(0,0,0,0.1)" }}>
      {durationOptions.map((minutes) => (
        <HeaderButton key={minutes} text={formatDurationLabel(minutes)} value={minutes} tsTab={tsTab} setTsTab={setTsTab} />
      ))}
      <HeaderButton text="Other" value="other" tsTab={tsTab} setTsTab={setTsTab} />
    </View>
  )
}

const HeaderButton = ({ text, value, tsTab, setTsTab }) => (
  <TouchableOpacity
    onPress={() => (setTsTab(value))}
    style={[stylesBtns.btn, stylesBtns.glow,
      { 
        backgroundColor: value === tsTab ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.4)",
        borderColor: value === tsTab ? "white" :"rgba(255,255,255,0.1)",
        shadowColor: value === tsTab ? 'rgba(255,255,255,0.9)' : "#00000000"
      }
    ]}
  >
    <Text style={[stylesBtns.cardTitle, { color: value === tsTab ? "black" : "white" }]}>{text}</Text>
  </TouchableOpacity>
)
