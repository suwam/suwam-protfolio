
-- Fix set_updated_at search path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Replace always-true contact insert policy with validated one
DROP POLICY IF EXISTS "anyone_insert_contact" ON public.contact_submissions;
CREATE POLICY "anyone_insert_contact_validated" ON public.contact_submissions
  FOR INSERT
  WITH CHECK (
    char_length(trim(name)) BETWEEN 1 AND 100
    AND char_length(trim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(trim(message)) BETWEEN 1 AND 5000
  );
