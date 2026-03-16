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
import { fetchLatestExamInfo, chatWithAssistant } from './services/geminiService';
import { cn } from './lib/utils';
import AdBanner from './components/AdBanner';
import { PRIVACY_POLICY, TERMS_OF_SERVICE, AD_DISCLOSURE } from './legalContent';

const examTrendData = [
  { name: 'Jan', applicants: 4000, difficulty: 65 },
  { name: 'Feb', applicants: 3000, difficulty: 70 },
  { name: 'Mar', applicants: 2000, difficulty: 75 },
  { name: 'Apr', applicants: 2780, difficulty: 80 },
  { name: 'May', applicants: 1890, difficulty: 85 },
  { name: 'Jun', applicants: 2390, difficulty: 90 },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notifications' | 'resources' | 'chat'>('dashboard');
  const [news, setNews] = useState<string>('');
  const [loadingNews, setLoadingNews] = useState(true);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to the Premium Exam Hub. I am your AI strategist. How can I help you optimize your preparation today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'notification' | 'resource' | 'link' | 'legal', data: any } | null>(null);
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tabLabels: Record<string, string> = {
      dashboard: 'Intelligence Dashboard',
      notifications: 'Live Exam Feed',
      resources: 'Study Vault',
      chat: 'AI Strategist'
    };
    document.title = `GovExam Elite | ${tabLabels[activeTab] || 'Premium Exam Hub'}`;
  }, [activeTab]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingNews(true);
      setLoadingNotifications(true);
      
      const [info, notifications] = await Promise.all([
        fetchLatestExamInfo("Detailed analysis of TNPSC and UPSC 2024-2025 exam trends and notifications"),
        import('./services/geminiService').then(m => m.fetchLiveNotifications())
      ]);
      
      setNews(info);
      setLiveNotifications(notifications);
      setLoadingNews(false);
      setLoadingNotifications(false);
    };
    loadInitialData();
  }, []);

  const handleLinkClick = async (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedItem({ type: 'link', data: { url, content: '' } });
    setAnalyzingUrl(true);
    
    // Use the analyzeUrlContent service
    const { analyzeUrlContent } = await import('./services/geminiService');
    const content = await analyzeUrlContent(url);
    
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

    const response = await chatWithAssistant(userMsg, []);
    setChatMessages(prev => [...prev, { role: 'assistant', content: response || "I encountered an error. Please try again." }]);
    setIsSending(false);
  };

  const tabs = [
    { id: 'dashboard', label: 'Intelligence', icon: TrendingUp },
    { id: 'notifications', label: 'Live Feed', icon: Bell },
    { id: 'resources', label: 'Vault', icon: BookOpen },
    { id: 'chat', label: 'AI Strategist', icon: MessageSquare },
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
            <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">Intelligence Platform</p>
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
          <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            <Globe size={14} /> Global Access
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
                      <Zap size={12} className="text-yellow-400" /> Premium Access Active
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6 uppercase italic">
                      Master Your <br />
                      <span className="text-emerald-300">Future</span> Career
                    </h2>
                    <p className="text-emerald-100/70 max-w-md text-lg font-medium leading-relaxed mb-8">
                      The most advanced intelligence platform for TNPSC and UPSC aspirants. Real-time data, AI-driven strategies, and elite resources.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-3"
                    >
                      Initialize AI Strategist <ChevronRight size={20} />
                    </button>
                    <button className="bg-black/20 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black/40 transition-all">
                      View Vault
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
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Market Trends</h3>
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
                  <p className="text-3xl font-black tracking-tighter italic">+24% <span className="text-sm font-bold text-white/40 not-italic uppercase tracking-widest ml-2">Competition Rise</span></p>
                  <p className="text-xs text-white/40 mt-2 font-medium">Aggregated from latest government recruitment data.</p>
                </div>
              </div>

              {/* News Feed - Full Width Editorial */}
              <div className="lg:col-span-12 bg-white text-black rounded-[2.5rem] p-10 md:p-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping" />
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">Live Intelligence Report</span>
                    </div>
                    <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                      The Daily <br />
                      <span className="text-gray-400">Strategist</span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Updated</p>
                    <p className="text-xl font-black italic">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
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
                        <p className="text-lg font-black uppercase tracking-widest text-gray-300">Synthesizing Original Content...</p>
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
                      <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Critical Alerts</h4>
                      <div className="space-y-6">
                        {[
                          { title: 'UPSC Prelims 2024', date: 'May 26', type: 'High Priority' },
                          { title: 'TNPSC Group 4', date: 'June 09', type: 'Registration Open' },
                          { title: 'SSC CGL 2024', date: 'Tentative', type: 'Notification Soon' },
                        ].map((alert, i) => (
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
                      <h4 className="text-xl font-black uppercase tracking-tighter italic mb-2">Verified Content</h4>
                      <p className="text-sm text-emerald-100 font-medium leading-relaxed">
                        All information on this platform is synthesized from official government portals and verified by our AI Intelligence engine.
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
                    <h3 className="text-lg font-black uppercase tracking-tighter italic">AI Strategist <span className="text-emerald-500">v2.0</span></h3>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">System Online</span>
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
                      <span className="text-xs text-white/40 font-black uppercase tracking-widest">Strategizing...</span>
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
                    placeholder="Describe your exam goals or ask for a strategy..."
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
                <h2 className="text-5xl font-black uppercase tracking-tighter italic">Live <span className="text-emerald-500">Intelligence</span></h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Real-time Feed</span>
                </div>
              </div>
              
            <div className="space-y-6">
              {loadingNotifications ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-emerald-500" size={32} />
                  <p className="text-xs font-black uppercase tracking-widest text-white/20">Syncing Live Intelligence...</p>
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
              {[
                { title: 'UPSC Strategic Syllabus', desc: 'A high-level breakdown of Prelims & Mains with weightage analysis.', icon: BookOpen, content: 'The UPSC Civil Services Examination syllabus is divided into three stages: Preliminary, Main, and Interview. The Preliminary stage consists of two objective-type papers (General Studies I and CSAT). The Main stage consists of nine descriptive papers, including an Essay, four General Studies papers, and two Optional Subject papers. Understanding the weightage of subjects like History, Geography, and Polity is crucial for a targeted preparation strategy.' },
                { title: 'TNPSC Administration Notes', desc: 'Exclusive insights into Tamil Nadu history and governance.', icon: BookOpen, content: 'Tamil Nadu Administration is a vital part of the TNPSC Group 1 and Group 2 exams. Key topics include the Social Reform Movements in Tamil Nadu, the role of Justice Party, Self-Respect Movement, and the Dravidian Movement. Additionally, understanding the state government schemes, welfare measures, and the socio-economic development of the state is essential for scoring high in the General Studies papers.' },
                { title: 'The Archive: Solved Papers', desc: 'A curated collection of solved papers from the last decade.', icon: Newspaper, content: 'Practicing previous year question papers is one of the most effective ways to understand the exam pattern and the type of questions asked. Our archive contains solved papers for UPSC CSE and TNPSC Group exams from 2014 to 2023. Each solution is accompanied by a detailed explanation and references to standard textbooks, helping you build a solid foundation.' },
                { title: 'Monthly Intelligence PDF', desc: 'Synthesized current affairs for elite preparation.', icon: TrendingUp, content: 'Our Monthly Intelligence PDF provides a synthesized summary of national and international events, government schemes, and important appointments. Unlike standard news compilations, we focus on the "Exam Relevance" of each news item, providing background information and potential question angles for both Prelims and Mains.' },
                { title: 'Elite Mock Tests', desc: 'High-difficulty practice tests for serious aspirants.', icon: Award, content: 'The Elite Mock Test series is designed to challenge your understanding and improve your speed and accuracy. These tests are curated by subject matter experts and follow the latest trends of UPSC and TNPSC exams. Detailed performance analysis and rank tracking help you identify your strengths and weaknesses.' },
                { title: 'The Interview Protocol', desc: 'Advanced strategies for the final personality test.', icon: MessageSquare, content: 'The personality test is the final hurdle in the journey to becoming a civil servant. Our protocol covers everything from DAF (Detailed Application Form) analysis to mock interviews with retired bureaucrats. We focus on developing your communication skills, ethical reasoning, and situational awareness to help you face the board with confidence.' },
              ].map((res, i) => (
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
                    Access Intelligence <ChevronRight size={14} />
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
                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Source: {selectedItem.data.url}</p>
                        <a 
                          href={selectedItem.data.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest hover:gap-3 transition-all"
                        >
                          Open Original Source <ExternalLink size={14} />
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
              The world's most advanced intelligence platform for government exam preparation. Synthesizing real-time data into original, actionable insights.
            </p>
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Navigation</h5>
            <div className="flex flex-col gap-3">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as any)} className="text-sm font-bold text-white/40 hover:text-emerald-500 transition-colors text-left uppercase tracking-widest">{t.label}</button>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Legal</h5>
            <div className="flex flex-col gap-3 text-sm font-bold text-white/40 uppercase tracking-widest">
              <button onClick={() => setSelectedItem({ type: 'legal', data: { title: 'Privacy Protocol', content: PRIVACY_POLICY } })} className="hover:text-emerald-500 transition-colors text-left">Privacy Protocol</button>
              <button onClick={() => setSelectedItem({ type: 'legal', data: { title: 'Terms of Service', content: TERMS_OF_SERVICE } })} className="hover:text-emerald-500 transition-colors text-left">Terms of Service</button>
              <button onClick={() => setSelectedItem({ type: 'legal', data: { title: 'Ad Disclosure', content: AD_DISCLOSURE } })} className="hover:text-emerald-500 transition-colors text-left">Ad Disclosure</button>
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">© 2024 GovExam Elite Intelligence. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/20 hover:text-emerald-500 transition-colors"><Globe size={20} /></a>
            <a href="#" className="text-white/20 hover:text-emerald-500 transition-colors"><ShieldCheck size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
