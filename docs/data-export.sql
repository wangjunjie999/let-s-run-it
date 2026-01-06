-- ============================================================
-- 数据导出 SQL
-- 导出时间: 2025-12-26
-- 说明: 此文件包含所有业务数据的INSERT语句
-- 使用方法: 在新的Supabase项目中先执行migration-schema.sql，再执行此文件
-- ============================================================

-- ============================================================
-- 1. PROFILES 表数据
-- 注意: 需要先在auth.users中创建对应的用户，才能插入profiles
-- ============================================================

-- 用户ID: f57464ee-06f9-4277-b2a1-cd0f1cd20d36 (w@123.com)
-- 如果要使用原有user_id，需要先在新Supabase中用相同邮箱注册用户
-- 否则需要将下面的user_id替换为新用户的ID

INSERT INTO public.profiles (id, user_id, display_name, avatar_url, created_at, updated_at)
VALUES (
  '70085f89-6b16-4849-aedd-d0613e3bde2e',
  'f57464ee-06f9-4277-b2a1-cd0f1cd20d36',  -- 需替换为新用户ID
  '1',
  NULL,
  '2025-12-20 06:15:44.799331+00',
  '2025-12-20 06:15:44.799331+00'
);

-- ============================================================
-- 2. CAMERAS 相机数据
-- ============================================================

