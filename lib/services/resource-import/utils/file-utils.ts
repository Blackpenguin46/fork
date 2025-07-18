/**
 * File Utilities
 * 
 * Utility functions for working with files in the resource import system.
 */

import fs from 'fs';
import path from 'path';

/**
 * File type detection result
 */
export interface FileTypeResult {
  extension: string;
  mimeType: string;
  isSupported: boolean;
}

/**
 * Supported file types for resource import
 */
export const SUPPORTED_FILE_TYPES = {
  csv: 'text/csv',
  json: 'application/json',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel'
};

/**
 * Detect the type of a file
 * @param filePath Path to the file
 * @returns File type information
 */
export async function detectFileType(filePath: string): Promise<FileTypeResult> {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  // Get file extension
  const extension = path.extname(filePath).toLowerCase().substring(1);
  
  // Determine MIME type based on extension
  let mimeType = '';
  switch (extension) {
    case 'csv':
      mimeType = 'text/csv';
      break;
    case 'json':
      mimeType = 'application/json';
      break;
    case 'xlsx':
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      break;
    case 'xls':
      mimeType = 'application/vnd.ms-excel';
      break;
    default:
      mimeType = 'application/octet-stream';
  }
  
  // Check if file type is supported
  const isSupported = Object.keys(SUPPORTED_FILE_TYPES).includes(extension);
  
  return {
    extension,
    mimeType,
    isSupported
  };
}

/**
 * Validate that a file exists and is of a supported type
 * @param filePath Path to the file
 * @returns File type information if valid
 * @throws Error if file doesn't exist or is not supported
 */
export async function validateFile(filePath: string): Promise<FileTypeResult> {
  const fileType = await detectFileType(filePath);
  
  if (!fileType.isSupported) {
    throw new Error(`Unsupported file type: ${fileType.extension}. Supported types: ${Object.keys(SUPPORTED_FILE_TYPES).join(', ')}`);
  }
  
  return fileType;
}

/**
 * Get a temporary file path for storing intermediate results
 * @param prefix Prefix for the temporary file
 * @param extension File extension
 * @returns Path to a temporary file
 */
export function getTempFilePath(prefix: string, extension: string): string {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 10);
  return path.join(process.cwd(), 'tmp', `${prefix}-${timestamp}-${randomStr}.${extension}`);
}