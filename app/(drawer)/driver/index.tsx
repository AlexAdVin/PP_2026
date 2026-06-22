import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter, useNavigation } from 'expo-router';

import HeaderTabs from '@/components/home/HeaderTabs';
import SearchBarComponent from "@/components/home/SearchBarComponent";

import EMap from '@/screens/EMap';

import styles from '@/global/style/styles';
import { publicLocationAdapter } from '@/src/adapters/publicLocationAdapter';
import { useLocationStore } from '@/src/store';


// Empty default - EMap will use mockLocations if no posts provided
const defaultPosts: any[] = [];

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('Parking');
  const [posts, setPosts] = useState<any[]>(defaultPosts);
  const router = useRouter();
  const navigation = useNavigation<any>();
  const mapBounds = useLocationStore((state) => state.mapBounds);
  const driverFilters = useLocationStore((state) => state.driverFilters);
  const driverDiscovery = useLocationStore((state) => state.driverDiscovery);
  const setDriverDiscovery = useLocationStore((state) => state.setDriverDiscovery);

  useEffect(() => {
    if ((driverDiscovery.locations ?? []).length > 0) {
      setPosts(driverDiscovery.locations);
    }
  }, [driverDiscovery.locations]);

  useEffect(() => {
    let isMounted = true;

    const boundsKey = mapBounds?.viewport
      ? publicLocationAdapter.buildDiscoveryFetchKey(activeTab, mapBounds.viewport, driverFilters)
      : JSON.stringify({ activeTab, viewport: null, filters: driverFilters });

    const hydratePublishedLocations = async () => {
      try {
        const publishedLocations = await publicLocationAdapter.fetchPublished(
          mapBounds?.viewport,
          driverFilters,
        );

        if (!isMounted) {
          return;
        }

        setPosts(publishedLocations);
        setDriverDiscovery({
          activeTab,
          boundsKey,
          filters: driverFilters,
          locations: publishedLocations,
          lastFetchedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to load published locations', error);

        if (isMounted) {
          setPosts([]);
        }
      }
    };

    if (activeTab !== 'Parking') {
      setPosts([]);
    } else if (driverDiscovery.boundsKey === boundsKey) {
      setPosts(driverDiscovery.locations ?? []);
    } else if (mapBounds?.viewport) {
      void hydratePublishedLocations();
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab, driverDiscovery.boundsKey, driverDiscovery.locations, driverFilters, mapBounds?.viewport, setDriverDiscovery]);

  const handleMenuPress = () => {
    navigation.openDrawer();
  };

  const handleQuestionIconPress = () => {
    router.push('/driver/filter');
  };

  return (
    <SafeAreaView style={styles.txtInCFlex}>
      <View style={styles.headerCss}>
        <View style={styles.rowSpaceBAlignItem}>
          <Ionicons
            onPress={handleMenuPress}
            name="menu"
            size={45}
            color="white"
          />
          <HeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <TouchableOpacity onPress={handleQuestionIconPress}>
            <FontAwesome
              onPress={handleQuestionIconPress}
              name="question-circle"
              size={40}
              color="white"
            />
          </TouchableOpacity>
        </View>
        <SearchBarComponent />
      </View>
      <EMap posts={posts as any} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
};

export default HomeScreen;
