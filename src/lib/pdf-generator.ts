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
    brandColors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    headerText?: string;
    footerText?: string;
    terms?: string;
    notes?: string;
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

// Helper to convert hex color to RGB
function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [147, 51, 234]; // Default purple
}

export async function generateProposalPDF(proposal: ProposalData): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Get brand colors or use defaults
    const primaryColor = proposal.brandColors?.primary || '#9333ea';
    const secondaryColor = proposal.brandColors?.secondary || '#6366f1';
    const accentColor = proposal.brandColors?.accent || '#8b5cf6';

    const [r, g, b] = hexToRgb(primaryColor);

    // Helper function to add text with word wrap
    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4);
    };

    // Helper to strip HTML tags from content
    const stripHtml = (html: string): string => {
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    };

    // Page header with brand color accent
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageWidth, 8, 'F');

    // Brand Logo
    if (proposal.brandLogo) {
        try {
            doc.addImage(proposal.brandLogo, 'PNG', 20, yPosition, 40, 40);
            yPosition += 45;
        } catch (e) {
            // If image fails, use company initial
            doc.setFontSize(32);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(r, g, b);
            doc.text('NBT', 20, yPosition + 10);
            yPosition += 20;
        }
    } else {
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(r, g, b);
        doc.text('NBT', 20, yPosition + 10);
        yPosition += 20;
    }

    // Custom Header Text
    if (proposal.headerText) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        yPosition = addText(proposal.headerText, 20, yPosition, pageWidth - 40, 9);
        yPosition += 5;
    }

    yPosition += 10;

    // Proposal Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(proposal.name, 20, yPosition);
    yPosition += 12;

    // Client Information Box
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(20, yPosition, pageWidth - 40, 25, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r, g, b);
    doc.text('PREPARED FOR', 25, yPosition + 8);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(proposal.lead.name, 25, yPosition + 15);

    if (proposal.lead.company) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(proposal.lead.company, 25, yPosition + 21);
    }

    // Date and Total on the right
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${proposal.proposalDate}`, pageWidth - 70, yPosition + 8);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r, g, b);
    doc.text(`$${proposal.value.toLocaleString()}`, pageWidth - 70, yPosition + 18);

    yPosition += 35;

    // Main Content
    if (proposal.content) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const cleanContent = stripHtml(proposal.content);
        yPosition = addText(cleanContent, 20, yPosition, pageWidth - 40, 11);
        yPosition += 15;
    }

    // Package Items Section
    if (proposal.items && proposal.items.length > 0) {
        // Check if we need a new page
        if (yPosition > pageHeight - 100) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Package Details', 20, yPosition);
        yPosition += 10;

        // Table header with brand color
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(r, g, b);
        doc.setTextColor(255, 255, 255);
        doc.roundedRect(20, yPosition - 6, pageWidth - 40, 10, 2, 2, 'F');
        doc.text('Package', 25, yPosition);
        doc.text('Qty', pageWidth - 90, yPosition);
        doc.text('Price', pageWidth - 60, yPosition);
        doc.text('Total', pageWidth - 30, yPosition);
        yPosition += 12;

        // Table rows
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        proposal.items.forEach((item, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
            }

            // Alternating row background
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
            }

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(item.package.name, 25, yPosition);
            doc.text(item.quantity.toString(), pageWidth - 90, yPosition);
            doc.text(`$${item.price.toLocaleString()}`, pageWidth - 60, yPosition);
            doc.text(`$${(item.price * item.quantity).toLocaleString()}`, pageWidth - 30, yPosition);
            yPosition += 6;

            if (item.package.description) {
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                yPosition = addText(item.package.description, 25, yPosition, pageWidth - 70, 8);
                doc.setTextColor(0, 0, 0);
            }

            yPosition += 8;
        });

        yPosition += 5;

        // Total section with brand color
        doc.setFillColor(r, g, b);
        doc.roundedRect(pageWidth - 100, yPosition, 80, 12, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('TOTAL:', pageWidth - 95, yPosition + 8);
        doc.setFontSize(14);
        doc.text(`$${proposal.value.toLocaleString()}`, pageWidth - 30, yPosition + 8, { align: 'right' });

        yPosition += 20;
    }

    // Terms & Conditions
    if (proposal.terms) {
        if (yPosition > pageHeight - 80) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Terms & Conditions', 20, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        yPosition = addText(proposal.terms, 20, yPosition, pageWidth - 40, 9);
        yPosition += 10;
    }

    // Footer Section
    if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
    }

    // Custom Footer Text
    if (proposal.footerText) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        yPosition = addText(proposal.footerText, 20, yPosition, pageWidth - 40, 8);
        yPosition += 5;
    }

    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Signature Section
    if (proposal.signature) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 150, 150);
        doc.text('AUTHORIZED SIGNATURE', 20, yPosition);
        yPosition += 8;

        doc.setFontSize(20);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(r, g, b);
        doc.text(proposal.signature, 20, yPosition);

        doc.setDrawColor(r, g, b);
        doc.line(20, yPosition + 3, 100, yPosition + 3);
        yPosition += 10;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(proposal.proposalDate, 20, yPosition);
    }

    // Page numbers and branding footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

        // Brand color footer accent
        doc.setFillColor(r, g, b);
        doc.rect(0, pageHeight - 5, pageWidth, 5, 'F');
    }

    return doc.output('blob');
}
