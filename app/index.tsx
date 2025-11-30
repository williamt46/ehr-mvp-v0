import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function HomePage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Select Role' }} />
      <View style={styles.container}>
        <Text style={styles.title}>EHR-MVP (Local Test)</Text>
        <Text style={styles.subtitle}>Select a portal to view</Text>

        <View style={styles.buttonList}>
          
          {/* Patient Portal */}
          <Link href="/patient" asChild>
            <Pressable style={StyleSheet.flatten([styles.button, styles.patientButton])}>
              <Text style={styles.buttonText}>Patient Portal</Text>
              <Text style={styles.buttonSubtext}>Manage Consent & Profile</Text>
            </Pressable>
          </Link>

          {/* Provider Portal */}
          <Link href="/provider" asChild>
            <Pressable style={StyleSheet.flatten([styles.button, styles.providerButton])}>
              <Text style={styles.buttonText}>Provider Portal</Text>
              <Text style={styles.buttonSubtext}>Request Access & View Records</Text>
            </Pressable>
          </Link>

          {/* Admin Portal */}
          <Link href="/admin" asChild>
            <Pressable style={StyleSheet.flatten([styles.button, styles.adminButton])}>
              <Text style={styles.buttonText}>Admin Console</Text>
              <Text style={styles.buttonSubtext}>System Monitor & Security</Text>
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
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonList: {
    width: '100%',
    gap: 16, // Vertical spacing between buttons
  },
  button: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  patientButton: {
    backgroundColor: '#2563eb', // Blue
  },
  providerButton: {
    backgroundColor: '#16a34a', // Green
  },
  adminButton: {
    backgroundColor: '#334155', // Dark Slate
  },
});