import { useState } from 'react'
import MealSelector from './MealSelector'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks']

export default function MealPlanCalendar({ days, selectedDay, onSelectDay, onAddMeal, onRemoveMeal, targets }) {
  const [showMealSelector, setShowMealSelector] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState('lunch')

  const handleAddMeal = (meal) => {
    onAddMeal(meal, selectedDay, selectedMealType)
    setShowMealSelector(false)
  }

  const currentDay = days[selectedDay]

  return (
    <div className="meal-plan-calendar">
      <div className="day-selector">
        {DAYS.map((day, idx) => (
          <button
            key={day}
            className={`day-btn ${selectedDay === idx ? 'active' : ''}`}
            onClick={() => onSelectDay(idx)}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="current-day-meals">
        <h3>{DAYS[selectedDay]}</h3>

        {MEAL_TYPES.map(mealType => (
          <div key={mealType} className="meal-section">
            <h4>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h4>

            <div className="meals-list">
              {currentDay.meals
                .filter(m => m.mealType === mealType)
                .map(meal => (
                  <div key={meal.id} className="meal-item">
                    <div className="meal-info">
                      <p>{meal.name} ({meal.quantity}g)</p>
                      <small>{meal.calories} cal | P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g</small>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => onRemoveMeal(selectedDay, meal.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>

            <button
              className="add-meal-btn"
              onClick={() => {
                setSelectedMealType(mealType)
                setShowMealSelector(true)
              }}
            >
              + Add {mealType}
            </button>
          </div>
        ))}
      </div>

      {showMealSelector && (
        <div className="meal-selector-modal">
          <MealSelector
            onSelectMeal={handleAddMeal}
            onClose={() => setShowMealSelector(false)}
          />
        </div>
      )}
    </div>
  )
}
