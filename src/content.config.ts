import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const organizations = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/organizations" }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string().optional(),
    url: z.string().optional(),
    category: z.enum(["organization", "club", "social-service", "social-exercise"]),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { organizations, services };
