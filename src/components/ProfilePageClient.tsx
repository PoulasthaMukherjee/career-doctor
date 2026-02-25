'use client';

import { useState } from 'react';
import { saveProfile, parseAndFillFromResume, autofillProfileFromResume, generateAISummary } from '@/lib/profile-actions';
import { User, Briefcase, Mail, Phone, MapPin, FileText, GraduationCap, Link2, Sparkles, Save, Download, Plus, X, FolderOpen, Award, BadgeCheck, Wand2, Pencil, Check } from 'lucide-react';

// ─── Types ───
type ExperienceItem = { company: string; title: string; location: string; startDate: string; endDate: string; description: string };
type EducationItem = { institution: string; degree: string; specialization: string; startYear: string; endYear: string; grade: string };
type LinkItem = { type: 'linkedin' | 'github' | 'medium' | 'portfolio' | 'other'; url: string };
type ProjectItem = { name: string; description: string; techStack: string; url: string; startDate: string; endDate: string };
type AchievementItem = { title: string; description: string; date: string };
type CertificationItem = { name: string; issuer: string; date: string; url: string };

type ProfileData = {
    fullName: string | null; title: string | null; email: string | null; phone: string | null;
    location: string | null; summary: string | null; skills: string[]; experience: ExperienceItem[];
    education: EducationItem[]; links: LinkItem[]; projects: ProjectItem[];
    achievements: AchievementItem[]; certifications: CertificationItem[];
} | null;

type Resume = { id: string; version: string; parsedContent: string | null; fileName: string | null };

const LINK_TYPES = [
    { value: 'linkedin', label: 'LinkedIn', icon: '🔗' },
    { value: 'github', label: 'GitHub', icon: '🐙' },
    { value: 'medium', label: 'Medium', icon: '📝' },
    { value: 'portfolio', label: 'Portfolio', icon: '🌐' },
    { value: 'other', label: 'Other', icon: '🔗' },
] as const;

const SKILL_SUGGESTIONS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'React', 'Next.js', 'Vue.js',
    'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'AWS', 'GCP', 'Azure',
    'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API', 'Git',
    'CI/CD', 'Agile', 'Scrum', 'Machine Learning', 'Deep Learning', 'Data Science',
    'HTML', 'CSS', 'Tailwind CSS', 'Figma', 'System Design', 'Microservices',
];

