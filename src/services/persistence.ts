import { supabase } from '@/lib/supabase';
import type { Project, ProjectData, ProjectVersion } from '@/types';

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_template', false)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapDbProject);
}

export async function fetchTemplates(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_template', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapDbProject);
}

export async function fetchProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapDbProject(data) : null;
}

export async function createProject(name: string, description: string, data: ProjectData): Promise<Project> {
  const { data: row, error } = await supabase
    .from('projects')
    .insert({ name, description, data: data as any, is_template: false })
    .select()
    .single();
  if (error) throw error;
  return mapDbProject(row);
}

export async function updateProject(id: string, updates: { name?: string; description?: string; data?: ProjectData; thumbnail?: string }): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.data !== undefined && { data: updates.data as any }),
      ...(updates.thumbnail !== undefined && { thumbnail: updates.thumbnail }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateProject(id: string): Promise<Project | null> {
  const project = await fetchProject(id);
  if (!project) return null;
  return createProject(`${project.name} (Copy)`, project.description || '', project.data);
}

export async function fetchVersions(projectId: string): Promise<ProjectVersion[]> {
  const { data, error } = await supabase
    .from('project_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((v: any) => ({
    id: v.id,
    projectId: v.project_id,
    name: v.name,
    data: v.data,
    createdAt: v.created_at,
  }));
}

export async function createVersion(projectId: string, name: string, data: ProjectData): Promise<ProjectVersion> {
  const { data: row, error } = await supabase
    .from('project_versions')
    .insert({ project_id: projectId, name, data: data as any })
    .select()
    .single();
  if (error) throw error;
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    data: row.data,
    createdAt: row.created_at,
  };
}

export async function ensureTemplates(): Promise<void> {
  const existing = await fetchTemplates();
  if (existing.length > 0) return;

  const { TEMPLATES } = await import('@/templates');
  for (const tpl of TEMPLATES) {
    await supabase.from('projects').insert({
      name: tpl.name,
      description: tpl.description,
      data: tpl.data as any,
      is_template: true,
    });
  }
}

function mapDbProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    data: row.data as ProjectData,
    isTemplate: row.is_template,
    thumbnail: row.thumbnail,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function exportProject(project: Project): string {
  return JSON.stringify(
    {
      format: 'nextel-ai-project',
      version: '1.0',
      project: {
        name: project.name,
        description: project.description,
      },
      data: project.data,
    },
    null,
    2
  );
}

export function importProject(json: string): { name: string; description: string; data: ProjectData } | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed.format !== 'nextel-ai-project') return null;
    return {
      name: parsed.project?.name || 'Imported Project',
      description: parsed.project?.description || '',
      data: parsed.data,
    };
  } catch {
    return null;
  }
}
