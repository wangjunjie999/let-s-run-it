import pptxgen from 'pptxgenjs';
// Type definitions for pptxgenjs
type TableCell = { text: string; options?: Record<string, unknown> };
type TableRow = TableCell[];

interface ProjectData {
  id: string;
  code: string;
  name: string;
  customer: string;
  date: string | null;
  responsible: string | null;
  product_process: string | null;
  quality_strategy: string | null;
  environment: string[] | null;
  notes: string | null;
}

interface WorkstationData {
  id: string;
  code: string;
  name: string;
  type: string;
  cycle_time: number | null;
  product_dimensions: { length: number; width: number; height: number } | null;
  enclosed: boolean | null;
}

interface LayoutData {
  workstation_id: string;
  conveyor_type: string | null;
  camera_count: number | null;
  lens_count: number | null;
  light_count: number | null;
  camera_mounts: string[] | null;
  mechanisms: string[] | null;
  front_view_saved: boolean | null;
  side_view_saved: boolean | null;
  top_view_saved: boolean | null;
  front_view_url: string | null;
  side_view_url: string | null;
  top_view_url: string | null;
  // Workstation-level hardware selections
  selected_cameras: Array<{ id: string; brand: string; model: string; image_url?: string | null }> | null;
  selected_lenses: Array<{ id: string; brand: string; model: string; image_url?: string | null }> | null;
  selected_lights: Array<{ id: string; brand: string; model: string; image_url?: string | null }> | null;
  selected_controller: { id: string; brand: string; model: string; image_url?: string | null } | null;
}

interface ModuleData {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  workstation_id: string;
  trigger_type: string | null;
  roi_strategy: string | null;
  processing_time_limit: number | null;
  output_types: string[] | null;
  selected_camera: string | null;
  selected_lens: string | null;
  selected_light: string | null;
  selected_controller: string | null;
  schematic_image_url?: string | null;
  // Type-specific configs
  positioning_config?: Record<string, unknown> | null;
  defect_config?: Record<string, unknown> | null;
  ocr_config?: Record<string, unknown> | null;
  deep_learning_config?: Record<string, unknown> | null;
  measurement_config?: Record<string, unknown> | null;
}

interface HardwareData {
  cameras: Array<{
    id: string;
    brand: string;
    model: string;
    resolution: string;
    frame_rate: number;
    interface: string;
    sensor_size: string;
    image_url: string | null;
  }>;
  lenses: Array<{
    id: string;
    brand: string;
    model: string;
    focal_length: string;
    aperture: string;
    mount: string;
    image_url: string | null;
  }>;
  lights: Array<{
    id: string;
    brand: string;
    model: string;
    type: string;
    color: string;
    power: string;
    image_url: string | null;
  }>;
  controllers: Array<{
    id: string;
    brand: string;
    model: string;
    cpu: string;
    gpu: string | null;
    memory: string;
    storage: string;
    performance: string;
    image_url: string | null;
  }>;
}

interface GenerationOptions {
  language: 'zh' | 'en';
  quality: 'standard' | 'high' | 'ultra';
  mode?: 'draft' | 'final';
}

type ProgressCallback = (progress: number, step: string, log: string) => void;

// Helper to create table cell
const cell = (text: string, opts?: Partial<TableCell>): TableCell => ({ text, options: opts });

// Helper to create table row from strings
const row = (cells: string[]): TableRow => cells.map(t => cell(t));

// Color scheme
const COLORS = {
  primary: '2563EB',
  secondary: '64748B',
  accent: '10B981',
  warning: 'F59E0B',
  destructive: 'EF4444',
  background: 'F8FAFC',
  dark: '1E293B',
  white: 'FFFFFF',
  border: 'E2E8F0',
};

// Module type translations
const MODULE_TYPE_LABELS: Record<string, { zh: string; en: string }> = {
  positioning: { zh: '定位检测', en: 'Positioning' },
  defect: { zh: '缺陷检测', en: 'Defect Detection' },
  ocr: { zh: 'OCR识别', en: 'OCR Recognition' },
  deeplearning: { zh: '深度学习', en: 'Deep Learning' },
  measurement: { zh: '尺寸测量', en: 'Measurement' },
};

// Workstation type translations
const WS_TYPE_LABELS: Record<string, { zh: string; en: string }> = {
  line: { zh: '线体', en: 'Line' },
  turntable: { zh: '转盘', en: 'Turntable' },
  robot: { zh: '机械手', en: 'Robot' },
  platform: { zh: '平台', en: 'Platform' },
};

// Trigger type translations
const TRIGGER_LABELS: Record<string, { zh: string; en: string }> = {
  io: { zh: 'IO触发', en: 'IO Trigger' },
  encoder: { zh: '编码器', en: 'Encoder' },
  software: { zh: '软触发', en: 'Software' },
  continuous: { zh: '连续采集', en: 'Continuous' },
};

// Company info constants
const COMPANY_NAME_ZH = '苏州德星云智能装备有限公司';
const COMPANY_NAME_EN = 'SuZhou DXY Intelligent Solution Co.,Ltd';

// Helper to get workstation code with index (e.g., DB232323.01)
const getWorkstationCode = (projectCode: string, wsIndex: number): string => {
  return `${projectCode}.${String(wsIndex + 1).padStart(2, '0')}`;
};

// Helper to get module display name (e.g., DB232323.01-引导定位)
const getModuleDisplayName = (wsCode: string, moduleType: string, isZh: boolean): string => {
  const typeLabel = MODULE_TYPE_LABELS[moduleType]?.[isZh ? 'zh' : 'en'] || moduleType;
  return `${wsCode}-${typeLabel}`;
};

// Image cache for dataUri conversion (limit to 50 images to prevent memory issues)
const imageCache = new Map<string, string>();
const MAX_CACHE_SIZE = 50;

/**
 * Fetch image as dataUri for stable embedding in PPTX
 * @param url Image URL
 * @returns DataUri string or empty string if failed
 */
async function fetchImageAsDataUri(url: string): Promise<string> {
  if (!url || url.trim() === '') return '';
  
  // Check cache
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }
  
  // If already base64 dataUri, return directly
  if (url.startsWith('data:')) {
    // Limit cache size
    if (imageCache.size >= MAX_CACHE_SIZE) {
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }
    imageCache.set(url, url);
    return url;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('Failed to fetch image:', url, response.status);
      return '';
    }
    
    const blob = await response.blob();
    const reader = new FileReader();
    const dataUri = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    // Limit cache size
    if (imageCache.size >= MAX_CACHE_SIZE) {
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }
    imageCache.set(url, dataUri);
    return dataUri;
  } catch (error) {
    console.warn('Failed to fetch image as dataUri:', url, error);
    return ''; // Return empty string, will use placeholder
  }
}