// ─── Reusable edit/display helpers ───
function EditableField({ value, onChange, placeholder, className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
    return <input className={`w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm ${className}`} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}

function EditableTextarea({ value, onChange, placeholder, rows = 2 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
    return <textarea className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm resize-y" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} />;
}

// ─── Main Component ───
export default function ProfilePageClient({ initialProfile, resumes }: { initialProfile: ProfileData; resumes: Resume[] }) {
    const [profile, setProfile] = useState({
        fullName: initialProfile?.fullName || '',
        title: initialProfile?.title || '',
        email: initialProfile?.email || '',
        phone: initialProfile?.phone || '',
        location: initialProfile?.location || '',
        summary: initialProfile?.summary || '',
        skills: initialProfile?.skills || [] as string[],
        experience: (initialProfile?.experience || []) as ExperienceItem[],
        education: (initialProfile?.education || []) as EducationItem[],
        links: (initialProfile?.links || []) as LinkItem[],
        projects: (initialProfile?.projects || []) as ProjectItem[],
        achievements: (initialProfile?.achievements || []) as AchievementItem[],
        certifications: (initialProfile?.certifications || []) as CertificationItem[],
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [selectedResume, setSelectedResume] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [generatingSummary, setGeneratingSummary] = useState(false);

    // Edit indices — which item is being edited inline
    const [editExp, setEditExp] = useState<number | null>(null);
    const [editEdu, setEditEdu] = useState<number | null>(null);
    const [editProj, setEditProj] = useState<number | null>(null);
    const [editAch, setEditAch] = useState<number | null>(null);
    const [editCert, setEditCert] = useState<number | null>(null);
    const [editLink, setEditLink] = useState<number | null>(null);

    // Show add forms (at top of section)
    const [showExpForm, setShowExpForm] = useState(false);
    const [showEduForm, setShowEduForm] = useState(false);
    const [showLinkForm, setShowLinkForm] = useState(false);
    const [showProjForm, setShowProjForm] = useState(false);
    const [showAchForm, setShowAchForm] = useState(false);
    const [showCertForm, setShowCertForm] = useState(false);

    // Add form defaults
    const emptyExp: ExperienceItem = { company: '', title: '', location: '', startDate: '', endDate: '', description: '' };
    const emptyEdu: EducationItem = { institution: '', degree: '', specialization: '', startYear: '', endYear: '', grade: '' };
    const emptyLink: LinkItem = { type: 'linkedin', url: '' };
    const emptyProj: ProjectItem = { name: '', description: '', techStack: '', url: '', startDate: '', endDate: '' };
    const emptyAch: AchievementItem = { title: '', description: '', date: '' };
    const emptyCert: CertificationItem = { name: '', issuer: '', date: '', url: '' };

    const [expForm, setExpForm] = useState<ExperienceItem>({ ...emptyExp });
    const [eduForm, setEduForm] = useState<EducationItem>({ ...emptyEdu });
    const [linkForm, setLinkForm] = useState<LinkItem>({ ...emptyLink });
    const [projForm, setProjForm] = useState<ProjectItem>({ ...emptyProj });
    const [achForm, setAchForm] = useState<AchievementItem>({ ...emptyAch });
    const [certForm, setCertForm] = useState<CertificationItem>({ ...emptyCert });

    // ─── Handlers ───
    async function handleSave() {
        setSaving(true);
        const fd = new FormData();
        fd.set('fullName', profile.fullName);
        fd.set('title', profile.title);
        fd.set('email', profile.email);
        fd.set('phone', profile.phone);
        fd.set('location', profile.location);
        fd.set('summary', profile.summary);
        fd.set('skills', JSON.stringify(profile.skills));
        fd.set('experience', JSON.stringify(profile.experience));
        fd.set('education', JSON.stringify(profile.education));
        fd.set('links', JSON.stringify(profile.links));
        fd.set('projects', JSON.stringify(profile.projects));
        fd.set('achievements', JSON.stringify(profile.achievements));
        fd.set('certifications', JSON.stringify(profile.certifications));
        await saveProfile(fd);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    async function handleParseResume() {
        if (!selectedResume) return;
        setParsing(true);
        const result = await parseAndFillFromResume(selectedResume);
        if ('success' in result && result.success) window.location.reload();
        else alert('error' in result ? result.error : 'Failed to parse resume');
        setParsing(false);
    }

    async function downloadResumePDF() {
        setDownloading(true);
        try {
            const res = await fetch('/api/generate-resume', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
            if (!res.ok) throw new Error('Failed');
            const html = await res.text();
            const win = window.open('', '_blank');
            if (win) { win.document.write(html); win.document.close(); win.onload = () => win.print(); }
        } catch { alert('Failed to generate resume.'); }
        setDownloading(false);
    }

    async function handleGenerateSummary() {
        setGeneratingSummary(true);
        const result = await generateAISummary(JSON.stringify({
            title: profile.title, skills: profile.skills,
            experience: profile.experience.map(e => `${e.title} at ${e.company}`),
            education: profile.education.map(e => `${e.degree} in ${e.specialization} from ${e.institution}`),
            projects: profile.projects.map(p => p.name),
        }));
        if (result.summary) setProfile(p => ({ ...p, summary: result.summary! }));
        else alert(result.error || 'Failed to generate summary');
        setGeneratingSummary(false);
    }

    // Skills
    const filteredSuggestions = SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(newSkill.toLowerCase()) && !profile.skills.includes(s)).slice(0, 8);
    const addSkill = (skill: string) => { if (!skill.trim() || profile.skills.includes(skill.trim())) return; setProfile(p => ({ ...p, skills: [...p.skills, skill.trim()] })); setNewSkill(''); setShowSkillSuggestions(false); };
    const removeSkill = (i: number) => setProfile(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }));

    // Generic add/remove/update
    const addItem = <T,>(key: keyof typeof profile, item: T, setShow: (v: boolean) => void, setForm: (v: T) => void, empty: T) => {
        setProfile(p => ({ ...p, [key]: [item, ...(p[key] as T[])] }));
        setShow(false);
        setForm({ ...empty });
    };
    const removeItem = (key: keyof typeof profile, i: number) => setProfile(p => ({ ...p, [key]: (p[key] as any[]).filter((_: any, idx: number) => idx !== i) }));
    const updateItem = <T,>(key: keyof typeof profile, i: number, item: T) => setProfile(p => ({ ...p, [key]: (p[key] as T[]).map((x, idx) => idx === i ? item : x) }));

    const inputClass = "w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm";
    const labelClass = "block text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5";
    const sectionClass = "bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6";
    const addFormClass = "p-4 rounded-lg border-2 border-dashed border-[var(--accent)]/30 bg-[var(--accent-light)]/30 space-y-3 mb-4";
    const cardClass = "p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] relative group";
    const editBtnClass = "absolute top-3 right-10 text-[var(--text-tertiary)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity";
    const removeBtnClass = "absolute top-3 right-3 text-[var(--text-tertiary)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity";
    const sectionHeaderClass = "flex items-center justify-between mb-4";
    const addBtnClass = "px-3 py-1.5 text-xs font-semibold bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)]";
    const formActionClass = "flex gap-2 justify-end";

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">My Profile</h1>
                        <p className="text-[var(--text-secondary)] mt-1">Build your career profile. Import from resume or fill manually.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={downloadResumePDF} disabled={downloading} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50">
                            <Download className="h-4 w-4" /> {downloading ? 'Generating...' : 'Download PDF'}
                        </button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg transition-colors disabled:opacity-50">
                            <Save className="h-4 w-4" /> {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Profile'}
                        </button>
                    </div>
                </div>

                {/* Resume Import */}
                {resumes.length > 0 && (
                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-[var(--border)] rounded-xl p-5 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                            <span className="text-sm font-semibold text-[var(--text-primary)]">Import from Resume</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mb-3">Select a resume to parse with AI and auto-fill your profile fields.</p>
                        <div className="flex gap-3 items-end flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <select value={selectedResume} onChange={e => setSelectedResume(e.target.value)} className={inputClass + " cursor-pointer"}>
                                    <option value="">Choose a resume...</option>
                                    {resumes.map(r => (<option key={r.id} value={r.id}>{r.version} {r.parsedContent ? '✓ (parsed)' : ''}</option>))}
                                </select>
                            </div>
                            <button onClick={handleParseResume} disabled={!selectedResume || parsing} className="px-4 py-2.5 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 whitespace-nowrap">
                                {parsing ? 'Parsing with AI...' : 'Parse & Fill Profile'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* ─── Personal Info ─── */}
                    <section className={sectionClass}>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2"><User className="h-5 w-5 text-[var(--accent)]" /> Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelClass}>Full Name</label><input className={inputClass} value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} placeholder="John Doe" /></div>
                            <div><label className={labelClass}>Professional Title</label><input className={inputClass} value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))} placeholder="Senior Software Engineer" list="title-suggestions" />
                                <datalist id="title-suggestions">{['Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'UI/UX Designer', 'ML Engineer'].map(t => <option key={t} value={t} />)}</datalist></div>
                            <div><label className={labelClass}><Mail className="h-3 w-3 inline mr-1" />Email</label><input className={inputClass} type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" /></div>
                            <div><label className={labelClass}><Phone className="h-3 w-3 inline mr-1" />Phone</label><input className={inputClass} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 123-4567" /></div>
                            <div className="md:col-span-2"><label className={labelClass}><MapPin className="h-3 w-3 inline mr-1" />Location</label><input className={inputClass} value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} placeholder="San Francisco, CA" list="loc-suggestions" />
                                <datalist id="loc-suggestions">{['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote', 'London, UK', 'Bangalore, India', 'Toronto, Canada'].map(l => <option key={l} value={l} />)}</datalist></div>
                        </div>
                    </section>

                    {/* ─── Summary with AI Generate ─── */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2"><FileText className="h-5 w-5 text-[var(--accent)]" /> Professional Summary</h2>
                            <button onClick={handleGenerateSummary} disabled={generatingSummary} className={addBtnClass + " flex items-center gap-1"}>
                                <Wand2 className="h-3.5 w-3.5" /> {generatingSummary ? 'Generating...' : 'AI Generate'}
                            </button>
                        </div>
                        <textarea className={inputClass + " min-h-[120px] resize-y"} value={profile.summary} onChange={e => setProfile(p => ({ ...p, summary: e.target.value }))} placeholder="Experienced software engineer with 5+ years building scalable web applications..." />
                        <p className="text-xs text-[var(--text-tertiary)] mt-2">{profile.summary.length}/500 characters</p>
                    </section>

                    {/* ─── Skills ─── */}
                    <section className={sectionClass}>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-[var(--accent)]" /> Skills</h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {profile.skills.length === 0 && <p className="text-sm text-[var(--text-tertiary)]">No skills added yet.</p>}
                            {profile.skills.map((skill, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-[var(--accent-light)] text-[var(--accent-text)] rounded-full border border-[var(--accent)]/20">
                                    {skill}<button onClick={() => removeSkill(i)} className="hover:text-[var(--danger)]"><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                        </div>
                        <div className="relative">
                            <div className="flex gap-2">
                                <input className={inputClass} value={newSkill} onChange={e => { setNewSkill(e.target.value); setShowSkillSuggestions(true); }} onFocus={() => setShowSkillSuggestions(true)} onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)} placeholder="Type a skill..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(newSkill); } }} />
                                <button onClick={() => addSkill(newSkill)} className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)]"><Plus className="h-4 w-4" /></button>
                            </div>
                            {showSkillSuggestions && newSkill && filteredSuggestions.length > 0 && (
                                <div className="absolute z-20 top-full left-0 right-12 mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredSuggestions.map(s => (<button key={s} onMouseDown={() => addSkill(s)} className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]">{s}</button>))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ─── Experience ─── */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2"><Briefcase className="h-5 w-5 text-[var(--accent)]" /> Experience</h2>
                            <button onClick={() => { setShowExpForm(!showExpForm); setExpForm({ ...emptyExp }); }} className={addBtnClass}><Plus className="h-3.5 w-3.5 inline mr-1" /> Add</button>
                        </div>
                        {/* Add form at TOP */}
                        {showExpForm && (
                            <div className={addFormClass}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><label className={labelClass}>Company *</label><EditableField value={expForm.company} onChange={v => setExpForm(f => ({ ...f, company: v }))} placeholder="Google" /></div>
                                    <div><label className={labelClass}>Title *</label><EditableField value={expForm.title} onChange={v => setExpForm(f => ({ ...f, title: v }))} placeholder="Senior Software Engineer" /></div>
                                    <div><label className={labelClass}>Location</label><EditableField value={expForm.location} onChange={v => setExpForm(f => ({ ...f, location: v }))} placeholder="Mountain View, CA" /></div>
                                    <div className="grid grid-cols-2 gap-2"><div><label className={labelClass}>Start</label><EditableField value={expForm.startDate} onChange={v => setExpForm(f => ({ ...f, startDate: v }))} placeholder="Jan 2022" /></div><div><label className={labelClass}>End</label><EditableField value={expForm.endDate} onChange={v => setExpForm(f => ({ ...f, endDate: v }))} placeholder="Present" /></div></div>
                                </div>
                                <div><label className={labelClass}>Description</label><EditableTextarea value={expForm.description} onChange={v => setExpForm(f => ({ ...f, description: v }))} placeholder="Key responsibilities..." /></div>
                                <div className={formActionClass}><button onClick={() => setShowExpForm(false)} className="px-3 py-1.5 text-sm text-[var(--text-secondary)]">Cancel</button><button onClick={() => { if (expForm.company && expForm.title) addItem('experience', expForm, setShowExpForm, setExpForm, emptyExp); }} className="px-4 py-1.5 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)]">Add</button></div>
                            </div>
                        )}
                        <div className="space-y-3">
                            {profile.experience.map((exp, i) => (
                                <div key={i} className={cardClass}>
                                    <button onClick={() => setEditExp(editExp === i ? null : i)} className={editBtnClass}><Pencil className="h-4 w-4" /></button>
                                    <button onClick={() => removeItem('experience', i)} className={removeBtnClass}><X className="h-4 w-4" /></button>
                                    {editExp === i ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3"><EditableField value={exp.title} onChange={v => updateItem('experience', i, { ...exp, title: v })} placeholder="Title" /><EditableField value={exp.company} onChange={v => updateItem('experience', i, { ...exp, company: v })} placeholder="Company" /></div>
                                            <div className="grid grid-cols-3 gap-3"><EditableField value={exp.location} onChange={v => updateItem('experience', i, { ...exp, location: v })} placeholder="Location" /><EditableField value={exp.startDate} onChange={v => updateItem('experience', i, { ...exp, startDate: v })} placeholder="Start" /><EditableField value={exp.endDate} onChange={v => updateItem('experience', i, { ...exp, endDate: v })} placeholder="End" /></div>
                                            <EditableTextarea value={exp.description} onChange={v => updateItem('experience', i, { ...exp, description: v })} placeholder="Description" />
                                            <button onClick={() => setEditExp(null)} className="px-3 py-1 text-xs font-medium bg-[var(--accent)] text-white rounded-lg"><Check className="h-3 w-3 inline mr-1" />Done</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-[var(--accent-light)] rounded-lg mt-0.5"><Briefcase className="h-4 w-4 text-[var(--accent)]" /></div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-[var(--text-primary)] text-sm">{exp.title}</p>
                                                <p className="text-sm text-[var(--accent-text)]">{exp.company}</p>
                                                <div className="flex gap-3 mt-1 text-xs text-[var(--text-tertiary)]">
                                                    {exp.location && <span>📍 {exp.location}</span>}
                                                    {(exp.startDate || exp.endDate) && <span>📅 {exp.startDate} — {exp.endDate || 'Present'}</span>}
                                                </div>
                                                {exp.description && <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{exp.description}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ─── Education ─── */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2"><GraduationCap className="h-5 w-5 text-[var(--accent)]" /> Education</h2>
                            <button onClick={() => { setShowEduForm(!showEduForm); setEduForm({ ...emptyEdu }); }} className={addBtnClass}><Plus className="h-3.5 w-3.5 inline mr-1" /> Add</button>
                        </div>
                        {showEduForm && (
                            <div className={addFormClass}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><label className={labelClass}>Institution *</label><EditableField value={eduForm.institution} onChange={v => setEduForm(f => ({ ...f, institution: v }))} placeholder="MIT" /></div>
                                    <div><label className={labelClass}>Degree *</label><EditableField value={eduForm.degree} onChange={v => setEduForm(f => ({ ...f, degree: v }))} placeholder="B.Tech" /></div>
                                    <div><label className={labelClass}>Specialization</label><EditableField value={eduForm.specialization} onChange={v => setEduForm(f => ({ ...f, specialization: v }))} placeholder="Computer Science" /></div>
                                    <div className="grid grid-cols-2 gap-2"><div><label className={labelClass}>Start Year</label><EditableField value={eduForm.startYear} onChange={v => setEduForm(f => ({ ...f, startYear: v }))} placeholder="2018" /></div><div><label className={labelClass}>End Year</label><EditableField value={eduForm.endYear} onChange={v => setEduForm(f => ({ ...f, endYear: v }))} placeholder="2022" /></div></div>
                                    <div className="md:col-span-2"><label className={labelClass}>Grade/GPA</label><EditableField value={eduForm.grade} onChange={v => setEduForm(f => ({ ...f, grade: v }))} placeholder="3.8/4.0" /></div>
                                </div>
                                <div className={formActionClass}><button onClick={() => setShowEduForm(false)} className="px-3 py-1.5 text-sm text-[var(--text-secondary)]">Cancel</button><button onClick={() => { if (eduForm.institution && eduForm.degree) addItem('education', eduForm, setShowEduForm, setEduForm, emptyEdu); }} className="px-4 py-1.5 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)]">Add</button></div>
                            </div>
                        )}
                        <div className="space-y-3">
                            {profile.education.map((edu, i) => (
                                <div key={i} className={cardClass}>
                                    <button onClick={() => setEditEdu(editEdu === i ? null : i)} className={editBtnClass}><Pencil className="h-4 w-4" /></button>
                                    <button onClick={() => removeItem('education', i)} className={removeBtnClass}><X className="h-4 w-4" /></button>
                                    {editEdu === i ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3"><EditableField value={edu.institution} onChange={v => updateItem('education', i, { ...edu, institution: v })} placeholder="Institution" /><EditableField value={edu.degree} onChange={v => updateItem('education', i, { ...edu, degree: v })} placeholder="Degree" /></div>
                                            <div className="grid grid-cols-3 gap-3"><EditableField value={edu.specialization} onChange={v => updateItem('education', i, { ...edu, specialization: v })} placeholder="Specialization" /><EditableField value={edu.startYear} onChange={v => updateItem('education', i, { ...edu, startYear: v })} placeholder="Start" /><EditableField value={edu.endYear} onChange={v => updateItem('education', i, { ...edu, endYear: v })} placeholder="End" /></div>
                                            <EditableField value={edu.grade} onChange={v => updateItem('education', i, { ...edu, grade: v })} placeholder="Grade" />
                                            <button onClick={() => setEditEdu(null)} className="px-3 py-1 text-xs font-medium bg-[var(--accent)] text-white rounded-lg"><Check className="h-3 w-3 inline mr-1" />Done</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-[var(--accent-light)] rounded-lg mt-0.5"><GraduationCap className="h-4 w-4 text-[var(--accent)]" /></div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-[var(--text-primary)] text-sm">{edu.degree}{edu.specialization ? ` in ${edu.specialization}` : ''}</p>
                                                <p className="text-sm text-[var(--accent-text)]">{edu.institution}</p>
                                                <div className="flex gap-3 mt-1 text-xs text-[var(--text-tertiary)]">
                                                    {(edu.startYear || edu.endYear) && <span>📅 {edu.startYear} — {edu.endYear || 'Present'}</span>}
                                                    {edu.grade && <span>📊 {edu.grade}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ─── Projects ─── */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2"><FolderOpen className="h-5 w-5 text-[var(--accent)]" /> Projects</h2>
                            <button onClick={() => { setShowProjForm(!showProjForm); setProjForm({ ...emptyProj }); }} className={addBtnClass}><Plus className="h-3.5 w-3.5 inline mr-1" /> Add</button>
                        </div>
                        {showProjForm && (
                            <div className={addFormClass}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><label className={labelClass}>Name *</label><EditableField value={projForm.name} onChange={v => setProjForm(f => ({ ...f, name: v }))} placeholder="CareerDoctor" /></div>
                                    <div><label className={labelClass}>URL</label><EditableField value={projForm.url} onChange={v => setProjForm(f => ({ ...f, url: v }))} placeholder="https://github.com/..." /></div>
                                    <div className="md:col-span-2"><label className={labelClass}>Tech Stack</label><EditableField value={projForm.techStack} onChange={v => setProjForm(f => ({ ...f, techStack: v }))} placeholder="React, Next.js, TypeScript, Prisma" /></div>
                                    <div className="grid grid-cols-2 gap-2"><div><label className={labelClass}>Start</label><EditableField value={projForm.startDate} onChange={v => setProjForm(f => ({ ...f, startDate: v }))} placeholder="Jan 2024" /></div><div><label className={labelClass}>End</label><EditableField value={projForm.endDate} onChange={v => setProjForm(f => ({ ...f, endDate: v }))} placeholder="Present" /></div></div>
                                </div>
                                <div><label className={labelClass}>Description</label><EditableTextarea value={projForm.description} onChange={v => setProjForm(f => ({ ...f, description: v }))} placeholder="What the project does..." /></div>
                                <div className={formActionClass}><button onClick={() => setShowProjForm(false)} className="px-3 py-1.5 text-sm text-[var(--text-secondary)]">Cancel</button><button onClick={() => { if (projForm.name) addItem('projects', projForm, setShowProjForm, setProjForm, emptyProj); }} className="px-4 py-1.5 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)]">Add</button></div>
                            </div>
                        )}
                        <div className="space-y-3">
                            {profile.projects.map((proj, i) => (
                                <div key={i} className={cardClass}>
                                    <button onClick={() => setEditProj(editProj === i ? null : i)} className={editBtnClass}><Pencil className="h-4 w-4" /></button>
                                    <button onClick={() => removeItem('projects', i)} className={removeBtnClass}><X className="h-4 w-4" /></button>
                                    {editProj === i ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3"><EditableField value={proj.name} onChange={v => updateItem('projects', i, { ...proj, name: v })} placeholder="Name" /><EditableField value={proj.url} onChange={v => updateItem('projects', i, { ...proj, url: v })} placeholder="URL" /></div>
                                            <EditableField value={proj.techStack} onChange={v => updateItem('projects', i, { ...proj, techStack: v })} placeholder="Tech Stack" />
                                            <div className="grid grid-cols-2 gap-3"><EditableField value={proj.startDate} onChange={v => updateItem('projects', i, { ...proj, startDate: v })} placeholder="Start" /><EditableField value={proj.endDate} onChange={v => updateItem('projects', i, { ...proj, endDate: v })} placeholder="End" /></div>
                                            <EditableTextarea value={proj.description} onChange={v => updateItem('projects', i, { ...proj, description: v })} placeholder="Description" />
                                            <button onClick={() => setEditProj(null)} className="px-3 py-1 text-xs font-medium bg-[var(--accent)] text-white rounded-lg"><Check className="h-3 w-3 inline mr-1" />Done</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-[var(--accent-light)] rounded-lg mt-0.5"><FolderOpen className="h-4 w-4 text-[var(--accent)]" /></div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-[var(--text-primary)] text-sm">{proj.name}</p>
                                                {proj.techStack && <p className="text-xs text-[var(--accent-text)] mt-0.5">{proj.techStack}</p>}
                                                <div className="flex gap-3 mt-1 text-xs text-[var(--text-tertiary)]">
                                                    {proj.url && <a href={proj.url} target="_blank" className="hover:underline">🔗 {proj.url}</a>}
                                                    {(proj.startDate || proj.endDate) && <span>📅 {proj.startDate} — {proj.endDate || 'Present'}</span>}
                                                </div>
                                                {proj.description && <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{proj.description}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ─── Achievements ─── */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2"><Award className="h-5 w-5 text-[var(--accent)]" /> Achievements</h2>
                            <button onClick={() => { setShowAchForm(!showAchForm); setAchForm({ ...emptyAch }); }} className={addBtnClass}><Plus className="h-3.5 w-3.5 inline mr-1" /> Add</button>
                        </div>
                        {showAchForm && (
                            <div className={addFormClass}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><label className={labelClass}>Title *</label><EditableField value={achForm.title} onChange={v => setAchForm(f => ({ ...f, title: v }))} placeholder="Best Paper Award" /></div>
                                    <div><label className={labelClass}>Date</label><EditableField value={achForm.date} onChange={v => setAchForm(f => ({ ...f, date: v }))} placeholder="2023" /></div>
                                </div>
                                <div><label className={labelClass}>Description</label><EditableTextarea value={achForm.description} onChange={v => setAchForm(f => ({ ...f, description: v }))} placeholder="Details..." rows={2} /></div>
                                <div className={formActionClass}><button onClick={() => setShowAchForm(false)} className="px-3 py-1.5 text-sm text-[var(--text-secondary)]">Cancel</button><button onClick={() => { if (achForm.title) addItem('achievements', achForm, setShowAchForm, setAchForm, emptyAch); }} className="px-4 py-1.5 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)]">Add</button></div>
                            </div>
                        )}
                        <div className="space-y-3">
                            {profile.achievements.map((ach, i) => (
                                <div key={i} className={cardClass}>
                                    <button onClick={() => setEditAch(editAch === i ? null : i)} className={editBtnClass}><Pencil className="h-4 w-4" /></button>
                                    <button onClick={() => removeItem('achievements', i)} className={removeBtnClass}><X className="h-4 w-4" /></button>
                                    {editAch === i ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3"><EditableField value={ach.title} onChange={v => updateItem('achievements', i, { ...ach, title: v })} placeholder="Title" /><EditableField value={ach.date} onChange={v => updateItem('achievements', i, { ...ach, date: v })} placeholder="Date" /></div>
                                            <EditableTextarea value={ach.description} onChange={v => updateItem('achievements', i, { ...ach, description: v })} placeholder="Description" rows={2} />
                                            <button onClick={() => setEditAch(null)} className="px-3 py-1 text-xs font-medium bg-[var(--accent)] text-white rounded-lg"><Check className="h-3 w-3 inline mr-1" />Done</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-[var(--accent-light)] rounded-lg mt-0.5"><Award className="h-4 w-4 text-[var(--accent)]" /></div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-[var(--text-primary)] text-sm">{ach.title}</p>
                                                {ach.date && <span className="text-xs text-[var(--text-tertiary)]">📅 {ach.date}</span>}
                                                {ach.description && <p className="text-xs text-[var(--text-secondary)] mt-1">{ach.description}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ─── Certifications ─── */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-[var(--accent)]" /> Certifications</h2>
                            <button onClick={() => { setShowCertForm(!showCertForm); setCertForm({ ...emptyCert }); }} className={addBtnClass}><Plus className="h-3.5 w-3.5 inline mr-1" /> Add</button>
                        </div>
                        {showCertForm && (
                            <div className={addFormClass}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div><label className={labelClass}>Name *</label><EditableField value={certForm.name} onChange={v => setCertForm(f => ({ ...f, name: v }))} placeholder="AWS Solutions Architect" /></div>
                                    <div><label className={labelClass}>Issuer</label><EditableField value={certForm.issuer} onChange={v => setCertForm(f => ({ ...f, issuer: v }))} placeholder="Amazon Web Services" /></div>
                                    <div><label className={labelClass}>Date</label><EditableField value={certForm.date} onChange={v => setCertForm(f => ({ ...f, date: v }))} placeholder="2023" /></div>
                                    <div><label className={labelClass}>URL</label><EditableField value={certForm.url} onChange={v => setCertForm(f => ({ ...f, url: v }))} placeholder="https://..." /></div>
                                </div>
                                <div className={formActionClass}><button onClick={() => setShowCertForm(false)} className="px-3 py-1.5 text-sm text-[var(--text-secondary)]">Cancel</button><button onClick={() => { if (certForm.name) addItem('certifications', certForm, setShowCertForm, setCertForm, emptyCert); }} className="px-4 py-1.5 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)]">Add</button></div>
                            </div>
                        )}
                        <div className="space-y-3">
                            {profile.certifications.map((cert, i) => (
                                <div key={i} className={cardClass}>
                                    <button onClick={() => setEditCert(editCert === i ? null : i)} className={editBtnClass}><Pencil className="h-4 w-4" /></button>
                                    <button onClick={() => removeItem('certifications', i)} className={removeBtnClass}><X className="h-4 w-4" /></button>
                                    {editCert === i ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3"><EditableField value={cert.name} onChange={v => updateItem('certifications', i, { ...cert, name: v })} placeholder="Name" /><EditableField value={cert.issuer} onChange={v => updateItem('certifications', i, { ...cert, issuer: v })} placeholder="Issuer" /></div>
                                            <div className="grid grid-cols-2 gap-3"><EditableField value={cert.date} onChange={v => updateItem('certifications', i, { ...cert, date: v })} placeholder="Date" /><EditableField value={cert.url} onChange={v => updateItem('certifications', i, { ...cert, url: v })} placeholder="URL" /></div>
                                            <button onClick={() => setEditCert(null)} className="px-3 py-1 text-xs font-medium bg-[var(--accent)] text-white rounded-lg"><Check className="h-3 w-3 inline mr-1" />Done</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-[var(--accent-light)] rounded-lg mt-0.5"><BadgeCheck className="h-4 w-4 text-[var(--accent)]" /></div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-[var(--text-primary)] text-sm">{cert.name}</p>
                                                {cert.issuer && <p className="text-sm text-[var(--accent-text)]">{cert.issuer}</p>}
                                                <div className="flex gap-3 mt-1 text-xs text-[var(--text-tertiary)]">
                                                    {cert.date && <span>📅 {cert.date}</span>}
                                                    {cert.url && <a href={cert.url} target="_blank" className="hover:underline">🔗 View</a>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ─── Links ─── */}
                    <section className={sectionClass}>
                        <div className={sectionHeaderClass}>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2"><Link2 className="h-5 w-5 text-[var(--accent)]" /> Links</h2>
                            <button onClick={() => { setShowLinkForm(!showLinkForm); setLinkForm({ ...emptyLink }); }} className={addBtnClass}><Plus className="h-3.5 w-3.5 inline mr-1" /> Add</button>
                        </div>
                        {showLinkForm && (
                            <div className={addFormClass}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div><label className={labelClass}>Type</label><select className={inputClass + " cursor-pointer"} value={linkForm.type} onChange={e => setLinkForm(f => ({ ...f, type: e.target.value as LinkItem['type'] }))}>{LINK_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}</select></div>
                                    <div className="md:col-span-2"><label className={labelClass}>URL</label><EditableField value={linkForm.url} onChange={v => setLinkForm(f => ({ ...f, url: v }))} placeholder="https://..." /></div>
                                </div>
                                <div className={formActionClass}><button onClick={() => setShowLinkForm(false)} className="px-3 py-1.5 text-sm text-[var(--text-secondary)]">Cancel</button><button onClick={() => { if (linkForm.url) addItem('links', linkForm, setShowLinkForm, setLinkForm, emptyLink); }} className="px-4 py-1.5 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)]">Add</button></div>
                            </div>
                        )}
                        <div className="space-y-2">
                            {profile.links.map((link, i) => {
                                const linkType = LINK_TYPES.find(t => t.value === link.type) || LINK_TYPES[4];
                                return (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] group relative">
                                        <button onClick={() => setEditLink(editLink === i ? null : i)} className={editBtnClass}><Pencil className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => removeItem('links', i)} className={removeBtnClass}><X className="h-3.5 w-3.5" /></button>
                                        {editLink === i ? (
                                            <div className="flex-1 flex gap-2 items-center">
                                                <select className="px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]" value={link.type} onChange={e => updateItem('links', i, { ...link, type: e.target.value as LinkItem['type'] })}>{LINK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
                                                <EditableField value={link.url} onChange={v => updateItem('links', i, { ...link, url: v })} placeholder="URL" />
                                                <button onClick={() => setEditLink(null)} className="px-2 py-1 text-xs font-medium bg-[var(--accent)] text-white rounded"><Check className="h-3 w-3" /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-lg">{linkType.icon}</span>
                                                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase w-16">{linkType.label}</span>
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-[var(--accent-text)] hover:underline truncate">{link.url}</a>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
