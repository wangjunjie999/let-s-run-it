-- Create storage bucket for workstation view images
INSERT INTO storage.buckets (id, name, public)
VALUES ('workstation-views', 'workstation-views', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for workstation views"
ON storage.objects FOR SELECT
USING (bucket_id = 'workstation-views');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload workstation views"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'workstation-views');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update workstation views"
ON storage.objects FOR UPDATE
USING (bucket_id = 'workstation-views');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete workstation views"
ON storage.objects FOR DELETE
USING (bucket_id = 'workstation-views');

-- Add columns to mechanical_layouts to store view image URLs
ALTER TABLE public.mechanical_layouts
ADD COLUMN IF NOT EXISTS front_view_url TEXT,
ADD COLUMN IF NOT EXISTS side_view_url TEXT,
ADD COLUMN IF NOT EXISTS top_view_url TEXT;