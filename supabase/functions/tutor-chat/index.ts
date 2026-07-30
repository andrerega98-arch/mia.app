import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, age, language } = await req.json();

    const langLabel: Record<string, string> = {
      it: "italiano",
      en: "English",
      es: "español",
      fr: "français",
      de: "Deutsch",
    };
    const lang = langLabel[language] ?? "italiano";

    const systemPrompt = `Sei un tutor scolastico AI amichevole e paziente. Rispondi SEMPRE in ${lang}. Spiega in modo chiaro e semplice, adatto a un ragazzo di ${age} anni. Sii conciso ma completo. Se non conosci la risposta, dillo onestamente.`;

    const payload = {
      model: "openai",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    };

    let lastError = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const resp = await fetch("https://text.pollinations.ai/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          lastError = `HTTP ${resp.status}`;
          if (resp.status === 402 || resp.status === 429) {
            await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
            continue;
          }
          continue;
        }

        const data = await resp.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content && typeof content === "string" && content.trim().length > 0) {
          return new Response(
            JSON.stringify({ reply: content.trim() }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        lastError = "Empty response";
      } catch (e) {
        lastError = e.message ?? "Network error";
      }
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }

    return new Response(
      JSON.stringify({
        reply: `Non riesco a rispondere adesso (servizio AI momentaneamente non disponibile). Riprova tra qualche secondo.`,
        error: lastError,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        reply: "Si è verificato un errore. Riprova.",
        error: err.message,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
