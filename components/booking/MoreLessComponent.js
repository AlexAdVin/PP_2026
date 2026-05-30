import { useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
const { width, height } = Dimensions.get("window");

const MoreLessComponent = ({ text, linesToTruncate }) => {
    const [more, setMore] = useState(false);
    return (

      <TouchableOpacity style={{flexDirection:"column"}} onPress={() => setMore(previousState => !previousState)}>
        <View style={{ flexDirection:"row", marginRight:width*0.04, marginTop:width*0.03}}>
          <Text style={{color:"#fff", fontSize:16 }} numberOfLines={more ? 0:linesToTruncate} ellipsizeMode={'tail'}
          >
            {text}
          </Text>  
        </View>    
        <Text style={{color:"#fff", marginVertical:width*0.01, textDecorationLine: 'underline'}} >{more ? '< Show less' : 'Show more >'}</Text>
      </TouchableOpacity>        

    );
  };

  export default MoreLessComponent