import { AuditLogEntry } from "@/types/patient";

export const fetchAuditLogs = async (patientId: string): Promise<AuditLogEntry[]> => {
  const token = localStorage.getItem("token");
  // Don't fetch for temporary IDs
  if (!token || !patientId || patientId.startsWith("new-patient-")) return [];

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/patients/${patientId}/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        console.error("Failed to fetch audit logs");
        return [];
    }
    return await response.json();
  } catch (error) {
      console.error("Error fetching audit logs:", error);
      return [];
  }
};

export const createAuditLogEntry = async (patientId: string, action: string, details: string): Promise<AuditLogEntry | null> => {
    const token = localStorage.getItem("token");
    // Don't create log for temporary IDs
    if (!token || !patientId || patientId.startsWith("new-patient-")) return null;

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/patients/${patientId}/audit-logs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action, details }),
        });
        
        if (!response.ok) {
            console.error("Failed to create audit log entry");
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating audit log entry:", error);
        return null;
    }
};

// Deprecated local storage functions - kept empty or logging warning to prevent breakage if called
export const getAuditLog = (): AuditLogEntry[] => {
  console.warn("getAuditLog (local storage) is deprecated. Use fetchAuditLogs (API) instead.");
  return [];
};

export const addAuditLogEntry = (action: string, details: string) => {
    console.warn("addAuditLogEntry (local storage) is deprecated. Use createAuditLogEntry (API) instead.");
};

export const clearAuditLog = () => {
    console.warn("clearAuditLog (local storage) is deprecated.");
};