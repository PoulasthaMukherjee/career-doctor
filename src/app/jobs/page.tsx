import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import JobsPageClient from "@/components/JobsPageClient";
import { prisma } from "@/lib/prisma";

export default async function JobsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { location: true, title: true },
    });

    return <JobsPageClient profileLocation={profile?.location || ''} profileTitle={profile?.title || ''} />;
}
