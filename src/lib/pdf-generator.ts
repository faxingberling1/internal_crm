import { jsPDF } from 'jspdf';

export interface DocumentData {
    id: string;
    name: string;
    type: 'PROPOSAL' | 'CUSTOM_PLAN' | 'NDA' | 'AGREEMENT';
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
            doc.setFontSize(11);
            doc.setFont('times', 'bold');
            doc.setTextColor(br, bg, bb);
            doc.text(title.toUpperCase(), margin, yPos);
            doc.setDrawColor(br, bg, bb);
            doc.setLineWidth(0.5);
            doc.line(margin, yPos + 2, margin + contentWidth / 4, yPos + 2);
            doc.setLineWidth(0.2);
            return yPos + 12;
        }

        doc.setFillColor(br, bg, bb);
        doc.rect(margin, yPos - 5, 2, 8, 'F');
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(title, margin + 6, yPos);
        return yPos + 12;
    };

    // ==================== COVER PAGE ====================
    if (docData.type === 'PROPOSAL' || docData.type === 'CUSTOM_PLAN') {
        const brandName = docData.brandName || 'PROVIDER';

        // Gradient background for cover
        drawGradientRect(0, 0, pageWidth, pageHeight, [r, g, b], [r2, g2, b2]);

        // Brand Name / Logo
        yPosition = 50;
        if (docData.brandLogo) {
            const logoSize = 50;
            const logoX = (pageWidth - logoSize) / 2;
            doc.addImage(docData.brandLogo, 'PNG', logoX, yPosition, logoSize, logoSize);
            yPosition += logoSize + 10;
        } else {
            doc.setFontSize(40);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text(brandName, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.text(docData.type === 'CUSTOM_PLAN' ? 'PROJECT STRATEGY & ROADMAP' : 'PROFESSIONAL SERVICES PROPOSAL', pageWidth / 2, yPosition, { align: 'center' });

        yPosition = pageHeight - 80;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, yPosition, contentWidth, 50, 8, 8, 'F');
        doc.setFillColor(br, bg, bb);
        doc.roundedRect(margin, yPosition, 6, 50, 3, 3, 'F');

        yPosition += 20;
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(docData.name, margin + 15, yPosition);

        yPosition = pageHeight - 150; // Adjust position for client info
        doc.setFillColor(lr, lg, lb);
        doc.roundedRect(margin, yPosition, contentWidth, 50, 8, 8, 'F');
        yPosition += 15;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(br, bg, bb);
        doc.text('PREPARED FOR', margin + 10, yPosition);
        yPosition += 10;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(docData.client?.name || docData.lead?.name || 'Valued Client', margin + 10, yPosition);

    } else if (docData.type === 'NDA' || docData.type === 'AGREEMENT') {
        // Legal Cover - High-end Treatment
        drawGradientRect(0, 0, pageWidth, 40, [r, g, b], [r2, g2, b2]);

        // Confidential Designation
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('PRIVATE & CONFIDENTIAL', pageWidth / 2, 25, { align: 'center', charSpace: 2 });

        yPosition = 90;
        doc.setFont('times', 'bold');
        doc.setFontSize(32);
        doc.setTextColor(30, 30, 30);
        doc.text(docData.type === 'NDA' ? 'NON-DISCLOSURE\nAGREEMENT' : 'SERVICE\nAGREEMENT', margin, yPosition);

        yPosition += 45;
        doc.setFontSize(14);
        doc.setFont('times', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(docData.name, margin, yPosition);

        yPosition += 40;
        doc.setFontSize(9);
        doc.setFont('times', 'bold');
        doc.setTextColor(br, bg, bb);
        doc.text('BETWEEN', margin, yPosition);

        yPosition += 15;
        const parties = docData.content.parties || [];
        if (parties.length >= 2) {
            const brandName = docData.brandName || 'PROVIDER';
            doc.setFontSize(14);
            doc.setTextColor(30, 30, 30);
            doc.text(brandName, margin, yPosition);

            yPosition += 10;
            doc.setFont('times', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('AND', margin, yPosition);

            yPosition += 10;
            doc.setFont('times', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(30, 30, 30);
            doc.text(parties[1].name || (docData.client?.name || docData.lead?.name || 'Client'), margin, yPosition);
        }

        yPosition = 240;
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(`EFFECTIVE DATE: ${docData.content.effectiveDate || new Date(docData.createdAt).toLocaleDateString()}`, margin, yPosition);
        doc.text(`DOCUMENT ID: ${docData.id.slice(-8).toUpperCase()}`, margin, yPosition + 6);
    } else {
        // Proposal/Plan Style Cover
        if (hasClientBranding) {
            drawGradientRect(0, 0, pageWidth / 2, 100, [r, g, b], [br, bg, bb]);
            drawGradientRect(pageWidth / 2, 0, pageWidth / 2, 100, [br, bg, bb], [cr, cg, cb]);
        } else {
            drawGradientRect(0, 0, pageWidth, 100, [r, g, b], [r2, g2, b2]);
        }

        yPosition = 40;
        if (docData.brandLogo || docData.clientLogo) {
            const logoSize = 35;
            if (docData.brandLogo) doc.addImage(docData.brandLogo, 'PNG', margin + 5, yPosition - 15, logoSize, logoSize);
            if (docData.clientLogo) doc.addImage(docData.clientLogo, 'PNG', pageWidth - margin - 40, yPosition - 15, logoSize, logoSize);
            yPosition += 45;
        } else {
            doc.setFontSize(42);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(docData.brandName || 'PROVIDER', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;
        }

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.text(docData.type === 'CUSTOM_PLAN' ? 'PROJECT STRATEGY & ROADMAP' : 'PROFESSIONAL SERVICES PROPOSAL', pageWidth / 2, yPosition, { align: 'center' });

        yPosition = 120;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, yPosition, contentWidth, 50, 8, 8, 'F');
        doc.setFillColor(br, bg, bb);
        doc.roundedRect(margin, yPosition, 6, 50, 3, 3, 'F');

        yPosition += 20;
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(docData.name, margin + 15, yPosition);

        yPosition = 190;
        doc.setFillColor(lr, lg, lb);
        doc.roundedRect(margin, yPosition, contentWidth, 50, 8, 8, 'F');
        yPosition += 15;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(br, bg, bb);
        doc.text('PREPARED FOR', margin + 10, yPosition);
        yPosition += 10;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(docData.client?.name || docData.lead?.name || 'Valued Client', margin + 10, yPosition);
    }

    // ==================== CONTENT PAGES ====================
    doc.addPage();
    yPosition = margin + 15;

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
