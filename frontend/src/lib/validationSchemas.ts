import { z } from "zod";

export const patientDemographicsSchema = z.object({
  name: z.string().min(1, "Patient name is required."),
  dob: z.string().min(1, "Date of Birth is required.").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)."),
  age: z.number().min(0, "Age cannot be negative.").max(120, "Age seems too high."),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: "Please select a gender." }),
  }),
  heightCm: z.number().min(1, "Height must be positive.").max(300, "Height seems too high."),
  weightKg: z.number().min(1, "Weight must be positive.").max(500, "Weight seems too high."),
  bmi: z.number().min(0, "BMI cannot be negative."),
});

// You can add schemas for MedicalHistory and AirwayExam here later
export const medicalHistorySchema = z.object({
  conditions: z.array(z.string()),
  surgeries: z.array(z.string()),
  allergies: z.array(z.string()),
  medications: z.array(z.string()),
  smokingStatus: z.enum(['Never', 'Former', 'Current'], {
    errorMap: () => ({ message: "Please select smoking status." }),
  }),
  alcoholUse: z.enum(['None', 'Social', 'Moderate', 'Heavy'], {
    errorMap: () => ({ message: "Please select alcohol use." }),
  }),
  drugUse: z.enum(['None', 'Recreational', 'IV'], {
    errorMap: () => ({ message: "Please select drug use." }),
  }),
});

export const airwayExamSchema = z.object({
  mallampatiScore: z.enum(['I', 'II', 'III', 'IV', 'none'], {
    errorMap: () => ({ message: "Please select Mallampati score." }),
  }),
  thyromentalDistanceCm: z.number().nullable().refine(val => val === null || val >= 0, "Thyromental distance cannot be negative."),
  mouthOpeningCm: z.number().nullable().refine(val => val === null || val >= 0, "Mouth opening cannot be negative."),
  neckMobility: z.enum(['Normal', 'Limited', 'Severely Limited', 'none'], {
    errorMap: () => ({ message: "Please select neck mobility." }),
  }),
});