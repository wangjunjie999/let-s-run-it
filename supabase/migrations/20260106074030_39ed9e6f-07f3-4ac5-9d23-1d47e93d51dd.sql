-- Add more missing columns to mechanical_layouts table
ALTER TABLE public.mechanical_layouts 
ADD COLUMN IF NOT EXISTS conveyor_type text,
ADD COLUMN IF NOT EXISTS camera_count integer,
ADD COLUMN IF NOT EXISTS camera_mounts jsonb,
ADD COLUMN IF NOT EXISTS mechanisms jsonb,
ADD COLUMN IF NOT EXISTS machine_outline jsonb;

-- Add more missing columns to workstations table
ALTER TABLE public.workstations 
ADD COLUMN IF NOT EXISTS install_space jsonb,
ADD COLUMN IF NOT EXISTS enclosed boolean DEFAULT false;

-- Add more missing columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS quality_strategy text,
ADD COLUMN IF NOT EXISTS environment text,
ADD COLUMN IF NOT EXISTS notes text;

-- Add more missing columns to function_modules table
ALTER TABLE public.function_modules 
ADD COLUMN IF NOT EXISTS trigger_type text,
ADD COLUMN IF NOT EXISTS output_types text[],
ADD COLUMN IF NOT EXISTS positioning_config jsonb,
ADD COLUMN IF NOT EXISTS defect_config jsonb,
ADD COLUMN IF NOT EXISTS ocr_config jsonb,
ADD COLUMN IF NOT EXISTS deep_learning_config jsonb,
ADD COLUMN IF NOT EXISTS measurement_config jsonb;