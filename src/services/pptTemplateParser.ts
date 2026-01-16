/**
 * PPT模板解析服务
 * 解析用户上传的PPTX模板，提取母版结构、布局和占位符信息
 */

import { supabase } from "@/integrations/supabase/client";

// ==================== TYPE DEFINITIONS ====================

export interface TemplatePlaceholder {
  type: 'title' | 'body' | 'picture' | 'chart' | 'table' | 'custom';
  name: string;
  position: { x: number; y: number; w: number; h: number };
  fieldMapping?: string; // 映射到的系统字段
}

export interface TemplateMaster {
  id: string;
  name: string;
  index: number;
  background: {
    type: 'color' | 'image' | 'gradient';
    value: string;
  };
  placeholders: TemplatePlaceholder[];
}

export interface TemplateLayout {
  id: string;
  name: string;
  masterRef: string;
  type: string; // e.g., 'title', 'titleAndContent', 'blank', etc.
  placeholders: TemplatePlaceholder[];
}

export interface TemplateSlide {
  index: number;
  layoutRef: string;
  customFields: string[]; // {{field}} placeholders found
}

export interface ParsedTemplate {
  // 基本信息
  fileName: string;
  fileSize: number;
  slideCount: number;
  dimensions: { width: number; height: number };
  
  // 母版信息
  masters: TemplateMaster[];
  
  // 布局信息
  layouts: TemplateLayout[];
  
  // 示例幻灯片
  slides: TemplateSlide[];
  
  // 发现的自定义占位符 {{field}}
  customFields: string[];
  
  // 可用于映射的系统字段
  availableSystemFields: string[];
  
  // 解析时间
  parsedAt: string;
}

// ==================== SYSTEM FIELDS DEFINITION ====================

export const SYSTEM_FIELDS = {
  // 项目级别
  project: [
    { field: 'project_name', label: '项目名称', example: '电池检测项目' },
    { field: 'project_code', label: '项目编号', example: 'VIS-2026-001' },
    { field: 'customer', label: '客户名称', example: 'ABC公司' },
    { field: 'date', label: '项目日期', example: '2026-01-16' },
    { field: 'date_formatted', label: '格式化日期', example: '2026年1月16日' },
    { field: 'date_year', label: '年份', example: '2026' },
    { field: 'date_month', label: '月份', example: '1' },
    { field: 'date_day', label: '日', example: '16' },
    { field: 'responsible', label: '项目负责人', example: '张三' },
    { field: 'vision_responsible', label: '视觉负责人', example: '李四' },
    { field: 'sales_responsible', label: '销售负责人', example: '王五' },
    { field: 'description', label: '项目描述', example: '...' },
    { field: 'spec_version', label: '规格版本', example: 'V1.0' },
    { field: 'product_process', label: '产品工序', example: '总装检测' },
    { field: 'quality_strategy', label: '质量策略', example: '零缺陷' },
  ],
  
  // 统计字段
  statistics: [
    { field: 'workstation_count', label: '工位数量', example: '3' },
    { field: 'total_module_count', label: '模块总数', example: '8' },
    { field: 'camera_count', label: '相机数量', example: '5' },
    { field: 'lens_count', label: '镜头数量', example: '5' },
    { field: 'light_count', label: '光源数量', example: '5' },
    { field: 'controller_count', label: '控制器数量', example: '1' },
    { field: 'total_hardware_count', label: '硬件总数', example: '16' },
  ],
  
  // 工位级别（用于循环）
  workstation: [
    { field: 'name', label: '工位名称', example: '上料检测工位' },
    { field: 'code', label: '工位编号', example: 'VIS-2026-001.01' },
    { field: 'type', label: '工位类型', example: 'line' },
    { field: 'type_label', label: '类型中文名', example: '线体' },
    { field: 'index', label: '序号', example: '1' },
    { field: 'cycle_time', label: '节拍时间', example: '3.5' },
    { field: 'shot_count', label: '拍照数量', example: '2' },
    { field: 'observation_target', label: '观测目标', example: '产品正面' },
    { field: 'motion_description', label: '运动描述', example: '传送带匀速运动' },
    { field: 'risk_notes', label: '风险备注', example: '高反光表面' },
    { field: 'module_count', label: '模块数量', example: '3' },
    { field: 'description', label: '工位描述', example: '...' },
    { field: 'front_view_image', label: '正视图URL', example: 'https://...' },
    { field: 'side_view_image', label: '侧视图URL', example: 'https://...' },
    { field: 'top_view_image', label: '俯视图URL', example: 'https://...' },
  ],
  
  // 模块级别（用于循环）
  module: [
    { field: 'name', label: '模块名称', example: '定位检测模块' },
    { field: 'type', label: '模块类型', example: 'positioning' },
    { field: 'type_label', label: '类型中文名', example: '定位检测' },
    { field: 'index', label: '序号', example: '1' },
    { field: 'trigger_type', label: '触发方式', example: 'io' },
    { field: 'trigger_label', label: '触发方式中文', example: 'IO触发' },
    { field: 'roi_strategy', label: 'ROI策略', example: 'full' },
    { field: 'processing_time_limit', label: '处理时限', example: '100' },
    { field: 'description', label: '模块描述', example: '...' },
    { field: 'schematic_image', label: '示意图URL', example: 'https://...' },
  ],
  
  // 硬件级别
  hardware: [
    { field: 'cameras', label: '相机列表', loop: true },
    { field: 'lenses', label: '镜头列表', loop: true },
    { field: 'lights', label: '光源列表', loop: true },
    { field: 'controllers', label: '控制器列表', loop: true },
  ],
  
  // 时间戳
  timestamps: [
    { field: 'generated_at', label: '生成时间(ISO)', example: '2026-01-16T10:30:00Z' },
    { field: 'generated_date', label: '生成日期', example: '2026年1月16日' },
    { field: 'generated_time', label: '生成时间', example: '10:30:00' },
  ],
};

