/*
  # Add delete policy for rental_sessions

  1. Security Changes
    - Add DELETE policy for anon role to allow deleting rental sessions
    - This matches existing SELECT, INSERT, and UPDATE policies

  2. Notes
    - Required for the session manager delete functionality
    - Restricted to anon role only
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'rental_sessions'
    AND policyname = 'Anyone can delete rental sessions'
  ) THEN
    CREATE POLICY "Anyone can delete rental sessions"
      ON rental_sessions
      FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;
