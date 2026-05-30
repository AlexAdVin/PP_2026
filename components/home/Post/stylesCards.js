import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get("screen");

const CARD_HEIGHT = height * 0.2;
const CARD_WIDTH = width * 0.9;

const stylesCards = StyleSheet.create({

    card: {
        borderRadius: 10,
        marginLeft: width*0.05,
        height: CARD_HEIGHT,
        width: CARD_WIDTH,
        overflow: "hidden",
    },
    img:{
        width: "100%",
        height: "100%",
    },
    btnC: {
        position:"absolute",
        bottom:"4%", 
        width:"100%", 
        marginHorizontal:"10%", 
        alignSelf:"center"
    },
    postCard: {
        /* position:"absolute",  */
        /* bottom:"4%",  */
        marginLeft: width*0.03,
        width:CARD_WIDTH, 
        //marginHorizontal:"12%",
        padding:width*0.03, 
        backgroundColor:'rgba(0,0,0,0.6)',
        alignSelf:"center",
        //borderColor:"#fff",
        //borderWidth:1,
        borderRadius:10
    },
    cardTitle: {
        color:"#fff",
        fontSize: 18,
        fontWeight: "500",
        textTransform: 'uppercase',
        letterSpacing: -1,
    },
    cardDescription: {
        fontSize: 12,
        color: "#fff",
    },
    signIn: {
        padding: 12,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },

});

export default stylesCards;
