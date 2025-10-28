import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';

// This is a placeholder stub for the Reception Portal
export default function ReceptionPortal() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Reception Portal' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Reception Portal</Text>
        <Text style={styles.subtitle}>
          This is where the Receptionist will manage patient registration and appointments.
        </Text>
        <Text style={styles.spec}>
          Required Features (from Pampattiwar, 2025):
        </Text>
        <Text style={styles.specItem}>
          (a) View all patient details
        </Text>
        <Text style={styles.specItem}>
          (b) Modify and add Patient Records, and their appointments
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fefce8', // Light yellow
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ca8a04', // Gold
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#854d0e',
    textAlign: 'center',
    marginBottom: 24,
  },
  spec: {
    fontSize: 14,
    fontWeight: '600',
    color: '#854d0e',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  specItem: {
    fontSize: 14,
    color: '#854d0e',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
});
