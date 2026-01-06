import { useData } from '@/contexts/DataContext';
import { EmptyState } from '../canvas/EmptyState';
import { ProjectDashboard } from '../canvas/ProjectDashboard';
import { WorkstationCanvas } from '../canvas/WorkstationCanvas';
import { ModuleSchematic } from '../canvas/ModuleSchematic';

export function CanvasArea() {
  const { selectedProjectId, selectedWorkstationId, selectedModuleId } = useData();

  // Determine what to show - Module view shows 2D workstation schematic
  if (selectedModuleId) {
    return <ModuleSchematic />;
  }
  
  if (selectedWorkstationId) {
    return <WorkstationCanvas />;
  }
  
  if (selectedProjectId) {
    return <ProjectDashboard />;
  }
  
  return <EmptyState />;
}
