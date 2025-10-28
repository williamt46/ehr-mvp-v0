import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';

// This is a placeholder stub for the Admin Portal
export default function AdminPortal() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Admin Portal' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Admin Portal</Text>
        <Text style={styles.subtitle}>
          This is where the Admin will manage all accounts, permissions, and security logs.
        </Text>
        <Text style={styles.spec}>
          Required Features (from Pampattiwar, 2025):
        </Text>
        <Text style={styles.specItem}>
          (a) All permissions
        </Text>
        <Text style={styles.specItem}>
          (b) Ability to track attackers
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffecec', // Light red
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
    color: '#dc2626', // Red
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#991b1b',
    textAlign: 'center',
    marginBottom: 24,
  },
  spec: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  specItem: {
    fontSize: 14,
    color: '#991b1b',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
});
