import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  gradient?: string;
  color?: string;
}

export const SensorCard = ({ title, value, unit, icon: Icon, gradient, color }: SensorCardProps) => {
  const getColorClass = () => {
    if (color === 'destructive') return 'text-destructive';
    if (color === 'muted') return 'text-muted-foreground';
    if (color) return `text-${color}`;
    return 'text-primary';
  };

  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground/90 tracking-wide uppercase">{title}</CardTitle>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
          <Icon className={`h-5 w-5 ${getColorClass()}`} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-4xl font-bold leading-tight" style={gradient ? { background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>
          {value}
          {unit && <span className="text-xl ml-2 text-muted-foreground font-medium">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
};
