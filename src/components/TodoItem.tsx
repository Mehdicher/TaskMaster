"use client";

import type { Todo } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggleComplete, onDelete }: TodoItemProps) {
  return (
    <Card className={cn(
      "mb-3 transition-all duration-300 ease-in-out",
      todo.completed ? "bg-muted/50 opacity-70" : "bg-card"
    )}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.completed}
            onCheckedChange={() => onToggleComplete(todo.id)}
            aria-labelledby={`todo-text-${todo.id}`}
          />
          <label
            id={`todo-text-${todo.id}`}
            htmlFor={`todo-${todo.id}`}
            className={cn(
              "text-base transition-all duration-300 ease-in-out cursor-pointer",
              todo.completed ? "line-through text-muted-foreground" : "text-card-foreground"
            )}
          >
            {todo.text}
          </label>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete task: ${todo.text}`}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
