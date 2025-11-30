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
} from 'react-native';
import { Stack } from 'expo-router';

// Import API
import ConsortiumAPI, { ConsentContract } from '../MockBlockChainAPI';

// --- 1. DEFINE TYPES LOCALLY (To fix "Cannot find name") ---
interface PatientRecord {
  patientInfo: { id: string; name: string; dob: string };
  allergies: string[];
  medications: { name: string; dosage: string }[];
  recentVisits: { date: string; reason: string; provider: string }[];
}

// --- PROPS INTERFACE ---
interface RecordViewerProps {
  records: PatientRecord;
  patientID: string;
  providerID: string;
}

// --- PLATFORM ALERT HELPER ---
function showPlatformAlert(title: string, message: string, buttons?: any[]) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    if (buttons && buttons[0] && buttons[0].onPress) buttons[0].onPress();
  } else {
    Alert.alert(title, message, buttons);
  }
}

// --- RECORD VIEWER COMPONENT ---
const RecordViewer: React.FC<RecordViewerProps> = ({ records, patientID, providerID }) => {
  const { patientInfo, allergies, medications, recentVisits } = records;

  return (
    <View style={styles.viewerContainer}>
      <Text style={styles.viewerTitle}>Patient Record: {patientInfo.name}</Text>
      <Text style={styles.viewerSubtitle}>DOB: {patientInfo.dob} | ID: {patientInfo.id}</Text>
      <View style={styles.auditBadge}>
        <Text style={styles.auditText}>AUDITED ACCESS: {providerID}</Text>
      </View>

      {/* Clinical Sections */}
      <View style={styles.viewerSection}>
        <Text style={styles.viewerSectionTitle}>Allergies</Text>
        <View style={styles.viewerContentBox}>
          {/* Fix 2: Explicitly type 'item' as string */}
          {allergies.map((item: string, i: number) => (
            <Text key={i} style={styles.listItem}>• {item}</Text>
          ))}
        </View>
      </View>

      <View style={styles.viewerSection}>
        <Text style={styles.viewerSectionTitle}>Medications</Text>
        <View style={styles.viewerContentBox}>
           {/* Fix 2: Explicitly type 'med' */}
          {medications.map((med: { name: string; dosage: string }, i: number) => (
            <Text key={i} style={styles.listItem}>• {med.name} ({med.dosage})</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

// --- MAIN PROVIDER PORTAL ---
export default function ProviderPortal() {
  const [providerID] = useState('provider-789'); // Dr. Provider
  const [searchPatientID, setSearchPatientID] = useState('patient-123');
  const [accessPurpose, setAccessPurpose] = useState('Consultation');
  
  // State for the specific contract with the searched patient
  const [targetContract, setTargetContract] = useState<ConsentContract | null>(null);
  
  // Fix: Explicitly type the records state
  const [records, setRecords] = useState<PatientRecord | null>(null);
  
  // Loading states
  const [isChecking, setIsChecking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  // Proactive Check: Run whenever the user types a Patient ID
  useEffect(() => {
    const checkStatus = async () => {
      if (!searchPatientID) return;
      setIsChecking(true);
      setRecords(null); // Clear old records if ID changes

      try {
        // Query the ledger for MY contracts
        const myContracts = await ConsortiumAPI.getProviderContracts(providerID);
        // Find the most recent contract for this patient
        const match = myContracts.find(c => c.patientID === searchPatientID && c.status !== 'REVOKED');
        setTargetContract(match || null);
      } catch (err) {
        console.error(err);
      }
      setIsChecking(false);
    };

    const debounce = setTimeout(checkStatus, 500); // Debounce typing
    return () => clearTimeout(debounce);
  }, [searchPatientID]);

  // --- ACTIONS ---

  const handleRequestAccess = async () => {
    setIsRequesting(true);
    try {
      await ConsortiumAPI.requestConsent(providerID, searchPatientID, accessPurpose);
      showPlatformAlert('Request Sent', 'The patient has been notified. Status is now PENDING.');
      // Refresh status
      const myContracts = await ConsortiumAPI.getProviderContracts(providerID);
      const match = myContracts.find(c => c.patientID === searchPatientID && c.status !== 'REVOKED');
      setTargetContract(match || null);
    } catch (error) {
      showPlatformAlert('Error', (error as Error).message);
    }
    setIsRequesting(false);
  };

  const handleViewRecords = async () => {
    setIsViewing(true);
    try {
      // Cast the result to PatientRecord to satisfy TypeScript
      const data = await ConsortiumAPI.accessRecords(providerID, searchPatientID) as PatientRecord;
      setRecords(data);
    } catch (error) {
      showPlatformAlert('Access Denied', (error as Error).message);
    }
    setIsViewing(false);
  };

  // --- UI HELPERS ---
  
  const renderStatusBadge = () => {
    if (!targetContract) return <Text style={[styles.statusBadge, {backgroundColor: '#94a3b8'}]}>NO CONTRACT</Text>;
    if (targetContract.status === 'PENDING') return <Text style={[styles.statusBadge, {backgroundColor: '#ca8a04'}]}>PENDING APPROVAL</Text>;
    if (targetContract.status === 'ACTIVE') return <Text style={[styles.statusBadge, {backgroundColor: '#16a34a'}]}>ACCESS GRANTED</Text>;
    return <Text style={[styles.statusBadge, {backgroundColor: '#dc2626'}]}>REVOKED</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Provider Portal' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Provider Identity */}
        <View style={styles.identityCard}>
          <Text style={styles.identityLabel}>PROVIDER ID</Text>
          <Text style={styles.identityValue}>{providerID}</Text>
          <Text style={styles.identityOrg}>CityClinic • General Practice</Text>
        </View>

        {/* Patient Lookup */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Patient Lookup</Text>
          
          <Text style={styles.label}>Patient DID / ID:</Text>
          <TextInput 
            style={styles.input} 
            value={searchPatientID} 
            onChangeText={setSearchPatientID}
            placeholder="e.g. patient-123"
            autoCapitalize="none"
          />

          <View style={styles.statusRow}>
            <Text style={styles.label}>Consent Status:</Text>
            {isChecking ? <ActivityIndicator size="small" color="#2563eb" /> : renderStatusBadge()}
          </View>

          {/* Context Sensitive Action Area */}
          <View style={styles.actionArea}>
            
            {/* Case 1: No Contract or Revoked -> Show Request Form */}
            {(!targetContract || targetContract.status === 'REVOKED') && (
              <View>
                <Text style={styles.label}>Purpose of Access:</Text>
                <TextInput 
                  style={styles.input} 
                  value={accessPurpose} 
                  onChangeText={setAccessPurpose}
                />
                <Pressable 
                  style={[styles.button, styles.requestButton]} 
                  onPress={handleRequestAccess}
                  disabled={isRequesting}
                >
                  {isRequesting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Request Access</Text>}
                </Pressable>
              </View>
            )}

            {/* Case 2: Pending -> Show Waiting Message */}
            {targetContract?.status === 'PENDING' && (
              <View style={styles.pendingBox}>
                <Text style={styles.pendingText}>
                  Awaiting patient signature on contract {targetContract.contractID}.
                </Text>
                <Text style={styles.pendingSubtext}>
                  You cannot view records until the patient approves this request.
                </Text>
              </View>
            )}

            {/* Case 3: Active -> Show View Button */}
            {targetContract?.status === 'ACTIVE' && (
              <Pressable 
                style={[styles.button, styles.viewButton]} 
                onPress={handleViewRecords}
                disabled={isViewing}
              >
                {isViewing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>View EHR Records</Text>}
              </Pressable>
            )}

          </View>
        </View>

        {/* Results Area */}
        {records && (
          <RecordViewer records={records} patientID={searchPatientID} providerID={providerID} />
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f1f5f9' },
  container: { flex: 1 },
  content: { padding: 16 },

  identityCard: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  identityLabel: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
  identityValue: { color: '#fff', fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  identityOrg: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  
  label: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 4 },
  input: {
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8,
    padding: 12, marginBottom: 16, color: '#0f172a'
  },

  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  statusBadge: { 
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, overflow: 'hidden',
    color: '#fff', fontSize: 12, fontWeight: 'bold'
  },

  actionArea: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },

  button: { borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  requestButton: { backgroundColor: '#2563eb' },
  viewButton: { backgroundColor: '#16a34a' },

  pendingBox: { backgroundColor: '#fef9c3', padding: 12, borderRadius: 8 },
  pendingText: { color: '#854d0e', fontWeight: 'bold', fontSize: 14 },
  pendingSubtext: { color: '#a16207', fontSize: 12, marginTop: 4 },

  // Viewer Styles
  viewerContainer: { marginTop: 24, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  viewerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  viewerSubtitle: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  auditBadge: { backgroundColor: '#dcfce7', padding: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 16 },
  auditText: { color: '#166534', fontSize: 10, fontWeight: 'bold' },
  viewerSection: { marginBottom: 16 },
  viewerSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginBottom: 8 },
  viewerContentBox: { paddingLeft: 8 },
  listItem: { fontSize: 14, color: '#334155', marginBottom: 4 },
});