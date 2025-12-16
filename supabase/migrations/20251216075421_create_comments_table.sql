/*
  # Create Comments Table for Discussion Panel

  ## Purpose
  Allow visitors to leave feedback and comments without requiring authentication.

  ## Tables
  
  ### `comments`
  - `id` (uuid, primary key) - Unique identifier for each comment
  - `author_name` (text) - Name of the commenter (optional, defaults to "Anonymous")
  - `content` (text) - The comment text content
  - `created_at` (timestamptz) - When the comment was posted
  - `is_visible` (boolean) - Flag to hide inappropriate comments if needed

  ## Security
  - Enable RLS on comments table
  - Allow public read access for visible comments
  - Allow public insert for new comments
  - Restrict update/delete to prevent abuse

  ## Notes
  - No authentication required to post comments
  - Comments are public and visible to all visitors
  - Moderation can be done by hiding comments via is_visible flag
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text DEFAULT 'Anonymous',
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_visible boolean DEFAULT true
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_visible ON comments(is_visible) WHERE is_visible = true;

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read visible comments
CREATE POLICY "Anyone can read visible comments"
  ON comments FOR SELECT
  TO public
  USING (is_visible = true);

-- Policy: Anyone can insert comments
CREATE POLICY "Anyone can insert comments"
  ON comments FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: No one can update comments (prevents editing after posting)
-- If moderation is needed, it would be done through a separate admin interface

-- Policy: No one can delete comments (prevents abuse)
-- If moderation is needed, use is_visible flag instead