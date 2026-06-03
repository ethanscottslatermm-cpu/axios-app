-- Add biometric_enabled column to profiles table.
-- Run this migration before deploying the biometric auth feature.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT false;
