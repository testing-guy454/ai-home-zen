import { useEffect, useRef } from 'react';
import { useMQTT } from '@/hooks/useMQTT';
import { useSensorLogger } from '@/hooks/useSensorLogger';
import { useNotifications } from '@/hooks/useNotifications';
import { SensorCard } from '@/components/SensorCard';
import { ControlCard } from '@/components/ControlCard';
import { ChartCard } from '@/components/ChartCard';
import { AIInsights } from '@/components/AIInsights';
import { AlertBanner } from '@/components/AlertBanner';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { Button } from '@/components/ui/button';
import { Thermometer, Droplets, Lightbulb, Fan, Palette, Cpu, Eye, BarChart3, Brain, Settings as SettingsIcon } from 'lucide-react';
// import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Index = () => {
  const {
    isConnected,
    connectionReason,
    sensorData,
    alerts,
    aiLogs,
    temperatureHistory,
    humidityHistory,
    controlBulb,
    controlFan,
    setFanSpeed,
    setRGBColor,
    toggleMode,
  } = useMQTT();

  // Log sensor data to database
  useSensorLogger(sensorData, isConnected);

  // Notification system
  const { checkThresholds } = useNotifications();
  const lastCheckedRef = useRef<string>('');

  // Check thresholds when sensor data changes
  useEffect(() => {
    if (!isConnected || sensorData.temperature === 0) return;

    const dataKey = `${sensorData.temperature}-${sensorData.humidity}-${sensorData.motionState}`;
    if (dataKey === lastCheckedRef.current) return;
    lastCheckedRef.current = dataKey;

    checkThresholds(sensorData.temperature, sensorData.humidity, sensorData.motionState);
  }, [sensorData.temperature, sensorData.humidity, sensorData.motionState, isConnected, checkThresholds]);

  // AI automation: periodically send sensor data for AI processing
  const retryDelayRef = useRef(60000); // Start with 60 seconds
  const lastAICallRef = useRef(0);
  
  useEffect(() => {
    if (sensorData.mode === 'AUTO' && sensorData.temperature > 0) {
      const callAI = async () => {
        const now = Date.now();
        const timeSinceLastCall = now - lastAICallRef.current;
        
        // Ensure minimum delay between calls
        if (timeSinceLastCall < retryDelayRef.current) {
          return;
        }
        
        try {
          lastAICallRef.current = now;
          const { data, error } = await supabase.functions.invoke('ai-fan-control', {
            body: {
              temperature: sensorData.temperature,
              humidity: sensorData.humidity,
            },
          });

          if (error) {
            // Check if it's a rate limit error
            if (error.message?.includes('429') || error.message?.includes('rate_limited')) {
              // Exponential backoff: double the delay (max 10 minutes)
              retryDelayRef.current = Math.min(retryDelayRef.current * 2, 600000);
              toast.error(`AI rate limited. Waiting ${Math.floor(retryDelayRef.current / 1000)}s before retry`);
              return;
            }
            throw error;
          }

          // Success - reset delay back to 60 seconds
          retryDelayRef.current = 60000;
          
          if (data?.fanSpeed !== undefined) {
            setFanSpeed(data.fanSpeed);
            toast.success(`AI set fan speed to ${data.fanSpeed}%`);
          }
        } catch (error) {
          console.error('AI processing error:', error);
          toast.error('AI fan control failed');
        }
      };

      // Initial call
      callAI();
      
      // Set up interval with current delay
      const interval = setInterval(callAI, retryDelayRef.current);

      return () => clearInterval(interval);
    }
  }, [sensorData.mode, sensorData.temperature, sensorData.humidity, setFanSpeed]);

  // Adaptive RGB lighting based on time of day
  useEffect(() => {
    const updateRGBByTime = () => {
      const hour = new Date().getHours();
      let color = '#FFFFFF';

      if (hour >= 6 && hour < 18) {
        color = '#FFFFFF'; // Day: Cool white
      } else if (hour >= 18 && hour < 22) {
        color = '#FFD580'; // Evening: Warm yellow
      } else {
        color = '#0011FF'; // Night: Dim blue
      }

      if (sensorData.rgbColor !== color) {
        setRGBColor(color);
      }
    };

    updateRGBByTime();
    const interval = setInterval(updateRGBByTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sensorData.rgbColor, setRGBColor]);

  return (
    <div className="px-4 md:px-8 py-0">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Smart Home Control
            </h1>
            <p className="text-base text-muted-foreground/80 font-medium">Real-time IoT Dashboard with AI Automation</p>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatus isConnected={isConnected} reason={connectionReason} />
            <Link to="/analytics">
              <Button variant="outline" size="sm" className="gap-2 font-medium">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Analytics</span>
              </Button>
            </Link>
            <Link to="/ai">
              <Button variant="outline" size="sm" className="gap-2 font-medium">
                <Brain className="h-4 w-4" />
                <span className="hidden md:inline">AI</span>
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="gap-2 font-medium">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden md:inline">Settings</span>
              </Button>
            </Link>
            <Button
              variant={sensorData.mode === 'AUTO' ? 'default' : 'secondary'}
              onClick={toggleMode}
              disabled={!isConnected}
              size="sm"
              className="gap-2 font-medium"
            >
              <Cpu className="h-4 w-4" />
              <span className="hidden md:inline">{sensorData.mode} MODE</span>
            </Button>
          </div>
        </div>

        {/* Alerts */}
        <AlertBanner alerts={alerts} />

        {/* Sensor Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground/90">Live Sensor Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <SensorCard
              title="Temperature"
              value={sensorData.temperature.toFixed(1)}
              unit="°C"
              icon={Thermometer}
              gradient="var(--gradient-warm)"
            />
            <SensorCard
              title="Humidity"
              value={sensorData.humidity.toFixed(1)}
              unit="%"
              icon={Droplets}
              gradient="var(--gradient-cool)"
            />
            <SensorCard
              title="Motion"
              value={sensorData.motionState}
              icon={Eye}
              color={sensorData.motionState === 'DETECTED' ? 'destructive' : 'muted'}
            />
            <SensorCard
              title="Bulb"
              value={sensorData.bulbState}
              icon={Lightbulb}
              color="bulb"
            />
            <SensorCard
              title="Fan"
              value={`${sensorData.fanSpeed}%`}
              icon={Fan}
              color="fan"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground/90">Control Panel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ControlCard
            title="Bulb Control"
            icon={Lightbulb}
            type="toggle"
            value={sensorData.bulbState === 'ON'}
            onToggle={(state) => controlBulb(state ? 'ON' : 'OFF')}
            disabled={!isConnected}
          />
          <ControlCard
            title="Fan Control"
            icon={Fan}
            type="toggle"
            value={sensorData.fanState === 'ON'}
            onToggle={(state) => controlFan(state ? 'ON' : 'OFF')}
            disabled={!isConnected}
          />
          <ControlCard
            title="Fan Speed"
            icon={Fan}
            type="slider"
            value={sensorData.fanSpeed}
            onSliderChange={(value) => setFanSpeed(value[0])}
            disabled={!isConnected || sensorData.mode === 'AUTO'}
          />
          <ControlCard
            title="RGB Color"
            icon={Palette}
            type="color"
            value={sensorData.rgbColor}
            onColorChange={setRGBColor}
            disabled={!isConnected}
          />
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground/90">Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="Temperature History"
              data={temperatureHistory}
              color="hsl(var(--temperature))"
              unit="°C"
            />
            <ChartCard
              title="Humidity History"
              data={humidityHistory}
              color="hsl(var(--humidity))"
              unit="%"
            />
          </div>
        </div>

        {/* AI Insights */}
        <AIInsights logs={aiLogs} />
      </div>
    </div>
  );
};

export default Index;
