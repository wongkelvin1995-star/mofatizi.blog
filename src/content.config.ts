import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sharedSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string().optional(),
  category: z.string(),
  brand: z.string().optional(),
  client: z.string().optional(),
  platform: z.string().optional(),
  primaryKeyword: z.string(),
  secondaryKeywords: z.array(z.string()).default([]),
  searchIntent: z.string(),
  publishDate: z.string(),
  updatedDate: z.string(),
  author: z.string().default('魔法梯子编辑部'),
  tags: z.array(z.string()).default([]),
  relatedBrands: z.array(z.string()).default([]),
  relatedClients: z.array(z.string()).default([]),
  relatedArticles: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),
  documentedVersion: z.string().optional(),
  draft: z.boolean().default(false),
  indexable: z.boolean().default(true),
  stage: z.enum(['stage1', 'stage2', 'stage3']).optional(),
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .default([]),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: sharedSchema,
});

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/knowledge' }),
  schema: sharedSchema,
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: sharedSchema,
});

const clients = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/clients' }),
  schema: sharedSchema,
});

export const collections = { articles, knowledge, guides, clients };
