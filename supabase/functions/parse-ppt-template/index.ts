import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import PizZip from "https://esm.sh/pizzip@3.1.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TemplatePlaceholder {
  type: 'title' | 'body' | 'picture' | 'chart' | 'table' | 'custom';
  name: string;
  position: { x: number; y: number; w: number; h: number };
}

interface TemplateMaster {
  id: string;
  name: string;
  index: number;
  background: {
    type: 'color' | 'image' | 'gradient';
    value: string;
  };
  placeholders: TemplatePlaceholder[];
}

interface TemplateLayout {
  id: string;
  name: string;
  masterRef: string;
  type: string;
  placeholders: TemplatePlaceholder[];
}

interface TemplateSlide {
  index: number;
  layoutRef: string;
  customFields: string[];
}

interface ParsedTemplate {
  fileName: string;
  fileSize: number;
  slideCount: number;
  dimensions: { width: number; height: number };
  masters: TemplateMaster[];
  layouts: TemplateLayout[];
  slides: TemplateSlide[];
  customFields: string[];
  availableSystemFields: string[];
  parsedAt: string;
}

// 系统可用字段列表
const AVAILABLE_SYSTEM_FIELDS = [
  'project_name', 'project_code', 'customer', 'date', 'date_formatted',
  'date_year', 'date_month', 'date_day', 'responsible', 'vision_responsible',
  'sales_responsible', 'description', 'spec_version', 'product_process', 'quality_strategy',
  'workstation_count', 'total_module_count', 'camera_count', 'lens_count',
  'light_count', 'controller_count', 'total_hardware_count',
  'generated_at', 'generated_date', 'generated_time',
  // 工位字段（循环内使用）
  'name', 'code', 'type', 'type_label', 'index', 'cycle_time', 'shot_count',
  'observation_target', 'motion_description', 'risk_notes', 'module_count',
  'front_view_image', 'side_view_image', 'top_view_image',
  // 模块字段（循环内使用）
  'trigger_type', 'trigger_label', 'roi_strategy', 'processing_time_limit', 'schematic_image',
  // 硬件字段
  'brand', 'model', 'resolution', 'sensor_size', 'interface', 'frame_rate',
  'focal_length', 'aperture', 'mount', 'color', 'power', 'cpu', 'gpu', 'memory', 'storage',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 验证认证
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Parsing template for user: ${userData.user.id}`);

    // 解析请求
    const body = await req.json();
    const { templateId, templateUrl, fileName = 'template.pptx', fileSize = 0 } = body;

    if (!templateId && !templateUrl) {
      return new Response(
        JSON.stringify({ error: 'Either templateId or templateUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取模板文件
    let templateBuffer: ArrayBuffer;
    let actualFileName = fileName;
    let actualFileSize = fileSize;

    if (templateId) {
      const { data: template, error: templateError } = await supabase
        .from('ppt_templates')
        .select('file_url, name')
        .eq('id', templateId)
        .single();

      if (templateError || !template?.file_url) {
        return new Response(
          JSON.stringify({ error: 'Template not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      actualFileName = template.name || fileName;
      const templateResponse = await fetch(template.file_url);
      if (!templateResponse.ok) {
        throw new Error(`Failed to download template: ${templateResponse.statusText}`);
      }
      templateBuffer = await templateResponse.arrayBuffer();
      actualFileSize = templateBuffer.byteLength;
    } else {
      const templateResponse = await fetch(templateUrl!);
      if (!templateResponse.ok) {
        throw new Error(`Failed to download template: ${templateResponse.statusText}`);
      }
      templateBuffer = await templateResponse.arrayBuffer();
      if (!actualFileSize) {
        actualFileSize = templateBuffer.byteLength;
      }
    }

    console.log(`Template loaded, size: ${templateBuffer.byteLength} bytes`);

    // 解析PPTX结构
    const zip = new PizZip(templateBuffer);
    
    // 解析presentation.xml获取幻灯片尺寸
    const presentationXml = zip.file('ppt/presentation.xml')?.asText() || '';
    const dimensions = parseSlideDimensions(presentationXml);
    
    // 解析母版
    const masters = parseSlideMasters(zip);
    
    // 解析布局
    const layouts = parseSlideLayouts(zip, masters);
    
    // 解析幻灯片
    const slides = parseSlides(zip);
    
    // 收集所有自定义占位符
    const customFields = collectCustomFields(zip);
    
    const parsedTemplate: ParsedTemplate = {
      fileName: actualFileName,
      fileSize: actualFileSize,
      slideCount: slides.length,
      dimensions,
      masters,
      layouts,
      slides,
      customFields,
      availableSystemFields: AVAILABLE_SYSTEM_FIELDS,
      parsedAt: new Date().toISOString(),
    };

    console.log(`Parsed template: ${masters.length} masters, ${layouts.length} layouts, ${slides.length} slides, ${customFields.length} custom fields`);

    return new Response(
      JSON.stringify({ success: true, template: parsedTemplate }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    console.error('Error parsing template:', err);
    const error = err as { message?: string };
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * 解析幻灯片尺寸
 */
function parseSlideDimensions(xml: string): { width: number; height: number } {
  // 默认16:9尺寸 (单位: EMU, 914400 EMU = 1 inch)
  let width = 9144000; // 10 inches
  let height = 5143500; // 5.625 inches
  
  // 查找 <p:sldSz cx="..." cy="..." />
  const sldSzMatch = xml.match(/<p:sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
  if (sldSzMatch) {
    width = parseInt(sldSzMatch[1], 10);
    height = parseInt(sldSzMatch[2], 10);
  }
  
  // 转换为英寸
  return {
    width: width / 914400,
    height: height / 914400,
  };
}

/**
 * 解析母版
 */
function parseSlideMasters(zip: PizZip): TemplateMaster[] {
  const masters: TemplateMaster[] = [];
  const masterFolder = zip.folder('ppt/slideMasters');
  
  if (!masterFolder) return masters;
  
  // 遍历所有母版文件
  let index = 0;
  for (let i = 1; i <= 10; i++) {
    const masterFile = zip.file(`ppt/slideMasters/slideMaster${i}.xml`);
    if (!masterFile) continue;
    
    const xml = masterFile.asText();
    const master: TemplateMaster = {
      id: `master${i}`,
      name: extractMasterName(xml) || `母版 ${i}`,
      index: index++,
      background: extractBackground(xml),
      placeholders: extractPlaceholders(xml),
    };
    
    masters.push(master);
  }
  
  return masters;
}

/**
 * 解析布局
 */
function parseSlideLayouts(zip: PizZip, masters: TemplateMaster[]): TemplateLayout[] {
  const layouts: TemplateLayout[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const layoutFile = zip.file(`ppt/slideLayouts/slideLayout${i}.xml`);
    if (!layoutFile) continue;
    
    const xml = layoutFile.asText();
    const layout: TemplateLayout = {
      id: `layout${i}`,
      name: extractLayoutName(xml) || `布局 ${i}`,
      masterRef: masters.length > 0 ? masters[0].id : '',
      type: extractLayoutType(xml),
      placeholders: extractPlaceholders(xml),
    };
    
    layouts.push(layout);
  }
  
  return layouts;
}

/**
 * 解析幻灯片
 */
function parseSlides(zip: PizZip): TemplateSlide[] {
  const slides: TemplateSlide[] = [];
  
  for (let i = 1; i <= 100; i++) {
    const slideFile = zip.file(`ppt/slides/slide${i}.xml`);
    if (!slideFile) continue;
    
    const xml = slideFile.asText();
    const slide: TemplateSlide = {
      index: i,
      layoutRef: extractLayoutRef(xml, i),
      customFields: extractCustomFieldsFromText(xml),
    };
    
    slides.push(slide);
  }
  
  return slides;
}

/**
 * 收集所有自定义占位符
 */
function collectCustomFields(zip: PizZip): string[] {
  const fields = new Set<string>();
  
  // 遍历所有幻灯片
  for (let i = 1; i <= 100; i++) {
    const slideFile = zip.file(`ppt/slides/slide${i}.xml`);
    if (!slideFile) continue;
    
    const customFields = extractCustomFieldsFromText(slideFile.asText());
    customFields.forEach(f => fields.add(f));
  }
  
  // 遍历母版
  for (let i = 1; i <= 10; i++) {
    const masterFile = zip.file(`ppt/slideMasters/slideMaster${i}.xml`);
    if (!masterFile) continue;
    
    const customFields = extractCustomFieldsFromText(masterFile.asText());
    customFields.forEach(f => fields.add(f));
  }
  
  // 遍历布局
  for (let i = 1; i <= 20; i++) {
    const layoutFile = zip.file(`ppt/slideLayouts/slideLayout${i}.xml`);
    if (!layoutFile) continue;
    
    const customFields = extractCustomFieldsFromText(layoutFile.asText());
    customFields.forEach(f => fields.add(f));
  }
  
  return Array.from(fields);
}

/**
 * 从文本中提取 {{field}} 占位符
 */
function extractCustomFieldsFromText(xml: string): string[] {
  const fields: string[] = [];
  // 匹配 {{fieldName}} 模式，包括循环语法 {{#list}} {{/list}}
  const regex = /\{\{([#/]?)([a-zA-Z_][a-zA-Z0-9_.\-]*)\}\}/g;
  let match;
  
  while ((match = regex.exec(xml)) !== null) {
    const prefix = match[1]; // '#' or '/' or ''
    const fieldName = match[2];
    
    if (prefix === '#') {
      fields.push(`#${fieldName}`); // 循环开始
    } else if (prefix === '/') {
      // 循环结束，不需要记录
    } else {
      fields.push(fieldName);
    }
  }
  
  return [...new Set(fields)];
}

