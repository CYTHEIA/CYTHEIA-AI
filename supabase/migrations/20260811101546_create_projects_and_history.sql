/*
# Create projects and project_versions tables (single-tenant, no auth)

1. New Tables
- `projects`: stores Nextel AI electronics projects with full circuit + code state as JSONB
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `description` (text, nullable)
  - `data` (jsonb, not null) — full project state: components, connections, code, simulation config
  - `thumbnail` (text, nullable) — optional data URL screenshot
  - `is_template` (boolean, default false) — marks starter templates
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- `project_versions`: stores named snapshots of project state for history/restore
  - `id` (uuid, primary key)
  - `project_id` (uuid, FK to projects, cascade delete)
  - `name` (text, not null) — version label
  - `data` (jsonb, not null) — full project state at that point
  - `created_at` (timestamptz)

2. Security
- Enable RLS on both tables.
- Single-tenant (no sign-in): allow anon + authenticated full CRUD since data is intentionally shared/public.
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  thumbnail text,
  is_template boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS project_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_versions" ON project_versions;
CREATE POLICY "anon_select_versions" ON project_versions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_versions" ON project_versions;
CREATE POLICY "anon_insert_versions" ON project_versions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_versions" ON project_versions;
CREATE POLICY "anon_update_versions" ON project_versions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_versions" ON project_versions;
CREATE POLICY "anon_delete_versions" ON project_versions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
