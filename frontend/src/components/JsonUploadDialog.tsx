import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator"; // Added this import
import { PatientData } from "@/types/patient";
import { toast } from "sonner";

interface JsonUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpload: (data: PatientData) => void;
}

const JsonUploadDialog: React.FC<JsonUploadDialogProps> = ({
  isOpen,
  onClose,
  onDataUpload,
}) => {
  const [jsonInput, setJsonInput] = useState<string>("");

  const handlePasteUpload = () => {
    try {
      const parsedData: PatientData = JSON.parse(jsonInput);
      onDataUpload(parsedData);
      toast.success("Patient data loaded from pasted JSON.");
      setJsonInput("");
      onClose();
    } catch (error: any) {
      toast.error(`Invalid JSON format: ${error.message}`);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData: PatientData = JSON.parse(content);
          onDataUpload(parsedData);
          toast.success(`Patient data loaded from ${file.name}.`);
          setJsonInput("");
          onClose();
        } catch (error: any) {
          toast.error(`Error parsing file ${file.name}: ${error.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Patient Data (JSON)</DialogTitle>
          <DialogDescription>
            Paste patient data in JSON format or upload a JSON file. This will
            overwrite current patient data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="json-input">Paste JSON Data</Label>
            <Textarea
              id="json-input"
              placeholder='{"demographics": {...}, "medicalHistory": {...}, "airwayExam": {...}}'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={10}
            />
            <Button onClick={handlePasteUpload} disabled={!jsonInput.trim()}>
              Load from Paste
            </Button>
          </div>
          <div className="relative flex items-center justify-center text-xs text-muted-foreground">
            <Separator className="absolute w-full" />
            <span className="bg-background px-2 z-10">OR</span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="json-file">Upload JSON File</Label>
            <Input id="json-file" type="file" accept=".json" onChange={handleFileChange} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JsonUploadDialog;