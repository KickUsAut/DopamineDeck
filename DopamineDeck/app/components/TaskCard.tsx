import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ViewStyle } from 'react-native';

interface TaskCardProps {
  title: string;
  emoji?: string;
  time: string; // Expected format "X Min"
  category: string;
  theme?: 'default' | 'unlocked';
}

const parseTime = (timeString: string): number => {
  const minutes = parseInt(timeString.split(' ')[0], 10);
  return minutes * 60; // Convert minutes to seconds
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TaskCard: React.FC<TaskCardProps> = ({ title, emoji, time, category }) => {
  const initialTotalSeconds = parseTime(time);
  const [totalSeconds, setTotalSeconds] = useState(initialTotalSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialTotalSeconds);
  const [isActive, setIsActive] = useState(false);
  const [buttonText, setButtonText] = useState('Start');
  const cardTheme = props.theme || 'default';

  useEffect(() => {
    // Update totalSeconds if the time prop changes (e.g. from an external source)
    const newTotalSeconds = parseTime(time);
    setTotalSeconds(newTotalSeconds);
    // If timer is not active, also reset remainingSeconds to the new total
    if (!isActive) {
      setRemainingSeconds(newTotalSeconds);
    }
  }, [time]);


  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;

    if (isActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0 && isActive) {
      setIsActive(false);
      setButtonText('Start');
      Alert.alert('Timer Finished!', `The timer for "${title}" has finished.`);
      // Reset for next run
      setRemainingSeconds(totalSeconds);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, remainingSeconds, title, totalSeconds]);

  const handlePress = () => {
    if (buttonText === 'Start' || buttonText === 'Resume') {
      if (buttonText === 'Start' && (remainingSeconds === 0 || remainingSeconds === totalSeconds)) {
        // If starting from a completed state, or if reset but not started
        setRemainingSeconds(totalSeconds);
      }
      // Ensure that if timer was paused and time prop changes, it can be restarted correctly
      // The main reset logic is now handled by the useEffect watching 'time' prop
      setIsActive(true);
      setButtonText('Pause');
    } else if (buttonText === 'Pause') {
      setIsActive(false);
      setButtonText('Resume');
    }
  };

  const cardStyle = [
    styles.cardBase,
    cardTheme === 'unlocked' && styles.unlockedCardTheme
  ];

  return (
    <View style={cardStyle}>
      <View style={styles.header}>
        {emoji && <Text style={styles.emoji}>{emoji}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.timeDisplay}>{formatTime(remainingSeconds)}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: '#fff', // Default background
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // for Android
    borderWidth: 1,
    borderColor: '#ddd', // Default border
  },
  unlockedCardTheme: {
    backgroundColor: '#e0f7fa', // Light cyan background
    borderColor: '#00796b',   // Teal border
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Increased margin
  },
  emoji: {
    fontSize: 24,
    marginRight: 10, // Increased margin
  },
  title: {
    fontSize: 20, // Increased size
    fontWeight: 'bold',
    flexShrink: 1, // Allow title to shrink if too long
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Increased margin
  },
  category: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    backgroundColor: '#eee', // Category background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeDisplay: { // Was 'time', renamed for clarity
    fontSize: 18, // Larger timer display
    color: '#333',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF', // A common blue for buttons
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 8, // Space above the button
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskCard;
