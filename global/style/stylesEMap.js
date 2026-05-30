import { Dimensions, StyleSheet } from 'react-native'

const { width, height } = Dimensions.get('screen');
const TOP_HEADER_HIGHT = height * 0.25

const ITEM_SIZE = width * 0.38;
const ITEM_SPACING = (width - ITEM_SIZE) / 2;


const stylesEMap = StyleSheet.create({
    carouselView: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 10,
        marginBottom: 20,
        zIndex: 100
      },
})



export default stylesEMap
