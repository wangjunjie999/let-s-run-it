-- Add lens_count and light_count columns to mechanical_layouts
ALTER TABLE public.mechanical_layouts 
ADD COLUMN IF NOT EXISTS lens_count integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS light_count integer DEFAULT 1;