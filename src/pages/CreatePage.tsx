import { useState } from 'react';
import { useSettings } from '../settings/SettingsContext';
import { supabase, type StudyItem, type StudyItemType } from '../lib/supabase';
import { generateContent, generateTitle, TYPE_LABELS } from '../lib/generate';
import { ArrowLeft, Sparkles, FileText, GitBranch, Lightbulb, HelpCircle, Loader2, AlertCircle } from 'lucide-react';

const TOOLS: { type: StudyItemType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'riassunto', label: 'Riassunto', icon: <FileText className="w-6 h-6" />, desc: 'Punti chiave sintetici' },
  { type: 'schema', label: 'Schema', icon: <GitBranch className="w-6 h-6" />, desc: 'Mappa concettuale strutturata' },
  { type: 'spiegazione', label: 'Spiegazione', icon: <Lightbulb className="w-6 h-6" />, desc: 'Semplice come parlarti' },
  { type: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-6 h-6" />, desc: '8 domande di ripasso' },
];

export default function CreatePage({ onBack }: { onBack: () => void }) {
  const { settings, theme } = useSettings();
  const [selectedType, setSelectedType] = useState<StudyItemType | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StudyItem | null>(null);

  const t = theme;

  async function handleGenerate() {
    if (!selectedType || text.trim().length < 20) return;
    setLoading(true);
    setError(null);
    try {
      const content = generateContent({
        type: selectedType,
        text: text.trim(),
        language: settings.language,
        age: settings.age,
      });
      const title = generateTitle(text.trim(), selectedType);

      const { data, error: insertError } = await supabase
        .from('study_items')
        .insert({
          type: selectedType,
          title,
          source_text: text.trim(),
          content,
          language: settings.language,
          age: settings.age,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setResult(data as StudyItem);
    } catch {
      setError('Impossibile salvare il materiale. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSelectedType(null);
    setText('');
    setResult(null);
    setError(null);
  }

  // ---- Result view ----
  if (result) {
    return (
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="flex items-center gap-3 px-5 pt-12 pb-4">
          <button
            onClick={reset}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ backgroundColor: t.primarySoft }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: t.primaryDark }} />
          </button>
          <h1 className="text-lg font-bold text-stone-800">{TYPE_LABELS[result.type]}</h1>
        </div>

        <div className="px-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
            <p className="text-stone-800 font-semibold text-sm mb-1">{result.title}</p>
            <p className="text-stone-400 text-xs mb-4">
              {TYPE_LABELS[result.type]} · {result.language.toUpperCase()} · {result.age} anni
            </p>
            <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
              {result.content}
            </div>
          </div>
          <button
            onClick={reset}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm active:scale-95 transition-transform shadow-md"
            style={{ backgroundColor: t.primary }}
          >
            Crea un altro materiale
          </button>
        </div>
      </div>
    );
  }

  // ---- Input view ----
  if (selectedType) {
    return (
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="flex items-center gap-3 px-5 pt-12 pb-4">
          <button
            onClick={() => setSelectedType(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ backgroundColor: t.primarySoft }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: t.primaryDark }} />
          </button>
          <h1 className="text-lg font-bold text-stone-800">{TYPE_LABELS[selectedType]}</h1>
        </div>

        <div className="px-5">
          <p className="text-stone-500 text-sm mb-3">
            Incolla il testo da cui vuoi generare il {TYPE_LABELS[selectedType].toLowerCase()}.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Incolla qui il testo..."
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-stone-100 text-stone-800 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2"
            style={{ minHeight: 200, caretColor: t.primary }}
            rows={8}
          />
          <p className="text-stone-400 text-xs mt-1.5">
            Lingua: {settings.language.toUpperCase()} · Livello: {settings.age} anni
          </p>

          {error && (
            <div className="flex items-center gap-2 mt-3 text-rose-600 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={text.trim().length < 20 || loading}
            className="w-full mt-4 py-3.5 rounded-xl text-white font-semibold text-sm active:scale-95 transition-transform shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ backgroundColor: t.primary }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generazione...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Genera {TYPE_LABELS[selectedType].toLowerCase()}
              </>
            )}
          </button>
          {text.trim().length < 20 && text.length > 0 && (
            <p className="text-stone-400 text-xs mt-2 text-center">
              Scrivi almeno 20 caratteri
            </p>
          )}
        </div>
      </div>
    );
  }

  // ---- Tool selection view ----
  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ backgroundColor: t.primarySoft }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: t.primaryDark }} />
        </button>
        <h1 className="text-lg font-bold text-stone-800">Cosa vuoi creare?</h1>
      </div>

      <div className="px-5">
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map((tool) => (
            <button
              key={tool.type}
              onClick={() => setSelectedType(tool.type)}
              className="bg-white rounded-2xl p-4 flex flex-col gap-3 text-left shadow-sm active:scale-95 transition-transform border border-stone-100"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: t.primarySoft, color: t.primaryDark }}
              >
                {tool.icon}
              </div>
              <div>
                <p className="text-stone-800 font-semibold text-sm">{tool.label}</p>
                <p className="text-stone-400 text-xs mt-0.5 leading-snug">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
