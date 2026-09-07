import { useEffect, useState } from 'react';
import { SunIcon, CloudIcon, FogIcon, RainIcon, SnowIcon, ThunderIcon } from './WeatherIcons';
import { loadKakaoMaps } from '../loadKakaoMaps';

interface WeatherData {
  tempNow: number;
  tempMin: number;
  tempMax: number;
  precipProbability: number;
  weatherCode: number;
  pm10: number | null;
  pm2_5: number | null;
}

// 기상청 대신 위경도만 있으면 회원가입/키 없이 바로 쓸 수 있는 Open-Meteo를 사용함
// (지도때 카카오맵을 고른 것과 같은 이유 - 결제수단 등록 위험이 아예 없음)
function WeatherIcon({ code }: { code: number }) {
  if (code === 0) return <SunIcon />;
  if (code >= 1 && code <= 3) return <CloudIcon />;
  if (code === 45 || code === 48) return <FogIcon />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <RainIcon />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <SnowIcon />;
  if (code >= 95) return <ThunderIcon />;
  return <CloudIcon />;
}

function weatherCondition(code: number): string {
  if (code === 0) return '맑음';
  if (code === 1) return '대체로 맑음';
  if (code === 2) return '구름 조금';
  if (code === 3) return '흐림';
  if (code === 45 || code === 48) return '안개';
  if (code >= 51 && code <= 57) return '이슬비';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return '비';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return '눈';
  if (code >= 95) return '뇌우';
  return '';
}

const PM10_BREAKPOINTS: [number, number, number] = [30, 80, 150];
const PM25_BREAKPOINTS: [number, number, number] = [15, 35, 75];

function pmGrade(value: number | null, breakpoints: [number, number, number]): string {
  if (value == null) return '';
  const [good, moderate, bad] = breakpoints;
  if (value <= good) return '좋음';
  if (value <= moderate) return '보통';
  if (value <= bad) return '나쁨';
  return '매우나쁨';
}

function gradeClass(grade: string): string {
  if (grade === '좋음') return 'sidebar__weather-grade--good';
  if (grade === '보통') return 'sidebar__weather-grade--moderate';
  if (grade === '나쁨') return 'sidebar__weather-grade--bad';
  if (grade === '매우나쁨') return 'sidebar__weather-grade--worse';
  return '';
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('위치를 사용할 수 없어요');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const [weatherRes, airRes] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
                `&current=temperature_2m,weather_code` +
                `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
                `&timezone=auto`,
            ),
            fetch(
              `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}` +
                `&current=pm10,pm2_5`,
            ),
          ]);
          if (!weatherRes.ok) throw new Error('weather fetch failed');
          const weatherJson = await weatherRes.json();
          const airJson = airRes.ok ? await airRes.json() : null;

          setWeather({
            tempNow: weatherJson.current.temperature_2m,
            tempMin: Math.round(weatherJson.daily.temperature_2m_min[0]),
            tempMax: Math.round(weatherJson.daily.temperature_2m_max[0]),
            precipProbability: weatherJson.daily.precipitation_probability_max[0],
            weatherCode: weatherJson.current.weather_code,
            pm10: airJson?.current?.pm10 ?? null,
            pm2_5: airJson?.current?.pm2_5 ?? null,
          });
        } catch {
          setError('날씨를 불러오지 못했어요');
        }

        // 위치 이름은 카카오맵(플레이스에서 쓰는 것과 같은 SDK/키)의 역지오코딩으로 구함 -
        // 실패해도 날씨 자체는 이미 보여줬으니 조용히 무시함
        try {
          const kakao = await loadKakaoMaps();
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.coord2Address(longitude, latitude, (result: any[], status: string) => {
            if (status !== kakao.maps.services.Status.OK) return;
            const address = result[0]?.address;
            if (!address) return;
            const label = [address.region_1depth_name, address.region_2depth_name].filter(Boolean).join(' ');
            setLocation(label || null);
          });
        } catch {
          // 위치 이름 없이도 날씨는 그대로 보여줌
        }
      },
      () => setError('위치 권한이 필요해요'),
    );
  }, []);

  if (error) {
    return <div className="sidebar__weather sidebar__weather--message">{error}</div>;
  }

  if (!weather) {
    return <div className="sidebar__weather sidebar__weather--message">날씨 불러오는 중…</div>;
  }

  const pm10Grade = pmGrade(weather.pm10, PM10_BREAKPOINTS);
  const pm25Grade = pmGrade(weather.pm2_5, PM25_BREAKPOINTS);

  return (
    <div className="sidebar__weather">
      {location && <div className="sidebar__weather-location">{location}</div>}

      <div className="sidebar__weather-main">
        <span className="sidebar__weather-icon">
          <WeatherIcon code={weather.weatherCode} />
        </span>
        <div className="sidebar__weather-main-text">
          <span className="sidebar__weather-temp">{weather.tempNow.toFixed(1)}°</span>
          <span className="sidebar__weather-condition">{weatherCondition(weather.weatherCode)}</span>
        </div>
      </div>

      <div className="sidebar__weather-minmax">
        <span className="sidebar__weather-min">{weather.tempMin}°</span>
        <span className="sidebar__weather-minmax-slash">/</span>
        <span className="sidebar__weather-max">{weather.tempMax}°</span>
        <span className="sidebar__weather-precip">강수 {weather.precipProbability}%</span>
      </div>

      <div className="sidebar__weather-air">
        <span>
          미세{' '}
          <span className={`sidebar__weather-grade ${gradeClass(pm10Grade)}`}>{pm10Grade || '-'}</span>
        </span>
        <span className="sidebar__weather-air-dot">·</span>
        <span>
          초미세{' '}
          <span className={`sidebar__weather-grade ${gradeClass(pm25Grade)}`}>{pm25Grade || '-'}</span>
        </span>
      </div>
    </div>
  );
}
