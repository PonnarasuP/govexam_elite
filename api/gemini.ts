import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, payload } = req.body;

  try {
    switch (action) {
      case 'fetchLatestExamInfo': {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Generate a comprehensive, high-quality editorial report for government exam preparation based on this query: ${payload.query}. 
          Focus on TNPSC, UPSC, and SSC. 
          Synthesize the information into original content. 
          Include sections like 'Latest Notifications', 'Strategic Analysis', and 'Expert Insights'. 
          Provide relevant links to official sources or detailed news articles for every major point. 
          Do not copy-paste. Ensure the tone is professional and premium.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        return res.status(200).json({ text: response.text });
      }

      case 'fetchLiveNotifications': {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Generate 4-5 real-time, high-priority notifications for TNPSC, UPSC, and SSC exams as of today. For each notification, provide: 1. Title, 2. Time (e.g., '2 hours ago'), 3. Category (Result, Admit Card, Alert, Scheme), 4. A detailed 'Complete Story' (2-3 paragraphs) that explains everything a student needs to know. Return this as a JSON array.",
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  time: { type: Type.STRING },
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                  color: { type: Type.STRING, description: "Tailwind border and text color classes, e.g., 'border-emerald-500/20 text-emerald-400'" }
                },
                required: ["title", "time", "type", "content", "color"]
              }
            },
            tools: [{ googleSearch: {} }],
          },
        });
        return res.status(200).json({ data: JSON.parse(response.text) });
      }

      case 'chatWithAssistant': {
        const chat = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction: "You are an expert government exam consultant for TNPSC, UPSC, and other Indian competitive exams. Use Google Search to provide the most accurate and up-to-date information on exam dates, syllabus, notifications, and current affairs. Always cite sources and provide links if available. Rewrite all information in your own words to ensure originality and high editorial quality.",
            tools: [{ googleSearch: {} }],
          },
        });

        const response = await chat.sendMessage({ message: payload.message });
        return res.status(200).json({ text: response.text });
      }

      case 'analyzeUrlContent': {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `You are an elite research assistant. Pull the COMPLETE story and all relevant details from this URL: ${payload.url}. 
          Synthesize it into a comprehensive, long-form editorial article suitable for a premium exam preparation site. 
          Include:
          1. A detailed summary of the main event/news.
          2. Key dates, eligibility criteria, or syllabus changes mentioned.
          3. Strategic implications for students.
          4. Step-by-step instructions if it's a notification or application guide.
          
          Rewrite everything to be 100% original. Do not use placeholders. If the URL is a PDF or official notice, extract every critical detail.`,
          config: {
            tools: [{ urlContext: {} }],
          },
        });
        return res.status(200).json({ text: response.text });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
