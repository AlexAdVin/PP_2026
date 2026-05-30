import {View, Text, Pressable, TouchableOpacity, StyleSheet} from 'react-native';

import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import styles from '../../../global/style/styles';
import stylesBtns from '../../../global/style/stylesBtns';

import FavBtn from '../../btns/FavBtn';
import stylesCards from './stylesCards';


const PostCard = ({ post, parkingFee, setSelPostId}) => {

  const router = useRouter();

  const SURGE_CHARGE_RATE = post.dyPrice ? 10.5 : 10;

  return (

        <View style={stylesCards.postCard}>

          <View style={[stylesPostCard.rowSpaceBAlignItem,{marginBottom:10}]}>
            <Text onPress={() => setSelPostId(null)} style={stylesBtns.backBtn}> ✕ </Text>
            <FavBtn />          
          </View>

          <View style={ { flexDirection:'row' }}>
            <Text numberOfLines={1} style={[stylesCards.cardTitle, {flex:1}]}>{post.locName}</Text>
            <Text style={stylesCards.cardTitle}> 

            { new Intl.NumberFormat('da', {
              style: "currency",
              currency: "DKK"
            }).format(
              post.newPrice || parkingFee * SURGE_CHARGE_RATE / 10
            ) + "/ hr." }
              
            </Text>
          </View>
          
          {/* <StarRating ratings={post.ratings} reviews={post.reviews} type={post.type}/> */}
          <Text numberOfLines={1} style={stylesCards.cardDescription}>Available Daily • 08:00 - 16:00</Text>

          <View style={{ marginTop: 5, flexDirection:'row', justifyContent:'space-between' }}> 
            <Pressable
              hitSlop={10}
              onPress={() => { router.push({ pathname: '/driver/placeDetail', params: { post: JSON.stringify(post) } })}}
              style={[stylesCards.signIn, { alignSelf: 'stretch', width: "70%", backgroundColor:'rgba(255,255,255,0.3)'}]}
            >
              <Text style={[stylesCards.cardTitle, {color:'#fff'}]}>Book now</Text> 
            </Pressable>

            <Pressable
              hitSlop={10}
              onPress={() => { router.push('/driver/planning')}}
              style={[stylesCards.signIn, { backgroundColor:'rgba(0,0,0,0.4)'}]}
            >
              <View style={{flexDirection:"row", alignItems:"center" }}>
                  <AntDesign name="clockcircle" size={16} color={"white"} style={{marginRight:6}} />
                  <Text style={[stylesCards.cardTitle, {color:'#fff'}]}>Plan</Text> 
              </View>
            </Pressable>
          </View>    

        </View>

  );
};

export default PostCard;


const stylesPostCard = StyleSheet.create({
      rowSpaceBAlignItem:{
        flexDirection:"row", justifyContent:"space-between",alignItems: 'center'
    },
});