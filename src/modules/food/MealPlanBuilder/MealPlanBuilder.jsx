import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMealPlan } from '../hooks/useMealPlan'
import MacroTargetInput from './MacroTargetInput'
import MealPlanCalendar from './MealPlanCalendar'
import DayMacroSummary from './DayMacroSummary'
import './styles.css'

export default function MealPlanBuilder() {
  const navigate = useNavigate()
  const { createMealPlan, updateMealPlan, loading } = useMealPlan()

  const [mealPlan, setMealPlan] = useState({
    name: 'My Meal Plan',
    macroTargets: {
      calories: 2500,
      protein: 150,
      carbs: 300,
      fat: 80,
    },
    days: Array(7).fill(null).map(() => ({
      meals: [],
      macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    })),
  })

  const [selectedDay, setSelectedDay] = useState(0)

  const handleMacroTargetChange = (targets) => {
    setMealPlan(prev => ({
      ...prev,
      macroTargets: targets,
    }))
  }

  const handleAddMeal = (meal, dayIndex, mealType) => {
    setMealPlan(prev => {
      const updated = { ...prev }
      updated.days[dayIndex].meals.push({
        ...meal,
        mealType,
        id: `${dayIndex}-${Date.now()}`,
      })
      return updated
    })
  }

  const handleRemoveMeal = (dayIndex, mealId) => {
    setMealPlan(prev => {
      const updated = { ...prev }
      updated.days[dayIndex].meals = updated.days[dayIndex].meals.filter(m => m.id !== mealId)
      return updated
    })
  }

  const handleSavePlan = async () => {
    try {
      await createMealPlan(mealPlan)
      navigate('/food')
    } catch (error) {
      console.error('Error saving meal plan:', error)
    }
  }

  return (
    <div className="meal-plan-builder">
      <div className="meal-plan-header">
        <button onClick={() => navigate('/food')} className="back-btn">← Back</button>
        <h1>Create Meal Plan</h1>
        <button onClick={handleSavePlan} className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Plan'}
        </button>
      </div>

      <div className="meal-plan-content">
        <div className="meal-plan-sidebar">
          <MacroTargetInput
            targets={mealPlan.macroTargets}
            onChange={handleMacroTargetChange}
          />
        </div>

        <div className="meal-plan-main">
          <MealPlanCalendar
            days={mealPlan.days}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onAddMeal={handleAddMeal}
            onRemoveMeal={handleRemoveMeal}
            targets={mealPlan.macroTargets}
          />

          <DayMacroSummary
            day={mealPlan.days[selectedDay]}
            targets={mealPlan.macroTargets}
          />
        </div>
      </div>
    </div>
  )
}
