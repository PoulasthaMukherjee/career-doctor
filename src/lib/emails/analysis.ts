import { CareerAnalysis } from '../career-analysis';

export function AnalysisEmailTemplate(name: string, analysis: CareerAnalysis) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Your CareerDiagnosis Report</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; width: 100%; -webkit-text-size-adjust: 100%; }
            .container { background-color: #ffffff; width: 100%; max-width: 600px; margin: 20px auto; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-sizing: border-box; }
            .header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #0f172a 0%, #334155 100%); color: white; }
            .logo { font-size: 22px; font-weight: bold; color: #818cf8; margin-bottom: 8px; display: block; }
            .content { padding: 30px 20px; box-sizing: border-box; }
            .h2 { color: #0f172a; font-size: 18px; font-weight: 700; margin-bottom: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 25px; }
            
            .score-box { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 25px; box-sizing: border-box; }
            .score-num { font-size: 42px; font-weight: 800; color: #4338ca; line-height: 1; margin: 0; }
            .score-label { font-size: 15px; color: #4f46e5; font-weight: 600; margin: 8px 0 0 0; }
            
            .grid { margin-bottom: 20px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px; box-sizing: border-box; }
            .card-title { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 5px 0; }
            .card-value { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; word-break: break-word; }
            
            .role-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 15px; box-sizing: border-box; }
            .role-item { padding: 12px 0; border-bottom: 1px dashed #e2e8f0; }
            .role-item:last-child { border-bottom: none; }
            .role-title { font-weight: 600; color: #0f172a; font-size: 15px; margin: 0 0 5px 0; }
            .role-salary { color: #059669; font-weight: 600; display: block; font-size: 14px; margin-top: 2px; }
            .role-reason { font-size: 14px; color: #64748b; margin: 0; line-height: 1.4; word-break: break-word; }
            
            .gap-item { padding: 8px 0; font-size: 14px; word-break: break-word; line-height: 1.4; }
            .gap-skill { font-weight: 600; color: #b91c1c; }
            
            .query-pill { display: inline-block; background: #e2e8f0; color: #334155; padding: 6px 12px; border-radius: 16px; font-size: 13px; font-weight: 500; margin: 0 4px 8px 0; word-break: break-word; }
            
            .btn { display: block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 8px; font-weight: 600; margin: 25px 0 10px; text-align: center; box-sizing: border-box; }
            .footer { text-align: center; padding: 25px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; box-sizing: border-box; }
            
            @media only screen and (max-width: 600px) {
                .container { margin: 10px auto; border-radius: 0; border-left: none; border-right: none; }
                .content { padding: 20px 15px; }
                .score-num { font-size: 36px; }
                .h2 { font-size: 16px; }
                h1 { font-size: 22px !important; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="logo">🩺 CareerDoctor</span>
                <h1 style="margin: 0; font-size: 28px; letter-spacing: -0.5px;">Your Career Analysis is Ready</h1>
            </div>
            
            <div class="content">
                <p style="font-size: 16px; margin-top: 0;">Hi ${name.split(' ')[0] || 'there'},</p>
                <p>Our AI has finished analyzing your parsed profile. Here is your personalized Career Diagnosis based on today's market conditions.</p>
                
                <div class="score-box">
                    <p class="score-num">${analysis.profileStrength.score}/100</p>
                    <p class="score-label">Profile Strength: ${analysis.profileStrength.label}</p>
                </div>

                <div class="grid">
                    <div class="card">
                        <p class="card-title">Calculated Level</p>
                        <p class="card-value">${analysis.experienceBreakdown.level}</p>
                        <p style="font-size: 13px; color: #64748b; margin: 5px 0 0 0;">Based on ${analysis.experienceBreakdown.effectiveYOE} effective YOE</p>
                    </div>
                    <div class="card">
                        <p class="card-title">Career Headline</p>
                        <p class="card-value" style="font-size: 15px;">${analysis.headline}</p>
                    </div>
                </div>
                
                <h2 class="h2">🎯 Best Role Matches</h2>
                <div class="role-box">
                    ${analysis.roleMatches.filter(r => r.matchScore > 70).slice(0, 3).map(role => `
                        <div class="role-item">
                            <p class="role-title">
                                ${role.title}
                                <span class="role-salary">${role.salaryRange}</span>
                            </p>
                            <p class="role-reason">${role.reason}</p>
                        </div>
                    `).join('')}
                </div>

                ${analysis.gapAnalysis.length > 0 ? `
                    <h2 class="h2">⚡ Critical Skill Gaps</h2>
                    <ul style="padding-left: 20px; margin: 0;">
                        ${analysis.gapAnalysis.filter(g => g.importance === 'critical').map(gap => `
                            <li class="gap-item"><span class="gap-skill">${gap.skill}</span> <br/> <span style="color: #64748b; font-size: 12px;">Est. time: ${gap.learnTime}</span></li>
                        `).join('')}
                    </ul>
                ` : ''}

                <h2 class="h2">🔍 Suggested Search Queries</h2>
                <p style="font-size: 14px; color: #64748b; margin-bottom: 10px; margin-top: 0;">Try these on LinkedIn or Indeed:</p>
                <div>
                    ${analysis.searchQueries.slice(0, 6).map(query => `
                        <span class="query-pill">"${query}"</span>
                    `).join('')}
                </div>
                
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/profile" class="btn">View Full Interactive Report</a>
            </div>
            
            <div class="footer">
                <p>You received this email because you generated a new Career Analysis report.</p>
                <p>© ${new Date().getFullYear()} CareerDoctor</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
