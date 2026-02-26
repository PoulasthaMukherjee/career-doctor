export function DigestEmailTemplate(name: string, stats: any, tip: any) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Your Weekly Career Digest</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
            .container { background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
            .header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #4f46e5 0%, #a855f7 100%); color: white; }
            .logo { font-size: 24px; font-weight: bold; }
            .content { padding: 30px 20px; }
            .h2 { color: #0f172a; font-size: 20px; font-weight: 700; margin-bottom: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
            .stats-grid { display: flex; gap: 10px; margin-bottom: 25px; }
            .stat-box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
            .stat-num { font-size: 24px; font-weight: bold; color: #4f46e5; margin: 0; }
            .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 5px 0 0 0; }
            .tip-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
            .tip-title { color: #166534; font-weight: bold; margin-top: 0; }
            .tip-text { color: #15803d; margin-bottom: 0; }
            .btn { display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 10px 0; text-align: center; width: calc(100% - 48px); box-sizing: border-box; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 13px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🩺 CareerDoctor</div>
                <h1 style="margin: 15px 0 0 0; font-size: 24px;">Your Weekly Digest</h1>
            </div>
            
            <div class="content">
                <p>Hi ${name || 'there'},</p>
                <p>Here's a quick look at how your job search is progressing this week.</p>
                
                <h2 class="h2">Pipeline Overview</h2>
                <table width="100%" style="margin-bottom: 25px;">
                    <tr>
                        <td width="33%" style="padding: 5px;">
                            <div class="stat-box" style="border-top: 3px solid #cbd5e1;">
                                <p class="stat-num">${stats?.applied || 0}</p>
                                <p class="stat-label">Applied</p>
                            </div>
                        </td>
                        <td width="33%" style="padding: 5px;">
                            <div class="stat-box" style="border-top: 3px solid #818cf8;">
                                <p class="stat-num">${stats?.interviewing || 0}</p>
                                <p class="stat-label">Interview</p>
                            </div>
                        </td>
                        <td width="33%" style="padding: 5px;">
                            <div class="stat-box" style="border-top: 3px solid #34d399;">
                                <p class="stat-num">${stats?.offered || 0}</p>
                                <p class="stat-label">Offers</p>
                            </div>
                        </td>
                    </tr>
                </table>

                ${tip ? `
                <div class="tip-card">
                    <h3 class="tip-title">💡 ${tip.title || 'Pro Tip'}</h3>
                    <p class="tip-text">${tip.tip || tip.text}</p>
                </div>
                ` : ''}
                
                <center>
                    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/applications" class="btn">Update Applications</a>
                </center>
            </div>
        </div>
        <div class="footer">
            <p>You can manage your email preferences in your account settings.</p>
            <p>© ${new Date().getFullYear()} CareerDoctor</p>
        </div>
    </body>
    </html>
    `;
}
