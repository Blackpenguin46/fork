/**
 * CSV File Processor
 * 
 * Processes CSV files and converts them to raw resources.
 */

import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { BaseFileProcessor } from './base-processor';
import { RawResource } from '../types';

/**
 * CSV File Processor
 */
export class CsvProcessor extends BaseFileProcessor {
  /**
   * Check if this processor can handle the given file
   * @param filePath Path to the file
   * @returns True if the processor can handle the file
   */
  canProcess(filePath: string): boolean {
    const extension = this.getFileExtension(filePath);
    return extension === 'csv';
  }
  
  /**
   * Process the CSV file and extract resources
   * @param filePath Path to the file
   * @returns Array of raw resources
   */
  async process(filePath: string): Promise<RawResource[]> {
    try {
      // Read the file
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      
      // Parse CSV
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      // Convert to raw resources
      return records.map((record: any, index: number) => this.convertToResource(record, index));
    } catch (error) {
      throw new Error(`Error processing CSV file: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get the name of the processor
   */
  getName(): string {
    return 'CSV Processor';
  }
  
  /**
   * Convert a CSV record to a raw resource
   * @param record CSV record
   * @param index Record index (for error reporting)
   * @returns Raw resource
   */
  private convertToResource(record: any, index: number): RawResource {
    // Map CSV columns to resource fields
    const resource: RawResource = {
      title: record.title || '',
      description: record.description || '',
      url: record.url || '',
      resource_type: record.resource_type || record.type || 'article',
      difficulty_level: record.difficulty_level || record.difficulty || 'beginner',
      estimated_time_minutes: this.toNumber(record.estimated_time_minutes || record.time_minutes),
      is_premium: this.toBoolean(record.is_premium || record.premium),
      is_published: this.toBoolean(record.is_published || record.published),
      author_id: record.author_id || record.author || undefined
    };
    
    // Handle categories and tags
    if (record.categories) {
      resource.categories = this.toArray(record.categories);
    }
    
    if (record.tags) {
      resource.tags = this.toArray(record.tags);
    }
    
    // Add any additional fields
    Object.keys(record).forEach(key => {
      if (!['title', 'description', 'url', 'resource_type', 'type', 
            'difficulty_level', 'difficulty', 'estimated_time_minutes', 
            'time_minutes', 'is_premium', 'premium', 'is_published', 
            'published', 'author_id', 'author', 'categories', 'tags'].includes(key)) {
        resource[key] = record[key];
      }
    });
    
    return resource;
  }
}