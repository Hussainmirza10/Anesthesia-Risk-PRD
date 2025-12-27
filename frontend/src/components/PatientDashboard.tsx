import React, { useState, useEffect, useCallback } from "react";
import {
  PatientData,
  RiskScore,
  Recommendation,
  CriticalAlert,
  AirwayExam,
  AuditLogEntry,
  PatientDemographics,
  MedicalHistory,
} from "@/types/patient";
import { generateCriticalAlerts } from "@/lib/alerts";
import { createAuditLogEntry, fetchAuditLogs } from "@/lib/auditLog";
import { processPatientDataCalculations } from "@/lib/patientDataProcessing";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RiskScoreCard from "./RiskScoreCard";
import RecommendationsCard from "./RecommendationsCard";
import CriticalAlerts from "./CriticalAlerts";
import PdfExportButton from "./PdfExportButton";
import JsonUploadDialog from "./JsonUploadDialog";
import AirwayExamForm from "./AirwayExamForm";
import RiskSummaryChart from "./RiskSummaryChart";
import PatientDemographicsForm from "./PatientDemographicsForm";
import PatientMedicalHistoryForm from "./PatientMedicalHistoryForm";
import PatientSelector from "./PatientSelector";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const LOCAL_STORAGE_KEY = "anesthesia_risk_patient_data";

// Blank patient data for starting a new assessment
const BLANK_PATIENT_DATA: PatientData = {
  demographics: {
    id: "", // Will be generated dynamically
    name: "",
    dob: "",
    age: 0,
    gender: "Other",
    heightCm: 0,
    weightKg: 0,
    bmi: 0,
  },
  medicalHistory: {
    conditions: [],
    surgeries: [],
    allergies: [],
    medications: [],
    smokingStatus: "None",
    alcoholUse: "None",
    drugUse: "None",
  },
  airwayExam: {
    mallampatiScore: "none",
    thyromentalDistanceCm: null,
    mouthOpeningCm: null,
    neckMobility: "none",
  },
  recommendations: [],
  clinicianNotes: "",
};

