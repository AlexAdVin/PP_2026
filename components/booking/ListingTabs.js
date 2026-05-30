import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';

const { width, height } = Dimensions.get("screen");

const tabNames = [
  { name: 'Information' },
  { name: 'Reviews' },
  { name: 'How to park' },
];

export default function ListingTabs(props) {
  return (
    <View style={styles.tabContainer}>
      {tabNames.map(tab => (
        <TouchableOpacity
          key={tab.name}
          style={[styles.tabButton, props.activeFooterTab === tab.name && styles.activeTabButton]}
          onPress={() => props.setFooterActiveTab(tab.name)}
        >
          <Text style={[styles.tabButtonText, props.activeFooterTab === tab.name && styles.activeTabButtonText]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    //marginBottom:height*0.004,
    //marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    backgroundColor:"rgba(0,0,0,0.1)"
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#fff',
  },
  tabButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  activeTabButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});