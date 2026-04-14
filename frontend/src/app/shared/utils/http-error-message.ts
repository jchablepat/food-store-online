import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(
  errorResponse: unknown,
  fallbackMessage = 'Ocurrio un error inesperado. Intenta nuevamente.'
): string {
  if (typeof errorResponse === 'string' && errorResponse.trim()) {
    return errorResponse;
  }

  if (errorResponse instanceof HttpErrorResponse) {
    const error = errorResponse.error;

    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (error && typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }

    if (typeof errorResponse.message === 'string' && errorResponse.message.trim()) {
      return errorResponse.message;
    }
  }

  if (
    errorResponse &&
    typeof errorResponse === 'object' &&
    'message' in errorResponse &&
    typeof (errorResponse as { message?: unknown }).message === 'string' &&
    (errorResponse as { message: string }).message.trim()
  ) {
    return (errorResponse as { message: string }).message;
  }

  return fallbackMessage;
}
