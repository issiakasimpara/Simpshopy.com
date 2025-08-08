import React, { useState } from 'react';
import { TemplateBlock } from '@/types/template';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Clock, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RoutinesEditorProps {
  block: TemplateBlock;
  onUpdate: (key: string, value: any) => void;
}

const RoutinesEditor = ({ block, onUpdate }: RoutinesEditorProps) => {
  const [localRoutines, setLocalRoutines] = useState(block.content.routines || []);

  const addRoutine = () => {
    const newRoutine = {
      title: 'Nouvelle Routine',
      steps: [
        { step: 1, action: 'Étape 1', product: 'Produit 1' }
      ],
      duration: '5 minutes',
      skinType: 'Tous types'
    };
    
    const updatedRoutines = [...localRoutines, newRoutine];
    setLocalRoutines(updatedRoutines);
    onUpdate('routines', updatedRoutines);
  };

  const updateRoutine = (index: number, field: string, value: any) => {
    const updatedRoutines = [...localRoutines];
    updatedRoutines[index] = { ...updatedRoutines[index], [field]: value };
    setLocalRoutines(updatedRoutines);
    onUpdate('routines', updatedRoutines);
  };

  const addStep = (routineIndex: number) => {
    const updatedRoutines = [...localRoutines];
    const routine = updatedRoutines[routineIndex];
    const newStep = {
      step: routine.steps.length + 1,
      action: `Étape ${routine.steps.length + 1}`,
      product: `Produit ${routine.steps.length + 1}`
    };
    routine.steps.push(newStep);
    setLocalRoutines(updatedRoutines);
    onUpdate('routines', updatedRoutines);
  };

  const updateStep = (routineIndex: number, stepIndex: number, field: string, value: string) => {
    const updatedRoutines = [...localRoutines];
    updatedRoutines[routineIndex].steps[stepIndex] = {
      ...updatedRoutines[routineIndex].steps[stepIndex],
      [field]: value
    };
    setLocalRoutines(updatedRoutines);
    onUpdate('routines', updatedRoutines);
  };

  const removeStep = (routineIndex: number, stepIndex: number) => {
    const updatedRoutines = [...localRoutines];
    updatedRoutines[routineIndex].steps.splice(stepIndex, 1);
    // Réindexer les étapes
    updatedRoutines[routineIndex].steps.forEach((step, index) => {
      step.step = index + 1;
    });
    setLocalRoutines(updatedRoutines);
    onUpdate('routines', updatedRoutines);
  };

  const removeRoutine = (index: number) => {
    const updatedRoutines = localRoutines.filter((_, i) => i !== index);
    setLocalRoutines(updatedRoutines);
    onUpdate('routines', updatedRoutines);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Titre principal</Label>
        <Input
          id="title"
          value={block.content.title || ''}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="Routines de Soin"
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Sous-titre</Label>
        <Input
          id="subtitle"
          value={block.content.subtitle || ''}
          onChange={(e) => onUpdate('subtitle', e.target.value)}
          placeholder="Découvrez nos routines personnalisées"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Routines</Label>
          <Button size="sm" onClick={addRoutine} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une routine
          </Button>
        </div>

        {localRoutines.map((routine, routineIndex) => (
          <Card key={routineIndex} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Input
                  value={routine.title}
                  onChange={(e) => updateRoutine(routineIndex, 'title', e.target.value)}
                  className="font-semibold"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeRoutine(routineIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Durée</Label>
                  <Input
                    value={routine.duration}
                    onChange={(e) => updateRoutine(routineIndex, 'duration', e.target.value)}
                    placeholder="5 minutes"
                  />
                </div>
                <div>
                  <Label>Type de peau</Label>
                  <Select
                    value={routine.skinType}
                    onValueChange={(value) => updateRoutine(routineIndex, 'skinType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tous types">Tous types</SelectItem>
                      <SelectItem value="Sèche">Sèche</SelectItem>
                      <SelectItem value="Grasse">Grasse</SelectItem>
                      <SelectItem value="Mixte">Mixte</SelectItem>
                      <SelectItem value="Sensible">Sensible</SelectItem>
                      <SelectItem value="Mature">Mature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Étapes</Label>
                  <Button size="sm" onClick={() => addStep(routineIndex)} className="flex items-center gap-2">
                    <Plus className="h-3 w-3" />
                    Ajouter une étape
                  </Button>
                </div>

                {routine.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Étape {step.step}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStep(routineIndex, stepIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Action</Label>
                        <Input
                          value={step.action}
                          onChange={(e) => updateStep(routineIndex, stepIndex, 'action', e.target.value)}
                          placeholder="Nettoyage doux"
                        />
                      </div>
                      <div>
                        <Label>Produit</Label>
                        <Input
                          value={step.product}
                          onChange={(e) => updateStep(routineIndex, stepIndex, 'product', e.target.value)}
                          placeholder="Gel nettoyant"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoutinesEditor;
