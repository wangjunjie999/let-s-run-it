-- =============================================
-- 数据库结构迁移脚本
-- 在新的Supabase项目中执行此脚本
-- =============================================

-- 1. 创建枚举类型
CREATE TYPE public.entity_status AS ENUM ('draft', 'incomplete', 'complete');
CREATE TYPE public.module_type AS ENUM ('positioning', 'defect', 'ocr', 'deeplearning', 'measurement');
CREATE TYPE public.quality_strategy AS ENUM ('no_miss', 'balanced', 'allow_pass');
CREATE TYPE public.trigger_type AS ENUM ('io', 'encoder', 'software', 'continuous');
CREATE TYPE public.workstation_type AS ENUM ('line', 'turntable', 'robot', 'platform');

-- 2. 创建 profiles 表
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- 3. 创建 projects 表
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL,
  name text NOT NULL,
  customer text NOT NULL,
  product_process text,
  date date,
  responsible text,
  template_id text,
  cycle_time_target numeric,
  environment text[] DEFAULT '{}'::text[],
  quality_strategy public.quality_strategy DEFAULT 'balanced',
  spec_version text,
  notes text,
  status public.entity_status NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  production_line text,
  use_3d boolean DEFAULT false,
  use_ai boolean DEFAULT false,
  main_camera_brand text,
  sales_responsible text,
  vision_responsible text
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- 4. 创建 workstations 表
CREATE TABLE public.workstations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  type public.workstation_type NOT NULL DEFAULT 'line',
  cycle_time numeric,
  product_dimensions jsonb DEFAULT '{"width": 0, "height": 0, "length": 0}'::jsonb,
  install_space jsonb,
  in_out_direction text,
  enclosed boolean DEFAULT false,
  status public.entity_status NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  process_stage text,
  observation_target text,
  environment_description text,
  notes text
);

ALTER TABLE public.workstations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workstations" ON public.workstations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert workstations" ON public.workstations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update workstations" ON public.workstations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete workstations" ON public.workstations FOR DELETE USING (true);

-- 5. 创建 mechanical_layouts 表
CREATE TABLE public.mechanical_layouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workstation_id uuid NOT NULL UNIQUE REFERENCES public.workstations(id) ON DELETE CASCADE,
  conveyor_type text,
  camera_count integer DEFAULT 1,
  lens_count integer DEFAULT 1,
  light_count integer DEFAULT 1,
  camera_mounts text[] DEFAULT '{}'::text[],
  mechanisms text[] DEFAULT '{}'::text[],
  motion_range jsonb,
  machine_outline jsonb,
  selected_cameras jsonb DEFAULT '[]'::jsonb,
  selected_lenses jsonb DEFAULT '[]'::jsonb,
  selected_lights jsonb DEFAULT '[]'::jsonb,
  selected_controller text,
  front_view_saved boolean DEFAULT false,
  side_view_saved boolean DEFAULT false,
  top_view_saved boolean DEFAULT false,
  front_view_url text,
  side_view_url text,
  top_view_url text,
  status public.entity_status NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.mechanical_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view layouts" ON public.mechanical_layouts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert layouts" ON public.mechanical_layouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update layouts" ON public.mechanical_layouts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete layouts" ON public.mechanical_layouts FOR DELETE USING (true);

-- 6. 创建 function_modules 表
CREATE TABLE public.function_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workstation_id uuid NOT NULL REFERENCES public.workstations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type public.module_type NOT NULL,
  camera_id text,
  trigger_type public.trigger_type DEFAULT 'io',
  output_types text[] DEFAULT '{}'::text[],
  roi_strategy text DEFAULT 'full',
  roi_rect jsonb,
  processing_time_limit integer,
  misjudgment_strategy public.quality_strategy,
  positioning_config jsonb,
  defect_config jsonb,
  ocr_config jsonb,
  deep_learning_config jsonb,
  selected_camera text,
  selected_lens text,
  selected_light text,
  selected_controller text,
  flowchart_saved boolean DEFAULT false,
  description text,
  status public.entity_status NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.function_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules" ON public.function_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can insert modules" ON public.function_modules FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update modules" ON public.function_modules FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete modules" ON public.function_modules FOR DELETE USING (true);

-- 7. 创建硬件资源表
CREATE TABLE public.cameras (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand text NOT NULL,
  model text NOT NULL,
  resolution text NOT NULL,
  frame_rate integer NOT NULL,
  interface text NOT NULL,
  sensor_size text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  tags text[] DEFAULT '{}'::text[],
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.lenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand text NOT NULL,
  model text NOT NULL,
  focal_length text NOT NULL,
  aperture text NOT NULL,
  mount text NOT NULL,
  compatible_cameras text[] DEFAULT '{}'::text[],
  enabled boolean NOT NULL DEFAULT true,
  tags text[] DEFAULT '{}'::text[],
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.lights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand text NOT NULL,
  model text NOT NULL,
  type text NOT NULL,
  color text NOT NULL,
  power text NOT NULL,
  recommended_cameras text[] DEFAULT '{}'::text[],
  enabled boolean NOT NULL DEFAULT true,
  tags text[] DEFAULT '{}'::text[],
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.controllers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand text NOT NULL,
  model text NOT NULL,
  cpu text NOT NULL,
  memory text NOT NULL,
  storage text NOT NULL,
  gpu text,
  performance text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  tags text[] DEFAULT '{}'::text[],
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 为硬件表启用 RLS
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controllers ENABLE ROW LEVEL SECURITY;

-- 硬件表策略
CREATE POLICY "Anyone can view cameras" ON public.cameras FOR SELECT USING (true);
CREATE POLICY "Anyone can insert cameras" ON public.cameras FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update cameras" ON public.cameras FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete cameras" ON public.cameras FOR DELETE USING (true);

CREATE POLICY "Anyone can view lenses" ON public.lenses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert lenses" ON public.lenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lenses" ON public.lenses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete lenses" ON public.lenses FOR DELETE USING (true);

CREATE POLICY "Anyone can view lights" ON public.lights FOR SELECT USING (true);
CREATE POLICY "Anyone can insert lights" ON public.lights FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lights" ON public.lights FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete lights" ON public.lights FOR DELETE USING (true);

CREATE POLICY "Anyone can view controllers" ON public.controllers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert controllers" ON public.controllers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update controllers" ON public.controllers FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete controllers" ON public.controllers FOR DELETE USING (true);

-- 8. 创建存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('hardware-images', 'hardware-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('workstation-views', 'workstation-views', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('module-schematics', 'module-schematics', true);

-- 存储桶策略
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id IN ('hardware-images', 'workstation-views', 'module-schematics'));
CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('hardware-images', 'workstation-views', 'module-schematics') AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON storage.objects FOR UPDATE USING (bucket_id IN ('hardware-images', 'workstation-views', 'module-schematics') AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON storage.objects FOR DELETE USING (bucket_id IN ('hardware-images', 'workstation-views', 'module-schematics') AND auth.role() = 'authenticated');

-- 9. 创建触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- 10. 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
