import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { type ResumeData, emptyResume } from "@/lib/resume-types";
import { Plus, Trash2, Save, FileText, Eye, Sparkles } from "lucide-react";
import { aiRequest } from "@/lib/ai";

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resume, setResume] = useState<ResumeData>(emptyResume);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState<string | null>(null);

  const updatePersonal = (field: string, value: string) => {
    setResume(r => ({ ...r, personalInfo: { ...r.personalInfo, [field]: value } }));
  };

  const addExperience = () => {
    setResume(r => ({
      ...r,
      experience: [...r.experience, { id: crypto.randomUUID(), title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }],
    }));
  };

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setResume(r => ({ ...r, experience: r.experience.map(e => e.id === id ? { ...e, [field]: value } : e) }));
  };

  const removeExperience = (id: string) => {
    setResume(r => ({ ...r, experience: r.experience.filter(e => e.id !== id) }));
  };

  const addEducation = () => {
    setResume(r => ({
      ...r,
      education: [...r.education, { id: crypto.randomUUID(), degree: "", school: "", location: "", graduationDate: "", gpa: "" }],
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setResume(r => ({ ...r, education: r.education.map(e => e.id === id ? { ...e, [field]: value } : e) }));
  };

  const removeEducation = (id: string) => {
    setResume(r => ({ ...r, education: r.education.filter(e => e.id !== id) }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !resume.skills.includes(skill.trim())) {
      setResume(r => ({ ...r, skills: [...r.skills, skill.trim()] }));
    }
  };

  const removeSkill = (skill: string) => {
    setResume(r => ({ ...r, skills: r.skills.filter(s => s !== skill) }));
  };

  const saveResume = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("resumes").insert([{
        user_id: user.id,
        title: resume.personalInfo.fullName ? `${resume.personalInfo.fullName}'s Resume` : "Untitled Resume",
        content: JSON.parse(JSON.stringify(resume)),
        template: "modern",
      }]);
      if (error) throw error;
      toast({ title: "Saved!", description: "Resume saved successfully." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save resume", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const enhanceBullet = async (expId: string) => {
    const exp = resume.experience.find(e => e.id === expId);
    if (!exp?.description) return;
    setEnhancing(expId);
    try {
      const data = await aiRequest("enhance", {
        messages: [{ role: "user", content: `Enhance this resume bullet point: "${exp.description}"` }],
      });
      if (data.content) {
        updateExperience(expId, "description", data.content);
        toast({ title: "Enhanced!", description: "Bullet point improved by AI" });
      }
    } catch {
      toast({ title: "Error", description: "AI enhancement failed", variant: "destructive" });
    } finally {
      setEnhancing(null);
    }
  };

  const [skillInput, setSkillInput] = useState("");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Resume Builder</h1>
            <p className="text-sm text-muted-foreground">Build ATS-optimized resumes with AI enhancement</p>
          </div>
          <div className="flex gap-2">
            <Button variant={activeTab === "edit" ? "hero" : "outline"} size="sm" onClick={() => setActiveTab("edit")}>
              <FileText className="h-4 w-4" /> Edit
            </Button>
            <Button variant={activeTab === "preview" ? "hero" : "outline"} size="sm" onClick={() => setActiveTab("preview")}>
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button variant="hero" size="sm" onClick={saveResume} disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {activeTab === "edit" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Personal Info */}
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Personal Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { field: "fullName", label: "Full Name", placeholder: "John Doe" },
                  { field: "email", label: "Email", placeholder: "john@example.com" },
                  { field: "phone", label: "Phone", placeholder: "+1 (555) 123-4567" },
                  { field: "location", label: "Location", placeholder: "San Francisco, CA" },
                  { field: "linkedin", label: "LinkedIn URL", placeholder: "linkedin.com/in/johndoe" },
                ].map(f => (
                  <div key={f.field}>
                    <Label>{f.label}</Label>
                    <Input
                      value={(resume.personalInfo as Record<string, string>)[f.field]}
                      onChange={e => updatePersonal(f.field, e.target.value)}
                      placeholder={f.placeholder}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label>Professional Summary</Label>
                <Textarea
                  value={resume.personalInfo.summary}
                  onChange={e => updatePersonal("summary", e.target.value)}
                  placeholder="A brief summary of your career..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            {/* Experience */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Experience</h2>
                <Button variant="outline" size="sm" onClick={addExperience}><Plus className="h-4 w-4" /> Add</Button>
              </div>
              {resume.experience.map(exp => (
                <div key={exp.id} className="mb-4 rounded-lg border border-border p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Job Title</Label>
                      <Input value={exp.title} onChange={e => updateExperience(exp.id, "title", e.target.value)} placeholder="Software Engineer" className="mt-1" />
                    </div>
                    <div>
                      <Label>Company</Label>
                      <Input value={exp.company} onChange={e => updateExperience(exp.id, "company", e.target.value)} placeholder="Google" className="mt-1" />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input value={exp.startDate} onChange={e => updateExperience(exp.id, "startDate", e.target.value)} placeholder="Jan 2023" className="mt-1" />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input value={exp.endDate} onChange={e => updateExperience(exp.id, "endDate", e.target.value)} placeholder="Present" className="mt-1" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <Label>Description</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => enhanceBullet(exp.id)}
                        disabled={enhancing === exp.id}
                        className="text-primary"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {enhancing === exp.id ? "Enhancing..." : "AI Enhance"}
                      </Button>
                    </div>
                    <Textarea
                      value={exp.description}
                      onChange={e => updateExperience(exp.id, "description", e.target.value)}
                      placeholder="Describe your responsibilities and achievements..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)} className="mt-2 text-destructive">
                    <Trash2 className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Education</h2>
                <Button variant="outline" size="sm" onClick={addEducation}><Plus className="h-4 w-4" /> Add</Button>
              </div>
              {resume.education.map(edu => (
                <div key={edu.id} className="mb-4 rounded-lg border border-border p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Degree</Label>
                      <Input value={edu.degree} onChange={e => updateEducation(edu.id, "degree", e.target.value)} placeholder="B.S. Computer Science" className="mt-1" />
                    </div>
                    <div>
                      <Label>School</Label>
                      <Input value={edu.school} onChange={e => updateEducation(edu.id, "school", e.target.value)} placeholder="Stanford University" className="mt-1" />
                    </div>
                    <div>
                      <Label>Graduation Date</Label>
                      <Input value={edu.graduationDate} onChange={e => updateEducation(edu.id, "graduationDate", e.target.value)} placeholder="May 2023" className="mt-1" />
                    </div>
                    <div>
                      <Label>GPA</Label>
                      <Input value={edu.gpa} onChange={e => updateEducation(edu.id, "gpa", e.target.value)} placeholder="3.8/4.0" className="mt-1" />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)} className="mt-2 text-destructive">
                    <Trash2 className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Skills</h2>
              <div className="flex gap-2 mb-3">
                <Input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { addSkill(skillInput); setSkillInput(""); } }}
                  placeholder="Add a skill and press Enter"
                />
                <Button variant="outline" onClick={() => { addSkill(skillInput); setSkillInput(""); }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                    {s}
                    <button onClick={() => removeSkill(s)} className="ml-1 hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8">
            <ResumePreview resume={resume} />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ResumePreview({ resume }: { resume: ResumeData }) {
  const { personalInfo: p, experience, education, skills } = resume;

  return (
    <div className="max-w-2xl mx-auto text-foreground font-body text-sm">
      {/* Header */}
      <div className="text-center border-b border-border pb-4 mb-4">
        <h1 className="font-display text-2xl font-bold">{p.fullName || "Your Name"}</h1>
        <div className="mt-1 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
        </div>
      </div>

      {p.summary && (
        <div className="mb-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary mb-1">Summary</h2>
          <p className="text-muted-foreground">{p.summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary mb-2">Experience</h2>
          {experience.map(e => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between">
                <div>
                  <span className="font-semibold">{e.title || "Job Title"}</span>
                  {e.company && <span className="text-muted-foreground"> — {e.company}</span>}
                </div>
                <span className="text-xs text-muted-foreground">{e.startDate} – {e.endDate || "Present"}</span>
              </div>
              {e.description && <p className="mt-1 text-muted-foreground whitespace-pre-line">{e.description}</p>}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary mb-2">Education</h2>
          {education.map(e => (
            <div key={e.id} className="mb-2">
              <div className="flex justify-between">
                <div>
                  <span className="font-semibold">{e.degree || "Degree"}</span>
                  {e.school && <span className="text-muted-foreground"> — {e.school}</span>}
                </div>
                <span className="text-xs text-muted-foreground">{e.graduationDate}</span>
              </div>
              {e.gpa && <p className="text-xs text-muted-foreground">GPA: {e.gpa}</p>}
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary mb-2">Skills</h2>
          <p className="text-muted-foreground">{skills.join(" • ")}</p>
        </div>
      )}
    </div>
  );
}
