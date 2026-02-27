import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:./dev.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'demo@careerdoctor.app';
    const password = 'demo1234';

    // Delete and re-create demo user for clean state
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        await prisma.application.deleteMany({ where: { userId: existing.id } });
        await prisma.profile.deleteMany({ where: { userId: existing.id } });
        await prisma.account.deleteMany({ where: { userId: existing.id } });
        await prisma.session.deleteMany({ where: { userId: existing.id } });
        await prisma.user.delete({ where: { id: existing.id } });
        console.log('✓ Cleaned up existing demo user');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name: 'Alex Demo',
            email,
            password: hashedPassword,
        },
    });

    await prisma.profile.create({
        data: {
            userId: user.id,
            fullName: 'Alex Demo',
            title: 'Frontend Developer',
            email,
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA, USA',
            summary: 'Frontend developer with 1.5 years of experience building responsive web applications with React, TypeScript, and Next.js. Passionate about clean UI/UX, performance, and translating product requirements into polished user experiences. Looking to transition into Product Management.',
            skills: JSON.stringify([
                'React', 'TypeScript', 'Next.js', 'JavaScript', 'HTML', 'CSS',
                'Tailwind CSS', 'Node.js', 'Git', 'Figma', 'REST APIs',
                'Agile', 'SQL', 'Python', 'Tableau'
            ]),
            experience: JSON.stringify([
                {
                    company: 'TechStart Inc.',
                    title: 'Frontend Developer',
                    location: 'San Francisco, CA',
                    startDate: 'Jul 2024',
                    endDate: 'Present',
                    description: 'Built and maintained customer-facing dashboard using React and TypeScript. Collaborated with product and design teams to ship 3 major features. Improved page load time by 40% through code splitting and lazy loading. Participated in sprint planning and backlog grooming.',
                },
                {
                    company: 'WebCraft Agency',
                    title: 'Junior Frontend Developer',
                    location: 'Remote',
                    startDate: 'Jan 2024',
                    endDate: 'Jun 2024',
                    description: 'Developed responsive websites for 5+ clients using Next.js and Tailwind CSS. Translated Figma designs into pixel-perfect components. Set up CI/CD pipelines with GitHub Actions.',
                },
                {
                    company: 'DataViz Labs',
                    title: 'Software Engineering Intern',
                    location: 'New York, NY',
                    startDate: 'May 2023',
                    endDate: 'Dec 2023',
                    description: 'Built internal analytics dashboard using React and D3.js. Wrote Python scripts for data pipeline automation. Presented weekly sprint demos to stakeholders.',
                },
            ]),
            education: JSON.stringify([
                {
                    institution: 'University of California, Berkeley',
                    degree: 'B.S.',
                    specialization: 'Computer Science',
                    startYear: '2020',
                    endYear: '2024',
                    grade: '3.7',
                },
            ]),
            projects: JSON.stringify([
                {
                    name: 'CareerDoctor',
                    description: 'AI-powered career analytics platform with agentic chatbot, resume parsing, and behavioral funnel diagnosis.',
                    techStack: 'Next.js 16, TypeScript, Prisma, Vercel AI SDK, Tailwind CSS',
                    url: 'https://career-doctor.vercel.app',
                    startDate: 'Feb 2026',
                    endDate: 'Present',
                },
                {
                    name: 'TaskFlow',
                    description: 'Kanban-style project management app with drag-and-drop, real-time collaboration, and GitHub integration.',
                    techStack: 'React, Node.js, Socket.io, PostgreSQL',
                    url: '',
                    startDate: 'Sep 2023',
                    endDate: 'Dec 2023',
                },
            ]),
            achievements: JSON.stringify([
                { title: 'Dean\'s List', description: 'All semesters 2021-2024', date: '2024' },
                { title: 'HackBerkeley Winner', description: '1st place - Built an AI study planner in 24 hours', date: '2023' },
            ]),
            certifications: JSON.stringify([
                { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024', url: '' },
                { name: 'Google UX Design Certificate', issuer: 'Coursera / Google', date: '2023', url: '' },
            ]),
            links: JSON.stringify([
                { type: 'linkedin', url: 'https://linkedin.com/in/alexdemo' },
                { type: 'github', url: 'https://github.com/alexdemo' },
                { type: 'portfolio', url: 'https://alexdemo.dev' },
            ]),
        },
    });

    // Add some sample applications
    await prisma.application.createMany({
        data: [
            { userId: user.id, company: 'Google', role: 'Associate Product Manager', outcome: 'INTERVIEW', companySize: 'large', source: 'LinkedIn', location: 'Mountain View, CA', workMode: 'Hybrid', applyTime: new Date('2026-02-10'), daysSincePosted: 2 },
            { userId: user.id, company: 'Stripe', role: 'Product Manager, Growth', outcome: 'OA', companySize: 'large', source: 'Company Website', location: 'San Francisco, CA', workMode: 'Hybrid', applyTime: new Date('2026-02-12'), daysSincePosted: 5 },
            { userId: user.id, company: 'Notion', role: 'APM', outcome: 'IGNORED', companySize: 'mid', source: 'LinkedIn', location: 'San Francisco, CA', workMode: 'Remote', applyTime: new Date('2026-02-14'), daysSincePosted: 1 },
            { userId: user.id, company: 'Figma', role: 'Product Manager', outcome: 'IGNORED', companySize: 'mid', source: 'Referral', location: 'San Francisco, CA', workMode: 'Hybrid', applyTime: new Date('2026-02-15'), daysSincePosted: 4 },
            { userId: user.id, company: 'Airbnb', role: 'Technical Program Manager', outcome: 'REJECTED', companySize: 'large', source: 'LinkedIn', location: 'San Francisco, CA', workMode: 'Hybrid', applyTime: new Date('2026-02-08'), daysSincePosted: 10 },
            { userId: user.id, company: 'Shopify', role: 'APM', outcome: 'OFFER', companySize: 'large', source: 'Company Website', location: 'Remote', workMode: 'Remote', applyTime: new Date('2026-02-18'), daysSincePosted: 1 },
            { userId: user.id, company: 'Slack', role: 'Product Manager', outcome: 'INTERVIEW', companySize: 'large', source: 'LinkedIn', location: 'San Francisco, CA', workMode: 'Hybrid', applyTime: new Date('2026-02-20'), daysSincePosted: 3 },
            { userId: user.id, company: 'Linear', role: 'Product Engineer', outcome: 'IGNORED', companySize: 'small', source: 'Twitter', location: 'Remote', workMode: 'Remote', applyTime: new Date('2026-02-22'), daysSincePosted: 6 },
        ],
    });

    console.log('✓ Demo user created: demo@careerdoctor.app / demo1234');
    console.log('✓ Profile filled with sample data');
    console.log('✓ 8 sample applications added');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
