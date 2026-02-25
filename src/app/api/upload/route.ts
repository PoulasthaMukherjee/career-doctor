import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
    }

    // Read file bytes and convert to base64 for database storage
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}_${safeName}`;

    // Also try to write locally for dev (best-effort, won't work on Vercel)
    try {
        const { writeFile, mkdir } = await import("fs/promises");
        const { existsSync } = await import("fs");
        const path = await import("path");
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });
        await writeFile(path.join(uploadsDir, fileName), Buffer.from(bytes));
    } catch {
        // Expected to fail on Vercel — that's fine, we have base64 in DB
    }

    return NextResponse.json({ fileName, fileData: base64Data });
}
