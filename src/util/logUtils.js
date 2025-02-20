// src/util/logUtils.js

function myLogSummarizationFunction(logs) {
    // VERY BASIC EXAMPLE - Replace with your actual logic
    let errorCount = 0;
    let warningCount = 0;
    const errors = [];

    for (const log of logs) {
        if (typeof log === 'string') {
            if (log.toLowerCase().includes('error')) {
                errorCount++;
                errors.push(log);
            }
            if (log.toLowerCase().includes('warning')) {
                warningCount++;
            }
        } // Add handling for other log formats (e.g., JSON objects)
    }

    return {
        errorCount,
        warningCount,
        errors: errors.slice(0,5), // Limit the number of example errors
        totalLogs: logs.length,
    };
}

export { myLogSummarizationFunction };