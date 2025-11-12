import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnomalyDetection } from '@/components/AnomalyDetection';
import { AIInsights } from '@/components/AIInsights';
import { useMQTT } from '@/hooks/useMQTT';
import { Button } from '@/components/ui/button';

const AI = () => {
  const { aiLogs } = useMQTT();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI & Automation
              </h1>
              <p className="text-muted-foreground mt-1">Anomaly detection and AI insights</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AnomalyDetection />
          </div>
          <div>
            <AIInsights logs={aiLogs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;
