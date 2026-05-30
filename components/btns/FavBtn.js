import { TouchableOpacity, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics';

import stylesBtns from '../../global/style/stylesBtns';
const { width, height } = Dimensions.get("screen");


const FavBtn = () => {

  const [fav, setFav] = useState(false);

  const addToFavs = () => {
    setFav(!fav);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  };

  return (
    <TouchableOpacity onPress={addToFavs}  style={stylesBtns.favBtn} >
      <MaterialCommunityIcons name={`${!fav ? "cards-heart-outline":"cards-heart"}`} size={26} color="#fff"/>
    </TouchableOpacity>
  )
}

export default FavBtn
