import { useState } from 'react'

export default function MacroTargetInput({ targets, onChange }) {
  const [localTargets, setLocalTargets] = useState(targets)

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = {
      ...localTargets,
      [name]: parseInt(value) || 0,
    }
    setLocalTargets(updated)
    onChange(updated)
  }

  const calculateFromCals = () => {
    const cals = localTargets.calories
    const proteinCals = cals * 0.3
    const carbsCals = cals * 0.45
    const fatCals = cals * 0.25

    const updated = {
      calories: cals,
      protein: Math.round(proteinCals / 4),
      carbs: Math.round(carbsCals / 4),
      fat: Math.round(fatCals / 9),
    }
    setLocalTargets(updated)
    onChange(updated)
  }

  return (
    <div className="macro-target-input">
      <h2>Daily Macro Targets</h2>

      <div className="input-group">
        <label>
          Calories
          <input
            type="number"
            name="calories"
            value={localTargets.calories}
            onChange={handleChange}
          />
        </label>
        <button onClick={calculateFromCals} className="calc-btn">Auto-Calculate Macros</button>
      </div>

      <div className="macro-inputs">
        <label>
          Protein (g)
          <input
            type="number"
            name="protein"
            value={localTargets.protein}
            onChange={handleChange}
          />
        </label>

        <label>
          Carbs (g)
          <input
            type="number"
            name="carbs"
            value={localTargets.carbs}
            onChange={handleChange}
          />
        </label>

        <label>
          Fat (g)
          <input
            type="number"
            name="fat"
            value={localTargets.fat}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="macro-summary">
        <p>Protein: {localTargets.protein * 4} cal</p>
        <p>Carbs: {localTargets.carbs * 4} cal</p>
        <p>Fat: {localTargets.fat * 9} cal</p>
        <p className="total">Total: {(localTargets.protein * 4) + (localTargets.carbs * 4) + (localTargets.fat * 9)} cal</p>
      </div>
    </div>
  )
}
