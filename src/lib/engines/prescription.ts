import { DiagnosisResult } from './diagnosis';

export type PrescriptionResult = {
    task: string;
};

export function runPrescription(diagnoses: DiagnosisResult[]): PrescriptionResult[] {
    const prescriptions: PrescriptionResult[] = [];

    for (const doc of diagnoses) {
        if (doc.metric === 'applySpeed') {
            prescriptions.push({ task: 'Apply to at least 10 jobs that are < 24h old this week.' });
        }

        if (doc.metric === 'companySize') {
            const match = doc.message.match(/with (.*?) companies/);
            const size = match ? match[1] : 'the optimal size';
            prescriptions.push({ task: `Target 5 applications specifically to ${size} companies.` });
        }

        if (doc.metric === 'source' && doc.message.includes('Easy Apply')) {
            prescriptions.push({ task: 'Do not use Easy Apply for the next 7 days. Find emails or get referrals.' });
        }

        if (doc.metric === 'resumeVersion') {
            const match = doc.message.match(/^(.*?) performs/);
            const resume = match ? match[1] : 'your best resume';
            prescriptions.push({ task: `Use ${resume} exclusively for relevant roles this week.` });
        }

        if (doc.metric === 'roleCluster' && doc.message.includes('oversaturated')) {
            const match = doc.message.match(/in (.*?)\./);
            const role = match ? match[1] : 'that role';
            prescriptions.push({ task: `Avoid generic ${role} applications. Pivot to a niche or adjacent title.` });
        }
    }

    // Fallback defaults
    if (prescriptions.length === 0) {
        prescriptions.push({ task: 'Apply to 5 high-quality jobs directly on company websites.' });
        prescriptions.push({ task: 'Reach out to 2 school alumni on LinkedIn for coffee chats.' });
    }

    return prescriptions;
}
