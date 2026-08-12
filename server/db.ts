import { MongoClient, Db, Collection } from 'mongodb';

let mongoClient: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = 'nexel-ai';

interface DatabaseCollections {
  projects: Collection<any>;
  projectVersions: Collection<any>;
}

export async function getDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!MONGODB_URI) {
    throw new Error('MongoDB connection URI not configured. Set MONGODB_URI in .env');
  }

  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);

    // Create indexes for better performance
    const projectsCollection = db.collection('projects');
    const versionsCollection = db.collection('project_versions');

    await projectsCollection.createIndex({ is_template: 1, updated_at: -1 });
    await projectsCollection.createIndex({ id: 1 }, { unique: true });
    await versionsCollection.createIndex({ project_id: 1, created_at: -1 });

    console.log('MongoDB connected successfully');
    return db;
  } catch (error) {
    mongoClient = null;
    db = null;
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getCollections(): Promise<DatabaseCollections> {
  const database = await getDatabase();
  return {
    projects: database.collection('projects'),
    projectVersions: database.collection('project_versions'),
  };
}

export async function closeDatabase(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}
