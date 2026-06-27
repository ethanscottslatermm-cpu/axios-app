export const calculateMacrosFromCalories = (calories, proteinPct = 0.3, carbsPct = 0.45, fatPct = 0.25) => {
  const proteinCals = calories * proteinPct
  const carbsCals = calories * carbsPct
  const fatCals = calories * fatPct

  return {
    protein: Math.round(proteinCals / 4),
    carbs: Math.round(carbsCals / 4),
    fat: Math.round(fatCals / 9),
  }
}

export const calculateCaloriesFromMacros = (protein, carbs, fat) => {
  return (protein * 4) + (carbs * 4) + (fat * 9)
}

export const scaleMacros = (macros, scaleFactor) => {
  return {
    calories: Math.round(macros.calories * scaleFactor),
    protein: Math.round(macros.protein * scaleFactor),
    carbs: Math.round(macros.carbs * scaleFactor),
    fat: Math.round(macros.fat * scaleFactor),
  }
}

export const sumMacros = (macrosList) => {
  return macrosList.reduce(
    (acc, macros) => ({
      calories: acc.calories + (macros.calories || 0),
      protein: acc.protein + (macros.protein || 0),
      carbs: acc.carbs + (macros.carbs || 0),
      fat: acc.fat + (macros.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export const getMacroPercentage = (current, target) => {
  return target > 0 ? Math.round((current / target) * 100) : 0
}

export const getMacroStatus = (current, target, tolerance = 10) => {
  const pct = getMacroPercentage(current, target)
  if (pct < 100 - tolerance) return 'low'
  if (pct > 100 + tolerance) return 'high'
  return 'good'
}

export const getMacroColor = (status) => {
  switch (status) {
    case 'good':
      return '#86EFAC'
    case 'low':
      return '#FB923C'
    case 'high':
      return '#F87171'
    default:
      return '#9ab4cc'
  }
}
