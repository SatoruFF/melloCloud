/**
 * API response and error types for melloCloud frontend
 */

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode?: number;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  data: T;
  status: 'success';
}

/**
 * Type guard to check if a value is an API error response
 */
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    'message' in value
  );
}

/**
 * Type guard to check if error is an API error
 */
export function isApiError(error: unknown): error is ApiErrorResponse {
  return isApiErrorResponse(error);
}

/**
 * Extract error message from unknown error type (for catch blocks)
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (isApiErrorResponse(error)) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Extract status code from error
 */
export function getErrorStatusCode(error: unknown): number {
  if (isApiErrorResponse(error)) {
    return error.statusCode || 500;
  }
  if (error instanceof Error && 'statusCode' in error) {
    const code = (error as Record<string, unknown>).statusCode;
    if (typeof code === 'number') {
      return code;
    }
  }
  return 500;
}
