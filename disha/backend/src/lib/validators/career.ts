import { z } from 'zod';

export const careerClusterSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  description: z.string().min(10).max(1000),
  iconUrl: z.string().url().optional().or(z.literal('')),
  sortOrder: z.number().int().min(0).optional(),
});

export const careerSchema = z.object({
  clusterId: z.string().min(1, 'Cluster is required'),
  title: z.string().min(2).max(150),
  slug: z.string().min(2).max(150).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  description: z.string().min(30).max(5000),
  prerequisites: z.array(z.string().min(2).max(300)).min(1, 'At least one prerequisite is required'),
  eligibleStreams: z.array(z.enum(['SCIENCE', 'COMMERCE', 'ARTS', 'UNDECIDED'])).min(1, 'At least one stream required'),
  averageDuration: z.string().max(100).optional(),
  riasecRealistic: z.number().min(0).max(10).default(0),
  riasecInvestigative: z.number().min(0).max(10).default(0),
  riasecArtistic: z.number().min(0).max(10).default(0),
  riasecSocial: z.number().min(0).max(10).default(0),
  riasecEnterprising: z.number().min(0).max(10).default(0),
  riasecConventional: z.number().min(0).max(10).default(0),
});

export const careerResourceSchema = z.object({
  careerId: z.string().min(1, 'Career is required'),
  title: z.string().min(2).max(200),
  url: z.string().url('Must be a valid URL'),
  type: z.enum(['COURSE', 'BOOK', 'VIDEO', 'ARTICLE', 'TOOL', 'WEBSITE']),
  cost: z.enum(['FREE', 'PAID', 'FREEMIUM']),
  platform: z.string().max(100).optional(),
});

export type CareerClusterInput = z.infer<typeof careerClusterSchema>;
export type CareerInput = z.infer<typeof careerSchema>;
export type CareerResourceInput = z.infer<typeof careerResourceSchema>;
