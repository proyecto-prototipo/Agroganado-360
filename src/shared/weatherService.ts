import type { ClimateRecord } from './types';

type BrowserPosition = {
  latitude: number;
  longitude: number;
};

type OpenMeteoCurrentResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    weather_code?: number;
  };
};

function getBrowserPosition(): Promise<BrowserPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Tu navegador no permite obtener ubicación.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        reject(new Error('No se pudo obtener la ubicación. Revisa los permisos del navegador.'));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  });
}

function getEventTypeFromWeather(data: {
  temperature: number;
  humidity: number;
  rainfall: number;
  weatherCode?: number;
}): ClimateRecord['eventType'] {
  if (data.temperature >= 26) return 'Calor extremo';
  if (data.temperature <= 10) return 'Frío';
  if (data.rainfall > 0) return 'Lluvia';
  if (data.humidity <= 45) return 'Sequía';

  return 'Normal';
}

export async function getCurrentWeatherByUserLocation(): Promise<Partial<ClimateRecord>> {
  const { latitude, longitude } = await getBrowserPosition();

  const url = new URL('https://api.open-meteo.com/v1/forecast');

  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,precipitation,weather_code'
  );
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('No se pudo consultar el clima actual.');
  }

  const data = (await response.json()) as OpenMeteoCurrentResponse;

  const current = data.current;

  if (!current) {
    throw new Error('La API no devolvió datos climáticos actuales.');
  }

  const temperature = Number(current.temperature_2m ?? 0);
  const humidity = Number(current.relative_humidity_2m ?? 0);
  const rainfall = Number(current.precipitation ?? 0);

  return {
    temperature,
    humidity,
    rainfall,
    eventType: getEventTypeFromWeather({
      temperature,
      humidity,
      rainfall,
      weatherCode: current.weather_code
    }),
    location: `Ubicación actual (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
    latitude,
    longitude,
    createdAt: current.time
      ? new Date(current.time).toISOString()
      : new Date().toISOString()
  };
}