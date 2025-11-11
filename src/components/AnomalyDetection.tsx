import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-anomaly-detection');

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Anomaly Detection
            </CardTitle>
            <CardDescription>
              Analyze sensor patterns and detect unusual behavior
            </CardDescription>
          </div>
          <Button onClick={runAnalysis} disabled={loading} className="gap-2">
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
      </CardHeader>
      <CardContent className="space-y-4">
        {result && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Avg Temperature</p>
                <p className="text-2xl font-bold">{result.statistics.avgTemp}°C</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Humidity</p>
                <p className="text-2xl font-bold">{result.statistics.avgHum}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold">{result.statistics.dataPoints}</p>
              </div>
            </div>

            {/* Anomalies */}
            {result.anomalies.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Detected Issues</h4>
                {result.anomalies.map((anomaly, index) => (
                  <Alert key={index} variant={getVariant(anomaly.type) as any}>
                    <div className="flex items-start gap-3">
                      {getIcon(anomaly.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTitle className="mb-0">{anomaly.title}</AlertTitle>
                          <Badge variant="outline">{anomaly.type}</Badge>
                        </div>
                        <AlertDescription className="text-sm">
                          {anomaly.description}
                        </AlertDescription>
                        <div className="mt-2 p-2 bg-background/50 rounded text-sm">
                          <strong>Recommendation:</strong> {anomaly.recommendation}
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}
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
              <div className="space-y-2">
                <h4 className="text-sm font-medium">AI Insights</h4>
                <ul className="space-y-2">
                  {result.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {!result && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run Analysis" to detect anomalies in your sensor data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
