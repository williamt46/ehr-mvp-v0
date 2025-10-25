// This is our centralized, shared, in-memory "backend" for local testing.
// Place this file in the root of your 'ehr-mvp' project.

const mockPending = [
  {
    requestID: 'req-001',
    providerName: 'Ada Lovelace',
    purpose: 'Routine Checkup Follow-up',
    durationDays: 30,
  },
  {
    requestID: 'req-002',
    providerName: 'Grace Hopper',
    purpose: 'Specialist Consultation',
    durationDays: 7,
  },
];

const mockActive = [
  {
    permissionID: 'perm-001',
    providerName: 'Alan Turing',
    patientID: 'patient-123', // Active permission for our demo patient
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
  },
  {
    permissionID: 'perm-002',
    providerName: 'Marie Curie',
    patientID: 'patient-456',
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
  },
];

const mockPatientRecords = {
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

// We export the API object for the portals to import
const BlockchainAPI = {
  // --- Patient Portal Functions ---
  getPendingRequests: (patientID) => {
    console.log('[MockAPI] Fetching pending requests for:', patientID);
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockPending]), 500); // Return a copy
    });
  },
  getActivePermissions: (patientID) => {
    console.log('[MockAPI] Fetching active permissions for:', patientID);
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockActive.filter(p => p.patientID === patientID)), 500);
    });
  },
  respondToAccessRequest: (requestID, approved, patientID) => {
    console.log(`[MockAPI] Responding to ${requestID}: ${approved} for ${patientID}`);
    const index = mockPending.findIndex((req) => req.requestID === requestID);
    if (index > -1) {
      const [removed] = mockPending.splice(index, 1);
      if (approved) {
        mockActive.push({
          permissionID: `perm-${Math.random().toString(36).substring(7)}`,
          providerName: removed.providerName,
          patientID: patientID, // Tag the new permission with the patient's ID
          expiryDate: new Date(
            Date.now() + removed.durationDays * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
      }
    }
    return new Promise((resolve) => setTimeout(resolve, 300));
  },
  revokePermission: (permissionID) => {
    console.log(`[MockAPI] Revoking ${permissionID}`);
    const index = mockActive.findIndex((perm) => perm.permissionID === permissionID);
    if (index > -1) {
      mockActive.splice(index, 1);
    }
    return new Promise((resolve) => setTimeout(resolve, 300));
  },

  // --- Provider Portal Functions ---
  requestAccess: ({ providerID, patientID, purpose, durationDays = 30 }) => {
    console.log('[MockAPI] Requesting access for:', { providerID, patientID, purpose, durationDays });
    const requestID = `req-${Math.random().toString(36).substring(7)}`;
    const providerName = 'Dr. ' + providerID.split('-')[0].charAt(0).toUpperCase() + providerID.split('-')[0].slice(1);
    
    mockPending.push({
        requestID,
        providerName: providerName,
        purpose,
        durationDays
    });
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(requestID), 500);
    });
  },
  verifyAccess: (providerID, patientID) => {
    console.log('[MockAPI] Verifying access for:', providerID, patientID);
    const hasPermission = mockActive.some(
      p => p.patientID === patientID && new Date(p.expiryDate) > new Date()
    );
    return new Promise((resolve) => {
        setTimeout(() => resolve(hasPermission), 400);
    });
  },
  getPatientRecords: (patientID) => {
     console.log('[MockAPI] Fetching records for patient:', patientID);
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

