import { MongoClient } from "mongodb";

const dbName = process.env.MONGODB_DB || "executive-dashboards";
const isDev = process.env.NODE_ENV === "development";

function createClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI — set it in .env.local");
  }
  return new MongoClient(uri).connect();
}

/* Reuse the client across Fast Refresh reloads in dev so we don't open a new
   connection pool on every file save. If a connection attempt fails (e.g. bad
   credentials), the cache is cleared so the next call retries against
   whatever MONGODB_URI currently holds, instead of replaying the same
   rejected promise forever. */
export async function getDb() {
  if (!isDev) {
    const client = await createClientPromise();
    return client.db(dbName);
  }

  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }

  try {
    const client = await global._mongoClientPromise;
    return client.db(dbName);
  } catch (err) {
    global._mongoClientPromise = undefined;
    throw err;
  }
}