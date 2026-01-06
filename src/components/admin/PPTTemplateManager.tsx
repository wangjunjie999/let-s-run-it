import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Star, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function PPTTemplateManager() {
  const { templates, setDefaultTemplate, deleteTemplate } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="gap-2"><Plus className="h-4 w-4" />导入母版</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(tpl => (
          <Card key={tpl.id} className={tpl.isDefault ? 'border-primary' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {tpl.name}
                    {tpl.isDefault && <Star className="h-4 w-4 text-warning fill-warning" />}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{tpl.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">适用: {tpl.scope}</p>
                </div>
                <div className="flex gap-1">
                  {!tpl.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => setDefaultTemplate(tpl.id)}>设为默认</Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTemplate(tpl.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
