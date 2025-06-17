import React, { useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, Text, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import { Link } from 'expo-router';
// import TaskCard from '../components/TaskCard'; // No longer directly used
import SwipeableTaskCard, { SwipeableTaskCardProps } from '../components/SwipeableTaskCard';
import GrindFeedDisplay from '../components/GrindFeedDisplay';

// TaskData now needs to align with SwipeableTaskCardProps if we pass item directly
// or ensure all necessary props for TaskCard are present, plus 'id' for SwipeableTaskCard.
interface TaskData {
  id: string; // Ensure id is part of your task data
  title: string;
  emoji?: string;
  time: string;
  category: string;
}

const XP_PER_TASK = 10;
const COINS_PER_TASK = 5;

// Daily Quest Constants
const QUEST_GOAL_TASKS = 2; // Complete 2 tasks for the quest
const QUEST_REWARD_XP = 20; // Bonus XP for completing the quest

// Leveling System Constants
const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500]; // XP for Level 1, 2, 3, 4, 5
const LEVEL_NAMES = ["Novice", "Apprentice", "Adept", "Master", "Grandmaster"]; // Corresponding names

// Function to play sound
async function playCompletionSound() {
  // console.log('Attempting to play sound'); // For debugging
  try {
    // console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/completion.mp3')
    );
    // console.log('Playing Sound'); // For debugging
    await sound.playAsync();
    // Optional: Unload sound after playing to free resources
    sound.setOnPlaybackStatusUpdate(async (status) => {
      // Ensure status is an object and has didJustFinish property
      if (typeof status === 'object' && status !== null && 'didJustFinish' in status && status.didJustFinish) {
        if (status.isLoaded && status.didJustFinish) { // Redundant check, but safe
            // console.log('Unloading Sound'); // For debugging
            await sound.unloadAsync();
        }
      }
    });
  } catch (error) {
    console.error('Failed to play sound', error);
  }
}


const initialTasks: TaskData[] = [
  { id: '1', title: 'Morning Jog', emoji: '🏃', time: '30 Min', category: 'Workout' },
  { id: '2', title: 'Project Brainstorm', emoji: '💡', time: '60 Min', category: 'Deep Work' },
  { id: '3', title: 'Coffee Break', emoji: '☕', time: '15 Min', category: 'Break' },
  { id: '4', title: 'Read Documentation', time: '45 Min', category: 'Learning' },
  { id: '5', title: 'Team Sync-up', emoji: '🤝', time: '20 Min', category: 'Meeting' },
];

