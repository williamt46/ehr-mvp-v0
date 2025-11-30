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
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';

// --- 1. IMPORT CONSORTIUM API ---
import ConsortiumAPI, { ConsentContract } from '../MockBlockChainAPI';

// Helper to format provider IDs into names for the demo
const getProviderName = (id: string) => {
  const names: { [key: string]: string } = {
    'provider-789': 'Dr. Provider (CityClinic)',
    'provider-ada-l': 'Dr. Ada Lovelace',
    'provider-grace-h': 'Dr. Grace Hopper',
  };
  return names[id] || id; // Fallback to ID if name not found
};

// Platform-aware alert helper
function showPlatformAlert(title: string, message: string, buttons?: any[]) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    if (buttons && buttons[0] && buttons[0].onPress) {
      buttons[0].onPress();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}

export default function PatientPortal() {
  const [patientID] = useState('patient-123'); // Our logged-in identity
  
  // --- 2. NEW STATE STRUCTURE ---
  // We store the raw contracts from the ledger
  const [consents, setConsents] = useState<ConsentContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLedgerData();
  }, [patientID]);

  const loadLedgerData = async () => {
    setIsLoading(true);
    try {
      // Fetch the immutable ledger records for this patient
      const myContracts = await ConsortiumAPI.getMyConsents(patientID);
      setConsents(myContracts);
    } catch (error) {
      showPlatformAlert('Error', (error as Error).message || 'Failed to load ledger.');
    }
    setIsLoading(false);
  };

  // Filter for the UI view
  const pendingRequests = consents.filter(c => c.status === 'PENDING');
  const activePermissions = consents.filter(c => c.status === 'ACTIVE');

  // --- ACTIONS ---

  const handleApprove = async (contractID: string) => {
    try {
      // Sign the transaction
      await ConsortiumAPI.approveConsent(contractID, patientID);
      showPlatformAlert(
        'Transaction Signed',
        'You have approved access. This action has been recorded on the ledger.',
        [{ text: 'OK', onPress: loadLedgerData }]
      );
    } catch (error) {
      showPlatformAlert('Error', (error as Error).message);
    }
  };

  const handleRevoke = (contractID: string) => {
    const performRevoke = async () => {
      try {
        await ConsortiumAPI.revokeConsent(contractID, patientID);
        showPlatformAlert('Revocation Confirmed', 'Access has been revoked on the ledger.', [
          { text: 'OK', onPress: loadLedgerData },
        ]);
      } catch (error) {
        showPlatformAlert('Error', (error as Error).message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Confirm Revocation?\n\nThis will permanently mark the contract as REVOKED on the blockchain.')) {
        performRevoke();
      }
    } else {
      Alert.alert(
        'Confirm Revocation',
        'This will permanently mark the contract as REVOKED on the blockchain.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Revoke', style: 'destructive', onPress: performRevoke },
        ]
      );
    }
  };

  // Stubbed Features
  const onStubAction = (feature: string) => {
    showPlatformAlert('Feature Stub', `This would navigate to the ${feature} screen.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Patient Wallet' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* Identity Header */}
        <View style={styles.identityCard}>
          <Text style={styles.identityLabel}>Logged in as (DID):</Text>
          <Text style={styles.identityValue}>{patientID}</Text>
          <Text style={styles.identityOrg}>Organization: PatientOrg</Text>
        </View>

        {/* Dashboard Buttons */}
        <View style={styles.featureHub}>
          <View style={styles.featureGrid}>
            <TouchableOpacity style={styles.featureButton} onPress={() => onStubAction('Profile')}>
              <Text style={styles.featureButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureButton} onPress={() => onStubAction('Doctor Directory')}>
              <Text style={styles.featureButtonText}>Doctor Directory</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.accessSection}>
          <Text style={styles.sectionTitle}>Consent Contracts</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : (
            <>
              {/* --- PENDING REQUESTS --- */}
              <Text style={styles.subSectionTitle}>Pending Approvals ({pendingRequests.length})</Text>
              
              {pendingRequests.length > 0 ? (
                pendingRequests.map((contract) => (
                  <View key={contract.contractID} style={styles.card}>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{getProviderName(contract.providerID)}</Text>
                      <Text style={styles.cardHash}>Contract ID: {contract.contractID}</Text>
                      <Text style={styles.cardInfo}>
                        <Text style={styles.infoLabel}>Purpose: </Text>{contract.purpose}
                      </Text>
                      <Text style={styles.cardInfo}>
                        <Text style={styles.infoLabel}>Date: </Text>{new Date(contract.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <Pressable
                        style={[styles.button, styles.approveButton]}
                        onPress={() => handleApprove(contract.contractID)}
                      >
                        <Text style={[styles.buttonText, styles.approveButtonText]}>Sign & Approve</Text>
                      </Pressable>
                      {/* Note: To 'Deny' in this model, we could just ignore or implement a 'Reject' state. 
                          For MVP, we'll focus on Approve. */}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No pending contracts.</Text>
              )}

              {/* --- ACTIVE PERMISSIONS --- */}
              <Text style={styles.subSectionTitle}>Active Contracts ({activePermissions.length})</Text>
              
              {activePermissions.length > 0 ? (
                activePermissions.map((contract) => (
                  <View key={contract.contractID} style={[styles.card, styles.activeCard]}>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{getProviderName(contract.providerID)}</Text>
                      <Text style={styles.cardHash}>Contract ID: {contract.contractID}</Text>
                      <Text style={styles.cardInfo}>
                        <Text style={styles.infoLabel}>Status: </Text>
                        <Text style={{color: 'green', fontWeight: 'bold'}}>ACTIVE</Text>
                      </Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <Pressable
                        style={[styles.button, styles.revokeButton]}
                        onPress={() => handleRevoke(contract.contractID)}
                      >
                        <Text style={[styles.buttonText, styles.approveButtonText]}>Revoke Access</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No active contracts.</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f1f5f9' },
  container: { flex: 1 },
  contentContainer: { padding: 16 },
  
  // Identity Card
  identityCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  identityLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', fontWeight: '700' },
  identityValue: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  identityOrg: { color: '#cbd5e1', fontSize: 14, marginTop: 4 },

  featureHub: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  featureGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  featureButton: {
    flex: 1,
    backgroundColor: '#e0e7ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  featureButtonText: { color: '#3730a3', fontWeight: '600' },

  accessSection: {},
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  subSectionTitle: { fontSize: 16, fontWeight: '600', color: '#475569', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  emptyText: { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingVertical: 16, fontStyle: 'italic' },
  
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#cbd5e1',
  },
  activeCard: {
    borderLeftColor: '#16a34a', // Green for active
  },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  cardHash: { fontSize: 10, color: '#94a3b8', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 8 },
  cardInfo: { fontSize: 14, color: '#475569', marginBottom: 4 },
  infoLabel: { fontWeight: '500', color: '#334155' },
  
  cardFooter: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { fontSize: 14, fontWeight: '600' },
  approveButton: { backgroundColor: '#2563eb' },
  approveButtonText: { color: '#ffffff' },
  revokeButton: { backgroundColor: '#dc2626' },
});