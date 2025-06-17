import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import GrindFeedItem, { GrindFeedItemProps } from './GrindFeedItem';

// Sample data for the feed
const sampleFeedData: GrindFeedItemProps[] = [
  { id: 'gf1', nickname: '🔥Ben', taskTitle: '30 Min Deep Work done', emoji: '🚀', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 'gf2', nickname: '💡Sarah', taskTitle: 'Reviewed PR #123', emoji: '✅', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
  { id: 'gf3', nickname: '⚡Max', taskTitle: 'Morning Run', emoji: '🏃', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 'gf4', nickname: '📚Lisa', taskTitle: 'Read Chapter 5 of "Atomic Habits"', emoji: '📖', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
  { id: 'gf5', nickname: '🎉Alex', taskTitle: 'Launched new feature!', emoji: '🥳', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
];

// Sort data by timestamp descending (newest first)
const sortedSampleFeedData = sampleFeedData.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));


interface GrindFeedDisplayProps {
  // Future props could be passed here, e.g., for live data
}

const GrindFeedDisplay: React.FC<GrindFeedDisplayProps> = () => {
  const [feedItems, setFeedItems] = useState<GrindFeedItemProps[]>(sortedSampleFeedData);

  return (
    <View style={styles.displayContainer}>
      <Text style={styles.titleText}>GrindFeed</Text>
      <FlatList
        data={feedItems}
        renderItem={({ item }) => <GrindFeedItem {...item} />}
        keyExtractor={item => item.id}
        style={styles.listStyle} // Added to control FlatList's own container style if needed
        // nestedScrollEnabled can be useful if this FlatList is inside another ScrollView
        // For this setup, it will be inside TodayScreen's SafeAreaView (not a ScrollView directly)
      />
    </View>
  );
};

const styles = StyleSheet.create({
  displayContainer: {
    backgroundColor: '#f9f9f9', // Light grey background for the feed container
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5, // Less padding at bottom as items have their own
    marginHorizontal: 16, // Align with card margins
    borderRadius: 8,
    maxHeight: 200, // Max height for the feed, makes it scrollable if content exceeds
    borderWidth: 1,
    borderColor: '#e0e0e0', // Slightly darker border for the container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
    textAlign: 'center',
  },
  listStyle: {
    // Can be used to give FlatList specific styling if its default container isn't enough
    // For example, if you wanted a border around the FlatList itself inside displayContainer
  }
});

export default GrindFeedDisplay;
