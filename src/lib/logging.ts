export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta: meta ?? undefined,
  }
  // structured log on single line for easy parsing
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload))
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
}
