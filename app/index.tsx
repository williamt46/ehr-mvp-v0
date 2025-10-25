import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router'; // Use the Link component for navigation

// This is the new "home page" of your app (the '/' route)
export default function HomePage() {
  return (
    // This style is a single object, so NO flatten()
    <View style={styles.container}>
      {/* These are also single objects, NO flatten() */}
      <Text style={styles.title}>EHR-MVP (Local Test)</Text>
      <Text style={styles.subtitle}>Select a portal to view</Text>

      <Link href="/patient" asChild>
        <Pressable 
          // This style IS an array, so we MUST flatten it.
          style={StyleSheet.flatten([styles.button, styles.patientButton])}
        >
          <Text style={styles.buttonText}>Patient Portal</Text>
        </Pressable>
      </Link>

      <Link href="/provider" asChild>
        <Pressable 
          // This style IS an array, so we MUST flatten it.
          style={StyleSheet.flatten([styles.button, styles.providerButton])}
        >
          <Text style={styles.buttonText}>Provider Portal</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 32,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    // Add a base shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    // Add elevation for Android
    elevation: 4,
  },
  patientButton: {
    backgroundColor: '#2563eb', // Blue
  },
  providerButton: {
    backgroundColor: '#16a34a', // Green
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

