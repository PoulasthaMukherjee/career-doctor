import { ApplicationInput } from './engines/analysis';

export const mockApplications: ApplicationInput[] = [
    // Successful Backend Startups with Resume B
    { role: 'Backend Engineer', companySize: 'startup (<500)', source: 'Referral', daysSincePosted: 1, resume: { version: 'Resume B' }, outcome: 'INTERVIEW' },
    { role: 'Backend Developer', companySize: 'startup (<500)', source: 'Company Website', daysSincePosted: 0, resume: { version: 'Resume B' }, outcome: 'OFFER' },

    // Ignored Backend Enterprise with Resume A
    { role: 'Backend Engineer', companySize: 'enterprise (>500)', source: 'Easy Apply', daysSincePosted: 14, resume: { version: 'Resume A' }, outcome: 'IGNORED' },
    { role: 'Java Developer', companySize: 'enterprise (>500)', source: 'Easy Apply', daysSincePosted: 5, resume: { version: 'Resume A' }, outcome: 'IGNORED' },

    // Ignored Frontend roles (oversaturated)
    { role: 'Frontend Engineer', companySize: 'enterprise (>500)', source: 'Company Website', daysSincePosted: 2, resume: { version: 'Resume A' }, outcome: 'IGNORED' },
    { role: 'UI Engineer', companySize: 'enterprise (>500)', source: 'Referral', daysSincePosted: 1, resume: { version: 'Resume A' }, outcome: 'IGNORED' },
    { role: 'Frontend Developer', companySize: 'enterprise (>500)', source: 'Easy Apply', daysSincePosted: 10, resume: { version: 'Resume B' }, outcome: 'IGNORED' },

    // Late applications yielding nothing
    { role: 'Software Engineer', companySize: 'enterprise (>500)', source: 'Company Website', daysSincePosted: 30, resume: { version: 'Resume A' }, outcome: 'IGNORED' },
    { role: 'SDE I', companySize: 'enterprise (>500)', source: 'Easy Apply', daysSincePosted: 45, resume: { version: 'Resume A' }, outcome: 'IGNORED' },
];