// 获取所有可用的系统字段名称列表
export function getAvailableSystemFields(): string[] {
  const fields: string[] = [];
  Object.values(SYSTEM_FIELDS).forEach(category => {
    category.forEach(item => {
      fields.push(item.field);
    });
  });
  return fields;
}

// ==================== TEMPLATE PARSING ====================

export interface ParseTemplateOptions {
  templateId?: string;
  templateUrl?: string;
  file?: File;
}

export interface ParseTemplateResult {
  success: boolean;
  template?: ParsedTemplate;
  error?: string;
}

/**
 * 解析PPT模板
 * 调用Edge Function进行解析
 */
export async function parseTemplate(options: ParseTemplateOptions): Promise<ParseTemplateResult> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    return { success: false, error: '用户未登录' };
  }

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const functionUrl = `https://${projectId}.supabase.co/functions/v1/parse-ppt-template`;

  try {
    let body: Record<string, unknown>;
    
    if (options.file) {
      // 先上传文件到临时位置
      const tempPath = `temp/${session.user.id}/${Date.now()}_${options.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('ppt-templates')
        .upload(tempPath, options.file, { upsert: true });
      
      if (uploadError) {
        return { success: false, error: `上传失败: ${uploadError.message}` };
      }
      
      const { data: urlData } = supabase.storage
        .from('ppt-templates')
        .getPublicUrl(tempPath);
      
      body = { templateUrl: urlData.publicUrl, fileName: options.file.name, fileSize: options.file.size };
    } else if (options.templateId) {
      body = { templateId: options.templateId };
    } else if (options.templateUrl) {
      body = { templateUrl: options.templateUrl };
    } else {
      return { success: false, error: '请提供模板ID、URL或文件' };
    }

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || `解析失败: ${response.statusText}` };
    }

    const result = await response.json();
    return { success: true, template: result.template };
  } catch (error) {
    return { success: false, error: `解析错误: ${error}` };
  }
}

// ==================== FIELD MAPPING ====================

export interface FieldMapping {
  templateField: string; // 模板中的占位符
  systemField: string;   // 系统字段
}

/**
 * 自动匹配模板占位符到系统字段
 */
export function autoMapFields(customFields: string[]): FieldMapping[] {
  const allFields = getAvailableSystemFields();
  const mappings: FieldMapping[] = [];
  
  customFields.forEach(templateField => {
    // 尝试精确匹配
    if (allFields.includes(templateField)) {
      mappings.push({ templateField, systemField: templateField });
      return;
    }
    
    // 尝试模糊匹配（忽略大小写和下划线）
    const normalized = templateField.toLowerCase().replace(/[-_]/g, '');
    const match = allFields.find(f => f.toLowerCase().replace(/[-_]/g, '') === normalized);
    if (match) {
      mappings.push({ templateField, systemField: match });
    }
  });
  
  return mappings;
}

// ==================== LOOP SYNTAX ====================

/**
 * 循环模板语法示例
 */
export const LOOP_SYNTAX_EXAMPLES = `
工位循环:
{{#workstations}}
  工位 {{index}}: {{name}}
  编号: {{code}}
  类型: {{type_label}}
  模块数: {{module_count}}
  
  {{#modules}}
    模块 {{index}}: {{name}} ({{type_label}})
  {{/modules}}
{{/workstations}}

相机循环:
{{#hardware.cameras}}
  {{brand}} {{model}} - {{resolution}}
{{/hardware.cameras}}

镜头循环:
{{#hardware.lenses}}
  {{brand}} {{model}} - {{focal_length}}
{{/hardware.lenses}}

光源循环:
{{#hardware.lights}}
  {{brand}} {{model}} - {{type}} {{color}}
{{/hardware.lights}}

控制器循环:
{{#hardware.controllers}}
  {{brand}} {{model}} - {{cpu}} / {{memory}}
{{/hardware.controllers}}
`;

/**
 * 获取字段分类
 */
export function getFieldCategory(field: string): string {
  for (const [category, fields] of Object.entries(SYSTEM_FIELDS)) {
    if (fields.some(f => f.field === field)) {
      return category;
    }
  }
  return 'custom';
}

/**
 * 获取字段标签
 */
export function getFieldLabel(field: string): string {
  for (const fields of Object.values(SYSTEM_FIELDS)) {
    const found = fields.find(f => f.field === field);
    if (found) {
      return found.label;
    }
  }
  return field;
}
