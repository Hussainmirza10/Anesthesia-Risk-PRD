import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PatientData } from "@/types/patient";

interface PatientSelectorProps {
  patients: PatientData[];
  onSelectPatient: (patient: PatientData) => void;
  currentPatientId?: string;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({
  patients,
  onSelectPatient,
  currentPatientId,
}) => {
  const handleValueChange = (patientId: string) => {
    const selectedPatient = patients.find((p) => p.demographics.id === patientId);
    if (selectedPatient) {
      onSelectPatient(selectedPatient);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="patient-select">Select Mock Patient</Label>
      <Select onValueChange={handleValueChange} value={currentPatientId || ""}>
        <SelectTrigger id="patient-select">
          <SelectValue placeholder="Select a patient" />
        </SelectTrigger>
        <SelectContent>
          {patients.map((patient) => (
            <SelectItem key={patient.demographics.id} value={patient.demographics.id}>
              {patient.demographics.name} (Age: {patient.demographics.age})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PatientSelector;