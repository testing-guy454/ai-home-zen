import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Clock } from 'lucide-react';
import { AILog } from '@/hooks/useMQTT';

interface AIInsightsProps {
  logs: AILog[];
}

export const AIInsights = ({ logs }: AIInsightsProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground/90">AI Insights & Recommendations</h2>
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent/10 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-accent" />
            Intelligent Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <ScrollArea className="h-[320px] pr-4">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground/70">
                <p className="text-sm font-medium">Waiting for AI recommendations...</p>
              </div>
            ) : (
              <div className="relative ml-3 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-accent/50 before:to-accent/0">
                <div className="space-y-4">
                  {logs.map((log, index) => (
                    <div key={index} className="relative pl-5">
                      <span className="absolute -left-2.5 top-1.5 h-3 w-3 rounded-full bg-accent border-2 border-card shadow-[0_0_16px_hsl(var(--accent)_/_0.3)]" />
                      <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/60 to-secondary/40 border border-accent/20 space-y-2 hover:border-accent/40 transition-colors">
                        <p className="text-sm leading-relaxed font-medium text-foreground/95">{log.message}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                          <Clock className="h-3.5 w-3.5" />
                          {log.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
