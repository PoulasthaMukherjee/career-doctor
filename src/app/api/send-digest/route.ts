import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDigestEmail } from '@/lib/email';
import { getDigestData } from '@/lib/digest';

export async function POST(request: Request) {
    // Simple cron security check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // Find users who opted in to emails (assuming all for now since we don't have preferences db field)
        const users = await prisma.user.findMany({
            take: 50 // process in batches
        });

        let sentCount = 0;

        // In a real app we'd queue these or use Promise.allSettled chunks
        for (const user of users) {
            if (!user.email) continue;

            // Get their specific digest data
            const data = await getDigestData(user.id);
            if (!data) continue;

            // Send
            await sendDigestEmail(user.email, user.name || 'friend', data.pipelineStatus, data.tipOfTheDay);
            sentCount++;
        }

        return NextResponse.json({ success: true, count: sentCount });

    } catch (error) {
        console.error('Digest batch error:', error);
        return NextResponse.json({ error: 'Failed to process digest batch' }, { status: 500 });
    }
}
