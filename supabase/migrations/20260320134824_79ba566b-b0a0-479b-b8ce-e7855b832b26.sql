
-- Training session check-ins
CREATE TABLE public.training_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal text NOT NULL,
  week_index integer NOT NULL,
  session_index integer NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.training_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins" ON public.training_checkins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.training_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own checkins" ON public.training_checkins FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Competition registrations
CREATE TABLE public.competition_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_name text NOT NULL,
  distance text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  payment_method text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.competition_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations" ON public.competition_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own registrations" ON public.competition_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
