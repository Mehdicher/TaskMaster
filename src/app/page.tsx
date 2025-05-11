
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { onAuthStateChanged, type User as FirebaseUserType } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import type { Todo, FirebaseUser } from "@/types";
import { auth, db } from '@/lib/firebase/firebase.config';
import { Header } from "@/components/Header";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoItem } from "@/components/TodoItem";
import { Button } from "@/components/ui/button";
import { Download, ListChecks, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingTodos, setLoadingTodos] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
        setLoadingAuth(false);
        router.replace('/auth'); // Redirect if Firebase not ready on client
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const appUser: FirebaseUser = { uid: user.uid, email: user.email, displayName: user.displayName };
        setCurrentUser(appUser);
      } else {
        setCurrentUser(null);
        router.replace('/auth');
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (currentUser && db) {
      setLoadingTodos(true);
      const todosCol = collection(db, "users", currentUser.uid, "todos");
      const q = query(todosCol, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const todosData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt as Timestamp, // Ensure type
        } as Todo));
        setTodos(todosData);
        setLoadingTodos(false);
      }, (error) => {
        console.error("Error fetching todos:", error);
        toast({
          title: "Error",
          description: "Could not load your tasks from the database.",
          variant: "destructive",
        });
        setLoadingTodos(false);
      });
      return () => unsubscribe();
    } else {
      setTodos([]); // Clear todos if no user
    }
  }, [currentUser, toast]);


  const handleAddTodo = useCallback(async (text: string) => {
    if (!currentUser || !db) {
      toast({ title: "Not Authenticated", description: "You must be logged in to add tasks.", variant: "destructive" });
      return;
    }
    try {
      const todosCol = collection(db, "users", currentUser.uid, "todos");
      await addDoc(todosCol, {
        text,
        completed: false,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
      });
      toast({
        title: "Task Added",
        description: `"${text}" has been added to your list.`,
      });
    } catch (error) {
      console.error("Error adding todo:", error);
      toast({ title: "Error", description: "Could not add task.", variant: "destructive" });
    }
  }, [currentUser, toast]);

  const handleToggleComplete = useCallback(async (id: string) => {
    if (!currentUser || !db) return;
    const todoRef = doc(db, "users", currentUser.uid, "todos", id);
    const todoItem = todos.find(t => t.id === id);
    if (!todoItem) return;
    try {
      await updateDoc(todoRef, { completed: !todoItem.completed });
    } catch (error) {
      console.error("Error toggling todo:", error);
      toast({ title: "Error", description: "Could not update task status.", variant: "destructive" });
    }
  }, [currentUser, todos, toast]);

  const handleDeleteTodo = useCallback(async (id: string) => {
    if (!currentUser || !db) return;
    const todoRef = doc(db, "users", currentUser.uid, "todos", id);
    const todoText = todos.find(t => t.id === id)?.text || "Task";
    try {
      await deleteDoc(todoRef);
      toast({
        title: "Task Deleted",
        description: `"${todoText}" has been removed.`,
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({ title: "Error", description: "Could not delete task.", variant: "destructive" });
    }
  }, [currentUser, todos, toast]);

  const handleExportTodos = useCallback(() => {
    if (todos.length === 0) {
      toast({
        title: "Nothing to Export",
        description: "Your to-do list is empty.",
      });
      return;
    }

    const fileContent = todos
      .map((todo) => `${todo.completed ? "[x]" : "[ ]"} ${todo.text}`)
      .join("\n");
    
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "taskmaster_todos.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Your to-do list has been exported as taskmaster_todos.txt.",
    });
  }, [todos, toast]);

  if (loadingAuth || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <ListChecks className="w-16 h-16 text-primary animate-pulse" />
        <p className="mt-4 text-lg text-muted-foreground">Loading TaskMaster...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header userName={currentUser.displayName} />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        <AddTodoForm onAddTodo={handleAddTodo} />
        
        {todos.length > 0 && (
          <div className="mb-6 flex justify-end">
            <Button onClick={handleExportTodos} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export List
            </Button>
          </div>
        )}

        {loadingTodos && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading tasks...</p>
          </div>
        )}

        {!loadingTodos && todos.length === 0 && (
          <div className="text-center py-10">
            <Image 
              src="https://picsum.photos/seed/taskempty/300/200" 
              alt="Empty task list illustration"
              data-ai-hint="empty checklist" 
              width={300} 
              height={200} 
              className="mx-auto mb-4 rounded-lg shadow-md"
            />
            <p className="text-xl text-muted-foreground">Your to-do list is empty!</p>
            <p className="text-muted-foreground">Add a new task using the form above to get started.</p>
          </div>
        )}

        {!loadingTodos && todos.length > 0 && (
          <div className="space-y-1">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTodo}
              />
            ))}
          </div>
        )}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} TaskMaster. Keep track of your goals.</p>
      </footer>
    </div>
  );
}
