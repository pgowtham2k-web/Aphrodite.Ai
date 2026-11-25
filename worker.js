
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method === "GET") {
      return Response.json({
        app: "Aphrodite",
        status: "online"
      }, { headers: cors });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, {
        status: 405, headers: cors
      });
    }

    try {
      const { message } = await request.json();

      if (!message) {
        return Response.json({ error: "Message required" }, {
          status: 400, headers: cors
        });
      }

      const result = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "You are Aphrodite, an advanced AI stock research assistant. Analyze stocks, explain financial theories, screen stocks based on user-defined criteria, and clearly distinguish verified data from assumptions. Never invent live stock prices or financial data."
              }]
            },
            contents: [{
              role: "user",
              parts: [{ text: message }]
            }]
          })
        }
      );

      const data = await result.json();

      if (!result.ok) {
        return Response.json({
          error: data.error?.message || "Gemini error"
        }, { status: result.status, headers: cors });
      }

      return Response.json({
        app: "Aphrodite",
        answer: data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer"
      }, { headers: cors });

    } catch (error) {
      return Response.json({ error: error.message }, {
        status: 500, headers: cors
      });
    }
  }
};
