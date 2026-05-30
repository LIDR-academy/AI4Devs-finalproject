import { onUnmounted } from 'vue'

interface RunWithAbortOptions {
  abortPrevious?: boolean
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function useAbortableRequest() {
  let currentController: AbortController | null = null

  function cancel(): void {
    currentController?.abort()
    currentController = null
  }

  async function runWithAbort<T>(
    runner: (signal: AbortSignal) => Promise<T>,
    options: RunWithAbortOptions = {},
  ): Promise<T> {
    const { abortPrevious = true } = options

    if (abortPrevious) {
      cancel()
    }

    const controller = new AbortController()
    currentController = controller

    try {
      return await runner(controller.signal)
    } finally {
      if (currentController === controller) {
        currentController = null
      }
    }
  }

  onUnmounted(() => {
    cancel()
  })

  return {
    runWithAbort,
    cancel,
    isAbortError,
  }
}
