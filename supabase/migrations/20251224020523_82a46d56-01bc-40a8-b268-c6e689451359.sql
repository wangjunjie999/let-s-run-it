-- Create storage bucket for module schematics
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('module-schematics', 'module-schematics', true, 5242880, ARRAY['image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for module schematics"
ON storage.objects FOR SELECT
USING (bucket_id = 'module-schematics');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload module schematics"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'module-schematics');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update module schematics"
ON storage.objects FOR UPDATE
USING (bucket_id = 'module-schematics');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete module schematics"
ON storage.objects FOR DELETE
USING (bucket_id = 'module-schematics');