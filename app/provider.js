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
  TextInput
} from 'react-native';
import { Stack, useRouter } from 'expo-router';


// This import path is correct (from our previous fix)
import BlockchainAPI from '../MockBlockChainAPI.js';

// --- Refactored RecordViewer Sub-Component ---
// (No changes to this sub-component)
const RecordViewer = ({ records, patientID, providerID }) => {
  const { patientInfo, allergies, medications, recentVisits } = records;

  const renderListItem = (item, index) => (
    <Text key={index} style={styles.listItem}>
      {item}
    </Text>
  );

  return (
    <View style={styles.viewerContainer}>
      <Text style={styles.viewerTitle}>
        Viewing Records for Patient: {patientInfo.name} ({patientID})
      </Text>
      <Text style={styles.viewerSubtitle}>
        Accessed by Provider: {providerID}
      </Text>

      {/* Patient Info Section */}
      <View style={styles.viewerSection}>
        <Text style={styles.viewerSectionTitle}>Patient Information</Text>
        <View style={styles.viewerContentBox}>
          <Text style={styles.viewerText}><Text style={styles.viewerLabel}>Name:</Text> {patientInfo.name}</Text>
          <Text style={styles.viewerText}><Text style={styles.viewerLabel}>Date of Birth:</Text> {patientInfo.dob}</Text>
        </View>
      </View>

      {/* Allergies Section */}
      <View style={styles.viewerSection}>
        <Text style={styles.viewerSectionTitle}>Allergies</Text>
        <View style={styles.viewerContentBox}>
          {allergies.length > 0 ? (
            allergies.map(renderListItem)
          ) : (
            <Text style={styles.viewerText}>No known allergies.</Text>
          )}
        </View>
      </View>

      {/* Medications Section */}
      <View style={styles.viewerSection}>
        <Text style={styles.viewerSectionTitle}>Medications</Text>
        <View style={styles.viewerContentBox}>
          {medications.length > 0 ? (
            medications.map((med, index) => (
              <Text key={index} style={styles.viewerText}>{med.name} ({med.dosage})</Text>
            ))
          ) : (
            <Text style={styles.viewerText}>No active medications.</Text>
          )}
        </View>
      </View>

      {/* Recent Visits Section */}
      <View style={styles.viewerSection}>
        <Text style={styles.viewerSectionTitle}>Recent Visits</Text>
        <View style={styles.viewerContentBox}>
          {recentVisits.length > 0 ? (
            recentVisits.map((visit, index) => (
              <Text key={index} style={styles.viewerText}>{visit.date}: {visit.reason} (with {visit.provider})</Text>
            ))
          ) : (
            <Text style={styles.viewerText}>No recent visits.</Text>
          )}
        </View>
      </View>
    </View>
  );
};


// --- Refactored ProviderPortal Component ---
function ProviderPortal({ providerID = 'provider-789' }) {
  const [patientID, setPatientID] = useState('patient-123');
  const [accessPurpose, setAccessPurpose] = useState('consultation');
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // --- NEW STATE ---
  // This state tracks if the provider has active, verified access.
  const [accessStatus, setAccessStatus] = useState(false);
  // This state is for the "Request Access" button's loading
  const [isRequesting, setIsRequesting] = useState(false);

  // --- NEW HOOK: Proactive Access Check ---
  // This hook runs whenever patientID or providerID changes.
  // It proactively checks for access before the user clicks anything.
  useEffect(() => {
    // Clear records and reset status whenever the patient ID changes
    setRecords(null);
    setAccessStatus(false); 

    if (patientID && providerID) {
      setLoading(true); // Use main loading for verification
      BlockchainAPI.verifyAccess(providerID, patientID)
        .then(hasAccess => {
          setAccessStatus(hasAccess); // Set the access status
        })
        .catch(err => {
          console.error("Failed to verify access:", err);
          setAccessStatus(false); // Default to no access on error
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [patientID, providerID]); // Dependencies: re-run if these change

  const requestAccess = async () => {
    setIsRequesting(true);
    setRecords(null); // Clear records
    try {
      const requestID = await BlockchainAPI.requestAccess({
        providerID,
        patientID,
        purpose: accessPurpose,
        durationDays: 30
      });
      Alert.alert(
        'Request Submitted',
        `Access request submitted. The patient will be notified to approve/deny.`
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit request.');
    }
    setIsRequesting(false);
  };

  // --- REFACTORED FUNCTION ---
  // This function is now simpler. It no longer needs to check
  // for access, because the button itself is disabled if access=false.
  const viewRecords = async () => {
    setLoading(true);
    setRecords(null);
    try {
      // We no longer need the verifyAccess() check here,
      // because the button is already disabled if accessStatus is false.
      const patientRecords = await BlockchainAPI.getPatientRecords(patientID);
      setRecords(patientRecords);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to retrieve records.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* This Stack.Screen is for the router's header */}
      <Stack.Screen options={{ title: 'Provider Portal' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* --- Request Access Form --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Request Patient Access</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Patient ID:</Text>
            <TextInput
              style={styles.input}
              value={patientID}
              onChangeText={setPatientID} // Simplified this handler
              placeholder="Enter patient ID"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Purpose of Access:</Text>
            {/* This TextInput should ideally be a Picker/Select.
              For React Native web, TextInput is a simple placeholder.
            */}
            <TextInput
              style={styles.input}
              value={accessPurpose}
              onChangeText={setAccessPurpose}
              placeholder="e.g., Consultation, Treatment"
            />
          </View>
          
          <Pressable
            style={[styles.button, styles.requestButton, (isRequesting || !patientID) ? styles.buttonDisabled : {}]}
            onPress={requestAccess}
            disabled={isRequesting || !patientID}
          >
            {isRequesting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Request Access</Text>
            )}
          </Pressable>
        </View>
        
        {/* --- View Records Section --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>View Patient Records</Text>
          
          {/* --- REFACTORED BUTTON --- */}
          {/* This button is now disabled based on `accessStatus` */}
          <Pressable
            style={[styles.button, styles.viewButton, (loading || !accessStatus) ? styles.buttonDisabled : {}]}
            onPress={viewRecords}
            disabled={loading || !accessStatus}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              // Button text now proactively shows access status
              <Text style={styles.buttonText}>
                {accessStatus ? 'View Records' : 'Access Not Granted'}
              </Text>
            )}
          </Pressable>
          
          {/* The RecordViewer will only appear if records are successfully fetched */}
          {records && (
            <RecordViewer 
              records={records}
              patientID={patientID}
              providerID={providerID}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// This is the required default export for the page
export default function ProviderPortalPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. This adds the header to the page */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Provider Portal',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>{'< Back'}</Text>
            </Pressable>
          ),
        }}
      />
      
      {/* 2. This renders your actual portal component */}
      <ProviderPortal />
    </SafeAreaView>
  );
}


// --- STYLESHEET ---
// (No changes to styles)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9', // Light gray background
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  requestButton: {
    backgroundColor: '#2563eb',
  },
  viewButton: {
    backgroundColor: '#16a34a',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },

  // RecordViewer styles
  viewerContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  viewerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  viewerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
  },
  viewerSection: {
    marginBottom: 16,
  },
  viewerSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
    marginBottom: 8,
  },
  viewerContentBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 6,
  },
  viewerText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  viewerLabel: {
    fontWeight: '500',
  },
  listItem: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    paddingVertical: 2,
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

