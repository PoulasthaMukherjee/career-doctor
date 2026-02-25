import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/profile-actions';
import { prisma } from '@/lib/prisma';
import ProfilePageClient from '@/components/ProfilePageClient';

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const profile = await getProfile();

    // Get resumes for autofill dropdown
    const resumes = await prisma.resume.findMany({
        where: { userId: session.user.id },
        select: { id: true, version: true, parsedContent: true, fileName: true },
        orderBy: { createdAt: 'desc' },
    });

    return <ProfilePageClient initialProfile={profile} resumes={resumes} />;
}
