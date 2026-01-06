-- Add columns to store selected hardware IDs in mechanical_layouts
ALTER TABLE public.mechanical_layouts 
ADD COLUMN IF NOT EXISTS selected_cameras jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS selected_lenses jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS selected_lights jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS selected_controller text DEFAULT NULL;

-- Comment on new columns
COMMENT ON COLUMN public.mechanical_layouts.selected_cameras IS 'Array of selected camera objects with id, brand, model';
COMMENT ON COLUMN public.mechanical_layouts.selected_lenses IS 'Array of selected lens objects with id, brand, model';
COMMENT ON COLUMN public.mechanical_layouts.selected_lights IS 'Array of selected light objects with id, brand, model';
COMMENT ON COLUMN public.mechanical_layouts.selected_controller IS 'Selected controller ID';