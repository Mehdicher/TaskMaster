import type { Timestamp } from 'firebase/firestore';

export interface Todo {
  id: string; // Firestore document ID
  text: string;
  completed: boolean;
  createdAt?: Timestamp; // Firestore ServerTimestamp on write, Timestamp on read
  userId?: string; // To associate with a user, useful for security rules/queries
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  // Add other Firebase user properties if needed
}
