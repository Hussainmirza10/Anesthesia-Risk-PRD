import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";
import { addAuditLogEntry } from "@/lib/auditLog";
import { toast } from "sonner";

interface PdfExportButtonProps {
  targetElementId: string;
  fileName: string;
}

const PdfExportButton: React.FC<PdfExportButtonProps> = ({ targetElementId, fileName }) => {
  const handleExportPdf = () => {
    const element = document.getElementById(targetElementId);
    if (!element) {
      toast.error("Error: Target element for PDF export not found.");
      return;
    }

    toast.loading("Generating PDF...", { id: "pdf-export" });

    html2pdf()
      .from(element)
      .set({
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save()
      .then(() => {
        toast.success("PDF generated successfully!", { id: "pdf-export" });
        addAuditLogEntry("PDF Export", `Exported patient report: ${fileName}`);
      })
      .catch((error) => {
        toast.error(`Failed to generate PDF: ${error.message}`, { id: "pdf-export" });
        addAuditLogEntry("PDF Export Failed", `Error exporting patient report: ${fileName} - ${error.message}`);
      });
  };

  return (
    <Button onClick={handleExportPdf} className="w-full">
      <Download className="mr-2 h-4 w-4" /> Export as PDF
    </Button>
  );
};

export default PdfExportButton;