import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Search, MessageSquare, PenLine, ArrowRight, Zap, Shield, Brain } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

const features = [
  { icon: FileText, title: "Smart Resume Builder", desc: "10+ professional templates with live preview and AI suggestions", color: "text-primary" },
  { icon: Search, title: "ATS Score Analyzer", desc: "ML-powered scoring engine with keyword extraction and actionable fixes", color: "text-secondary" },
  { icon: MessageSquare, title: "AI Career Coach", desc: "Agentic AI chatbot for career guidance, interview prep, and strategy", color: "text-accent" },
  { icon: PenLine, title: "Cover Letter Generator", desc: "AI generates personalized cover letters from your resume + job description", color: "text-primary" },
  { icon: Brain, title: "Resume Enhancement", desc: "AI rewrites your bullet points to be more impactful and ATS-friendly", color: "text-secondary" },
  { icon: Shield, title: "Production Ready", desc: "Auth, database persistence, real AI integration — not a demo", color: "text-accent" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold gradient-text">CareerForge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost">Sign In</Button></Link>
            <Link to="/auth?mode=signup"><Button variant="hero">Get Started <ArrowRight className="h-4 w-4" /></Button></Link>
            <ModeToggle />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-3.5 w-3.5" />
              Powered by Agentic AI + ML
            </div>

            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-7xl">
              Build Resumes That
              <span className="gradient-text block">Land Interviews</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              AI-powered resume builder with real-time ATS scoring, career coaching,
              and ML-driven keyword optimization. Production-ready, not a prototype.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  Start Building Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              5 Advanced Features for <span className="gradient-text-secondary">Production-Level</span> Results
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Real AI, real ML, real results. Every feature works end-to-end.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-6"
              >
                <f.icon className={`h-10 w-10 ${f.color} mb-4`} />
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12"
          >
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold mb-4">Ready to Forge Your Career?</h2>
            <p className="text-muted-foreground mb-8">Join thousands of job seekers using AI to land their dream roles.</p>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="lg" className="text-base px-10 py-6">
                Get Started Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          © 2026 CareerForge. Created by me.
        </div>
      </footer>
    </div>
  );
}
