import { StyleSheet, Dimensions } from "react-native";
const { height } = Dimensions.get("window");
export default StyleSheet.create({
  hero: { height: height * 0.38 },
  heroGradient: {
    flex: 1,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    paddingTop: 58,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  cityPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden",
    gap: 6,
  },
  cityText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  heroContent: { marginTop: 34 },
  heroEyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -1.3,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    lineHeight: 24,
    marginTop: 14,
    width: "90%",
  },
});
