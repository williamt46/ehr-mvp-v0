import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform, // <-- 1. IMPORT PLATFORM
} from 'react-native';
import { Stack } from 'expo-router';

import BlockchainAPI from '../MockBlockChainAPI.js';

// --- 2. NEW PLATFORM-AWARE ALERT FUNCTION ---
// This wrapper checks the OS and uses the correct alert API.
function showPlatformAlert(title: string, message: string, buttons?: any[]) {
  if (Platform.OS === 'web') {
    // window.alert is the web equivalent for a simple "OK" alert.
    // We combine the title and message.
    window.alert(`${title}\n\n${message}`);
    // If buttons are provided (e.g., for 'OK' callbacks), find and execute the first one.
    // This is a simple polyfill.
    if (buttons && buttons[0] && buttons[0].onPress) {
      buttons[0].onPress();
    }
  } else {
    // On mobile (iOS/Android), use the native Alert.
    Alert.alert(title, message, buttons);
  }
}

// This is the refactored PatientPortal, now a "Dashboard"
export default function PatientPortal() {
  const [patientID, setPatientID] = useState('patient-123'); // Demo Patient
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activePermissions, setActivePermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAccessRequests();
  }, [patientID]);

  const loadAccessRequests = async () => {
    setIsLoading(true);
    try {
      const [pending, active] = await Promise.all([
        BlockchainAPI.getPendingRequests(patientID),
        BlockchainAPI.getActivePermissions(patientID),
      ]);
      setPendingRequests(pending);
      setActivePermissions(active);
    } catch (error: any) {
      // --- 3. USE PLATFORM-AWARE ALERT ---
      showPlatformAlert('Error', error.message || 'Failed to load data.');
    }
    setIsLoading(false);
  };

  // --- STUBBED FEATURE (a) ---
  const onEditProfile = () => {
    // --- 3. USE PLATFORM-AWARE ALERT ---
    showPlatformAlert(
      'Feature Stub',
      'This screen will allow the patient to view and edit their personal details (Req. 2a).'
    );
  };

  // --- STUBBED FEATURE (c) ---
  const onViewDoctors = () => {
    // --- 3. USE PLATFORM-AWARE ALERT ---
    showPlatformAlert(
      'Feature Stub',
      'This screen will show a directory of all available doctors and their profiles (Req. 2c).'
    );
  };

  // --- EXISTING FEATURE (b) ---
  const handleAccessRequest = async (requestID: string, approved: boolean) => {
    try {
      await BlockchainAPI.respondToAccessRequest(requestID, approved, patientID);
      // --- 3. USE PLATFORM-AWARE ALERT ---
      showPlatformAlert(
        'Success',
        approved ? 'Access granted' : 'Access denied',
        [{ text: 'OK', onPress: loadAccessRequests }] // Reload data
      );
    } catch (error: any) {
      // --- 3. USE PLATFORM-AWARE ALERT ---
      showPlatformAlert('Error', error.message || 'An unknown error occurred.');
    }
  };

  // --- 4. REFACTORED REVOKE FUNCTION (COMPLEX) ---
  const revokeAccess = (permissionID: string) => {
    const performRevoke = async () => {
      try {
        await BlockchainAPI.revokePermission(permissionID);
        showPlatformAlert('Success', 'Access has been revoked.', [
          { text: 'OK', onPress: loadAccessRequests }, // Reload data
        ]);
      } catch (error: any) {
        showPlatformAlert('Error', error.message || 'Failed to revoke access.');
      }
    };

    if (Platform.OS === 'web') {
      // On web, we use window.confirm() which returns a simple boolean
      const userConfirmed = window.confirm(
        'Revoke Access?\n\nAre you sure you want to revoke this provider\'s access?'
      );
      if (userConfirmed) {
        performRevoke();
      }
    } else {
      // On mobile, we use the button-array in Alert.alert
      Alert.alert(
        'Revoke Access',
        'Are you sure you want to revoke this provider\'s access?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Revoke',
            style: 'destructive',
            onPress: performRevoke, // Pass the function to onPress
          },
        ]
      );
    }
  };

  // --- RENDER ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Patient Portal' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* --- NEW FEATURE HUB (Req. 2a & 2c) --- */}
        <View style={styles.featureHub}>
          <Text style={styles.sectionTitle}>My Dashboard</Text>
          <View style={styles.featureGrid}>
            <TouchableOpacity style={styles.featureButton} onPress={onEditProfile}>
              <Text style={styles.featureButtonText}>View/Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureButton} onPress={onViewDoctors}>
              <Text style={styles.featureButtonText}>View Doctor Directory</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- EXISTING ACCESS MANAGEMENT (Req. 2b) --- */}
        <View style={styles.accessSection}>
          <Text style={styles.sectionTitle}>Manage Access</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : (
            <>
              {/* --- Pending Requests List --- */}
              <Text style={styles.subSectionTitle}>Pending Requests</Text>
              {pendingRequests.length > 0 ? (
                pendingRequests.map((item) => (
                  <View key={item.requestID} style={styles.card}>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>Dr. {item.providerName}</Text>
                      <Text style={styles.cardInfo}>
                        <Text style={styles.infoLabel}>Purpose: </Text>{item.purpose}
                      </Text>
                      <Text style={styles.cardInfo}>
                        <Text style={styles.infoLabel}>Duration: </Text>{item.durationDays} days
                      </Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <Pressable
                        style={[styles.button, styles.approveButton]}
                        onPress={() => handleAccessRequest(item.requestID, true)}
                      >
                        <Text style={[styles.buttonText, styles.approveButtonText]}>Approve</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.button, styles.denyButton]}
                        onPress={() => handleAccessRequest(item.requestID, false)}
                      >
                        <Text style={[styles.buttonText, styles.denyButtonText]}>Deny</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No pending requests.</Text>
              )}

              {/* --- Active Permissions List --- */}
              <Text style={styles.subSectionTitle}>Active Permissions</Text>
              {activePermissions.length > 0 ? (
                activePermissions.map((item) => (
                  <View key={item.permissionID} style={styles.card}>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>Dr. {item.providerName}</Text>
                      <Text style={styles.cardInfo}>
                        <Text style={styles.infoLabel}>Expires: </Text>
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <Pressable
                        style={[styles.button, styles.revokeButton]}
                        onPress={() => revokeAccess(item.permissionID)}
                      >
                        <Text style={[styles.buttonText, styles.approveButtonText]}>Revoke Access</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No active permissions.</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9', // Light blue-gray background
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  featureHub: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  featureButton: {
    flex: 1, // Each button takes half the space
    backgroundColor: '#e0e7ff', // Lighter blue
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4, // Gutter
  },
  featureButtonText: {
    color: '#3730a3', // Darker blue
    fontWeight: '600',
    textAlign: 'center',
  },
  accessSection: {
    // Wrapper for the access lists
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  cardInfo: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: '500',
    color: '#334155',
  },
  cardFooter: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: '#2563eb', // Blue
    borderBottomLeftRadius: 12,
  },
  approveButtonText: {
    color: '#ffffff',
  },
  denyButton: {
    backgroundColor: '#e2e8f0', // Gray
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
    borderBottomRightRadius: 12,
  },
  denyButtonText: {
    color: '#334155',
  },
  revokeButton: {
    backgroundColor: '#dc2626', // Red
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
});

