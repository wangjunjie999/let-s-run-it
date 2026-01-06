-- Add description field to function_modules table
ALTER TABLE public.function_modules 
ADD COLUMN description TEXT;

-- Add 'measurement' to module_type enum
ALTER TYPE public.module_type ADD VALUE 'measurement';