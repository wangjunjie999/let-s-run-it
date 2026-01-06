-- Create hardware tables for cameras, lenses, lights, and controllers

-- Cameras table
CREATE TABLE public.cameras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  resolution TEXT NOT NULL,
  frame_rate INTEGER NOT NULL,
  interface TEXT NOT NULL,
  sensor_size TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lenses table
CREATE TABLE public.lenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  focal_length TEXT NOT NULL,
  aperture TEXT NOT NULL,
  mount TEXT NOT NULL,
  compatible_cameras TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lights table
CREATE TABLE public.lights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  power TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  recommended_cameras TEXT[] DEFAULT '{}',
  image_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Controllers table
CREATE TABLE public.controllers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  cpu TEXT NOT NULL,
  gpu TEXT,
  memory TEXT NOT NULL,
  storage TEXT NOT NULL,
  performance TEXT NOT NULL CHECK (performance IN ('entry', 'standard', 'high', 'ultra')),
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controllers ENABLE ROW LEVEL SECURITY;

-- Create public read policies (anyone can view hardware catalog)
CREATE POLICY "Anyone can view cameras" ON public.cameras FOR SELECT USING (true);
CREATE POLICY "Anyone can view lenses" ON public.lenses FOR SELECT USING (true);
CREATE POLICY "Anyone can view lights" ON public.lights FOR SELECT USING (true);
CREATE POLICY "Anyone can view controllers" ON public.controllers FOR SELECT USING (true);

-- Create public insert/update/delete policies (for now, allow all - can restrict to admin later)
CREATE POLICY "Anyone can insert cameras" ON public.cameras FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update cameras" ON public.cameras FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete cameras" ON public.cameras FOR DELETE USING (true);

CREATE POLICY "Anyone can insert lenses" ON public.lenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lenses" ON public.lenses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete lenses" ON public.lenses FOR DELETE USING (true);

CREATE POLICY "Anyone can insert lights" ON public.lights FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lights" ON public.lights FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete lights" ON public.lights FOR DELETE USING (true);

CREATE POLICY "Anyone can insert controllers" ON public.controllers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update controllers" ON public.controllers FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete controllers" ON public.controllers FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_cameras_updated_at
  BEFORE UPDATE ON public.cameras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lenses_updated_at
  BEFORE UPDATE ON public.lenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lights_updated_at
  BEFORE UPDATE ON public.lights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_controllers_updated_at
  BEFORE UPDATE ON public.controllers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for hardware images
INSERT INTO storage.buckets (id, name, public) VALUES ('hardware-images', 'hardware-images', true);

-- Create storage policies for hardware images
CREATE POLICY "Hardware images are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'hardware-images');

CREATE POLICY "Anyone can upload hardware images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'hardware-images');

CREATE POLICY "Anyone can update hardware images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'hardware-images');

CREATE POLICY "Anyone can delete hardware images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'hardware-images');

-- Insert sample data
INSERT INTO public.cameras (brand, model, resolution, frame_rate, interface, sensor_size, tags, enabled) VALUES
  ('Basler', 'acA2500-14gm', '2592×1944', 14, 'GigE', '1/2.5"', ARRAY['高分辨率', '工业级', 'GigE'], true),
  ('Hikvision', 'MV-CA050-10GM', '2592×1944', 10, 'GigE', '2/3"', ARRAY['性价比', '稳定', 'GigE'], true),
  ('FLIR', 'BFS-PGE-50S5M', '2448×2048', 75, 'GigE', '2/3"', ARRAY['高速', '高分辨率', 'GigE'], true);

INSERT INTO public.lenses (brand, model, focal_length, aperture, mount, tags, enabled) VALUES
  ('Computar', 'M1214-MP2', '12mm', 'F1.4', 'C-Mount', ARRAY['定焦', '高清', 'C口'], true),
  ('Kowa', 'LM25HC', '25mm', 'F1.4', 'C-Mount', ARRAY['定焦', '工业级', 'C口'], true),
  ('Fujinon', 'HF16SA-1', '16mm', 'F1.4', 'C-Mount', ARRAY['5MP', '定焦', 'C口'], true);

INSERT INTO public.lights (brand, model, type, color, power, tags, enabled) VALUES
  ('CCS', 'LDR2-90RD2', '环形光源', '红色', '24V/12W', ARRAY['环形', '均匀照明', '高反光适用'], true),
  ('OPT', 'OPT-LI150-W', '条形光源', '白色', '24V/15W', ARRAY['条形', '侧打光', '纹理检测'], true),
  ('Moritex', 'MCEP-CW0612', '同轴光源', '白色', '24V/20W', ARRAY['同轴', '高反光表面', '镜面检测'], true);

INSERT INTO public.controllers (brand, model, cpu, gpu, memory, storage, performance, tags, enabled) VALUES
  ('Advantech', 'MIC-770', 'i7-9700', 'GTX 1660', '16GB', '512GB SSD', 'standard', ARRAY['工控机', '标准配置', '稳定'], true),
  ('Neousys', 'Nuvo-8108GC', 'i9-9900K', 'RTX 3080', '64GB', '1TB NVMe', 'ultra', ARRAY['高性能', 'GPU推理', '深度学习'], true),
  ('NVIDIA', 'Jetson AGX Orin', 'ARM Cortex-A78AE', 'Ampere 2048-core', '32GB', '64GB eMMC', 'high', ARRAY['边缘计算', 'AI推理', '低功耗'], true);