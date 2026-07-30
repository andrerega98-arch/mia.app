import type { StudyItemType } from './supabase';

type GenerateParams = {
  type: StudyItemType;
  text: string;
  language: string;
  age: number;
};

const LANG_LABEL: Record<string, string> = {
  it: 'italiano',
  en: 'English',
  es: 'español',
  fr: 'français',
  de: 'Deutsch',
};

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateTitle(text: string, type: StudyItemType): string {
  const first = splitSentences(text)[0] ?? text.slice(0, 60);
  const base = first.length > 50 ? first.slice(0, 50) + '...' : first;
  const prefix: Record<StudyItemType, string> = {
    riassunto: 'Riassunto: ',
    schema: 'Schema: ',
    spiegazione: 'Spiegazione: ',
    quiz: 'Quiz: ',
  };
  return prefix[type] + titleCase(base);
}

export function generateContent({ type, text, language, age }: GenerateParams): string {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return text;

  const langLabel = LANG_LABEL[language] ?? 'italiano';
  const ageNote =
    age <= 12
      ? 'Linguaggio semplice e adatto a bambini.'
      : age <= 18
        ? 'Linguaggio chiaro per studenti.'
        : 'Linguaggio dettagliato e professionale.';

  if (type === 'riassunto') {
    const picked = sentences.slice(0, Math.min(5, Math.ceil(sentences.length / 2)));
    return `Punti chiave (${langLabel}, ${age} anni):\n${ageNote}\n\n${picked
      .map((s, i) => `${i + 1}. ${s}`)
      .join('\n')}`;
  }

  if (type === 'schema') {
    const picked = sentences.slice(0, Math.min(6, sentences.length));
    return `Schema concettuale (${langLabel}):\n\n${picked
      .map((s, i) => {
        const indent = i % 2 === 0 ? '■ ' : '  → ';
        return indent + s;
      })
      .join('\n')}`;
  }

  if (type === 'spiegazione') {
    const picked = sentences.slice(0, Math.min(4, sentences.length));
    return `Spiegazione semplice (${langLabel}, ${age} anni):\n${ageNote}\n\n${picked
      .map((s) => s)
      .join('\n\n')}`;
  }

  // quiz
  const picked = sentences.slice(0, Math.min(8, sentences.length));
  return `Quiz di ripasso (${langLabel}):\n\n${picked
    .map(
      (s, i) =>
        `Domanda ${i + 1}: ${s.replace(/[.!?]$/, '')}?\n  a) Opzione A\n  b) Opzione B\n  c) Opzione C\n  ✓ Risposta corretta: a`,
    )
    .join('\n\n')}`;
}

export const TYPE_LABELS: Record<StudyItemType, string> = {
  riassunto: 'Riassunto',
  schema: 'Schema',
  spiegazione: 'Spiegazione',
  quiz: 'Quiz',
};