INSERT INTO public.cameras (id, brand, model, resolution, frame_rate, interface, sensor_size, image_url, tags, enabled, created_at, updated_at) VALUES
('304142ab-50a9-4bc3-a458-a3e0324447f5', 'Basler', 'acA2500-14gm', '2592×1944', 14, 'GigE', '1/2.5"', '/hardware/camera-basler.png', ARRAY['高分辨率', '工业级', 'GigE'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:09.737193+00'),
('707b358a-7b70-4b42-9d61-96e5b9249501', '巴斯勒', 'acA2500-14gc', '2592x1944', 14, 'GigE', '1/2.5"', '/hardware/camera-basler.png', ARRAY['高分辨率', '彩色'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:09.737193+00'),
('64e719e8-747a-485c-8085-e67744eb8cb9', 'Hikvision', 'MV-CA050-10GM', '2592×1944', 10, 'GigE', '2/3"', '/hardware/camera-hikvision.png', ARRAY['性价比', '稳定', 'GigE'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:10.582009+00'),
('326c8e49-4168-4482-879c-60d3e00a9b75', '海康威视', 'MV-CS200-10GC', '2048x1536', 60, 'GigE', '2/3"', '/hardware/camera-hikvision.png', ARRAY['工业相机', '高帧率'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:10.582009+00'),
('3713428c-df0f-429c-a658-4c3f3d513cf0', 'FLIR', 'BFS-PGE-50S5M', '2448×2048', 75, 'GigE', '2/3"', '/hardware/camera-flir.png', ARRAY['高速', '高分辨率', 'GigE'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:11.321137+00'),
('2760b029-e6c7-4cf6-9be4-2f7abc01aef4', '基恩士', 'CV-X450F', '2048x1536', 100, 'USB3.0', '1/1.8"', '/hardware/camera-keyence.png', ARRAY['高速检测', '自动对焦'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:12.66254+00'),
('4c8bcb20-f895-47a7-95eb-de9024fdaf86', '康耐视', 'IS7802M-303-50', '3280x2464', 50, 'GigE', '1/1.8"', '/hardware/camera-cognex.png', ARRAY['智能相机', '深度学习'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:13.605442+00'),
('ea1af2a5-ae83-46a2-8ee7-b66ff652f541', '大恒图像', 'MER-502-79GC', '2448x2048', 79, 'GigE', '2/3"', '/hardware/camera-daheng.png', ARRAY['面阵相机', '工业级'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:14.449911+00');

-- ============================================================
-- 3. LENSES 镜头数据
-- ============================================================

INSERT INTO public.lenses (id, brand, model, focal_length, aperture, mount, compatible_cameras, image_url, tags, enabled, created_at, updated_at) VALUES
('40a60dfe-c5db-49bc-8d90-89cfa1663d0e', 'Fujinon', 'HF16SA-1', '16mm', 'F1.4', 'C-Mount', ARRAY[]::text[], '/hardware/lens-fujinon.png', ARRAY['5MP', '定焦', 'C口'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:20.805503+00'),
('50866313-3b7e-46bd-a605-593a139c04ae', 'Fujinon', 'HF16XA-5M', '16mm', 'F1.6', 'C-Mount', ARRAY['康耐视', '海康威视'], '/hardware/lens-fujinon.png', ARRAY['广角', '500万像素'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:20.805503+00'),
('12f1e493-2bc1-4bf5-9d0b-dcd2aeb86e60', 'Computar', 'M1214-MP2', '12mm', 'F1.4', 'C-Mount', ARRAY[]::text[], '/hardware/lens-computar.png', ARRAY['定焦', '高清', 'C口'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:21.496237+00'),
('0cb665bc-3245-4f2e-b4b1-cdfe03b1cc84', 'Computar', 'M2514-MP2', '25mm', 'F1.4', 'C-Mount', ARRAY['大恒图像', '基恩士'], '/hardware/lens-computar.png', ARRAY['大光圈', '高清'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:21.496237+00'),
('3654c433-82dd-42e2-ad07-718fe57e4763', 'Kowa', 'LM25HC', '25mm', 'F1.4', 'C-Mount', ARRAY[]::text[], '/hardware/lens-kowa.png', ARRAY['定焦', '工业级', 'C口'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:22.291599+00'),
('9bb38d07-73aa-4a91-85c7-2257b369ce49', 'Kowa', 'LM35JC10M', '35mm', 'F2.0', 'C-Mount', ARRAY['巴斯勒', '大恒图像'], '/hardware/lens-kowa.png', ARRAY['1000万像素', '工业级'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:22.291599+00'),
('190dd843-567a-40e7-9506-4eb2b5a7fbfe', 'Tamron', 'M118FM12', '12mm', 'F1.8', 'C-Mount', ARRAY['基恩士', '康耐视'], '/hardware/lens-tamron.png', ARRAY['超广角', '低畸变'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:22.864935+00'),
('6b7a9587-093a-4bfb-8ad3-a00b05f3f667', 'VST', 'VS-LDA50', '50mm', 'F2.8', 'C-Mount', ARRAY['海康威视', '巴斯勒'], '/hardware/lens-industrial.png', ARRAY['定焦', '低畸变'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:23.528074+00');

-- ============================================================
-- 4. LIGHTS 光源数据
-- ============================================================

INSERT INTO public.lights (id, brand, model, type, color, power, recommended_cameras, image_url, tags, enabled, created_at, updated_at) VALUES
('3450e02f-473c-413a-ba3e-19dac132244b', 'CCS', 'LDR2-90RD2', '环形光源', '红色', '24V/12W', ARRAY[]::text[], '/hardware/light-ccs.png', ARRAY['环形', '均匀照明', '高反光适用'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:28.243489+00'),
('62f22410-cc9a-4498-a631-81517f278fa5', 'CCS', 'HLDR2-150SW', '环形光源', '白色', '24W', ARRAY['海康威视', '巴斯勒'], '/hardware/light-ccs.png', ARRAY['同轴照明', '均匀性好'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:28.243489+00'),
('efb3f971-2ad0-4419-a819-3e1deefe6510', 'OPT', 'OPT-LI150-W', '条形光源', '白色', '24V/15W', ARRAY[]::text[], '/hardware/light-opt.png', ARRAY['条形', '侧打光', '纹理检测'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:28.9257+00'),
('3bec174c-d88c-4d2b-b39f-7714937c51a0', 'OPT', 'OPT-RI-100-W', '环形光源', '白色', '18W', ARRAY['大恒图像', '康耐视'], '/hardware/light-opt.png', ARRAY['高亮度', '寿命长'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:28.9257+00'),
('2180eb56-7622-4dbd-913b-4ac8ae71648c', 'Moritex', 'MCEP-CW0612', '同轴光源', '白色', '24V/20W', ARRAY[]::text[], '/hardware/light-moritex.png', ARRAY['同轴', '高反光表面', '镜面检测'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:29.910951+00'),
('9cef95f2-2a50-41a8-8ec0-277ee48228a5', 'CST', 'CST-BL300X200-W', '条形光源', '白色', '30W', ARRAY['基恩士', '海康威视'], '/hardware/light-backlight.png', ARRAY['侧向照明', '表面检测'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:31.193597+00'),
('c8ce067f-8da4-4752-a9ae-b0734662951e', '视觉龙', 'FBLR-200-R', '背光源', '红色', '15W', ARRAY['巴斯勒', '大恒图像'], '/hardware/light-backlight.png', ARRAY['轮廓检测', '尺寸测量'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:31.193597+00'),
('4a30fc30-4cc6-47fe-a010-0e997da03443', '锐视', 'RS-DL-100-B', '点光源', '蓝色', '12W', ARRAY['康耐视', '基恩士'], '/hardware/light-backlight.png', ARRAY['定点照明', '小区域'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:31.193597+00');

-- ============================================================
-- 5. CONTROLLERS 控制器数据
-- ============================================================

INSERT INTO public.controllers (id, brand, model, cpu, gpu, memory, storage, performance, image_url, tags, enabled, created_at, updated_at) VALUES
('e387cda4-70c9-4376-b86c-044d5358616d', 'Advantech', 'MIC-770', 'i7-9700', 'GTX 1660', '16GB', '512GB SSD', 'standard', '/hardware/controller-advantech.png', ARRAY['工控机', '标准配置', '稳定'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:36.706707+00'),
('80cbb3c9-f356-4df6-aa7b-6a1ec6d1bb61', '研华', 'MIC-770V2', 'Intel i7-10700', 'NVIDIA T1000', '32GB DDR4', '512GB NVMe', 'ultra', '/hardware/controller-advantech.png', ARRAY['工控机', '深度学习'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:36.706707+00'),
('5541b40e-0bfc-4bbb-bac5-5638b5a3cc7d', 'NVIDIA', 'Jetson AGX Orin', 'ARM Cortex-A78AE', 'Ampere 2048-core', '32GB', '64GB eMMC', 'high', '/hardware/controller-nvidia.png', ARRAY['边缘计算', 'AI推理', '低功耗'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:37.436975+00'),
('1f25fb3b-3b73-4531-8e27-6d1195c2f4ea', '西门子', 'IPC547G', 'Intel i7-8700', 'NVIDIA Quadro P2000', '32GB DDR4', '1TB HDD', 'high', '/hardware/controller-siemens.png', ARRAY['工业PC', '可靠性高'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:39.035785+00'),
('ec322624-8724-4d73-a426-e64aa283a5da', 'Neousys', 'Nuvo-8108GC', 'i9-9900K', 'RTX 3080', '64GB', '1TB NVMe', 'ultra', '/hardware/controller-neousys.png', ARRAY['高性能', 'GPU推理', '深度学习'], true, '2025-12-20 03:57:06.064258+00', '2025-12-22 07:09:39.533559+00'),
('9ef35ab7-d718-4f81-9dfe-8833e6db2b83', '凌华', 'MXC-6400', 'Intel i5-9500', NULL, '16GB DDR4', '256GB SSD', 'standard', '/hardware/controller-ipc.png', ARRAY['紧凑型', '多相机'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:40.621524+00'),
('fecef421-6bba-4c50-b9a2-f6610929178b', '华北工控', 'BIS-6680', 'Intel i3-8100', NULL, '8GB DDR4', '128GB SSD', 'entry', '/hardware/controller-ipc.png', ARRAY['低功耗', '小型化'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:40.621524+00'),
('942cfc83-e1df-4caa-bda5-8ea2660f42b8', '控创', 'KBox-C102', 'Intel i5-10500', 'NVIDIA GTX 1650', '16GB DDR4', '512GB NVMe', 'high', '/hardware/controller-ipc.png', ARRAY['边缘计算', 'AI推理'], true, '2025-12-20 06:40:57.060766+00', '2025-12-22 07:09:40.621524+00');

-- ============================================================
-- 6. PROJECTS 项目数据
-- 注意: user_id 需要替换为新Supabase中的用户ID
-- ============================================================

INSERT INTO public.projects (id, code, name, customer, responsible, status, quality_strategy, cycle_time_target, environment, use_ai, use_3d, notes, date, product_process, production_line, main_camera_brand, template_id, sales_responsible, vision_responsible, spec_version, user_id, created_at, updated_at) VALUES
('bf9e1556-8e3b-4623-bbbe-652506d34112', 'TEST-2024-001', '全功能模块测试项目', '测试客户公司', '张工', 'complete', 'no_miss', 3.5, ARRAY['室内', '恒温', 'high_reflection'], true, true, '包含所有模块类型的测试项目', '2024-01-15', '注塑成型', NULL, 'Basler', 'tpl-1', NULL, NULL, NULL, 'f57464ee-06f9-4277-b2a1-cd0f1cd20d36', '2025-12-23 06:33:08.364013+00', '2025-12-23 06:41:31.962972+00'),
('0a787d57-8ea9-43f7-812f-42141e755bd9', 'DB123123', 'huskwjc', 'dasdfqw', 'dfefoij', 'draft', 'balanced', NULL, ARRAY[]::text[], false, false, NULL, '2025-12-25', '总装检测', NULL, NULL, 'tpl-1', NULL, NULL, NULL, 'f57464ee-06f9-4277-b2a1-cd0f1cd20d36', '2025-12-25 07:13:21.061278+00', '2025-12-25 07:18:01.48214+00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'DB202412', '新能源电池模组装配线视觉检测系统', '宁德时代新能源科技股份有限公司', '张工', 'draft', 'balanced', NULL, ARRAY[]::text[], true, false, '模组装配线全流程视觉检测方案，包含定位引导、缺陷检测、OCR读码、尺寸测量等功能', '2024-12-26', NULL, '福建宁德工厂-模组装配线A', 'Basler', NULL, '李经理', '王工', NULL, 'f57464ee-06f9-4277-b2a1-cd0f1cd20d36', '2025-12-26 02:39:41.487547+00', '2025-12-26 02:39:41.487547+00');

-- ============================================================
-- 7. WORKSTATIONS 工位数据
-- ============================================================

INSERT INTO public.workstations (id, code, name, project_id, type, status, cycle_time, enclosed, observation_target, process_stage, product_dimensions, environment_description, in_out_direction, install_space, notes, created_at, updated_at) VALUES
('8bcfd1d6-1021-4054-addc-2b8f756e4e12', 'DB123123.1231', 'dsadsadd', '0a787d57-8ea9-43f7-812f-42141e755bd9', 'line', 'incomplete', 3, false, NULL, NULL, '{"height": 50, "length": 100, "width": 100}', NULL, NULL, NULL, NULL, '2025-12-25 07:13:47.884302+00', '2025-12-25 07:29:57.892432+00'),
('a1000001-0001-0001-0001-000000000001', 'ST-01', '电芯上料定位工位', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'robot', 'draft', 3.5, false, '电芯', '上料', '{"height": 27, "length": 300, "width": 100}', '无尘车间，洁净度10万级，温度25±2℃', NULL, NULL, '负责电芯上料时的精确定位引导，配合机械手抓取', '2025-12-26 02:40:15.451713+00', '2025-12-26 02:40:15.451713+00'),
('a1000002-0002-0002-0002-000000000002', 'ST-02', '激光焊接缺陷检测工位', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'line', 'draft', 2.8, true, '模组', '焊接', '{"height": 80, "length": 600, "width": 400}', '封闭暗室环境，有激光防护措施', NULL, NULL, '焊缝质量检测，检测爆点、漏焊、虚焊等缺陷', '2025-12-26 02:40:15.451713+00', '2025-12-26 02:40:15.451713+00'),
('a1000003-0003-0003-0003-000000000003', 'ST-03', '条码追溯读码工位', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'line', 'draft', 1.5, false, '模组', '检测', '{"height": 80, "length": 600, "width": 400}', '普通车间环境，有环境光干扰', NULL, NULL, '读取模组条码和二维码，实现生产追溯', '2025-12-26 02:40:15.451713+00', '2025-12-26 02:40:15.451713+00'),
('a1000004-0004-0004-0004-000000000004', 'ST-04', '模组尺寸测量工位', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'platform', 'draft', 4.0, true, '模组', '检测', '{"height": 80, "length": 600, "width": 400}', '恒温恒湿环境，温度23±1℃，湿度50±5%', NULL, NULL, '高精度尺寸测量，检测长宽高及平面度', '2025-12-26 02:40:15.451713+00', '2025-12-26 02:40:15.451713+00'),
('fb688979-b188-49c8-8c2a-e534f0788fae', 'WS-OCR-01', 'OCR与AI检测工位', 'bf9e1556-8e3b-4623-bbbe-652506d34112', 'platform', 'incomplete', 4, false, '电芯', '上料', '{"height": 20, "length": 100, "width": 80}', NULL, NULL, NULL, NULL, '2025-12-23 06:33:16.52824+00', '2025-12-23 06:56:54.192184+00'),
('e02b5f1c-bbb3-4dc9-8827-8ff3e05004a8', 'WS-MEA-01', '精密尺寸测量工位', 'bf9e1556-8e3b-4623-bbbe-652506d34112', 'turntable', 'incomplete', 5, true, '电芯', '上料', '{"height": 30, "length": 50, "width": 50}', NULL, NULL, NULL, NULL, '2025-12-23 06:33:16.52824+00', '2025-12-23 07:00:58.8212+00'),
('4232923a-50fd-4776-97d1-c990b4b1e75c', 'WS-POS-01', '定位引导工位', 'bf9e1556-8e3b-4623-bbbe-652506d34112', 'robot', 'incomplete', 3.5, true, '产品定位抓取', NULL, '{"height": 50, "length": 200, "width": 150}', NULL, NULL, NULL, NULL, '2025-12-23 06:33:16.52824+00', '2025-12-24 08:43:27.867519+00'),
('b7d7272b-03ee-4d88-b304-2edfc49c9b3f', 'WS-DEF-01', '表面缺陷检测工位', 'bf9e1556-8e3b-4623-bbbe-652506d34112', 'line', 'incomplete', 2, true, '表面缺陷', NULL, '{"height": 10, "length": 300, "width": 200}', NULL, NULL, NULL, NULL, '2025-12-23 06:33:16.52824+00', '2025-12-24 08:43:58.251924+00');

-- ============================================================
-- 8. MECHANICAL_LAYOUTS 机械布局数据
-- ============================================================

INSERT INTO public.mechanical_layouts (id, workstation_id, camera_count, lens_count, light_count, camera_mounts, conveyor_type, mechanisms, selected_cameras, selected_lenses, selected_lights, selected_controller, front_view_url, front_view_saved, side_view_url, side_view_saved, top_view_url, top_view_saved, machine_outline, motion_range, status, created_at, updated_at) VALUES
('5c7cc514-793f-4bb2-99a2-d7bf1ee6d3ee', 'fb688979-b188-49c8-8c2a-e534f0788fae', 1, 1, 1, ARRAY['top'], '转盘', ARRAY['旋转平台', 'stop'], '[{"id": "304142ab-50a9-4bc3-a458-a3e0324447f5", "brand": "Basler", "model": "acA2500-14gm", "image_url": "/hardware/camera-basler.png"}]'::jsonb, '[{"id": "40a60dfe-c5db-49bc-8d90-89cfa1663d0e", "brand": "Fujinon", "model": "HF16SA-1", "image_url": "/hardware/lens-fujinon.png"}]'::jsonb, '[{"id": "efb3f971-2ad0-4419-a819-3e1deefe6510", "brand": "OPT", "model": "OPT-LI150-W", "image_url": "/hardware/light-opt.png"}]'::jsonb, NULL, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/fb688979-b188-49c8-8c2a-e534f0788fae-front.png?t=1766565861408', true, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/fb688979-b188-49c8-8c2a-e534f0788fae-side.png?t=1766565865421', true, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/fb688979-b188-49c8-8c2a-e534f0788fae-top.png?t=1766565869228', true, NULL, NULL, 'draft', '2025-12-23 06:33:24.735777+00', '2025-12-24 08:44:30.32171+00'),
('f8d68378-77f7-4587-8d50-9cb0e043eeec', '4232923a-50fd-4776-97d1-c990b4b1e75c', 2, 1, 1, ARRAY['top', 'top'], '机械手', ARRAY['六轴机械手', '抓取夹爪', 'stop', 'cylinder'], '[null, null]'::jsonb, '[null]'::jsonb, '[null]'::jsonb, NULL, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/4232923a-50fd-4776-97d1-c990b4b1e75c-front.png?t=1766565794537', true, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/4232923a-50fd-4776-97d1-c990b4b1e75c-side.png?t=1766565799596', true, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/4232923a-50fd-4776-97d1-c990b4b1e75c-top.png?t=1766565803342', true, NULL, NULL, 'draft', '2025-12-23 06:33:24.735777+00', '2025-12-24 08:43:28.260225+00'),
('20d0a698-ada6-4063-84b0-dec217831894', 'e02b5f1c-bbb3-4dc9-8827-8ff3e05004a8', 1, 1, 1, ARRAY['angled'], '转盘', ARRAY['高精度转台', '光栅尺', 'stop'], '[{"id": "64e719e8-747a-485c-8085-e67744eb8cb9", "brand": "Hikvision", "model": "MV-CA050-10GM", "image_url": "/hardware/camera-hikvision.png"}]'::jsonb, '[{"id": "9bb38d07-73aa-4a91-85c7-2257b369ce49", "brand": "Kowa", "model": "LM35JC10M", "image_url": "/hardware/lens-kowa.png"}]'::jsonb, '[{"id": "2180eb56-7622-4dbd-913b-4ac8ae71648c", "brand": "Moritex", "model": "MCEP-CW0612", "image_url": "/hardware/light-moritex.png"}]'::jsonb, NULL, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/e02b5f1c-bbb3-4dc9-8827-8ff3e05004a8-front.png?t=1766565901271', true, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/e02b5f1c-bbb3-4dc9-8827-8ff3e05004a8-side.png?t=1766473279666', true, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/e02b5f1c-bbb3-4dc9-8827-8ff3e05004a8-top.png?t=1766473282398', true, NULL, NULL, 'draft', '2025-12-23 06:33:24.735777+00', '2025-12-24 08:45:02.559112+00'),
('620449fc-e922-4ad0-9822-6ede36b94def', 'b7d7272b-03ee-4d88-b304-2edfc49c9b3f', 3, 1, 1, ARRAY['top', 'top', 'top'], '皮带线', ARRAY['伺服电机', '编码器'], '[null, null, null]'::jsonb, '[null]'::jsonb, '[null]'::jsonb, NULL, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/b7d7272b-03ee-4d88-b304-2edfc49c9b3f-front.png?t=1766565824942', true, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/b7d7272b-03ee-4d88-b304-2edfc49c9b3f-side.png?t=1766565829704', true, 'https://txmgourzjdbqxtdzwptn.supabase.co/storage/v1/object/public/workstation-views/b7d7272b-03ee-4d88-b304-2edfc49c9b3f-top.png?t=1766565833586', true, NULL, NULL, 'draft', '2025-12-23 06:33:24.735777+00', '2025-12-24 08:43:58.82502+00');

-- ============================================================
-- 9. FUNCTION_MODULES 功能模块数据
-- ============================================================

INSERT INTO public.function_modules (id, workstation_id, name, type, description, status, trigger_type, processing_time_limit, roi_strategy, roi_rect, output_types, misjudgment_strategy, positioning_config, defect_config, ocr_config, deep_learning_config, selected_camera, selected_lens, selected_light, selected_controller, camera_id, flowchart_saved, created_at, updated_at) VALUES
-- DB202412 项目的模块
('c1000001-0001-0001-0001-000000000001', 'a1000001-0001-0001-0001-000000000001', '电芯定位引导', 'positioning', NULL, 'draft', 'software', 150, 'full', NULL, ARRAY['OK', 'NG', '坐标'], 'balanced', '{"accuracy_mm": 0.1, "calibration_method": "九点标定", "coordinate_system": "robot", "dual_camera_mode": false, "pose_changes": 1, "target_type": "edge"}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '2025-12-26 02:41:04.423401+00', '2025-12-26 02:41:04.423401+00'),
('c1000002-0002-0002-0002-000000000002', 'a1000002-0002-0002-0002-000000000002', '焊缝缺陷检测', 'defect', NULL, 'draft', 'io', 200, 'custom', NULL, ARRAY['OK', 'NG'], 'no_miss', NULL, '{"defect_classes": ["爆点", "漏焊", "虚焊", "偏焊", "断焊"], "judgment_rule": "any_defect", "material_properties": "金属焊缝", "min_defect_size_mm": 0.3, "miss_tolerance": "cannot_miss", "recheck_count": 2, "recheck_enabled": true}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '2025-12-26 02:41:04.423401+00', '2025-12-26 02:41:04.423401+00'),
('c1000003-0003-0003-0003-000000000003', 'a1000003-0003-0003-0003-000000000003', '模组条码识读', 'ocr', NULL, 'draft', 'io', 100, 'custom', NULL, ARRAY['OK', 'NG', '条码内容'], 'balanced', NULL, NULL, '{"char_direction": "horizontal", "character_set": "mixed", "character_type": "laser", "content_rule": "^[A-Z]{2}[0-9]{12}$", "min_char_height_mm": 2.5, "validation_mode": "format_check"}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, false, '2025-12-26 02:41:04.423401+00', '2025-12-26 02:41:04.423401+00'),
-- TEST-2024-001 项目的模块
('5dd52978-913a-4c68-966f-d86b86d9884f', 'fb688979-b188-49c8-8c2a-e534f0788fae', 'AI缺陷分类', 'deeplearning', '使用深度学习进行复杂缺陷分类', 'complete', 'software', 80, 'full', NULL, ARRAY['ok_ng'], 'balanced', NULL, NULL, NULL, '{"annotationMethod": "box", "dataSource": "onsite", "deployTarget": "gpu", "evaluationMetrics": ["recall"], "inferenceTimeTarget": 50, "noMissStrategy": "", "sampleSize": 5000, "targetClasses": ["OK", "划痕", "污染", "变形", "缺失"], "taskType": "classification", "updateStrategy": "periodic"}'::jsonb, '304142ab-50a9-4bc3-a458-a3e0324447f5', '0cb665bc-3245-4f2e-b4b1-cdfe03b1cc84', '4a30fc30-4cc6-47fe-a010-0e997da03443', '1f25fb3b-3b73-4531-8e27-6d1195c2f4ea', NULL, true, '2025-12-23 06:33:49.0008+00', '2025-12-24 08:44:43.140011+00'),
('15acc82f-79f8-49eb-8470-bdf36c6924f3', '4232923a-50fd-4776-97d1-c990b4b1e75c', '产品定位引导', 'positioning', '引导机械手抓取产品', 'complete', 'io', 150, 'full', NULL, ARRAY['ok_ng'], 'no_miss', '{"accuracyRequirement": 0.05, "calibrationMethod": "hand_eye", "fieldOfView": "", "guidingMechanism": "fixed", "guidingMode": "single_camera", "repeatabilityRequirement": 0.02, "targetType": "corner", "toleranceX": 0.1, "toleranceY": 0.1, "workingDistance": ""}'::jsonb, NULL, NULL, NULL, '304142ab-50a9-4bc3-a458-a3e0324447f5', '12f1e493-2bc1-4bf5-9d0b-dcd2aeb86e60', '3450e02f-473c-413a-ba3e-19dac132244b', 'e387cda4-70c9-4376-b86c-044d5358616d', NULL, true, '2025-12-23 06:33:49.0008+00', '2025-12-24 08:43:39.11541+00'),
('707b351a-ab3c-46fb-899e-79e620d3ec12', 'fb688979-b188-49c8-8c2a-e534f0788fae', '产品序列号识别', 'ocr', '识别产品标签上的序列号', 'complete', 'io', 100, 'full', NULL, ARRAY['ok_ng'], 'balanced', NULL, NULL, '{"charDirection": "fixed", "charType": "laser", "charset": "mixed", "contentRule": "SN-YYYYMMDD-####", "customCharset": "", "minCharHeight": 2.5, "multiROI": false, "outputFields": ["string"], "qualificationStrategy": "match_rule", "unclearHandling": "strict_ng"}'::jsonb, NULL, 'ea1af2a5-ae83-46a2-8ee7-b66ff652f541', NULL, NULL, 'e387cda4-70c9-4376-b86c-044d5358616d', NULL, true, '2025-12-23 06:33:49.0008+00', '2025-12-24 08:44:15.089219+00'),
('a9ef4d8a-e0dd-4ca1-92f7-4d1fc70296a9', 'b7d7272b-03ee-4d88-b304-2edfc49c9b3f', '表面缺陷检测', 'defect', '检测产品表面划痕、污渍等缺陷', 'complete', 'encoder', 120, 'full', NULL, ARRAY['ok_ng'], 'no_miss', NULL, '{"defectCategories": ["划痕", "污渍", "气泡", "凹坑"], "defectClassCount": 4, "defectRecordMode": "image_coordinates", "gradingEnabled": false, "gradingLevels": [], "inputSource": "line_scan", "judgmentLogic": "any_ng", "lightingSetup": "multi_angle", "outputFormat": "defect_list", "sensitivityLevel": "high", "surfaceType": "glossy"}'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-12-23 06:33:49.0008+00', '2025-12-24 08:43:58.251924+00'),
('c83c0d3e-d3e8-4f0e-b89e-46e27c53c61d', 'e02b5f1c-bbb3-4dc9-8827-8ff3e05004a8', '精密尺寸测量', 'measurement', '对产品进行高精度尺寸测量', 'complete', 'software', 200, 'full', NULL, ARRAY['ok_ng'], 'balanced', NULL, NULL, NULL, NULL, '64e719e8-747a-485c-8085-e67744eb8cb9', '9bb38d07-73aa-4a91-85c7-2257b369ce49', '2180eb56-7622-4dbd-913b-4ac8ae71648c', 'e387cda4-70c9-4376-b86c-044d5358616d', NULL, true, '2025-12-23 06:33:49.0008+00', '2025-12-24 08:45:02.559112+00');

-- ============================================================
-- 使用说明:
-- 1. 先在新Supabase中执行 migration-schema.sql 创建表结构
-- 2. 在新Supabase中用相同邮箱(w@123.com)注册用户
-- 3. 获取新用户的user_id (在auth.users表中查询)
-- 4. 将此文件中所有 'f57464ee-06f9-4277-b2a1-cd0f1cd20d36' 替换为新user_id
-- 5. 执行此SQL文件导入数据
-- 6. 如果有三视图图片需要重新上传到新的Storage bucket
-- ============================================================
