import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartCardProps {
  title: string;
  data: { time: string; value: number }[];
  color: string;
  unit: string;
}

export const ChartCard = ({ title, data, color, unit }: ChartCardProps) => {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />
      <CardHeader className="relative z-10">
        <CardTitle className="text-base font-semibold text-foreground/90">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground) / 0.6)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground) / 0.6)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit={unit}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card) / 0.95)',
                border: '1px solid hsl(var(--border) / 0.5)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                backdropFilter: 'blur(8px)'
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
              itemStyle={{ color: color, fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={false}
              animationDuration={500}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