const TodayScreen: React.FC = () => {
  const [tasks, setTasks] = useState<TaskData[]>(initialTasks);
  const [currentXP, setCurrentXP] = useState(0);
  const [currentCoins, setCurrentCoins] = useState(0);
  const [initialTaskCount, setInitialTaskCount] = useState(0);
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
  const [currentCardTheme, setCurrentCardTheme] = useState<'default' | 'unlocked'>('default');

  // Daily Quest State
  const [tasksCompletedForQuest, setTasksCompletedForQuest] = useState(0);
  const [dailyQuestAchieved, setDailyQuestAchieved] = useState(false);

  // Leveling State
  const [currentLevel, setCurrentLevel] = useState(1);

  // Helper function to calculate level
  function calculateLevel(xp: number): { level: number, levelName: string, nextLevelXP: number | string } {
    let newLevel = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        newLevel = i + 1;
        break;
      }
    }
    const levelName = LEVEL_NAMES[newLevel - 1] || 'Max Level';
    const nextLevelXP = LEVEL_THRESHOLDS[newLevel] !== undefined ? LEVEL_THRESHOLDS[newLevel] : 'MAX';
    return { level: newLevel, levelName, nextLevelXP };
  }

  // Effect for initial setup
  useEffect(() => {
    setInitialTaskCount(initialTasks.length);
    const { level: initialLevel } = calculateLevel(currentXP); // currentXP is 0 initially
    setCurrentLevel(initialLevel);
  }, []);

  // Effect for level changes based on XP
  useEffect(() => {
    const { level: newLevel, levelName } = calculateLevel(currentXP);
    if (newLevel > currentLevel) {
      setCurrentLevel(newLevel);
      Alert.alert("Level Up!", `You've reached Level ${newLevel}: ${levelName}!`);
      // Future: Trigger actual unlock here based on newLevel
      if (newLevel === 2) { // Example: Unlock at level 2
        Alert.alert("Unlock!", "You've unlocked 'Sound Pack B' (conceptual unlock).");
      }
    } else if (newLevel < currentLevel) { // For potential XP loss scenarios
       setCurrentLevel(newLevel);
    }
  }, [currentXP, currentLevel]);


  const handleSwipeComplete = async (taskId: string, direction: 'left' | 'right') => {
    const taskTitle = tasks.find(t => t.id === taskId)?.title || "Unknown Task";
    console.log(`Task ${taskId} (${taskTitle}) swiped ${direction}`);

    if (direction === 'right') {
      Alert.alert(`Task Completed!`, `"${taskTitle}" marked as done.`);
      await playCompletionSound();

      let awardedXP = XP_PER_TASK;

      // Daily Quest Logic
      if (!dailyQuestAchieved) {
        const newTasksForQuest = tasksCompletedForQuest + 1;
        setTasksCompletedForQuest(newTasksForQuest);
        if (newTasksForQuest >= QUEST_GOAL_TASKS) {
          setDailyQuestAchieved(true);
          awardedXP += QUEST_REWARD_XP; // Add quest reward XP
          Alert.alert("Daily Quest Complete!", `You completed ${QUEST_GOAL_TASKS} tasks and earned ${QUEST_REWARD_XP} bonus XP!`);
        }
      }

      const newTotalXP = currentXP + awardedXP;
      setCurrentXP(newTotalXP); // Update XP
      setCurrentCoins(prevCoins => prevCoins + COINS_PER_TASK); // Update Coins

      console.log(`Awarded ${awardedXP} XP and ${COINS_PER_TASK} Coins. Total XP: ${newTotalXP}, Total Coins: ${currentCoins + COINS_PER_TASK}`);

      const newCompletedCount = completedTaskCount + 1;
      setCompletedTaskCount(newCompletedCount);

      // Daily Goal (all tasks) Check
      if (initialTaskCount > 0 && newCompletedCount === initialTaskCount) {
        console.log('Daily Goal Achieved! All tasks completed.');
        Alert.alert(
          'Daily Goal Achieved!',
          "Congratulations! You've cleared your deck for the day!"
        );
        setCurrentCardTheme('unlocked');
        Alert.alert(
          "New Theme Unlocked!",
          "You've unlocked a new card theme for completing your daily goal! Cards will use the new theme."
        );
      }

    } else {
      Alert.alert(`Task Skipped!`, `"${taskTitle}" skipped.`);
    }

    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
          <Text style={styles.headerText}>Today's Tasks</Text>

          <View style={styles.statsContainer}>
            <Text style={styles.statTextTitle}>Progress</Text>
            <Text style={styles.statItem}>Level: {currentLevel} ({LEVEL_NAMES[currentLevel-1] || 'Max'})</Text>
            <Text style={styles.statItem}>XP: {currentXP} / {LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length-1]}</Text>
            <Text style={styles.statItem}>Coins: {currentCoins}</Text>
            <Text style={styles.statItem}>Tasks Done: {completedTaskCount}/{initialTaskCount}</Text>
            <View style={styles.questStatusContainer}>
                <Text style={styles.statItem}>Daily Quest ({`Complete ${QUEST_GOAL_TASKS} tasks`}): {`${tasksCompletedForQuest}/${QUEST_GOAL_TASKS}`}</Text>
                <Text style={dailyQuestAchieved ? styles.questAchievedText : styles.questPendingText}>
                {dailyQuestAchieved ? 'Achieved! 🎉' : 'Pending...'}
                </Text>
            </View>
          </View>

          <View style={styles.navigationActionsContainer}>
            <Link href="/focus-reel" asChild>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonText}>🎬 Open Focus Reel</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <GrindFeedDisplay />

          {tasks.length > 0 ? (
            <FlatList
              data={tasks}
              renderItem={({ item }) => (
                <SwipeableTaskCard
                  // Pass all props from item that TaskCard expects, plus id and onSwipeComplete
                  id={item.id}
                  title={item.title}
                  emoji={item.emoji}
                  time={item.time}
                  category={item.category}
                  onSwipeComplete={handleSwipeComplete}
                  theme={currentCardTheme} // Pass the current theme
                />
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              extraData={currentCardTheme} // Ensure list re-renders when theme changes
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No tasks for today. Great job!</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0', // A light background color for the safe area
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10, // Adjusted padding
  },
  headerText: {
    fontSize: 28, // Larger header
    fontWeight: 'bold',
    marginBottom: 8, // Reduced margin
    textAlign: 'center',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Changed to space-between for better distribution
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15, // Increased margin
    backgroundColor: '#ffffff', // White background
    borderRadius: 10, // Slightly more rounded corners
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 4,
    elevation: 3,
  },
  statTextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  statItem: {
    fontSize: 14, // Standardized font size for items
    color: '#555', // Dark grey for readability
    marginBottom: 4, // Spacing between items
  },
  questStatusContainer: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  questAchievedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'green',
  },
  questPendingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
  },
  navigationActionsContainer: {
    marginVertical: 12, // Adjusted margin
    alignItems: 'center',
  },
  navButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
    marginTop: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20, // Ensure there's padding at the bottom of the scrollable content
  }
});

export default TodayScreen;
