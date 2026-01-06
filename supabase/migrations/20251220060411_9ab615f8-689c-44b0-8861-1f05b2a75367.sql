-- Create storage policies for hardware-images bucket
CREATE POLICY "Anyone can view hardware images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hardware-images');

CREATE POLICY "Authenticated users can upload hardware images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hardware-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update hardware images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hardware-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete hardware images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hardware-images' AND auth.role() = 'authenticated');