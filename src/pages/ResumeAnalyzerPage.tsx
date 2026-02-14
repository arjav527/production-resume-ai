import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, AlertTriangle, CheckCircle, Info, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiRequest } from "@/lib/ai";
import { extractKeywords, calculateATSScore, type ATSAnalysis, type ResumeData } from "@/lib/resume-types";

export default function ResumeAnalyzerPage() {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      toast({ title: "Error", description: "Please paste your resume text", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Client-side ML keyword extraction
    const resumeKeywords = extractKeywords(resumeText);
    const jobKeywords = jobDescription ? extractKeywords(jobDescription) : [];
    setKeywords(jobKeywords);

    try {
      const data = await aiRequest("analyze", {
        resumeData: { text: resumeText, extractedKeywords: resumeKeywords },
        jobData: jobDescription ? { description: jobDescription, extractedKeywords: jobKeywords } : undefined,
        messages: [{ role: "user", content: `Analyze this resume for ATS compatibility:\n\n${resumeText}${jobDescription ? `\n\nJob Description:\n${jobDescription}` : ""}` }],
      });
      setAnalysis(data);
    } catch {
      toast({ title: "Error", description: "Analysis failed. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-secondary";
    return "text-destructive";
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === "critical") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (severity === "warning") return <AlertTriangle className="h-4 w-4 text-secondary" />;
    return <Info className="h-4 w-4 text-primary" />;
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">
            <Search className="inline h-6 w-6 text-secondary mr-2" />
            ATS Resume Analyzer
          </h1>
          <p className="text-sm text-muted-foreground">ML-powered keyword extraction + AI deep analysis</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h2 className="font-display font-semibold mb-2">Paste Your Resume</h2>
              <Textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your full resume text here..."
                rows={10}
              />
            </div>
            <div className="glass-card p-5">
              <h2 className="font-display font-semibold mb-2">Job Description <span className="text-xs text-muted-foreground">(optional)</span></h2>
              <Textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the job description for targeted analysis..."
                rows={6}
              />
            </div>
            <Button variant="hero" className="w-full" onClick={analyzeResume} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Analyze with AI + ML</>}
            </Button>
          </div>

          {/* Results */}
          <div>
            {analysis ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Score */}
                <div className="glass-card p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">ATS Score</p>
                  <p className={`font-display text-6xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                    {analysis.overall_score}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">out of 100</p>
                </div>

                {/* Category Scores */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Formatting", score: analysis.formatting_score },
                    { label: "Keywords", score: analysis.keyword_score },
                    { label: "Structure", score: analysis.structure_score },
                    { label: "Content", score: analysis.content_score },
                  ].map(c => (
                    <div key={c.label} className="glass-card p-4">
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className={`font-display text-2xl font-bold ${getScoreColor(c.score)}`}>{c.score}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.score}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Issues */}
                {analysis.issues.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="font-display font-semibold mb-3">Issues Found</h3>
                    <div className="space-y-2">
                      {analysis.issues.map((issue, i) => (
                        <div key={i} className="flex gap-2 rounded-lg border border-border p-3">
                          {getSeverityIcon(issue.severity)}
                          <div>
                            <p className="text-sm font-medium">{issue.title}</p>
                            <p className="text-xs text-muted-foreground">{issue.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {analysis.recommended_keywords.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="font-display font-semibold mb-3">Recommended Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.recommended_keywords.map(kw => (
                        <span key={kw} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-secondary" /> Improvement Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ML Keywords */}
                {keywords.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="font-display font-semibold mb-3">ML-Extracted Job Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map(kw => (
                        <span key={kw} className="rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="font-display text-lg">Paste your resume to get started</p>
                  <p className="text-sm mt-1">AI + ML analysis in seconds</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
