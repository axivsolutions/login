CREATE TABLE IF NOT EXISTS public.food_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  category text NOT NULL CHECK (char_length(category) BETWEEN 1 AND 80),
  district text NOT NULL CHECK (char_length(district) BETWEEN 1 AND 40),
  address text NOT NULL CHECK (char_length(address) BETWEEN 1 AND 160),
  food text NOT NULL DEFAULT '尚未補充' CHECK (char_length(food) <= 240),
  hours text NOT NULL DEFAULT '營業時間待補',
  phone text,
  search text NOT NULL,
  shop text,
  source text,
  lat double precision NOT NULL CHECK (lat BETWEEN 21 AND 26),
  lng double precision NOT NULL CHECK (lng BETWEEN 118 AND 123),
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.food_places ENABLE ROW LEVEL SECURITY;
