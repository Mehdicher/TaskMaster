"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";

const addTodoSchema = z.object({
  text: z.string().min(1, { message: "Task description cannot be empty." }),
});

type AddTodoFormValues = z.infer<typeof addTodoSchema>;

interface AddTodoFormProps {
  onAddTodo: (text: string) => void;
}

export function AddTodoForm({ onAddTodo }: AddTodoFormProps) {
  const form = useForm<AddTodoFormValues>({
    resolver: zodResolver(addTodoSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit: SubmitHandler<AddTodoFormValues> = (data) => {
    onAddTodo(data.text);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-start mb-6">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel className="sr-only">New Task</FormLabel>
              <FormControl>
                <Input placeholder="Add a new task..." {...field} className="text-base"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" aria-label="Add task">
          <Plus className="mr-2 h-5 w-5" /> Add
        </Button>
      </form>
    </Form>
  );
}
