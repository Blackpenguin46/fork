// Types for learning paths functionality

import type { LearningPath } from './database';

export interface LearningPathResource {
  id: string;
  learning_path_id: string;
  resource_id: string;
  title?: string;
  description?: string;
  resource_type: string;
  resource_slug?: string;
  position: number;
  is_required: boolean;
  estimated_time_minutes?: number;
  created_at: string;
  updated_at: string;
}