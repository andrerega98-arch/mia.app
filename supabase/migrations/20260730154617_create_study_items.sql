/*
# Create study_items table (single-tenant, no auth)

1. New Tables
- `study_items`
  - `id` (uuid, primary key)
  - `type` (text, not null) — one of: riassunto, schema, spiegazione, quiz
  - `title` (text, not null) — display title
  - `source_text` (text, not null) — the original text the user pasted
  - `content` (text, not null) — the generated result content (stored as plain text / simple markup)
  - `language` (text, not null, default 'it') — output language code
  - `age` (integer, not null, default 16) — target age for reading level
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `study_items`.
- Allow anon + authenticated full CRUD because the data is intentionally shared/public (no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS study_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  source_text text NOT NULL,
  content text NOT NULL,
  language text NOT NULL DEFAULT 'it',
  age integer NOT NULL DEFAULT 16,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE study_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_study_items" ON study_items;
CREATE POLICY "anon_select_study_items" ON study_items FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_study_items" ON study_items;
CREATE POLICY "anon_insert_study_items" ON study_items FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_study_items" ON study_items;
CREATE POLICY "anon_update_study_items" ON study_items FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_study_items" ON study_items;
CREATE POLICY "anon_delete_study_items" ON study_items FOR DELETE
TO anon, authenticated USING (true);
