import { useEffect, useState } from 'react';
import { useSettings } from '../settings/SettingsContext';
import { supabase, type StudyItem } from '../lib/supabase';
import { TYPE_LABELS } from '../lib/generate';
import { FileText, Loader2, AlertCircle, ChevronRight, Trash2, ArrowLeft } from 'lucide-react';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}

export default function LibreriaPage() {
  const { theme } = useSettings();
  const [items, setItems] = useState<StudyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StudyItem | null>(null);

  const t = theme;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('study_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setItems((data ?? []) as StudyItem[]);
    } catch {
      setError('Impossibile caricare la libreria.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    try {
      await supabase.from('study_items').delete().eq('id', id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setSelected(null);
    } catch {
      // ignore
    }
  }

  if (selected) {
    return (
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="flex items-center gap-3 px-5 pt-12 pb-4">
          <button
            onClick={() => setSelected(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ backgroundColor: t.primarySoft }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: t.primaryDark }} />
          </button>
          <h1 className="text-lg font-bold text-stone-800 flex-1 truncate">{selected.title}</h1>
          <button
            onClick={() => handleDelete(selected.id)}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ backgroundColor: '#fee2e2' }}
          >
            <Trash2 className="w-5 h-5 text-rose-600" />
          </button>
        </div>

        <div className="px-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 mb-4">
            <p className="text-stone-400 text-xs mb-4">
              {TYPE_LABELS[selected.type]} · {selected.language.toUpperCase()} · {selected.age} anni ·{' '}
              {formatDate(selected.created_at)}
            </p>
            <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
              {selected.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-stone-800">Libreria</h1>
        <p className="text-stone-500 text-sm mt-0.5">I tuoi materiali salvati</p>
      </div>

      <div className="px-5">
        {loading && (
          <div className="flex items-center justify-center py-12 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-rose-600 text-sm py-8 justify-center">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
              style={{ backgroundColor: t.primarySoft, color: t.primaryDark }}
            >
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-stone-500 font-semibold text-sm">Nessun materiale</p>
            <p className="text-stone-400 text-xs mt-1">Crea il tuo primo riassunto dalla scheda Studia</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
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