/**
 * 提取母版名称
 */
function extractMasterName(xml: string): string {
  // 查找 <p:cSld name="...">
  const match = xml.match(/<p:cSld[^>]*name="([^"]+)"/);
  return match ? match[1] : '';
}

/**
 * 提取布局名称
 */
function extractLayoutName(xml: string): string {
  const match = xml.match(/<p:cSld[^>]*name="([^"]+)"/);
  return match ? match[1] : '';
}

/**
 * 提取布局类型
 */
function extractLayoutType(xml: string): string {
  // 查找 type 属性
  const match = xml.match(/type="([^"]+)"/);
  if (match) {
    const typeMap: Record<string, string> = {
      'title': '标题',
      'obj': '内容',
      'secHead': '节标题',
      'twoObj': '两栏内容',
      'blank': '空白',
      'titleOnly': '仅标题',
      'twoTxTwoObj': '比较',
      'objTx': '内容与标题',
    };
    return typeMap[match[1]] || match[1];
  }
  return 'custom';
}

/**
 * 提取布局引用
 */
function extractLayoutRef(xml: string, slideIndex: number): string {
  // 在实际实现中需要解析 slide?.rels 文件
  return `layout${((slideIndex - 1) % 10) + 1}`;
}

/**
 * 提取背景
 */
