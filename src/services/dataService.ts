export interface Notification {
  title: string;
  date: string;
  link: string;
  source: string;
  type?: string;
  color?: string;
  content?: string;
}

export const fetchScrapedNotifications = async (lang: 'en' | 'ta' = 'en'): Promise<Notification[]> => {
  try {
    const [tnpscRes, upscRes] = await Promise.all([
      fetch('/api/scrape/tnpsc'),
      fetch('/api/scrape/upsc')
    ]);

    const tnpsc = await tnpscRes.json();
    const upsc = await upscRes.json();

    const combined = [
      ...tnpsc.map((n: any) => ({ ...n, type: 'Notification', color: 'border-blue-500 text-blue-500' })),
      ...upsc.map((n: any) => ({ ...n, type: 'Alert', color: 'border-emerald-500 text-emerald-500' }))
    ];

    // Simple translation if needed (though scraping is usually in English)
    if (lang === 'ta') {
      return combined.map(n => ({
        ...n,
        title: `[${n.source}] ${n.title}` // In a real app, you'd translate titles, but here we just tag them
      }));
    }

    return combined;
  } catch (error) {
    console.error("Error fetching scraped data:", error);
    return [];
  }
};

export const fetchLatestExamInfo = async (_query: string, lang: 'en' | 'ta' = 'en'): Promise<string> => {
  // Since we removed AI, we can return a static summary or a combined list of latest news
  const notifications = await fetchScrapedNotifications(lang);
  if (notifications.length === 0) return "No live data available at the moment.";

  let report = lang === 'ta' ? "### சமீபத்திய தேர்வு செய்திகள்\n\n" : "### Latest Exam Intelligence\n\n";
  notifications.slice(0, 5).forEach(n => {
    report += `- **${n.source}**: ${n.title} (${n.date})\n  [${lang === 'ta' ? 'மேலும் அறிய' : 'Read More'}](${n.link})\n\n`;
  });

  return report;
};

// Mocking chat since AI is removed
export const chatWithAssistant = async (message: string, _history: any[], lang: 'en' | 'ta' = 'en') => {
  return lang === 'ta' 
    ? "மன்னிக்கவும், AI அம்சம் அகற்றப்பட்டது. நேரடித் தரவு ஊட்டத்தைப் பயன்படுத்தவும்." 
    : "I'm sorry, the AI Strategist feature has been disabled. Please use the Live Intelligence feed for the latest updates.";
};

export const analyzeUrlContent = async (url: string, lang: 'en' | 'ta' = 'en'): Promise<string> => {
  return lang === 'ta'
    ? `இந்த இணைப்பைப் பார்வையிடவும்: ${url}`
    : `Please visit the original source for details: ${url}`;
};
