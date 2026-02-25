'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { extractAndParseResume } from "./parse-resume";

export async function createResume(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const version = formData.get('version') as string;
    const content = formData.get('content') as string;
    const fileName = formData.get('fileName') as string;
    const fileData = formData.get('fileData') as string;

    if (!version) throw new Error("Version name is required");

    const resume = await prisma.resume.create({
        data: {
            version,
            content: content || null,
            fileName: fileName || null,
            fileData: fileData || null,
            userId: session.user.id,
        }
    });

    // Trigger AI resume parsing in background (don't block the user)
    if (fileName && fileData) {
        // Parse resume from base64 data
        try {
            const buffer = Buffer.from(fileData, 'base64');
            const pdfjsLib = await import('pdfjs-dist');
            const data = new Uint8Array(buffer);
            const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

            let fullText = "";
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                const content = await page.getTextContent();
                const strings = content.items
                    .filter((item: any) => 'str' in item)
                    .map((item: any) => item.str);
                fullText += strings.join(' ') + '\n\n';
            }

            if (fullText.trim().length > 20) {
                const { askGemini } = await import('./ai');
                const prompt = `Extract structured resume data from this text. Return JSON with: fullName, title, email, phone, location, summary, skills (string[]), experience (array of {title, company, startDate, endDate, description}), education (array of {degree, institution, year}), projects (array of {name, description, url}), certifications (string[]), achievements (string[]), links (array of {label, url}).\n\nResume text:\n${fullText}`;
                const parsed = await askGemini(prompt);
                if (parsed) {
                    await prisma.resume.update({
                        where: { id: resume.id },
                        data: { parsedContent: parsed },
                    });
                }
            }
        } catch (e) {
            console.error('Resume parse error:', e);
        }
    }

    revalidatePath('/resumes');
    redirect('/resumes');
}

export async function deleteResume(resumeId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.resume.delete({
        where: { id: resumeId, userId: session.user.id },
    });

    revalidatePath('/resumes');
}
