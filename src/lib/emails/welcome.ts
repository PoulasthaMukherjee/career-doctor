export function WelcomeEmailTemplate(name: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to CareerDoctor</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 30px 0; border-bottom: 1px solid #e2e8f0; }
            .logo { font-size: 24px; font-weight: bold; color: #4f46e5; text-decoration: none; }
            .content { padding: 30px 0; }
            .h1 { color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 20px; }
            .btn { display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding: 30px 0; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 14px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <a href="https://careerdoctor.app" class="logo">🩺 CareerDoctor</a>
        </div>
        <div class="content">
            <h1 class="h1">Welcome aboard, ${name || 'friend'}!</h1>
            <p>Your CareerDoctor account is ready. We're excited to help you optimize your career path and land your dream role.</p>
            
            <div class="card">
                <h3 style="margin-top: 0; color: #0f172a;">Here's how to get started:</h3>
                <ol style="margin-bottom: 0;">
                    <li style="margin-bottom: 10px;"><strong>Upload your Resume:</strong> Let our AI parse your experience and build your professional profile instantly.</li>
                    <li style="margin-bottom: 10px;"><strong>Get your Career Diagnosis:</strong> Discover your true market value, best role matches, and skill gaps.</li>
                    <li><strong>Track Applications:</strong> Log your job hunting pipeline to get smart analytics and follow-up reminders.</li>
                </ol>
            </div>

            <center>
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" class="btn">Sign In to Dashboard</a>
            </center>
            
            <p>If you have any questions, just reply to this email. We're here to help.</p>
            <p>Best regards,<br>The CareerDoctor Team</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} CareerDoctor. All rights reserved.</p>
            <p>You received this email because you signed up for CareerDoctor.</p>
        </div>
    </body>
    </html>
    `;
}
