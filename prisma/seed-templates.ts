import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
    {
        name: 'Website Design & Development',
        category: 'WEB_DESIGN',
        description: 'Comprehensive website design and development proposal template',
        projectOverview: 'We propose to design and develop a modern, responsive website that effectively represents {{client_name}}\'s brand and achieves your business objectives. Our approach combines strategic planning, creative design, and technical excellence to deliver a website that drives results.',
        objectives: [
            'Create a visually stunning and user-friendly website',
            'Improve online presence and brand credibility',
            'Increase user engagement and conversion rates',
            'Ensure mobile responsiveness and cross-browser compatibility',
            'Implement SEO best practices for better search visibility'
        ],
        scopeOfWork: 'Our comprehensive website development service includes: Discovery & Strategy phase to understand your business goals, UX/UI Design with custom mockups and prototypes, Front-end Development using modern frameworks, Back-end Development with CMS integration, Content Migration and optimization, Quality Assurance testing across devices, and Post-launch support.',
        timeline: [
            {
                phase: 'Discovery & Planning',
                description: 'Requirements gathering, competitor analysis, and project roadmap creation',
                duration: '1-2 weeks'
            },
            {
                phase: 'Design',
                description: 'Wireframes, mockups, and design system development',
                duration: '2-3 weeks'
            },
            {
                phase: 'Development',
                description: 'Front-end and back-end implementation, CMS integration',
                duration: '4-6 weeks'
            },
            {
                phase: 'Testing & Launch',
                description: 'QA testing, client review, deployment, and training',
                duration: '1-2 weeks'
            }
        ],
        deliverables: [
            'Fully responsive website (desktop, tablet, mobile)',
            'Custom design system and brand guidelines',
            'Content Management System (CMS) integration',
            'SEO optimization and analytics setup',
            'Training documentation and video tutorials',
            '30 days of post-launch support'
        ],
        paymentTerms: {
            schedule: [
                { milestone: 'Project Kickoff', percentage: 30, amount: 0 },
                { milestone: 'Design Approval', percentage: 30, amount: 0 },
                { milestone: 'Development Complete', percentage: 30, amount: 0 },
                { milestone: 'Final Launch', percentage: 10, amount: 0 }
            ]
        },
        nextSteps: 'Upon approval of this proposal, we will schedule a kickoff meeting to finalize project details and timelines. We\'ll then begin the discovery phase and provide you with a detailed project plan within 5 business days.',
        terms: 'Payment terms: Net 15 days from invoice date. Project timeline is subject to timely client feedback and content delivery. Additional revisions beyond the agreed scope will be billed at our hourly rate. All source files and code will be delivered upon final payment.'
    },
    {
        name: 'SEO & Digital Marketing',
        category: 'SEO',
        description: 'Comprehensive SEO and digital marketing strategy template',
        projectOverview: 'We propose a comprehensive SEO and digital marketing strategy to increase {{client_name}}\'s online visibility, drive qualified traffic, and generate more leads. Our data-driven approach combines technical SEO, content marketing, and strategic optimization.',
        objectives: [
            'Improve search engine rankings for target keywords',
            'Increase organic website traffic by 50% within 6 months',
            'Enhance online visibility and brand awareness',
            'Generate more qualified leads and conversions',
            'Build sustainable long-term growth'
        ],
        scopeOfWork: 'Our SEO service includes: Comprehensive website audit and competitor analysis, Keyword research and strategy development, On-page optimization (meta tags, content, structure), Technical SEO improvements, Content creation and optimization, Link building and outreach, Monthly reporting and strategy adjustments.',
        timeline: [
            {
                phase: 'Audit & Strategy',
                description: 'Complete website audit, competitor analysis, and strategy development',
                duration: '2 weeks'
            },
            {
                phase: 'Implementation',
                description: 'Technical fixes, on-page optimization, content creation',
                duration: 'Ongoing (Months 1-3)'
            },
            {
                phase: 'Growth & Scaling',
                description: 'Link building, content expansion, performance optimization',
                duration: 'Ongoing (Months 4-6)'
            }
        ],
        deliverables: [
            'Comprehensive SEO audit report',
            'Keyword research and targeting strategy',
            'Monthly performance reports with analytics',
            'Optimized website content and meta data',
            'Quality backlink portfolio',
            'Ongoing strategy recommendations'
        ],
        paymentTerms: {
            schedule: [
                { milestone: 'Initial Setup & Audit', percentage: 40, amount: 0 },
                { milestone: 'Monthly Retainer (5 months)', percentage: 60, amount: 0 }
            ]
        },
        nextSteps: 'Once approved, we\'ll begin with a comprehensive audit of your current SEO status and provide a detailed action plan within one week. Monthly optimization work will commence immediately after.',
        terms: 'This is a 6-month engagement with monthly retainer payments. SEO results typically take 3-6 months to materialize. Contract can be renewed on a month-to-month basis after initial term. 30-day cancellation notice required.'
    },
    {
        name: 'Social Media Marketing',
        category: 'MARKETING',
        description: 'Social media strategy and management proposal template',
        projectOverview: 'We propose to develop and execute a comprehensive social media strategy for {{client_name}} that builds brand awareness, engages your target audience, and drives business results across key social platforms.',
        objectives: [
            'Increase social media following by 200% in 6 months',
            'Boost engagement rates and community interaction',
            'Drive traffic to website and generate leads',
            'Establish brand voice and thought leadership',
            'Create consistent, high-quality content'
        ],
        scopeOfWork: 'Our social media management includes: Platform strategy and content calendar development, Daily content creation and posting (3-5 posts per week), Community management and engagement, Paid social advertising campaigns, Influencer outreach and partnerships, Monthly analytics and reporting, Strategy optimization based on performance.',
        timeline: [
            {
                phase: 'Strategy Development',
                description: 'Audience research, competitor analysis, content strategy',
                duration: '1 week'
            },
            {
                phase: 'Content Creation',
                description: 'Monthly content calendar, graphics, copywriting',
                duration: 'Ongoing'
            },
            {
                phase: 'Management & Optimization',
                description: 'Daily posting, engagement, performance tracking',
                duration: 'Ongoing'
            }
        ],
        deliverables: [
            'Social media strategy document',
            'Monthly content calendar',
            '15-20 custom posts per month',
            'Community management and engagement',
            'Monthly performance reports',
            'Quarterly strategy reviews'
        ],
        paymentTerms: {
            schedule: [
                { milestone: 'Setup & Strategy', percentage: 25, amount: 0 },
                { milestone: 'Monthly Retainer', percentage: 75, amount: 0 }
            ]
        },
        nextSteps: 'Upon approval, we\'ll schedule a strategy session to understand your brand voice, target audience, and goals. Content creation will begin within one week of kickoff.',
        terms: '3-month minimum engagement with monthly retainer. Includes management of up to 3 social platforms. Additional platforms available at additional cost. Client provides brand assets and product information.'
    },
    {
        name: 'Brand Identity & Design',
        category: 'BRANDING',
        description: 'Complete brand identity development proposal template',
        projectOverview: 'We propose to create a comprehensive brand identity for {{client_name}} that authentically represents your values, resonates with your target audience, and differentiates you in the marketplace.',
        objectives: [
            'Develop a unique and memorable brand identity',
            'Create consistent visual language across all touchpoints',
            'Establish brand recognition and credibility',
            'Differentiate from competitors',
            'Build a scalable brand system for future growth'
        ],
        scopeOfWork: 'Our branding service includes: Brand discovery and strategy workshop, Competitive analysis and market research, Logo design (3 concepts, unlimited revisions), Color palette and typography selection, Brand guidelines document, Business card and stationery design, Social media templates, Brand application mockups.',
        timeline: [
            {
                phase: 'Discovery',
                description: 'Brand workshop, research, and strategy development',
                duration: '1 week'
            },
            {
                phase: 'Concept Development',
                description: 'Logo concepts, color palettes, typography exploration',
                duration: '2 weeks'
            },
            {
                phase: 'Refinement',
                description: 'Revisions, finalization, and brand guidelines',
                duration: '1-2 weeks'
            },
            {
                phase: 'Delivery',
                description: 'Final files, guidelines, and application templates',
                duration: '1 week'
            }
        ],
        deliverables: [
            'Primary and secondary logo variations',
            'Complete brand guidelines document',
            'Color palette and typography system',
            'Business card and stationery designs',
            'Social media templates and graphics',
            'All source files and vector formats'
        ],
        paymentTerms: {
            schedule: [
                { milestone: 'Project Start', percentage: 50, amount: 0 },
                { milestone: 'Final Delivery', percentage: 50, amount: 0 }
            ]
        },
        nextSteps: 'We\'ll begin with a brand discovery workshop to understand your vision, values, and target audience. Initial concepts will be presented within two weeks of kickoff.',
        terms: 'Includes 3 initial logo concepts with unlimited revisions on chosen concept. Additional concepts available at additional cost. All intellectual property transfers upon final payment. Rush delivery available for 25% premium.'
    }
];

async function main() {
    console.log('Seeding proposal templates...');

    for (const template of templates) {
        await prisma.proposalTemplate.create({
            data: template,
        });
        console.log(`✓ Created template: ${template.name}`);
    }

    console.log('\n✅ Successfully seeded', templates.length, 'proposal templates');
}

main()
    .catch((e) => {
        console.error('Error seeding templates:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
