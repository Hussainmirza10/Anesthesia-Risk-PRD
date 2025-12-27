import { PatientData, RiskScore, Recommendation } from "@/types/patient";
import { calculateASA, calculateSTOPBang, calculateRCRI, calculateMETs } from "./riskCalculations";
import { generateRecommendations } from "./recommendations";

// Helper function to calculate age from DOB
export const calculateAge = (dobString: string): number => {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const diff_ms = Date.now() - dob.getTime();
  const age_dt = new Date(diff_ms);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

// Helper function to calculate BMI
export const calculateBMI = (heightCm: number, weightKg: number): number => {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

/**
 * Processes raw patient data to calculate derived fields (age, BMI),
 * generate risk scores, and initial recommendations.
 * @param rawData The patient data as received (e.g., from upload or local storage).
 * @returns An object containing the processed patient data, calculated risk scores, and recommendations.
 */
export const processPatientDataCalculations = (
  rawData: PatientData,
) => {
  const processedData: PatientData = {
    ...rawData,
    demographics: {
      ...rawData.demographics,
      dob: rawData.demographics.dob ? new Date(rawData.demographics.dob).toISOString().split('T')[0] : "", // Ensure YYYY-MM-DD format
    },
  };

  processedData.demographics.age = calculateAge(processedData.demographics.dob);
  processedData.demographics.bmi = calculateBMI(processedData.demographics.heightCm, processedData.demographics.weightKg);

  const calculatedScores: RiskScore[] = [
    calculateASA(processedData),
    calculateSTOPBang(processedData),
    calculateRCRI(processedData),
    calculateMETs(processedData),
  ];

  const newRecommendations = generateRecommendations(processedData, calculatedScores);

  // Merge checked status from rawData.recommendations if available
  const mergedRecommendations = newRecommendations.map(newRec => {
    const oldRec = rawData.recommendations?.find(old => old.id === newRec.id);
    return oldRec ? { ...newRec, checked: oldRec.checked } : newRec;
  });

  processedData.recommendations = mergedRecommendations;

  return {
    processedPatientData: processedData,
    calculatedRiskScores: calculatedScores,
    calculatedRecommendations: mergedRecommendations,
  };
};