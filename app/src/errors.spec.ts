import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { appError, clearError, reportError } from './errors'

beforeEach(() => {
  clearError()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('reportError', () => {
  it('logs the error and keeps its message for the alert', () => {
    const error = new Error('Something broke')
    reportError(error, 'render function')
    expect(console.error).toHaveBeenCalledWith('Unexpected error (render function):', error)
    expect(appError.value).toEqual({ message: 'Something broke' })
  })

  it('copes with things that are not Errors', () => {
    reportError('just a string')
    expect(appError.value).toEqual({ message: 'just a string' })
    reportError(undefined)
    expect(appError.value).toEqual({ message: 'undefined' })
  })

  it('can be cleared', () => {
    reportError(new Error('x'))
    clearError()
    expect(appError.value).toBeNull()
  })
})
