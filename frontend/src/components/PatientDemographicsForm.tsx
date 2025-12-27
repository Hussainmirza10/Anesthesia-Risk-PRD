import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PatientDemographics } from "@/types/patient";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientDemographicsSchema } from "@/lib/validationSchemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PatientDemographicsFormProps {
  demographics: PatientDemographics;
  onDemographicsChange: (updatedFields: Partial<PatientDemographics>) => void;
}

const PatientDemographicsForm: React.FC<PatientDemographicsFormProps> = ({
  demographics,
  onDemographicsChange,
}) => {
  const form = useForm<PatientDemographics>({
    resolver: zodResolver(patientDemographicsSchema),
    defaultValues: demographics,
    mode: "onChange", // Validate on change
  });

  // Reset form with new demographics prop values
  useEffect(() => {
    form.reset(demographics);
  }, [demographics, form]);

  // Watch for changes and emit valid data
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Only emit changes if the form is valid for the changed fields
      if (form.formState.isValid) {
        onDemographicsChange(value as Partial<PatientDemographics>);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onDemographicsChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Demographics</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="heightCm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weightKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bmi"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>BMI</FormLabel>
                  <FormControl>
                    <Input type="number" value={field.value.toFixed(1)} readOnly />
                  </FormControl>
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

export default PatientDemographicsForm;