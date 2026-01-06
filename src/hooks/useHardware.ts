// Re-export from HardwareContext for backwards compatibility
export { 
  useCameras, 
  useLenses, 
  useLights, 
  useControllers, 
  useHardwareImageUpload 
} from '@/contexts/HardwareContext';

export type { 
  Camera, 
  Lens, 
  Light, 
  Controller 
} from '@/contexts/HardwareContext';
