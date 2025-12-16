/*
  # Fix Visitor Tracking Issues

  ## Changes
  1. Ensure the trigger function is working correctly with proper execution
  2. Manually update site_stats to reflect current visitor count
  3. Verify the trigger is properly attached
  
  ## Security Notes
  - Maintains existing RLS policies for public access
  - Ensures trigger function executes with proper permissions
*/

-- Recreate the update_visitor_stats function with proper settings
CREATE OR REPLACE FUNCTION update_visitor_stats()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE site_stats 
  SET unique_visitors = (SELECT COUNT(DISTINCT visitor_id) FROM visitors),
      updated_at = now()
  WHERE id IS NOT NULL;
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS visitor_stats_trigger ON visitors;
CREATE TRIGGER visitor_stats_trigger
  AFTER INSERT OR UPDATE ON visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_visitor_stats();

-- Manually update site_stats to reflect current count
UPDATE site_stats 
SET unique_visitors = (SELECT COUNT(DISTINCT visitor_id) FROM visitors),
    updated_at = now();

-- If site_stats is empty, insert a row
INSERT INTO site_stats (unique_visitors, updated_at)
SELECT 0, now()
WHERE NOT EXISTS (SELECT 1 FROM site_stats);