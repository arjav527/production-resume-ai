import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Search, MessageSquare, PenLine, Plus, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const quickActions = [
  { path: "/resume-builder", icon: Plus, label: "New Resume", desc: "Build from scratch", color: "text-primary" },
  { path: "/resume-analyzer", icon: Search, label: "Analyze Resume", desc: "Get ATS score", color: "text-secondary" },
  { path: "/ai-coach", icon: MessageSquare, label: "AI Coach", desc: "Career advice", color: "text-accent" },
  { path: "/cover-letter", icon: PenLine, label: "Cover Letter", desc: "AI-generated", color: "text-primary" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ resumes: 0, analyses: 0, coverLetters: 0 });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("resumes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("cover_letters").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([r, c]) => {
      setStats({
        resumes: r.count || 0,
        analyses: r.count || 0,
        coverLetters: c.count || 0,
      });
    });
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold">
            Welcome back<span className="gradient-text">{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">Your AI-powered career dashboard</p>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Resumes", value: stats.resumes, icon: FileText, color: "text-primary" },
            { label: "ATS Analyses", value: stats.analyses, icon: BarChart3, color: "text-secondary" },
            { label: "Cover Letters", value: stats.coverLetters, icon: TrendingUp, color: "text-accent" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-display text-3xl font-bold">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-60`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="mt-10 font-display text-xl font-semibold">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((a, i) => (
            <motion.div
              key={a.path}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link to={a.path}>
                <div className="glass-card-hover p-5 cursor-pointer group">
                  <a.icon className={`h-8 w-8 ${a.color} mb-3 transition-transform group-hover:scale-110`} />
                  <h3 className="font-display font-semibold">{a.label}</h3>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 glass-card p-6 flex items-center justify-between"
        >
          <div>
            <h3 className="font-display text-lg font-semibold">AI Career Coach</h3>
            <p className="text-sm text-muted-foreground">Get personalized career advice from our agentic AI</p>
          </div>
          <Link to="/ai-coach">
            <Button variant="hero">Start Chat</Button>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
