/**
 * Resource Import System - Type Definitions
 * 
 * This file contains all the type definitions used throughout the resource import system.
 */

import { Database } from '@/types/supabase';

// Database Types
export type DbResource = Database['public']['Tables']['resources']['Row'];
export type DbResourceInsert = Database['public']['Tables']['resources']['Insert'];
export type DbCategory = Database['public']['Tables']['categories']['Row'];
export type DbTag = Database['public']['Tables']['tags']['Row'];

/**
 * Raw resource data as it comes from import files
 */
export interface RawResource {
  title: string;
  description: string;
  url: string;
  resource_type?: string;
  categories?: string[];
  tags?: string[];
  difficulty_level?: string;
  estimated_time_minutes?: number;
  is_premium?: boolean;
  is_published?: boolean;
  author_id?: string;
  [key: string]: any; // Additional fields
}

/**
 * Validation error for a resource field
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Resource with validation results
 */
export interface ValidatedResource extends RawResource {
  validation: {
    isValid: boolean;
    errors: ValidationError[];
  };
}

/**
 * Resource with assigned categories
 */
export interface CategorizedResource extends ValidatedResource {
  categories: {
    id: string;
    name: string;
  }[];
}

/**
 * Resource with enriched metadata
 */
export interface EnrichedResource extends CategorizedResource {
  slug: string;
  view_count: number;
  like_count: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Import options for customizing the import process
 */
export interface ImportOptions {
  batchSize: number;
  createMissingCategories: boolean;
  defaultVisibility: 'published' | 'unpublished';
  skipDuplicates: boolean;
  validateOnly: boolean;
}

/**
 * Default import options
 */
export const DEFAULT_IMPORT_OPTIONS: ImportOptions = {
  batchSize: 100,
  createMissingCategories: true,
  defaultVisibility: 'unpublished',
  skipDuplicates: true,
  validateOnly: false,
};

/**
 * Import progress information
 */
export interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  inProgress: boolean;
  startTime: Date;
  estimatedEndTime?: Date;
  currentBatch: number;
  totalBatches: number;
}

/**
 * Result of a resource write operation
 */
export interface WriteResult {
  inserted: number;
  updated: number;
  failed: number;
  errors: Array<{ resource: RawResource; error: Error }>;
}

/**
 * Summary of an import operation
 */
export interface ImportSummary {
  totalResources: number;
  successfulImports: number;
  failedImports: number;
  skippedImports: number;
  categories: {
    existing: number;
    created: number;
  };
  tags: {
    existing: number;
    created: number;
  };
  duration: number; // milliseconds
  startTime: Date;
  endTime: Date;
}

/**
 * Detailed import report
 */
export interface DetailedImportReport extends ImportSummary {
  errors: Array<{
    resource: RawResource;
    errors: ValidationError[];
  }>;
  warnings: Array<{
    resource: RawResource;
    warnings: string[];
  }>;
  successfulResources: EnrichedResource[];
}

/**
 * Result of an import operation
 */
export interface ImportResult {
  success: boolean;
  summary: ImportSummary;
  detailedReport?: DetailedImportReport;
}