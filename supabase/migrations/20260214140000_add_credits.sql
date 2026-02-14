-- Add credits and tier to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'free';

-- Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credit(user_id_param UUID, amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits FROM public.profiles WHERE user_id = user_id_param;
  
  IF current_credits >= amount THEN
    UPDATE public.profiles SET credits = credits - amount WHERE user_id = user_id_param;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;
