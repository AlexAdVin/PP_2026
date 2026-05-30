import { Dimensions, StyleSheet } from 'react-native'

const { width, height } = Dimensions.get('screen');


const stylesBtns = StyleSheet.create({
    // Tab
    btn: {
        padding:10, 
        paddingHorizontal:"5%", 
        marginHorizontal:"2%",
        borderRadius: 50,
    },
    // Booking tabs
    btn2: {
        padding:height*0.012, 
        paddingHorizontal:width*0.04,
        alignItems: 'center',
        borderTopWidth:1,
        borderBottomWidth:1
    },
    // Plug types css
/*     btn3: {
        padding:10,
        alignItems: 'center',
        marginRight:10, 
    }, */
    // Dayselect & charger btn
    optionBtn: {  
        alignItems:"center", 
        borderColor:"#fff", 
        borderWidth:2, 
        padding:width*0.09, 
        borderRadius:7,
        marginRight:width*0.02, 
        width:width*0.4,
      },
      // P-type btn
      optionBtnWide: {  
        flexDirection:"row",
        paddingHorizontal:width*0.05, 
        paddingVertical: height*0.02,
        marginTop: height*0.005,
        width:width*0.9,
      },
    // Glowing (just add shadowColor)
    glow: {
        zIndex:20,
        shadowOffset: {width: 0, height:0},
        shadowOpacity: 1,
        shadowRadius:8,
        shadowColor: 'rgba(255,255,255,0.9)'
    },
    // FooterBtn
    btn4: {
        height: 50,
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf:"center",
        width:width*0.9, 
        marginTop:height*0.02,
/*         shadowOffset: {width: 0, height:0},
        shadowOpacity: 1,
        shadowRadius:8,
        shadowColor: 'rgba(255,255,255,0.9)'  */
      },
    btn4Text:{
        fontWeight: "500", 
        fontSize: 20
    },
    // ListingTabs
    btn5: {
        paddingHorizontal:10,
        alignItems: 'center',
        flexDirection:"row",
        justifyContent:"center",
        height:width*0.15
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "500",
        textTransform: 'uppercase',
        letterSpacing: -1,
    },

    // Other

    // Top left back btn
    backBtn:{
        fontSize: 22, 
        color:"#fff",
    },
    favBtn:{
        marginRight:width*0.03
    },
    daySelectContainer: { 
        flexDirection: "row", 
        alignSelf: "center",
        marginTop:15
    },
    contentContainer: {
        flex:1, 
        flexDirection:"row", 
        alignItems:"center", 
        justifyContent:"space-between", 
        marginHorizontal:width*0.06
    },
    overlayStyle: {
        width,backgroundColor:'rgba(255,255,255,0.9)', 
        alignItems:"center", 
        borderRadius:20
    },
    errorText: {
        // Add your error text styles here
        color:"red"
    },
})



export default stylesBtns
