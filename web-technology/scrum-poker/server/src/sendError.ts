import type { Response } from 'express'
import type { ApiErrorBody } from '@scrum-poker/shared'

// Every error response has the same JSON shape: { "error": "..." }
export function sendError(res: Response, status: number, error: string): void {
  const body: ApiErrorBody = { error }
  res.status(status).json(body)
}
