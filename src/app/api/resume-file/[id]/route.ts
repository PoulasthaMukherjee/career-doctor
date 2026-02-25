import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const resume = await prisma.resume.findFirst({
        where: { id, userId: session.user.id },
        select: { fileData: true, fileName: true },
    });

    if (!resume?.fileData) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const buffer = Buffer.from(resume.fileData, 'base64');
    const originalName = resume.fileName?.replace(/^\d+_/, '') || 'resume.pdf';

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${originalName}"`,
            'Content-Length': buffer.length.toString(),
        },
    });
}
