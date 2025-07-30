// Import jsPDF
import { jsPDF } from 'jspdf';

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
  doc.text('RedOak Cleaning Solutions', 20, 90);
  doc.text('Mobile Number: 0491829501', 20, 95);
  
  doc.setFont('helvetica', 'normal');
  
  // Start Y position for hours worked list
  let currentY = 110;
  let total = 0;
  
  // Add hours worked section title
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  
  currentY += 10;
  
  // Add hours worked as simple lines
  // Note: This is a placeholder. In a real implementation, you would fetch the actual hours worked data
  // using the invoice.hours_worked_ids and format each entry
  if (invoice.hours_worked_ids && invoice.hours_worked_ids.length > 0) {
    // This is a placeholder - in a real implementation, you would map through the actual hours
    const hoursWorked = [
      { date: '2023-07-15', hours: 8, rate: 25.5 },
      { date: '2023-07-16', hours: 4, rate: 25.5 },
      { date: '2023-07-17', hours: 8, rate: 25.5 }
    ];
    
    hoursWorked.forEach(item => {
      const date = new Date(item.date);
      const monthName = date.toLocaleString('es-ES', { month: 'long' });
      const formattedDate = `${date.getDate()} ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;
      const lineTotal = item.hours * item.rate;
      total += lineTotal;
      
      const lineText = `${formattedDate}: ${item.hours} x $${item.rate.toFixed(2)} = $${lineTotal.toFixed(2)}`;
      
      // Add line if it fits, otherwise add new page
      if (currentY > 250) { // Near bottom of page
        doc.addPage();
        currentY = 20;
      }
      
      doc.text(lineText, 20, currentY);
      currentY += 7; // Line height
    });
  } else {
    doc.text('No hay horas trabajadas registradas', 20, currentY);
    currentY += 7;
  }
  
  // Add total
  currentY += 10; // Add some space before total
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: $${total.toFixed(2)}`, 20, currentY);
  doc.setFont('helvetica', 'normal');
  
  const finalY = currentY + 15; // Add some space after total
  
  // Add subtotal, tax, and total
  const subtotalY = finalY + 10;
  const taxY = subtotalY + 5;
  const totalY = taxY + 15;
  
  doc.setFont('helvetica', 'bold');
  doc.text(`BANKING DETAILS:`, 20, totalY, { align: 'left' });
  doc.setFont('helvetica', 'normal');
  
  // Add payment info
  const paymentY = totalY + 15;
  doc.setFontSize(9);
  doc.text(`Account Name: ${invoice.account_name || profile?.full_name || ''}`, 20, paymentY);
  doc.text(`Account Number: ${invoice.account_number || '12345678'}`, 20, paymentY + 5);
  doc.text(`BSB: ${invoice.bsb || '033-000'}`, 20, paymentY + 10);
  doc.text(`Bank: ${invoice.bank_name || 'Westpac'}`, 20, paymentY + 15);
  
  // Save the PDF
  doc.save(`invoice-${invoice.invoice_number || 'new'}.pdf`);
};
