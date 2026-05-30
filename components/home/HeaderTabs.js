import { View, Text, TouchableOpacity,StyleSheet } from 'react-native'
import React, { useState } from 'react'

import stylesBtns from '../../global/style/stylesBtns'

export default function HeaderTabs({activeTab, setActiveTab}) {

  return (
    <View style={styles.cont}>
        <HeaderButton text="Parking" activeTab={activeTab} setActiveTab={setActiveTab}/>
        <HeaderButton text="Charging" activeTab={activeTab} setActiveTab={setActiveTab}/>
    </View>
  )
}

const HeaderButton = ({text, activeTab, setActiveTab}) => (
    <TouchableOpacity 
        onPress={() => setActiveTab(text)}
        style={[stylesBtns.btn, stylesBtns.glow,
            { 
                backgroundColor: text === activeTab ? "rgba(255,255,255,0.9)":"rgba(0,0,0,0.4)",
                shadowColor: text === activeTab ? 'rgba(255,255,255,0.9)' : "#00000000"
            }
        ]}
    >
        <Text style={[stylesBtns.cardTitle, { color: text === activeTab  ? "black":"white"}]}>{text}</Text>
    </TouchableOpacity>
)


const styles = StyleSheet.create({
    cont: {
        flexDirection: "row",
        justifyContent:"center"
    },
})
