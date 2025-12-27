import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AirwayExam } from "@/types/patient";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { airwayExamSchema } from "@/lib/validationSchemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AirwayExamFormProps {
  airwayExam: AirwayExam;
  onAirwayExamChange: (updatedAirwayExam: AirwayExam) => void;
}

const AirwayExamForm: React.FC<AirwayExamFormProps> = ({
  airwayExam,
  onAirwayExamChange,
}) => {
  const form = useForm<AirwayExam>({
    resolver: zodResolver(airwayExamSchema),
    defaultValues: airwayExam,
    mode: "onChange", // Validate on change
  });

  // Reset form with new airwayExam prop values
  useEffect(() => {
    form.reset(airwayExam);
  }, [airwayExam, form]);

  // Watch for changes and emit valid data
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Only emit changes if the form is valid
      if (form.formState.isValid) {
        onAirwayExamChange(value as AirwayExam);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onAirwayExamChange]);

  // Determine if values indicate a potentially difficult airway for visual cues
  const isMallampatiCritical = airwayExam.mallampatiScore === "III" || airwayExam.mallampatiScore === "IV";
  const isThyromentalCritical = airwayExam.thyromentalDistanceCm !== null && airwayExam.thyromentalDistanceCm < 6;
  const isMouthOpeningCritical = airwayExam.mouthOpeningCm !== null && airwayExam.mouthOpeningCm < 3;
  const isNeckMobilityCritical = airwayExam.neckMobility === "Limited" || airwayExam.neckMobility === "Severely Limited";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Airway Exam Findings (Manual Entry)</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mallampatiScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(isMallampatiCritical && "text-red-600 dark:text-red-400")}>
                    Mallampati Score
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={cn(isMallampatiCritical && "border-red-500 focus:ring-red-500")}>
                        <SelectValue placeholder="Select Mallampati Score" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">N/A</SelectItem>
                      <SelectItem value="I">Class I</SelectItem>
                      <SelectItem value="II">Class II</SelectItem>
                      <SelectItem value="III">Class III</SelectItem>
                      <SelectItem value="IV">Class IV</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thyromentalDistanceCm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(isThyromentalCritical && "text-red-600 dark:text-red-400")}>
                    Thyromental Distance (cm)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 7.0"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                      className={cn(isThyromentalCritical && "border-red-500 focus-visible:ring-red-500")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mouthOpeningCm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(isMouthOpeningCritical && "text-red-600 dark:text-red-400")}>
                    Mouth Opening (cm)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 4.5"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                      className={cn(isMouthOpeningCritical && "border-red-500 focus-visible:ring-red-500")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="neckMobility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(isNeckMobilityCritical && "text-red-600 dark:text-red-400")}>
                    Neck Mobility
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={cn(isNeckMobilityCritical && "border-red-500 focus:ring-red-500")}>
                        <SelectValue placeholder="Select Neck Mobility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">N/A</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Limited">Limited</SelectItem>
                      <SelectItem value="Severely Limited">Severely Limited</SelectItem>
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

export default AirwayExamForm;