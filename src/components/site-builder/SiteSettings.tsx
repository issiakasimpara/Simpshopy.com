
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Template } from '@/types/template';
import { useState } from 'react';

interface SiteSettingsProps {
  template: Template;
  onUpdate: (template: Template) => void;
}

const SiteSettings = ({ template, onUpdate }: SiteSettingsProps) => {
  const [localTemplate, setLocalTemplate] = useState(template);

  const updateTemplate = (updates: Partial<Template>) => {
    const updatedTemplate = { ...localTemplate, ...updates };
    setLocalTemplate(updatedTemplate);
    onUpdate(updatedTemplate);
  };

  const updateStyles = (styleUpdates: Partial<Template['styles']>) => {
    const updatedTemplate = {
      ...localTemplate,
      styles: { ...localTemplate.styles, ...styleUpdates }
    };
    setLocalTemplate(updatedTemplate);
    onUpdate(updatedTemplate);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="siteName">Nom du site</Label>
            <Input
              id="siteName"
              value={localTemplate.name}
              onChange={(e) => updateTemplate({ name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="siteDescription">Description</Label>
            <Textarea
              id="siteDescription"
              value={localTemplate.description}
              onChange={(e) => updateTemplate({ description: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Couleurs du thème</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primaryColor">Couleur principale</Label>
            <Input
              id="primaryColor"
              type="color"
              value={localTemplate.styles.primaryColor}
              onChange={(e) => updateStyles({ primaryColor: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="secondaryColor">Couleur secondaire</Label>
            <Input
              id="secondaryColor"
              type="color"
              value={localTemplate.styles.secondaryColor}
              onChange={(e) => updateStyles({ secondaryColor: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typographie</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="fontFamily">Police de caractères</Label>
            <select
              id="fontFamily"
              className="w-full p-2 border rounded-md"
              value={localTemplate.styles.fontFamily}
              onChange={(e) => updateStyles({ fontFamily: e.target.value })}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.keys(localTemplate.pages).map((page) => (
              <div key={page} className="flex items-center justify-between p-2 border rounded">
                <span className="capitalize">{page}</span>
                <span className="text-sm text-gray-500">
                  {localTemplate.pages[page].length} bloc(s)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettings;
