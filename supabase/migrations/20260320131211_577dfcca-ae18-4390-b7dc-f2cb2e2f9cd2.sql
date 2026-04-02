
-- Add more fields to profiles
ALTER TABLE public.profiles ADD COLUMN age INTEGER;
ALTER TABLE public.profiles ADD COLUMN weight NUMERIC(5,1);
ALTER TABLE public.profiles ADD COLUMN city TEXT;
ALTER TABLE public.profiles ADD COLUMN experience TEXT CHECK (experience IN ('iniciante', 'intermediario', 'avancado'));
ALTER TABLE public.profiles ADD COLUMN best_5k TEXT;
ALTER TABLE public.profiles ADD COLUMN best_10k TEXT;
ALTER TABLE public.profiles ADD COLUMN best_21k TEXT;
ALTER TABLE public.profiles ADD COLUMN best_42k TEXT;

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, goal, age, weight, city, experience)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'goal', '5k'),
    (NEW.raw_user_meta_data->>'age')::INTEGER,
    (NEW.raw_user_meta_data->>'weight')::NUMERIC,
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'experience', 'iniciante')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Allow public profiles to be viewable by all authenticated users (for athletes page)
DROP POLICY "Users can view their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
