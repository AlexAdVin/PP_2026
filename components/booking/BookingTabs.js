import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'

import stylesBtns from '../../global/style/stylesBtns';

export default function BookingTabs(props) {

    const time = props?.time;
    const duration = props?.duration;
    const headText1 = props?.headText1;
    const headText2 = props?.headText2;

  return (
      
    <View style={stylesBookingTabs.cont}>
        <ArrivalBtn text={headText1 ? headText1 : "Time of arrival"} time={time} btnColor="black" textColor="white" arrivalTab={props?.arrivalTab} setArrivalTab={props?.setArrivalTab}/>
        <ArrivalBtn text={headText2 ? headText2 : "Duration"} duration={duration} btnColor="white" textColor="black" arrivalTab={props?.arrivalTab} setArrivalTab={props?.setArrivalTab}/>
    </View>
  )
}

const ArrivalBtn = (props) => (

        <TouchableOpacity 
            onPress={() => (
                props.setArrivalTab(props.text), console.log(props.text, props.time, props.duration, props.arrivalTab)
                )}
            style={[stylesBtns.btn2, stylesBtns.glow,
                {flexGrow: props.text === props.arrivalTab ? 1 : 0} , 
                {
                    borderColor: props.text === props.arrivalTab ? "white" :"rgba(255,255,255,0.1)", 
                    backgroundColor: props.text === props.arrivalTab ? "rgba(255,255,255,0.6)" :"rgba(0,0,0,0.3)",
                    shadowColor: props.text === props.arrivalTab ? 'rgba(255,255,255,0.9)' : "#00000000",
                }

            ]}
        >

            <Text style={[stylesBtns.cardTitle, { color: props.text === props.arrivalTab  ? "black":"white"}]}>{props.text}</Text>
            <Text style={[stylesBookingTabs.text1, { color: props.text === props.arrivalTab  ? "black":"white"}]}>{props.time ? props.time : props.duration}</Text>

        </TouchableOpacity>        

)


const stylesBookingTabs = StyleSheet.create({
    text1: {alignSelf:"center", fontSize: 30},
    cont: {
        flexDirection: "row",
        justifyContent:"center"
    },
})
