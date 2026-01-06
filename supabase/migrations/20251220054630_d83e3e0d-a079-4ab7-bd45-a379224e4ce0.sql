-- Create enum types
CREATE TYPE public.workstation_type AS ENUM ('line', 'turntable', 'robot', 'platform');
CREATE TYPE public.entity_status AS ENUM ('draft', 'incomplete', 'complete');
CREATE TYPE public.module_type AS ENUM ('positioning', 'defect', 'ocr', 'deeplearning');
CREATE TYPE public.trigger_type AS ENUM ('io', 'encoder', 'software', 'continuous');
CREATE TYPE public.quality_strategy AS ENUM ('no_miss', 'balanced', 'allow_pass');

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  customer TEXT NOT NULL,
  product_process TEXT,
  date DATE,
  responsible TEXT,
  template_id TEXT,
  cycle_time_target NUMERIC,
  environment TEXT[] DEFAULT '{}',
  quality_strategy public.quality_strategy DEFAULT 'balanced',
  spec_version TEXT,
  notes TEXT,
  status public.entity_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workstations table
CREATE TABLE public.workstations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type public.workstation_type NOT NULL DEFAULT 'line',
  cycle_time NUMERIC,
  product_dimensions JSONB DEFAULT '{"length": 0, "width": 0, "height": 0}',
  install_space JSONB,
  in_out_direction TEXT,
  enclosed BOOLEAN DEFAULT false,
  status public.entity_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mechanical_layouts table
CREATE TABLE public.mechanical_layouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workstation_id UUID NOT NULL REFERENCES public.workstations(id) ON DELETE CASCADE UNIQUE,
  conveyor_type TEXT,
  camera_count INTEGER DEFAULT 1 CHECK (camera_count >= 1 AND camera_count <= 4),
  camera_mounts TEXT[] DEFAULT '{}',
  mechanisms TEXT[] DEFAULT '{}',
  motion_range JSONB,
  machine_outline JSONB,
  front_view_saved BOOLEAN DEFAULT false,
  side_view_saved BOOLEAN DEFAULT false,
  top_view_saved BOOLEAN DEFAULT false,
  status public.entity_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function_modules table
CREATE TABLE public.function_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workstation_id UUID NOT NULL REFERENCES public.workstations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.module_type NOT NULL,
  camera_id TEXT,
  trigger_type public.trigger_type DEFAULT 'io',
  output_types TEXT[] DEFAULT '{}',
  roi_strategy TEXT DEFAULT 'full',
  roi_rect JSONB,
  processing_time_limit INTEGER,
  misjudgment_strategy public.quality_strategy,
  positioning_config JSONB,
  defect_config JSONB,
  ocr_config JSONB,
  deep_learning_config JSONB,
  selected_camera TEXT,
  selected_lens TEXT,
  selected_light TEXT,
  selected_controller TEXT,
  flowchart_saved BOOLEAN DEFAULT false,
  status public.entity_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workstations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanical_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_modules ENABLE ROW LEVEL SECURITY;

-- Create public access policies (no auth required for now)
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Anyone can insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete projects" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Anyone can view workstations" ON public.workstations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert workstations" ON public.workstations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update workstations" ON public.workstations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete workstations" ON public.workstations FOR DELETE USING (true);

CREATE POLICY "Anyone can view layouts" ON public.mechanical_layouts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert layouts" ON public.mechanical_layouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update layouts" ON public.mechanical_layouts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete layouts" ON public.mechanical_layouts FOR DELETE USING (true);

CREATE POLICY "Anyone can view modules" ON public.function_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can insert modules" ON public.function_modules FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update modules" ON public.function_modules FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete modules" ON public.function_modules FOR DELETE USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workstations_updated_at
  BEFORE UPDATE ON public.workstations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_layouts_updated_at
  BEFORE UPDATE ON public.mechanical_layouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.function_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_workstations_project_id ON public.workstations(project_id);
CREATE INDEX idx_layouts_workstation_id ON public.mechanical_layouts(workstation_id);
CREATE INDEX idx_modules_workstation_id ON public.function_modules(workstation_id);