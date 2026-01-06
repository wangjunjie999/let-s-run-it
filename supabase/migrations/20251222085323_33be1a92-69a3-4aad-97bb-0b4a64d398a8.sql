-- Add new fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS production_line TEXT,
ADD COLUMN IF NOT EXISTS use_3d BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS use_ai BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS main_camera_brand TEXT,
ADD COLUMN IF NOT EXISTS sales_responsible TEXT,
ADD COLUMN IF NOT EXISTS vision_responsible TEXT;

-- Add new fields to workstations table
ALTER TABLE public.workstations 
ADD COLUMN IF NOT EXISTS process_stage TEXT,
ADD COLUMN IF NOT EXISTS observation_target TEXT,
ADD COLUMN IF NOT EXISTS environment_description TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;