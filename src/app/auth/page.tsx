
"use client";

import type { SubmitHandler } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { LockKeyhole, UserPlus, ListChecks } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, type User as FirebaseUserType } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase/firebase.config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { FirebaseUser } from '@/types';


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!auth) { // Ensure Firebase auth is initialized
        console.error("Firebase auth is not initialized on the client yet.");
        setLoadingAuth(false); // Stop loading, allow UI to render perhaps with an error or limited functionality
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const appUser: FirebaseUser = { uid: user.uid, email: user.email, displayName: user.displayName };
        setCurrentUser(appUser);
        router.replace('/');
      } else {
        setCurrentUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin: SubmitHandler<LoginFormValues> = async (values) => {
    if (!auth) {
      toast({ title: "Authentication Error", description: "Firebase is not ready.", variant: "destructive" });
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      // onAuthStateChanged will handle redirect
    } catch (error: any) {
      console.error("Login error:", error);
      let description = "An unknown error occurred. Please try again.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        description = "Invalid email or password.";
      }
      toast({
        title: "Login Failed",
        description,
        variant: "destructive",
      });
    }
  };

  const handleSignup: SubmitHandler<SignupFormValues> = async (values) => {
     if (!auth || !db) {
      toast({ title: "Authentication Error", description: "Firebase is not ready.", variant: "destructive" });
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, { displayName: values.name });

      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        name: values.name,
        email: firebaseUser.email,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Account Created",
        description: "Welcome to TaskMaster!",
      });
      // onAuthStateChanged will handle redirect
    } catch (error: any) {
      console.error("Signup error:", error);
      let description = "Could not create account. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        description = "This email address is already in use.";
      }
      toast({
        title: "Signup Failed",
        description,
        variant: "destructive",
      });
    }
  };

  if (loadingAuth || currentUser) { // Show loader if auth state is loading or if user is logged in (and redirecting)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <LockKeyhole className="w-16 h-16 text-primary animate-pulse" />
        <p className="mt-4 text-lg text-muted-foreground">Loading Authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 selection:bg-primary/20">
      <div className="grid md:grid-cols-2 gap-0 max-w-4xl w-full bg-card shadow-2xl rounded-xl overflow-hidden">
        <div className="hidden md:flex flex-col items-center justify-center text-center p-10 bg-muted/30 border-r">
          <Image
            src="https://picsum.photos/seed/creativeLogin/400/500"
            alt="Creative authentication visual"
            data-ai-hint="modern tech"
            width={350}
            height={450}
            className="rounded-lg shadow-xl mb-6 object-cover"
          />
          <h2 className="text-3xl font-bold text-foreground">Welcome to TaskMaster</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Unlock your productivity. <br /> Organize your tasks, achieve your goals.
          </p>
        </div>

        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <CardHeader className="text-center p-0 mb-6">
            <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                 <ListChecks className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-semibold">Get Started</CardTitle>
            <CardDescription className="mt-1">
              Login or create an account to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full !mt-6" size="lg" disabled={loginForm.formState.isSubmitting}>
                      <LockKeyhole className="mr-2 h-5 w-5" /> {loginForm.formState.isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Choose a strong password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Repeat your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full !mt-6" size="lg" disabled={signupForm.formState.isSubmitting}>
                      <UserPlus className="mr-2 h-5 w-5" /> {signupForm.formState.isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
