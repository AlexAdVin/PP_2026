import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'

import styles from '../../global/style/styles'

import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'; 

import { useRouter } from 'expo-router'
import { useLocationStore } from '../../src/store';

const { width, height } = Dimensions.get("window");


export default function SearchBarComponent() {

    const apiMaps = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY;

    const router = useRouter();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const isPlaceSelected = useRef(false);
    const setDestinationDetails = useLocationStore((state) => state.setDestinationDetails);

    const fetchPlaces = useCallback(async () => {
      if (query.length > 3 && !isPlaceSelected.current) {
        setLoading(true);
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${apiMaps}`
          );
          const data = await response.json();
          console.log(data.predictions)
          setResults(data.predictions);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, [query]);


    useEffect(() => {  
      const debounceFetch = setTimeout(fetchPlaces, 500);
      return () => clearTimeout(debounceFetch);
    }, [query, fetchPlaces]);

    const handleSelectPlace = useCallback(async (placeId, description) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiMaps}`
        );
        const details = await response.json();
        setDestinationDetails({
          location: details.result.geometry.location,
          viewport: details.result.geometry.viewport,
          description: description,
        });
      } catch (error) {
        console.error(error);
      }
      setQuery(description);
      setResults([]);
      isPlaceSelected.current = true;
    }, []);

    const handleChangeText = (text) => {
      setQuery(text);
      isPlaceSelected.current = false;
    };

  return (
      
    <View style={[styles.viewCss, {height:height*0.3}]} >

      <View style={{ flex:1 }}>
      <View style={styles.textInputContainer}>

        <FontAwesome5 name="search-location" size={26} style={{ marginLeft: 15, color: 'rgba(255,255,255,0.9)' }} />

        <TextInput
          style={styles.textInputSearch}
          placeholder="Search destination"
          placeholderTextColor="lightgray"
          onChangeText={handleChangeText}
          value={query}
          returnKeyType="search"
          keyboardAppearance="dark"
        />
        <Pressable style={{ flexDirection: 'row', marginRight: 8, backgroundColor: 'white', padding: 9, borderRadius: 50 }} onPress={() => { router.push('/filter') }}>
            <MaterialCommunityIcons name="filter-plus" size={18} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Filter</Text>
        </Pressable>
      </View>
      {loading && <ActivityIndicator size="large" color="#fff" />}
      <FlatList
        data={results}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity style={{backgroundColor:"rgba(0,0,0,0.7)"}} onPress={() => handleSelectPlace(item.place_id, item.description)}>

            <View style={{ padding: height*0.02, flexDirection:"row", alignItems:"center" }}>
              <MaterialCommunityIcons name="filter-plus" size={20} color={'white'} style={{ marginRight: 6 }} />

              <Text style={{ color: '#fff', fontSize:18 }}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

    </View>
    </View>
  )
}
