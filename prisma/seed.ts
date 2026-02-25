import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Find or get the first user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No user found. Please register first at /register');
        process.exit(1);
    }

    console.log(`Seeding data for user: ${user.email}`);

    // Create resume versions
    const resumeA = await prisma.resume.create({
        data: {
            userId: user.id,
            version: 'Frontend Focus',
            content: 'Tailored for React/Next.js roles. Highlights: component architecture, performance optimization, design systems.',
        }
    });

    const resumeB = await prisma.resume.create({
        data: {
            userId: user.id,
            version: 'Backend Focus',
            content: 'Tailored for Node.js/Python backend roles. Highlights: API design, distributed systems, database optimization.',
        }
    });

    const resumeC = await prisma.resume.create({
        data: {
            userId: user.id,
            version: 'Fullstack Generalist',
            content: 'Balanced resume for fullstack roles. Covers both frontend and backend with equal emphasis.',
        }
    });

    console.log('Created 3 resume versions.');

    // Sample applications with realistic variety
    const applications = [
        {
            company: 'Stripe',
            role: 'Frontend Engineer',
            companySize: 'enterprise (>5000)',
            location: 'San Francisco, CA',
            workMode: 'hybrid',
            source: 'Company Website',
            daysSincePosted: 1,
            outcome: 'INTERVIEW',
            resumeId: resumeA.id,
            applyTime: new Date('2026-02-10'),
        },
        {
            company: 'Vercel',
            role: 'Fullstack Engineer',
            companySize: 'mid-size (500-5000)',
            location: 'Remote',
            workMode: 'remote',
            source: 'LinkedIn',
            daysSincePosted: 0,
            outcome: 'OA',
            resumeId: resumeC.id,
            applyTime: new Date('2026-02-11'),
        },
        {
            company: 'Notion',
            role: 'Frontend Engineer',
            companySize: 'mid-size (500-5000)',
            location: 'New York, NY',
            workMode: 'hybrid',
            source: 'Referral',
            daysSincePosted: 2,
            outcome: 'INTERVIEW',
            resumeId: resumeA.id,
            applyTime: new Date('2026-02-12'),
        },
        {
            company: 'Linear',
            role: 'Fullstack Engineer',
            companySize: 'startup (<500)',
            location: 'Remote',
            workMode: 'remote',
            source: 'Company Website',
            daysSincePosted: 1,
            outcome: 'OFFER',
            resumeId: resumeC.id,
            applyTime: new Date('2026-02-13'),
        },
        {
            company: 'Amazon',
            role: 'Backend Engineer (SDE II)',
            companySize: 'enterprise (>5000)',
            location: 'Seattle, WA',
            workMode: 'onsite',
            source: 'Easy Apply',
            daysSincePosted: 5,
            outcome: 'IGNORED',
            resumeId: resumeB.id,
            applyTime: new Date('2026-02-14'),
        },
        {
            company: 'Postman',
            role: 'Backend Engineer',
            companySize: 'mid-size (500-5000)',
            location: 'Bangalore, India',
            workMode: 'hybrid',
            source: 'LinkedIn',
            daysSincePosted: 3,
            outcome: 'IGNORED',
            resumeId: resumeB.id,
            applyTime: new Date('2026-02-15'),
        },
        {
            company: 'Retool',
            role: 'Frontend Engineer',
            companySize: 'startup (<500)',
            location: 'San Francisco, CA',
            workMode: 'hybrid',
            source: 'Referral',
            daysSincePosted: 0,
            outcome: 'INTERVIEW',
            resumeId: resumeA.id,
            applyTime: new Date('2026-02-16'),
        },
        {
            company: 'Databricks',
            role: 'Data Engineer',
            companySize: 'enterprise (>5000)',
            location: 'Remote',
            workMode: 'remote',
            source: 'Recruiter',
            daysSincePosted: 4,
            outcome: 'IGNORED',
            resumeId: resumeB.id,
            applyTime: new Date('2026-02-17'),
        },
        {
            company: 'Figma',
            role: 'Fullstack Engineer',
            companySize: 'mid-size (500-5000)',
            location: 'New York, NY',
            workMode: 'hybrid',
            source: 'Company Website',
            daysSincePosted: 1,
            outcome: 'OA',
            resumeId: resumeC.id,
            applyTime: new Date('2026-02-18'),
        },
        {
            company: 'Plaid',
            role: 'Backend Engineer',
            companySize: 'mid-size (500-5000)',
            location: 'San Francisco, CA',
            workMode: 'hybrid',
            source: 'Easy Apply',
            daysSincePosted: 7,
            outcome: 'IGNORED',
            resumeId: resumeB.id,
            applyTime: new Date('2026-02-19'),
        },
        {
            company: 'Cloudflare',
            role: 'Frontend Engineer',
            companySize: 'enterprise (>5000)',
            location: 'Austin, TX',
            workMode: 'remote',
            source: 'LinkedIn',
            daysSincePosted: 2,
            outcome: 'IGNORED',
            resumeId: resumeA.id,
            applyTime: new Date('2026-02-20'),
        },
        {
            company: 'Supabase',
            role: 'Fullstack Engineer',
            companySize: 'startup (<500)',
            location: 'Remote',
            workMode: 'remote',
            source: 'Company Website',
            daysSincePosted: 0,
            outcome: 'INTERVIEW',
            resumeId: resumeC.id,
            applyTime: new Date('2026-02-21'),
        },
    ];

    for (const app of applications) {
        await prisma.application.create({
            data: {
                userId: user.id,
                ...app,
            }
        });
    }

    console.log(`Created ${applications.length} sample applications.`);
    console.log('Seeding complete!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
