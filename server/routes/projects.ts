import express, { Request, Response } from 'express';
import { getCollections } from '../db';
import type { ProjectData } from '../types';

const router = express.Router();

// GET /api/projects - fetch all non-template projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const { projects } = await getCollections();
    const docs = await projects
      .find({ is_template: false })
      .sort({ updated_at: -1 })
      .toArray();

    res.json(docs.map(mapDbProject));
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/templates - fetch template projects
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { projects } = await getCollections();
    const docs = await projects
      .find({ is_template: true })
      .sort({ created_at: 1 })
      .toArray();

    res.json(docs.map(mapDbProject));
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/projects/:id - fetch single project
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { projects } = await getCollections();
    const doc = await projects.findOne({ id: req.params.id });

    if (!doc) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(mapDbProject(doc));
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - create new project
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, data } = req.body;

    if (!name || !data) {
      return res.status(400).json({ error: 'Missing required fields: name, data' });
    }

    const { projects } = await getCollections();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const project = {
      id,
      name,
      description: description || '',
      data,
      is_template: false,
      created_at: now,
      updated_at: now,
    };

    await projects.insertOne(project);
    res.status(201).json(mapDbProject(project));
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - update project
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, data, thumbnail } = req.body;
    const { projects } = await getCollections();

    const updateDoc: any = {};
    if (name !== undefined) updateDoc.name = name;
    if (description !== undefined) updateDoc.description = description;
    if (data !== undefined) updateDoc.data = data;
    if (thumbnail !== undefined) updateDoc.thumbnail = thumbnail;
    updateDoc.updated_at = new Date().toISOString();

    const result = await projects.updateOne({ id: req.params.id }, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - delete project and versions
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { projects, projectVersions } = await getCollections();

    await projects.deleteOne({ id: req.params.id });
    await projectVersions.deleteMany({ project_id: req.params.id });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// GET /api/projects/:id/versions - fetch versions
router.get('/:id/versions', async (req: Request, res: Response) => {
  try {
    const { projectVersions } = await getCollections();
    const docs = await projectVersions
      .find({ project_id: req.params.id })
      .sort({ created_at: -1 })
      .toArray();

    res.json(docs.map((doc: any) => ({
      id: doc.id,
      projectId: doc.project_id,
      name: doc.name,
      data: doc.data,
      createdAt: doc.created_at,
    })));
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// POST /api/projects/:id/versions - create version
router.post('/:id/versions', async (req: Request, res: Response) => {
  try {
    const { name, data } = req.body;

    if (!name || !data) {
      return res.status(400).json({ error: 'Missing required fields: name, data' });
    }

    const { projectVersions } = await getCollections();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const version = {
      id,
      project_id: req.params.id,
      name,
      data,
      created_at: now,
    };

    await projectVersions.insertOne(version);

    res.status(201).json({
      id: version.id,
      projectId: version.project_id,
      name: version.name,
      data: version.data,
      createdAt: version.created_at,
    });
  } catch (error) {
    console.error('Error creating version:', error);
    res.status(500).json({ error: 'Failed to create version' });
  }
});

// POST /api/projects/:id/duplicate - duplicate project
router.post('/:id/duplicate', async (req: Request, res: Response) => {
  try {
    const { projects } = await getCollections();
    const original = await projects.findOne({ id: req.params.id });

    if (!original) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const now = new Date().toISOString();
    const newId = crypto.randomUUID();

    const duplicate = {
      id: newId,
      name: `${original.name} (Copy)`,
      description: original.description || '',
      data: original.data,
      is_template: false,
      created_at: now,
      updated_at: now,
    };

    await projects.insertOne(duplicate);
    res.status(201).json(mapDbProject(duplicate));
  } catch (error) {
    console.error('Error duplicating project:', error);
    res.status(500).json({ error: 'Failed to duplicate project' });
  }
});

// POST /api/templates/ensure - ensure templates exist
router.post('/ensure', async (req: Request, res: Response) => {
  try {
    const { projects } = await getCollections();
    const existing = await projects.find({ is_template: true }).toArray();

    if (existing.length > 0) {
      return res.json({ message: 'Templates already exist' });
    }

    const { TEMPLATES } = await import('../templates');
    const now = new Date().toISOString();

    for (const template of TEMPLATES) {
      const project = {
        id: crypto.randomUUID(),
        name: template.name,
        description: template.description,
        data: template.data,
        is_template: true,
        created_at: now,
        updated_at: now,
      };

      await projects.insertOne(project);
    }

    res.json({ success: true, message: 'Templates initialized' });
  } catch (error) {
    console.error('Error ensuring templates:', error);
    res.status(500).json({ error: 'Failed to ensure templates' });
  }
});

function mapDbProject(doc: any) {
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description || '',
    data: doc.data,
    isTemplate: doc.is_template || false,
    thumbnail: doc.thumbnail,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
}

export default router;
