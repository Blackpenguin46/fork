/**
 * Base File Processor
 * 
 * Defines the interface and common functionality for all file processors.
 */

import { RawResource } from '../types';

/**
 * Interface for file processors
 */
export interface FileProcessor {
  /**
   * Check if this processor can handle the given file
   * @param filePath Path to the file
   * @returns True if the processor can handle the file
   */
  canProcess(filePath: string): boolean;
  
  /**
   * Process the file and extract resources
   * @param filePath Path to the file
   * @returns Array of raw resources
   */
  process(filePath: string): Promise<RawResource[]>;
  
  /**
   * Get the name of the processor
   */
  getName(): string;
}

/**
 * Abstract base class for file processors
 */
export abstract class BaseFileProcessor implements FileProcessor {
  /**
   * Check if this processor can handle the given file
   * @param filePath Path to the file
   * @returns True if the processor can handle the file
   */
  abstract canProcess(filePath: string): boolean;
  
  /**
   * Process the file and extract resources
   * @param filePath Path to the file
   * @returns Array of raw resources
   */
  abstract process(filePath: string): Promise<RawResource[]>;
  
  /**
   * Get the name of the processor
   */
  abstract getName(): string;
  
  /**
   * Get the file extension from a path
   * @param filePath Path to the file
   * @returns File extension (lowercase, without the dot)
   */
  protected getFileExtension(filePath: string): string {
    return filePath.split('.').pop()?.toLowerCase() || '';
  }
  
  /**
   * Check if a value is empty (null, undefined, or empty string)
   * @param value Value to check
   * @returns True if the value is empty
   */
  protected isEmpty(value: any): boolean {
    return value === null || value === undefined || value === '';
  }
  
  /**
   * Convert a string value to boolean
   * @param value String value
   * @returns Boolean value
   */
  protected toBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const lowercased = value.toLowerCase().trim();
      return lowercased === 'true' || lowercased === 'yes' || lowercased === '1';
    }
    return false;
  }
  
  /**
   * Convert a string value to number
   * @param value String value
   * @returns Number value or undefined if conversion fails
   */
  protected toNumber(value: any): number | undefined {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }
  
  /**
   * Convert a string to an array by splitting on delimiter
   * @param value String value
   * @param delimiter Delimiter to split on (default: comma)
   * @returns Array of strings
   */
  protected toArray(value: any, delimiter: string = ','): string[] {
    if (Array.isArray(value)) return value.map(v => String(v));
    if (typeof value === 'string') {
      return value.split(delimiter).map(v => v.trim()).filter(v => v !== '');
    }
    return [];
  }
}