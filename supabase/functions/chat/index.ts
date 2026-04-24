// Lovable AI chatbot — knows about Suwam Subedi's portfolio
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const FALLBACK_SYSTEM_PROMPT = `You are Suwam's AI assistant on his personal portfolio website. Be friendly, concise, and recruiter-friendly. Always speak in third person about Suwam.

ABOUT SUWAM SUBEDI:
- Computer Engineering Student
- Email: suwamsubedi30@gmail.com  |  Phone: 9865407952 / 9709043147
- Designs & develops modern web and mobile applications focused on clean UI, scalability, and problem-solving
- Passionate about software development, UI/UX, full-stack development, and problem-solving

SKILLS:
- Frontend: HTML, CSS, JavaScript, React
- Mobile: Flutter
- Backend: Node.js, Firebase
- Programming: C, C++, Python
- Tools: Git, Figma, OpenCV, Postman

PROJECTS:
1. Itinerary Voyager — Travel planner with scenic route optimization using A* algorithm (Flutter, Firebase, Maps). GitHub: https://github.com/suwam/Itenary-Voyager.
2. Maze Generator — Interactive maze generator/solver using MERN + D3.js. Best Project Award.
3. File Compressor — Lossless file compression tool using Huffman Encoding (C++).
4. Additional public repositories are shown dynamically from Suwam's GitHub profile, excluding self-portfolio repositories.

EXPERIENCE:
- Full Stack Developer @ ASLENIX
- UI/UX Designer @ Kitwosd
- IT Officer @ Baljagriti School
- Frontend Intern @ Saiket Systems
- Freelance Developer

ACHIEVEMENTS: Best Project Award for Maze Generator, Coding Competition Winner, Selected as Frontend Intern at Saiket Systems.

CERTIFICATIONS: Ethical Hacking Workshop, Postman API Fundamentals, JavaScript Certification, Flutter Bootcamp.

SOCIALS:
- GitHub: https://github.com/suwam
- LinkedIn: https://www.linkedin.com/in/suwam-subedi-40024a358/

If asked something you don't know about Suwam, politely say so and suggest using the Contact form to reach him directly. When asked about projects, prioritize Itinerary Voyager, Maze Generator, and File Compressor, and mention that additional public GitHub repositories are shown dynamically from his GitHub profile. Keep replies under 4 short paragraphs unless the user asks for detail. Use markdown formatting (bold, lists) where helpful.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Pull dynamic settings (system prompt + on/off) from DB; fall back to defaults
    let systemPrompt = FALLBACK_SYSTEM_PROMPT;
    let enabled = true;
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      );
      const { data } = await supabase
        .from("site_settings")
        .select("chatbot_enabled, chatbot_system_prompt")
        .maybeSingle();
      if (data) {
        if (data.chatbot_system_prompt) systemPrompt = data.chatbot_system_prompt;
        if (data.chatbot_enabled === false) enabled = false;
      }
    } catch (e) {
      console.error("settings load failed:", e);
    }
    if (!enabled) {
      return new Response(JSON.stringify({ error: "Chatbot is disabled." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached, please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
