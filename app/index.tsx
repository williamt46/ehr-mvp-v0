import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';

// This is the new "home page" of your app, reflecting the 4 roles.
export default function HomePage() {
  return (
    // This style is a single object, so NO flatten()
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>EHR-MVP (Local Test)</Text>
        <Text style={styles.subtitle}>Select a role portal to view</Text>

        <View style={styles.buttonGrid}>
          {/* Patient Portal Link */}
          <Link href="/patient" asChild>
            <Pressable
                      // This style IS an array, so we MUST flatten it.
              style={StyleSheet.flatten([styles.button, styles.patientButton])}
            >
              <Text style={styles.buttonText}>Patient Portal</Text>
            </Pressable>
          </Link>

          {/* Provider Portal Link */}
          <Link href="/provider" asChild>
            <Pressable
              style={StyleSheet.flatten([styles.button, styles.providerButton])}
            >
              <Text style={styles.buttonText}>Provider Portal</Text>
            </Pressable>
          </Link>

          {/* Reception Portal Link */}
          <Link href="/reception" asChild>
            <Pressable
              style={StyleSheet.flatten([styles.button, styles.receptionButton])}
            >
              <Text style={styles.buttonText}>Reception Portal</Text>
            </Pressable>
          </Link>

          {/* Admin Portal Link */}
          <Link href="/admin" asChild>
            <Pressable
              style={StyleSheet.flatten([styles.button, styles.adminButton])}
            >
              <Text style={styles.buttonText}>Admin Portal</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 32,
  },
  buttonGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%', // Two columns with a small gap
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    // Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  patientButton: {
    backgroundColor: '#2563eb', // Blue
  },
  providerButton: {
    backgroundColor: '#16a34a', // Green
  },
  receptionButton: {
    backgroundColor: '#ca8a04', // Yellow/Gold
  },
  adminButton: {
    backgroundColor: '#dc2626', // Red
  },
});
