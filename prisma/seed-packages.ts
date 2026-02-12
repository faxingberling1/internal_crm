import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_PACKAGES = [
    {
        name: "Premium Website Design",
        description: "Complete custom website design with modern UI/UX, responsive layout, and SEO optimization",
        category: "WEB_DESIGN",
        price: 5000,
        features: JSON.stringify([
            "Custom responsive design",
            "5-10 pages included",
            "SEO optimization",
            "Mobile-first approach",
            "Content management system",
            "2 rounds of revisions",
            "30 days post-launch support"
        ])
    },
    {
        name: "E-Commerce Portal",
        description: "Full-featured e-commerce platform with payment integration and inventory management",
        category: "PORTAL_DESIGN",
        price: 12000,
        features: JSON.stringify([
            "Product catalog management",
            "Shopping cart & checkout",
            "Payment gateway integration",
            "Inventory tracking",
            "Order management system",
            "Customer accounts",
            "Admin dashboard"
        ])
    },
    {
        name: "SEO Optimization Package",
        description: "Comprehensive SEO strategy to improve search rankings and organic traffic",
        category: "SEO",
        price: 2500,
        features: JSON.stringify([
            "Technical SEO audit",
            "Keyword research & strategy",
            "On-page optimization",
            "Content optimization",
            "Backlink analysis",
            "Monthly reporting",
            "3 months of support"
        ])
    },
    {
        name: "Social Media Marketing",
        description: "Strategic social media management and advertising campaigns",
        category: "MARKETING",
        price: 3000,
        features: JSON.stringify([
            "Multi-platform management",
            "Content creation & scheduling",
            "Paid advertising campaigns",
            "Analytics & reporting",
            "Community engagement",
            "Monthly strategy sessions",
            "3 months minimum"
        ])
    },
    {
        name: "Professional Copywriting",
        description: "High-quality content writing for websites, blogs, and marketing materials",
        category: "COPYWRITING",
        price: 1500,
        features: JSON.stringify([
            "Website copy (up to 10 pages)",
            "SEO-optimized content",
            "Brand voice development",
            "2 rounds of revisions",
            "Meta descriptions",
            "Call-to-action optimization"
        ])
    },
    {
        name: "Brand Identity Package",
        description: "Complete brand identity including logo, color palette, and brand guidelines",
        category: "BRANDING",
        price: 3500,
        features: JSON.stringify([
            "Custom logo design (3 concepts)",
            "Color palette development",
            "Typography selection",
            "Brand style guide",
            "Business card design",
            "Social media templates",
            "Unlimited revisions"
        ])
    },
    {
        name: "Customer Portal Development",
        description: "Custom client portal with user authentication and dashboard",
        category: "PORTAL_DESIGN",
        price: 8000,
        features: JSON.stringify([
            "User authentication system",
            "Custom dashboard",
            "Document management",
            "Messaging system",
            "Role-based access control",
            "Mobile responsive",
            "API integration ready"
        ])
    },
    {
        name: "Content Marketing Strategy",
        description: "Comprehensive content marketing plan with blog posts and social content",
        category: "MARKETING",
        price: 2000,
        features: JSON.stringify([
            "Content strategy development",
            "Editorial calendar",
            "4 blog posts per month",
            "Social media content",
            "Email newsletter templates",
            "Performance analytics",
            "3 months minimum"
        ])
    }
];

async function seedPackages() {
    console.log('Seeding packages...');

    for (const pkgData of SEED_PACKAGES) {
        const existing = await prisma.package.findFirst({
            where: { name: pkgData.name }
        });

        if (existing) {
            await prisma.package.update({
                where: { id: existing.id },
                data: pkgData
            });
            console.log(`Updated: ${pkgData.name}`);
        } else {
            await prisma.package.create({
                data: pkgData
            });
            console.log(`Created: ${pkgData.name}`);
        }
    }

    console.log(`✅ Seeded ${SEED_PACKAGES.length} packages`);
}

seedPackages()
    .catch((e) => {
        console.error('Error seeding packages:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
