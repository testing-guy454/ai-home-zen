import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Info, AlertCircle, Brain, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Anomaly {
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  recommendation: string;
}

interface AnomalyResult {
  anomalies: Anomaly[];
  insights: string[];
  statistics: {
    avgTemp: string;
    avgHum: string;
    dataPoints: number;
  };
}

export const AnomalyDetection = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnomalyResult | null>(null);
  const [timeFrame, setTimeFrame] = useState('24h');

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-anomaly-detection', {
        body: { timeFrame }
      });

      if (error) throw error;

      setResult(data);
      
      if (data.anomalies.length === 0) {
        toast.success('No anomalies detected - everything looks normal!');
      } else {
        toast.info(`Found ${data.anomalies.length} potential issue(s)`);
      }
    } catch (error) {
      console.error('Error running anomaly detection:', error);
      toast.error('Failed to analyze sensor data');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-accent/10 to-transparent rounded-full -mr-24 -mt-24 pointer-events-none" />
      <CardHeader className="relative z-10 border-b border-border/30">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-accent/20 border border-accent/40 rounded-lg">
                <Brain className="h-5 w-5 text-accent" />
              </div>
              AI Anomaly Detection
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80">
              Analyze sensor patterns and detect unusual behavior
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-[160px] rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={runAnalysis} disabled={loading} className="gap-2 font-semibold">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10 py-6">
        {result && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-xl border border-border/40 backdrop-blur">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">Avg Temperature</p>
                <p className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-warm)' }}>{result.statistics.avgTemp}°C</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">Avg Humidity</p>
                <p className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-cool)' }}>{result.statistics.avgHum}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">Data Points</p>
                <p className="text-3xl font-bold text-primary">{result.statistics.dataPoints}</p>
              </div>
            </div>

            {/* Anomalies */}
            {result.anomalies.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Detected Issues ({result.anomalies.length})
                </h4>
                <div className="space-y-3">
                  {result.anomalies.map((anomaly, index) => (
                    <Alert key={index} variant={getVariant(anomaly.type) as any}>
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-current/10 rounded-lg flex-shrink-0 mt-0.5">
                          {getIcon(anomaly.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertTitle className="mb-0 text-base">{anomaly.title}</AlertTitle>
                            <Badge variant="outline" className="text-xs">{anomaly.type.toUpperCase()}</Badge>
                          </div>
                          <AlertDescription className="text-sm">
                            {anomaly.description}
                          </AlertDescription>
                          <div className="mt-3 p-3 bg-background/60 rounded-lg border border-border/40 text-sm">
                            <p className="font-semibold text-foreground/90 mb-1">💡 Recommendation:</p>
                            <p className="text-foreground/80">{anomaly.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>All Clear!</AlertTitle>
                <AlertDescription>
                  No anomalies detected. Your smart home is operating normally.
                </AlertDescription>
              </Alert>
            )}

            {/* Insights */}
            {result.insights.length > 0 && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20">
                <h4 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-accent" />
                  AI Insights
                </h4>
                <ul className="space-y-2.5">
                  {result.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-foreground/85 flex gap-3 items-start">
                      <span className="text-accent font-bold text-lg leading-none mt-0.5">✓</span>
                      <span className="font-medium">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {!result && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="inline-flex p-4 bg-secondary/50 rounded-full mb-4">
              <Brain className="h-12 w-12 opacity-40" />
            </div>
            <p className="font-medium">Click "Run Analysis" to detect anomalies in your sensor data</p>
            <p className="text-xs text-muted-foreground/60 mt-2">Analysis may take a few moments to complete</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
