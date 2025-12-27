export interface PatientDemographics {
  id: string;
  name: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  heightCm: number;
  weightKg: number;
  bmi: number;
}

export interface MedicalHistory {
  conditions: string[];
  surgeries: string[];
  allergies: string[];
  medications: string[];
  smokingStatus: 'Never' | 'Former' | 'Current';
  alcoholUse: 'None' | 'Social' | 'Moderate' | 'Heavy';
  drugUse: 'None' | 'Recreational' | 'IV';
}

export interface AirwayExam {
  mallampatiScore: 'I' | 'II' | 'III' | 'IV' | 'none';
  thyromentalDistanceCm: number | null;
  mouthOpeningCm: number | null;
  neckMobility: 'Normal' | 'Limited' | 'Severely Limited' | 'none';
}

export interface PatientData {
  demographics: PatientDemographics;
  medicalHistory: MedicalHistory;
  airwayExam: AirwayExam;
  recommendations?: Recommendation[]; // Added to persist checked state
  clinicianNotes?: string; // Added clinician notes
}

export type RiskCategory = 'Low' | 'Moderate' | 'High';

export interface RiskScore {
  name: string;
  score: number | string;
  category: RiskCategory;
  details?: string;
}

export interface Recommendation {
  id: string;
  text: string;
  category: 'Pre-op Test' | 'Consultation' | 'Other';
  checked: boolean;
}

export interface CriticalAlert {
  id: string;
  message: string;
  type: 'Warning' | 'Critical';
}

export interface AuditLogEntry {
  timestamp: string;
  userId: string; // Mock user ID for frontend-only
  action: string;
  details: string;
}