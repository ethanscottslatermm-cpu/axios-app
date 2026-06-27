import { useState, useEffect } from 'react'
import { useFoodLog } from '../hooks/useFoodLog'

export default function MealSelector({ onSelectMeal, onClose }) {
  const { logs } = useFoodLog()
  const [searchTerm, setSearchTerm] = useState('')
  const [quantity, setQuantity] = useState(100)
  const [selectedFood, setSelectedFood] = useState(null)

  const foods = logs ? logs.map(log => ({
    id: log.id,
    name: log.food_name,
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
  })) : []

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (food) => {
    const scaleFactor = quantity / 100
    onSelectMeal({
      ...food,
      quantity,
      calories: Math.round(food.calories * scaleFactor),
      protein: Math.round(food.protein * scaleFactor),
      carbs: Math.round(food.carbs * scaleFactor),
      fat: Math.round(food.fat * scaleFactor),
    })
  }

  return (
    <div className="meal-selector">
      <div className="meal-selector-header">
        <h3>Select Food</h3>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <input
        type="text"
        placeholder="Search foods..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="food-list">
        {filteredFoods.length > 0 ? (
          filteredFoods.map(food => (
            <div
              key={food.id}
              className={`food-item ${selectedFood?.id === food.id ? 'selected' : ''}`}
              onClick={() => setSelectedFood(food)}
            >
              <div className="food-name">{food.name}</div>
              <div className="food-macros">
                {food.calories} cal | P:{food.protein}g C:{food.carbs}g F:{food.fat}g
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No foods found. Add some foods to your food log first.</p>
        )}
      </div>

      {selectedFood && (
        <div className="quantity-selector">
          <label>
            Quantity (g)
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              min="1"
            />
          </label>

          <div className="preview">
            <p>{selectedFood.name} × {quantity}g</p>
            <small>
              {Math.round(selectedFood.calories * quantity / 100)} cal |
              P:{Math.round(selectedFood.protein * quantity / 100)}g
              C:{Math.round(selectedFood.carbs * quantity / 100)}g
              F:{Math.round(selectedFood.fat * quantity / 100)}g
            </small>
          </div>

          <button
            onClick={() => handleSelect(selectedFood)}
            className="confirm-btn"
          >
            Add to Meal Plan
          </button>
        </div>
      )}
    </div>
  )
}
