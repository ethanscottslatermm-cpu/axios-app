export default function DayMacroSummary({ day, targets }) {
  const calculateMacros = () => {
    return day.meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const currentMacros = calculateMacros()

  const getPercentage = (current, target) => {
    return target > 0 ? Math.round((current / target) * 100) : 0
  }

  const getMacroStatus = (current, target) => {
    const pct = getPercentage(current, target)
    if (pct < 90) return 'low'
    if (pct > 110) return 'high'
    return 'good'
  }

  const MacroBar = ({ label, current, target, unit }) => {
    const pct = Math.min(100, getPercentage(current, target))
    const status = getMacroStatus(current, target)

    return (
      <div className={`macro-bar ${status}`}>
        <div className="macro-label">
          <span>{label}</span>
          <span className="macro-value">{current}/{target}{unit}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="macro-percentage">{getPercentage(current, target)}%</div>
      </div>
    )
  }

  return (
    <div className="day-macro-summary">
      <h3>Daily Summary</h3>

      <div className="macro-summary-grid">
        <MacroBar
          label="Calories"
          current={currentMacros.calories}
          target={targets.calories}
          unit=""
        />
        <MacroBar
          label="Protein"
          current={currentMacros.protein}
          target={targets.protein}
          unit="g"
        />
        <MacroBar
          label="Carbs"
          current={currentMacros.carbs}
          target={targets.carbs}
          unit="g"
        />
        <MacroBar
          label="Fat"
          current={currentMacros.fat}
          target={targets.fat}
          unit="g"
        />
      </div>

      <div className="remaining">
        <h4>Remaining</h4>
        <div className="remaining-grid">
          <div>
            <span>Calories:</span>
            <strong>{Math.max(0, targets.calories - currentMacros.calories)}</strong>
          </div>
          <div>
            <span>Protein:</span>
            <strong>{Math.max(0, targets.protein - currentMacros.protein)}g</strong>
          </div>
          <div>
            <span>Carbs:</span>
            <strong>{Math.max(0, targets.carbs - currentMacros.carbs)}g</strong>
          </div>
          <div>
            <span>Fat:</span>
            <strong>{Math.max(0, targets.fat - currentMacros.fat)}g</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
