import { useEffect } from 'react';
import { useMQTT } from '@/hooks/useMQTT';
import { SensorCard } from '@/components/SensorCard';
import { ControlCard } from '@/components/ControlCard';
import { ChartCard } from '@/components/ChartCard';
import { AIInsights } from '@/components/AIInsights';
import { AlertBanner } from '@/components/AlertBanner';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { Button } from '@/components/ui/button';
import { Thermometer, Droplets, Lightbulb, Fan, Palette, Cpu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const {
    isConnected,
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

  // AI automation: periodically send sensor data for AI processing
  useEffect(() => {
    if (sensorData.mode === 'AUTO' && sensorData.temperature > 0) {
      const interval = setInterval(async () => {
        try {
          const { data, error } = await supabase.functions.invoke('ai-fan-control', {
            body: {
              temperature: sensorData.temperature,
              humidity: sensorData.humidity,
            },
          });

          if (error) throw error;

          if (data?.fanSpeed !== undefined) {
            setFanSpeed(data.fanSpeed);
          }
        } catch (error) {
          console.error('AI processing error:', error);
        }
      }, 10000); // Every 10 seconds in AUTO mode

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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Smart Home Control
            </h1>
            <p className="text-muted-foreground mt-1">IoT Dashboard with AI Automation</p>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionStatus isConnected={isConnected} />
            <Button
              variant={sensorData.mode === 'AUTO' ? 'default' : 'secondary'}
              onClick={toggleMode}
              disabled={!isConnected}
              className="gap-2"
            >
              <Cpu className="h-4 w-4" />
              {sensorData.mode} MODE
            </Button>
          </div>
        </div>

        {/* Alerts */}
        <AlertBanner alerts={alerts} />

        {/* Sensor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Controls */}
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

        {/* Charts */}
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

        {/* AI Insights */}
        <AIInsights logs={aiLogs} />
      </div>
    </div>
  );
};

export default Index;
