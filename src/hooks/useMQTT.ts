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

// Shared singleton state so the MQTT connection lives for the lifetime of the page
type SharedState = {
  client: MqttClient | null;
  isConnected: boolean;
  connectionReason?: string | null;
  sensorData: SensorData;
  alerts: AlertData[];
  aiLogs: AILog[];
  temperatureHistory: { time: string; value: number }[];
  humidityHistory: { time: string; value: number }[];
};

const INITIAL_SENSOR: SensorData = {
  temperature: 0,
  humidity: 0,
  bulbState: 'OFF',
  fanState: 'OFF',
  fanSpeed: 0,
  rgbColor: '#FFFFFF',
  mode: 'MANUAL',
  motionState: 'NONE',
};

// Module-level shared state and subscribers
const shared: SharedState = {
  client: null,
  isConnected: false,
  connectionReason: null,
  sensorData: { ...INITIAL_SENSOR },
  alerts: [],
  aiLogs: [],
  temperatureHistory: [],
  humidityHistory: [],
};

const subscribers = new Set<(s: SharedState) => void>();

const notify = () => {
  for (const cb of subscribers) {
    try {
      cb(shared);
    } catch (e) {
      console.error('Subscriber error', e);
    }
  }
};

let initializing = false;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

const clearScheduledDisconnect = () => {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
    // console.log('Cleared scheduled MQTT disconnect');
  }
};

const scheduleDisconnect = (ms = 60000) => {
  clearScheduledDisconnect();
  idleTimer = setTimeout(() => {
    try {
      const client = shared.client;
      if (client) {
        console.log('No subscribers - closing MQTT client due to inactivity');
        shared.connectionReason = 'idle-timeout';
        toast.info('MQTT connection terminated due to inactivity');
        try {
          client.removeAllListeners();
        } catch (e) {
          console.warn('Error removing listeners before end', e);
        }
        try {
          // force close
          client.end(true);
        } catch (e) {
          try { client.end(); } catch (e2) { /* ignore */ }
        }
      }
    } catch (err) {
      console.error('Error during scheduled MQTT disconnect:', err);
    } finally {
      shared.client = null;
      shared.isConnected = false;
      // keep last known sensor values, but set reason
      notify();
      idleTimer = null;
    }
  }, ms);
};