function extractBackground(xml: string): { type: 'color' | 'image' | 'gradient'; value: string } {
  // 查找背景填充
  const solidMatch = xml.match(/<a:srgbClr val="([A-Fa-f0-9]+)"/);
  if (solidMatch) {
    return { type: 'color', value: `#${solidMatch[1]}` };
  }
  
  // 查找图片背景
  if (xml.includes('<a:blipFill')) {
    return { type: 'image', value: 'embedded' };
  }
  
  // 查找渐变背景
  if (xml.includes('<a:gradFill')) {
    return { type: 'gradient', value: 'gradient' };
  }
  
  return { type: 'color', value: '#FFFFFF' };
}

/**
 * 提取占位符
 */
function extractPlaceholders(xml: string): TemplatePlaceholder[] {
  const placeholders: TemplatePlaceholder[] = [];
  
  // 简单解析占位符类型
  const phTypes = ['title', 'body', 'ctrTitle', 'subTitle', 'dt', 'ftr', 'sldNum'];
  
  phTypes.forEach(phType => {
    if (xml.includes(`type="${phType}"`)) {
      const typeMap: Record<string, TemplatePlaceholder['type']> = {
        'title': 'title',
        'ctrTitle': 'title',
        'subTitle': 'title',
        'body': 'body',
        'dt': 'custom',
        'ftr': 'custom',
        'sldNum': 'custom',
      };
      
      placeholders.push({
        type: typeMap[phType] || 'custom',
        name: phType,
        position: { x: 0, y: 0, w: 0, h: 0 }, // 需要进一步解析
      });
    }
  });
  
  return placeholders;
}
