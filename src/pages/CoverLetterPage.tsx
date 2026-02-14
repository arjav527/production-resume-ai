import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PenLine, Sparkles, Loader2, Copy, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiRequest } from "@/lib/ai";

export default function CoverLetterPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeSummary, setResumeSummary] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!jobTitle.trim() || !company.trim()) {
      toast({ title: "Error", description: "Please fill in job title and company", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = await aiRequest("cover-letter", {
        messages: [{ role: "user", content: `Write a cover letter for the ${jobTitle} position at ${company}.` }],
        resumeData: resumeSummary || undefined,
        jobData: { title: jobTitle, company, description: jobDescription },
      });
      setCoverLetter(data.content || "");

      // Save to DB
      if (user) {
        await supabase.from("cover_letters").insert({
          user_id: user.id,
          job_title: jobTitle,
          company,
          content: data.content || "",
        });
      }
    } catch {
      toast({ title: "Error", description: "Generation failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">
            <PenLine className="inline h-6 w-6 text-primary mr-2" />
            AI Cover Letter Generator
          </h1>
          <p className="text-sm text-muted-foreground">Generate personalized cover letters from your resume + job details</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h2 className="font-display font-semibold mb-3">Job Details</h2>
              <div className="space-y-3">
                <div>
                  <Label>Job Title</Label>
                  <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Senior Software Engineer" className="mt-1" />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Google" className="mt-1" />
                </div>
                <div>
                  <Label>Job Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job description..." rows={5} className="mt-1" />
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <h2 className="font-display font-semibold mb-3">Your Background <span className="text-xs text-muted-foreground">(optional)</span></h2>
              <Textarea
                value={resumeSummary}
                onChange={e => setResumeSummary(e.target.value)}
                placeholder="Briefly describe your experience, skills, and achievements..."
                rows={4}
              />
            </div>

            <Button variant="hero" className="w-full" onClick={generate} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Cover Letter</>}
            </Button>
          </div>

          {/* Output */}
          <div>
            {coverLetter ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold">Your Cover Letter</h3>
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      {copied ? <><CheckCircle className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                    </Button>
                  </div>
                  <div className="prose-chat text-sm">
                    <ReactMarkdown>{coverLetter}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PenLine className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="font-display text-lg">Fill in the details to generate</p>
                  <p className="text-sm mt-1">AI writes a personalized cover letter</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
