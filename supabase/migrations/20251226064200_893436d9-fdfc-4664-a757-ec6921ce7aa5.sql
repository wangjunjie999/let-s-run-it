-- 添加视觉系统示意图URL字段
ALTER TABLE public.function_modules
ADD COLUMN IF NOT EXISTS schematic_image_url TEXT DEFAULT NULL;

-- 添加注释说明
COMMENT ON COLUMN public.function_modules.schematic_image_url IS 'URL of the saved vision system schematic diagram image';