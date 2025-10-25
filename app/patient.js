import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

// This is the corrected import path.
// It goes UP ONE LEVEL (../) from 'app/' to the root to find the API file.
import BlockchainAPI from '../MockBlockChainAPI.js';

// This is the refactored PatientPortal, now living directly in the route file
function PatientPortal({ patientID = 'patient-123' }) {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activePermissions, setActivePermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAccessRequests();
  }, [patientID]); // Reload if patientID prop changes

  const loadAccessRequests = async () => {
    setIsLoading(true);
    try {
      const [pending, active] = await Promise.all([
        BlockchainAPI.getPendingRequests(patientID),
        BlockchainAPI.getActivePermissions(patientID),
      ]);
      setPendingRequests(pending);
      setActivePermissions(active);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load data.');
    }
    setIsLoading(false);
  };

  // Replaced custom modal with native Alert.alert
  const handleAccessRequest = async (requestID, approved) => {
    try {
      await BlockchainAPI.respondToAccessRequest(requestID, approved, patientID);
      Alert.alert(
        'Success',
        approved ? 'Access granted' : 'Access denied',
        [{ text: 'OK', onPress: loadAccessRequests }] // Reload data on OK
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'An unknown error occurred.');
    }
  };

  // Replaced custom modal with native Alert.alert for confirmation
  const revokeAccess = async (permissionID) => {
    Alert.alert(
      'Revoke Access',
      "Are you sure you want to revoke this provider's access?",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await BlockchainAPI.revokePermission(permissionID);
              Alert.alert(
                'Success', 
                'Access has been revoked.',
                [{ text: 'OK', onPress: loadAccessRequests }] // Reload data
              );
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to revoke access.');
            }
          },
        },
      ]
    );
  };

  // --- Render ---

  const renderEmptyList = (message) => (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.emptyCard}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>Loading Data...</Text>
    </View>
  );

  return (
    // Note: We use ScrollView here instead of SafeAreaView
    // because the parent component (PatientPortalPage) handles the SafeArea.
    <ScrollView style={styles.container}>
      {/* Pending Requests Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Access Requests</Text>
        {isLoading ? renderLoading() : pendingRequests.length > 0 ? (
          <View style={styles.cardList}>
            {pendingRequests.map((item) => (
              <View key={item.requestID} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    Dr. {item.providerName}
                  </Text>
                  <Text style={styles.cardInfo}>
                    <Text style={styles.infoLabel}>Purpose:</Text> {item.purpose}
                  </Text>
                  <Text style={styles.cardInfo}>
                    <Text style={styles.infoLabel}>Duration:</Text> {item.durationDays} days
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Pressable
                    onPress={() => handleAccessRequest(item.requestID, true)}
                    style={[styles.button, styles.approveButton]}
                  >
                    <Text style={[styles.buttonText, styles.approveButtonText]}>Approve</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleAccessRequest(item.requestID, false)}
                    style={[styles.button, styles.denyButton]}
                  >
                    <Text style={[styles.buttonText, styles.denyButtonText]}>Deny</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : (
          renderEmptyList('No pending requests')
        )}
      </View>

      {/* Active Permissions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Permissions</Text>
        {isLoading ? null : activePermissions.length > 0 ? ( // Don't show loading twice
          <View style={styles.cardList}>
            {activePermissions.map((item) => (
              <View key={item.permissionID} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    Dr. {item.providerName}
                  </Text>
                  <Text style={styles.cardInfo}>
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Pressable
                    onPress={() => revokeAccess(item.permissionID)}
                    style={[styles.button, styles.revokeButton]}
                  >
                    <Text style={[styles.buttonText, styles.revokeButtonText]}>Revoke Access</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : (
          renderEmptyList('No active permissions')
        )}
      </View>
    </ScrollView>
  );
}

// This is the default export for the page
export default function PatientPortalPage() {
  const router = useRouter();

  return (
    // This SafeAreaView handles the whole page
    <SafeAreaView style={styles.safeArea}>
      {/* 1. This adds the header to the page */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Patient Portal',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>{'< Back'}</Text>
            </Pressable>
          ),
        }}
      />
      
      {/* 2. This renders your actual portal component */}
      <PatientPortal />
    </SafeAreaView>
  );
}


// --- Stylesheet ---
// Replaced Tailwind classes with a native StyleSheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9', // Page background
  },
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  cardList: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // Ensures footer respects border radius
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
    gap: 8,
    padding: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: '#2563eb',
  },
  approveButtonText: {
    color: '#ffffff',
  },
  denyButton: {
    backgroundColor: '#e2e8f0',
  },
  denyButtonText: {
    color: '#334155',
  },
  revokeButton: {
    backgroundColor: '#dc2626',
  },
  revokeButtonText: {
    color: '#ffffff',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
  // Router header styles
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
  },
});

