import { jsPDF } from 'jspdf';

export interface DocumentData {
    id: string;
    name: string;
    type: 'PROPOSAL' | 'CUSTOM_PLAN' | 'NDA' | 'AGREEMENT' | 'PAYROLL';
    status: string;
    value?: number;
    content: any; // Flexible JSON for different document types
    brandName?: string;
    brandLogo?: string;
    brandColors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    clientLogo?: string;
    clientBrandColors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    lead?: {
        name: string;
        email?: string;
        phone?: string;
        company?: string;
    };
    client?: {
        name: string;
        company?: string;
        email?: string;
    };
    signature?: string;
    signedAt?: string;
    signedBy?: string;
    validUntil?: string;
    createdAt: string;
}

// Helper to convert hex color to RGB
function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [147, 51, 234];
}

// Helper to lighten color
function lightenColor(r: number, g: number, b: number, percent: number): [number, number, number] {
    return [
        Math.min(255, r + (255 - r) * percent),
        Math.min(255, g + (255 - g) * percent),
        Math.min(255, b + (255 - b) * percent)
    ];
}

// Helper to blend two colors
function blendColors(color1: [number, number, number], color2: [number, number, number], ratio: number = 0.5): [number, number, number] {
    return [
        color1[0] + (color2[0] - color1[0]) * ratio,
        color1[1] + (color2[1] - color1[1]) * ratio,
        color1[2] + (color2[2] - color1[2]) * ratio
    ];
}

