export interface ExamInfo {
  title: string;
  date?: string;
  source: string;
  link: string;
  summary: string;
}

const callApi = async (action: string, payload: any) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API call failed');
  }
  return response.json();
};

export const fetchLatestExamInfo = async (query: string): Promise<string> => {
  try {
    const data = await callApi('fetchLatestExamInfo', { query });
    return data.text || "No information found.";
  } catch (error) {
    console.error("Error fetching exam info:", error);
    return "Failed to fetch information. Please try again later.";
  }
};

export const fetchLiveNotifications = async () => {
  try {
    const data = await callApi('fetchLiveNotifications', {});
    return data.data || [];
  } catch (error) {
    console.error("Error fetching live notifications:", error);
    return [];
  }
};

export const chatWithAssistant = async (message: string, history: any[]) => {
  try {
    const data = await callApi('chatWithAssistant', { message, history });
    return data.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble connecting right now. Please try again.";
  }
};

export const analyzeUrlContent = async (url: string): Promise<string> => {
  try {
    const data = await callApi('analyzeUrlContent', { url });
    return data.text || "Could not analyze the content.";
  } catch (error) {
    console.error("URL Analysis error:", error);
    return "Failed to fetch content from the link. The source might be restricted.";
  }
};
