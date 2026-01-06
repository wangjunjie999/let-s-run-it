import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  AppState, 
  Project, 
  Workstation, 
  MechanicalLayout, 
  FunctionModule,
  Camera,
  Lens,
  LightSource,
  Controller,
  PPTTemplate,
  ViewType,
  UserRole
} from '@/types';

// Sample data
const sampleCameras: Camera[] = [
  {
    id: 'cam-1',
    brand: 'Basler',
    model: 'acA2500-14gm',
    resolution: '2592×1944',
    frameRate: 14,
    interface: 'GigE',
    sensorSize: '1/2.5"',
    tags: ['高分辨率', '工业级', 'GigE'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
  {
    id: 'cam-2',
    brand: 'Hikvision',
    model: 'MV-CA050-10GM',
    resolution: '2592×1944',
    frameRate: 10,
    interface: 'GigE',
    sensorSize: '2/3"',
    tags: ['性价比', '稳定', 'GigE'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
  {
    id: 'cam-3',
    brand: 'FLIR',
    model: 'BFS-PGE-50S5M',
    resolution: '2448×2048',
    frameRate: 75,
    interface: 'GigE',
    sensorSize: '2/3"',
    tags: ['高速', '高分辨率', 'GigE'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
];

const sampleLenses: Lens[] = [
  {
    id: 'lens-1',
    brand: 'Computar',
    model: 'M1214-MP2',
    focalLength: '12mm',
    aperture: 'F1.4',
    mount: 'C-Mount',
    compatibleCameras: ['cam-1', 'cam-2', 'cam-3'],
    tags: ['定焦', '高清', 'C口'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
  {
    id: 'lens-2',
    brand: 'Kowa',
    model: 'LM25HC',
    focalLength: '25mm',
    aperture: 'F1.4',
    mount: 'C-Mount',
    compatibleCameras: ['cam-1', 'cam-2', 'cam-3'],
    tags: ['定焦', '工业级', 'C口'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
  {
    id: 'lens-3',
    brand: 'Fujinon',
    model: 'HF16SA-1',
    focalLength: '16mm',
    aperture: 'F1.4',
    mount: 'C-Mount',
    compatibleCameras: ['cam-1', 'cam-2', 'cam-3'],
    tags: ['5MP', '定焦', 'C口'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
];

const sampleLights: LightSource[] = [
  {
    id: 'light-1',
    brand: 'CCS',
    model: 'LDR2-90RD2',
    type: '环形光源',
    color: '红色',
    power: '24V/12W',
    tags: ['环形', '均匀照明', '高反光适用'],
    recommendedCameras: ['cam-1', 'cam-2'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
  {
    id: 'light-2',
    brand: 'OPT',
    model: 'OPT-LI150-W',
    type: '条形光源',
    color: '白色',
    power: '24V/15W',
    tags: ['条形', '侧打光', '纹理检测'],
    recommendedCameras: ['cam-1', 'cam-2', 'cam-3'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
  {
    id: 'light-3',
    brand: 'Moritex',
    model: 'MCEP-CW0612',
    type: '同轴光源',
    color: '白色',
    power: '24V/20W',
    tags: ['同轴', '高反光表面', '镜面检测'],
    recommendedCameras: ['cam-1', 'cam-3'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
];

const sampleControllers: Controller[] = [
  {
    id: 'ctrl-1',
    brand: 'Advantech',
    model: 'MIC-770',
    cpu: 'i7-9700',
    gpu: 'GTX 1660',
    memory: '16GB',
    storage: '512GB SSD',
    performance: 'standard',
    tags: ['工控机', '标准配置', '稳定'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
  {
    id: 'ctrl-2',
    brand: 'Neousys',
    model: 'Nuvo-8108GC',
    cpu: 'i9-9900K',
    gpu: 'RTX 3080',
    memory: '64GB',
    storage: '1TB NVMe',
    performance: 'ultra',
    tags: ['高性能', 'GPU推理', '深度学习'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
  {
    id: 'ctrl-3',
    brand: 'NVIDIA',
    model: 'Jetson AGX Orin',
    cpu: 'ARM Cortex-A78AE',
    gpu: 'Ampere 2048-core',
    memory: '32GB',
    storage: '64GB eMMC',
    performance: 'high',
    tags: ['边缘计算', 'AI推理', '低功耗'],
    imageUrl: '/placeholder.svg',
    enabled: true,
  },
];

const sampleTemplates: PPTTemplate[] = [
  {
    id: 'tpl-1',
    name: '标准视觉方案模板',
    description: '适用于常规视觉检测项目的标准模板',
    scope: '通用',
    isDefault: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'tpl-2',
    name: '汽车行业模板',
    description: '适用于汽车零部件检测的专业模板',
    scope: '汽车行业',
    isDefault: false,
    createdAt: '2024-01-15',
  },
];

// Sample project data
const sampleProjects: Project[] = [
  {
    id: 'proj-1',
    code: 'VIS-2024-001',
    name: '某汽车零部件外观检测',
    customer: 'ABC汽车配件有限公司',
    productProcess: '总装检测',
    date: '2024-12-20',
    responsible: '张工',
    templateId: 'tpl-1',
    cycleTimeTarget: 3,
    environment: ['high_reflection'],
    qualityStrategy: 'no_miss',
    status: 'incomplete',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-20',
  },
];

const sampleWorkstations: Workstation[] = [
  {
    id: 'ws-1',
    projectId: 'proj-1',
    code: 'WS-01',
    name: '上表面检测工位',
    type: 'line',
    cycleTime: 2.5,
    productDimensions: { length: 150, width: 80, height: 30 },
    installSpace: { length: 800, width: 600, height: 500 },
    enclosed: false,
    status: 'incomplete',
    createdAt: '2024-12-05',
    updatedAt: '2024-12-20',
  },
  {
    id: 'ws-2',
    projectId: 'proj-1',
    code: 'WS-02',
    name: '侧面检测工位',
    type: 'turntable',
    cycleTime: 3,
    productDimensions: { length: 150, width: 80, height: 30 },
    installSpace: { length: 600, width: 600, height: 400 },
    enclosed: true,
    status: 'draft',
    createdAt: '2024-12-10',
    updatedAt: '2024-12-20',
  },
];

const sampleLayouts: MechanicalLayout[] = [
  {
    id: 'layout-1',
    workstationId: 'ws-1',
    conveyorType: '皮带输送线',
    cameraCount: 2,
    cameraMounts: ['top', 'side'],
    mechanisms: ['stop', 'cylinder'],
    machineOutline: { length: 800, width: 600, height: 500 },
    frontViewSaved: true,
    sideViewSaved: true,
    topViewSaved: true,
    status: 'complete',
  },
  {
    id: 'layout-2',
    workstationId: 'ws-2',
    conveyorType: '转盘',
    cameraCount: 1,
    cameraMounts: ['top'],
    mechanisms: ['indexing'],
    machineOutline: { length: 600, width: 600, height: 400 },
    frontViewSaved: true,
    sideViewSaved: true,
    topViewSaved: true,
    status: 'complete',
  },
];

const sampleModules: FunctionModule[] = [
  // ========== 缺陷检测样例 ==========
  {
    id: 'mod-1',
    workstationId: 'ws-1',
    name: '上表面缺陷检测',
    type: 'defect',
    cameraId: 'cam-1',
    triggerType: 'io',
    outputTypes: ['okng', 'defect_class'],
    roiStrategy: 'full',
    processingTimeLimit: 200,
    misjudgmentStrategy: 'no_miss',
    defectConfig: {
      defectClasses: ['划痕', '凹坑', '异物', '变色', '气泡', '裂纹'],
      minDefectSize: 0.5,
      missTolerance: 'none',
      inspectionSurfaces: ['top'],
      judgmentRule: 'any',
      materialProperties: ['high_reflection'],
    },
    selectedCamera: 'cam-1',
    selectedLens: 'lens-1',
    selectedLight: 'light-3', // 同轴光源适合高反光
    selectedController: 'ctrl-1',
    flowchartSaved: true,
    status: 'complete',
    createdAt: '2024-12-08',
    updatedAt: '2024-12-20',
  },
  // ========== 引导定位样例 ==========
  {
    id: 'mod-2',
    workstationId: 'ws-1',
    name: '产品边缘定位',
    type: 'positioning',
    cameraId: 'cam-1',
    triggerType: 'io',
    outputTypes: ['coordinate'],
    roiStrategy: 'custom',
    processingTimeLimit: 50,
    positioningConfig: {
      targetType: 'edge',
      outputCoordinate: 'mechanical',
      accuracyRequirement: 0.05,
    },
    selectedCamera: 'cam-1',
    selectedLens: 'lens-2', // 25mm焦距更适合精确定位
    selectedLight: 'light-2', // 条形光源突出边缘
    selectedController: 'ctrl-1',
    flowchartSaved: true,
    status: 'complete',
    createdAt: '2024-12-09',
    updatedAt: '2024-12-20',
  },
  // ========== OCR识别样例 ==========
  {
    id: 'mod-3',
    workstationId: 'ws-2',
    name: '激光刻印序列号识别',
    type: 'ocr',
    triggerType: 'encoder',
    outputTypes: ['text', 'confidence'],
    roiStrategy: 'custom',
    processingTimeLimit: 100,
    ocrConfig: {
      charType: 'laser',
      charset: 'mixed',
      minCharHeight: 2.5,
      contentRule: 'YYYYMMDD-####',
    },
    selectedCamera: 'cam-2',
    selectedLens: 'lens-3', // 16mm焦距
    selectedLight: 'light-2', // 条形光突出刻印
    selectedController: 'ctrl-1',
    flowchartSaved: true,
    status: 'complete',
    createdAt: '2024-12-12',
    updatedAt: '2024-12-20',
  },
  // ========== 深度学习样例 ==========
  {
    id: 'mod-4',
    workstationId: 'ws-2',
    name: '深度学习外观分类',
    type: 'deeplearning',
    triggerType: 'software',
    outputTypes: ['okng', 'confidence'],
    processingTimeLimit: 300,
    deepLearningConfig: {
      taskType: 'classification',
      deployTarget: 'gpu',
      inferenceTimeTarget: 50,
      updateStrategy: 'periodic',
      dataSource: '产线实采图像',
      sampleSize: 5000,
    },
    selectedCamera: 'cam-3', // 高速相机
    selectedLens: 'lens-1',
    selectedLight: 'light-1',
    selectedController: 'ctrl-2', // 带GPU的高性能工控机
    flowchartSaved: true,
    status: 'complete',
    createdAt: '2024-12-15',
    updatedAt: '2024-12-20',
  },
];

interface Store {
  // App state
  currentRole: UserRole;
  selectedProjectId: string | null;
  selectedWorkstationId: string | null;
  selectedModuleId: string | null;
  currentView: ViewType;
  isGeneratingPPT: boolean;
  pptProgress: number;
  pptImageQuality: 'standard' | 'high' | 'ultra';
  
  // Quality mapping helper
  getPixelRatio: () => number;
  
  // Data
  projects: Project[];
  workstations: Workstation[];
  layouts: MechanicalLayout[];
  modules: FunctionModule[];
  cameras: Camera[];
  lenses: Lens[];
  lights: LightSource[];
  controllers: Controller[];
  templates: PPTTemplate[];
  
  // Actions
  setCurrentRole: (role: UserRole) => void;
  selectProject: (id: string | null) => void;
  selectWorkstation: (id: string | null) => void;
  selectModule: (id: string | null) => void;
  setCurrentView: (view: ViewType) => void;
  setPPTImageQuality: (quality: 'standard' | 'high' | 'ultra') => void;
  
  // Project CRUD
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  
  // Workstation CRUD
  addWorkstation: (workstation: Omit<Workstation, 'id' | 'createdAt' | 'updatedAt'>) => Workstation;
  updateWorkstation: (id: string, updates: Partial<Workstation>) => void;
  deleteWorkstation: (id: string) => void;
  duplicateWorkstation: (id: string) => Workstation;
  
  // Layout CRUD
  addLayout: (layout: Omit<MechanicalLayout, 'id'>) => MechanicalLayout;
  updateLayout: (id: string, updates: Partial<MechanicalLayout>) => void;
  getLayoutByWorkstation: (workstationId: string) => MechanicalLayout | undefined;
  
  // Module CRUD
  addModule: (module: Omit<FunctionModule, 'id' | 'createdAt' | 'updatedAt'>) => FunctionModule;
  updateModule: (id: string, updates: Partial<FunctionModule>) => void;
  deleteModule: (id: string) => void;
  duplicateModule: (id: string) => FunctionModule;
  
  // Hardware CRUD (admin only)
  addCamera: (camera: Omit<Camera, 'id'>) => void;
  updateCamera: (id: string, updates: Partial<Camera>) => void;
  deleteCamera: (id: string) => void;
  
  addLens: (lens: Omit<Lens, 'id'>) => void;
  updateLens: (id: string, updates: Partial<Lens>) => void;
  deleteLens: (id: string) => void;
  
  addLight: (light: Omit<LightSource, 'id'>) => void;
  updateLight: (id: string, updates: Partial<LightSource>) => void;
  deleteLight: (id: string) => void;
  
  addController: (controller: Omit<Controller, 'id'>) => void;
  updateController: (id: string, updates: Partial<Controller>) => void;
  deleteController: (id: string) => void;
  
  // Template CRUD (admin only)
  addTemplate: (template: Omit<PPTTemplate, 'id' | 'createdAt'>) => void;
  updateTemplate: (id: string, updates: Partial<PPTTemplate>) => void;
  deleteTemplate: (id: string) => void;
  setDefaultTemplate: (id: string) => void;
  
  // PPT Generation
  startPPTGeneration: () => void;
  updatePPTProgress: (progress: number) => void;
  finishPPTGeneration: () => void;
  canGeneratePPT: () => { canGenerate: boolean; missingItems: string[] };
  
  // Helpers
  getProjectWorkstations: (projectId: string) => Workstation[];
  getWorkstationModules: (workstationId: string) => FunctionModule[];
  getProjectStats: (projectId: string) => {
    workstationCount: number;
    moduleCount: number;
    layoutsComplete: number;
    flowchartsComplete: number;
  };
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      currentRole: 'user',
      selectedProjectId: null,
      selectedWorkstationId: null,
      selectedModuleId: null,
      currentView: 'front',
      isGeneratingPPT: false,
      pptProgress: 0,
      pptImageQuality: 'high',
      
      // Quality mapping helper
      getPixelRatio: () => {
        const quality = get().pptImageQuality;
        switch (quality) {
          case 'standard': return 1.5;
          case 'high': return 2;
          case 'ultra': return 3;
          default: return 2;
        }
      },
      
      // Initial data
      projects: sampleProjects,
      workstations: sampleWorkstations,
      layouts: sampleLayouts,
      modules: sampleModules,
      cameras: sampleCameras,
      lenses: sampleLenses,
      lights: sampleLights,
      controllers: sampleControllers,
      templates: sampleTemplates,
      
      // Actions
      setCurrentRole: (role) => set({ currentRole: role }),
      
      selectProject: (id) => set({ 
        selectedProjectId: id, 
        selectedWorkstationId: null, 
        selectedModuleId: null 
      }),
      
      selectWorkstation: (id) => set({ 
        selectedWorkstationId: id, 
        selectedModuleId: null,
        currentView: 'front'
      }),
      
      selectModule: (id) => set({ selectedModuleId: id }),
      
      setCurrentView: (view) => set({ currentView: view }),
      
      setPPTImageQuality: (quality) => set({ pptImageQuality: quality }),
      
      // Project CRUD
      addProject: (project) => {
        const newProject: Project = {
          ...project,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        return newProject;
      },
      
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        ),
      })),
      
      deleteProject: (id) => set((state) => {
        const wsIds = state.workstations.filter(ws => ws.projectId === id).map(ws => ws.id);
        return {
          projects: state.projects.filter((p) => p.id !== id),
          workstations: state.workstations.filter((ws) => ws.projectId !== id),
          layouts: state.layouts.filter((l) => !wsIds.includes(l.workstationId)),
          modules: state.modules.filter((m) => !wsIds.includes(m.workstationId)),
          selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
        };
      }),
      
      duplicateProject: (id) => {
        const state = get();
        const project = state.projects.find(p => p.id === id);
        if (!project) return;
        
        const newProjectId = generateId();
        const newProject: Project = {
          ...project,
          id: newProjectId,
          code: `${project.code}-COPY`,
          name: `${project.name} (副本)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Duplicate workstations, layouts, and modules
        const wsMap = new Map<string, string>();
        const newWorkstations = state.workstations
          .filter(ws => ws.projectId === id)
          .map(ws => {
            const newWsId = generateId();
            wsMap.set(ws.id, newWsId);
            return { ...ws, id: newWsId, projectId: newProjectId };
          });
        
        const newLayouts = state.layouts
          .filter(l => wsMap.has(l.workstationId))
          .map(l => ({
            ...l,
            id: generateId(),
            workstationId: wsMap.get(l.workstationId)!,
          }));
        
        const newModules = state.modules
          .filter(m => wsMap.has(m.workstationId))
          .map(m => ({
            ...m,
            id: generateId(),
            workstationId: wsMap.get(m.workstationId)!,
          }));
        
        set({
          projects: [...state.projects, newProject],
          workstations: [...state.workstations, ...newWorkstations],
          layouts: [...state.layouts, ...newLayouts],
          modules: [...state.modules, ...newModules],
        });
      },
      
      // Workstation CRUD
      addWorkstation: (workstation) => {
        const newWorkstation: Workstation = {
          ...workstation,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ workstations: [...state.workstations, newWorkstation] }));
        return newWorkstation;
      },
      
      updateWorkstation: (id, updates) => set((state) => ({
        workstations: state.workstations.map((ws) =>
          ws.id === id ? { ...ws, ...updates, updatedAt: new Date().toISOString() } : ws
        ),
      })),
      
      deleteWorkstation: (id) => set((state) => ({
        workstations: state.workstations.filter((ws) => ws.id !== id),
        layouts: state.layouts.filter((l) => l.workstationId !== id),
        modules: state.modules.filter((m) => m.workstationId !== id),
        selectedWorkstationId: state.selectedWorkstationId === id ? null : state.selectedWorkstationId,
      })),
      
      duplicateWorkstation: (id) => {
        const state = get();
        const ws = state.workstations.find(w => w.id === id);
        if (!ws) throw new Error('Workstation not found');
        
        const newWsId = generateId();
        const newWorkstation: Workstation = {
          ...ws,
          id: newWsId,
          code: `${ws.code}-COPY`,
          name: `${ws.name} (副本)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const layout = state.layouts.find(l => l.workstationId === id);
        const newLayout = layout ? {
          ...layout,
          id: generateId(),
          workstationId: newWsId,
        } : null;
        
        const newModules = state.modules
          .filter(m => m.workstationId === id)
          .map(m => ({
            ...m,
            id: generateId(),
            workstationId: newWsId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        
        set({
          workstations: [...state.workstations, newWorkstation],
          layouts: newLayout ? [...state.layouts, newLayout] : state.layouts,
          modules: [...state.modules, ...newModules],
        });
        
        return newWorkstation;
      },
      
      // Layout CRUD
      addLayout: (layout) => {
        const newLayout: MechanicalLayout = {
          ...layout,
          id: generateId(),
        };
        set((state) => ({ layouts: [...state.layouts, newLayout] }));
        return newLayout;
      },
      
      updateLayout: (id, updates) => set((state) => ({
        layouts: state.layouts.map((l) =>
          l.id === id ? { ...l, ...updates } : l
        ),
      })),
      
      getLayoutByWorkstation: (workstationId) => {
        return get().layouts.find(l => l.workstationId === workstationId);
      },
      
      // Module CRUD
      addModule: (module) => {
        const newModule: FunctionModule = {
          ...module,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ modules: [...state.modules, newModule] }));
        return newModule;
      },
      
      updateModule: (id, updates) => set((state) => ({
        modules: state.modules.map((m) =>
          m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
        ),
      })),
      
      deleteModule: (id) => set((state) => ({
        modules: state.modules.filter((m) => m.id !== id),
        selectedModuleId: state.selectedModuleId === id ? null : state.selectedModuleId,
      })),
      
      duplicateModule: (id) => {
        const state = get();
        const mod = state.modules.find(m => m.id === id);
        if (!mod) throw new Error('Module not found');
        
        const newModule: FunctionModule = {
          ...mod,
          id: generateId(),
          name: `${mod.name} (副本)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set({ modules: [...state.modules, newModule] });
        return newModule;
      },
      
      // Hardware CRUD
      addCamera: (camera) => set((state) => ({
        cameras: [...state.cameras, { ...camera, id: generateId() }],
      })),
      updateCamera: (id, updates) => set((state) => ({
        cameras: state.cameras.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),
      deleteCamera: (id) => set((state) => ({
        cameras: state.cameras.filter((c) => c.id !== id),
      })),
      
      addLens: (lens) => set((state) => ({
        lenses: [...state.lenses, { ...lens, id: generateId() }],
      })),
      updateLens: (id, updates) => set((state) => ({
        lenses: state.lenses.map((l) => l.id === id ? { ...l, ...updates } : l),
      })),
      deleteLens: (id) => set((state) => ({
        lenses: state.lenses.filter((l) => l.id !== id),
      })),
      
      addLight: (light) => set((state) => ({
        lights: [...state.lights, { ...light, id: generateId() }],
      })),
      updateLight: (id, updates) => set((state) => ({
        lights: state.lights.map((l) => l.id === id ? { ...l, ...updates } : l),
      })),
      deleteLight: (id) => set((state) => ({
        lights: state.lights.filter((l) => l.id !== id),
      })),
      
      addController: (controller) => set((state) => ({
        controllers: [...state.controllers, { ...controller, id: generateId() }],
      })),
      updateController: (id, updates) => set((state) => ({
        controllers: state.controllers.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),
      deleteController: (id) => set((state) => ({
        controllers: state.controllers.filter((c) => c.id !== id),
      })),
      
      // Template CRUD
      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, { 
          ...template, 
          id: generateId(), 
          createdAt: new Date().toISOString() 
        }],
      })),
      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map((t) => t.id === id ? { ...t, ...updates } : t),
      })),
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      })),
      setDefaultTemplate: (id) => set((state) => ({
        templates: state.templates.map((t) => ({
          ...t,
          isDefault: t.id === id,
        })),
      })),
      
      // PPT Generation
      startPPTGeneration: () => set({ isGeneratingPPT: true, pptProgress: 0 }),
      updatePPTProgress: (progress) => set({ pptProgress: progress }),
      finishPPTGeneration: () => set({ isGeneratingPPT: false, pptProgress: 100 }),
      
      canGeneratePPT: () => {
        const state = get();
        const project = state.projects.find(p => p.id === state.selectedProjectId);
        const missingItems: string[] = [];
        
        if (!project) {
          return { canGenerate: false, missingItems: ['未选择项目'] };
        }
        
        // Check for workstations using snake_case property names (from Supabase)
        const workstations = state.workstations.filter(ws => 
          ws.projectId === project.id || (ws as any).project_id === project.id
        );
        if (workstations.length === 0) {
          missingItems.push('至少需要1个工位');
        }
        
        // Check required fields
        if (!project.code || !project.name || !project.customer) {
          missingItems.push('项目关键字段未填写完整');
        }
        
        return { 
          canGenerate: missingItems.length === 0, 
          missingItems 
        };
      },
      
      // Helpers
      getProjectWorkstations: (projectId) => {
        return get().workstations.filter(ws => ws.projectId === projectId);
      },
      
      getWorkstationModules: (workstationId) => {
        return get().modules.filter(m => m.workstationId === workstationId);
      },
      
      getProjectStats: (projectId) => {
        const state = get();
        const workstations = state.workstations.filter(ws => ws.projectId === projectId);
        const wsIds = workstations.map(ws => ws.id);
        const modules = state.modules.filter(m => wsIds.includes(m.workstationId));
        
        const layoutsComplete = workstations.filter(ws => {
          const layout = state.layouts.find(l => l.workstationId === ws.id);
          return layout && layout.frontViewSaved && layout.sideViewSaved && layout.topViewSaved;
        }).length;
        
        const flowchartsComplete = modules.filter(m => m.flowchartSaved).length;
        
        return {
          workstationCount: workstations.length,
          moduleCount: modules.length,
          layoutsComplete,
          flowchartsComplete,
        };
      },
    }),
    {
      name: 'vision-config-storage',
    }
  )
);