export async function generateDocumentPDF(docData: DocumentData): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = 0;

    // Brand colors
    const primaryColor = docData.brandColors?.primary || '#9333ea';
    const secondaryColor = docData.brandColors?.secondary || '#6366f1';
    const accentColor = docData.brandColors?.accent || '#8b5cf6';

    const [r, g, b] = hexToRgb(primaryColor);
    const [r2, g2, b2] = hexToRgb(secondaryColor);
    const [r3, g3, b3] = hexToRgb(accentColor);
    const [lr, lg, lb] = lightenColor(r, g, b, 0.9);

    // Client brand colors
    const hasClientBranding = !!docData.clientLogo || !!docData.clientBrandColors;
    const clientPrimaryColor = docData.clientBrandColors?.primary || primaryColor;
    const [cr, cg, cb] = hexToRgb(clientPrimaryColor);

    // Blended colors for dual branding
    const [br, bg, bb] = hasClientBranding ? blendColors([r, g, b], [cr, cg, cb]) : [r, g, b];

    // Helper functions
    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, lineHeight: number = 1.6, fontStyle: string = 'normal') => {
        doc.setFont('helvetica', fontStyle);
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text || '', maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.35 * lineHeight);
    };

    const safeAddImage = (imageData: string, x: number, y: number, w: number, h: number) => {
        if (!imageData) return;
        try {
            // jsPDF addImage(imageData, format, x, y, width, height, alias, compression, rotation)
            // We omit format to allow auto-detection, as hardcoding 'PNG' caused signature errors
            doc.addImage(imageData, x, y, w, h, undefined, 'FAST');
        } catch (e) {
            console.warn('Could not add image to PDF:', e);
            // Skip image if invalid or wrong signature
        }
    };

    const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 35) {
            doc.addPage();
            yPosition = margin + 10;
            return true;
        }
        return false;
    };

    const drawGradientRect = (x: number, y: number, w: number, h: number, color1: [number, number, number], color2: [number, number, number]) => {
        const steps = 20;
        const stepHeight = h / steps;
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const r = color1[0] + (color2[0] - color1[0]) * ratio;
            const g = color1[1] + (color2[1] - color1[1]) * ratio;
            const b = color1[2] + (color2[2] - color1[2]) * ratio;
            doc.setFillColor(r, g, b);
            doc.rect(x, y + (i * stepHeight), w, stepHeight, 'F');
        }
    };

    const drawSectionHeader = (title: string, yPos: number, isLegal: boolean = false) => {
        if (isLegal) {
            doc.setFontSize(10);
            doc.setFont('times', 'bold');
            doc.setTextColor(br, bg, bb);
            doc.text(title.toUpperCase(), margin, yPos, { charSpace: 1 });

            doc.setDrawColor(240, 240, 245);
            doc.setLineWidth(0.2);
            doc.line(margin, yPos + 3, margin + contentWidth, yPos + 3);
            return yPos + 12;
        }

        // Professional Modern Header
        doc.setFillColor(br, bg, bb);
        doc.rect(margin, yPos - 6, 3, 10, 'F');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(accentColor);
        doc.text('SECTION', margin + 7, yPos - 3, { charSpace: 1 });

        doc.setFontSize(18);
        doc.setFont('helvetica', 'black');
        doc.setTextColor(30, 30, 30);
        doc.text(title.toUpperCase(), margin + 7, yPos + 5);

        return yPos + 18;
    };

    const drawShadowedRect = (x: number, y: number, w: number, h: number, r: number = 4) => {
        doc.setFillColor(245, 245, 247); // Subtle shadow color
        doc.roundedRect(x + 0.5, y + 0.5, w, h, r, r, 'F');
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, w, h, r, r, 'F');
        doc.setDrawColor(240, 240, 245);
        doc.roundedRect(x, y, w, h, r, r, 'D');
    };

    const drawPillBadge = (text: string, x: number, y: number, color: [number, number, number]) => {
        const paddingH = 4;
        const paddingV = 2;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        const textWidth = doc.getTextWidth(text);
        const w = textWidth + (paddingH * 2);
        const h = 6;

        doc.setFillColor(...color);
        doc.roundedRect(x, y - 4, w, h, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(text, x + paddingH, y + 0.5);
        return x + w + 4;
    };

    const drawDecorativeDots = (x: number, y: number, w: number, h: number, spacing: number = 5) => {
        doc.setFillColor(200, 200, 200); // Use a light grey instead of alpha
        for (let ix = 0; ix < w; ix += spacing) {
            for (let iy = 0; iy < h; iy += spacing) {
                doc.circle(x + ix, y + iy, 0.3, 'F');
            }
        }
    };

    const drawGridLines = (x: number, y: number, w: number, h: number) => {
        doc.setDrawColor(220, 220, 220); // Use a light grey instead of alpha
        doc.setLineWidth(0.1);
        for (let ix = 0; ix <= w; ix += 20) {
            doc.line(x + ix, y, x + ix, y + h);
        }
        for (let iy = 0; iy <= h; iy += 20) {
            doc.line(x, y + iy, x + w, y + iy);
        }
    };

    // ==================== COVER PAGE ====================
    if (docData.type === 'PAYROLL') {
        // High-end Payroll Slip Layout
        // No cover page, starts immediately with a premium header
        yPosition = 0;
    } else if (docData.type === 'PROPOSAL' || docData.type === 'CUSTOM_PLAN') {
        const brandName = docData.brandName || 'PROVIDER';

        // NEXT LEVEL COVER DESIGN
        // Dark Navy/Brand background with aesthetic elements
        drawGradientRect(0, 0, pageWidth, pageHeight, [r, g, b], [30, 30, 45]);

        // Decorative Elements
        drawGridLines(0, 0, pageWidth, pageHeight);
        drawDecorativeDots(10, 10, 60, 60, 8);

        // Circular Accent 
        doc.setFillColor(255, 255, 255);
        doc.circle(pageWidth, 0, 100, 'F');

        // Top Branding
        yPosition = 30;
        if (docData.brandLogo) {
            safeAddImage(docData.brandLogo, margin, yPosition, 35, 12);
        } else {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(brandName, margin, yPosition + 8);
        }

        // Main Title Block
        yPosition = 100;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(accentColor);
        doc.text(docData.type === 'CUSTOM_PLAN' ? 'PROJECT STRATEGY & ROADMAP' : 'PROFESSIONAL SERVICES PROPOSAL', margin, yPosition, { charSpace: 2 });

        yPosition += 15;
        doc.setFontSize(48);
        doc.setFont('helvetica', 'black');
        doc.setTextColor(255, 255, 255);
        const titleLines = doc.splitTextToSize(docData.name.toUpperCase(), contentWidth - 40);
        doc.text(titleLines, margin, yPosition);

        yPosition += (titleLines.length * 15);

        // Accent Line
        doc.setFillColor(accentColor);
        doc.rect(margin, yPosition + 10, 40, 2, 'F');

        // Dual Branding Footer Area
        yPosition = pageHeight - 80;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, yPosition, contentWidth, 55, 12, 12, 'F');

        // Preparer Side (Self)
        let footerY = yPosition + 15;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 150, 160);
        doc.text('PREPARED BY', margin + 15, footerY);

        footerY += 10;
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text(brandName, margin + 15, footerY);

        // Visual Divider
        doc.setDrawColor(240, 240, 245);
        doc.line(pageWidth / 2, yPosition + 12, pageWidth / 2, yPosition + 42);

        // Client Side
        footerY = yPosition + 15;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(r, g, b); // Use brand primary for client label
        doc.text('INTENDED FOR', pageWidth / 2 + 15, footerY);

        footerY += 10;
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        const clientName = docData.client?.name || docData.lead?.name || 'Valued Client';
        doc.text(clientName, pageWidth / 2 + 15, footerY);

        if (docData.clientLogo) {
            // Add client logo if present
            safeAddImage(docData.clientLogo, pageWidth - margin - 45, yPosition + 12, 30, 30);
        }

    } else if (docData.type === 'NDA' || docData.type === 'AGREEMENT') {
        const brandName = docData.brandName || 'PROVIDER';

        // Legal Cover - High-end Architectural Treatment
        drawGradientRect(0, 0, pageWidth, 60, [r, g, b], [30, 30, 45]);
        drawGridLines(0, 0, pageWidth, 60);

        // Header Logos on Legal
        if (docData.brandLogo) {
            safeAddImage(docData.brandLogo, margin, 20, 30, 10);
        }

        if (docData.clientLogo) {
            safeAddImage(docData.clientLogo, pageWidth - margin - 30, 20, 30, 10);
        }

        // Confidential Designation
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text('LEGALLY BINDING DOCUMENT • PRIVATE & CONFIDENTIAL', pageWidth / 2, 45, { align: 'center', charSpace: 2 });

        yPosition = 100;
        doc.setFont('times', 'bold');
        doc.setDrawColor(br, bg, bb);
        doc.setLineWidth(1);
        doc.line(margin, yPosition - 10, margin + 20, yPosition - 10);

        doc.setFontSize(36);
        doc.setTextColor(30, 30, 30);
        const legalTitle = docData.type === 'NDA' ? 'NON-DISCLOSURE\nAGREEMENT' : 'PROFESSIONAL SERVICE\nAGREEMENT';
        doc.text(legalTitle, margin, yPosition);

        yPosition += 45;
        doc.setFontSize(12);
        doc.setFont('times', 'italic');
        doc.setTextColor(120, 120, 130);
        doc.text(`Reference: ${docData.name}`, margin, yPosition);

        // Party Breakdown Block
        yPosition += 40;
        doc.setFillColor(250, 250, 252);
        doc.roundedRect(margin, yPosition, contentWidth, 60, 8, 8, 'F');

        let innerY = yPosition + 15;
        doc.setFontSize(8);
        doc.setFont('times', 'bold');
        doc.setTextColor(150, 150, 160);
        doc.text('BETWEEN THE PARTIES', margin + 10, innerY, { charSpace: 1 });

        innerY += 12;
        doc.setFontSize(12);
        doc.setTextColor(30, 30, 30);
        doc.text(brandName.toUpperCase(), margin + 10, innerY);
        doc.setFontSize(9);
        doc.setFont('times', 'italic');
        doc.text('(THE DISCLOSING PARTY / PROVIDER)', margin + 10, innerY + 5);

        innerY += 18;
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.setTextColor(30, 30, 30);
        const clientName = (docData.content.parties?.[1]?.name) || (docData.client?.name || docData.lead?.name || 'Recpient');
        doc.text(clientName.toUpperCase(), margin + 10, innerY);
        doc.setFontSize(9);
        doc.setFont('times', 'italic');
        doc.text('(THE RECEIVING PARTY / CLIENT)', margin + 10, innerY + 5);

        yPosition = 245;
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 160);
        doc.text(`EFFECTIVE DATE: ${docData.content.effectiveDate || new Date(docData.createdAt).toLocaleDateString()}`, margin, yPosition);
        doc.text(`DOCUMENT ID: ${docData.id.toUpperCase()}`, margin, yPosition + 5);
        doc.text(`SECURITY VERIFIED: ${docData.id.slice(0, 8).toUpperCase()}`, margin, yPosition + 10);
    }

    // ==================== CONTENT PAGES ====================
    if (docData.type === 'PAYROLL') {
        const content = docData.content;
        const brandName = docData.brandName || 'OFFICIAL PAYSLIP';

        // Header Gradient Bar
        drawGradientRect(0, 0, pageWidth, 40, [r, g, b], [r2, g2, b2]);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text('CONFIDENTIAL SALARY STATEMENT', margin, 25);
        doc.setFontSize(8);
        doc.text(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(), pageWidth - margin, 25, { align: 'right' });

        yPosition = 60;

        // Employee Info Card
        drawShadowedRect(margin, yPosition, contentWidth, 45, 6);
        let innerY = yPosition + 12;

        // initials avatar
        const initials = ((content.employeeName || 'E').split(' ').map((n: any) => n[0]).join('')).toUpperCase().slice(0, 2);
        doc.setFillColor(lr, lg, lb);
        doc.circle(margin + 15, innerY + 5, 10, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(r, g, b);
        doc.text(initials, margin + 15, innerY + 9, { align: 'center' });

        doc.setFontSize(18);
        doc.setFont('helvetica', 'black');
        doc.setTextColor(30, 30, 30);
        doc.text(content.employeeName || 'Employee', margin + 30, innerY + 5);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 120, 130);
        doc.text(content.designation || 'Team Member', margin + 30, innerY + 12);

        // Status Badge
        drawPillBadge('VERIFIED', margin + 30 + doc.getTextWidth(content.designation || 'Team Member') + 10, innerY + 11.5, [14, 165, 233]);

        // Right side info
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 150, 160);
        doc.text('PAYMENT PERIOD', pageWidth - margin - 15, innerY + 2, { align: 'right' });
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.text(`${content.month} ${content.year}`, pageWidth - margin - 15, innerY + 10, { align: 'right' });

        yPosition += 60;

        // Stats Row (Attendance & Hours)
        const statWidth = (contentWidth - 20) / 3;
        const stats = [
            { label: 'WORKED', value: `${content.attendance?.presents || 0} Days`, icon: '📅' },
            { label: 'ABSENCES', value: `${content.attendance?.absents || 0} Days`, icon: '🚫' },
            { label: 'TOTAL HOURS', value: `${content.attendance?.totalHours || 0} hrs`, icon: '⏱️' }
        ];

        stats.forEach((stat, i) => {
            const x = margin + (i * (statWidth + 10));
            drawShadowedRect(x, yPosition, statWidth, 25, 4);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'black');
            doc.setTextColor(160, 160, 170);
            doc.text(stat.label, x + 5, yPosition + 8);
            doc.setFontSize(12);
            doc.setTextColor(30, 30, 30);
            doc.text(stat.value, x + 5, yPosition + 18);
        });

        yPosition += 40;

        // Earnings & Deductions Table
        doc.setFontSize(12);
        doc.setFont('helvetica', 'black');
        doc.setTextColor(30, 30, 30);
        doc.text('BREAKDOWN', margin, yPosition);
        yPosition += 10;

        // Custom stylized table
        const col1 = margin;
        const col2 = margin + (contentWidth * 0.7);
        const rowH = 10;

        // Table Header
        doc.setFillColor(250, 250, 252);
        doc.rect(margin, yPosition, contentWidth, rowH, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 120, 130);
        doc.text('DESCRIPTION', col1 + 5, yPosition + 6.5);
        doc.text('AMOUNT (PKR)', pageWidth - margin - 5, yPosition + 6.5, { align: 'right' });
        yPosition += rowH;

        const items = [
            { label: 'Base Salary', value: content.baseSalary, type: 'EARNING' },
            { label: 'Performance Bonus', value: content.bonus, type: 'EARNING' },
            { label: 'Commission', value: content.commission, type: 'EARNING' },
            { label: 'Adjustments / Deductions', value: -content.deductions, type: 'DEDUCTION' }
        ].filter(item => item.value !== 0);

        items.forEach((item, i) => {
            doc.setDrawColor(245, 245, 247);
            doc.line(margin, yPosition, margin + contentWidth, yPosition);
            doc.setFontSize(9);
            doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
            doc.setTextColor(30, 30, 30);
            doc.text(item.label, col1 + 5, yPosition + 6.5);

            if (item.type === 'DEDUCTION') doc.setTextColor(220, 38, 38);
            doc.text(`${item.value > 0 ? '+' : ''}${item.value.toLocaleString()}`, pageWidth - margin - 5, yPosition + 6.5, { align: 'right' });
            yPosition += rowH;
        });

        // Net Salary Box
        yPosition += 5;
        drawGradientRect(margin, yPosition, contentWidth, 20, [r, g, b], [r2, g2, b2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('NET DISBURSEMENT', margin + 10, yPosition + 12);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'black');
        doc.text(`PKR ${content.netSalary.toLocaleString()}`, pageWidth - margin - 10, yPosition + 13, { align: 'right' });

        yPosition += 40;

        // Signature area
        doc.setFontSize(10);
        doc.setFont('helvetica', 'black');
        doc.setTextColor(30, 30, 30);
        doc.text('AUTHORSATION', margin, yPosition);
        doc.line(margin, yPosition + 2, margin + 30, yPosition + 2);

        yPosition += 20;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(24);
        doc.setTextColor(br, bg, bb);
        doc.text(brandName, margin, yPosition);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 150, 160);
        doc.text('DIGITALLY VERIFIED BY FINANCE DEPT', margin, yPosition + 8);

        // Watermark / Aesthetic background element
        doc.setTextColor(245, 245, 247);
        doc.setFontSize(80);
        doc.setFont('helvetica', 'black');
        doc.text('PAID', pageWidth / 2, pageHeight / 2 + 50, { align: 'center', angle: 45 });

    } else {
        doc.addPage();
        yPosition = margin + 15;
    }

    if (docData.type === 'NDA' || docData.type === 'AGREEMENT') {
        // LEGAL LAYOUT (Serif, clauses)
        const isNDA = docData.type === 'NDA';
        const content = docData.content;
        doc.setFont('times', 'normal');

        // Preamble
        yPosition = addText(`This ${docData.type === 'NDA' ? 'Non-Disclosure Agreement' : 'Agreement'} is entered into on ${content.effectiveDate || 'the date of execution'} by and between the parties listed herein.`, margin, yPosition, contentWidth, 11, 1.8);
        yPosition += 10;

        if (isNDA) {
            // 1. PURPOSE
            yPosition = drawSectionHeader('1. PURPOSE', yPosition, true);
            yPosition = addText(content.purpose || 'The parties intend to disclose confidential information for the purpose of evaluating a potential business relationship.', margin, yPosition, contentWidth, 10, 1.6);
            yPosition += 10;

            // 2. CONFIDENTIAL INFORMATION
            yPosition = drawSectionHeader('2. CONFIDENTIAL INFORMATION', yPosition, true);
            doc.setFont('times', 'bold');
            doc.text('a) Definition:', margin, yPosition);
            yPosition += 6;
            doc.setFont('times', 'normal');
            yPosition = addText(content.confidentialInfo || 'Confidential information includes all non-public information disclosed by one party to the other...', margin, yPosition, contentWidth, 10, 1.6);
            yPosition += 8;

            doc.setFont('times', 'bold');
            doc.text('b) Exclusions:', margin, yPosition);
            yPosition += 6;
            doc.setFont('times', 'normal');
            if (content.exclusions && content.exclusions.length > 0) {
                content.exclusions.forEach((ex: string, i: number) => {
                    checkNewPage(15);
                    yPosition = addText(`${String.fromCharCode(105 + i)}. ${ex}`, margin + 5, yPosition, contentWidth - 5, 10, 1.5);
                });
            } else {
                yPosition = addText('No specific exclusions listed.', margin + 5, yPosition, contentWidth - 5, 10, 1.5);
            }
            yPosition += 10;

            // 3. OBLIGATIONS
            yPosition = drawSectionHeader('3. OBLIGATIONS OF RECEIVING PARTY', yPosition, true);
            if (content.obligations && content.obligations.length > 0) {
                content.obligations.forEach((ob: string, i: number) => {
                    checkNewPage(15);
                    yPosition = addText(`${i + 1}. ${ob}`, margin + 5, yPosition, contentWidth - 5, 10, 1.5);
                });
            } else {
                yPosition = addText('Receiving party shall maintain strict confidentiality and limit access to information.', margin + 5, yPosition, contentWidth - 5, 10, 1.5);
            }
            yPosition += 10;

            // 4. OWNERSHIP
            checkNewPage(40);
            yPosition = drawSectionHeader('4. OWNERSHIP OF MATERIALS', yPosition, true);
            yPosition = addText(content.ownership || 'All confidential information remains the exclusive property of the disclosing party.', margin, yPosition, contentWidth, 10, 1.6);
            yPosition += 10;

            // 5. TERM
            checkNewPage(40);
            yPosition = drawSectionHeader('5. TERM', yPosition, true);
            yPosition = addText(`This agreement shall be effective as of ${content.effectiveDate || 'the date of execution'} and shall remain in effect for a period of ${content.termLength || '2 years'}.`, margin, yPosition, contentWidth, 10, 1.6);
            yPosition += 10;

            // 6. RETURN OR DESTRUCTION
            checkNewPage(40);
            yPosition = drawSectionHeader('6. RETURN OR DESTRUCTION OF INFORMATION', yPosition, true);
            yPosition = addText(content.returnInfo || 'Upon termination, all confidential information shall be returned or destroyed as requested.', margin, yPosition, contentWidth, 10, 1.6);
            yPosition += 10;

            // 7. REMEDIES
            checkNewPage(40);
            yPosition = drawSectionHeader('7. REMEDIES', yPosition, true);
            yPosition = addText(content.remedies || 'Breach of this agreement may cause irreparable harm for which monetary damages alone would be insufficient.', margin, yPosition, contentWidth, 10, 1.6);
            yPosition += 10;

            // 8. GOVERNING LAW
            checkNewPage(30);
            yPosition = drawSectionHeader('8. GOVERNING LAW', yPosition, true);
            yPosition = addText(`This agreement shall be governed by the laws of ${content.jurisdiction || 'the appropriate jurisdiction'}.`, margin, yPosition, contentWidth, 10, 1.6);
            yPosition += 10;

            // 9. ENTIRE AGREEMENT
            checkNewPage(30);
            yPosition = drawSectionHeader('9. ENTIRE AGREEMENT', yPosition, true);
            yPosition = addText(content.entireAgreement || 'This document constitutes the entire agreement between the parties regarding its subject matter.', margin, yPosition, contentWidth, 10, 1.6);
        } else {
            // Agreement specific
            yPosition = drawSectionHeader('1. SCOPE OF SERVICES', yPosition, true);
            yPosition = addText(content.scope || 'The service provider agrees to perform the services described herein...', margin, yPosition, contentWidth, 10, 1.6);
            yPosition += 10;

            yPosition = drawSectionHeader('2. DELIVERABLES', yPosition, true);
            if (content.deliverables && content.deliverables.length > 0) {
                content.deliverables.forEach((del: string, i: number) => {
                    yPosition = addText(`${i + 1}. ${del}`, margin + 5, yPosition, contentWidth - 5, 10, 1.5);
                });
            }
            yPosition += 10;

            yPosition = drawSectionHeader('3. COMPENSATION', yPosition, true);
            yPosition = addText(content.compensation || 'Client shall pay Service Provider as follows...', margin, yPosition, contentWidth, 10, 1.6);
        }

        // Common legal sections
        checkNewPage(40);
        yPosition = drawSectionHeader('MISCELLANEOUS', yPosition, true);
        yPosition = addText(`Jurisdiction: This agreement shall be governed by the laws of ${content.jurisdiction || 'the appropriate jurisdiction'}.`, margin, yPosition, contentWidth, 10, 1.6);

        if (content.additionalTerms || content.additionalClauses) {
            yPosition += 10;
            yPosition = addText(content.additionalTerms || content.additionalClauses.join('\n'), margin, yPosition, contentWidth, 10, 1.6);
        }

    } else if (docData.type === 'CUSTOM_PLAN') {
        // PLAN LAYOUT (Roadmap focused)
        const content = docData.content;
        yPosition = drawSectionHeader('Executive Summary', yPosition);
        yPosition = addText(content.overview || content.projectOverview, margin, yPosition, contentWidth, 10, 1.8);
        yPosition += 15;

        checkNewPage(60);
        yPosition = drawSectionHeader('Strategic Goals', yPosition);
        const goals = content.goals || content.objectives || [];
        goals.forEach((goal: string) => {
            doc.setFillColor(br, bg, bb);
            doc.circle(margin + 2, yPosition - 1, 1.5, 'F');
            yPosition = addText(goal, margin + 8, yPosition, contentWidth - 10, 10, 1.6);
            yPosition += 2;
        });
        yPosition += 10;

        checkNewPage(80);
        yPosition = drawSectionHeader('Implementation Roadmap', yPosition);
        const phases = content.phases || content.timeline || [];
        phases.forEach((phase: any, i: number) => {
            checkNewPage(30);
            doc.setFillColor(250, 250, 252);
            doc.roundedRect(margin, yPosition - 5, contentWidth, 25, 4, 4, 'F');
            doc.setFillColor(br, bg, bb);
            doc.rect(margin, yPosition - 5, 4, 25, 'F');
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`${i + 1}. ${phase.name || phase.phase}`, margin + 10, yPosition + 3);
            doc.setFontSize(9);
            doc.text(phase.duration || '', pageWidth - margin - 5, yPosition + 3, { align: 'right' });
            yPosition += 8;
            yPosition = addText(phase.description || '', margin + 10, yPosition, contentWidth - 15, 9, 1.4);
            yPosition += 12;
        });

    } else {
        // PROPOSAL LAYOUT (Existing logic)
        const content = docData.content;
        yPosition = drawSectionHeader('Project Overview', yPosition);
        yPosition = addText(content.projectOverview || content.overview, margin, yPosition, contentWidth, 10, 1.8);
        yPosition += 15;

        // Reuse components based on content availability
        if (content.objectives && content.objectives.length > 0) {
            checkNewPage(60);
            yPosition = drawSectionHeader('Objectives', yPosition);
            content.objectives.forEach((obj: string) => {
                doc.setTextColor(br, bg, bb);
                doc.text('✓', margin, yPosition);
                doc.setTextColor(50, 50, 50);
                yPosition = addText(obj, margin + 7, yPosition, contentWidth - 10, 10, 1.6);
            });
            yPosition += 10;
        }

        // Investment table
        if (content.packages && content.packages.length > 0) {
            checkNewPage(60);
            yPosition = drawSectionHeader('Investment Breakdown', yPosition);

            // Table header
            drawGradientRect(margin, yPosition - 8, contentWidth, 12, [r, g, b], [r2, g2, b2]);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('SERVICE PACKAGE', margin + 5, yPosition);
            doc.text('QTY', pageWidth - 90, yPosition);
            doc.text('TOTAL', pageWidth - margin - 5, yPosition, { align: 'right' });
            yPosition += 12;

            content.packages.forEach((pkg: any) => {
                checkNewPage(25);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(30, 30, 30);
                doc.text(pkg.name, margin + 5, yPosition);

                doc.setFont('helvetica', 'normal');
                doc.text(String(pkg.quantity || 1), pageWidth - 90, yPosition);
                doc.text(`$${(pkg.price * (pkg.quantity || 1)).toLocaleString()}`, pageWidth - margin - 5, yPosition, { align: 'right' });

                if (pkg.description) {
                    yPosition += 6;
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    yPosition = addText(pkg.description, margin + 5, yPosition, contentWidth - 10, 8, 1.4);
                }
                yPosition += 8;
            });

            // Total box
            yPosition += 5;
            doc.setFillColor(30, 30, 30);
            doc.rect(pageWidth - margin - 80, yPosition, 80, 15, 'F');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('TOTAL:', pageWidth - margin - 75, yPosition + 10);
            doc.setFontSize(14);
            doc.text(`$${(docData.value || 0).toLocaleString()}`, pageWidth - margin - 5, yPosition + 10, { align: 'right' });
            yPosition += 25;
        }
    }

    // ==================== SIGNATURE PAGE ====================
    checkNewPage(60);
    yPosition += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURES', margin, yPosition);
    doc.line(margin, yPosition + 2, margin + 40, yPosition + 2);
    yPosition += 25;

    // Party 1 Signature (Always Provider/NBT)
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('ON BEHALF OF SERVICE PROVIDER', margin, yPosition);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(22);
    doc.setTextColor(br, bg, bb);
    doc.text(docData.brandName || 'PROVIDER', margin, yPosition + 12);
    doc.line(margin, yPosition + 15, margin + 70, yPosition + 15);

    // Party 2 Signature (Client)
    if (docData.signature || docData.status === 'SIGNED') {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('ON BEHALF OF CLIENT', pageWidth - margin - 70, yPosition);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(22);
        doc.setTextColor(br, bg, bb);
        doc.text(docData.signature || docData.signedBy || 'Digitally Signed', pageWidth - margin - 70, yPosition + 12);
        doc.line(pageWidth - margin - 70, yPosition + 15, pageWidth - margin, yPosition + 15);
    } else {
        doc.setDrawColor(200, 200, 200);
        doc.line(pageWidth - margin - 70, yPosition + 15, pageWidth - margin, yPosition + 15);
        doc.setFontSize(8);
        doc.text('RECIPIENT SIGNATURE', pageWidth - margin - 70, yPosition + 20);
    }

    // ==================== PAGE FOOTERS & HEADERS ====================
    const pageCount = doc.getNumberOfPages();
    const footerText = docData.content.customFooter || docData.brandName || '';

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Premium Page Header for Legal
        if (docData.type === 'NDA' || docData.type === 'AGREEMENT') {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(br, bg, bb);
            doc.text('PRIVATE & CONFIDENTIAL', margin, 12, { charSpace: 1 });
            doc.setDrawColor(br, bg, bb);
            doc.setLineWidth(0.1);
            doc.line(margin, 14, pageWidth - margin, 14);
        }

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);

        // Center Page Number
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

        // Left Side: Branding / Custom Footer
        doc.text(`${footerText} - ${docData.name}`, margin, pageHeight - 10);

        // Right Side: Date
        doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    return doc.output('blob');
}
