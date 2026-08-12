import { supabase } from "@/lib/supabase";
async function fetchProjects() {
  const { data, error } = await supabase.from("projects").select("*").eq("is_template", false).order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapDbProject);
}
async function fetchTemplates() {
  const { data, error } = await supabase.from("projects").select("*").eq("is_template", true).order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapDbProject);
}
async function fetchProject(id) {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapDbProject(data) : null;
}
async function createProject(name, description, data) {
  const { data: row, error } = await supabase.from("projects").insert({ name, description, data, is_template: false }).select().single();
  if (error) throw error;
  return mapDbProject(row);
}
async function updateProject(id, updates) {
  const { error } = await supabase.from("projects").update({
    ...updates.name !== void 0 && { name: updates.name },
    ...updates.description !== void 0 && { description: updates.description },
    ...updates.data !== void 0 && { data: updates.data },
    ...updates.thumbnail !== void 0 && { thumbnail: updates.thumbnail },
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", id);
  if (error) throw error;
}
async function deleteProject(id) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
async function duplicateProject(id) {
  const project = await fetchProject(id);
  if (!project) return null;
  return createProject(`${project.name} (Copy)`, project.description || "", project.data);
}
async function fetchVersions(projectId) {
  const { data, error } = await supabase.from("project_versions").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((v) => ({
    id: v.id,
    projectId: v.project_id,
    name: v.name,
    data: v.data,
    createdAt: v.created_at
  }));
}
async function createVersion(projectId, name, data) {
  const { data: row, error } = await supabase.from("project_versions").insert({ project_id: projectId, name, data }).select().single();
  if (error) throw error;
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    data: row.data,
    createdAt: row.created_at
  };
}
async function ensureTemplates() {
  const existing = await fetchTemplates();
  if (existing.length > 0) return;
  const { TEMPLATES } = await import("@/templates");
  for (const tpl of TEMPLATES) {
    await supabase.from("projects").insert({
      name: tpl.name,
      description: tpl.description,
      data: tpl.data,
      is_template: true
    });
  }
}
function mapDbProject(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    data: row.data,
    isTemplate: row.is_template,
    thumbnail: row.thumbnail,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function exportProject(project) {
  return JSON.stringify(
    {
      format: "nextel-ai-project",
      version: "1.0",
      project: {
        name: project.name,
        description: project.description
      },
      data: project.data
    },
    null,
    2
  );
}
function importProject(json) {
  try {
    const parsed = JSON.parse(json);
    if (parsed.format !== "nextel-ai-project") return null;
    return {
      name: parsed.project?.name || "Imported Project",
      description: parsed.project?.description || "",
      data: parsed.data
    };
  } catch {
    return null;
  }
}
export {
  createProject,
  createVersion,
  deleteProject,
  duplicateProject,
  ensureTemplates,
  exportProject,
  fetchProject,
  fetchProjects,
  fetchTemplates,
  fetchVersions,
  importProject,
  updateProject
};
