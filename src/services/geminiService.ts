import { GoogleGenAI, Type } from "@google/genai";

const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is missing from the environment.");
    throw new Error("GEMINI_API_KEY is not defined.");
  }
  return new GoogleGenAI({ apiKey });
};

export interface ExamInfo {
  title: string;
  date?: string;
  source: string;
  link: string;
  summary: string;
}

export const fetchLatestExamInfo = async (query: string, lang: 'en' | 'ta' = 'en'): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a comprehensive, high-quality editorial report for government exam preparation based on this query: ${query}. 
      Focus on TNPSC, UPSC, and SSC. 
      Synthesize the information into original content. 
      Include sections like 'Latest Notifications', 'Strategic Analysis', and 'Expert Insights'. 
      Provide relevant links to official sources or detailed news articles for every major point. 
      Do not copy-paste. Ensure the tone is professional and premium.
      IMPORTANT: The entire response MUST be in ${lang === 'ta' ? 'Tamil' : 'English'}.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return response.text || "No information found.";
  } catch (error) {
    console.error("Error fetching exam info:", error);
    return lang === 'ta' ? "தகவலைப் பெறுவதில் தோல்வி. பின்னர் மீண்டும் முயற்சிக்கவும்." : "Failed to fetch information. Please try again later.";
  }
};

export const fetchLiveNotifications = async (lang: 'en' | 'ta' = 'en') => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 4-5 real-time, high-priority notifications for TNPSC, UPSC, and SSC exams as of today. For each notification, provide: 1. Title, 2. Time (e.g., '2 hours ago'), 3. Category (Result, Admit Card, Alert, Scheme), 4. A detailed 'Complete Story' (2-3 paragraphs) that explains everything a student needs to know. Return this as a JSON array.
      IMPORTANT: All text content (title, time, type, content) MUST be in ${lang === 'ta' ? 'Tamil' : 'English'}.`,
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
              color: { type: Type.STRING }
            },
            required: ["title", "time", "type", "content", "color"]
          }
        },
        tools: [{ googleSearch: {} }],
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching live notifications:", error);
    return [];
  }
};

export const chatWithAssistant = async (message: string, _history: any[], lang: 'en' | 'ta' = 'en') => {
  try {
    const ai = getAi();
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are an expert government exam consultant for TNPSC, UPSC, and other Indian competitive exams. Use Google Search to provide the most accurate and up-to-date information on exam dates, syllabus, notifications, and current affairs. Always cite sources and provide links if available. Rewrite all information in your own words to ensure originality and high editorial quality.
        IMPORTANT: Respond ALWAYS in ${lang === 'ta' ? 'Tamil' : 'English'}.`,
        tools: [{ googleSearch: {} }],
      },
    });
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat error:", error);
    return lang === 'ta' ? "தொடர்பு கொள்வதில் சிக்கல் உள்ளது. மீண்டும் முயற்சிக்கவும்." : "I'm having trouble connecting right now. Please try again.";
  }
};

export const analyzeUrlContent = async (url: string, lang: 'en' | 'ta' = 'en'): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an elite research assistant. Pull the COMPLETE story and all relevant details from this URL: ${url}. 
      Synthesize it into a comprehensive, long-form editorial article suitable for a premium exam preparation site. 
      Include:
      1. A detailed summary of the main event/news.
      2. Key dates, eligibility criteria, or syllabus changes mentioned.
      3. Strategic implications for students.
      4. Step-by-step instructions if it's a notification or application guide.
      
      Rewrite everything to be 100% original. Do not use placeholders. If the URL is a PDF or official notice, extract every critical detail.
      IMPORTANT: The entire response MUST be in ${lang === 'ta' ? 'Tamil' : 'English'}.`,
      config: { tools: [{ urlContext: {} }] },
    });
    return response.text || "Could not analyze the content.";
  } catch (error) {
    console.error("URL Analysis error:", error);
    return lang === 'ta' ? "இணைப்பிலிருந்து உள்ளடக்கத்தைப் பெறுவதில் தோல்வி." : "Failed to fetch content from the link. The source might be restricted.";
  }
};
