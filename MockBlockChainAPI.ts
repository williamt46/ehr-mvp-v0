// This is our new, stateful, TypeScript-based mock backend.

// --- 1. Define Data Structures ---
// These types will be shared by our frontend components.
export interface PatientRecord {
  patientInfo: { id: string; name: string; dob: string };
  allergies: string[];
  medications: { name: string; dosage: string }[];
  recentVisits: { date: string; reason: string; provider: string }[];
}

export interface AccessRequest {
  requestID: string;
  providerID: string; // We MUST know who is asking
  providerName: string;
  patientID: string;
  purpose: string;
  durationDays: number;
}

export interface ActivePermission {
  permissionID: string;
  providerID: string;
  patientID: string;
  providerName: string;
  expiryDate: string; // ISO String
}

// --- 2. In-Memory "Database" ---
// We use 'let' so the arrays can be modified at runtime.

let mockPending: AccessRequest[] = [
  {
    requestID: 'req-001',
    providerID: 'provider-ada-l', // Dr. Lovelace's ID
    providerName: 'Ada Lovelace',
    patientID: 'patient-123', // For our demo patient
    purpose: 'Routine Checkup Follow-up',
    durationDays: 30,
  },
  {
    requestID: 'req-002',
    providerID: 'provider-grace-h', // Dr. Hopper's ID
    providerName: 'Grace Hopper',
    patientID: 'patient-456', // For another patient
    purpose: 'Specialist Consultation',
    durationDays: 7,
  },
];

// --- THIS IS THE CRITICAL FIX ---
// mockActive now starts EMPTY. Access is "denied by default".
let mockActive: ActivePermission[] = [
  // {
  //   permissionID: 'perm-001',
  //   providerID: 'provider-alan-t',
  //   patientID: 'patient-123',
  //   providerName: 'Alan Turing',
  //   expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  // }
  // ^^^ We have removed the default "perm-001" to satisfy the new requirement.
];

const mockPatientRecords: { [key: string]: PatientRecord } = {
  "patient-123": {
    patientInfo: { id: "patient-123", name: "Alex Johnson", dob: "1985-04-12" },
    allergies: ["Peanuts", "Penicillin"],
    medications: [{ name: "Lisinopril", dosage: "10mg" }],
    recentVisits: [{ date: "2025-10-01", reason: "Annual Checkup", provider: "Dr. Ada Lovelace" }]
  },
  "patient-456": {
     patientInfo: { id: "patient-456", name: "Maria Garcia", dob: "1992-11-30" },
     allergies: ["None"],
     medications: [],
     recentVisits: [{ date: "2025-09-15", reason: "Flu Shot", provider: "Dr. Marie Curie" }]
  }
};

// --- 3. Refactored API Functions ---

const BlockchainAPI = {
  // --- Patient Portal Functions ---

  getPendingRequests(patientID: string): Promise<AccessRequest[]> {
    console.log(`[MockAPI] Fetching pending requests for: ${patientID}`);
    return new Promise((resolve) => {
      const requests = mockPending.filter(req => req.patientID === patientID);
      setTimeout(() => resolve(requests), 300);
    });
  },

  getActivePermissions(patientID: string): Promise<ActivePermission[]> {
    console.log(`[MockAPI] Fetching active permissions for: ${patientID}`);
    return new Promise((resolve) => {
      const permissions = mockActive.filter(perm => perm.patientID === patientID);
      setTimeout(() => resolve(permissions), 300);
    });
  },

  // --- THIS IS THE CORE OF USER STORY 2 ---
  respondToAccessRequest(requestID: string, approved: boolean, patientID: string): Promise<void> {
    console.log(`[MockAPI] Responding to ${requestID}: ${approved} for ${patientID}`);
    return new Promise((resolve) => {
      const index = mockPending.findIndex((req) => req.requestID === requestID);
      if (index > -1) {
        // Remove from pending list
        const [request] = mockPending.splice(index, 1);

        if (approved) {
          // If approved, add to active list
          const newPermission: ActivePermission = {
            permissionID: `perm-${Math.random().toString(36).substring(7)}`,
            providerID: request.providerID, // <-- We add the correct providerID
            patientID: request.patientID,
            providerName: request.providerName,
            expiryDate: new Date(Date.now() + request.durationDays * 24 * 60 * 60 * 1000).toISOString(),
          };
          mockActive.push(newPermission);
          console.log('[MockAPI] New permission added to mockActive:', newPermission);
        }
      }
      setTimeout(resolve, 300);
    });
  },

  revokePermission(permissionID: string): Promise<void> {
    console.log(`[MockAPI] Revoking ${permissionID}`);
    return new Promise((resolve) => {
      const index = mockActive.findIndex((perm) => perm.permissionID === permissionID);
      if (index > -1) {
        mockActive.splice(index, 1);
      }
      setTimeout(resolve, 300);
    });
  },

  // --- Provider Portal Functions ---

  requestAccess(data: { providerID: string; patientID: string; purpose: string; durationDays: number }): Promise<string> {
    console.log('[MockAPI] Requesting access for:', data);
    const requestID = `req-${Math.random().toString(36).substring(7)}`;
    
    // We get a "real" provider name based on their ID
    const providerName = 'House' ; // + data.providerID.split('-')[0].charAt(0).toUpperCase() + data.providerID.split('-')[0].slice(1)
    
    const newRequest: AccessRequest = {
      requestID,
      providerID: data.providerID,
      providerName: providerName,
      patientID: data.patientID,
      purpose: data.purpose,
      durationDays: data.durationDays,
    };
    
    mockPending.push(newRequest);
    console.log('[MockAPI] New request added to mockPending:', newRequest);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(requestID), 500);
    });
  },

  // --- THIS IS THE CORE OF USER STORY 1 ---
  verifyAccess(providerID: string, patientID: string): Promise<boolean> {
    console.log(`[MockAPI] Verifying access for Provider: ${providerID} on Patient: ${patientID}`);
    
    // This function is now "smart". It checks all 3 conditions.
    const hasPermission = mockActive.some(
      p =>
        p.providerID === providerID &&
        p.patientID === patientID &&
        new Date(p.expiryDate) > new Date() // Check for expiration
    );
    
    console.log(`[MockAPI] Verification result: ${hasPermission}`);
    return new Promise((resolve) => {
        setTimeout(() => resolve(hasPermission), 400);
    });
  },

  getPatientRecords(patientID: string): Promise<PatientRecord> {
     console.log(`[MockAPI] Fetching records for patient: ${patientID}`);
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const records = mockPatientRecords[patientID];
            if (records) {
                resolve(records);
            } else {
                reject(new Error("No records found for this patient ID."));
            }
        }, 800);
     });
  }
};

export default BlockchainAPI;
