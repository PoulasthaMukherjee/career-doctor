import fs from 'fs';
import path from 'path';
import { parseResumeWithAI } from './ai';

export async function extractAndParseResume(filePath: string): Promise<string | null> {
    try {
        const absolutePath = path.join(process.cwd(), 'public', filePath);
        if (!fs.existsSync(absolutePath)) {
            console.error('Resume file not found:', absolutePath);
            return null;
        }

        const buffer = fs.readFileSync(absolutePath);
        const text = await extractTextFromPDF(buffer);

        if (!text || text.trim().length < 20) {
            console.error('No meaningful text extracted from PDF');
            return null;
        }

        // Parse with AI
        const parsed = await parseResumeWithAI(text);
        if (!parsed) return null;

        return JSON.stringify(parsed);
    } catch (error) {
        console.error('Resume parsing error:', error);
        return null;
    }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    // Use pdfjs-dist directly — more reliable than pdf-parse in Node.js
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const data = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items
            .filter((item: any) => 'str' in item)
            .map((item: any) => item.str);
        pages.push(strings.join(' '));
    }

    return pages.join('\n\n');
}
