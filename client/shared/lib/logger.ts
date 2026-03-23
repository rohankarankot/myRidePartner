type LogContext = Record<string, unknown>;

function formatContext(context?: LogContext) {
  return context ? [context] : [];
}

export const logger = {
  debug(message: string, context?: LogContext) {
    console.log(message, ...formatContext(context));
  },
  info(message: string, context?: LogContext) {
    console.info(message, ...formatContext(context));
  },
  warn(message: string, context?: LogContext) {
    console.warn(message, ...formatContext(context));
  },
  error(message: string, context?: LogContext) {
    console.error(message, ...formatContext(context));
  },
};
