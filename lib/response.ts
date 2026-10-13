/**
 * @file lib/response.ts
 * @description Standardized typed Server Action and API response helper.
 * Strict TypeScript: ZERO `any`.
 */

export type ActionResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export function successResponse<T>(data: T, message?: string): ActionResult<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
}

export function errorResponse<T = never>(
  error: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<T> {
  return {
    success: false,
    error,
    ...(fieldErrors ? { fieldErrors } : {}),
  };
}
