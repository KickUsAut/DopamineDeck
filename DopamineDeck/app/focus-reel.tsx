import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const FocusReelScreen: React.FC = () => {
  const video = useRef<Video>(null); // Specify the type for the ref

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        source={require('../assets/videos/placeholder_reel.mp4')}
        useNativeControls={false}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        onError={(error) => console.error("Video Error:", error)} // Good for debugging
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
    alignSelf: 'stretch',
  },
});

export default FocusReelScreen;