const PatientDashboard: React.FC = () => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  // Manage all mock patients in state, initialized from the JSON file
  const [allMockPatients, setAllMockPatients] = useState<PatientData[]>([]);

  const refreshAuditLogs = useCallback(async (patientId: string) => {
    if (!patientId || patientId.startsWith("new-patient-")) {
      setAuditLog([]);
      return;
    }
    const logs = await fetchAuditLogs(patientId);
    setAuditLog(logs);
  }, []);

  const logAction = async (action: string, details: string, patientId?: string) => {
    const id = patientId || patientData?.demographics.id;
    if (id && !id.startsWith("new-patient-")) {
      await createAuditLogEntry(id, action, details);
      await refreshAuditLogs(id);
    }
  };

  const fetchPatients = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/patients/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Map _id to id for frontend compatibility
        const mappedData = data.map((p: any) => ({
            ...p,
            demographics: { ...p.demographics, id: p._id }
        }));
        setAllMockPatients(mappedData);
      }
    } catch (error) {
      console.error("Failed to fetch patients", error);
    }
  }, []);

  const processAndSetPatientData = useCallback((data: PatientData) => {
    // Ensure a unique ID for new patients if not already set
    const dataWithId = {
      ...data,
      demographics: {
        ...data.demographics,
        id: data.demographics.id || "new-patient-" + Date.now(),
      },
      clinicianNotes: data.clinicianNotes || "", // Ensure notes are initialized
    };

    const { processedPatientData, calculatedRiskScores, calculatedRecommendations } =
      processPatientDataCalculations(dataWithId);

    setPatientData(processedPatientData);
    setRiskScores(calculatedRiskScores);
    setRecommendations(calculatedRecommendations);
    // localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(processedPatientData)); // Disabled local storage
    // Auto-logging "Data Processed" removed to avoid noise and async complexity here.
    // Specific handlers will log actions.
  }, []);

  const loadPatientData = useCallback(async () => {
    try {
        await fetchPatients();
        // Load initial blank patient or first fetched patient?
        // For now, load blank patient to start fresh or select from list
        processAndSetPatientData({ ...BLANK_PATIENT_DATA, demographics: { ...BLANK_PATIENT_DATA.demographics, id: "new-patient-" + Date.now() } });
        setAuditLog([]);
    } catch (error: any) {
      toast.error(`Failed to load patient data: ${error.message}`);
      // addAuditLogEntry("Data Load Error", `Failed to load patient data: ${error.message}`);
    }
  }, [processAndSetPatientData, fetchPatients]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  useEffect(() => {
    if (patientData) {
      setAlerts(generateCriticalAlerts(patientData));
    }
  }, [patientData]);

  const handleDemographicsChange = (updatedFields: Partial<PatientDemographics>) => {
    if (!patientData) return;

    const oldDemographics = { ...patientData.demographics };

    const updatedPatientData: PatientData = {
      ...patientData,
      demographics: {
        ...patientData.demographics,
        ...updatedFields,
      },
    };

    processAndSetPatientData(updatedPatientData);

    const changedFields = Object.keys(updatedFields) as Array<keyof PatientDemographics>;
    const auditDetails = changedFields.map(field => {
      const oldValue = oldDemographics[field];
      const newValue = (updatedFields as any)[field];
      return `${field} changed from ${oldValue} to ${newValue}`;
    }).join("; ");
    logAction("Demographics Update", auditDetails, updatedPatientData.demographics.id);
  };

  const handleMedicalHistoryChange = (updatedMedicalHistory: MedicalHistory) => {
    if (!patientData) return;

    const updatedPatientData: PatientData = {
      ...patientData,
      medicalHistory: updatedMedicalHistory,
    };
    processAndSetPatientData(updatedPatientData);

    logAction("Medical History Update", `Medical history for ${patientData.demographics.name || "current patient"} updated.`, updatedPatientData.demographics.id);
  };

  const handleAirwayExamChange = (updatedAirwayExam: AirwayExam) => {
    if (!patientData) return;

    const updatedPatientData = {
      ...patientData,
      airwayExam: updatedAirwayExam,
    };
    processAndSetPatientData(updatedPatientData);

    logAction("Airway Exam Update", `Airway Exam for ${patientData.demographics.name || "current patient"} updated.`, updatedPatientData.demographics.id);
  };

  const handleClinicianNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!patientData) return;
    const { value } = e.target;
    const updatedPatientData = {
      ...patientData,
      clinicianNotes: value,
    };
    processAndSetPatientData(updatedPatientData);
    // Debouncing or on-blur would be better for API logging, but for now we log.
    // Actually, logging on every keystroke to API is bad. Let's rely on Save for full persistence,
    // or log only when saving? The original code logged on change.
    // I'll leave it but this might spam the server.
    // For now, I'll comment out the logAction here to prevent spamming.
    // logAction("Clinician Notes Update", `Clinician Notes updated.`, updatedPatientData.demographics.id);
  };

  const handleRecommendationToggle = (id: string, checked: boolean) => {
    if (!patientData) return;

    const updatedRecommendations = recommendations.map((rec) =>
      rec.id === id ? { ...rec, checked } : rec
    );

    const updatedPatientData: PatientData = {
      ...patientData,
      recommendations: updatedRecommendations,
    };

    processAndSetPatientData(updatedPatientData);

    logAction("Recommendation Toggle", `Recommendation ${id} set to ${checked}`, updatedPatientData.demographics.id);
  };

  const savePatientData = async () => {
    if (patientData) {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const isNew = patientData.demographics.id.startsWith("new-patient-");
            const url = isNew
                ? `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/patients/`
                : `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/patients/${patientData.demographics.id}`;
            const method = isNew ? "POST" : "PUT";

            // Prepare payload to match backend expectation (id in demographics might be ignored by backend but useful for us)
            const payload = {
                ...patientData,
                // Ensure recommendations checked state is preserved
                recommendations: recommendations
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to save patient");
            }

            const savedPatient = await response.json();
             // Update local state with saved data (especially important for new patients to get their DB ID)
             const mappedSavedPatient = {
                 ...savedPatient,
                 demographics: { ...savedPatient.demographics, id: savedPatient._id }
             };
            
            processAndSetPatientData(mappedSavedPatient);
            await fetchPatients(); // Refresh list

            await logAction("Data Saved", `Patient data for ${patientData.demographics.name || "current patient"} saved to database.`, mappedSavedPatient.demographics.id);
            toast.success("Patient data saved successfully!");
            refreshAuditLogs(mappedSavedPatient.demographics.id);

        } catch (error) {
            toast.error("Failed to save patient data");
            console.error(error);
        }
    }
  };

  const handleNewPatient = () => {
    processAndSetPatientData({ ...BLANK_PATIENT_DATA, demographics: { ...BLANK_PATIENT_DATA.demographics, id: "new-patient-" + Date.now() } });
    toast.info("New patient record created.");
    setAuditLog([]);
  };

  const handleClearAuditLog = () => {
    setAuditLog([]);
    toast.info("Audit log view cleared (server logs remain).");
  };

  const handleSelectMockPatient = (patient: PatientData) => {
    // Ensure clinicianNotes is initialized for mock patients if not present
    const patientWithNotes = { ...patient, clinicianNotes: patient.clinicianNotes || "" };
    processAndSetPatientData(patientWithNotes);
    toast.success(`Loaded patient: ${patient.demographics.name}`);
    
    // Refresh audit logs for the selected patient
    refreshAuditLogs(patient.demographics.id);
    
    // Log the view action?
    logAction("Load Patient", `Loaded patient: ${patient.demographics.name}`, patient.demographics.id);
  };

  if (!patientData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading patient data...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8" id="patient-dashboard-content">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Anesthesia Risk Assessment Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Demographics */}
          <PatientDemographicsForm
            demographics={patientData.demographics}
            onDemographicsChange={handleDemographicsChange}
          />

          {/* Medical History */}
          <PatientMedicalHistoryForm
            medicalHistory={patientData.medicalHistory}
            onMedicalHistoryChange={handleMedicalHistoryChange}
          />

          {/* Airway Exam */}
          <AirwayExamForm
            airwayExam={patientData.airwayExam}
            onAirwayExamChange={handleAirwayExamChange}
          />

          {/* Clinician Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Clinician Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="clinicianNotes"
                name="clinicianNotes"
                value={patientData.clinicianNotes || ""}
                onChange={handleClinicianNotesChange}
                placeholder="Add any additional clinician notes here..."
                rows={5}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar for Risk Scores, Alerts, Recommendations */}
        <div className="lg:col-span-1 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="actions-audit">Actions & Audit</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6 mt-4">
              {/* Critical Alerts */}
              <CriticalAlerts alerts={alerts} />

              {/* Risk Category Summary Chart */}
              <RiskSummaryChart riskScores={riskScores} />

              {/* Risk Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Anesthesia Risk Scores</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {riskScores.map((score) => (
                    <RiskScoreCard key={score.name} score={score} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="recommendations" className="space-y-6 mt-4">
              {/* Recommendations */}
              <RecommendationsCard
                recommendations={recommendations}
                onRecommendationToggle={handleRecommendationToggle}
              />
            </TabsContent>
            <TabsContent value="actions-audit" className="space-y-6 mt-4">
              {/* Patient Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Load Patient</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PatientSelector
                    patients={allMockPatients}
                    onSelectPatient={handleSelectMockPatient}
                    currentPatientId={patientData.demographics.id}
                  />
                  <Separator />
                  <Button onClick={() => setIsUploadDialogOpen(true)} className="w-full" variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Upload Patient JSON
                  </Button>
                  <Button onClick={handleNewPatient} variant="destructive" className="w-full">
                    New Patient / Clear Data
                  </Button>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={savePatientData} className="w-full">
                    Save Patient Data
                  </Button>
                  <PdfExportButton
                    targetElementId="patient-dashboard-content"
                    fileName={`Anesthesia_Risk_Report_${patientData.demographics.name.replace(/\s/g, '_') || 'New_Patient'}.pdf`}
                  />
                  <Separator />
                  <Button onClick={handleClearAuditLog} variant="outline" className="w-full">
                    Clear Audit Log
                  </Button>
                </CardContent>
              </Card>

              {/* Audit Trail */}
              <Card>
                <CardHeader>
                  <CardTitle>Audit Trail</CardTitle>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto text-sm">
                  {auditLog.length === 0 ? (
                    <p className="text-muted-foreground">No audit entries yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {auditLog.map((entry, index) => (
                        <div key={index} className="border-b pb-2 last:border-b-0">
                          <p className="font-medium">{entry.action}</p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(entry.timestamp).toLocaleString()} by {entry.userId}
                          </p>
                          <p className="text-xs">{entry.details}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <JsonUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onDataUpload={processAndSetPatientData}
      />
    </div>
  );
};

export default PatientDashboard;