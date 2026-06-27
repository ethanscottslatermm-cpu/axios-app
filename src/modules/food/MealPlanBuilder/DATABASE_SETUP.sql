-- Meal Plan Tables Setup
-- Run these queries in Supabase SQL Editor

-- Table: meal_plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  macro_targets JSONB DEFAULT '{"calories":2500,"protein":150,"carbs":300,"fat":80}',
  meal_data JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_created_at ON meal_plans(created_at DESC);

-- Enable RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own meal plans
CREATE POLICY "Users can view their own meal plans"
  ON meal_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own meal plans
CREATE POLICY "Users can insert their own meal plans"
  ON meal_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own meal plans
CREATE POLICY "Users can update their own meal plans"
  ON meal_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own meal plans
CREATE POLICY "Users can delete their own meal plans"
  ON meal_plans
  FOR DELETE
  USING (auth.uid() = user_id);
