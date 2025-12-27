import { PatientData, RiskCategory, RiskScore } from "@/types/patient";

export const calculateASA = (patient: PatientData): RiskScore => {
  let score = 1;
  let details: string[] = [];

  if (patient.medicalHistory.conditions.includes("Hypertension")) {
    score = Math.max(score, 2);
    details.push("Hypertension");
  }
  if (patient.medicalHistory.conditions.includes("Type 2 Diabetes")) {
    score = Math.max(score, 2);
    details.push("Type 2 Diabetes");
  }
  if (patient.medicalHistory.conditions.includes("Obstructive Sleep Apnea")) {
    score = Math.max(score, 3);
    details.push("Obstructive Sleep Apnea");
  }
  if (patient.demographics.bmi >= 30) {
    score = Math.max(score, 2);
    details.push("BMI >= 30");
  }
  if (patient.medicalHistory.smokingStatus === "Current") {
    score = Math.max(score, 2);
    details.push("Current smoker");
  }
  if (patient.medicalHistory.alcoholUse === "Heavy") {
    score = Math.max(score, 3);
    details.push("Heavy alcohol use");
  }

  let category: RiskCategory = "Low";
  if (score >= 3) category = "High";
  else if (score === 2) category = "Moderate";

  return {
    name: "ASA Physical Status",
    score: `ASA ${score}`,
    category,
    details: details.length > 0 ? `Conditions: ${details.join(", ")}` : "No significant comorbidities.",
  };
};

export const calculateSTOPBang = (patient: PatientData): RiskScore => {
  let score = 0;
  let details: string[] = [];

  // S - Snoring
  // T - Tiredness
  // O - Observed apnea
  // P - High blood Pressure
  // B - BMI (>27 kg/m2)
  // A - Age (>50 years)
  // N - Neck circumference (>16 inches / 40 cm) - Not available in mock data, assume no for now
  // G - Gender (Male)

  // For simplicity, we'll infer some from conditions and demographics
  if (patient.medicalHistory.conditions.includes("Obstructive Sleep Apnea")) {
    score += 4; // Assume S, T, O, P are present if OSA is diagnosed
    details.push("Diagnosed OSA (implies S, T, O, P)");
  } else {
    // If OSA not diagnosed, check individual factors
    if (patient.medicalHistory.conditions.includes("Hypertension")) { // P - High blood Pressure
      score++;
      details.push("Hypertension (P)");
    }
    // Snoring, Tiredness, Observed apnea are subjective and not in current mock data.
    // For a real app, these would come from a questionnaire.
  }

  if (patient.demographics.bmi > 27) { // B - BMI
    score++;
    details.push(`BMI > 27 (${patient.demographics.bmi.toFixed(1)})`);
  }
  if (patient.demographics.age > 50) { // A - Age
    score++;
    details.push(`Age > 50 (${patient.demographics.age})`);
  }
  if (patient.demographics.gender === "Male") { // G - Gender
    score++;
    details.push("Male gender (G)");
  }

  let category: RiskCategory = "Low";
  if (score >= 5) category = "High";
  else if (score >= 3) category = "Moderate";

  return {
    name: "STOP-Bang Score (OSA Risk)",
    score: score,
    category,
    details: details.length > 0 ? `Factors: ${details.join(", ")}` : "No significant STOP-Bang factors identified.",
  };
};

export const calculateRCRI = (patient: PatientData): RiskScore => {
  let score = 0;
  let details: string[] = [];

  // RCRI (Revised Cardiac Risk Index) factors:
  // 1. High-risk surgery (not applicable for general assessment, assume minor for OMS)
  // 2. History of ischemic heart disease (IHD)
  // 3. History of congestive heart failure (CHF)
  // 4. History of cerebrovascular disease (CVD)
  // 5. Preoperative treatment with insulin
  // 6. Preoperative serum creatinine > 2.0 mg/dL (not available in mock data)

  // For simplicity, we'll check for related conditions
  const conditions = patient.medicalHistory.conditions.map(c => c.toLowerCase());

  if (conditions.some(c => c.includes("heart disease") || c.includes("angina") || c.includes("myocardial infarction"))) {
    score++;
    details.push("Ischemic Heart Disease");
  }
  if (conditions.some(c => c.includes("heart failure"))) {
    score++;
    details.push("Congestive Heart Failure");
  }
  if (conditions.some(c => c.includes("stroke") || c.includes("tia"))) {
    score++;
    details.push("Cerebrovascular Disease");
  }
  if (patient.medicalHistory.medications.includes("Insulin")) {
    score++;
    details.push("Insulin use");
  }
  // Creatinine > 2.0 mg/dL is not in mock data.

  let category: RiskCategory = "Low";
  if (score >= 3) category = "High";
  else if (score >= 1) category = "Moderate";

  return {
    name: "RCRI (Cardiac Risk)",
    score: score,
    category,
    details: details.length > 0 ? `Factors: ${details.join(", ")}` : "No significant RCRI factors identified.",
  };
};

export const calculateMETs = (patient: PatientData): RiskScore => {
  // METs (Metabolic Equivalents) are a measure of functional capacity.
  // This is typically assessed via patient questionnaire (e.g., "Can you walk up two flights of stairs?").
  // Since we don't have a questionnaire, we'll make a simplified inference based on age and conditions.
  // <4 METs = Poor functional capacity (High Risk)
  // 4-10 METs = Moderate functional capacity (Moderate Risk)
  // >10 METs = Excellent functional capacity (Low Risk)

  let inferredMETs = 10; // Start with excellent
  let details: string[] = [];

  if (patient.demographics.age >= 70) {
    inferredMETs -= 2;
    details.push("Age >= 70");
  }
  if (patient.medicalHistory.conditions.includes("Congestive Heart Failure") || patient.medicalHistory.conditions.includes("COPD")) {
    inferredMETs -= 4;
    details.push("Severe cardiac/pulmonary condition");
  }
  if (patient.medicalHistory.conditions.includes("Hypertension") || patient.medicalHistory.conditions.includes("Type 2 Diabetes")) {
    inferredMETs -= 1;
    details.push("Chronic conditions (HTN, DM)");
  }
  if (patient.demographics.bmi >= 35) {
    inferredMETs -= 2;
    details.push("BMI >= 35");
  }

  inferredMETs = Math.max(1, inferredMETs); // METs cannot be less than 1

  let category: RiskCategory = "Low";
  if (inferredMETs < 4) category = "High";
  else if (inferredMETs < 10) category = "Moderate";

  return {
    name: "METs (Functional Capacity)",
    score: `${inferredMETs} METs`,
    category,
    details: details.length > 0 ? `Inferred factors: ${details.join(", ")}` : "Good functional capacity inferred.",
  };
};