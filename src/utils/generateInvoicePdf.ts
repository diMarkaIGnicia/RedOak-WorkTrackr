// Import jsPDF
import { jsPDF } from 'jspdf';
import numWords from 'num-words';

// Extend jsPDF type definitions if needed
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}
import { HoursWorked } from '../hooks/useInvoices';
import { UserProfile } from '../context/UserProfileContext';
import { InvoiceFormValues } from '../components/InvoiceForm';

interface GenerateInvoicePdfProps {
  invoice: InvoiceFormValues;
  profile: UserProfile | null;
}

export const generateInvoicePdf = ({ invoice, profile }: GenerateInvoicePdfProps) => {
  // Create a new jsPDF instance
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add invoice info
  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  // Right column - Invoice user info
  doc.text(profile?.full_name || 'Nombre del Empleado', pageWidth - 20, 40, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text(`ABN: ${invoice.abn || 'N/A'}`, pageWidth - 20, 45, { align: 'right' });
  doc.text(`Mobile Number: ${invoice.mobile_number || 'N/A'}`, pageWidth - 20, 50, { align: 'right' });
  doc.text(`Address: ${invoice.address || ''}`, pageWidth - 20, 55, { align: 'right' });
  doc.text(`Date: ${invoice.date_off}`, pageWidth - 20, 60, { align: 'right' });
  doc.text(`Invoice: INV-${invoice.invoice_number || ''}`, pageWidth - 20, 65, { align: 'right' });
  
  // Add TAX INVOICE TO section
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE TO:', 20, 85);
  doc.setFont('helvetica', 'normal');
  doc.text('RedOak Cleaning Solutions', 30, 95);
  doc.text('Mobile Number: 0491829501', 30, 100);
  
  doc.setFont('helvetica', 'normal');
  
  // Start Y position for hours worked list
  let currentY = 120;
  let total = 0;
  
  // Add hours worked section title
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  
  currentY += 10;
  
  // Add hours worked as simple lines
  if (invoice.hours_worked && Array.isArray(invoice.hours_worked) && invoice.hours_worked.length > 0) {
    // Sort hours by date
    const sortedHours = [...invoice.hours_worked].sort((a, b) => 
      new Date(a.date_worked).getTime() - new Date(b.date_worked).getTime()
    );
    
    sortedHours.forEach(hw => {
      const date = new Date(hw.date_worked);
      const monthName = date.toLocaleString('en-US', { month: 'long' });
      const formattedDate = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${date.getDate()}`;
      const lineTotal = hw.hours * hw.rate_hour;
      total += lineTotal;
      
      const lineText = `${formattedDate}: $${lineTotal.toFixed(2)}`;
      
      // Add line if it fits, otherwise add new page
      if (currentY > 250) { // Near bottom of page
        doc.addPage();
        currentY = 20;
      }
      
      doc.text(lineText, 30, currentY);
      currentY += 7; // Line height
    });
  } else {
    doc.text('No hay horas trabajadas registradas', 20, currentY);
    currentY += 7;
  }
  const words = numWords(total);
  
  // Add total
  currentY += 10; // Add some space before total
  doc.setFont('helvetica', 'bold');
  const wordsTotal =  `${words} AUD $${total.toFixed(2)}`;
  const capitalized = wordsTotal.charAt(0).toUpperCase() + wordsTotal.slice(1);
  doc.text(`Total: ${capitalized}`, 30, currentY);
  doc.setFont('helvetica', 'normal');
  
  // Add total
  const totalY = currentY + 20;
  
  doc.setFont('helvetica', 'bold');
  doc.text(`BANKING DETAILS:`, 20, totalY, { align: 'left' });
  doc.setFont('helvetica', 'normal');
  
  // Add payment info
  const paymentY = totalY + 10;
  doc.setFontSize(9);
  doc.text(`Account Name: ${invoice.account_name || profile?.full_name || ''}`, 30, paymentY);
  doc.text(`Account Number: ${invoice.account_number || ''}`, 30, paymentY + 5);
  doc.text(`BSB: ${invoice.bsb || ''}`, 30, paymentY + 10);
  doc.text(`Bank: ${invoice.bank || ''}`, 30, paymentY + 15);
  
  // Save the PDF
  doc.save(`invoice-${invoice.invoice_number || 'new'}.pdf`);
};
