import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../settings/SettingsContext';
import { Send, Sparkles, AlertCircle } from 'lucide-react';

type Message = { role: 'user' | 'tutor'; text: string };

export default function TutorPage() {
  const { settings, theme } = useSettings();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'tutor', text: 'Ciao! Sono il tuo tutor AI. Scrivimi la tua domanda e ti aiuto a capire qualsiasi argomento.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = theme;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || typing) return;
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setTyping(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tutor-chat`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: trimmed }],
          age: settings.age,
          language: settings.language,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const reply = data?.reply;
      if (!reply || typeof reply !== 'string') throw new Error('Invalid response');

      setMessages((prev) => [...prev, { role: 'tutor', text: reply }]);
    } catch {
      setError('Impossibile contattare il tutor. Riprova.');
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden pb-20">
      <div className="px-5 pt-12 pb-3 bg-white border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: t.primarySoft, color: t.primaryDark }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-800">Tutor AI</h1>
            <p className="text-stone-400 text-xs">Chiedimi qualsiasi cosa</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
              style={
                msg.role === 'user'
                  ? { backgroundColor: t.primary, color: 'white' }
                  : { backgroundColor: 'white', color: '#44403c', border: '1px solid #f5f5f4' }
              }
            >
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 border border-stone-100 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="px-5 pb-2 flex items-center gap-2 text-rose-600 text-xs">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="px-5 py-3 bg-white border-t border-stone-100">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Scrivi la tua domanda..."
            className="flex-1 bg-stone-100 rounded-full px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2"
            style={{ caretColor: t.primary }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || typing}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform disabled:opacity-40"
            style={{ backgroundColor: t.primary }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
