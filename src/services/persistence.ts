import { hasSupabaseConfig, supabase } from '@/lib/supabase';
import type { Project, ProjectData, ProjectVersion } from '@/types';

const LOCAL_PROJECTS_KEY = 'nexel-ai-projects';
const LOCAL_VERSIONS_KEY = 'nexel-ai-project-versions';

function getLocalProjects(): Project[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PROJECTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalProjects(projects: Project[]) {
  localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
}

function getLocalVersions(): ProjectVersion[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_VERSIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalVersions(versions: ProjectVersion[]) {
  localStorage.setItem(LOCAL_VERSIONS_KEY, JSON.stringify(versions));
}

export async function fetchProjects(): Promise<Project[]> {
  if (!hasSupabaseConfig || !supabase) {
    return getLocalProjects().filter((project) => !project.isTemplate);
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_template', false)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbProject);
}

export async function fetchTemplates(): Promise<Project[]> {
  if (!hasSupabaseConfig || !supabase) {
    return getLocalProjects().filter((project) => project.isTemplate);
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_template', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapDbProject);
}

export async function fetchProject(id: string): Promise<Project | null> {
  if (!hasSupabaseConfig || !supabase) {
    return getLocalProjects().find((project) => project.id === id) || null;
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDbProject(data) : null;
}

export async function createProject(
  name: string,
  description: string,
  data: ProjectData
): Promise<Project> {
  if (!hasSupabaseConfig || !supabase) {
    const now = new Date().toISOString();

    const project: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      data,
      isTemplate: false,
      createdAt: now,
      updatedAt: now,
    };

    const projects = getLocalProjects();
    projects.push(project);
    saveLocalProjects(projects);

    return project;
  }

  const { data: row, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      data: data as any,
      is_template: false,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbProject(row);
}

export async function updateProject(
  id: string,
  updates: {
    name?: string;
    description?: string;
    data?: ProjectData;
    thumbnail?: string;
  }
): Promise<void> {
  if (!hasSupabaseConfig || !supabase) {
    const projects = getLocalProjects();
    const index = projects.findIndex((project) => project.id === id);

    if (index === -1) {
      throw new Error('Project not found');
    }

    projects[index] = {
      ...projects[index],
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && {
        description: updates.description,
      }),
      ...(updates.data !== undefined && { data: updates.data }),
      ...(updates.thumbnail !== undefined && {
        thumbnail: updates.thumbnail,
      }),
      updatedAt: new Date().toISOString(),
    };

    saveLocalProjects(projects);
    return;
  }

  const { error } = await supabase
    .from('projects')
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && {
        description: updates.description,
      }),
      ...(updates.data !== undefined && { data: updates.data as any }),
      ...(updates.thumbnail !== undefined && {
        thumbnail: updates.thumbnail,
      }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  if (!hasSupabaseConfig || !supabase) {
    const projects = getLocalProjects().filter(
      (project) => project.id !== id
    );

    saveLocalProjects(projects);

    const versions = getLocalVersions().filter(
      (version) => version.projectId !== id
    );

    saveLocalVersions(versions);
    return;
  }

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) throw error;
}

export async function duplicateProject(
  id: string
): Promise<Project | null> {
  const project = await fetchProject(id);

  if (!project) return null;

  return createProject(
    `${project.name} (Copy)`,
    project.description || '',
    project.data
  );
}

export async function fetchVersions(
  projectId: string
): Promise<ProjectVersion[]> {
  if (!hasSupabaseConfig || !supabase) {
    return getLocalVersions()
      .filter((version) => version.projectId === projectId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }

  const { data, error } = await supabase
    .from('project_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((version: any) => ({
    id: version.id,
    projectId: version.project_id,
    name: version.name,
    data: version.data,
    createdAt: version.created_at,
  }));
}

export async function createVersion(
  projectId: string,
  name: string,
  data: ProjectData
): Promise<ProjectVersion> {
  if (!hasSupabaseConfig || !supabase) {
    const version: ProjectVersion = {
      id: crypto.randomUUID(),
      projectId,
      name,
      data,
      createdAt: new Date().toISOString(),
    };

    const versions = getLocalVersions();
    versions.push(version);
    saveLocalVersions(versions);

    return version;
  }

  const { data: row, error } = await supabase
    .from('project_versions')
    .insert({
      project_id: projectId,
      name,
      data: data as any,
    })
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

  if (!hasSupabaseConfig || !supabase) {
    const projects = getLocalProjects();
    const now = new Date().toISOString();

    const templates: Project[] = TEMPLATES.map((template) => ({
      id: crypto.randomUUID(),
      name: template.name,
      description: template.description,
      data: template.data,
      isTemplate: true,
      createdAt: now,
      updatedAt: now,
    }));

    saveLocalProjects([
      ...projects.filter((project) => !project.isTemplate),
      ...templates,
    ]);

    return;
  }

  for (const template of TEMPLATES) {
    const { error } = await supabase.from('projects').insert({
      name: template.name,
      description: template.description,
      data: template.data as any,
      is_template: true,
    });

    if (error) throw error;
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

export function importProject(
  json: string
): {
  name: string;
  description: string;
  data: ProjectData;
} | null {
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