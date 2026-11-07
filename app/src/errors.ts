import { ref } from 'vue'

export interface AppError {
  message: string
}

/** The last unexpected error, shown by App.vue as an alert with a way out. */
export const appError = ref<AppError | null>(null)

/** Used for `app.config.errorHandler` and `router.onError`. */
export function reportError(error: unknown, info?: string): void {
  console.error(info ? `Unexpected error (${info}):` : 'Unexpected error:', error)
  appError.value = { message: error instanceof Error ? error.message : String(error) }
}

export function clearError(): void {
  appError.value = null
}
