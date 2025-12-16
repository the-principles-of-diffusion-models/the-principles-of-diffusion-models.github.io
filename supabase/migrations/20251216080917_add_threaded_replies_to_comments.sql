/*
  # Add Threaded Replies Support to Comments

  ## Purpose
  Enable nested replies in the comments system where users can reply to specific comments.

  ## Changes
  
  ### Modified Tables
  - `comments` table:
    - Added `parent_id` (uuid, nullable) - References parent comment for threaded replies
    - Added foreign key constraint to ensure parent_id references valid comments
    - Added index for faster query of replies

  ## Security
  - Existing RLS policies continue to apply
  - No changes needed to security model

  ## Notes
  - If parent_id is NULL, it's a top-level comment
  - If parent_id has a value, it's a reply to that comment
  - Foreign key ensures referential integrity
*/

-- Add parent_id column for threaded replies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN parent_id uuid REFERENCES comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for faster queries of replies
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;