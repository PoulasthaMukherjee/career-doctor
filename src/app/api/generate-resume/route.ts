import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const profile = await request.json();
    const html = generateResumeHTML(profile);
    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}

function generateResumeHTML(p: any): string {
    const exp = p.experience || [];
    const edu = p.education || [];
    const links = p.links || [];
    const skills = p.skills || [];
    const projects = p.projects || [];
    const achievements = p.achievements || [];
    const certifications = p.certifications || [];

    const section = (title: string, content: string) => content ? `<h2>${title}</h2>${content}` : '';

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${p.fullName || 'Resume'} - CareerDoctor</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;color:#1e293b;max-width:800px;margin:0 auto;padding:48px 40px;line-height:1.6;font-size:13px}
h1{font-size:32px;font-weight:700;letter-spacing:-0.5px;color:#0f172a}
h2{font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;color:#6366f1;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin:24px 0 14px}
.subtitle{color:#475569;font-size:16px;font-weight:500;margin-top:2px}
.contact{color:#64748b;font-size:12px;margin-top:8px;display:flex;gap:16px;flex-wrap:wrap}
.contact span{display:inline-flex;align-items:center;gap:4px}
.summary{color:#334155;font-size:13px;line-height:1.7}
.skills-grid{display:flex;flex-wrap:wrap;gap:6px}
.skill{background:#eef2ff;color:#4338ca;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600}
.item{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #f1f5f9}
.item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.item-header{display:flex;justify-content:space-between;align-items:baseline}
.item-title{font-size:14px;font-weight:600;color:#0f172a}
.item-sub{font-size:13px;color:#6366f1;font-weight:500}
.item-meta{font-size:11px;color:#94a3b8;margin-top:2px}
.item-desc{font-size:13px;color:#475569;margin-top:6px;line-height:1.6}
.item-tech{font-size:11px;color:#6366f1;margin-top:4px;font-weight:500}
.link-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.link-type{font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#94a3b8;width:60px}
.link-url{color:#4338ca;text-decoration:none;font-size:13px}
.footer{margin-top:36px;text-align:center;color:#cbd5e1;font-size:10px}
@media print{body{padding:24px 20px;font-size:12px}h1{font-size:26px}.footer{display:none}}
</style></head><body>
<h1>${p.fullName || ''}</h1>
${p.title ? `<p class="subtitle">${p.title}</p>` : ''}
<div class="contact">
${p.email ? `<span>✉ ${p.email}</span>` : ''}
${p.phone ? `<span>☎ ${p.phone}</span>` : ''}
${p.location ? `<span>📍 ${p.location}</span>` : ''}
</div>

${section('Professional Summary', p.summary ? `<p class="summary">${p.summary}</p>` : '')}
${section('Skills', skills.length ? `<div class="skills-grid">${skills.map((s: string) => `<span class="skill">${s}</span>`).join('')}</div>` : '')}

${section('Experience', exp.length ? exp.map((e: any) => `
<div class="item"><div class="item-header"><div><div class="item-title">${e.title || ''}</div><div class="item-sub">${e.company || ''}</div></div><div class="item-meta">${[e.location, [e.startDate, e.endDate].filter(Boolean).join(' - ')].filter(Boolean).join(' • ')}</div></div>${e.description ? `<div class="item-desc">${e.description}</div>` : ''}</div>`).join('') : '')}

${section('Projects', projects.length ? projects.map((p: any) => `
<div class="item"><div class="item-header"><div><div class="item-title">${p.name || ''}</div></div><div class="item-meta">${[p.startDate, p.endDate].filter(Boolean).join(' - ')}</div></div>${p.techStack ? `<div class="item-tech">${p.techStack}</div>` : ''}${p.description ? `<div class="item-desc">${p.description}</div>` : ''}${p.url ? `<div class="item-meta" style="margin-top:4px">🔗 ${p.url}</div>` : ''}</div>`).join('') : '')}

${section('Education', edu.length ? edu.map((e: any) => `
<div class="item"><div class="item-title">${e.degree || ''}${e.specialization ? ` in ${e.specialization}` : ''}</div><div class="item-sub">${e.institution || ''}</div><div class="item-meta">${[[e.startYear, e.endYear].filter(Boolean).join(' - '), e.grade ? `GPA: ${e.grade}` : ''].filter(Boolean).join(' • ')}</div></div>`).join('') : '')}

${section('Certifications', certifications.length ? certifications.map((c: any) => `
<div class="item"><div class="item-title">${c.name || ''}</div>${c.issuer ? `<div class="item-sub">${c.issuer}</div>` : ''}<div class="item-meta">${[c.date, c.url ? `🔗 ${c.url}` : ''].filter(Boolean).join(' • ')}</div></div>`).join('') : '')}

${section('Achievements', achievements.length ? achievements.map((a: any) => `
<div class="item"><div class="item-title">${a.title || ''}</div>${a.date ? `<div class="item-meta">${a.date}</div>` : ''}${a.description ? `<div class="item-desc">${a.description}</div>` : ''}</div>`).join('') : '')}

${section('Links', links.length ? links.map((l: any) => `
<div class="link-row"><span class="link-type">${l.type || 'other'}</span><a href="${l.url}" class="link-url">${l.url}</a></div>`).join('') : '')}

<p class="footer">Generated by CareerDoctor</p>
</body></html>`;
}
