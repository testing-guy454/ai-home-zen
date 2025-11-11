import { useEffect, useState, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { toast } from 'sonner';

export interface SensorData {
  temperature: number;
  humidity: number;
  bulbState: 'ON' | 'OFF';
  fanState: 'ON' | 'OFF';
  fanSpeed: number;
  rgbColor: string;
  mode: 'AUTO' | 'MANUAL';
  motionState: 'DETECTED' | 'NONE';
}

export interface AlertData {
  message: string;
  timestamp: Date;
}

export interface AILog {
  message: string;
  timestamp: Date;
}

const BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
const BASE_TOPIC = 'yuvraj/home';

export const useMQTT = () => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 0,
    humidity: 0,
    bulbState: 'OFF',
    fanState: 'OFF',
    fanSpeed: 0,
    rgbColor: '#FFFFFF',
    mode: 'MANUAL',
    motionState: 'NONE',
  });
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [aiLogs, setAILogs] = useState<AILog[]>([]);
  const [temperatureHistory, setTemperatureHistory] = useState<{ time: string; value: number }[]>([]);
  const [humidityHistory, setHumidityHistory] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    const mqttClient = mqtt.connect(BROKER_URL);

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      setIsConnected(true);
      toast.success('Connected to Smart Home');

      // Subscribe to all topics
      mqttClient.subscribe([
        `${BASE_TOPIC}/temp`,
        `${BASE_TOPIC}/hum`,
        `${BASE_TOPIC}/bulb`,
        `${BASE_TOPIC}/fan`,
        `${BASE_TOPIC}/fan/speed`,
        `${BASE_TOPIC}/color`,
        `${BASE_TOPIC}/mode`,
        `${BASE_TOPIC}/motion`,
        `${BASE_TOPIC}/alert`,
        `${BASE_TOPIC}/ai/log`,
      ]);
    });

    mqttClient.on('message', (topic, message) => {
      const payload = message.toString();
      const now = new Date().toLocaleTimeString();

      switch (topic) {
        case `${BASE_TOPIC}/temp`:
          const temp = parseFloat(payload);
          setSensorData((prev) => ({ ...prev, temperature: temp }));
          setTemperatureHistory((prev) => [...prev.slice(-19), { time: now, value: temp }]);
          break;
        case `${BASE_TOPIC}/hum`:
          const hum = parseFloat(payload);
          setSensorData((prev) => ({ ...prev, humidity: hum }));
          setHumidityHistory((prev) => [...prev.slice(-19), { time: now, value: hum }]);
          break;
        case `${BASE_TOPIC}/bulb`:
          setSensorData((prev) => ({ ...prev, bulbState: payload as 'ON' | 'OFF' }));
          break;
        case `${BASE_TOPIC}/fan`:
          setSensorData((prev) => ({ ...prev, fanState: payload as 'ON' | 'OFF' }));
          break;
        case `${BASE_TOPIC}/fan/speed`:
          setSensorData((prev) => ({ ...prev, fanSpeed: parseInt(payload) }));
          break;
        case `${BASE_TOPIC}/color`:
          setSensorData((prev) => ({ ...prev, rgbColor: payload }));
          break;
        case `${BASE_TOPIC}/mode`:
          setSensorData((prev) => ({ ...prev, mode: payload as 'AUTO' | 'MANUAL' }));
          break;
        case `${BASE_TOPIC}/motion`:
          setSensorData((prev) => ({ ...prev, motionState: payload as 'DETECTED' | 'NONE' }));
          if (payload === 'DETECTED') {
            toast.info('Motion detected!', { duration: 3000 });
          }
          break;
        case `${BASE_TOPIC}/alert`:
          const alert = { message: payload, timestamp: new Date() };
          setAlerts((prev) => [alert, ...prev.slice(0, 4)]);
          toast.error(payload, { duration: 5000 });
          break;
        case `${BASE_TOPIC}/ai/log`:
          const aiLog = { message: payload, timestamp: new Date() };
          setAILogs((prev) => [aiLog, ...prev.slice(0, 9)]);
          break;
      }
    });

    mqttClient.on('error', (error) => {
      console.error('MQTT Error:', error);
      toast.error('Connection error');
    });

    mqttClient.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from Smart Home');
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
    };
  }, []);

  const publish = useCallback(
    (topic: string, message: string) => {
      if (client && isConnected) {
        client.publish(`${BASE_TOPIC}/${topic}`, message);
      }
    },
    [client, isConnected]
  );

  const controlBulb = useCallback(
    (state: 'ON' | 'OFF') => {
      publish('control/bulb', state);
    },
    [publish]
  );

  const controlFan = useCallback(
    (state: 'ON' | 'OFF') => {
      publish('control/fan', state);
    },
    [publish]
  );

  const setFanSpeed = useCallback(
    (speed: number) => {
      publish('control/fan/speed', speed.toString());
    },
    [publish]
  );

  const setRGBColor = useCallback(
    (color: string) => {
      publish('control/color', color);
    },
    [publish]
  );

  const toggleMode = useCallback(() => {
    publish('control/mode', 'TOGGLE');
  }, [publish]);

  return {
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
  };
};
