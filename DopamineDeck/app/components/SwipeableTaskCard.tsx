import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import TaskCard, { TaskCardProps as ImportedTaskCardProps } from './TaskCard'; // Renamed to avoid conflict

// Extend TaskCardProps to include 'id' as it's needed for onSwipeComplete
// and also theme from ImportedTaskCardProps (though it's optional there, might be controlled higher up)
export interface SwipeableTaskCardProps extends ImportedTaskCardProps {
  id: string;
  onSwipeComplete: (taskId: string, direction: 'left' | 'right') => void;
  // theme prop is already part of ImportedTaskCardProps and is optional
}

const SWIPE_THRESHOLD = 100;
const SWIPE_OUT_DURATION = 250; // Duration for the swipe out animation
const MAX_TRANSLATE_X = 300; // How far the card animates out

const SwipeableTaskCard: React.FC<SwipeableTaskCardProps> = (props) => {
  const { id, onSwipeComplete, theme, ...taskCardProps } = props; // Explicitly pull out theme if used separately
  const translateX = useSharedValue(0);

  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number }>({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: (event) => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withTiming(MAX_TRANSLATE_X, { duration: SWIPE_OUT_DURATION }, () => {
          runOnJS(onSwipeComplete)(id, 'right');
        });
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-MAX_TRANSLATE_X, { duration: SWIPE_OUT_DURATION }, () => {
          runOnJS(onSwipeComplete)(id, 'left');
        });
      } else {
        translateX.value = withTiming(0, { duration: SWIPE_OUT_DURATION / 2 }); // Snap back quicker
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    // Optional: Add rotation or opacity changes based on translateX
    const rotateZ = interpolate(
      translateX.value,
      [-MAX_TRANSLATE_X, 0, MAX_TRANSLATE_X],
      [-10, 0, 10], // degrees
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      translateX.value,
      [-MAX_TRANSLATE_X, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, MAX_TRANSLATE_X],
      [0.5, 1, 1, 1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotateZ: `${rotateZ}deg` }
      ],
      opacity: opacity,
    };
  });

  return (
    <PanGestureHandler onGestureEvent={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <TaskCard {...taskCardProps} theme={theme} />
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    // The container itself doesn't need much styling if TaskCard has margins
    // It's mainly here for the Animated.View transform
  },
});

export default SwipeableTaskCard;
