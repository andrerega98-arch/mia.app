import { useState } from 'react';
import {
  Home,
  Sparkles,
  BookMarked,
  MessageCircle,
  Rocket,
  FileText,
  GitBranch,
  Lightbulb,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Settings as SettingsIcon,
} from 'lucide-react';
import { SettingsProvider, useSettings } from './settings/SettingsContext';
import SettingsPage from './settings/SettingsPage';
import CreatePage from './pages/CreatePage';
import LibreriaPage from './pages/LibreriaPage';
import TutorPage from './pages/TutorPage';
import { supabase, type StudyItem } from './lib/supabase';
import { TYPE_LABELS } from './lib/generate';
import { useEffect } from 'react';

type Tab = 'home' | 'studia' | 'libreria' | 'tutor';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}

function HomePage({
  onOpenSettings,
  onOpenCreate,
  onOpenItem,
}: {
  onOpenSettings: () => void;
  onOpenCreate: () => void;
  onOpenItem: (item: StudyItem) => void;
}) {
  const { theme } = useSettings();
  const [recent, setRecent] = useState<StudyItem[]>([]);
  const t = theme;

  useEffect(() => {
    supabase
      .from('study_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setRecent(data as StudyItem[]);
      });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            Ciao! <span>👋</span>
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">Pronto a studiare senza stress?</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
            style={{ backgroundColor: t.primarySoft }}
          >
            <SettingsIcon className="w-5 h-5" style={{ color: t.primaryDark }} />
          </button>
          <button
            onClick={onOpenCreate}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
            style={{ backgroundColor: t.primary }}
          >
            <Rocket className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="mx-5 rounded-2xl overflow-hidden relative mb-6" style={{ minHeight: 200 }}>
        <img src="/image-1.jpeg" alt="Studia" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ backgroundColor: t.primaryDark, opacity: 0.6 }} />
        <div className="relative z-10 p-5 flex flex-col h-full" style={{ minHeight: 200 }}>
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full w-fit mb-3">
            <span>✦</span> 100% Gratuito
          </span>
          <h2 className="text-white text-xl font-bold leading-snug mb-5">
            Riassunti, schemi e<br />spiegazioni con l'AI
          </h2>
          <button
            onClick={onOpenCreate}
            className="flex items-center justify-center gap-2 text-white font-semibold py-3 px-5 rounded-xl text-sm active:scale-95 transition-all"
            style={{ backgroundColor: t.primary }}
          >
            Nuova sessione <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-5 mb-6">
        <h2 className="text-lg font-bold text-stone-800 mb-3">Cosa vuoi creare?</h2>
        <div className="grid grid-cols-2 gap-3">
          <ToolCard icon={<FileText className="w-6 h-6" />} title="Riassunto" subtitle="Punti chiave sintetici" theme={t} onClick={onOpenCreate} />
          <ToolCard icon={<GitBranch className="w-6 h-6" />} title="Schema" subtitle="Mappa concettuale strutturata" theme={t} onClick={onOpenCreate} />
          <ToolCard icon={<Lightbulb className="w-6 h-6" />} title="Spiegazione" subtitle="Semplice come parlarti" theme={t} onClick={onOpenCreate} />
          <ToolCard icon={<HelpCircle className="w-6 h-6" />} title="Quiz" subtitle="8 domande di ripasso" theme={t} onClick={onOpenCreate} />
        </div>
      </div>

      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-stone-800">Riprendi a studiare</h2>
        </div>
        {recent.length === 0 ? (
          <p className="text-stone-400 text-xs">Nessun materiale recente. Creane uno nuovo!</p>
        ) : (
          <div className="space-y-2">
            {recent.map((item) => (
              <button
                key={item.id}
                onClick={() => onOpenItem(item)}
                className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm active:scale-95 transition-transform border border-stone-100"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: t.primarySoft, color: t.primaryDark }}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-stone-800 font-semibold text-sm truncate">{item.title}</p>
                  <p className="text-stone-400 text-xs mt-0.5">
                    {TYPE_LABELS[item.type]} · {formatDate(item.created_at)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCard({
  icon,
  title,
  subtitle,
  theme,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  theme: ReturnType<typeof useSettings>['theme'];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 flex flex-col gap-3 text-left shadow-sm active:scale-95 transition-transform border border-stone-100"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: theme.primarySoft, color: theme.primaryDark }}
      >
        {icon}
      </div>
      <div>
        <p className="text-stone-800 font-semibold text-sm">{title}</p>
        <p className="text-stone-400 text-xs mt-0.5 leading-snug">{subtitle}</p>
      </div>
    </button>
  );
}

function AppInner() {
  const { theme } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showSettings, setShowSettings] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const t = theme;

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      <div
        className="relative bg-stone-50 flex flex-col overflow-hidden"
        style={{ width: 390, minHeight: '100dvh', maxHeight: '100dvh' }}
      >
        {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
        {showCreate && <CreatePage onBack={() => setShowCreate(false)} />}

        {!showSettings && !showCreate && (
          <>
            {activeTab === 'home' && (
              <HomePage
                onOpenSettings={() => setShowSettings(true)}
                onOpenCreate={() => setShowCreate(true)}
                onOpenItem={() => setActiveTab('libreria')}
              />
            )}
            {activeTab === 'studia' && <CreatePage onBack={() => setActiveTab('home')} />}
            {activeTab === 'libreria' && <LibreriaPage />}
            {activeTab === 'tutor' && <TutorPage />}
          </>
        )}

        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-100 flex items-center px-2 pt-2 pb-6 z-20">
          <NavItem icon={<Home className="w-5 h-5" />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} activeColor={t.primaryDark} />
          <NavItem icon={<Sparkles className="w-5 h-5" />} label="Studia" active={activeTab === 'studia'} onClick={() => setActiveTab('studia')} activeColor={t.primaryDark} />
          <NavItem icon={<BookMarked className="w-5 h-5" />} label="Libreria" active={activeTab === 'libreria'} onClick={() => setActiveTab('libreria')} activeColor={t.primaryDark} />
          <NavItem icon={<MessageCircle className="w-5 h-5" />} label="Tutor" active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} activeColor={t.primaryDark} />
        </nav>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  activeColor,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  activeColor: string;
}) {
  return (
    <button onClick={onClick} className="flex-1 flex flex-col items-center gap-1 py-1 transition-colors">
      <span style={{ color: active ? activeColor : '#a8a29e' }}>{icon}</span>
      <span className="text-xs font-medium" style={{ color: active ? activeColor : '#a8a29e' }}>
        {label}
      </span>
    </button>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  );
}
