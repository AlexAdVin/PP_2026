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


// Empty default - EMap will use mockLocations if no posts provided
const defaultPosts: any[] = [];

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('Parking');
  const [posts, setPosts] = useState<any[]>(defaultPosts);
  const router = useRouter();
  const navigation = useNavigation<any>();

  useEffect(() => {
    let isMounted = true;

    const hydratePublishedLocations = async () => {
      try {
        const publishedLocations = await publicLocationAdapter.fetchPublished();

        if (!isMounted) {
          return;
        }

        setPosts(publishedLocations);
      } catch (error) {
        console.error('Failed to load published locations', error);

        if (isMounted) {
          setPosts([]);
        }
      }
    };

    if (activeTab === 'Parking') {
      void hydratePublishedLocations();
    } else {
      setPosts([]);
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

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
