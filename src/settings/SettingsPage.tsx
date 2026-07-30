import { useSettings, THEMES, Language } from './SettingsContext';
import { Check, ChevronRight, Palette, Globe, User, Highlighter, X } from 'lucide-react';
import { useState } from 'react';

const LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'it', label: 'Italiano', flag: '🇮🇹' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

type Section = 'menu' | 'language' | 'age' | 'theme' | 'highlight';

export default function SettingsPage({ onClose }: { onClose: () => void }) {
  const { settings, update, theme } = useSettings();
  const [section, setSection] = useState<Section>('menu');

  const t = theme;

  return (
    <div className="absolute inset-0 z-30 bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-stone-100">
        {section !== 'menu' ? (
          <button
            onClick={() => setSection('menu')}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ backgroundColor: t.primarySoft }}
          >
            <ChevronRight className="w-5 h-5 rotate-180" style={{ color: t.primaryDark }} />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ backgroundColor: t.primarySoft }}
          >
            <X className="w-5 h-5" style={{ color: t.primaryDark }} />
          </button>
        )}
        <h1 className="text-lg font-bold text-stone-800">
          {section === 'menu' && 'Impostazioni'}
          {section === 'language' && 'Lingua'}
          {section === 'age' && 'Età'}
          {section === 'theme' && 'Tema'}
          {section === 'highlight' && 'Sottolineatura'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {section === 'menu' && (
          <MenuView settings={settings} setSection={setSection} theme={t} />
        )}
        {section === 'language' && (
          <LanguageView
            current={settings.language}
            onSelect={(lang) => {
              update('language', lang);
              setSection('menu');
            }}
            theme={t}
          />
        )}
        {section === 'age' && (
          <AgeView
            current={settings.age}
            onSave={(age) => {
              update('age', age);
              setSection('menu');
            }}
            theme={t}
          />
        )}
        {section === 'theme' && (
          <ThemeView
            current={settings.themeId}
            onSelect={(id) => {
              update('themeId', id);
              setSection('menu');
            }}
            theme={t}
          />
        )}
        {section === 'highlight' && (
          <HighlightView
            autoHighlight={settings.autoHighlight}
            manualHighlight={settings.manualHighlight}
            onAuto={(v) => update('autoHighlight', v)}
            onManual={(v) => update('manualHighlight', v)}
            theme={t}
          />
        )}
      </div>
    </div>
  );
}

type ThemeT = (typeof THEMES)[number];

function MenuView({
  settings,
  setSection,
  theme,
}: {
  settings: ReturnType<typeof useSettings>['settings'];
  setSection: (s: Section) => void;
  theme: ThemeT;
}) {
  const currentLang = LANGUAGES.find((l) => l.id === settings.language)!;
  return (
    <div className="px-5 pt-5 space-y-2">
      <MenuRow
        icon={<Globe className="w-5 h-5" style={{ color: theme.primaryDark }} />}
        title="Lingua"
        value={`${currentLang.flag} ${currentLang.label}`}
        onClick={() => setSection('language')}
        theme={theme}
      />
      <MenuRow
        icon={<User className="w-5 h-5" style={{ color: theme.primaryDark }} />}
        title="Età"
        value={`${settings.age} anni`}
        onClick={() => setSection('age')}
        theme={theme}
      />
      <MenuRow
        icon={<Palette className="w-5 h-5" style={{ color: theme.primaryDark }} />}
        title="Tema"
        value={THEMES.find((t) => t.id === settings.themeId)?.name ?? ''}
        onClick={() => setSection('theme')}
        theme={theme}
      />
      <MenuRow
        icon={<Highlighter className="w-5 h-5" style={{ color: theme.primaryDark }} />}
        title="Sottolineatura"
        value={settings.autoHighlight || settings.manualHighlight ? 'Attiva' : 'Disattivata'}
        onClick={() => setSection('highlight')}
        theme={theme}
      />
    </div>
  );
}

function MenuRow({
  icon,
  title,
  value,
  onClick,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  onClick: () => void;
  theme: ThemeT;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform border border-stone-100"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: theme.primarySoft }}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-stone-800 font-semibold text-sm">{title}</p>
        <p className="text-stone-400 text-xs mt-0.5">{value}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-stone-300" />
    </button>
  );
}

function LanguageView({
  current,
  onSelect,
  theme,
}: {
  current: Language;
  onSelect: (l: Language) => void;
  theme: ThemeT;
}) {
  return (
    <div className="px-5 pt-5 space-y-2">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.id}
          onClick={() => onSelect(lang.id)}
          className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform border border-stone-100"
        >
          <span className="text-2xl">{lang.flag}</span>
          <span className="flex-1 text-left text-stone-800 font-semibold text-sm">
            {lang.label}
          </span>
          {current === lang.id && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.primary }}
            >
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      ))}
      <p className="text-stone-400 text-xs px-2 pt-3 leading-relaxed">
        La lingua scelta determina la lingua dei riassunti generati, anche per testi non italiani.
      </p>
    </div>
  );
}

