-- Add measurement_config column to function_modules table
ALTER TABLE public.function_modules 
ADD COLUMN measurement_config jsonb DEFAULT NULL;