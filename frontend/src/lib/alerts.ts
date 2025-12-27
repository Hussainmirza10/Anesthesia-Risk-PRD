import { PatientData, CriticalAlert } from "@/types/patient";

export const generateCriticalAlerts = (patient: PatientData): CriticalAlert[] => {
  const alerts: CriticalAlert[] = [];
  const conditions = patient.medicalHistory.conditions.map(c => c.toLowerCase());
  const medications = patient.medicalHistory.medications.map(m => m.toLowerCase());
  const allergies = patient.medicalHistory.allergies.map(a => a.toLowerCase());

  const addAlert = (message: string, type: CriticalAlert['type']) => {
    alerts.push({ id: `alert-${alerts.length + 1}`, message, type });
  };

  // Anticoagulants
  if (medications.some(m => ["warfarin", "clopidogrel", "rivaroxaban", "apixaban", "dabigatran"].includes(m))) {
    addAlert("Patient is on anticoagulants. Assess bleeding risk and consult with prescribing physician.", "Critical");
  }

  // Allergies
  if (allergies.length > 0) {
    addAlert(`Patient has known allergies: ${patient.medicalHistory.allergies.join(", ")}. Review for anesthetic agents.`, "Warning");
  }

  // OSA
  if (conditions.includes("obstructive sleep apnea")) {
    addAlert("Patient has Obstructive Sleep Apnea. High risk for airway complications. Consider CPAP/BiPAP post-op.", "Critical");
  }

  // Airway issues (based on manual entry)
  if (patient.airwayExam.mallampatiScore === "III" || patient.airwayExam.mallampatiScore === "IV") {
    addAlert(`High Mallampati score (${patient.airwayExam.mallampatiScore}). Potential difficult airway.`, "Critical");
  }
  if (patient.airwayExam.thyromentalDistanceCm !== null && patient.airwayExam.thyromentalDistanceCm < 6) {
    addAlert(`Short thyromental distance (${patient.airwayExam.thyromentalDistanceCm} cm). Potential difficult airway.`, "Critical");
  }
  if (patient.airwayExam.mouthOpeningCm !== null && patient.airwayExam.mouthOpeningCm < 3) {
    addAlert(`Limited mouth opening (${patient.airwayExam.mouthOpeningCm} cm). Potential difficult airway.`, "Critical");
  }
  if (patient.airwayExam.neckMobility === "Limited" || patient.airwayExam.neckMobility === "Severely Limited") {
    addAlert(`Limited neck mobility (${patient.airwayExam.neckMobility}). Potential difficult airway.`, "Critical");
  }

  // Uncontrolled Hypertension
  if (conditions.includes("hypertension") && !medications.includes("lisinopril") && !medications.includes("amlodipine")) { // Simplified check
    addAlert("Patient has hypertension, but no antihypertensive medication listed. Consider if uncontrolled.", "Warning");
  }

  // Uncontrolled Diabetes
  if (conditions.includes("type 2 diabetes") && !medications.includes("metformin") && !medications.includes("insulin")) { // Simplified check
    addAlert("Patient has diabetes, but no diabetic medication listed. Consider if uncontrolled.", "Warning");
  }

  return alerts;
};