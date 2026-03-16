import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  ExternalLink, 
  TrendingUp, 
  Award,
  Send,
  Loader2,
  Menu,
  X,
  Newspaper,
  Zap,
  Target,
  BarChart3,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { fetchLatestExamInfo, chatWithAssistant, fetchScrapedNotifications as fetchLiveNotifications, analyzeUrlContent } from './services/dataService';
import { cn } from './lib/utils';
import AdBanner from './components/AdBanner';
import { PRIVACY_POLICY, TERMS_OF_SERVICE, AD_DISCLOSURE } from './legalContent';


const translations = {
  en: {
    intelligence: 'Intelligence',
    liveFeed: 'Live Feed',
    vault: 'Vault',
    aiStrategist: 'Intelligence Feed',
    masterFuture: 'Master Your Future Career',
    platformDesc: 'The most advanced live data platform for TNPSC and UPSC aspirants. Real-time official notifications and elite resources.',
    initializeAi: 'View Live Feed',
    viewVault: 'View Vault',
    marketTrends: 'Market Trends',
    competitionRise: 'Competition Rise',
    dailyStrategist: 'The Live Strategist',
    lastUpdated: 'Last Updated',
    synthesizing: 'Fetching Live Intelligence...',
    criticalAlerts: 'Critical Alerts',
    verifiedContent: 'Verified Content',
    verifiedDesc: 'All information on this platform is synthesized from official government portals and verified by our AI Intelligence engine.',
    systemOnline: 'System Online',
    strategizing: 'Strategizing...',
    chatPlaceholder: 'Describe your exam goals or ask for a strategy...',
    liveIntelligence: 'Live Intelligence',
    realTimeFeed: 'Real-time Feed',
    noAlerts: 'No live alerts at this moment',
    accessIntelligence: 'Access Intelligence',
    globalAccess: 'Global Access',
    intelligenceDashboard: 'Intelligence Dashboard',
    liveExamFeed: 'Live Exam Feed',
    studyVault: 'Study Vault',
    premiumExamHub: 'Premium Exam Hub',
    latestNotifications: 'Latest Notifications',
    strategicAnalysis: 'Strategic Analysis',
    expertInsights: 'Expert Insights',
    welcome: 'Welcome to the Premium Exam Hub. I am your AI strategist. How can I help you optimize your preparation today?',
    premiumAccess: 'Premium Access Active',
    intelligencePlatform: 'Intelligence Platform',
    reportTitle: 'Live Intelligence Report',
    source: 'Source',
    openOriginal: 'Open Original Source',
    navigation: 'Navigation',
    legal: 'Legal',
    rights: 'All Rights Reserved.',
    alerts: [
      { title: 'UPSC Prelims 2024', date: 'May 26', type: 'High Priority' },
      { title: 'TNPSC Group 4', date: 'June 09', type: 'Registration Open' },
      { title: 'SSC CGL 2024', date: 'Tentative', type: 'Notification Soon' },
    ],
    resources: [
      { title: 'UPSC Strategic Syllabus', desc: 'A high-level breakdown of Prelims & Mains with weightage analysis.', icon: BookOpen, content: 'The UPSC Civil Services Examination syllabus is divided into three stages: Preliminary, Main, and Interview. The Preliminary stage consists of two objective-type papers (General Studies I and CSAT). The Main stage consists of nine descriptive papers, including an Essay, four General Studies papers, and two Optional Subject papers. Understanding the weightage of subjects like History, Geography, and Polity is crucial for a targeted preparation strategy.' },
      { title: 'TNPSC Administration Notes', desc: 'Exclusive insights into Tamil Nadu history and governance.', icon: BookOpen, content: 'Tamil Nadu Administration is a vital part of the TNPSC Group 1 and Group 2 exams. Key topics include the Social Reform Movements in Tamil Nadu, the role of Justice Party, Self-Respect Movement, and the Dravidian Movement. Additionally, understanding the state government schemes, welfare measures, and the socio-economic development of the state is essential for scoring high in the General Studies papers.' },
      { title: 'The Archive: Solved Papers', desc: 'A curated collection of solved papers from the last decade.', icon: Newspaper, content: 'Practicing previous year question papers is one of the most effective ways to understand the exam pattern and the type of questions asked. Our archive contains solved papers for UPSC CSE and TNPSC Group exams from 2014 to 2023. Each solution is accompanied by a detailed explanation and references to standard textbooks, helping you build a solid foundation.' },
      { title: 'Monthly Intelligence PDF', desc: 'Synthesized current affairs for elite preparation.', icon: TrendingUp, content: 'Our Monthly Intelligence PDF provides a synthesized summary of national and international events, government schemes, and important appointments. Unlike standard news compilations, we focus on the "Exam Relevance" of each news item, providing background information and potential question angles for both Prelims and Mains.' },
      { title: 'Elite Mock Tests', desc: 'High-difficulty practice tests for serious aspirants.', icon: Award, content: 'The Elite Mock Test series is designed to challenge your understanding and improve your speed and accuracy. These tests are curated by subject matter experts and follow the latest trends of UPSC and TNPSC exams. Detailed performance analysis and rank tracking help you identify your strengths and weaknesses.' },
      { title: 'The Interview Protocol', desc: 'Advanced strategies for the final personality test.', icon: MessageSquare, content: 'The personality test is the final hurdle in the journey to becoming a civil servant. Our protocol covers everything from DAF (Detailed Application Form) analysis to mock interviews with retired bureaucrats. We focus on developing your communication skills, ethical reasoning, and situational awareness to help you face the board with confidence.' },
    ]
  },
  ta: {
    intelligence: 'புலனாய்வு',
    liveFeed: 'நேரடி ஊட்டம்',
    vault: 'பெட்டகம்',
    aiStrategist: 'புலனாய்வு ஊட்டம்',
    masterFuture: 'உங்கள் எதிர்கால வாழ்க்கையை மாஸ்டர் செய்யுங்கள்',
    platformDesc: 'TNPSC மற்றும் UPSC ஆர்வலர்களுக்கான மிகவும் மேம்பட்ட நேரடி தரவு தளம். நிகழ்நேர அதிகாரப்பூர்வ அறிவிப்புகள் மற்றும் உயரடுக்கு வளங்கள்.',
    initializeAi: 'நேரடி ஊட்டத்தைப் பார்க்கவும்',
    viewVault: 'பெட்டகத்தைப் பார்க்கவும்',
    marketTrends: 'சந்தை போக்குகள்',
    competitionRise: 'போட்டி உயர்வு',
    dailyStrategist: 'நேரடி உத்தியாளர்',
    lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
    synthesizing: 'நேரடித் தரவைப் பெறுகிறது...',
    criticalAlerts: 'முக்கிய எச்சரிக்கைகள்',
    verifiedContent: 'சரிபார்க்கப்பட்ட உள்ளடக்கம்',
    verifiedDesc: 'இந்தத் தளத்தில் உள்ள அனைத்துத் தகவல்களும் அதிகாரப்பூர்வ அரசாங்க இணையதளங்களில் இருந்து தொகுக்கப்பட்டு எமது AI புலனாய்வு இயந்திரத்தால் சரிபார்க்கப்படுகின்றன.',
    systemOnline: 'கணினி ஆன்லைனில் உள்ளது',
    strategizing: 'உத்தி வகுக்கிறது...',
    chatPlaceholder: 'உங்கள் தேர்வு இலக்குகளை விவரிக்கவும் அல்லது உத்தியைக் கேட்கவும்...',
    liveIntelligence: 'நேரடி புலனாய்வு',
    realTimeFeed: 'நிகழ்நேர ஊட்டம்',
    noAlerts: 'இந்த நேரத்தில் நேரடி எச்சரிக்கைகள் எதுவும் இல்லை',
    accessIntelligence: 'புலனாய்வை அணுகவும்',
    globalAccess: 'உலகளாவிய அணுகல்',
    intelligenceDashboard: 'புலனாய்வு டாஷ்போர்டு',
    liveExamFeed: 'நேரடி தேர்வு ஊட்டம்',
    studyVault: 'படிப்பு பெட்டகம்',
    premiumExamHub: 'பிரீமியம் தேர்வு மையம்',
    latestNotifications: 'சமீபத்திய அறிவிப்புகள்',
    strategicAnalysis: 'மூலோபாய பகுப்பாய்வு',
    expertInsights: 'நிபுணர் நுண்ணறிவு',
    welcome: 'பிரீமியம் தேர்வு மையத்திற்கு வரவேற்கிறோம். நான் உங்கள் AI உத்தியாளர். இன்று உங்கள் தயாரிப்பை மேம்படுத்த நான் உங்களுக்கு எப்படி உதவுவது?',
    premiumAccess: 'பிரீமியம் அணுகல் செயலில் உள்ளது',
    intelligencePlatform: 'புலனாய்வு தளம்',
    reportTitle: 'நேரடி புலனாய்வு அறிக்கை',
    source: 'ஆதாரம்',
    openOriginal: 'அசல் ஆதாரத்தைத் திறக்கவும்',
    navigation: 'வழிசெலுத்தல்',
    legal: 'சட்டம்',
    rights: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    alerts: [
      { title: 'UPSC பிரிலிம்ஸ் 2024', date: 'மே 26', type: 'அதிமுக்கியத்துவம்' },
      { title: 'TNPSC குரூப் 4', date: 'ஜூன் 09', type: 'பதிவு திறக்கப்பட்டுள்ளது' },
      { title: 'SSC CGL 2024', date: 'தற்காலிகமானது', type: 'விரைவில் அறிவிப்பு' },
    ],
    resources: [
      { title: 'UPSC மூலோபாய பாடத்திட்டம்', desc: 'மதிப்பெண் பகுப்பாய்வுடன் பிரிலிம்ஸ் மற்றும் மெயின்ஸின் உயர்மட்ட முறிவு.', icon: BookOpen, content: 'UPSC சிவில் சர்வீசஸ் தேர்வு பாடத்திட்டம் மூன்று நிலைகளாக பிரிக்கப்பட்டுள்ளது: ஆரம்பம், முதன்மை மற்றும் நேர்காணல். ஆரம்ப நிலை இரண்டு புறநிலை வகை தாள்களைக் கொண்டுள்ளது (பொது ஆய்வுகள் I மற்றும் CSAT). முதன்மை நிலை ஒரு கட்டுரை, நான்கு பொது ஆய்வுகள் தாள்கள் மற்றும் இரண்டு விருப்பப் பாடத் தாள்கள் உட்பட ஒன்பது விளக்கத் தாள்களைக் கொண்டுள்ளது. வரலாறு, புவியியல் மற்றும் அரசியல் போன்ற பாடங்களின் எடையைப் புரிந்துகொள்வது இலக்கு தயாரிப்பு உத்திக்கு முக்கியமானது.' },
      { title: 'TNPSC நிர்வாகக் குறிப்புகள்', desc: 'தமிழ்நாடு வரலாறு மற்றும் நிர்வாகம் பற்றிய பிரத்யேக நுண்ணறிவு.', icon: BookOpen, content: 'தமிழ்நாடு நிர்வாகம் TNPSC குரூப் 1 மற்றும் குரூப் 2 தேர்வுகளின் முக்கிய பகுதியாகும். முக்கிய தலைப்புகளில் தமிழ்நாட்டின் சமூக சீர்திருத்த இயக்கங்கள், நீதிக்கட்சியின் பங்கு, சுயமரியாதை இயக்கம் மற்றும் திராவிட இயக்கம் ஆகியவை அடங்கும். கூடுதலாக, மாநில அரசு திட்டங்கள், நலத்திட்டங்கள் மற்றும் மாநிலத்தின் சமூக-பொருளாதார வளர்ச்சி ஆகியவற்றைப் புரிந்துகொள்வது பொது ஆய்வுகள் தாள்களில் அதிக மதிப்பெண் பெறுவதற்கு அவசியம்.' },
      { title: 'காப்பகம்: தீர்க்கப்பட்ட தாள்கள்', desc: 'கடந்த தசாப்தத்தில் தீர்க்கப்பட்ட தாள்களின் தொகுப்பு.', icon: Newspaper, content: 'முந்தைய ஆண்டு வினாத்தாள்களைப் பயிற்சி செய்வது தேர்வு முறை மற்றும் கேட்கப்படும் கேள்விகளின் வகையைப் புரிந்துகொள்வதற்கான மிகச் சிறந்த வழிகளில் ஒன்றாகும். எங்கள் காப்பகத்தில் 2014 முதல் 2023 வரையிலான UPSC CSE மற்றும் TNPSC குரூப் தேர்வுகளுக்கான தீர்க்கப்பட்ட தாள்கள் உள்ளன. ஒவ்வொரு தீர்வும் விரிவான விளக்கம் மற்றும் நிலையான பாடப்புத்தகங்களுக்கான குறிப்புகளுடன் உள்ளது, இது உங்களுக்கு ஒரு உறுதியான அடித்தளத்தை உருவாக்க உதவுகிறது.' },
      { title: 'மாதாந்திர புலனாய்வு PDF', desc: 'உயரடுக்கு தயாரிப்பிற்கான தொகுக்கப்பட்ட நடப்பு நிகழ்வுகள்.', icon: TrendingUp, content: 'எங்கள் மாதாந்திர புலனாய்வு PDF தேசிய மற்றும் சர்வதேச நிகழ்வுகள், அரசு திட்டங்கள் மற்றும் முக்கிய நியமனங்கள் பற்றிய தொகுக்கப்பட்ட சுருக்கத்தை வழங்குகிறது. நிலையான செய்தித் தொகுப்புகளைப் போலன்றி, ஒவ்வொரு செய்தி உருப்படியின் "தேர்வுத் தொடர்பு" என்பதில் நாங்கள் கவனம் செலுத்துகிறோம், ஆரம்பம் மற்றும் முதன்மைத் தேர்வுகள் இரண்டிற்கும் பின்னணித் தகவல் மற்றும் சாத்தியமான கேள்வி கோணங்களை வழங்குகிறோம்.' },
      { title: 'எலைட் மாதிரி தேர்வுகள்', desc: 'தீவிர ஆர்வலர்களுக்கான உயர் சிரம பயிற்சி தேர்வுகள்.', icon: Award, content: 'எலைட் மாதிரித் தேர்வுத் தொடர் உங்கள் புரிதலைச் சவாலுக்கு உட்படுத்தவும், உங்கள் வேகம் மற்றும் துல்லியத்தை மேம்படுத்தவும் வடிவமைக்கப்பட்டுள்ளது. இந்தத் தேர்வுகள் பாட நிபுணர்களால் நிர்வகிக்கப்படுகின்றன மற்றும் UPSC மற்றும் TNPSC தேர்வுகளின் சமீபத்திய போக்குகளைப் பின்பற்றுகின்றன. விரிவான செயல்திறன் பகுப்பாய்வு மற்றும் தரவரிசை கண்காணிப்பு உங்கள் பலம் மற்றும் பலவீனங்களை அடையாளம் காண உதவுகிறது.' },
      { title: 'நேர்காணல் நெறிமுறை', desc: 'இறுதி ஆளுமைத் தேர்வுக்கான மேம்பட்ட உத்திகள்.', icon: MessageSquare, content: 'ஆளுமைத் தேர்வு என்பது ஒரு சிவில் ஊழியராக மாறுவதற்கான பயணத்தின் இறுதித் தடையாகும். எங்கள் நெறிமுறை DAF (விரிவான விண்ணப்பப் படிவம்) பகுப்பாய்வு முதல் ஓய்வுபெற்ற அதிகாரிகளுடனான மாதிரி நேர்காணல்கள் வரை அனைத்தையும் உள்ளடக்கியது. வாரியத்தை நம்பிக்கையுடன் எதிர்கொள்ள உங்களுக்கு உதவ உங்கள் தகவல் தொடர்பு திறன், நெறிமுறை பகுப்பாய்வு மற்றும் சூழ்நிலை விழிப்புணர்வை மேம்படுத்துவதில் நாங்கள் கவனம் செலுத்துகிறோம்.' },
    ]
  }
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notifications' | 'resources' | 'chat'>('dashboard');
  const [language, setLanguage] = useState<'en' | 'ta'>('en');

  const examTrendData = [
    { name: language === 'ta' ? 'ஜன' : 'Jan', applicants: 4000, difficulty: 65 },
    { name: language === 'ta' ? 'பிப்' : 'Feb', applicants: 3000, difficulty: 70 },
    { name: language === 'ta' ? 'மார்' : 'Mar', applicants: 2000, difficulty: 75 },
    { name: language === 'ta' ? 'ஏப்' : 'Apr', applicants: 2780, difficulty: 80 },
    { name: language === 'ta' ? 'மே' : 'May', applicants: 1890, difficulty: 85 },
    { name: language === 'ta' ? 'ஜூன்' : 'Jun', applicants: 2390, difficulty: 90 },
  ];
  const [news, setNews] = useState<string>('');
  const [loadingNews, setLoadingNews] = useState(true);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'notification' | 'resource' | 'link' | 'legal', data: any } | null>(null);
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    setChatMessages([
      { role: 'assistant', content: t.welcome }
    ]);
  }, [language]);

  useEffect(() => {
    const tabLabels: Record<string, string> = {
      dashboard: t.intelligenceDashboard,
      notifications: t.liveExamFeed,
      resources: t.studyVault,
      chat: t.aiStrategist
    };
    document.title = `GovExam Elite | ${tabLabels[activeTab] || t.premiumExamHub}`;
  }, [activeTab, language]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingNews(true);
      setLoadingNotifications(true);
      
      try {
        // Fetch once and reuse
        const notifications = await fetchLiveNotifications(language);
        
        // Generate report from the same data
        let report = language === 'ta' ? "### சமீபத்திய தேர்வு செய்திகள்\n\n" : "### Latest Exam Intelligence\n\n";
        notifications.slice(0, 5).forEach(n => {
          report += `- **${n.source}**: ${n.title} (${n.date})\n  [${language === 'ta' ? 'மேலும் அறிய' : 'Read More'}](${n.link})\n\n`;
        });

        setNews(report);
        setLiveNotifications(notifications);
      } catch (error) {
        console.error("Critical error loading initial data:", error);
      } finally {
        setLoadingNews(false);
        setLoadingNotifications(false);
      }
    };
    loadInitialData();
  }, [language]);

  const handleLinkClick = async (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedItem({ type: 'link', data: { url, content: '' } });
    setAnalyzingUrl(true);
    
    const content = await analyzeUrlContent(url, language);
    
    setSelectedItem({ type: 'link', data: { url, content } });
    setAnalyzingUrl(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsSending(true);

    const response = await chatWithAssistant(userMsg, [], language);
    setChatMessages(prev => [...prev, { role: 'assistant', content: response || "I encountered an error. Please try again." }]);
    setIsSending(false);
  };

  const tabs = [
    { id: 'dashboard', label: t.intelligence, icon: TrendingUp },
    { id: 'notifications', label: t.liveFeed, icon: Bell },
    { id: 'resources', label: t.vault, icon: BookOpen },
    { id: 'chat', label: t.aiStrategist, icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500/30">
      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-xl border-b border-white/10 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Target size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">GovExam <span className="text-emerald-500">Elite</span></h1>
            <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">{t.intelligencePlatform}</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === tab.id 
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setLanguage('en')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                language === 'en' ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"
              )}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('ta')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                language === 'ta' ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"
              )}
            >
              தமிழ்
            </button>
          </div>
          <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            <Globe size={14} /> {t.globalAccess}
          </button>
          <button 
            className="md:hidden p-2 text-white/60"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-black z-[60] md:hidden p-8 pt-24"
          >
            <div className="flex flex-col gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full px-6 py-5 rounded-2xl text-left font-black uppercase tracking-widest flex items-center gap-4 text-lg",
                    activeTab === tab.id 
                      ? "bg-emerald-500 text-black" 
                      : "text-white/60 border border-white/10"
                  )}
                >
                  <tab.icon size={24} />
                  {tab.label}
                </button>
              ))}
            </div>
            
            <AdBanner slot="notifications_bottom" className="mt-12" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Bento Grid Layout */}
              
              {/* Main Hero Card */}
              <div className="lg:col-span-8 bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                      <Zap size={12} className="text-yellow-400" /> {t.premiumAccess}
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6 uppercase italic">
                      {t.masterFuture.split(' ').slice(0, 2).join(' ')} <br />
                      <span className="text-emerald-300">{t.masterFuture.split(' ').slice(2, 3).join(' ')}</span> {t.masterFuture.split(' ').slice(3).join(' ')}
                    </h2>
                    <p className="text-emerald-100/70 max-w-md text-lg font-medium leading-relaxed mb-8">
                      {t.platformDesc}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-3"
                    >
                      {t.initializeAi} <ChevronRight size={20} />
                    </button>
                    <button 
                      onClick={() => setActiveTab('resources')}
                      className="bg-black/20 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black/40 transition-all"
                    >
                      {t.viewVault}
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse" />
                <div className="absolute bottom-0 right-0 p-10 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Award size={200} strokeWidth={1} />
                </div>
              </div>

              <div className="lg:col-span-12">
                <AdBanner slot="hero_bottom" className="h-32" />
              </div>

              {/* Stats Card */}
              <div className="lg:col-span-4 bg-[#151515] rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">{t.marketTrends}</h3>
                    <BarChart3 size={20} className="text-emerald-500" />
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={examTrendData}>
                        <defs>
                          <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="applicants" stroke="#10b981" fillOpacity={1} fill="url(#colorApp)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-3xl font-black tracking-tighter italic">+24% <span className="text-sm font-bold text-white/40 not-italic uppercase tracking-widest ml-2">{t.competitionRise}</span></p>
                  <p className="text-xs text-white/40 mt-2 font-medium">{language === 'ta' ? 'சமீபத்திய அரசு வேலைவாய்ப்பு தரவுகளிலிருந்து தொகுக்கப்பட்டது.' : 'Aggregated from latest government recruitment data.'}</p>
                </div>
              </div>

              {/* News Feed - Full Width Editorial */}
              <div className="lg:col-span-12 bg-white text-black rounded-[2.5rem] p-10 md:p-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping" />
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">{t.reportTitle}</span>
                    </div>
                    <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                      {t.dailyStrategist.split(' ').slice(0, 2).join(' ')} <br />
                      <span className="text-gray-400">{t.dailyStrategist.split(' ').slice(2).join(' ')}</span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.lastUpdated}</p>
                    <p className="text-xl font-black italic">{new Date().toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2">
                    {loadingNews ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-6">
                        <div className="relative">
                          <Loader2 className="animate-spin text-emerald-600" size={48} />
                          <div className="absolute inset-0 blur-xl bg-emerald-600/20 animate-pulse" />
                        </div>
                        <p className="text-lg font-black uppercase tracking-widest text-gray-300">{t.synthesizing}</p>
                      </div>
                    ) : (
                      <div className="prose prose-lg prose-emerald max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:italic prose-p:text-gray-600 prose-p:leading-relaxed">
                        <Markdown
                          components={{
                            a: ({ node, ...props }) => (
                              <a 
                                {...props} 
                                onClick={(e) => handleLinkClick(props.href || '', e)}
                                className="text-emerald-600 font-bold hover:underline cursor-pointer"
                              />
                            )
                          }}
                        >
                          {news}
                        </Markdown>
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:col-span-12 my-12">
                    <AdBanner slot="news_feed_mid" className="h-28" />
                  </div>

                  <div className="space-y-8">
                    <AdBanner slot="news_sidebar_top" />
                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                      <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6">{t.criticalAlerts}</h4>
                      <div className="space-y-6">
                        {t.alerts.map((alert, i) => (
                          <div key={i} className="group cursor-pointer">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{alert.type}</span>
                              <span className="text-[10px] font-bold text-gray-400">{alert.date}</span>
                            </div>
                            <h5 className="font-black uppercase tracking-tight text-lg group-hover:text-emerald-600 transition-colors">{alert.title}</h5>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-8 bg-emerald-600 rounded-3xl text-white shadow-2xl shadow-emerald-600/20">
                      <ShieldCheck size={32} className="mb-4" />
                      <h4 className="text-xl font-black uppercase tracking-tighter italic mb-2">{t.verifiedContent}</h4>
                      <p className="text-sm text-emerald-100 font-medium leading-relaxed">
                        {t.verifiedDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto h-[calc(100vh-16rem)] bg-[#151515] rounded-[3rem] border border-white/5 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
                    <MessageSquare size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter italic">{t.aiStrategist} <span className="text-emerald-500">v2.0</span></h3>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.systemOnline}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-emerald-500 text-black rounded-tr-none font-bold" 
                        : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none"
                    )}>
                      <div className={cn(
                        "prose prose-sm max-w-none",
                        msg.role === 'user' ? "prose-p:text-black" : "prose-invert"
                      )}>
                        <Markdown
                          components={{
                            a: ({ node, ...props }) => (
                              <a 
                                {...props} 
                                onClick={(e) => handleLinkClick(props.href || '', e)}
                                className={cn(
                                  "font-bold hover:underline cursor-pointer",
                                  msg.role === 'user' ? "text-black" : "text-emerald-500"
                                )}
                              />
                            )
                          }}
                        >
                          {msg.content}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] rounded-tl-none flex items-center gap-4">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-white/40 font-black uppercase tracking-widest">{t.strategizing}</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-8 border-t border-white/5 bg-black/40">
                <div className="relative group">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={t.chatPlaceholder}
                    className="w-full pl-8 pr-16 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white/10 transition-all text-sm font-medium"
                  />
                  <button 
                    type="submit"
                    disabled={isSending || !inputMessage.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-emerald-500 text-black rounded-xl hover:scale-105 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  >
                    <Send size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-5xl font-black uppercase tracking-tighter italic">{t.liveIntelligence.split(' ')[0]} <span className="text-emerald-500">{t.liveIntelligence.split(' ')[1]}</span></h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{t.realTimeFeed}</span>
                </div>
              </div>
              
            <div className="space-y-6">
              {loadingNotifications ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-emerald-500" size={32} />
                  <p className="text-xs font-black uppercase tracking-widest text-white/20">{t.synthesizing}</p>
                </div>
              ) : liveNotifications.length > 0 ? (
                liveNotifications.map((notif, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedItem({ type: 'notification', data: notif })}
                    className="bg-[#151515] p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group flex items-center gap-8"
                  >
                    <div className={cn("w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0", notif.color)}>
                      <Bell size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5", notif.color)}>
                          {notif.type}
                        </span>
                        <span className="text-xs font-bold text-white/20 uppercase tracking-widest">{notif.time}</span>
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight group-hover:text-emerald-500 transition-colors">{notif.title}</h4>
                    </div>
                    <ChevronRight className="text-white/10 group-hover:text-emerald-500 transition-all" size={24} />
                  </div>
                ))
              ) : (
                <p className="text-center text-white/20 py-10 uppercase tracking-widest font-bold">No live alerts at this moment</p>
              )}
            </div>
            <AdBanner slot="notifications_bottom" className="mt-12" />
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {t.resources.map((res, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedItem({ type: 'resource', data: res })}
                  className="bg-[#151515] p-10 rounded-[3rem] border border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer flex flex-col justify-between h-80"
                >
                  <div>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 group-hover:bg-emerald-600 group-hover:text-black transition-all shadow-lg">
                      <res.icon size={28} />
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tighter italic mb-3">{res.title}</h4>
                    <p className="text-sm text-white/40 font-medium leading-relaxed">{res.desc}</p>
                  </div>
                  <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] group-hover:gap-3 transition-all">
                    {t.accessIntelligence} <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          <div className="mt-20">
            <AdBanner slot="content_bottom_wide" className="h-40" />
          </div>
        </AnimatePresence>
      </main>

      {/* Detail View Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#151515] w-full max-w-4xl max-h-[90vh] rounded-[3rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black">
                    {selectedItem.type === 'notification' ? <Bell size={24} /> : 
                     selectedItem.type === 'resource' ? <BookOpen size={24} /> : 
                     selectedItem.type === 'legal' ? <ShieldCheck size={24} /> :
                     <Globe size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">
                      {selectedItem.data.title || 'Link Intelligence'}
                    </h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {selectedItem.type} Detail
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/60 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10">
                <AdBanner slot="modal_top" className="mb-8" />
                
                {selectedItem.type === 'link' && analyzingUrl ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <Loader2 className="animate-spin text-emerald-500" size={48} />
                    <p className="text-lg font-black uppercase tracking-widest text-white/40">Analyzing URL Intelligence...</p>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-emerald max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:italic prose-p:text-white/60 prose-p:leading-relaxed">
                    <Markdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a 
                            {...props} 
                            onClick={(e) => handleLinkClick(props.href || '', e)}
                            className="text-emerald-500 font-bold hover:underline cursor-pointer"
                          />
                        )
                      }}
                    >
                      {selectedItem.data.content || selectedItem.data.desc || ''}
                    </Markdown>
                    {selectedItem.type === 'link' && (
                      <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest">{t.source}: {selectedItem.data.url}</p>
                        <a 
                          href={selectedItem.data.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest hover:gap-3 transition-all"
                        >
                          {t.openOriginal} <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto px-6 mb-16">
        <AdBanner slot="footer_top" className="h-24" />
      </div>

      {/* Premium Footer */}
      <footer className="border-t border-white/10 bg-black py-16 px-6">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Target size={32} className="text-emerald-500" />
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">GovExam <span className="text-emerald-500">Elite</span></h2>
            </div>
            <p className="text-white/40 max-w-sm text-sm font-medium leading-relaxed">
              {t.platformDesc}
            </p>
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">{t.navigation}</h5>
            <div className="flex flex-col gap-3">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className="text-sm font-bold text-white/40 hover:text-emerald-500 transition-colors text-left uppercase tracking-widest">{tab.label}</button>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">{t.legal}</h5>
            <div className="flex flex-col gap-3 text-sm font-bold text-white/40 uppercase tracking-widest">
              <button onClick={() => setSelectedItem({ type: 'legal', data: { title: language === 'ta' ? 'தனியுரிமை நெறிமுறை' : 'Privacy Protocol', content: PRIVACY_POLICY } })} className="hover:text-emerald-500 transition-colors text-left">{language === 'ta' ? 'தனியுரிமை நெறிமுறை' : 'Privacy Protocol'}</button>
              <button onClick={() => setSelectedItem({ type: 'legal', data: { title: language === 'ta' ? 'சேவை விதிமுறைகள்' : 'Terms of Service', content: TERMS_OF_SERVICE } })} className="hover:text-emerald-500 transition-colors text-left">{language === 'ta' ? 'சேவை விதிமுறைகள்' : 'Terms of Service'}</button>
              <button onClick={() => setSelectedItem({ type: 'legal', data: { title: language === 'ta' ? 'விளம்பர வெளிப்பாடு' : 'Ad Disclosure', content: AD_DISCLOSURE } })} className="hover:text-emerald-500 transition-colors text-left">{language === 'ta' ? 'விளம்பர வெளிப்பாடு' : 'Ad Disclosure'}</button>
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">© 2024 GovExam Elite Intelligence. {t.rights}</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/20 hover:text-emerald-500 transition-colors"><Globe size={20} /></a>
            <a href="#" className="text-white/20 hover:text-emerald-500 transition-colors"><ShieldCheck size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
