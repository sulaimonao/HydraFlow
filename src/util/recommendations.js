//src/util/recommendations.js

export const generateRecommendations = (gaugeMetrics) => {
    const recommendations = [];
  
    if (gaugeMetrics.tokenUsage?.used / gaugeMetrics.tokenUsage?.total > 0.8) {
      recommendations.push("Consider reducing token usage to optimize performance.");
    }
  
    if (gaugeMetrics.responseLatency > 1.0) {
      recommendations.push("High latency detected. Review response processing time.");
    }
  
    if (gaugeMetrics.totalSubpersonas > 5) {
      recommendations.push("Too many active sub-personas may impact performance. Consider optimizing.");
    }
  
    return recommendations;
  };
  