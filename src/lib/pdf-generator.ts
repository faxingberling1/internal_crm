import { jsPDF } from 'jspdf';

interface ProposalData {
    id: string;
    name: string;
    type: string;
    status: string;
    value: number;
    content: string;
    brandLogo?: string;
    signature?: string;
    proposalDate: string;
    lead: {
        name: string;
        email?: string;
        phone?: string;
        company?: string;
    };
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        package: {
            name: string;
            description?: string;
            features?: string;
        };
    }>;
}

export async function generateProposalPDF(proposal: ProposalData): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text with word wrap
    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4);
    };

    // Header - Brand Logo or Initial
    if (proposal.brandLogo) {
        try {
            doc.addImage(proposal.brandLogo, 'PNG', 20, yPosition, 30, 30);
            yPosition += 35;
        } catch (e) {
            // If image fails, use text initial
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text(proposal.name.charAt(0), 20, yPosition);
            yPosition += 10;
        }
    } else {
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(proposal.name.charAt(0), 20, yPosition);
        yPosition += 10;
    }

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(proposal.name, 20, yPosition);
    yPosition += 10;

    // Client Name
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 0, 128); // Purple
    doc.text(`Prepared for: ${proposal.lead.name}`, 20, yPosition);
    yPosition += 8;

    // Date and Value
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${proposal.proposalDate}`, 20, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Total: $${proposal.value.toLocaleString()}`, pageWidth - 60, yPosition);
    yPosition += 15;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Main Content
    if (proposal.content) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        yPosition = addText(proposal.content, 20, yPosition, pageWidth - 40, 10);
        yPosition += 10;
    }

    // Package Items Section
    if (proposal.items && proposal.items.length > 0) {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Package Details', 20, yPosition);
        yPosition += 10;

        // Table header
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPosition - 5, pageWidth - 40, 8, 'F');
        doc.text('Package', 25, yPosition);
        doc.text('Qty', pageWidth - 80, yPosition);
        doc.text('Price', pageWidth - 50, yPosition);
        yPosition += 10;

        // Table rows
        doc.setFont('helvetica', 'normal');
        proposal.items.forEach((item) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }

            doc.text(item.package.name, 25, yPosition);
            doc.text(item.quantity.toString(), pageWidth - 80, yPosition);
            doc.text(`$${item.price.toLocaleString()}`, pageWidth - 50, yPosition);
            yPosition += 6;

            if (item.package.description) {
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                yPosition = addText(item.package.description, 25, yPosition, pageWidth - 60, 8);
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                yPosition += 3;
            }
        });

        yPosition += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 8;

        // Total
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Total Investment:', pageWidth - 90, yPosition);
        doc.text(`$${proposal.value.toLocaleString()}`, pageWidth - 50, yPosition);
        yPosition += 15;
    }

    // Footer Section
    if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Prepared By
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(150, 150, 150);
    doc.text('PREPARED BY', 20, yPosition);
    yPosition += 5;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('CRM Agent Operations', 20, yPosition);
    yPosition += 5;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Antigravity Internal Systems', 20, yPosition);

    // Signature
    if (proposal.signature) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 150, 150);
        doc.text('CLIENT SIGNATURE', pageWidth - 80, yPosition - 10);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 0, 128);
        doc.text(proposal.signature, pageWidth - 80, yPosition);
        doc.setDrawColor(200, 200, 200);
        doc.line(pageWidth - 80, yPosition + 2, pageWidth - 20, yPosition + 2);
    }

    return doc.output('blob');
}
