import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

type Client = ReturnType<typeof createClientComponentClient<Database>>;

export interface BookmarkCollection {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isPrivate: boolean;
  sortOrder: number;
  bookmarkCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  resourceId: string;
  collectionId?: string;
  title?: string;
  notes?: string;
  tags: string[];
  readingProgress: number;
  readingTimeSeconds: number;
  lastReadAt?: string;
  priority: number;
  isArchived: boolean;
  reminderDate?: string;
  isPublic: boolean;
  sharedWith: string[];
  bookmarkedAt: string;
  updatedAt: string;
  resource?: {
    title: string;
    description: string;
    url: string;
    category: string;
    difficulty: string;
    estimatedDuration: number;
  };
  collection?: BookmarkCollection;
}

export interface ContentAnnotation {
  id: string;
  resourceId: string;
  bookmarkId: string;
  annotationType: 'highlight' | 'note' | 'question' | 'important';
  content: string;
  context?: string;
  sectionReference?: string;
  startPosition?: number;
  endPosition?: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingList {
  id: string;
  name: string;
  description?: string;
  isSequential: boolean;
  estimatedDurationHours?: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  currentPosition: number;
  completionPercentage: number;
  category?: string;
  tags: string[];
  isPublic: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingListItem {
  id: string;
  readingListId: string;
  resourceId: string;
  position: number;
  notes?: string;
  estimatedDurationMinutes?: number;
  isCompleted: boolean;
  completedAt?: string;
  requiredItems: string[];
  resource?: {
    title: string;
    description: string;
    url: string;
    category: string;
  };
}

export interface BookmarkRecommendation {
  id: string;
  recommendedResourceId: string;
  basedOnBookmarkId: string;
  recommendationType: 'similar_content' | 'next_level' | 'related_topic' | 'trending' | 'ai_generated';
  relevanceScore: number;
  confidenceScore: number;
  status: 'pending' | 'viewed' | 'bookmarked' | 'dismissed';
  createdAt: string;
  expiresAt: string;
  resource?: {
    title: string;
    description: string;
    url: string;
    category: string;
  };
}

export class BookmarkService {
  private supabase: Client;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  // Collection Management
  async getCollections(userId: string): Promise<BookmarkCollection[]> {
    try {
      const { data, error } = await this.supabase
        .from('bookmark_collections')
        .select(`
          *,
          bookmark_count:user_bookmarks(count)
        `)
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return data.map(collection => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        color: collection.color,
        icon: collection.icon,
        isDefault: collection.is_default,
        isPrivate: collection.is_private,
        sortOrder: collection.sort_order,
        bookmarkCount: collection.bookmark_count?.[0]?.count || 0,
        createdAt: collection.created_at,
        updatedAt: collection.updated_at
      }));
    } catch (error) {
      console.error('Error fetching bookmark collections:', error);
      throw new Error('Failed to fetch bookmark collections');
    }
  }

  async createCollection(userId: string, collectionData: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isPrivate?: boolean;
  }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('bookmark_collections')
        .insert({
          user_id: userId,
          name: collectionData.name,
          description: collectionData.description,
          color: collectionData.color || 'blue',
          icon: collectionData.icon || 'bookmark',
          is_private: collectionData.isPrivate || false
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating bookmark collection:', error);
      throw new Error('Failed to create bookmark collection');
    }
  }

  async updateCollection(collectionId: string, updates: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    isPrivate?: boolean;
    sortOrder?: number;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('bookmark_collections')
        .update({
          name: updates.name,
          description: updates.description,
          color: updates.color,
          icon: updates.icon,
          is_private: updates.isPrivate,
          sort_order: updates.sortOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', collectionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating bookmark collection:', error);
      throw new Error('Failed to update bookmark collection');
    }
  }

  async deleteCollection(collectionId: string): Promise<void> {
    try {
      // Move bookmarks to default collection first
      const { data: defaultCollection } = await this.supabase
        .from('bookmark_collections')
        .select('id')
        .eq('is_default', true)
        .single();

      if (defaultCollection) {
        await this.supabase
          .from('user_bookmarks')
          .update({ collection_id: defaultCollection.id })
          .eq('collection_id', collectionId);
      }

      const { error } = await this.supabase
        .from('bookmark_collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting bookmark collection:', error);
      throw new Error('Failed to delete bookmark collection');
    }
  }

