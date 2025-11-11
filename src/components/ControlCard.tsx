import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ControlCardProps {
  title: string;
  icon: LucideIcon;
  type: 'toggle' | 'slider' | 'color';
  value?: boolean | number | string;
  onToggle?: (state: boolean) => void;
  onSliderChange?: (value: number[]) => void;
  onColorChange?: (color: string) => void;
  disabled?: boolean;
}

export const ControlCard = ({
  title,
  icon: Icon,
  type,
  value,
  onToggle,
  onSliderChange,
  onColorChange,
  disabled,
}: ControlCardProps) => {
  const [localColor, setLocalColor] = useState<string>(String(value || '#ffffff'));

  useEffect(() => {
    // keep local state in sync when parent updates value
    if (typeof value === 'string' && value !== localColor) {
      setLocalColor(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Card className="group border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground/80 tracking-wide">{title}</CardTitle>
        <div className="h-7 w-7 rounded-md bg-secondary/70 border border-border/50 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {type === 'toggle' && (
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{value ? 'ON' : 'OFF'}</span>
            <Switch
              checked={value as boolean}
              onCheckedChange={onToggle}
              disabled={disabled}
            />
          </div>
        )}
        {type === 'slider' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Speed</span>
              <span className="font-semibold">{value}%</span>
            </div>
            <Slider
              value={[value as number]}
              onValueChange={onSliderChange}
              max={100}
              step={1}
              disabled={disabled}
              className="w-full"
            />
          </div>
        )}
        {type === 'color' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="color"
                value={localColor}
                onChange={(e) => setLocalColor(e.target.value)}
                disabled={disabled}
                className="h-12 w-full rounded-md cursor-pointer border border-border/60 bg-card/70 hover:border-primary transition-colors"
              />
              <Button
                onClick={() => onColorChange?.(localColor)}
                disabled={disabled}
                variant="gradient"
                size="sm"
                className="min-w-[64px]"
              >
                Set
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground font-mono">{localColor}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
