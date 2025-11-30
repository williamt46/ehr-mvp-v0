// This API simulates a PERMISSIONED CONSORTIUM BLOCKCHAIN (e.g., Hyperledger Fabric)
// It models Identity (MSP), Channels, and Chaincode logic.

// --- 1. CONSORTIUM IDENTITY TYPES ---
export interface NetworkIdentity {
  id: string;
  role: 'patient' | 'doctor' | 'admin';
  organization: string;
  publicKey: string;
  status: 'ACTIVE' | 'SUSPENDED'; // Added for Admin control
}

// --- 2. LEDGER DATA STRUCTURES ---
export interface PatientRecord {
  patientInfo: { id: string; name: string; dob: string };
  allergies: string[];
  medications: { name: string; dosage: string }[];
  recentVisits: { date: string; reason: string; provider: string }[];
}

export interface ConsentContract {
  contractID: string;
  patientID: string;
  providerID: string;
  status: 'PENDING' | 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  purpose: string;
  timestamp: string;
  history: AuditLog[];
}

export interface AuditLog {
  timestamp: string;
  action: 'REQUEST' | 'APPROVE' | 'REVOKE' | 'ACCESS' | 'ALERT';
  actorID: string;
  hash: string;
  details?: string; // For security alerts
}

// --- 3. MOCK STATE ---
const identities: NetworkIdentity[] = [
  { id: 'patient-123', role: 'patient', organization: 'PatientOrg', publicKey: 'pk-p1', status: 'ACTIVE' },
  { id: 'provider-789', role: 'doctor', organization: 'CityClinic', publicKey: 'pk-d1', status: 'ACTIVE' },
  { id: 'admin-001', role: 'admin', organization: 'ConsortiumGov', publicKey: 'pk-adm', status: 'ACTIVE' },
];

let consentLedger: { [id: string]: ConsentContract } = {};

// Mock Security Logs (Simulating "Tracking Attackers")
const securityLogs: AuditLog[] = [
  { timestamp: new Date(Date.now() - 86400000).toISOString(), action: 'ALERT', actorID: 'unknown-ip', hash: '0x99...', details: 'Failed Auth Attempt (3x)' },
  { timestamp: new Date(Date.now() - 43200000).toISOString(), action: 'ALERT', actorID: 'provider-789', hash: '0x88...', details: 'Unauthorized Record Access Attempt' },
];

const mockPatientRecords: { [key: string]: PatientRecord } = {
  "patient-123": {
    patientInfo: { id: "patient-123", name: "Alex Johnson", dob: "1985-04-12" },
    allergies: ["Peanuts", "Penicillin"],
    medications: [{ name: "Lisinopril", dosage: "10mg" }],
    recentVisits: [{ date: "2025-10-01", reason: "Annual Checkup", provider: "Dr. Ada Lovelace" }]
  }
};

// --- 4. CHAINCODE SIMULATION ---
const ConsortiumAPI = {
  
  // --- ADMIN FUNCTIONS (New) ---
  
  getAllUsers: async (): Promise<NetworkIdentity[]> => {
    console.log(`[Chaincode] Admin Query: Fetching all identities`);
    return new Promise((resolve) => setTimeout(() => resolve(identities), 400));
  },

  getSecurityLogs: async (): Promise<AuditLog[]> => {
    console.log(`[Chaincode] Admin Query: Fetching security audit trail`);
    return new Promise((resolve) => setTimeout(() => resolve(securityLogs), 400));
  },

  suspendUser: async (userID: string): Promise<void> => {
    console.log(`[Chaincode] Admin Invoke: Suspending user ${userID}`);
    return new Promise((resolve) => {
      const user = identities.find(u => u.id === userID);
      if (user) user.status = 'SUSPENDED';
      setTimeout(resolve, 600);
    });
  },

  // --- PROVIDER FUNCTIONS ---

  requestConsent: async (providerID: string, patientID: string, purpose: string): Promise<string> => {
    console.log(`[Chaincode] Proposal: ${providerID} requests access to ${patientID}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const contractID = `con-${Math.random().toString(36).substr(2, 9)}`;
        const newContract: ConsentContract = {
          contractID,
          patientID,
          providerID,
          status: 'PENDING',
          purpose,
          timestamp: new Date().toISOString(),
          history: [{
            timestamp: new Date().toISOString(),
            action: 'REQUEST',
            actorID: providerID,
            hash: '0x' + Math.random().toString(16).substr(2, 40)
          }]
        };
        consentLedger[contractID] = newContract;
        resolve(contractID);
      }, 800);
    });
  },

  accessRecords: async (providerID: string, patientID: string): Promise<PatientRecord> => {
    console.log(`[Chaincode] Invoke: ${providerID} reading records of ${patientID}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const contract = Object.values(consentLedger).find(
          c => c.patientID === patientID && c.providerID === providerID && c.status === 'ACTIVE'
        );

        if (!contract) {
          // Log this failed attempt as a security event
          securityLogs.push({
             timestamp: new Date().toISOString(),
             action: 'ALERT',
             actorID: providerID,
             hash: '0x' + Math.random().toString(16).substr(2, 40),
             details: `Unauthorized access attempt on ${patientID}`
          });
          reject(new Error("Access Denied: No active consent contract found on the ledger."));
          return;
        }

        contract.history.push({
          timestamp: new Date().toISOString(),
          action: 'ACCESS',
          actorID: providerID,
          hash: '0x' + Math.random().toString(16).substr(2, 40)
        });

        const records = mockPatientRecords[patientID];
        if (records) resolve(records);
        else reject(new Error("Records not found off-chain."));
      }, 600);
    });
  },

  getProviderContracts: async (providerID: string): Promise<ConsentContract[]> => {
    console.log(`[Chaincode] Query: Fetching contracts for provider ${providerID}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const contracts = Object.values(consentLedger).filter(c => c.providerID === providerID);
        resolve(contracts);
      }, 400);
    });
  },

  // --- PATIENT FUNCTIONS ---

  getMyConsents: async (patientID: string): Promise<ConsentContract[]> => {
    console.log(`[Chaincode] Query: Fetching consents for ${patientID}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const myConsents = Object.values(consentLedger).filter(c => c.patientID === patientID);
        resolve(myConsents);
      }, 400);
    });
  },

  approveConsent: async (contractID: string, patientID: string): Promise<void> => {
    console.log(`[Chaincode] Invoke: ${patientID} approving contract ${contractID}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const contract = consentLedger[contractID];
        if (!contract) return reject(new Error("Contract not found"));
        
        contract.status = 'ACTIVE';
        contract.history.push({
          timestamp: new Date().toISOString(),
          action: 'APPROVE',
          actorID: patientID,
          hash: '0x' + Math.random().toString(16).substr(2, 40)
        });
        resolve();
      }, 800);
    });
  },

  revokeConsent: async (contractID: string, patientID: string): Promise<void> => {
    console.log(`[Chaincode] Invoke: ${patientID} revoking contract ${contractID}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const contract = consentLedger[contractID];
        if (!contract) return reject(new Error("Contract not found"));
        
        contract.status = 'REVOKED';
        contract.history.push({
          timestamp: new Date().toISOString(),
          action: 'REVOKE',
          actorID: patientID,
          hash: '0x' + Math.random().toString(16).substr(2, 40)
        });
        resolve();
      }, 800);
    });
  }
};

export default ConsortiumAPI;