  // Bookmark Management
  async getBookmarks(userId: string, options?: {
    collectionId?: string;
    tags?: string[];
    isArchived?: boolean;
    priority?: number;
    limit?: number;
    offset?: number;
  }): Promise<Bookmark[]> {
    try {
      let query = this.supabase
        .from('user_bookmarks')
        .select(`
          *,
          resource:resources(title, description, url, category, difficulty, estimated_duration),
          collection:bookmark_collections(name, color, icon)
        `)
        .eq('user_id', userId);

      if (options?.collectionId) {
        query = query.eq('collection_id', options.collectionId);
      }

      if (options?.isArchived !== undefined) {
        query = query.eq('is_archived', options.isArchived);
      }

      if (options?.priority) {
        query = query.eq('priority', options.priority);
      }

      if (options?.tags && options.tags.length > 0) {
        query = query.overlaps('tags', options.tags);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      query = query.order('bookmarked_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data.map(bookmark => ({
        id: bookmark.id,
        resourceId: bookmark.resource_id,
        collectionId: bookmark.collection_id,
        title: bookmark.title,
        notes: bookmark.notes,
        tags: bookmark.tags || [],
        readingProgress: bookmark.reading_progress,
        readingTimeSeconds: bookmark.reading_time_seconds,
        lastReadAt: bookmark.last_read_at,
        priority: bookmark.priority,
        isArchived: bookmark.is_archived,
        reminderDate: bookmark.reminder_date,
        isPublic: bookmark.is_public,
        sharedWith: bookmark.shared_with || [],
        bookmarkedAt: bookmark.bookmarked_at,
        updatedAt: bookmark.updated_at,
        resource: bookmark.resource ? {
          title: bookmark.resource.title,
          description: bookmark.resource.description,
          url: bookmark.resource.url,
          category: bookmark.resource.category,
          difficulty: bookmark.resource.difficulty,
          estimatedDuration: bookmark.resource.estimated_duration
        } : undefined,
        collection: bookmark.collection ? {
          id: bookmark.collection_id!,
          name: bookmark.collection.name,
          color: bookmark.collection.color,
          icon: bookmark.collection.icon,
          description: '',
          isDefault: false,
          isPrivate: false,
          sortOrder: 0,
          createdAt: '',
          updatedAt: ''
        } : undefined
      }));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw new Error('Failed to fetch bookmarks');
    }
  }

  async addBookmark(userId: string, bookmarkData: {
    resourceId: string;
    collectionId?: string;
    title?: string;
    notes?: string;
    tags?: string[];
    priority?: number;
    isPublic?: boolean;
  }): Promise<string> {
    try {
      // Get default collection if none specified
      let collectionId = bookmarkData.collectionId;
      if (!collectionId) {
        const { data: defaultCollection } = await this.supabase
          .from('bookmark_collections')
          .select('id')
          .eq('user_id', userId)
          .eq('is_default', true)
          .single();

        collectionId = defaultCollection?.id;
      }

      const { data, error } = await this.supabase
        .from('user_bookmarks')
        .insert({
          user_id: userId,
          resource_id: bookmarkData.resourceId,
          collection_id: collectionId,
          title: bookmarkData.title,
          notes: bookmarkData.notes,
          tags: bookmarkData.tags || [],
          priority: bookmarkData.priority || 3,
          is_public: bookmarkData.isPublic || false
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw new Error('Failed to add bookmark');
    }
  }

  async updateBookmark(bookmarkId: string, updates: {
    collectionId?: string;
    title?: string;
    notes?: string;
    tags?: string[];
    readingProgress?: number;
    priority?: number;
    isArchived?: boolean;
    reminderDate?: string;
    isPublic?: boolean;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_bookmarks')
        .update({
          collection_id: updates.collectionId,
          title: updates.title,
          notes: updates.notes,
          tags: updates.tags,
          reading_progress: updates.readingProgress,
          priority: updates.priority,
          is_archived: updates.isArchived,
          reminder_date: updates.reminderDate,
          is_public: updates.isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookmarkId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw new Error('Failed to update bookmark');
    }
  }

  async deleteBookmark(bookmarkId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw new Error('Failed to delete bookmark');
    }
  }

  async isBookmarked(userId: string, resourceId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }

  // Annotation Management
  async addAnnotation(userId: string, annotationData: {
    resourceId: string;
    bookmarkId: string;
    annotationType: 'highlight' | 'note' | 'question' | 'important';
    content: string;
    context?: string;
    sectionReference?: string;
    startPosition?: number;
    endPosition?: number;
    color?: string;
  }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('content_annotations')
        .insert({
          user_id: userId,
          resource_id: annotationData.resourceId,
          bookmark_id: annotationData.bookmarkId,
          annotation_type: annotationData.annotationType,
          content: annotationData.content,
          context: annotationData.context,
          section_reference: annotationData.sectionReference,
          start_position: annotationData.startPosition,
          end_position: annotationData.endPosition,
          color: annotationData.color || 'yellow'
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw new Error('Failed to add annotation');
    }
  }

  async getAnnotations(userId: string, resourceId?: string, bookmarkId?: string): Promise<ContentAnnotation[]> {
    try {
      let query = this.supabase
        .from('content_annotations')
        .select('*')
        .eq('user_id', userId);

      if (resourceId) {
        query = query.eq('resource_id', resourceId);
      }

      if (bookmarkId) {
        query = query.eq('bookmark_id', bookmarkId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data.map(annotation => ({
        id: annotation.id,
        resourceId: annotation.resource_id,
        bookmarkId: annotation.bookmark_id,
        annotationType: annotation.annotation_type as 'highlight' | 'note' | 'question' | 'important',
        content: annotation.content,
        context: annotation.context,
        sectionReference: annotation.section_reference,
        startPosition: annotation.start_position,
        endPosition: annotation.end_position,
        color: annotation.color,
        createdAt: annotation.created_at,
        updatedAt: annotation.updated_at
      }));
    } catch (error) {
      console.error('Error fetching annotations:', error);
      throw new Error('Failed to fetch annotations');
    }
  }

  // Reading List Management
  async getReadingLists(userId: string, includePublic = false): Promise<ReadingList[]> {
    try {
      let query = this.supabase
        .from('reading_lists')
        .select(`
          *,
          item_count:reading_list_items(count)
        `);

      if (includePublic) {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`);
      } else {
        query = query.eq('user_id', userId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data.map(list => ({
        id: list.id,
        name: list.name,
        description: list.description,
        isSequential: list.is_sequential,
        estimatedDurationHours: list.estimated_duration_hours,
        difficultyLevel: list.difficulty_level as 'beginner' | 'intermediate' | 'advanced' | 'expert',
        currentPosition: list.current_position,
        completionPercentage: list.completion_percentage,
        category: list.category,
        tags: list.tags || [],
        isPublic: list.is_public,
        itemCount: list.item_count?.[0]?.count || 0,
        createdAt: list.created_at,
        updatedAt: list.updated_at
      }));
    } catch (error) {
      console.error('Error fetching reading lists:', error);
      throw new Error('Failed to fetch reading lists');
    }
  }

  async createReadingList(userId: string, listData: {
    name: string;
    description?: string;
    isSequential?: boolean;
    difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category?: string;
    tags?: string[];
    isPublic?: boolean;
  }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('reading_lists')
        .insert({
          user_id: userId,
          name: listData.name,
          description: listData.description,
          is_sequential: listData.isSequential || false,
          difficulty_level: listData.difficultyLevel || 'beginner',
          category: listData.category,
          tags: listData.tags || [],
          is_public: listData.isPublic || false
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating reading list:', error);
      throw new Error('Failed to create reading list');
    }
  }

  async addToReadingList(readingListId: string, resourceId: string, options?: {
    position?: number;
    notes?: string;
    estimatedDurationMinutes?: number;
  }): Promise<void> {
    try {
      // Get next position if not specified
      let position = options?.position;
      if (!position) {
        const { data } = await this.supabase
          .from('reading_list_items')
          .select('position')
          .eq('reading_list_id', readingListId)
          .order('position', { ascending: false })
          .limit(1)
          .single();

        position = (data?.position || 0) + 1;
      }

      const { error } = await this.supabase
        .from('reading_list_items')
        .insert({
          reading_list_id: readingListId,
          resource_id: resourceId,
          position,
          notes: options?.notes,
          estimated_duration_minutes: options?.estimatedDurationMinutes
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding to reading list:', error);
      throw new Error('Failed to add to reading list');
    }
  }

  // Recommendation Management
  async getRecommendations(userId: string, status?: 'pending' | 'viewed' | 'bookmarked' | 'dismissed'): Promise<BookmarkRecommendation[]> {
    try {
      let query = this.supabase
        .from('bookmark_recommendations')
        .select(`
          *,
          resource:resources(title, description, url, category)
        `)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString());

      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('relevance_score', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data.map(rec => ({
        id: rec.id,
        recommendedResourceId: rec.recommended_resource_id,
        basedOnBookmarkId: rec.based_on_bookmark_id,
        recommendationType: rec.recommendation_type as any,
        relevanceScore: rec.relevance_score,
        confidenceScore: rec.confidence_score,
        status: rec.status as any,
        createdAt: rec.created_at,
        expiresAt: rec.expires_at,
        resource: rec.resource ? {
          title: rec.resource.title,
          description: rec.resource.description,
          url: rec.resource.url,
          category: rec.resource.category
        } : undefined
      }));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw new Error('Failed to fetch recommendations');
    }
  }

  async updateRecommendationStatus(recommendationId: string, status: 'viewed' | 'bookmarked' | 'dismissed'): Promise<void> {
    try {
      const updateData: any = { status };
      
      if (status === 'viewed') {
        updateData.viewed_at = new Date().toISOString();
      } else if (status === 'dismissed') {
        updateData.dismissed_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('bookmark_recommendations')
        .update(updateData)
        .eq('id', recommendationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      throw new Error('Failed to update recommendation status');
    }
  }
}