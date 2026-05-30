import { Dimensions, StyleSheet } from 'react-native'

const { width, height } = Dimensions.get('screen');
const TOP_HEADER_HIGHT = height * 0.25

const ITEM_SIZE = width * 0.38;
const ITEM_SPACING = (width - ITEM_SIZE) / 2;


const styles = StyleSheet.create({
    //SearchBarComponent
    textInputContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        borderRadius: 50,
        flexDirection: 'row',
        justifyContent: 'space-between'
      },
      textInputSearch: {
        backgroundColor: 'transparent',
        color: '#fff',
        fontWeight: '500',
        padding: width*0.032,
        fontSize: 18,
        marginTop: 7,
        flex: 1,
      },
      predefinedPlacesDescription: {
        color: '#1faadb',
      },
      cardTitle: {
        fontSize: 16,
      },
    // Layouts
    rowSpaceBAlignItem:{
        flexDirection:"row", justifyContent:"space-between", alignItems: 'center'
    },
    detailImg:{
        height: TOP_HEADER_HIGHT,
        width: "100%",
        alignSelf: "center",
    },
    exText:{
        color:"#fff", 
        padding:width*0.025, 
        fontSize:19
    },
    viewCss:{
        marginTop: 15,
        flexDirection: "row",
    },
    separator:{
        borderTopWidth:StyleSheet.hairlineWidth, 
        borderTopColor: "lightgray"
    },
    cont: {
        flex:1,
        justifyContent:'center',
        marginHorizontal:15,
    },


    // This only works on iOS
    datePicker: {
        width: 220,
        height: 180,
        alignSelf: 'center',
        //backgroundColor: '#F76A6A',
    },
    heading: {
        fontSize: 34,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: -1,
    },
    headingContainer:{
        paddingTop:height*0.1, 
        paddingHorizontal:width*0.05, 
        width,
    },
    headerCss: {
        padding: width*0.04,
        zIndex:50,
    },
    body: {
        fontSize: 20,
        lineHeight: 20 * 1.5,
        textAlign: 'center',
    },
    barComp: {
        height: 60,
        width: 60,
        marginTop: -5,
    },

    // INPUT fields
    fieldContainer:{
        backgroundColor:"rgba(0,0,0,0.1)",
        marginBottom:width*0.01,
        width
    },
    fieldPadding: { 
        paddingVertical:width*0.04, 
        paddingLeft:width*0.06 
    },
    txtFieldTitle: {
        color:"#fff", 
        fontSize:18, //20 , 
        marginBottom:height*0.005, 
        //fontWeight:"600"
    },
    txtInIcon: {
        paddingVertical:height*0.02, 
        color:"#fff", 
        marginLeft: width*0.05
    },


    // One line chevron navigation icon-text-icon
    titleIn: {
        color:"#fff", 
        padding:width*0.03, 
        marginLeft:width*0.02, 
        fontSize:18 //20 
    },
    txtInC: {
        backgroundColor: "rgba(0,0,0,0.1)",
        flexDirection:"row",
        marginBottom:height*0.006,
        padding:width*0.01, 
        alignItems:"center",
    },
    txtInput: {
        paddingVertical:height*0.02, 
        color:"#fff", 
        fontSize:18, 
        marginLeft:width*0.025, 
        flex:1,
    },
    chevIcon: {
        marginRight:width*0.05,
        color:"#fff", 
    },    
   

    // Multi line chevron navigation icon-text-icon
    txtInCFlex:{
        flex:1
    }, 
    txtMultiInfo: {
        color:"#fff", 
        marginLeft:width*0.025, 
        fontSize:18
    },
    txtMultiSubInfo:{
        color:"rgba(255,255,255,0.6)", 
        marginLeft:width*0.025
    },
    txtMultiIcon:{
        paddingVertical:height*0.015, 
        color:"#fff", 
        marginLeft: width*0.04
    },



    // Modal
    titleModal: {
        fontSize: 22,
        fontWeight: "400",
        paddingVertical:10,
        alignSelf:"center",
        flex:1,
        color:"#fff", 
        marginLeft:width*0.03
      },
    elemLayout:{ 
        //borderRadius:30,
        borderLeftWidth:4,
        //borderRightWidth:4, 
        borderColor:"#fff", 
        padding:3, 
        paddingLeft:20,
        paddingRight:10,
        backgroundColor: 1 ? "rgba(255,255,255,0.2)":"rgba(0,0,0,0.1)",
      },
      inLayout:{ 
        width: "50%", 
        backgroundColor:"rgba(255,255,255,0.2)", 
        borderLeftWidth:3, 
        borderColor:"white",
        alignItems:"flex-end"
      },
      indicator: {
        height: 10,
        width: 15,
        backgroundColor: 'grey',
        marginHorizontal: 3,
        borderRadius: 10,
      },
      image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    profileImg: {
        height: 80, 
        width: 80, 
        borderRadius: 40,
        marginBottom: 10
    },
    profileText: {
        color: '#fff',
        fontSize: 22,
        marginBottom: 5,
    },






    container: {
        flex: 1,
        //backgroundColor:"blue"
      },
      inner: {
        padding: width*0.09,
        ...StyleSheet.absoluteFillObject,
        //flex: 1,
        //justifyContent: "space-evenly",
        //backgroundColor:"white",
        alignItems:"center"
      },
/*       header: {
        fontSize: 36,
        marginBottom: 48
      }, */
      textInput: {
        height: 40,
        borderColor: "#000000",
        borderBottomWidth: 1,
        marginBottom: 36,
      },
      btnContainer: {
        backgroundColor: "white",
        marginTop: 12
      }
})



export default styles
