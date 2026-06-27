# Meal Plan Builder - Implementation Guide

## Overview
This is a complete skeleton for the Macro-Based Meal Plan Builder MVP. All files are created with working structure. Follow these steps to complete the implementation.

## File Structure
```
src/modules/food/
├── MealPlanBuilder/
│   ├── MealPlanBuilder.jsx (✅ Complete - Main container)
│   ├── MacroTargetInput.jsx (✅ Complete - Input macro targets)
│   ├── MealPlanCalendar.jsx (✅ Complete - 7-day calendar view)
│   ├── MealSelector.jsx (✅ Complete - Search & add foods)
│   ├── DayMacroSummary.jsx (✅ Complete - Daily nutrition summary)
│   ├── styles.css (✅ Complete - All styling)
│   ├── DATABASE_SETUP.sql (✅ Complete - Database queries)
│   └── IMPLEMENTATION_GUIDE.md (this file)
├── hooks/
│   └── useMealPlan.js (✅ Complete - CRUD operations)
├── lib/
│   └── macroHelpers.js (✅ Complete - Utility functions)
└── (existing food module files)
```

## Step-by-Step Setup

### Step 1: Set Up Database (5 minutes)
1. Open Supabase Dashboard → SQL Editor
2. Copy all SQL from `DATABASE_SETUP.sql`
3. Paste and run in SQL Editor
4. Verify tables are created: `meal_plans`

### Step 2: Add Routing (5 minutes)
1. Open `src/modules/food/FoodJournal.jsx` (or main food module file)
2. Import the MealPlanBuilder:
```jsx
import MealPlanBuilder from './MealPlanBuilder/MealPlanBuilder'
```
3. Add route for meal plan builder (or button to navigate to it)
4. Example navigation button in food module:
```jsx
<button onClick={() => navigate('/food/meal-plan')}>
  Create Meal Plan
</button>
```

### Step 3: Verify Hook Integration (2 minutes)
1. The `useMealPlan` hook expects `useFoodLog` to exist
2. Verify that `useFoodLog` is working in your food module
3. If not, create it or update the import in `MealSelector.jsx`

### Step 4: Test the Component (10 minutes)
1. Start dev server: `npm run dev`
2. Navigate to the Meal Plan Builder
3. Test these features:
   - ✅ Input macro targets (calories, protein, carbs, fat)
   - ✅ Auto-calculate macros from calories
   - ✅ Select different days of the week
   - ✅ Add meals from food log
   - ✅ Remove meals
   - ✅ See daily macro summaries
   - ✅ Save meal plan

## Component Documentation

### MealPlanBuilder.jsx
**Main container component**
- Manages meal plan state
- Handles adding/removing meals
- Provides save functionality
- Props: None (uses own state)

### MacroTargetInput.jsx
**User inputs daily macro targets**
- Calories input
- Protein/Carbs/Fat inputs
- Auto-calculate macro split from calories (30/45/25%)
- Props:
  - `targets` (object): Current macro targets
  - `onChange` (function): Called when targets change

### MealPlanCalendar.jsx
**7-day meal planning calendar**
- Shows all days of week
- Select day to view/edit meals
- Add meals by type (breakfast, lunch, dinner, snacks)
- Remove meals
- Props:
  - `days` (array): Array of day objects with meals
  - `selectedDay` (number): Currently selected day index
  - `onSelectDay` (function): Called when day is selected
  - `onAddMeal` (function): Called to add meal
  - `onRemoveMeal` (function): Called to remove meal
  - `targets` (object): Macro targets for reference

### MealSelector.jsx
**Search and add foods from food log**
- Search existing foods
- Show nutrition info
- Adjust quantity (grams)
- Preview scaled nutrition
- Props:
  - `onSelectMeal` (function): Called with selected meal
  - `onClose` (function): Called to close modal

### DayMacroSummary.jsx
**Visual summary of daily macros vs targets**
- Progress bars for each macro
- Status color coding (green/yellow/red)
- Shows remaining macros
- Props:
  - `day` (object): Day object with meals array
  - `targets` (object): Macro targets

## Hook Documentation

### useMealPlan.js
**Manages meal plan data operations**

Methods:
- `createMealPlan(mealPlan)` - Create new meal plan
- `updateMealPlan({ id, mealPlan })` - Update existing plan
- `deleteMealPlan(id)` - Delete meal plan
- `plans` - Array of user's meal plans
- `isLoading` - Loading state
- `loading` - Operation loading state

## Utility Functions (macroHelpers.js)

- `calculateMacrosFromCalories(calories, proteinPct, carbsPct, fatPct)`
- `calculateCaloriesFromMacros(protein, carbs, fat)`
- `scaleMacros(macros, scaleFactor)`
- `sumMacros(macrosList)`
- `getMacroPercentage(current, target)`
- `getMacroStatus(current, target, tolerance)`
- `getMacroColor(status)`

## Known Requirements

1. **useFoodLog hook** must return array of food logs with:
   - `id`
   - `food_name`
   - `calories`
   - `protein`
   - `carbs`
   - `fat`

2. **Supabase tables** needed:
   - `meal_plans` (created by DATABASE_SETUP.sql)
   - `auth.users` (standard auth table)

3. **CSS Variables** used:
   - `--bg-dark`
   - `--text-primary`
   - `--text-muted`

## Feature Checklist

- [x] Create meal plan with daily macro targets
- [x] 7-day calendar view
- [x] Add/remove meals from each day
- [x] Search foods from food log
- [x] Adjust quantity/servings
- [x] Real-time macro calculations
- [x] Daily macro summary with progress bars
- [x] Save meal plans to database
- [x] Load saved meal plans
- [x] Delete meal plans
- [ ] Edit saved meal plans
- [ ] Share meal plans
- [ ] Shopping list generation
- [ ] Meal templates/favorites

## Next Steps (Phase 2)

After MVP is working, consider adding:
1. **Meal Templates** - Save favorite meal combinations
2. **Shopping List** - Auto-generate from ingredients
3. **Meal Plan List** - View/edit/delete saved plans
4. **AI Suggestions** - Use Claude API to suggest meals

## Troubleshooting

**Issue: "useFoodLog is not a function"**
- Solution: Verify useFoodLog exists in your food module hooks
- Check the actual hook name in FoodJournal.jsx

**Issue: Meals not being added**
- Check browser console for errors
- Verify food log has data to display

**Issue: Database errors**
- Verify DATABASE_SETUP.sql was run completely
- Check RLS policies are enabled
- Verify user_id is being passed correctly

## Questions?
Check the components for inline comments. Each major function has documentation.
