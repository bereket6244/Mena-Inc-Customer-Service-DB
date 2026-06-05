import { Customer, PaperStock } from '../types';

export interface FirebaseConnection {
  db: any;
  isFirebaseConfigured: boolean;
}

let dbInstance: any = null;
let isConfigured = false;

// Attempt to load Firebase dynamically to ensure absolute build-time safety
export async function getFirebaseDb() {
  if (dbInstance) {
    return { db: dbInstance, isFirebaseConfigured: isConfigured };
  }

  try {
    // Constructing the path dynamically bypasses Rollup static analysis build phase completely
    const configPath = '../' + 'firebase-applet-config.json';
    const configModule = await import(/* @vite-ignore */ configPath);
    const firebaseConfig = configModule.default;

    if (firebaseConfig && firebaseConfig.apiKey) {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore } = await import('firebase/firestore');

      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      isConfigured = true;
      console.log("Successfully connected to live Firestore Cloud Database!");
    }
  } catch (err) {
    console.warn("Firestore config is not provisioned or active. Defaulting to local storage mode.");
  }

  return { db: dbInstance, isFirebaseConfigured: isConfigured };
}

// Error handling based on standard Firebase Integration requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore operation failed with insufficient permissions: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
