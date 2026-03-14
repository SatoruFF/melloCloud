/**
 * Content types for dynamic data (BlockNote, Spreadsheets, etc.)
 */

/**
 * BlockNote editor content type
 * Supports both rich text blocks and raw JSON structures
 */
export type BlockNoteContent = Record<string, unknown> | string;

/**
 * Spreadsheet cell data
 */
export type SpreadsheetCell = string | number | boolean | null;

/**
 * Spreadsheet grid data
 */
export type SpreadsheetData = SpreadsheetCell[][];

/**
 * Generic dynamic data that can be any JSON-serializable value
 */
export type DynamicContent = unknown;

/**
 * Type guard for BlockNote content
 */
export function isBlockNoteContent(value: unknown): value is BlockNoteContent {
  return typeof value === 'object' || typeof value === 'string';
}

/**
 * Type guard for spreadsheet data
 */
export function isSpreadsheetData(value: unknown): value is SpreadsheetData {
  return (
    Array.isArray(value) &&
    (value.length === 0 || Array.isArray(value[0]))
  );
}
