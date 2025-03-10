// Utility functions for generating series data
import { evaluateCustomFunction } from "@/lib/custom-functions"

export function generateSeriesData(
  seriesType: string,
  startValue: number,
  endValue: number,
  points: number,
  customExpression?: string,
) {
  // Generate x values (domain)
  const step = (endValue - startValue) / (points - 1)
  const xValues = Array.from({ length: points }, (_, i) => startValue + i * step)

  // Generate ideal values based on series type
  const idealValues = xValues.map((x) => {
    switch (seriesType) {
      case "sine":
        return Math.sin(x)
      case "cosine":
        return Math.cos(x)
      case "tangent":
        return Math.tan(x)
      case "custom":
        // Use the custom expression if provided
        if (customExpression) {
          return evaluateCustomFunction(customExpression, x)
        }
        // Fallback to a default custom function
        return Math.sin(x) + Math.cos(x) / 2
      default:
        return Math.sin(x)
    }
  })

  // Generate "generated" values with small random errors
  const generatedValues = idealValues.map((val) => {
    const error = (Math.random() - 0.5) * 0.5
    return val + error
  })

  // Calculate error values
  const errorValues = idealValues.map((ideal, i) => Math.abs(ideal - generatedValues[i]))

  // Calculate error statistics
  const maxError = Math.max(...errorValues)
  const minError = Math.min(...errorValues)
  const avgError = errorValues.reduce((sum, val) => sum + val, 0) / errorValues.length

  // Calculate standard deviation of error
  const squaredDiffs = errorValues.map((val) => Math.pow(val - avgError, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / errorValues.length
  const stdError = Math.sqrt(variance)

  return {
    labels: xValues.map((x) => x.toFixed(2)),
    generated: generatedValues,
    ideal: idealValues,
    error: errorValues,
    maxError,
    minError,
    avgError,
    stdError,
  }
}

