"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export type FormField = {
  name: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "password"
    | "email"
    | "date"
    | "select"
    | "switch"
    | "file"
    | "tags";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  hint?: string;
  accept?: string;
};

function buildSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (field.type === "switch") {
      shape[field.name] = z.boolean().optional();
      continue;
    }
    if (field.type === "number") {
      const num = z.coerce.number();
      shape[field.name] = field.required ? num : num.optional();
      continue;
    }
    if (field.type === "file") {
      shape[field.name] = z.any().optional();
      continue;
    }
    if (field.type === "password" && field.required) {
      shape[field.name] = z
        .string()
        .min(6, "Min 6 characters")
        .regex(/[A-Z]/, "Need one uppercase")
        .regex(/[a-z]/, "Need one lowercase")
        .regex(/[0-9]/, "Need one number");
      continue;
    }
    const text = z.string();
    shape[field.name] = field.required ? text.min(1, `${field.label} is required`) : text.optional();
  }
  return z.object(shape);
}

export function EntityFormSheet({
  open,
  title,
  description,
  fields,
  initialValues,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description?: string;
  fields: FormField[];
  initialValues?: Record<string, unknown>;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
}) {
  const schema = buildSchema(fields);
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema) as never,
    defaultValues: initialValues || {},
  });

  useEffect(() => {
    form.reset(initialValues || {});
  }, [initialValues, open, form]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <form
          className="flex flex-1 flex-col gap-4 px-4"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
          })}
        >
          {fields.map((field) => {
            const error = form.formState.errors[field.name]?.message as string | undefined;
            return (
              <div key={field.name} className="grid gap-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "textarea" || field.type === "tags" ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    {...form.register(field.name)}
                  />
                ) : field.type === "switch" ? (
                  <Controller
                    control={form.control}
                    name={field.name}
                    render={({ field: ctl }) => (
                      <Switch
                        checked={Boolean(ctl.value)}
                        onCheckedChange={ctl.onChange}
                      />
                    )}
                  />
                ) : field.type === "select" ? (
                  <Controller
                    control={form.control}
                    name={field.name}
                    render={({ field: ctl }) => (
                      <Select
                        value={ctl.value ? String(ctl.value) : undefined}
                        onValueChange={ctl.onChange}
                      >
                        <SelectTrigger className="w-full" id={field.name}>
                          <SelectValue placeholder={field.placeholder || "Select"} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : field.type === "file" ? (
                  <Input
                    id={field.name}
                    type="file"
                    accept={field.accept}
                    onChange={(e) => form.setValue(field.name, e.target.files?.[0])}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    {...form.register(field.name)}
                  />
                )}
                {field.hint ? (
                  <p className="text-xs text-muted-foreground">{field.hint}</p>
                ) : null}
                {error ? <p className="text-xs text-destructive">{error}</p> : null}
              </div>
            );
          })}
          <SheetFooter className="px-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function splitTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function emptyToUndefined<T extends Record<string, unknown>>(values: T) {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value === undefined) {
      next[key] = undefined;
      continue;
    }
    next[key] = value;
  }
  return next;
}
