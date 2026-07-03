import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'

import stylesBtns from '../../global/style/stylesBtns';
const { width, height } = Dimensions.get("screen");

export default function TSlots({ tsTab, setTsTab }) {

  return (
    <View style={{ flexDirection: "row", paddingVertical: width * 0.05, justifyContent: "center", backgroundColor:"rgba(0,0,0,0.1)" }}>
      <HeaderButton text="1 hr" value={1} tsTab={tsTab} setTsTab={setTsTab} />
      <HeaderButton text="2 hr" value={2} tsTab={tsTab} setTsTab={setTsTab} />
      <HeaderButton text="4 hr" value={4} tsTab={tsTab} setTsTab={setTsTab} />
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
