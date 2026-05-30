import {  StyleSheet, View, Text, FlatList, Dimensions} from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('screen');

const amenities = [
  {
    id: 0,
    iN:"garage-open-variant",
    d: "Car port"
  },
  {
    id: 1,
    iN:"garage-variant-lock",
    d: "Locked garage"
  },
  {
    id: 2,
    iN:"garage-variant",
    d: "Heated garage"
  },
{
  id: 3,
  iN:"garage-open-variant",
  d: "Video Camera"
},
{
  id: 4,
  iN:"arrow-expand-horizontal",
  d: "Truck wide"
},
{
  id: 5,
  iN:"shield-car",
  d: "Security protection"
},
{
  id: 6,
  iN:"lightbulb-on",
  d: "Iluminated"
},
{
  id: 7,
  iN:"boom-gate-arrow-up",
  d: "Boom-gate"
},
{
  id: 8,
  iN:"gate",
  d: "Gate"
},
]


  export default function AmenitiesList() {

  return (

    <View style={[ {flexDirection: "row", alignSelf: "center", marginTop:height*0.01, marginRight:width*0.06}]}>

      <FlatList 
        showsHorizontalScrollIndicator={false}
        horizontal
        data={amenities}
        keyExtractor={( item ) => item.id.toString()}
        bounces={false}
        maxToRenderPerBatch={3}
        renderItem={({item: {iN, d}, index}) => (

          <View style={{ alignItems:"center", backgroundColor:"rgba(0,0,0,0.2)", padding:width*0.02, borderRadius:7,marginRight:width*0.03, width:width*0.3}}>
            <MaterialCommunityIcons name={iN} size={40} color="rgba(255,255,255,0.7)" />
            <Text numberOfLines={1} style={{  color:"rgba(255,255,255,0.7)"}}>{d}</Text>
          </View>

        )}
      />
    </View>
  )
}