const ensureClient = () => {
  if (shared.client) return shared.client;
  if (initializing) return null;

  initializing = true;

  // Create client with reconnect enabled
  clearScheduledDisconnect();
  const client = mqtt.connect(BROKER_URL, { reconnectPeriod: 2000, connectTimeout: 30000 });
  shared.client = client;

  const handleConnect = () => {
    console.log('Connected to MQTT broker (singleton)');
    shared.isConnected = true;
    shared.connectionReason = null;
    toast.success('Connected to Smart Home');

    // Subscribe safely
    try {
      if (!(client as any).disconnecting && client.connected) {
        client.subscribe([
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
        ], (err, granted) => {
          if (err) console.error('Subscribe error:', err);
          else console.log('Subscribed:', granted.map(g => g.topic).join(', '));
        });
      } else {
        console.warn('Skipped subscribe, client disconnecting/not connected');
      }
    } catch (err) {
      console.error('Subscribe exception', err);
    }

    notify();
  };

  const handleMessage = (topic: string, message: Buffer) => {
    const payload = message.toString();
    const now = new Date().toLocaleTimeString();

    switch (topic) {
      case `${BASE_TOPIC}/temp`: {
        const temp = parseFloat(payload);
        shared.sensorData.temperature = temp;
        shared.temperatureHistory = [...shared.temperatureHistory.slice(-19), { time: now, value: temp }];
        break;
      }
      case `${BASE_TOPIC}/hum`: {
        const hum = parseFloat(payload);
        shared.sensorData.humidity = hum;
        shared.humidityHistory = [...shared.humidityHistory.slice(-19), { time: now, value: hum }];
        break;
      }
      case `${BASE_TOPIC}/bulb`:
        shared.sensorData.bulbState = payload as 'ON' | 'OFF';
        break;
      case `${BASE_TOPIC}/fan`:
        shared.sensorData.fanState = payload as 'ON' | 'OFF';
        break;
      case `${BASE_TOPIC}/fan/speed`:
        shared.sensorData.fanSpeed = parseInt(payload) || 0;
        break;
      case `${BASE_TOPIC}/color`:
        shared.sensorData.rgbColor = payload;
        break;
      case `${BASE_TOPIC}/mode`:
        shared.sensorData.mode = payload as 'AUTO' | 'MANUAL';
        break;
      case `${BASE_TOPIC}/motion`:
        shared.sensorData.motionState = payload as 'DETECTED' | 'NONE';
        if (payload === 'DETECTED') {
          toast.info('Motion detected!', { duration: 3000 });
        }
        break;
      case `${BASE_TOPIC}/alert`:
        shared.alerts = [{ message: payload, timestamp: new Date() }, ...shared.alerts.slice(0, 4)];
        toast.error(payload, { duration: 5000 });
        break;
      case `${BASE_TOPIC}/ai/log`:
        shared.aiLogs = [{ message: payload, timestamp: new Date() }, ...shared.aiLogs.slice(0, 9)];
        break;
      default:
        break;
    }

    notify();
  };

  const handleDisconnect = () => {
    shared.isConnected = false;
    shared.connectionReason = 'broker-disconnected';
    toast.error('Disconnected from Smart Home');
    notify();
  };

  const handleError = (err: Error) => {
    console.error('MQTT Error (singleton):', err);
    shared.connectionReason = 'error';
    toast.error('Connection error');
    notify();
  };

  client.on('connect', handleConnect);
  client.on('message', handleMessage);
  client.on('disconnect', handleDisconnect);
  client.on('error', handleError);

  initializing = false;

  return client;
};

export const useMQTT = () => {
  const [state, setState] = useState<SharedState>(() => ({ ...shared }));

  useEffect(() => {
      // Ensure singleton client exists once any component uses the hook
    clearScheduledDisconnect();
    ensureClient();

    const subscriber = (s: SharedState) => setState({ ...s });
    subscribers.add(subscriber);

    // Immediately sync local state with shared
    setState({ ...shared });

    return () => {
      subscribers.delete(subscriber);
      // If no more subscribers, schedule disconnect after 1 minute
      if (subscribers.size === 0) {
        scheduleDisconnect(60000);
      }
      // Do NOT destroy shared client immediately here - allow idle timeout
    };
  }, []);

  const publish = useCallback((topic: string, message: string) => {
    const client = shared.client;
    if (client && client.connected && !(client as any).disconnecting) {
      client.publish(`${BASE_TOPIC}/${topic}`, message, (err) => {
        if (err) {
          console.error('Publish error:', err);
          toast.error('Failed to send command');
        }
      });
    } else {
      console.warn('Publish skipped, MQTT client not connected');
    }
  }, []);

  const controlBulb = useCallback((state: 'ON' | 'OFF') => {
    publish('control/bulb', state);
  }, [publish]);

  const controlFan = useCallback((state: 'ON' | 'OFF') => {
    publish('control/fan', state);
  }, [publish]);

  const setFanSpeed = useCallback((speed: number) => {
    publish('control/fan/speed', speed.toString());
  }, [publish]);

  const setRGBColor = useCallback((color: string) => {
    publish('control/color', color);
  }, [publish]);

  const toggleMode = useCallback(() => {
    publish('control/mode', 'TOGGLE');
  }, [publish]);

  return {
    isConnected: state.isConnected,
    sensorData: state.sensorData,
    alerts: state.alerts,
    aiLogs: state.aiLogs,
    temperatureHistory: state.temperatureHistory,
    humidityHistory: state.humidityHistory,
    controlBulb,
    controlFan,
    setFanSpeed,
    setRGBColor,
    toggleMode,
  };
};
