
"use client";

import { ListChecks, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/firebase.config';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  userName?: string | null;
}

export function Header({ userName }: HeaderProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) {
      toast({ title: "Error", description: "Firebase not initialized.", variant: "destructive" });
      return;
    }
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/auth'); // onAuthStateChanged will also handle redirection, but this is explicit
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Error",
        description: "Could not log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="py-6 mb-8 text-center border-b">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <ListChecks className="w-10 h-10 mr-3 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">TaskMaster</h1>
        </div>
        <div className="flex items-center space-x-4">
          {userName && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <UserCircle className="h-5 w-5" />
              <span>{userName}</span>
            </div>
          )}
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
