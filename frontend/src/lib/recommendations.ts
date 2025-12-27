import { PatientData, RiskScore, Recommendation } from "@/types/patient";

export const generateRecommendations = (patient: PatientData, riskScores: RiskScore[]): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  const conditions = patient.medicalHistory.conditions.map(c => c.toLowerCase());
  const medications = patient.medicalHistory.medications.map(m => m.toLowerCase());

  const addRecommendation = (text: string, category: Recommendation['category']) => {
    if (!recommendations.some(r => r.text === text)) {
      recommendations.push({ id: `rec-${recommendations.length + 1}`, text, category, checked: false });
    }
  };

  // EKG
  if (patient.demographics.age >= 50 || riskScores.some(s => s.name === "RCRI (Cardiac Risk)" && s.score > 0)) {
    addRecommendation("EKG", "Pre-op Test");
  }

  // CBC
  if (conditions.some(c => c.includes("anemia")) || medications.includes("warfarin") || medications.includes("aspirin")) {
    addRecommendation("CBC (Complete Blood Count)", "Pre-op Test");
  }

  // INR
  if (medications.includes("warfarin") || medications.includes("clopidogrel") || medications.includes("rivaroxaban")) {
    addRecommendation("INR (International Normalized Ratio)", "Pre-op Test");
  }

  // CMP (Comprehensive Metabolic Panel)
  if (conditions.includes("type 2 diabetes") || conditions.includes("hypertension") || conditions.includes("kidney disease")) {
    addRecommendation("CMP (Comprehensive Metabolic Panel)", "Pre-op Test");
  }

  // HbA1c
  if (conditions.includes("type 2 diabetes")) {
    addRecommendation("HbA1c", "Pre-op Test");
  }

  // Sleep Study
  if (riskScores.some(s => s.name === "STOP-Bang Score (OSA Risk)" && (s.category === "Moderate" || s.category === "High"))) {
    addRecommendation("Sleep Study (if not already diagnosed/managed)", "Consultation");
  }

  // OB clearance
  if (patient.demographics.gender === "Female" && patient.demographics.age >= 12 && patient.demographics.age <= 50) {
    addRecommendation("OB Clearance / Pregnancy Test", "Pre-op Test");
  }

  // Cardiology Consult
  if (riskScores.some(s => s.name === "RCRI (Cardiac Risk)" && s.category === "High")) {
    addRecommendation("Cardiology Consultation", "Consultation");
  }

  // Pulmonology Consult
  if (conditions.some(c => c.includes("copd") || c.includes("severe asthma")) || riskScores.some(s => s.name === "ASA Physical Status" && s.category === "High" && s.details?.includes("Obstructive Sleep Apnea"))) {
    addRecommendation("Pulmonology Consultation", "Consultation");
  }

  return recommendations;
};