
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST isteği gerekli."
    });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Mesaj boş olamaz."
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "Sen Robert adında Türkçe konuşan kişisel bir yapay zekâ asistanısın. Doğal, anlaşılır ve yardımcı ol."
            }]
          },
          contents: [
            ...(Array.isArray(history) ? history.slice(-12) : []),
            {
              role: "user",
              parts: [{ text: message }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 700
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "Gemini bağlantı hatası."
      });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("");

    return res.status(200).json({
      reply: reply || "Yanıt alınamadı."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Sunucu hatası."
    });
  }
}
