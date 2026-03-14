/**
 * Error handling types and utilities for melloCloud backend
 */

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode?: number;
  details?: unknown;
}

export interface ValidationError extends ErrorResponse {
  field?: string;
}

/**
 * Type guard to check if a value is an Error object
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if a value has an error property (API errors)
 */
export function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    'message' in value
  );
}

/**
 * Extract error message from unknown error type
 * Safe handler for catch blocks with `error: unknown`
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (isErrorResponse(error)) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Extract status code from unknown error type
 * Returns the statusCode if available, defaults to 500
 */
export function getErrorStatusCode(error: unknown): number {
  if (isErrorResponse(error)) {
    return error.statusCode || 500;
  }
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const code = (error as Record<string, unknown>).statusCode;
    if (typeof code === 'number') {
      return code;
    }
  }
  return 500;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  statusCode = 500
): ErrorResponse {
  const message = getErrorMessage(error);
  return {
    error: statusCode >= 500 ? 'InternalServerError' : 'ClientError',
    message,
    statusCode,
    details: isError(error) ? { stack: error.stack } : undefined,
  };
}
