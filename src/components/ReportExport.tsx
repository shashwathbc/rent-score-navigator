
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/contexts/LocationContext";
import { useQAP } from "@/contexts/QAPContext";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const ReportExport = () => {
  const { state, city, zipCode, address } = useLocation();
  const { qapData, scorePercentage, totalScore } = useQAP();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    if (!state) {
      toast({
        title: "Error",
        description: "Please select a state before exporting",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your report...",
      });

      // Create a temporary div to render the report
      const reportContainer = document.createElement("div");
      reportContainer.id = "pdf-content";
      reportContainer.style.width = "800px";
      reportContainer.style.padding = "40px";
      reportContainer.style.backgroundColor = "white";
      reportContainer.style.color = "black";
      reportContainer.style.position = "absolute";
      reportContainer.style.left = "-9999px";
      document.body.appendChild(reportContainer);

      // Create report content
      const timestamp = new Date().toLocaleString();
      
      reportContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h1 style="color: #0f4c81; margin: 0;">LIHTC QAP Score Report</h1>
            <div style="font-size: 14px; text-align: right;">
              <p style="margin: 0; color: #666;">Generated: ${timestamp}</p>
            </div>
          </div>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
            <h2 style="margin-top: 0; color: #0f4c81;">Location Information</h2>
            <p><strong>State:</strong> ${state || "Not specified"}</p>
            <p><strong>City:</strong> ${city || "Not specified"}</p>
            <p><strong>Zip Code:</strong> ${zipCode || "Not specified"}</p>
            <p><strong>Address:</strong> ${address || "Not specified"}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #0f4c81;">Summary</h2>
            <div style="background-color: ${scorePercentage >= 80 ? "#dcf5e7" : scorePercentage >= 60 ? "#fff8e1" : "#fee2e2"}; padding: 15px; border-radius: 5px; text-align: center;">
              <h3 style="margin: 0; font-size: 24px;">Overall Score: ${scorePercentage.toFixed(1)}%</h3>
              <p style="margin: 5px 0 0;">Total Points: ${totalScore} of ${qapData.totalMaxPoints}</p>
            </div>
          </div>
          
          <h2 style="color: #0f4c81;">Detailed Scoring Breakdown</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #0f4c81; color: white;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Category</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Score</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Max Points</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${qapData.categories.map(category => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${category.name}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${category.currentPoints}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${category.maxPoints}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">
                    ${((category.currentPoints / category.maxPoints) * 100).toFixed(1)}%
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background-color: #f2f2f2; font-weight: bold;">
                <td style="padding: 10px; border: 1px solid #ddd;">Total</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${totalScore}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${qapData.totalMaxPoints}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${scorePercentage.toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
            <p>This report was automatically generated by the LIHTC QAP Score Calculator.</p>
            <p>The information provided is based on user input and should be verified with official scoring criteria.</p>
          </div>
        </div>
      `;

      // Generate PDF from the HTML
      const canvas = await html2canvas(reportContainer, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate ratio to fit image within A4 page
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Clean up the temporary element
      document.body.removeChild(reportContainer);
      
      // Save PDF
      pdf.save(`LIHTC_QAP_Score_Report_${state.replace(/\s/g, "_")}_${new Date().toISOString().slice(0,10)}.pdf`);
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your report has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error generating PDF",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generatePDF} 
      className="w-full" 
      disabled={generating || !state}
    >
      <Download className="mr-2 h-4 w-4" />
      Export PDF Report
    </Button>
  );
};

export default ReportExport;
