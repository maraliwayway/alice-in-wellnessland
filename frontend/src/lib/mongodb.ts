import { MongoClient, Db } from "mongodb";
import { getMongoUri } from "@/lib/secrets";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let _clientPromise: Promise<MongoClient> | null = null;

async function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const uri = await getMongoUri();
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!_clientPromise) {
    const uri = await getMongoUri();
    const client = new MongoClient(uri);
    _clientPromise = client.connect();
  }
  return _clientPromise;
}

export async function connectToDatabase(): Promise<{
  db: Db;
  client: MongoClient;
}> {
  const client = await getClientPromise();
  return { db: client.db("wellnessland"), client };
}