export async function generatePPTX(
  project: ProjectData,
  workstations: WorkstationData[],
  layouts: LayoutData[],
  modules: ModuleData[],
  options: GenerationOptions,
  onProgress: ProgressCallback,
  hardware?: HardwareData,
  readinessResult?: { missing: Array<{ level: string; name: string; missing: string[] }>; warnings: Array<{ level: string; name: string; warning: string }> }
): Promise<Blob> {
  const pptx = new pptxgen();
  const isZh = options.language === 'zh';

  // Set presentation properties
  pptx.author = project.responsible || 'Vision System';
  pptx.title = `${project.name} - ${isZh ? '视觉系统方案' : 'Vision System Proposal'}`;
  pptx.subject = isZh ? '机器视觉系统技术方案' : 'Machine Vision System Technical Proposal';
  pptx.company = isZh ? COMPANY_NAME_ZH : COMPANY_NAME_EN;

  // Define master slide
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: COLORS.background },
    objects: [
      // Header bar
      { rect: { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: COLORS.primary } } },
      // Footer
      { rect: { x: 0, y: 5.2, w: '100%', h: 0.3, fill: { color: COLORS.dark } } },
      { text: { text: isZh ? COMPANY_NAME_ZH : COMPANY_NAME_EN, options: { x: 0.3, y: 5.25, w: 5, h: 0.2, fontSize: 8, color: COLORS.white } } },
      { text: { text: project.customer, options: { x: 8, y: 5.25, w: 2, h: 0.2, fontSize: 8, color: COLORS.white, align: 'right' } } },
    ],
  });

  let progress = 5;
  onProgress(progress, isZh ? '初始化生成器...' : 'Initializing generator...', isZh ? '开始PPT生成' : 'Starting PPT generation');

  // ========== SLIDE 1: Cover ==========
  progress = 10;
  onProgress(progress, isZh ? '生成封面页...' : 'Generating cover slide...', isZh ? '生成封面页' : 'Cover slide');
  
  const coverSlide = pptx.addSlide();
  
  // Background gradient effect
  coverSlide.addShape('rect', {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.primary },
  });
  coverSlide.addShape('rect', {
    x: 0, y: 3.5, w: '100%', h: 2,
    fill: { color: COLORS.dark },
  });

  // Company name at top
  coverSlide.addText(isZh ? COMPANY_NAME_ZH : COMPANY_NAME_EN, {
    x: 0.5, y: 0.8, w: 9, h: 0.4,
    fontSize: 14, color: COLORS.white, align: 'center',
  });

  // Title
  coverSlide.addText(project.name, {
    x: 0.5, y: 1.8, w: 9, h: 1,
    fontSize: 36, color: COLORS.white, bold: true, align: 'center',
  });

  // Subtitle
  coverSlide.addText(isZh ? '机器视觉系统技术方案' : 'Machine Vision System Technical Proposal', {
    x: 0.5, y: 2.7, w: 9, h: 0.5,
    fontSize: 18, color: COLORS.white, align: 'center',
  });

  // Project info table
  const infoRows: TableRow[] = [
    row([isZh ? '项目编号' : 'Project Code', project.code]),
    row([isZh ? '客户' : 'Customer', project.customer]),
    row([isZh ? '日期' : 'Date', project.date || '-']),
    row([isZh ? '负责人' : 'Responsible', project.responsible || '-']),
  ];

  coverSlide.addTable(infoRows, {
    x: 2.5, y: 3.7, w: 5, h: 1.2,
    fontFace: 'Arial',
    fontSize: 11,
    color: COLORS.white,
    fill: { color: COLORS.dark },
    border: { type: 'none' },
    colW: [1.5, 3.5],
  });

  // ========== SLIDE 2: Missing Items (Draft Mode Only) ==========
  if (options.mode === 'draft' && readinessResult && (readinessResult.missing.length > 0 || readinessResult.warnings.length > 0)) {
    progress = 15;
    onProgress(progress, isZh ? '生成缺失项清单页...' : 'Generating missing items slide...', isZh ? '缺失项清单页' : 'Missing items');
    
    const missingSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    
    // Title
    missingSlide.addText(isZh ? '缺失项与风险提示' : 'Missing Items & Risk Warnings', {
      x: 0.5, y: 0.6, w: 9, h: 0.6,
      fontSize: 24, color: COLORS.dark, bold: true,
    });
    
    missingSlide.addText(isZh ? '本PPT为草案版本，以下项目缺失或需要完善' : 'This is a draft version. The following items are missing or need improvement', {
      x: 0.5, y: 1.2, w: 9, h: 0.4,
      fontSize: 12, color: COLORS.secondary,
    });
    
    let yPos = 1.8;
    
    // Missing items section
    if (readinessResult.missing.length > 0) {
      missingSlide.addText(isZh ? '缺失项（必须补齐）' : 'Missing Items (Must Complete)', {
        x: 0.5, y: yPos, w: 9, h: 0.3,
        fontSize: 14, color: COLORS.destructive, bold: true,
      });
      yPos += 0.4;
      
      const missingRows: TableRow[] = [];
      readinessResult.missing.forEach((item) => {
        const levelLabel = item.level === 'project' ? (isZh ? '项目' : 'Project') :
                          item.level === 'workstation' ? (isZh ? '工位' : 'Workstation') :
                          (isZh ? '模块' : 'Module');
        missingRows.push(row([
          `${levelLabel}: ${item.name}`,
          item.missing.join('、')
        ]));
      });
      
      missingSlide.addTable(missingRows, {
        x: 0.5, y: yPos, w: 9, h: Math.min(2.5, missingRows.length * 0.15),
        fontFace: 'Arial',
        fontSize: 9,
        colW: [2.5, 6.5],
        border: { pt: 0.5, color: COLORS.border },
        fill: { color: COLORS.white },
        valign: 'middle',
      });
      
      yPos += Math.min(2.5, missingRows.length * 0.15) + 0.2;
    }
    
    // Warnings section
    if (readinessResult.warnings.length > 0 && yPos < 4.5) {
      missingSlide.addText(isZh ? '警告项（建议补齐）' : 'Warnings (Recommended)', {
        x: 0.5, y: yPos, w: 9, h: 0.3,
        fontSize: 14, color: COLORS.warning, bold: true,
      });
      yPos += 0.4;
      
      const warningRows: TableRow[] = [];
      readinessResult.warnings.slice(0, Math.floor((4.5 - yPos) / 0.15)).forEach((item) => {
        const levelLabel = item.level === 'project' ? (isZh ? '项目' : 'Project') :
                          item.level === 'workstation' ? (isZh ? '工位' : 'Workstation') :
                          (isZh ? '模块' : 'Module');
        warningRows.push(row([
          `${levelLabel}: ${item.name}`,
          item.warning
        ]));
      });
      
      if (warningRows.length > 0) {
        missingSlide.addTable(warningRows, {
          x: 0.5, y: yPos, w: 9, h: Math.min(4.5 - yPos, warningRows.length * 0.15),
          fontFace: 'Arial',
          fontSize: 9,
          colW: [2.5, 6.5],
          border: { pt: 0.5, color: COLORS.border },
          fill: { color: COLORS.white },
          valign: 'middle',
        });
      }
    }
  }

  // ========== SLIDE 2/3: Project Overview ==========
  progress = 20;
  onProgress(progress, isZh ? '生成项目概览页...' : 'Generating project overview...', isZh ? '生成项目概览页' : 'Project overview');

  const overviewSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  
  overviewSlide.addText(isZh ? '项目概览' : 'Project Overview', {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 24, color: COLORS.dark, bold: true,
  });

  // Statistics cards
  const stats = [
    { label: isZh ? '工位数量' : 'Workstations', value: workstations.length.toString(), icon: '🔧' },
    { label: isZh ? '功能模块' : 'Modules', value: modules.length.toString(), icon: '📦' },
    { label: isZh ? '检测工艺' : 'Process', value: project.product_process || '-', icon: '⚙️' },
    { label: isZh ? '质量策略' : 'Quality', value: project.quality_strategy || 'balanced', icon: '✅' },
  ];

  stats.forEach((stat, i) => {
    const x = 0.5 + i * 2.3;
    overviewSlide.addShape('rect', {
      x, y: 1.4, w: 2.1, h: 1.2,
      fill: { color: COLORS.white },
      shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, opacity: 0.2 },
    });
    overviewSlide.addText(stat.icon, { x, y: 1.5, w: 2.1, h: 0.4, fontSize: 20, align: 'center' });
    overviewSlide.addText(stat.value, { x, y: 1.9, w: 2.1, h: 0.4, fontSize: 18, bold: true, color: COLORS.primary, align: 'center' });
    overviewSlide.addText(stat.label, { x, y: 2.3, w: 2.1, h: 0.3, fontSize: 10, color: COLORS.secondary, align: 'center' });
  });

  // Workstation summary table
  overviewSlide.addText(isZh ? '工位清单' : 'Workstation List', {
    x: 0.5, y: 2.8, w: 9, h: 0.4,
    fontSize: 14, color: COLORS.dark, bold: true,
  });

  const wsTableHeader: TableRow = row([
    isZh ? '编号' : 'Code',
    isZh ? '名称' : 'Name',
    isZh ? '类型' : 'Type',
    isZh ? '节拍(s)' : 'Cycle(s)',
    isZh ? '模块数' : 'Modules',
  ]);

  const wsTableRows: TableRow[] = workstations.map((ws, index) => row([
    getWorkstationCode(project.code, index),
    ws.name,
    WS_TYPE_LABELS[ws.type]?.[options.language] || ws.type,
    ws.cycle_time?.toString() || '-',
    modules.filter(m => m.workstation_id === ws.id).length.toString(),
  ]));

  overviewSlide.addTable([wsTableHeader, ...wsTableRows], {
    x: 0.5, y: 3.2, w: 9, h: 1.8,
    fontFace: 'Arial',
    fontSize: 10,
    colW: [1.2, 3, 1.5, 1.2, 1.2],
    border: { pt: 0.5, color: COLORS.border },
    fill: { color: COLORS.white },
    valign: 'middle',
    align: 'center',
  });

  // ========== WORKSTATION SLIDES (按工位组织，先介绍完一个工位所有内容再介绍下一个) ==========
  const totalWsProgress = 65; // 25-90 for workstations
  const progressPerWs = totalWsProgress / Math.max(workstations.length, 1);
  
  for (let i = 0; i < workstations.length; i++) {
    const ws = workstations[i];
    const wsLayout = layouts.find(l => l.workstation_id === ws.id);
    const wsModules = modules.filter(m => m.workstation_id === ws.id);
    const wsCode = getWorkstationCode(project.code, i); // e.g., DB232323.01

    progress = 25 + i * progressPerWs;
    onProgress(progress, `${isZh ? '处理工位' : 'Processing workstation'}: ${ws.name}...`, `${isZh ? '生成工位页' : 'Workstation slide'}: ${ws.name}`);

    // ========== 1. Workstation Overview Slide ==========
    const wsSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    
    wsSlide.addText(`${isZh ? '工位' : 'Workstation'}: ${ws.name}`, {
      x: 0.5, y: 0.6, w: 9, h: 0.6,
      fontSize: 22, color: COLORS.dark, bold: true,
    });

    wsSlide.addText(wsCode, {
      x: 8, y: 0.7, w: 1.5, h: 0.3,
      fontSize: 12, color: COLORS.secondary, align: 'right',
    });

    // Workstation info panel
    const dims = ws.product_dimensions;
    const wsInfoRows: TableRow[] = [
      row([isZh ? '工位类型' : 'Type', WS_TYPE_LABELS[ws.type]?.[options.language] || ws.type]),
      row([isZh ? '节拍' : 'Cycle Time', `${ws.cycle_time || '-'} s/pcs`]),
      row([isZh ? '产品尺寸' : 'Product Size', dims ? `${dims.length}×${dims.width}×${dims.height} mm` : '-']),
      row([isZh ? '输送类型' : 'Conveyor', wsLayout?.conveyor_type || '-']),
      row([isZh ? '相机数量' : 'Cameras', `${wsLayout?.camera_count || '-'} ${isZh ? '台' : ''}`]),
      row([isZh ? '封闭罩体' : 'Enclosed', ws.enclosed ? (isZh ? '是' : 'Yes') : (isZh ? '否' : 'No')]),
    ];

    wsSlide.addTable(wsInfoRows, {
      x: 0.5, y: 1.3, w: 4, h: 2,
      fontFace: 'Arial',
      fontSize: 10,
      colW: [1.5, 2.5],
      border: { pt: 0.5, color: COLORS.border },
      fill: { color: COLORS.white },
    });

    // Camera mounts
    if (wsLayout?.camera_mounts && wsLayout.camera_mounts.length > 0) {
      wsSlide.addText(isZh ? '相机安装方式' : 'Camera Mounts', {
        x: 5, y: 1.3, w: 4.5, h: 0.3,
        fontSize: 11, color: COLORS.dark, bold: true,
      });
      wsSlide.addText(wsLayout.camera_mounts.join(', '), {
        x: 5, y: 1.6, w: 4.5, h: 0.3,
        fontSize: 10, color: COLORS.secondary,
      });
    }

    // Mechanisms
    if (wsLayout?.mechanisms && wsLayout.mechanisms.length > 0) {
      wsSlide.addText(isZh ? '执行机构' : 'Mechanisms', {
        x: 5, y: 2, w: 4.5, h: 0.3,
        fontSize: 11, color: COLORS.dark, bold: true,
      });
      wsSlide.addText(wsLayout.mechanisms.join(', '), {
        x: 5, y: 2.3, w: 4.5, h: 0.3,
        fontSize: 10, color: COLORS.secondary,
      });
    }

    // Workstation-level hardware configuration display
    const layoutCameras = wsLayout?.selected_cameras?.filter(c => c) || [];
    const layoutLenses = wsLayout?.selected_lenses?.filter(l => l) || [];
    const layoutLights = wsLayout?.selected_lights?.filter(l => l) || [];
    const layoutController = wsLayout?.selected_controller;
    
    if (layoutCameras.length > 0 || layoutLenses.length > 0 || layoutLights.length > 0 || layoutController) {
      wsSlide.addText(isZh ? '硬件配置' : 'Hardware Config', {
        x: 5, y: 2.6, w: 4.5, h: 0.3,
        fontSize: 11, color: COLORS.dark, bold: true,
      });
      
      const hwItems: string[] = [];
      if (layoutCameras.length > 0) {
        hwItems.push(`${isZh ? '相机' : 'Cam'}: ${layoutCameras.map(c => c.model).join(', ')}`);
      }
      if (layoutLenses.length > 0) {
        hwItems.push(`${isZh ? '镜头' : 'Lens'}: ${layoutLenses.map(l => l.model).join(', ')}`);
      }
      if (layoutLights.length > 0) {
        hwItems.push(`${isZh ? '光源' : 'Light'}: ${layoutLights.map(l => l.model).join(', ')}`);
      }
      if (layoutController) {
        hwItems.push(`${isZh ? '工控机' : 'IPC'}: ${layoutController.model}`);
      }
      
      wsSlide.addText(hwItems.join('\n'), {
        x: 5, y: 2.9, w: 4.5, h: 0.5,
        fontSize: 9, color: COLORS.secondary,
      });
    }

    // Module list for this workstation with proper naming
    if (wsModules.length > 0) {
      wsSlide.addText(isZh ? '功能模块' : 'Function Modules', {
        x: 0.5, y: 3.5, w: 9, h: 0.4,
        fontSize: 14, color: COLORS.dark, bold: true,
      });

      const modTableHeader: TableRow = row([
        isZh ? '模块编号' : 'Module Code',
        isZh ? '类型' : 'Type',
        isZh ? '触发方式' : 'Trigger',
        isZh ? '处理时限' : 'Time Limit',
      ]);

      const modTableRows: TableRow[] = wsModules.map(mod => row([
        getModuleDisplayName(wsCode, mod.type, isZh),
        MODULE_TYPE_LABELS[mod.type]?.[options.language] || mod.type,
        TRIGGER_LABELS[mod.trigger_type || 'io']?.[options.language] || mod.trigger_type || '-',
        mod.processing_time_limit ? `${mod.processing_time_limit}ms` : '-',
      ]));

      wsSlide.addTable([modTableHeader, ...modTableRows], {
        x: 0.5, y: 3.9, w: 9, h: 1,
        fontFace: 'Arial',
        fontSize: 10,
        colW: [3, 2, 2, 2],
        border: { pt: 0.5, color: COLORS.border },
        fill: { color: COLORS.white },
        valign: 'middle',
        align: 'center',
      });
    }

    // ========== 2. 机械布局三视图 Slide (三个视图放在一个页面) ==========
    // 优先使用数据库中的URL，fallback到localStorage
    const frontViewUrl = wsLayout?.front_view_url || localStorage.getItem(`workstation-view-${ws.id}-front`);
    const sideViewUrl = wsLayout?.side_view_url || localStorage.getItem(`workstation-view-${ws.id}-side`);
    const topViewUrl = wsLayout?.top_view_url || localStorage.getItem(`workstation-view-${ws.id}-top`);
    
    const hasFrontView = frontViewUrl && wsLayout?.front_view_saved;
    const hasSideView = sideViewUrl && wsLayout?.side_view_saved;
    const hasTopView = topViewUrl && wsLayout?.top_view_saved;
    const hasAnyView = hasFrontView || hasSideView || hasTopView;

    // Only create mechanical layout slide if there are any saved views
    if (hasAnyView) {
      onProgress(progress, `${isZh ? '添加机械布局图' : 'Adding mechanical layout'}: ${ws.name}...`, `${isZh ? '机械布局图' : 'Mechanical Layout'}`);
      
      const layoutSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      
      layoutSlide.addText(`${wsCode} ${ws.name} - ${isZh ? '机械布局图' : 'Mechanical Layout'}`, {
        x: 0.5, y: 0.6, w: 9, h: 0.5,
        fontSize: 20, color: COLORS.dark, bold: true,
      });

      layoutSlide.addText(`${isZh ? COMPANY_NAME_ZH : COMPANY_NAME_EN} | ${project.customer}`, {
        x: 0.5, y: 1.05, w: 9, h: 0.25,
        fontSize: 10, color: COLORS.secondary,
      });

      // Three views layout: 正视图(左上), 侧视图(右上), 俯视图(下)
      const viewWidth = 4.2;
      const viewHeight = 1.8;
      const bottomViewWidth = 8.5;
      const bottomViewHeight = 2.2;

      // 正视图 (Front View) - 左上
      layoutSlide.addText(isZh ? '正视图' : 'Front View', {
        x: 0.5, y: 1.35, w: viewWidth, h: 0.25,
        fontSize: 10, color: COLORS.dark, bold: true, align: 'center',
      });
      if (hasFrontView) {
        try {
          const dataUri = await fetchImageAsDataUri(frontViewUrl!);
          if (dataUri) {
            layoutSlide.addImage({
              data: dataUri,
              x: 0.5, y: 1.6, w: viewWidth, h: viewHeight,
              sizing: { type: 'contain', w: viewWidth, h: viewHeight },
            });
          } else {
            throw new Error('Failed to fetch image');
          }
        } catch (e) {
          console.warn('Failed to add front view image:', e);
          layoutSlide.addShape('rect', {
            x: 0.5, y: 1.6, w: viewWidth, h: viewHeight,
            fill: { color: COLORS.border },
            line: { color: COLORS.secondary, width: 1 },
          });
        }
      } else {
        layoutSlide.addShape('rect', {
          x: 0.5, y: 1.6, w: viewWidth, h: viewHeight,
          fill: { color: COLORS.border },
          line: { color: COLORS.secondary, width: 1 },
        });
        layoutSlide.addText(isZh ? '未保存' : 'Not Saved', {
          x: 0.5, y: 2.3, w: viewWidth, h: 0.4,
          fontSize: 10, color: COLORS.secondary, align: 'center',
        });
      }

      // 侧视图 (Side View) - 右上
      layoutSlide.addText(isZh ? '侧视图' : 'Side View', {
        x: 5, y: 1.35, w: viewWidth, h: 0.25,
        fontSize: 10, color: COLORS.dark, bold: true, align: 'center',
      });
      if (hasSideView) {
        try {
          const dataUri = await fetchImageAsDataUri(sideViewUrl!);
          if (dataUri) {
            layoutSlide.addImage({
              data: dataUri,
              x: 5, y: 1.6, w: viewWidth, h: viewHeight,
              sizing: { type: 'contain', w: viewWidth, h: viewHeight },
            });
          } else {
            throw new Error('Failed to fetch image');
          }
        } catch (e) {
          console.warn('Failed to add side view image:', e);
          layoutSlide.addShape('rect', {
            x: 5, y: 1.6, w: viewWidth, h: viewHeight,
            fill: { color: COLORS.border },
            line: { color: COLORS.secondary, width: 1 },
          });
        }
      } else {
        layoutSlide.addShape('rect', {
          x: 5, y: 1.6, w: viewWidth, h: viewHeight,
          fill: { color: COLORS.border },
          line: { color: COLORS.secondary, width: 1 },
        });
        layoutSlide.addText(isZh ? '未保存' : 'Not Saved', {
          x: 5, y: 2.3, w: viewWidth, h: 0.4,
          fontSize: 10, color: COLORS.secondary, align: 'center',
        });
      }

      // 俯视图 (Top View) - 下方居中
      layoutSlide.addText(isZh ? '俯视图' : 'Top View', {
        x: 0.5, y: 3.5, w: bottomViewWidth, h: 0.25,
        fontSize: 10, color: COLORS.dark, bold: true, align: 'center',
      });
      if (hasTopView) {
        try {
          const dataUri = await fetchImageAsDataUri(topViewUrl!);
          if (dataUri) {
            layoutSlide.addImage({
              data: dataUri,
              x: 0.5, y: 3.75, w: bottomViewWidth, h: bottomViewHeight,
              sizing: { type: 'contain', w: bottomViewWidth, h: bottomViewHeight },
            });
          } else {
            throw new Error('Failed to fetch image');
          }
        } catch (e) {
          console.warn('Failed to add top view image:', e);
          layoutSlide.addShape('rect', {
            x: 0.5, y: 3.75, w: bottomViewWidth, h: bottomViewHeight,
            fill: { color: COLORS.border },
            line: { color: COLORS.secondary, width: 1 },
          });
        }
      } else {
        layoutSlide.addShape('rect', {
          x: 0.5, y: 3.75, w: bottomViewWidth, h: bottomViewHeight,
          fill: { color: COLORS.border },
          line: { color: COLORS.secondary, width: 1 },
        });
        layoutSlide.addText(isZh ? '未保存' : 'Not Saved', {
          x: 0.5, y: 4.6, w: bottomViewWidth, h: 0.4,
          fontSize: 10, color: COLORS.secondary, align: 'center',
        });
      }
    }

    // ========== 3. Module Detail Slides (左图右表布局) ==========
    for (let j = 0; j < wsModules.length; j++) {
      const mod = wsModules[j];
      const moduleCode = getModuleDisplayName(wsCode, mod.type, isZh); // e.g., DB232323.01-定位检测
      
      onProgress(progress + (j / wsModules.length) * (progressPerWs * 0.5), 
        `${isZh ? '处理模块' : 'Processing module'}: ${moduleCode}...`, 
        `${isZh ? '生成模块页' : 'Module slide'}: ${moduleCode}`);

      const modSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });

      modSlide.addText(`${isZh ? '模块' : 'Module'}: ${moduleCode}`, {
        x: 0.5, y: 0.6, w: 9, h: 0.5,
        fontSize: 20, color: COLORS.dark, bold: true,
      });

      modSlide.addText(`${isZh ? COMPANY_NAME_ZH : COMPANY_NAME_EN} | ${project.customer}`, {
        x: 0.5, y: 1.05, w: 9, h: 0.3,
        fontSize: 10, color: COLORS.secondary,
      });

      // ========== 左侧：视觉系统示意图 ==========
      modSlide.addText(isZh ? '视觉系统示意图' : 'Vision System Diagram', {
        x: 0.5, y: 1.35, w: 4.5, h: 0.3,
        fontSize: 12, color: COLORS.dark, bold: true,
      });

      // Check for saved schematic image
      const schematicUrl = mod.schematic_image_url;
      
      if (schematicUrl) {
        try {
          const dataUri = await fetchImageAsDataUri(schematicUrl);
          if (dataUri) {
            modSlide.addImage({
              data: dataUri,
              x: 0.5, y: 1.7, w: 4.5, h: 3.3,
              sizing: { type: 'contain', w: 4.5, h: 3.3 },
            });
          } else {
            throw new Error('Failed to fetch image');
          }
        } catch (e) {
          console.warn('Failed to add schematic image:', e);
          // Fallback placeholder
          modSlide.addShape('rect', {
            x: 0.5, y: 1.7, w: 4.5, h: 3.3,
            fill: { color: COLORS.border },
            line: { color: COLORS.secondary, width: 1 },
          });
          modSlide.addText(isZh ? '未保存示意图' : 'No Diagram Saved', {
            x: 0.5, y: 3.2, w: 4.5, h: 0.4,
            fontSize: 12, color: COLORS.secondary, align: 'center',
          });
        }
      } else {
        // Placeholder for missing schematic
        modSlide.addShape('rect', {
          x: 0.5, y: 1.7, w: 4.5, h: 3.3,
          fill: { color: COLORS.border },
          line: { color: COLORS.secondary, width: 1 },
        });
        modSlide.addText(isZh ? '请先保存视觉系统示意图' : 'Please save diagram first', {
          x: 0.5, y: 3.2, w: 4.5, h: 0.4,
          fontSize: 11, color: COLORS.secondary, align: 'center',
        });
      }

      // ========== 右侧：模块配置参数表 ==========
      modSlide.addText(isZh ? '模块配置参数' : 'Module Configuration', {
        x: 5.2, y: 1.35, w: 4.3, h: 0.3,
        fontSize: 12, color: COLORS.dark, bold: true,
      });

      // Get hardware details
      const selectedCamera = hardware?.cameras.find(c => c.id === mod.selected_camera);
      const selectedLens = hardware?.lenses.find(l => l.id === mod.selected_lens);
      const selectedLight = hardware?.lights.find(l => l.id === mod.selected_light);
      const selectedController = hardware?.controllers.find(c => c.id === mod.selected_controller);

      // Build comprehensive parameter table
      const paramRows: TableRow[] = [
        // Basic info section
        row([isZh ? '模块类型' : 'Type', MODULE_TYPE_LABELS[mod.type]?.[options.language] || mod.type]),
        row([isZh ? '触发方式' : 'Trigger', TRIGGER_LABELS[mod.trigger_type || 'io']?.[options.language] || mod.trigger_type || '-']),
        row([isZh ? '处理时限' : 'Time Limit', mod.processing_time_limit ? `${mod.processing_time_limit}ms` : '-']),
      ];
      
      // Get config for common and imaging parameters
      const cfg = (mod.defect_config || mod.positioning_config || mod.ocr_config || mod.deep_learning_config || (mod as any).measurement_config) as any;
      
      // Add common parameters if available
      if (cfg) {
        if (cfg.detectionObject) paramRows.push(row([isZh ? '检测对象' : 'Detection Object', cfg.detectionObject]));
        if (cfg.judgmentStrategy) {
          const strategyLabels: Record<string, Record<string, string>> = {
            no_miss: { zh: '宁可误杀不可漏检', en: 'No Miss' },
            balanced: { zh: '平衡', en: 'Balanced' },
            allow_pass: { zh: '宁可放行', en: 'Allow Pass' },
          };
          paramRows.push(row([isZh ? '判定策略' : 'Judgment Strategy', strategyLabels[cfg.judgmentStrategy]?.[options.language] || cfg.judgmentStrategy]));
        }
        if (cfg.outputAction && Array.isArray(cfg.outputAction) && cfg.outputAction.length > 0) {
          paramRows.push(row([isZh ? '输出动作' : 'Output Actions', cfg.outputAction.join('、')]));
        }
        if (cfg.communicationMethod) paramRows.push(row([isZh ? '通讯方式' : 'Communication', cfg.communicationMethod]));
        if (cfg.signalDefinition) paramRows.push(row([isZh ? '信号定义' : 'Signal Definition', cfg.signalDefinition]));
        if (cfg.dataRetentionDays) paramRows.push(row([isZh ? '数据留存天数' : 'Data Retention Days', `${cfg.dataRetentionDays}天`]));
      }
      
      // Add imaging parameters if available
      if (cfg?.imaging) {
        const img = cfg.imaging;
        paramRows.push(row(['', ''])); // Separator
        paramRows.push(row([isZh ? '【成像参数】' : '[Imaging]', '']));
        if (img.workingDistance) paramRows.push(row([isZh ? '工作距离 WD' : 'Working Distance', `${img.workingDistance}mm`]));
        if (img.fieldOfView) paramRows.push(row([isZh ? '视野 FOV' : 'Field of View', `${img.fieldOfView}mm`]));
        if (img.resolutionPerPixel) paramRows.push(row([isZh ? '分辨率换算' : 'Resolution', `${img.resolutionPerPixel}mm/px`]));
        if (img.exposure) paramRows.push(row([isZh ? '曝光' : 'Exposure', img.exposure]));
        if (img.gain !== null && img.gain !== undefined) paramRows.push(row([isZh ? '增益' : 'Gain', `${img.gain}dB`]));
        if (img.triggerDelay !== null && img.triggerDelay !== undefined) paramRows.push(row([isZh ? '触发延时' : 'Trigger Delay', `${img.triggerDelay}ms`]));
        if (img.lightMode) paramRows.push(row([isZh ? '光源模式' : 'Light Mode', img.lightMode]));
        if (img.lightAngle) paramRows.push(row([isZh ? '光源角度' : 'Light Angle', img.lightAngle]));
        if (img.lightDistance) paramRows.push(row([isZh ? '光源距离' : 'Light Distance', `${img.lightDistance}mm`]));
        if (img.lensAperture) paramRows.push(row([isZh ? '镜头光圈' : 'Lens Aperture', img.lensAperture]));
        if (img.depthOfField !== null && img.depthOfField !== undefined) paramRows.push(row([isZh ? '景深要求' : 'Depth of Field', `${img.depthOfField}mm`]));
      }

      // Add type-specific config rows
      if (mod.type === 'positioning' && mod.positioning_config) {
        const cfg = mod.positioning_config as Record<string, unknown>;
        if (cfg.fieldOfView) paramRows.push(row([isZh ? '视野范围' : 'FOV', `${cfg.fieldOfView}mm`]));
        if (cfg.accuracyRequirement) paramRows.push(row([isZh ? '定位精度' : 'Accuracy', `${cfg.accuracyRequirement}mm`]));
        if (cfg.repeatabilityRequirement) paramRows.push(row([isZh ? '重复精度' : 'Repeatability', `${cfg.repeatabilityRequirement}mm`]));
        // Industrial positioning parameters
        if (cfg.outputCoordinateSystem) paramRows.push(row([isZh ? '输出坐标系' : 'Output Coordinate System', String(cfg.outputCoordinateSystem)]));
        if (cfg.calibrationCycle) paramRows.push(row([isZh ? '标定周期' : 'Calibration Cycle', String(cfg.calibrationCycle)]));
        if (cfg.accuracyAcceptanceMethod) paramRows.push(row([isZh ? '精度验收方法' : 'Accuracy Acceptance', String(cfg.accuracyAcceptanceMethod)]));
        if (cfg.targetFeatureType) paramRows.push(row([isZh ? '目标特征类型' : 'Target Feature Type', String(cfg.targetFeatureType)]));
        if (cfg.targetCount) paramRows.push(row([isZh ? '目标数量' : 'Target Count', String(cfg.targetCount)]));
        if (cfg.occlusionTolerance) paramRows.push(row([isZh ? '遮挡容忍' : 'Occlusion Tolerance', String(cfg.occlusionTolerance)]));
      }

      if (mod.type === 'defect' && mod.defect_config) {
        const cfg = mod.defect_config as Record<string, unknown>;
        if (cfg.defectClasses && Array.isArray(cfg.defectClasses)) {
          paramRows.push(row([isZh ? '缺陷类别' : 'Defect Classes', (cfg.defectClasses as string[]).slice(0, 4).join(', ') + ((cfg.defectClasses as string[]).length > 4 ? '...' : '')]));
        }
        if (cfg.minDefectSize) paramRows.push(row([isZh ? '最小缺陷' : 'Min Defect', `${cfg.minDefectSize}mm`]));
        if (cfg.detectionAreaLength && cfg.detectionAreaWidth) {
          paramRows.push(row([isZh ? '检测区域' : 'Detection Area', `${cfg.detectionAreaLength}×${cfg.detectionAreaWidth}mm`]));
        }
        // Industrial defect parameters
        if (cfg.defectContrast) paramRows.push(row([isZh ? '缺陷对比度' : 'Defect Contrast', String(cfg.defectContrast)]));
        if (cfg.materialReflectionLevel) paramRows.push(row([isZh ? '材质反光等级' : 'Material Reflection', String(cfg.materialReflectionLevel)]));
        if (cfg.allowedMissRate) paramRows.push(row([isZh ? '允许漏检率' : 'Allowed Miss Rate', String(cfg.allowedMissRate)]));
        if (cfg.allowedFalseRate) paramRows.push(row([isZh ? '允许误检率' : 'Allowed False Rate', String(cfg.allowedFalseRate)]));
        if (cfg.confidenceThreshold) paramRows.push(row([isZh ? '置信度阈值' : 'Confidence Threshold', String(cfg.confidenceThreshold)]));
      }

      if (mod.type === 'ocr' && mod.ocr_config) {
        const cfg = mod.ocr_config as Record<string, unknown>;
        if (cfg.charType) paramRows.push(row([isZh ? '字符类型' : 'Char Type', String(cfg.charType)]));
        if (cfg.minCharHeight) paramRows.push(row([isZh ? '字符高度' : 'Char Height', `${cfg.minCharHeight}mm`]));
        if (cfg.contentRule) paramRows.push(row([isZh ? '内容规则' : 'Content Rule', String(cfg.contentRule)]));
        // Industrial OCR parameters
        if (cfg.charWidth) paramRows.push(row([isZh ? '字符宽度' : 'Char Width', `${cfg.charWidth}mm`]));
        if (cfg.minStrokeWidth) paramRows.push(row([isZh ? '最小笔画' : 'Min Stroke Width', `${cfg.minStrokeWidth}mm`]));
        if (cfg.allowedRotationAngle) paramRows.push(row([isZh ? '允许旋转角度' : 'Allowed Rotation', `${cfg.allowedRotationAngle}°`]));
        if (cfg.allowedDamageLevel) paramRows.push(row([isZh ? '允许污损等级' : 'Allowed Damage Level', String(cfg.allowedDamageLevel)]));
        if (cfg.charRuleExample) paramRows.push(row([isZh ? '字符规则示例' : 'Char Rule Example', String(cfg.charRuleExample)]));
      }

      if (mod.type === 'deeplearning' && mod.deep_learning_config) {
        const cfg = mod.deep_learning_config as Record<string, unknown>;
        if (cfg.taskType) paramRows.push(row([isZh ? '任务类型' : 'Task Type', String(cfg.taskType)]));
        if (cfg.targetClasses && Array.isArray(cfg.targetClasses)) {
          paramRows.push(row([isZh ? '目标类别' : 'Classes', (cfg.targetClasses as string[]).slice(0, 4).join(', ') + ((cfg.targetClasses as string[]).length > 4 ? '...' : '')]));
        }
        if (cfg.inferenceTimeTarget) paramRows.push(row([isZh ? '推理时间' : 'Inference Time', `${cfg.inferenceTimeTarget}ms`]));
      }

      if (mod.type === 'measurement' && mod.measurement_config) {
        const cfg = mod.measurement_config as Record<string, unknown>;
        if (cfg.measurementItems && Array.isArray(cfg.measurementItems)) {
          paramRows.push(row([isZh ? '测量项' : 'Measurement Items', (cfg.measurementItems as string[]).slice(0, 3).join(', ') + ((cfg.measurementItems as string[]).length > 3 ? '...' : '')]));
        }
        if (cfg.targetAccuracy) paramRows.push(row([isZh ? '目标精度' : 'Target Accuracy', `${cfg.targetAccuracy}mm`]));
        if (cfg.systemAccuracy) paramRows.push(row([isZh ? '系统精度' : 'System Accuracy', `${cfg.systemAccuracy}mm`]));
        // Industrial measurement parameters
        if (cfg.grr) paramRows.push(row([isZh ? 'GRR' : 'GRR', String(cfg.grr)]));
        if (cfg.calibrationCycle) paramRows.push(row([isZh ? '标定周期' : 'Calibration Cycle', String(cfg.calibrationCycle)]));
        if (cfg.calibrationBlockType) paramRows.push(row([isZh ? '量块类型' : 'Calibration Block Type', String(cfg.calibrationBlockType)]));
        if (cfg.edgeExtractionMethod) paramRows.push(row([isZh ? '边缘提取方式' : 'Edge Extraction', String(cfg.edgeExtractionMethod)]));
      }

      // Hardware section - separator
      paramRows.push(row(['', '']));
      paramRows.push(row([isZh ? '【硬件配置】' : '[Hardware]', '']));
      
      // Check if we need to split into two columns or add continuation page
      const MAX_ROWS_PER_COLUMN = 20; // Maximum rows before splitting
      
      // Hardware details
      if (selectedCamera) {
        paramRows.push(row([isZh ? '相机' : 'Camera', `${selectedCamera.brand} ${selectedCamera.model}`]));
        paramRows.push(row([isZh ? '分辨率' : 'Resolution', `${selectedCamera.resolution} @ ${selectedCamera.frame_rate}fps`]));
      }
      if (selectedLens) {
        paramRows.push(row([isZh ? '镜头' : 'Lens', `${selectedLens.brand} ${selectedLens.model}`]));
        paramRows.push(row([isZh ? '焦距/光圈' : 'Focal/Aperture', `${selectedLens.focal_length} · ${selectedLens.aperture}`]));
      }
      if (selectedLight) {
        paramRows.push(row([isZh ? '光源' : 'Light', `${selectedLight.brand} ${selectedLight.model}`]));
        paramRows.push(row([isZh ? '光源类型' : 'Light Type', `${selectedLight.color}${selectedLight.type} · ${selectedLight.power}`]));
      }
      if (selectedController) {
        paramRows.push(row([isZh ? '工控机' : 'IPC', `${selectedController.brand} ${selectedController.model}`]));
        paramRows.push(row([isZh ? 'CPU/内存' : 'CPU/RAM', `${selectedController.cpu} · ${selectedController.memory}`]));
      }

      // Filter out empty rows and check if we need to split
      const filteredRows = paramRows.filter(r => r[0].text || r[1].text);
      
      // If too many rows, split into two columns or create continuation page
      if (filteredRows.length > MAX_ROWS_PER_COLUMN) {
        // Split into two columns
        const midPoint = Math.ceil(filteredRows.length / 2);
        const leftRows = filteredRows.slice(0, midPoint);
        const rightRows = filteredRows.slice(midPoint);
        
        modSlide.addTable(leftRows, {
          x: 5.2, y: 1.7, w: 2.0, h: 3.3,
          fontFace: 'Arial',
          fontSize: 7,
          colW: [0.8, 1.2],
          border: { pt: 0.5, color: COLORS.border },
          fill: { color: COLORS.white },
          valign: 'middle',
        });
        
        modSlide.addTable(rightRows, {
          x: 7.3, y: 1.7, w: 2.0, h: 3.3,
          fontFace: 'Arial',
          fontSize: 7,
          colW: [0.8, 1.2],
          border: { pt: 0.5, color: COLORS.border },
          fill: { color: COLORS.white },
          valign: 'middle',
        });
      } else {
        // Single column table
        modSlide.addTable(filteredRows, {
          x: 5.2, y: 1.7, w: 4.3, h: 3.3,
          fontFace: 'Arial',
          fontSize: 8,
          colW: [1.5, 2.8],
          border: { pt: 0.5, color: COLORS.border },
          fill: { color: COLORS.white },
          valign: 'middle',
        });
      }
    }
  }

  // ========== HARDWARE DETAIL SLIDES (左图右文布局) ==========
  if (hardware) {
    progress = 88;
    onProgress(progress, isZh ? '生成硬件详情...' : 'Generating hardware details...', isZh ? '硬件详情页' : 'Hardware details');

    // Get unique hardware IDs used in modules
    const usedCameraIds = new Set(modules.filter(m => m.selected_camera).map(m => m.selected_camera));
    const usedLensIds = new Set(modules.filter(m => m.selected_lens).map(m => m.selected_lens));
    const usedLightIds = new Set(modules.filter(m => m.selected_light).map(m => m.selected_light));
    const usedControllerIds = new Set(modules.filter(m => m.selected_controller).map(m => m.selected_controller));

    // Filter to only used hardware
    const usedCameras = hardware.cameras.filter(c => usedCameraIds.has(c.id));
    const usedLenses = hardware.lenses.filter(l => usedLensIds.has(l.id));
    const usedLights = hardware.lights.filter(l => usedLightIds.has(l.id));
    const usedControllers = hardware.controllers.filter(c => usedControllerIds.has(c.id));

    // Helper function to add hardware detail slide with left-image-right-text layout
    const addHardwareDetailSlide = async (
      title: string,
      subtitle: string,
      imageUrl: string | null,
      infoRows: TableRow[]
    ) => {
      const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      
      // Title
      slide.addText(title, {
        x: 0.5, y: 0.6, w: 9, h: 0.5,
        fontSize: 22, color: COLORS.dark, bold: true,
      });

      // Subtitle
      slide.addText(subtitle, {
        x: 0.5, y: 1.05, w: 9, h: 0.3,
        fontSize: 12, color: COLORS.secondary,
      });

      // Left side: Image placeholder or actual image
      if (imageUrl) {
        try {
          // Add image on left side using dataUri
          const dataUri = await fetchImageAsDataUri(imageUrl);
          if (dataUri) {
            slide.addImage({
              data: dataUri,
              x: 0.5, y: 1.5, w: 4, h: 3.5,
              sizing: { type: 'contain', w: 4, h: 3.5 },
            });
          } else {
            throw new Error('Failed to fetch image');
          }
        } catch (e) {
          // Fallback to placeholder
          slide.addShape('rect', {
            x: 0.5, y: 1.5, w: 4, h: 3.5,
            fill: { color: COLORS.border },
            line: { color: COLORS.secondary, width: 1 },
          });
          slide.addText(isZh ? '产品图片' : 'Product Image', {
            x: 0.5, y: 3, w: 4, h: 0.5,
            fontSize: 14, color: COLORS.secondary, align: 'center',
          });
        }
      } else {
        // Placeholder for missing image
        slide.addShape('rect', {
          x: 0.5, y: 1.5, w: 4, h: 3.5,
          fill: { color: COLORS.border },
          line: { color: COLORS.secondary, width: 1 },
        });
        slide.addText(isZh ? '产品图片' : 'Product Image', {
          x: 0.5, y: 3, w: 4, h: 0.5,
          fontSize: 14, color: COLORS.secondary, align: 'center',
        });
      }

      // Right side: Info table
      slide.addText(isZh ? '规格参数' : 'Specifications', {
        x: 5, y: 1.5, w: 4.5, h: 0.4,
        fontSize: 14, color: COLORS.dark, bold: true,
      });

      slide.addTable(infoRows, {
        x: 5, y: 1.95, w: 4.5, h: Math.min(infoRows.length * 0.45 + 0.1, 3),
        fontFace: 'Arial',
        fontSize: 10,
        colW: [1.8, 2.7],
        border: { pt: 0.5, color: COLORS.border },
        fill: { color: COLORS.white },
        valign: 'middle',
      });
    };

    // Generate camera detail slides
    for (const camera of usedCameras) {
      const cameraInfoRows: TableRow[] = [
        row([isZh ? '品牌' : 'Brand', camera.brand]),
        row([isZh ? '型号' : 'Model', camera.model]),
        row([isZh ? '分辨率' : 'Resolution', camera.resolution]),
        row([isZh ? '帧率' : 'Frame Rate', `${camera.frame_rate} fps`]),
        row([isZh ? '接口' : 'Interface', camera.interface]),
        row([isZh ? '传感器尺寸' : 'Sensor Size', camera.sensor_size]),
      ];
      await addHardwareDetailSlide(
        `${isZh ? '相机' : 'Camera'}: ${camera.model}`,
        `${camera.brand} | ${isZh ? '工业相机' : 'Industrial Camera'}`,
        camera.image_url,
        cameraInfoRows
      );
    }

    // Generate lens detail slides
    for (const lens of usedLenses) {
      const lensInfoRows: TableRow[] = [
        row([isZh ? '品牌' : 'Brand', lens.brand]),
        row([isZh ? '型号' : 'Model', lens.model]),
        row([isZh ? '焦距' : 'Focal Length', lens.focal_length]),
        row([isZh ? '光圈' : 'Aperture', lens.aperture]),
        row([isZh ? '接口' : 'Mount', lens.mount]),
      ];
      await addHardwareDetailSlide(
        `${isZh ? '镜头' : 'Lens'}: ${lens.model}`,
        `${lens.brand} | ${isZh ? '工业镜头' : 'Industrial Lens'}`,
        lens.image_url,
        lensInfoRows
      );
    }

    // Generate light detail slides
    for (const light of usedLights) {
      const lightInfoRows: TableRow[] = [
        row([isZh ? '品牌' : 'Brand', light.brand]),
        row([isZh ? '型号' : 'Model', light.model]),
        row([isZh ? '类型' : 'Type', light.type]),
        row([isZh ? '颜色' : 'Color', light.color]),
        row([isZh ? '功率' : 'Power', light.power]),
      ];
      await addHardwareDetailSlide(
        `${isZh ? '光源' : 'Light'}: ${light.model}`,
        `${light.brand} | ${isZh ? '机器视觉光源' : 'Machine Vision Light'}`,
        light.image_url,
        lightInfoRows
      );
    }

    // Generate controller detail slides
    for (const controller of usedControllers) {
      const controllerInfoRows: TableRow[] = [
        row([isZh ? '品牌' : 'Brand', controller.brand]),
        row([isZh ? '型号' : 'Model', controller.model]),
        row(['CPU', controller.cpu]),
        row([isZh ? '内存' : 'Memory', controller.memory]),
        row([isZh ? '存储' : 'Storage', controller.storage]),
        row([isZh ? '性能等级' : 'Performance', controller.performance]),
      ];
      if (controller.gpu) {
        controllerInfoRows.splice(3, 0, row(['GPU', controller.gpu]));
      }
      await addHardwareDetailSlide(
        `${isZh ? '工控机' : 'Controller'}: ${controller.model}`,
        `${controller.brand} | ${isZh ? '工业控制器' : 'Industrial Controller'}`,
        controller.image_url,
        controllerInfoRows
      );
    }
  }

  // ========== HARDWARE SUMMARY SLIDE ==========
  progress = 92;
  onProgress(progress, isZh ? '生成硬件清单...' : 'Generating hardware list...', isZh ? '硬件清单汇总' : 'Hardware summary');

  const hwSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  
  hwSlide.addText(isZh ? '硬件清单汇总' : 'Hardware Summary', {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 24, color: COLORS.dark, bold: true,
  });

  // Count hardware from both module-level and layout-level selections
  // Module-level counts
  const moduleCameraCount = modules.filter(m => m.selected_camera).length;
  const moduleLensCount = modules.filter(m => m.selected_lens).length;
  const moduleLightCount = modules.filter(m => m.selected_light).length;
  const moduleControllerIds = new Set(modules.filter(m => m.selected_controller).map(m => m.selected_controller));
  
  // Layout-level counts (workstation hardware configuration)
  const layoutCameraCount = layouts.reduce((sum, l) => sum + (l.selected_cameras?.filter(c => c)?.length || 0), 0);
  const layoutLensCount = layouts.reduce((sum, l) => sum + (l.selected_lenses?.filter(c => c)?.length || 0), 0);
  const layoutLightCount = layouts.reduce((sum, l) => sum + (l.selected_lights?.filter(c => c)?.length || 0), 0);
  const layoutControllerCount = layouts.filter(l => l.selected_controller).length;
  
  // Total counts (prefer layout-level if available, otherwise use module-level)
  const totalCameraCount = layoutCameraCount > 0 ? layoutCameraCount : moduleCameraCount;
  const totalLensCount = layoutLensCount > 0 ? layoutLensCount : moduleLensCount;
  const totalLightCount = layoutLightCount > 0 ? layoutLightCount : moduleLightCount;
  const totalControllerCount = layoutControllerCount > 0 ? layoutControllerCount : moduleControllerIds.size;

  const hwSummary: TableRow[] = [
    row([isZh ? '设备类型' : 'Device Type', isZh ? '数量' : 'Quantity', isZh ? '备注' : 'Notes']),
    row([isZh ? '工业相机' : 'Industrial Camera', totalCameraCount.toString(), isZh ? '按工位配置' : 'Per workstation']),
    row([isZh ? '工业镜头' : 'Industrial Lens', totalLensCount.toString(), isZh ? '按工位配置' : 'Per workstation']),
    row([isZh ? '光源' : 'Light Source', totalLightCount.toString(), isZh ? '按工位配置' : 'Per workstation']),
    row([isZh ? '工控机' : 'Industrial PC', totalControllerCount.toString(), isZh ? '可多工位共享' : 'Shared']),
  ];

  hwSlide.addTable(hwSummary, {
    x: 0.5, y: 1.4, w: 9, h: 2,
    fontFace: 'Arial',
    fontSize: 11,
    colW: [3, 2, 4],
    border: { pt: 0.5, color: COLORS.border },
    fill: { color: COLORS.white },
    valign: 'middle',
    align: 'center',
  });

  // ========== END SLIDE ==========
  progress = 98;
  onProgress(progress, isZh ? '生成结束页...' : 'Generating end slide...', isZh ? '生成结束页' : 'End slide');

  const endSlide = pptx.addSlide();
  
  endSlide.addShape('rect', {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { color: COLORS.dark },
  });

  // Company name at top
  endSlide.addText(isZh ? COMPANY_NAME_ZH : COMPANY_NAME_EN, {
    x: 0.5, y: 1.5, w: 9, h: 0.5,
    fontSize: 16, color: COLORS.white, align: 'center',
  });

  endSlide.addText(isZh ? '感谢您的关注' : 'Thank You', {
    x: 0.5, y: 2.2, w: 9, h: 1,
    fontSize: 36, color: COLORS.white, bold: true, align: 'center',
  });

  endSlide.addText(project.customer, {
    x: 0.5, y: 3.2, w: 9, h: 0.5,
    fontSize: 18, color: COLORS.white, align: 'center',
  });

  endSlide.addText(`${project.responsible || ''} | ${project.date || ''}`, {
    x: 0.5, y: 3.7, w: 9, h: 0.4,
    fontSize: 12, color: COLORS.secondary, align: 'center',
  });

  // Generate blob
  progress = 100;
  onProgress(progress, isZh ? '完成' : 'Complete', isZh ? 'PPT生成完成' : 'PPT generation complete');

  const blob = await pptx.write({ outputType: 'blob' }) as Blob;
  return blob;
}
