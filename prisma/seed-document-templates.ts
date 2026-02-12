import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const documentTemplates = [
    // ==================== CUSTOM PLAN TEMPLATES ====================
    {
        type: 'CUSTOM_PLAN',
        name: 'Service Plan Template',
        category: 'SERVICE_PLAN',
        description: 'Comprehensive service plan for ongoing client engagements',
        requiresSignature: false,
        defaultValidDays: 90,
        content: {
            planType: 'SERVICE_PLAN',
            overview: 'This service plan outlines the ongoing services {{company_name}} will provide to {{client_name}} to support your business objectives and ensure consistent, high-quality results.',
            goals: [
                'Provide consistent, reliable service delivery',
                'Maintain clear communication and reporting',
                'Achieve measurable business outcomes',
                'Build long-term partnership and trust'
            ],
            phases: [
                {
                    name: 'Onboarding & Setup',
                    description: 'Initial setup, account configuration, and team alignment',
                    milestones: [
                        'Kickoff meeting and goal alignment',
                        'Access and credentials setup',
                        'Communication channels established',
                        'Initial baseline assessment complete'
                    ]
                },
                {
                    name: 'Ongoing Service Delivery',
                    description: 'Regular service execution according to agreed scope',
                    milestones: [
                        'Weekly/monthly deliverables',
                        'Regular status updates',
                        'Performance monitoring',
                        'Continuous optimization'
                    ]
                },
                {
                    name: 'Review & Optimization',
                    description: 'Quarterly reviews and strategy adjustments',
                    milestones: [
                        'Quarterly business reviews',
                        'Performance analysis',
                        'Strategy recommendations',
                        'Plan adjustments as needed'
                    ]
                }
            ],
            resources: [
                'Dedicated account manager',
                'Technical support team',
                'Monthly performance reports',
                'Access to client portal',
                'Priority support channel'
            ],
            timeline: '12-month engagement with quarterly reviews',
            budget: {
                monthlyRetainer: 'As specified in agreement',
                paymentSchedule: 'Monthly, due on the 1st of each month',
                additionalServices: 'Billed separately at agreed rates'
            },
            successMetrics: [
                'Service delivery within agreed SLAs',
                'Client satisfaction scores above 4.5/5',
                'Measurable improvement in key KPIs',
                'Timely communication and reporting'
            ]
        }
    },
    {
        type: 'CUSTOM_PLAN',
        name: 'Project Plan Template',
        category: 'PROJECT_PLAN',
        description: 'Detailed project plan for one-time engagements',
        requiresSignature: false,
        defaultValidDays: 60,
        content: {
            planType: 'PROJECT_PLAN',
            overview: 'This project plan outlines the approach, timeline, and deliverables for {{client_name}}\'s project. Our structured methodology ensures successful delivery on time and within budget.',
            goals: [
                'Complete project within agreed timeline',
                'Deliver all specified requirements',
                'Maintain high quality standards',
                'Ensure smooth handoff and training'
            ],
            phases: [
                {
                    name: 'Discovery & Planning',
                    description: 'Requirements gathering and project planning',
                    milestones: [
                        'Stakeholder interviews complete',
                        'Requirements documented and approved',
                        'Project plan finalized',
                        'Resources allocated'
                    ]
                },
                {
                    name: 'Design & Development',
                    description: 'Core project execution',
                    milestones: [
                        'Design concepts approved',
                        'Development milestones achieved',
                        'Regular client reviews',
                        'Quality assurance testing'
                    ]
                },
                {
                    name: 'Testing & Refinement',
                    description: 'Quality assurance and final adjustments',
                    milestones: [
                        'User acceptance testing',
                        'Bug fixes and refinements',
                        'Performance optimization',
                        'Final client approval'
                    ]
                },
                {
                    name: 'Launch & Handoff',
                    description: 'Deployment and knowledge transfer',
                    milestones: [
                        'Production deployment',
                        'Team training completed',
                        'Documentation delivered',
                        'Post-launch support'
                    ]
                }
            ],
            resources: [
                'Dedicated project manager',
                'Specialized technical team',
                'Weekly progress reports',
                'Project management tools access',
                'Direct communication channels'
            ],
            timeline: '12-16 weeks from kickoff to launch',
            budget: {
                totalInvestment: 'As specified in proposal',
                paymentMilestones: 'Tied to project phases',
                changeRequests: 'Handled via change order process'
            },
            successMetrics: [
                'On-time delivery of all milestones',
                'Budget adherence',
                'Quality standards met',
                'Client satisfaction and approval'
            ]
        }
    },
    {
        type: 'CUSTOM_PLAN',
        name: 'Product Roadmap Template',
        category: 'ROADMAP',
        description: 'Strategic product development roadmap',
        requiresSignature: false,
        defaultValidDays: 180,
        content: {
            planType: 'ROADMAP',
            overview: 'This roadmap outlines the strategic vision and development plan for {{client_name}}\'s product over the next 6-12 months. It provides a clear path from current state to desired outcomes.',
            goals: [
                'Define clear product vision and strategy',
                'Prioritize features based on business value',
                'Align stakeholders on direction',
                'Enable data-driven decision making'
            ],
            phases: [
                {
                    name: 'Q1: Foundation',
                    description: 'Core functionality and infrastructure',
                    milestones: [
                        'MVP features complete',
                        'User authentication and security',
                        'Basic analytics implementation',
                        'Initial user testing'
                    ]
                },
                {
                    name: 'Q2: Growth',
                    description: 'Feature expansion and optimization',
                    milestones: [
                        'Advanced features rollout',
                        'Performance optimization',
                        'Integration capabilities',
                        'User feedback incorporation'
                    ]
                },
                {
                    name: 'Q3: Scale',
                    description: 'Scaling and enterprise features',
                    milestones: [
                        'Enterprise-grade features',
                        'Advanced reporting and analytics',
                        'API and third-party integrations',
                        'Multi-tenant support'
                    ]
                },
                {
                    name: 'Q4: Innovation',
                    description: 'Competitive differentiation',
                    milestones: [
                        'AI/ML capabilities',
                        'Advanced automation',
                        'Mobile applications',
                        'Market expansion features'
                    ]
                }
            ],
            resources: [
                'Product management team',
                'Development resources',
                'UX/UI designers',
                'QA and testing team',
                'DevOps support'
            ],
            timeline: '12-month strategic roadmap with quarterly milestones',
            budget: {
                quarterlyBudget: 'Allocated per quarter based on priorities',
                resourceAllocation: 'Flexible based on phase requirements',
                contingency: '15% buffer for unexpected opportunities'
            },
            successMetrics: [
                'Feature delivery against roadmap',
                'User adoption and engagement rates',
                'Product-market fit indicators',
                'Revenue and growth targets'
            ]
        }
    },

    // ==================== NDA TEMPLATES ====================
    {
        type: 'NDA',
        name: 'Mutual Non-Disclosure Agreement',
        category: 'MUTUAL',
        description: 'Mutual NDA for two-way confidential information exchange',
        requiresSignature: true,
        defaultValidDays: 1095, // 3 years
        content: {
            ndaType: 'MUTUAL',
            parties: [
                {
                    name: '{{company_name}}',
                    role: 'DISCLOSING_AND_RECEIVING',
                    address: '{{company_address}}'
                },
                {
                    name: '{{client_name}}',
                    role: 'DISCLOSING_AND_RECEIVING',
                    address: '{{client_address}}'
                }
            ],
            effectiveDate: '{{current_date}}',
            termLength: '3 years from the Effective Date',
            confidentialInfo: 'Confidential Information includes all information disclosed by either party, whether orally, in writing, or in any other form, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure. This includes, but is not limited to: business plans, financial information, technical data, trade secrets, know-how, research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, marketing, or finances.',
            exclusions: [
                'Information that is or becomes publicly available without breach of this Agreement',
                'Information that was rightfully in the receiving party\'s possession prior to disclosure',
                'Information that is independently developed by the receiving party without use of the Confidential Information',
                'Information that is rightfully obtained from a third party without restriction on disclosure'
            ],
            obligations: [
                'Maintain the confidentiality of all Confidential Information',
                'Use Confidential Information only for the Purpose stated in this Agreement',
                'Limit disclosure to employees and contractors who have a need to know',
                'Protect Confidential Information with the same degree of care used for own confidential information',
                'Return or destroy all Confidential Information upon request or termination of this Agreement'
            ],
            jurisdiction: 'This Agreement shall be governed by the laws of {{jurisdiction}}',
            additionalTerms: 'Neither party shall make any public announcement or disclosure regarding this Agreement or the discussions between the parties without the prior written consent of the other party. This Agreement does not create any obligation to enter into any further agreement or business relationship.'
        }
    },
    {
        type: 'NDA',
        name: 'Unilateral Non-Disclosure Agreement',
        category: 'UNILATERAL',
        description: 'One-way NDA for protecting company confidential information',
        requiresSignature: true,
        defaultValidDays: 730, // 2 years
        content: {
            ndaType: 'UNILATERAL',
            parties: [
                {
                    name: '{{company_name}}',
                    role: 'DISCLOSING',
                    address: '{{company_address}}'
                },
                {
                    name: '{{client_name}}',
                    role: 'RECEIVING',
                    address: '{{client_address}}'
                }
            ],
            effectiveDate: '{{current_date}}',
            termLength: '2 years from the Effective Date',
            confidentialInfo: 'Confidential Information means any and all information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, or in any other form, including but not limited to: technical data, trade secrets, know-how, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, or other business information.',
            exclusions: [
                'Information that is publicly available at the time of disclosure or becomes publicly available through no fault of the Receiving Party',
                'Information that was in the Receiving Party\'s possession prior to disclosure by the Disclosing Party',
                'Information that is independently developed by the Receiving Party without use of or reference to the Confidential Information',
                'Information that is rightfully received by the Receiving Party from a third party without restriction'
            ],
            obligations: [
                'Hold and maintain the Confidential Information in strict confidence',
                'Use the Confidential Information solely for the Purpose of evaluating a potential business relationship',
                'Not disclose the Confidential Information to any third parties without prior written consent',
                'Limit access to the Confidential Information to employees and contractors who have a legitimate need to know',
                'Immediately notify the Disclosing Party of any unauthorized use or disclosure',
                'Return or destroy all Confidential Information upon written request'
            ],
            jurisdiction: 'This Agreement shall be governed by and construed in accordance with the laws of {{jurisdiction}}, without regard to its conflict of law provisions',
            additionalTerms: 'The Receiving Party acknowledges that unauthorized disclosure or use of Confidential Information could cause irreparable harm to the Disclosing Party. The Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.'
        }
    },

    // ==================== AGREEMENT TEMPLATES ====================
    {
        type: 'AGREEMENT',
        name: 'Service Agreement Template',
        category: 'SERVICE',
        description: 'Standard service agreement for ongoing engagements',
        requiresSignature: true,
        defaultValidDays: 365,
        content: {
            agreementType: 'SERVICE',
            parties: [
                {
                    name: '{{company_name}}',
                    role: 'SERVICE_PROVIDER',
                    address: '{{company_address}}'
                },
                {
                    name: '{{client_name}}',
                    role: 'CLIENT',
                    address: '{{client_address}}'
                }
            ],
            effectiveDate: '{{current_date}}',
            termLength: '12 months, with automatic renewal unless terminated with 30 days notice',
            scope: 'The Service Provider agrees to provide the following services to the Client: {{service_description}}. Services will be delivered in accordance with industry best practices and the specifications outlined in the attached Service Plan.',
            deliverables: [
                'Regular service delivery as specified in Service Plan',
                'Monthly progress reports and analytics',
                'Dedicated account management',
                'Technical support during business hours',
                'Quarterly business reviews'
            ],
            compensation: {
                fee: '{{monthly_fee}} per month',
                paymentSchedule: 'Monthly, due on the 1st of each month',
                latePayment: 'Late payments subject to 1.5% monthly interest',
                expenses: 'Pre-approved expenses billed separately'
            },
            paymentTerms: {
                invoicing: 'Invoices sent on the 25th of each month',
                paymentDue: 'Net 15 days from invoice date',
                method: 'Wire transfer, ACH, or credit card',
                currency: 'USD'
            },
            termination: 'Either party may terminate this Agreement with 30 days written notice. Client remains responsible for payment of all services rendered through the termination date. Early termination by Client may result in early termination fee of one month\'s service fee.',
            liability: 'Service Provider\'s total liability under this Agreement shall not exceed the total fees paid by Client in the 12 months preceding the claim. Service Provider shall not be liable for any indirect, incidental, consequential, or punitive damages.',
            warranties: [
                'Services will be performed in a professional and workmanlike manner',
                'Service Provider has the right and authority to enter into this Agreement',
                'Services will comply with all applicable laws and regulations',
                'Service Provider will maintain appropriate insurance coverage'
            ],
            additionalClauses: [
                'Confidentiality: Both parties agree to maintain confidentiality of proprietary information',
                'Intellectual Property: Client retains ownership of their data and content; Service Provider retains ownership of tools and methodologies',
                'Independent Contractor: Service Provider is an independent contractor, not an employee',
                'Force Majeure: Neither party liable for delays due to circumstances beyond reasonable control',
                'Entire Agreement: This Agreement constitutes the entire agreement between the parties',
                'Amendments: Any amendments must be in writing and signed by both parties'
            ]
        }
    },
    {
        type: 'AGREEMENT',
        name: 'Master Service Agreement (MSA)',
        category: 'MSA',
        description: 'Comprehensive MSA for long-term client relationships',
        requiresSignature: true,
        defaultValidDays: 1095, // 3 years
        content: {
            agreementType: 'MSA',
            parties: [
                {
                    name: '{{company_name}}',
                    role: 'SERVICE_PROVIDER',
                    address: '{{company_address}}'
                },
                {
                    name: '{{client_name}}',
                    role: 'CLIENT',
                    address: '{{client_address}}'
                }
            ],
            effectiveDate: '{{current_date}}',
            termLength: '3 years from Effective Date, with automatic annual renewals',
            scope: 'This Master Service Agreement establishes the general terms and conditions under which Service Provider will provide services to Client. Specific projects and services will be defined in separate Statements of Work (SOWs) that reference this MSA.',
            deliverables: [
                'Services as specified in individual SOWs',
                'Regular status reporting',
                'Quality assurance and testing',
                'Documentation and training materials',
                'Post-delivery support as specified'
            ],
            compensation: {
                structure: 'Fees specified in individual SOWs',
                rateCard: 'Standard hourly rates attached as Exhibit A',
                volumeDiscounts: 'Available for commitments over $100,000 annually',
                priceAdjustment: 'Rates may be adjusted annually with 60 days notice'
            },
            paymentTerms: {
                invoicing: 'As specified in individual SOWs',
                paymentDue: 'Net 30 days from invoice date',
                disputeResolution: 'Disputed amounts must be raised within 10 days of invoice',
                retainage: 'Client may withhold 10% pending final acceptance'
            },
            termination: 'Either party may terminate this MSA with 90 days written notice. Termination of MSA does not automatically terminate active SOWs. Individual SOWs may be terminated as specified therein.',
            liability: 'Service Provider\'s aggregate liability under this MSA and all SOWs shall not exceed the total fees paid in the 12 months preceding the claim, or $100,000, whichever is greater. Neither party shall be liable for indirect, incidental, consequential, or punitive damages.',
            warranties: [
                'Services performed with professional skill and care',
                'Compliance with all applicable laws and regulations',
                'No infringement of third-party intellectual property rights',
                'Service Provider maintains appropriate insurance',
                'Work product will be free from material defects for 90 days'
            ],
            additionalClauses: [
                'Intellectual Property: Client owns deliverables; Service Provider retains ownership of pre-existing IP and tools',
                'Confidentiality: Governed by separate NDA or confidentiality provisions herein',
                'Data Protection: Service Provider will comply with applicable data protection laws',
                'Subcontractors: Service Provider may use subcontractors with Client approval',
                'Insurance: Service Provider maintains professional liability insurance of at least $2M',
                'Indemnification: Each party indemnifies the other for breaches of their obligations',
                'Dispute Resolution: Good faith negotiation, then mediation, then arbitration',
                'Governing Law: Laws of {{jurisdiction}} without regard to conflicts of law',
                'Assignment: Neither party may assign without prior written consent',
                'Severability: Invalid provisions severed without affecting remainder'
            ]
        }
    },
    {
        type: 'AGREEMENT',
        name: 'Statement of Work (SOW) Template',
        category: 'SOW',
        description: 'Project-specific SOW template for use with MSA',
        requiresSignature: true,
        defaultValidDays: 180,
        content: {
            agreementType: 'SOW',
            parties: [
                {
                    name: '{{company_name}}',
                    role: 'SERVICE_PROVIDER',
                    address: '{{company_address}}'
                },
                {
                    name: '{{client_name}}',
                    role: 'CLIENT',
                    address: '{{client_address}}'
                }
            ],
            effectiveDate: '{{current_date}}',
            termLength: 'Project duration as specified, estimated {{project_duration}} weeks',
            scope: 'This Statement of Work is entered into under the Master Service Agreement dated {{msa_date}}. This SOW defines the specific services, deliverables, timeline, and fees for the project titled: {{project_name}}.',
            deliverables: [
                '{{deliverable_1}}',
                '{{deliverable_2}}',
                '{{deliverable_3}}',
                'Project documentation',
                'Source files and assets',
                'Training and knowledge transfer'
            ],
            compensation: {
                projectFee: '{{total_project_fee}}',
                feeStructure: 'Fixed fee / Time & Materials (specify)',
                hourlyRates: 'As per MSA rate card',
                expenseReimbursement: 'Pre-approved expenses at cost'
            },
            paymentTerms: {
                schedule: [
                    '{{milestone_1_percentage}}% upon SOW execution',
                    '{{milestone_2_percentage}}% upon {{milestone_2_description}}',
                    '{{milestone_3_percentage}}% upon {{milestone_3_description}}',
                    '{{final_percentage}}% upon final acceptance'
                ],
                invoicing: 'Invoices issued upon milestone completion',
                acceptance: 'Client has 5 business days to accept or reject deliverables'
            },
            termination: 'Either party may terminate this SOW with 30 days written notice. Client shall pay for all work completed through termination date plus reasonable wind-down costs. Termination of this SOW does not affect the MSA.',
            liability: 'As specified in the Master Service Agreement',
            warranties: [
                'Deliverables will conform to specifications in this SOW',
                'Work will be original or properly licensed',
                'Services performed with professional skill and care',
                'Deliverables free from material defects for 90 days post-acceptance'
            ],
            additionalClauses: [
                'Change Orders: Changes to scope require written change order signed by both parties',
                'Dependencies: Client responsible for timely provision of information, access, and approvals',
                'Delays: Timeline may be extended for client-caused delays or force majeure events',
                'Acceptance Criteria: Deliverables deemed accepted if no rejection within 5 business days',
                'Support: Post-delivery support as specified; additional support available at standard rates',
                'Governing Terms: This SOW governed by MSA; in case of conflict, SOW terms prevail for this project'
            ]
        }
    }
];

async function main() {
    console.log('Seeding document templates...\n');

    for (const template of documentTemplates) {
        await prisma.documentTemplate.create({
            data: template as any,
        });
        console.log(`✓ Created ${template.type} template: ${template.name}`);
    }

    console.log(`\n✅ Successfully seeded ${documentTemplates.length} document templates:`);
    console.log(`   - 3 Custom Plan templates`);
    console.log(`   - 2 NDA templates`);
    console.log(`   - 3 Agreement templates`);
}

main()
    .catch((e) => {
        console.error('Error seeding document templates:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
