// src/presentation/utils/errorResponse.ts

/**
 * Creates a standardized error Response object
 * @param {string} message - Error message to return to client
 * @param {number} [status=500] - HTTP status code for the response
 * @returns {Response} Response object with error details and proper headers
 * @example
 * return errorResponse('Not found', 404);
 */
export const errorResponse = (message: string, status: number = 500) => {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
