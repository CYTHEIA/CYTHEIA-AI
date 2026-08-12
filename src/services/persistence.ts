import type { Project, ProjectData, ProjectVersion } from '@/types';

const API_BASE = '/api/projects';

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
}

export async function fetchTemplates(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/templates`);
  if (!response.ok) throw new Error('Failed to fetch templates');
  return response.json();
}

export async function fetchProject(id: string): Promise<Project | null> {
  const response = await fetch(`${API_BASE}/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch project');
  return response.json();
}

export async function createProject(
  name: string,
  description: string,
  data: ProjectData
): Promise<Project> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, data }),
  });
  if (!response.ok) throw new Error('Failed to create project');
  return response.json();
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
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update project');
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete project');
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
  const response = await fetch(`${API_BASE}/${projectId}/versions`);
  if (!response.ok) throw new Error('Failed to fetch versions');
  return response.json();
}

export async function createVersion(
  projectId: string,
  name: string,
  data: ProjectData
): Promise<ProjectVersion> {
  const response = await fetch(`${API_BASE}/${projectId}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, data }),
  });
  if (!response.ok) throw new Error('Failed to create version');
  return response.json();
}

export async function ensureTemplates(): Promise<void> {
  const response = await fetch(`${API_BASE}/ensure`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to ensure templates');
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