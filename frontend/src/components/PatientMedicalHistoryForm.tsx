import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MultiInputTag from "./MultiInputTag";
import { MedicalHistory } from "@/types/patient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicalHistorySchema } from "@/lib/validationSchemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PatientMedicalHistoryFormProps {
  medicalHistory: MedicalHistory;
  onMedicalHistoryChange: (updatedMedicalHistory: MedicalHistory) => void;
}

const PatientMedicalHistoryForm: React.FC<PatientMedicalHistoryFormProps> = ({
  medicalHistory,
  onMedicalHistoryChange,
}) => {
  const form = useForm<MedicalHistory>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: medicalHistory,
    mode: "onChange", // Validate on change
  });

  // Reset form with new medicalHistory prop values
  useEffect(() => {
    form.reset(medicalHistory);
  }, [medicalHistory, form]);

  // Watch for changes and emit valid data
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Only emit changes if the form is valid
      if (form.formState.isValid) {
        onMedicalHistoryChange(value as MedicalHistory);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onMedicalHistoryChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical History</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conditions</FormLabel>
                  <FormControl>
                    <MultiInputTag
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add condition"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medications</FormLabel>
                  <FormControl>
                    <MultiInputTag
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add medication"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <FormControl>
                    <MultiInputTag
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add allergy"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surgeries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Surgical History</FormLabel>
                  <FormControl>
                    <MultiInputTag
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add surgery"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smokingStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Smoking Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Never">Never</SelectItem>
                      <SelectItem value="Former">Former</SelectItem>
                      <SelectItem value="Current">Current</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alcoholUse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alcohol Use</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Use" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="drugUse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drug Use</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Use" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Recreational">Recreational</SelectItem>
                      <SelectItem value="IV">IV</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PatientMedicalHistoryForm;