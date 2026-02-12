import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// GET branding settings
export async function GET() {
    try {
        // Get the first (and should be only) branding settings record
        let settings = await prisma.brandingSettings.findFirst();

        // If no settings exist, create default ones
        if (!settings) {
            settings = await prisma.brandingSettings.create({
                data: {
                    companyName: 'My Company',
                    companyEmail: 'contact@brand.com',
                    primaryColor: '#9333ea', // Purple-600
                    secondaryColor: '#6366f1', // Indigo-600
                    accentColor: '#8b5cf6', // Violet-600
                },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching branding settings:', error);
        return NextResponse.json({ error: 'Failed to fetch branding settings' }, { status: 500 });
    }
}

// POST/PUT update branding settings
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('crm-session');

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userData = JSON.parse(session.value);

        // Only admins can update branding
        if (userData.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const {
            companyName,
            companyAddress,
            companyPhone,
            companyEmail,
            companyWebsite,
            logoUrl,
            primaryColor,
            secondaryColor,
            accentColor,
            defaultHeader,
            defaultFooter,
            defaultTerms,
        } = body;

        // Get existing settings or create new
        let settings = await prisma.brandingSettings.findFirst();

        if (settings) {
            // Update existing
            settings = await prisma.brandingSettings.update({
                where: { id: settings.id },
                data: {
                    ...(companyName !== undefined && { companyName }),
                    ...(companyAddress !== undefined && { companyAddress }),
                    ...(companyPhone !== undefined && { companyPhone }),
                    ...(companyEmail !== undefined && { companyEmail }),
                    ...(companyWebsite !== undefined && { companyWebsite }),
                    ...(logoUrl !== undefined && { logoUrl }),
                    ...(primaryColor !== undefined && { primaryColor }),
                    ...(secondaryColor !== undefined && { secondaryColor }),
                    ...(accentColor !== undefined && { accentColor }),
                    ...(defaultHeader !== undefined && { defaultHeader }),
                    ...(defaultFooter !== undefined && { defaultFooter }),
                    ...(defaultTerms !== undefined && { defaultTerms }),
                },
            });
        } else {
            // Create new
            settings = await prisma.brandingSettings.create({
                data: {
                    companyName,
                    companyAddress,
                    companyPhone,
                    companyEmail,
                    companyWebsite,
                    logoUrl,
                    primaryColor,
                    secondaryColor,
                    accentColor,
                    defaultHeader,
                    defaultFooter,
                    defaultTerms,
                },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating branding settings:', error);
        return NextResponse.json({ error: 'Failed to update branding settings' }, { status: 500 });
    }
}
