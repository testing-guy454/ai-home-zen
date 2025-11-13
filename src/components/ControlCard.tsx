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

  const [localSpeed, setLocalSpeed] = useState<number>(typeof value === 'number' ? value : 0);

  useEffect(() => {
    if (typeof value === 'number' && value !== localSpeed) setLocalSpeed(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground/90 tracking-wide uppercase">{title}</CardTitle>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/20 transition-colors">
          <Icon className="h-5 w-5 text-accent" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
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
              <span className="font-semibold">{localSpeed}%</span>
            </div>
            <Slider
              value={[localSpeed]}
              onValueChange={(v) => setLocalSpeed(v[0])}
              onValueCommit={(v) => onSliderChange?.(v)}
              max={100}
              step={1}
              disabled={disabled}
              className="w-full"
            />
          </div>
        )}
        {type === 'color' && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="color"
                value={localColor}
                onChange={(e) => setLocalColor(e.target.value)}
                disabled={disabled}
                className="h-14 w-full rounded-xl cursor-pointer border border-border/40 bg-card/70 hover:border-accent/50 transition-colors shadow-sm"
              />
              <Button
                onClick={() => onColorChange?.(localColor)}
                disabled={disabled}
                variant="default"
                size="sm"
                className="min-w-[70px] font-medium"
              >
                Apply
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground/70 font-mono tracking-wide">{localColor}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
