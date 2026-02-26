import nodemailer from 'nodemailer';
import { WelcomeEmailTemplate } from './emails/welcome';
import { DigestEmailTemplate } from './emails/digest';
import { AnalysisEmailTemplate } from './emails/analysis';
import { CareerAnalysis } from './career-analysis';

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

const FROM_EMAIL = `"CareerDoctor" <${process.env.EMAIL_USER || 'noreply@careerdoctor.app'}>`;

export async function sendWelcomeEmail(email: string, name: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.warn('EMAIL_USER or EMAIL_APP_PASSWORD not set. Skipping welcome email to:', email);
        return { success: false, error: 'Email credentials missing' };
    }

    try {
        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to: email,
            subject: 'Welcome to CareerDoctor! 🩺',
            html: WelcomeEmailTemplate(name),
        });

        console.log('Welcome email sent:', info.messageId);
        return { success: true, data: info };
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        return { success: false, error };
    }
}

export async function sendDigestEmail(email: string, name: string, stats: any, tip: any) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.warn('EMAIL_USER or EMAIL_APP_PASSWORD not set. Skipping digest email to:', email);
        return { success: false, error: 'Email credentials missing' };
    }

    try {
        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to: email,
            subject: 'Your Weekly Career Digest & Pipeline Status 📊',
            html: DigestEmailTemplate(name, stats, tip),
        });

        console.log('Digest email sent:', info.messageId);
        return { success: true, data: info };
    } catch (error) {
        console.error('Failed to send digest email:', error);
        return { success: false, error };
    }
}

export async function sendAnalysisEmail(email: string, name: string, analysis: CareerAnalysis) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.warn('EMAIL_USER or EMAIL_APP_PASSWORD not set. Skipping analysis email to:', email);
        return { success: false, error: 'Email credentials missing' };
    }

    try {
        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to: email,
            subject: 'Your CareerDiagnosis Report 🎯',
            html: AnalysisEmailTemplate(name, analysis),
        });

        console.log('Analysis email sent:', info.messageId);
        return { success: true, data: info };
    } catch (error) {
        console.error('Failed to send analysis email:', error);
        return { success: false, error };
    }
}
