import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    let settings = await prisma.brandingSettings.findFirst();

    const data = {
        officeIP: '192.168.18.6',
        officeHoursStart: '09:00',
        officeHoursEnd: '21:00',
        isSecurityEnabled: false // Keeping it disabled for now so they don't get locked out immediately
    };

    if (settings) {
        await prisma.brandingSettings.update({
            where: { id: settings.id },
            data: data as any
        });
        console.log('Updated existing settings with IP: 192.168.18.6');
    } else {
        await prisma.brandingSettings.create({
            data: data as any
        });
        console.log('Created new settings with IP: 192.168.18.6');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
