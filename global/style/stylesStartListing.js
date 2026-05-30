import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("screen");

const stylesStartListing = ({ COLORS }) =>
  StyleSheet.create({
    footerContainer: {
      width,
      flex: 1,
      justifyContent: "flex-end",
    },
    titleField: {
      color: COLORS.white,
      fontSize: 22,
      alignSelf: "flex-start",
    },
    titleFieldAlignment: {
      paddingHorizontal: width * 0.05,
      marginBottom: width * 0.03,
    },
    progressBar: {
      width: "100%",
      height: height * 0.008,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: "rgba(255,255,255,0.7)",
    },
    txtIncrementer: {
      paddingVertical: height * 0.02,
      color: "#fff",
      fontSize: 40,
      width: width * 0.5,
      textAlign: "center",
    },
    button: {
      backgroundColor: "rgba(0,0,0,0.4)",
      borderRadius: 50,
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontSize: 35,
      color: "white",
    },
  });

export default stylesStartListing;