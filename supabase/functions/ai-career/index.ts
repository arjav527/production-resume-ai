import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  chat: `You are CareerForge AI, an expert career coach and resume advisor. You help users with:
- Resume writing and optimization
- Career advice and job search strategies
- Interview preparation
- Skill development recommendations
- Industry insights
Be concise, actionable, and encouraging. Use markdown formatting.`,

  analyze: `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the provided resume and return a JSON response using the tool provided. Evaluate:
- Overall ATS compatibility score (0-100)
- Formatting score, keyword score, structure score, content score (each 0-100)
- List of specific issues found with severity (critical/warning/info)
- Recommended keywords to add
- Actionable improvement suggestions
Be thorough and specific.`,

  enhance: `You are an expert resume writer. Given a resume bullet point or section, rewrite it to be more impactful, using action verbs, quantifiable achievements, and ATS-friendly language. Return 3 enhanced versions.`,

  "cover-letter": `You are an expert cover letter writer. Given a resume summary and job details, write a compelling, personalized cover letter. Be professional, specific, and highlight relevant experience. Use a warm but professional tone. Format with proper paragraphs.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, action = "chat", resumeData, jobData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[action] || SYSTEM_PROMPTS.chat;

    const allMessages = [
      { role: "system", content: systemPrompt },
    ];

    if (resumeData) {
      allMessages.push({ role: "user", content: `Resume data:\n${JSON.stringify(resumeData)}` });
    }
    if (jobData) {
      allMessages.push({ role: "user", content: `Job details:\n${JSON.stringify(jobData)}` });
    }

    if (messages) {
      allMessages.push(...messages);
    }

    const body: Record<string, unknown> = {
      model: "google/gemini-3-flash-preview",
      messages: allMessages,
      stream: action === "chat",
    };

    // For analyze action, use tool calling for structured output
    if (action === "analyze") {
      body.stream = false;
      body.tools = [
        {
          type: "function",
          function: {
            name: "ats_analysis",
            description: "Return structured ATS analysis results",
            parameters: {
              type: "object",
              properties: {
                overall_score: { type: "number", description: "Overall ATS score 0-100" },
                formatting_score: { type: "number" },
                keyword_score: { type: "number" },
                structure_score: { type: "number" },
                content_score: { type: "number" },
                issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      severity: { type: "string", enum: ["critical", "warning", "info"] },
                    },
                    required: ["title", "description", "severity"],
                  },
                },
                recommended_keywords: { type: "array", items: { type: "string" } },
                suggestions: { type: "array", items: { type: "string" } },
              },
              required: ["overall_score", "formatting_score", "keyword_score", "structure_score", "content_score", "issues", "recommended_keywords", "suggestions"],
            },
          },
        },
      ];
      body.tool_choice = { type: "function", function: { name: "ats_analysis" } };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "chat") {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming: parse and return
    const data = await response.json();

    if (action === "analyze") {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const analysis = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify(analysis), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const content = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-career error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
