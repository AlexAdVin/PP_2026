import { Dimensions, StyleSheet } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import HapticButton from '../HapticButton';
const { width, height } = Dimensions.get("screen");


const BackBtn = () => {
  const router = useRouter();

  return (
    <HapticButton onPress={() => router.back()}>
      <MaterialCommunityIcons name="chevron-left" size={38} color="#fff" style={stylesBackBtn.btnAlign} />
    </HapticButton>
  )
}

export default BackBtn


const stylesBackBtn = StyleSheet.create({
  btnAlign:{
    marginLeft:10
  }
})