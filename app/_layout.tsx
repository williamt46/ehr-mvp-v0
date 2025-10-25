import { Stack } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';

// This is the main layout for the entire app.
// It defines a "stack" navigator, so we can navigate
// from the index page to the portal pages.
export default function RootLayout() {
  return (
    // We wrap with a basic SafeAreaView to avoid notches
    <SafeAreaView style={styles.safeArea}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});


