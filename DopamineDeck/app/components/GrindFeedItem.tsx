import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface GrindFeedItemProps {
  id: string;
  nickname: string;
  taskTitle: string;
  emoji?: string;
  timestamp?: Date; // For potential future use (sorting, display)
}

const GrindFeedItem: React.FC<GrindFeedItemProps> = (props) => {
  const displayTimestamp = props.timestamp
    ? ` (${props.timestamp.toLocaleTimeString()})`
    : '';

  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {props.emoji ? `${props.emoji} ` : ''}
        <Text style={styles.nicknameText}>{props.nickname}:</Text> {props.taskTitle}
        {/* {displayTimestamp} */}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Light separator line
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  nicknameText: {
    fontWeight: 'bold',
  },
});

export default GrindFeedItem;
