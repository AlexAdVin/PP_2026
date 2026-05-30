import { Dimensions, Image, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import { useLocalSearchParams } from 'expo-router';

import LotsCarousel from '../../../components/lots/LotsCarousel';
import TimeReg from '../../../components/time/TimeReg';
import ListingTabs from '../../../components/booking/ListingTabs';
import FooterActionBar from '../../../components/footerNavs/FooterActionBar';
import AmenitiesList from '../../../components/booking/AmenitiesList';
import MoreLessComponent from '../../../components/booking/MoreLessComponent';
import BackBtn from '../../../components/btns/BackBtn';

const { width, height } = Dimensions.get("window");

const SURGE_CHARGE_RATE = 10.5;

const rulesText = 'The gate opens by inserting the 4 digit code. The code is received in the welcoming message, after the booking. FYI: There might be a dog in the yard, however peaceful.'
const descriptionText = 'Parking space outside the congestion zone within a secure gated area. The space is lit during night and a CCTV camera is mounted for security reasons. Please read the rules for access info!'

const PlaceDetail = () => {
  const { post } = useLocalSearchParams();
  const marker: any = JSON.parse(Array.isArray(post) ? post[0] : post);

  const coords = { lat: marker.lat, lng: marker.lng }

  console.log("PlaceDetail ---- route?.params?.post -->", marker)

  const lotsArray: any[] = marker.Lots.items;

  lotsArray.sort((a, b) => a.lotNr - b.lotNr);

  // Lots carousel states
  const [checkedLot, setCheckedLot] = useState<number>(lotsArray.length > 1 ? 1 : 0);

  const [aTab, setATab] = useState('Information')

  // Modal states
  const [showTPicker, setShowTPicker] = useState(false);



    return (

      <LinearGradient
        // Background Linear Gradient
        colors={['rgba(2, 165, 21, 0.78)', 'rgba(20,0,0,1)']}
        style={StyleSheet.absoluteFill}
      >

        <View style={styles.header}>
          <BackBtn />
        </View>

        <LotsCarousel checkedLot={checkedLot} setCheckedLot={setCheckedLot} lotState={marker} />

        <ListingTabs activeFooterTab={aTab} setFooterActiveTab={setATab} />

        {aTab === 'Information' && <>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentInset={{ top: 0, bottom: height * 0.1 }}>
            {/* Amenities */}
            <View style={[styles.fieldContainer, styles.fieldPadding]}>
              <Text style={styles.txtFieldTitle}>This place offers</Text>
              <AmenitiesList />
              <MoreLessComponent text={descriptionText} linesToTruncate={2} />
            </View>

            {/* Rules */}
            <View style={[styles.fieldContainer, styles.fieldPadding]}>
              <Text style={styles.txtFieldTitle}>Rules</Text>
              <MoreLessComponent text={rulesText} linesToTruncate={2} />
            </View>

            {/* Photos & Street view */}
            <View style={[styles.txtInC, { justifyContent: "space-evenly", marginBottom: width * 0.01 }]} >
              <TouchableOpacity style={{ borderColor: "white", borderWidth: 2, padding: width * 0.01, borderRadius: 7, margin: width * 0.05, }}>
                <Image source={{ uri: "https://img.freepik.com/premium-photo/car-near-house-modern-area-comfortable-housing-mortgage-parking-apartment-house-suburbs_114160-1649.jpg" }} style={{ opacity: 0.5, width: width * 0.35, height: width * 0.25, resizeMode: "cover", borderRadius: 7 }} />
              </TouchableOpacity>
              <TouchableOpacity style={{ borderColor: "white", borderWidth: 2, padding: width * 0.01, borderRadius: 7, margin: width * 0.05, }}>
                <Image source={{ uri: "https://img.freepik.com/premium-photo/car-near-house-modern-area-comfortable-housing-mortgage-parking-apartment-house-suburbs_114160-1649.jpg" }} style={{ opacity: 0.5, width: width * 0.35, height: width * 0.25, resizeMode: "cover", borderRadius: 7 }} />
              </TouchableOpacity>
            </View>

          </ScrollView>

          <Modal
            isVisible={showTPicker}
            onBackdropPress={() => setShowTPicker(false)}
            onBackButtonPress={() => setShowTPicker(false)}
            style={{ margin: 0, justifyContent: 'flex-end', alignItems: 'center' }}
            backdropOpacity={0.8}
            animationIn="fadeInUp"
            animationOut="fadeOutDown"
            useNativeDriver
          >
            <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', height: height * 0.65, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 20,  width: width }}>
              <View style={{ marginBottom: 5, flexDirection: "row", justifyContent: 'space-between', paddingHorizontal: 20 }} >
                <Text style={styles.titleModal}>Arrival & Duration</Text>
                <TouchableOpacity onPress={() => setShowTPicker(false)}>
                  <Text style={[styles.txtInIcon, { fontSize: 25, color: "#fff" }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <TimeReg setShowTF={setShowTPicker} />
            </View>
          </Modal>
        </>

        }

        <FooterActionBar setShowTPicker={setShowTPicker} checkedLot={checkedLot} marker={marker} />

      </LinearGradient>

    )

}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: height * 0.05,
    left: 10,
    zIndex: 10,
  },
  fieldContainer: {
    marginVertical: height * 0.02,
    marginHorizontal: width * 0.05,
  },
  fieldPadding: {
    padding: width * 0.03,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  txtFieldTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: height * 0.01,
  },
  txtInC: {
    alignItems: 'center',
  },
  titleModal: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  txtInIcon: {
    textAlign: 'center',
  },
});

export default PlaceDetail
