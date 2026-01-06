import { memo } from 'react';
import { useData } from '@/contexts/DataContext';
import { EmptyFormState } from '../forms/EmptyFormState';
import { ProjectForm } from '../forms/ProjectForm';
import { WorkstationForm } from '../forms/WorkstationForm';
import { ModuleForm } from '../forms/ModuleForm';

// Memoized form components to prevent unnecessary re-renders
const MemoizedModuleForm = memo(ModuleForm);
const MemoizedWorkstationForm = memo(WorkstationForm);
const MemoizedProjectForm = memo(ProjectForm);

export function FormPanel() {
  const { selectedProjectId, selectedWorkstationId, selectedModuleId } = useData();

  if (selectedModuleId) {
    return <MemoizedModuleForm key={selectedModuleId} />;
  }
  
  if (selectedWorkstationId) {
    return <MemoizedWorkstationForm key={selectedWorkstationId} />;
  }
  
  if (selectedProjectId) {
    return <MemoizedProjectForm key={selectedProjectId} />;
  }
  
  return <EmptyFormState />;
}
