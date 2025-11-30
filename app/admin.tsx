import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Stack } from 'expo-router';

// --- IMPORT CONSORTIUM API ---
import ConsortiumAPI, { ConsentContract } from '../MockBlockChainAPI';


// --- 1. LOCAL TYPE DEFINITIONS (To prevent import errors) ---
interface NetworkIdentity {
  id: string;
  role: 'patient' | 'doctor' | 'admin';
  organization: string;
  publicKey: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

interface AuditLog {
  timestamp: string;
  action: 'REQUEST' | 'APPROVE' | 'REVOKE' | 'ACCESS' | 'ALERT';
  actorID: string;
  hash: string;
  details?: string;
}

// --- 2. PLATFORM ALERT HELPER ---
function showPlatformAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

// --- 3. ADMIN PORTAL COMPONENT ---
export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<'users' | 'security'>('users');
  const [users, setUsers] = useState<NetworkIdentity[]>([]);
  const [securityLogs, setSecurityLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock System Stats
  const systemStats = {
    networkStatus: 'OPERATIONAL',
    blockHeight: 1402,
    activeNodes: 4,
    tps: 56
  };

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch Users
      const fetchedUsers = await ConsortiumAPI.getAllUsers();
      // Explicitly cast to local type to ensure compatibility
      setUsers(fetchedUsers as unknown as NetworkIdentity[]);

      // Fetch Logs
      const fetchedLogs = await ConsortiumAPI.getSecurityLogs();
      setSecurityLogs(fetchedLogs as unknown as AuditLog[]);
      
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleSuspendUser = async (userID: string) => {
    // Simulate Admin Action
    await ConsortiumAPI.suspendUser(userID);
    showPlatformAlert('Security Action Taken', `Identity ${userID} has been SUSPENDED from the network.`);
    loadAdminData(); // Refresh list
  };

  // --- RENDERERS ---

  const renderUserItem = ({ item }: { item: NetworkIdentity }) => (
    <View style={styles.tableRow}>
      <View style={styles.colMain}>
        <Text style={styles.rowTitle}>{item.id}</Text>
        <Text style={styles.rowSubtitle}>
          {item.organization} • <Text style={{fontWeight:'bold'}}>{item.role.toUpperCase()}</Text>
        </Text>
        <Text style={styles.keyText}>PK: {item.publicKey.substring(0, 15)}...</Text>
      </View>
      
      <View style={styles.colStatus}>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: item.status === 'ACTIVE' ? '#166534' : '#991b1b' }
          ]}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.colAction}>
        {item.status === 'ACTIVE' && item.role !== 'admin' && (
          <TouchableOpacity 
            style={styles.suspendBtn} 
            onPress={() => handleSuspendUser(item.id)}
          >
            <Text style={styles.suspendBtnText}>Ban</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderLogItem = ({ item }: { item: AuditLog }) => {
    const isAlert = item.action === 'ALERT';
    return (
      <View style={[styles.logRow, isAlert ? styles.alertRow : {}]}>
        <View style={styles.logHeader}>
          <Text style={styles.logTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
          <View style={[styles.logTag, isAlert ? styles.tagAlert : styles.tagInfo]}>
            <Text style={[styles.logTagText, isAlert ? styles.tagAlertText : styles.tagInfoText]}>
              {item.action}
            </Text>
          </View>
        </View>
        
        <View style={styles.logBody}>
          <Text style={styles.logActor}>Actor: {item.actorID}</Text>
          <Text style={styles.logHash}>TxHash: {item.hash.substring(0, 24)}...</Text>
          {item.details && (
            <Text style={styles.logMessage}>Details: {item.details}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Admin Console' }} />
      
      {/* Dashboard Header (System Health) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Monitor</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>Network: <Text style={{color:'#4ade80'}}>ONLINE</Text></Text>
          <Text style={styles.statItem}>Height: {systemStats.blockHeight}</Text>
          <Text style={styles.statItem}>Peers: {systemStats.activeNodes}</Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <Pressable 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]} 
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            User Governance
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'security' && styles.activeTab]} 
          onPress={() => setActiveTab('security')}
        >
          <Text style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>
            Intrusion Detection
          </Text>
        </Pressable>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
        ) : (
          activeTab === 'users' ? (
            <FlatList 
              data={users} 
              renderItem={renderUserItem} 
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <FlatList 
              data={securityLogs} 
              renderItem={renderLogItem} 
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.listContent}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' }, // Dark Mode for Admin
  
  header: { padding: 20, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', marginTop: 8, gap: 16 },
  statItem: { color: '#94a3b8', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '600' },

  tabBar: { flexDirection: 'row', backgroundColor: '#334155' },
  tab: { flex: 1, padding: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#38bdf8' },
  tabText: { color: '#94a3b8', fontWeight: '600' },
  activeTabText: { color: '#fff' },

  content: { flex: 1, backgroundColor: '#f1f5f9' },
  listContent: { padding: 16 },

  // User Table Styles
  tableRow: { 
    flexDirection: 'row', backgroundColor: '#fff', padding: 16, 
    borderRadius: 8, marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, elevation: 2
  },
  colMain: { flex: 3 },
  rowTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  rowSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  keyText: { fontSize: 10, color: '#94a3b8', marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  
  colStatus: { flex: 2, alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  
  colAction: { flex: 1, alignItems: 'flex-end' },
  suspendBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  suspendBtnText: { color: '#dc2626', fontSize: 12, fontWeight: 'bold' },

  // Log Styles
  logRow: { 
    backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, 
    borderLeftWidth: 4, borderLeftColor: '#cbd5e1',
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, elevation: 2
  },
  alertRow: { borderLeftColor: '#dc2626', backgroundColor: '#fef2f2' },
  
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  logTime: { fontSize: 12, color: '#64748b' },
  
  logTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagInfo: { backgroundColor: '#e2e8f0' },
  tagAlert: { backgroundColor: '#fee2e2' },
  logTagText: { fontSize: 10, fontWeight: 'bold' },
  tagInfoText: { color: '#475569' },
  tagAlertText: { color: '#991b1b' },

  logBody: {},
  logActor: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  logHash: { fontSize: 10, color: '#94a3b8', marginVertical: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  logMessage: { fontSize: 13, color: '#b91c1c', fontWeight: '600' },
});