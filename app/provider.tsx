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
  TextInput,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';

import BlockchainAPI from '../MockBlockChainAPI';

// --- 1. NEW TYPE DEFINITIONS ---
// We are defining the "shape" of our data to fix all 'any' errors.

type PatientInfo = {
  id: string;
  name: string;
  dob: string;
};

type Medication = {
  name: string;
  dosage: string;
};

type Visit = {
  date: string;
  reason: string;
  provider: string;
};

type PatientRecord = {
  patientInfo: PatientInfo;
  allergies: string[];
  medications: Medication[];
  recentVisits: Visit[];
};

// We also type the props for the RecordViewer component
interface RecordViewerProps {
  records: PatientRecord;
  patientID: string;
  providerID: string;
}

// --- Platform-Aware Alert Function ---
// (No changes here, this is our helper from last time)
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

const onEditRecord = (section: string, patientID: string) => {
  showPlatformAlert(
    'Feature Stub (Req. 3c)',
    `This will open a modal to edit the "${section}" for patient ${patientID}.`
  );
};

// --- 2. TYPED RecordViewer COMPONENT ---
// We apply our new 'RecordViewerProps' interface here.
const RecordViewer: React.FC<RecordViewerProps> = ({ records, patientID, providerID }) => {
  const { patientInfo, allergies, medications, recentVisits } = records;

  const EditButton = ({ section }: { section: string }) => (
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => onEditRecord(section, patientID)}
    >
      <Text style={styles.editButtonText}>Edit</Text>
    </TouchableOpacity>
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
        <View style={styles.sectionHeader}>
          <Text style={styles.viewerSectionTitle}>Patient Information</Text>
          <EditButton section="Patient Information" />
        </View>
        <View style={styles.viewerContentBox}>
          <Text style={styles.viewerText}><Text style={styles.viewerLabel}>Name:</Text> {patientInfo.name}</Text>
          <Text style={styles.viewerText}><Text style={styles.viewerLabel}>Date of Birth:</Text> {patientInfo.dob}</Text>
        </View>
      </View>

      {/* Allergies Section */}
      <View style={styles.viewerSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.viewerSectionTitle}>Allergies</Text>
          <EditButton section="Allergies" />
        </View>
        <View style={styles.viewerContentBox}>
          {/* TypeScript now knows 'item' is a 'string' */}
          {allergies.length > 0 ? (
            allergies.map((item, index) => <Text key={index} style={styles.listItem}>{item}</Text>)
          ) : (
            <Text style={styles.viewerText}>No known allergies.</Text>
          )}
        </View>
      </View>

      {/* Medications Section */}
      <View style={styles.viewerSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.viewerSectionTitle}>Medications</Text>
          <EditButton section="Medications" />
        </View>
        <View style={styles.viewerContentBox}>
          {/* TypeScript now knows 'med' is a 'Medication' object */}
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
        <View style={styles.sectionHeader}>
          <Text style={styles.viewerSectionTitle}>Recent Visits</Text>
          <EditButton section="Recent Visits" />
        </View>
        <View style={styles.viewerContentBox}>
          {/* TypeScript now knows 'visit' is a 'Visit' object */}
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

// --- ProviderPortal Component ---
function ProviderPortal() {
  const [providerID, setProviderID] = useState('provider-789');
  const [patientID, setPatientID] = useState('patient-123');
  const [accessPurpose, setAccessPurpose] = useState('consultation');
  
  // --- 3. TYPED useState HOOK ---
  // We replace 'any' with our new 'PatientRecord' type.
  const [records, setRecords] = useState<PatientRecord | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [accessStatus, setAccessStatus] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setRecords(null);
    setAccessStatus(false);

    if (patientID && providerID) {
      setLoading(true);
      BlockchainAPI.verifyAccess(providerID, patientID)
        .then((hasAccess: unknown) => { // Cast to unknown first
          setAccessStatus(hasAccess as boolean);
        })
        .catch((err: any) => { // Keep 'any' for unknown catch errors
          console.error("Failed to verify access:", err);
          setAccessStatus(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [patientID, providerID]);

  const requestAccess = async () => {
    setIsRequesting(true);
    setRecords(null);
    try {
      const requestID = await BlockchainAPI.requestAccess({
        providerID,
        patientID,
        purpose: accessPurpose,
        durationDays: 30
      });
      showPlatformAlert(
        'Request Submitted',
        `Access request submitted. The patient will be notified to approve/deny.`
      );
    } catch (error: any) {
      showPlatformAlert('Error', error.message || 'Failed to submit request.');
    }
    setIsRequesting(false);
  };

  const viewRecords = async () => {
    setLoading(true);
    setRecords(null);
    try {
      // The 'BlockchainAPI' returns 'any' by default, so we cast the result
      const patientRecords = (await BlockchainAPI.getPatientRecords(patientID)) as PatientRecord;
      setRecords(patientRecords);
    } catch (error: any) {
      showPlatformAlert('Error', error.message || 'Failed to retrieve records.');
    }
    setLoading(false);
  };
  
  const onEditProfile = () => {
    showPlatformAlert(
      'Feature Stub (Req. 3a)',
      'This screen will allow the Provider to view and edit their personal details.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Provider Portal' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* Feature Hub */}
        <View style={styles.featureHub}>
          <Text style={styles.sectionTitle}>Provider Dashboard</Text>
          <View style={styles.featureGrid}>
            <TouchableOpacity style={styles.featureButton} onPress={onEditProfile}>
              <Text style={styles.featureButtonText}>View/Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Access Management */}
        <View style={styles.accessSection}>
          <Text style={styles.sectionTitle}>Patient Access</Text>
          
          {/* Request Access Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Request Patient Access</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Patient ID:</Text>
              <TextInput
                style={styles.input}
                value={patientID}
                onChangeText={setPatientID}
                placeholder="Enter patient ID"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Purpose of Access:</Text>
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
          
          {/* View Records Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>View Patient Records</Text>
            
            <Pressable
              style={[styles.button, styles.viewButton, (loading || !accessStatus) ? styles.buttonDisabled : {}]}
              onPress={viewRecords}
              disabled={loading || !accessStatus}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>
                  {accessStatus ? 'View Records' : 'Access Not Granted'}
                </Text>
              )}
            </Pressable>
            
            {/* RecordViewer will now be correctly typed */}
            {records && (
              <RecordViewer 
                records={records}
                patientID={patientID}
                providerID={providerID}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// This is the required default export for the page
export default ProviderPortal;


// --- STYLESHEET ---
// (No changes to styles)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
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
    flex: 1,
    backgroundColor: '#e0e7ff',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  featureButtonText: {
    color: '#3730a3',
    fontWeight: '600',
    textAlign: 'center',
  },
  accessSection: {
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
    marginBottom: 8,
  },
  viewerSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  editButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#334155',
    fontWeight: '500',
    fontSize: 12,
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
});

