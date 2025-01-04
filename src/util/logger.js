// logger.js
export function logInfo(message) {
    console.log(`[INFO]: ${message}`);
  }
  
  export function logError(message) {
    console.error(`[ERROR]: ${message}`);
  }
  
  export function logDebug(message) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG]: ${message}`);
    }
  }
  