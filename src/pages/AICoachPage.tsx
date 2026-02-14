import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { streamChat, type Msg } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const suggestions = [
  "How do I write a strong resume summary?",
  "What are the best keywords for a software engineer resume?",
  "Help me prepare for a behavioral interview",
  "What skills should I learn for data science?",
];

export default function AICoachPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load chat history
  useEffect(() => {
    if (!user) return;
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
      }
    };
    loadMessages();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role,
      content,
    });
  };

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Save user message
    saveMessage("user", text.trim());

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: upsertAssistant,
        onDone: () => {
          setIsLoading(false);
          // Save assistant message when done
          saveMessage("assistant", assistantSoFar);
        },
      });
    } catch (e) {
      setIsLoading(false);
      toast({ title: "Error", description: e instanceof Error ? e.message : "AI error", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-3xl flex-col">
        <div className="mb-4">
          <h1 className="font-display text-2xl font-bold">
            <Sparkles className="inline h-6 w-6 text-primary mr-2" />
            AI Career Coach
          </h1>
          <p className="text-sm text-muted-foreground">Agentic AI for career guidance, interview prep, and resume advice</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-md">
                <Bot className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                <h2 className="font-display text-xl font-semibold mb-2">How can I help your career?</h2>
                <p className="text-sm text-muted-foreground mb-6">Ask me anything about resumes, interviews, career strategy, or job searching.</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="glass-card p-3 text-left text-xs text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
            >
              {m.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${m.role === "user"
                ? "bg-primary/10 text-foreground"
                : "glass-card"
                }`}>
                {m.role === "assistant" ? (
                  <div className="prose-chat"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                ) : (
                  m.content
                )}
              </div>
              {m.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                  <User className="h-4 w-4 text-secondary" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="glass-card px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Ask about resumes, interviews, career strategy..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button variant="hero" size="icon" onClick={() => send(input)} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