function AgeView({
  current,
  onSave,
  theme,
}: {
  current: number;
  onSave: (age: number) => void;
  theme: ThemeT;
}) {
  const [age, setAge] = useState(current);
  const presets = [10, 13, 16, 18, 25, 30, 40, 50];

  return (
    <div className="px-5 pt-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
        <div className="text-center mb-4">
          <span className="text-5xl font-bold" style={{ color: theme.primaryDark }}>
            {age}
          </span>
          <span className="text-stone-400 text-lg ml-1">anni</span>
        </div>
        <input
          type="range"
          min={8}
          max={60}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          className="w-full accent-current"
          style={{ color: theme.primary }}
        />
        <div className="flex justify-between text-stone-400 text-xs mt-1">
          <span>8</span>
          <span>60</span>
        </div>
      </div>

      <p className="text-stone-500 text-sm font-semibold mb-2">Scelta rapida</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setAge(p)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
            style={
              age === p
                ? { backgroundColor: theme.primary, color: 'white' }
                : { backgroundColor: 'white', color: '#44403c', border: '1px solid #e7e5e4' }
            }
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={() => onSave(age)}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm active:scale-95 transition-transform shadow-md"
        style={{ backgroundColor: theme.primary }}
      >
        Salva
      </button>
      <p className="text-stone-400 text-xs px-2 pt-4 leading-relaxed">
        I riassunti verranno adattati al livello di comprensione di un ragazzo di {age} anni.
      </p>
    </div>
  );
}

function ThemeView({
  current,
  onSelect,
  theme,
}: {
  current: string;
  onSelect: (id: string) => void;
  theme: ThemeT;
}) {
  return (
    <div className="px-5 pt-5">
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform border"
            style={{ borderColor: current === t.id ? t.primary : '#f5f5f4' }}
          >
            <div className="flex gap-1.5">
              <span className="w-8 h-8 rounded-full" style={{ backgroundColor: t.primary }} />
              <span className="w-8 h-8 rounded-full" style={{ backgroundColor: t.primaryLight }} />
              <span className="w-8 h-8 rounded-full" style={{ backgroundColor: t.primarySoft }} />
            </div>
            <span className="text-stone-800 font-semibold text-sm">{t.name}</span>
            {current === t.id && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center -mt-1"
                style={{ backgroundColor: t.primary }}
              >
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function HighlightView({
  autoHighlight,
  manualHighlight,
  onAuto,
  onManual,
  theme,
}: {
  autoHighlight: boolean;
  manualHighlight: boolean;
  onAuto: (v: boolean) => void;
  onManual: (v: boolean) => void;
  theme: ThemeT;
}) {
  return (
    <div className="px-5 pt-5 space-y-3">
      <ToggleCard
        title="Sottolineatura automatica"
        description="L'app sottolinea automaticamente i concetti importanti nei riassunti."
        value={autoHighlight}
        onChange={onAuto}
        theme={theme}
      />
      <ToggleCard
        title="Sottolineatura manuale"
        description="Ti permette di sottolineare le parti di testo che ritieni importanti toccandole."
        value={manualHighlight}
        onChange={onManual}
        theme={theme}
      />
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <p className="text-stone-500 text-xs font-semibold mb-2">ANTEPRIMA</p>
        <p className="text-stone-800 text-sm leading-relaxed">
          La fotosintesi è il processo con cui le{' '}
          <span
            style={{
              backgroundColor: theme.primarySoft,
              borderBottom: `2px solid ${theme.primary}`,
              paddingBottom: 1,
            }}
          >
            piante convertono la luce solare
          </span>{' '}
          in energia chimica. Avviene principalmente nelle{' '}
          <span
            style={{
              backgroundColor: theme.primarySoft,
              borderBottom: `2px solid ${theme.primary}`,
              paddingBottom: 1,
            }}
          >
            foglie
          </span>{' '}
          grazie alla clorofillaina.
        </p>
      </div>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  value,
  onChange,
  theme,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  theme: ThemeT;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-stone-800 font-semibold text-sm">{title}</p>
          <p className="text-stone-400 text-xs mt-1 leading-relaxed">{description}</p>
        </div>
        <button
          onClick={() => onChange(!value)}
          className="relative w-12 h-7 rounded-full transition-colors flex-shrink-0"
          style={{ backgroundColor: value ? theme.primary : '#d6d3d1' }}
        >
          <span
            className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform"
            style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
          />
        </button>
      </div>
    </div>
  );
}
