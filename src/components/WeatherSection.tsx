import { useState, useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface WeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  description: string;
  humidity: number;
  pressure: number;
  visibility: number;
  wind: number;
  wind_deg: number;
  clouds: number;
  city: string;
  country: string;
  main: string;
  sunrise: number;
  sunset: number;
}

interface ForecastDay {
  date: string;
  dayName: string;
  temp_min: number;
  temp_max: number;
  main: string;
  description: string;
  humidity: number;
  wind: number;
  pop: number; // probability of precipitation
}

const API_KEY = "d5c0139e3df5df47c0375979fc13d6d0"; // Substitua pela sua chave da OpenWeatherMap

const getWeatherEmoji = (main: string): string => {
  switch (main.toLowerCase()) {
    case "clear": return "☀️";
    case "clouds": return "☁️";
    case "rain":
    case "drizzle": return "🌧️";
    case "thunderstorm": return "⛈️";
    case "snow": return "❄️";
    default: return "🌫️";
  }
};

const getWindDirection = (deg: number): string => {
  const dirs = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
};

const formatTime = (unix: number): string => {
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const getTrainingTip = (weather: WeatherData): { icon: string; tip: string } => {
  if (weather.main.toLowerCase() === "thunderstorm") return { icon: "⚠️", tip: "Evite treinos ao ar livre. Risco de raios!" };
  if (weather.main.toLowerCase() === "rain" || weather.main.toLowerCase() === "drizzle") return { icon: "🏠", tip: "Prefira treinos indoor ou leve capa impermeável." };
  if (weather.temp >= 35) return { icon: "🥵", tip: "Calor extremo! Hidrate-se muito e evite horários de pico." };
  if (weather.temp >= 28) return { icon: "💧", tip: "Calor moderado. Hidrate-se bem e use protetor solar." };
  if (weather.temp <= 5) return { icon: "🧥", tip: "Frio intenso. Aqueça bem antes de treinar." };
  if (weather.temp <= 15) return { icon: "🧤", tip: "Frio. Use camadas e aqueça 10min antes." };
  if (weather.humidity > 85) return { icon: "😤", tip: "Umidade muito alta. Reduza a intensidade." };
  if (weather.wind > 40) return { icon: "💨", tip: "Vento forte. Cuidado com corridas e ciclismo." };
  return { icon: "✅", tip: "Condições ótimas para treinar! Aproveite." };
};

const WeatherSection = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [statusMsg, setStatusMsg] = useState("Aguardando local...");
  const [inputCidade, setInputCidade] = useState("");
  const ref = useScrollReveal();

  const parseForecast = (data: Record<string, unknown>): ForecastDay[] => {
    const list = data.list as Array<Record<string, unknown>>;
    const byDay: Record<string, { temps: number[]; mains: string[]; descs: string[]; humidities: number[]; winds: number[]; pops: number[] }> = {};

    for (const item of list) {
      const dt = new Date((item.dt as number) * 1000);
      const dateKey = dt.toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];
      if (dateKey === today) continue; // skip today

      if (!byDay[dateKey]) byDay[dateKey] = { temps: [], mains: [], descs: [], humidities: [], winds: [], pops: [] };
      const main = item.main as Record<string, number>;
      const weatherArr = item.weather as Array<Record<string, string>>;
      const wind = item.wind as Record<string, number>;
      byDay[dateKey].temps.push(main.temp);
      byDay[dateKey].mains.push(weatherArr[0].main);
      byDay[dateKey].descs.push(weatherArr[0].description);
      byDay[dateKey].humidities.push(main.humidity);
      byDay[dateKey].winds.push(Math.round(wind.speed * 3.6));
      byDay[dateKey].pops.push((item.pop as number) || 0);
    }

    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    return Object.entries(byDay).slice(0, 5).map(([dateKey, vals]) => {
      const dt = new Date(dateKey + "T12:00:00");
      // Most frequent weather condition
      const mainCounts: Record<string, number> = {};
      vals.mains.forEach(m => { mainCounts[m] = (mainCounts[m] || 0) + 1; });
      const dominantMain = Object.entries(mainCounts).sort((a, b) => b[1] - a[1])[0][0];
      const descIdx = vals.mains.indexOf(dominantMain);

      return {
        date: dateKey,
        dayName: dayNames[dt.getDay()],
        temp_min: Math.round(Math.min(...vals.temps)),
        temp_max: Math.round(Math.max(...vals.temps)),
        main: dominantMain,
        description: vals.descs[descIdx],
        humidity: Math.round(vals.humidities.reduce((a, b) => a + b, 0) / vals.humidities.length),
        wind: Math.round(vals.winds.reduce((a, b) => a + b, 0) / vals.winds.length),
        pop: Math.round(Math.max(...vals.pops) * 100),
      };
    });
  };

  const fetchForecast = async (query: string) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      if (!res.ok) return;
      const data = await res.json();
      setForecast(parseForecast(data));
    } catch {
      setForecast([]);
    }
  };

  const parseWeather = (data: Record<string, unknown>) => {
    const main = data.main as Record<string, number>;
    const wind = data.wind as Record<string, number>;
    const weatherArr = data.weather as Array<Record<string, string>>;
    const sys = data.sys as Record<string, unknown>;
    const clouds = data.clouds as Record<string, number>;
    return {
      temp: Math.round(main.temp),
      feels_like: Math.round(main.feels_like),
      temp_min: Math.round(main.temp_min),
      temp_max: Math.round(main.temp_max),
      description: weatherArr[0].description,
      humidity: main.humidity,
      pressure: main.pressure,
      visibility: Math.round(((data.visibility as number) || 10000) / 1000),
      wind: Math.round(wind.speed * 3.6),
      wind_deg: wind.deg || 0,
      clouds: clouds?.all || 0,
      city: data.name as string,
      country: (sys?.country as string) || "",
      main: weatherArr[0].main,
      sunrise: (sys?.sunrise as number) || 0,
      sunset: (sys?.sunset as number) || 0,
    };
  };

  const buscarClima = async (cidade: string) => {
    setStatusMsg("Procurando cidade...");
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      const data = await res.json();
      if (!res.ok) {
        const msg = (data as Record<string, string>).message || "Cidade não encontrada";
        throw new Error(msg);
      }
      const parsed = parseWeather(data);
      setWeather(parsed);
      setStatusMsg(parsed.city);
      fetchForecast(`q=${encodeURIComponent(cidade)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setStatusMsg(`Erro: ${message}`);
      setWeather(null);
      setForecast([]);
    }
  };

  useEffect(() => {
    const fetchByLocation = async () => {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        ).catch(() => null);

        const lat = pos?.coords.latitude ?? -23.55;
        const lon = pos?.coords.longitude ?? -46.63;

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`
        );
        const data = await res.json();
        if (!res.ok) {
          const msg = (data as Record<string, string>).message || "Erro na API";
          throw new Error(msg);
        }
        const parsed = parseWeather(data);
        setWeather(parsed);
        setStatusMsg(parsed.city);
        fetchForecast(`lat=${lat}&lon=${lon}`);
      } catch (err) {
        console.error("Weather fetch error:", err);
        const fallback: WeatherData = {
          temp: 24, feels_like: 25, temp_min: 20, temp_max: 28,
          description: "céu limpo", humidity: 55, pressure: 1013,
          visibility: 10, wind: 12, wind_deg: 180, clouds: 0,
          city: "Arapongas", country: "BR", main: "Clear",
          sunrise: 0, sunset: 0,
        };
        setWeather(fallback);
        setStatusMsg(fallback.city);
      }
    };
    fetchByLocation();
  }, []);

  const handleBuscar = () => {
    if (inputCidade.trim()) buscarClima(inputCidade.trim());
  };

  return (
    <section className="relative py-24 overflow-hidden" ref={ref}>
      <div className="container relative z-10">
        <p className="section-heading mb-3">CLIMA INTELIGENTE</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-12">
          HOW'S THE WEATHER FOR<br />
          <span className="text-gradient">PERFORMANCE TODAY?</span>
        </h2>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* ===== CARD PRINCIPAL ===== */}
        <div
          style={{
            background: "linear-gradient(135deg, #00B4B8 0%, #03045E 100%)",
            width: "420px",
            maxWidth: "100%",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 4px 15px rgba(3,4,98,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            transition: "transform 0.3s ease",
            color: "#ffffff",
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-7px)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
        >
          {/* Search bar */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={inputCidade}
              onChange={e => setInputCidade(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleBuscar()}
              placeholder="Buscar cidade..."
              style={{
                flex: 1,
                padding: "10px 15px",
                border: "none",
                borderRadius: "30px",
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
                outline: "none",
                fontSize: "14px",
              }}
            />
            <button
              onClick={handleBuscar}
              style={{
                border: "none",
                backgroundColor: "#ffffff",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                fontSize: "16px",
                flexShrink: 0,
              }}
            >
              🔎
            </button>
          </div>

          {/* City name */}
          <h2 style={{ textAlign: "center", fontSize: "22px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
            {statusMsg}
            {weather?.country && <span style={{ fontSize: "13px", opacity: 0.7, marginLeft: "8px", fontWeight: 400 }}>{weather.country}</span>}
          </h2>

          {/* Weather body */}
          {weather && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "80px", marginBottom: "5px", filter: "drop-shadow(0 5px 10px rgba(0,0,0,0.2))" }}>
                {getWeatherEmoji(weather.main)}
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                <h1 style={{ fontSize: "72px", fontWeight: 700, lineHeight: 1, margin: 0 }}>
                  {weather.temp}
                </h1>
                <span style={{ fontSize: "24px", fontWeight: 400, marginTop: "10px" }}>°C</span>
              </div>
              <p style={{ fontSize: "16px", fontWeight: 300, textTransform: "capitalize", marginTop: "5px", opacity: 0.8 }}>
                {weather.description}
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "6px", fontSize: "13px", opacity: 0.7 }}>
                <span>Sensação: {weather.feels_like}°C</span>
                <span>Mín: {weather.temp_min}°</span>
                <span>Máx: {weather.temp_max}°</span>
              </div>
            </div>
          )}

          {/* Stats grid */}
          {weather && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}>
              <div style={{ backgroundColor: "rgba(3,4,98,0.6)", padding: "12px 14px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>💧 Umidade</span>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{weather.humidity}%</span>
              </div>
              <div style={{ backgroundColor: "rgba(3,4,98,0.6)", padding: "12px 14px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>🍃 Vento</span>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{weather.wind} km/h</span>
                <span style={{ fontSize: "10px", opacity: 0.6 }}>{getWindDirection(weather.wind_deg)}</span>
              </div>
              <div style={{ backgroundColor: "rgba(3,4,98,0.6)", padding: "12px 14px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>🌡️ Pressão</span>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{weather.pressure}</span>
                <span style={{ fontSize: "10px", opacity: 0.6 }}>hPa</span>
              </div>
              <div style={{ backgroundColor: "rgba(3,4,98,0.6)", padding: "12px 14px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>👁️ Visibilidade</span>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{weather.visibility} km</span>
              </div>
              <div style={{ backgroundColor: "rgba(3,4,98,0.6)", padding: "12px 14px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>☁️ Nuvens</span>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{weather.clouds}%</span>
              </div>
              {weather.sunrise > 0 && (
                <div style={{ backgroundColor: "rgba(3,4,98,0.6)", padding: "12px 14px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>🌅 Sol</span>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>{formatTime(weather.sunrise)}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>🌇 {formatTime(weather.sunset)}</span>
                </div>
              )}
            </div>
          )}

          {/* Training tip */}
          {weather && (
            <div style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              padding: "14px 18px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <span style={{ fontSize: "28px", flexShrink: 0 }}>{getTrainingTip(weather).icon}</span>
              <div>
                <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7 }}>Dica de treino</span>
                <p style={{ margin: "3px 0 0", fontSize: "13px", fontWeight: 500, lineHeight: 1.4 }}>
                  {getTrainingTip(weather).tip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ===== PREVISÃO PRÓXIMOS DIAS ===== */}
        {forecast.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #03045E 0%, #00B4B8 100%)",
              width: "360px",
              maxWidth: "100%",
              padding: "28px",
              borderRadius: "20px",
              boxShadow: "0 4px 15px rgba(3,4,98,0.3)",
              color: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              transition: "transform 0.3s ease",
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-7px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", textAlign: "center", margin: 0, opacity: 0.9 }}>
              📅 Próximos Dias
            </h3>

            {forecast.map((day) => (
              <div
                key={day.date}
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              >
                {/* Day & emoji */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "48px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase" }}>{day.dayName}</span>
                  <span style={{ fontSize: "28px", marginTop: "2px" }}>{getWeatherEmoji(day.main)}</span>
                </div>

                {/* Temps */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{ fontSize: "20px", fontWeight: 700 }}>{day.temp_max}°</span>
                    <span style={{ fontSize: "14px", opacity: 0.6 }}>{day.temp_min}°</span>
                  </div>
                  <span style={{ fontSize: "11px", textTransform: "capitalize", opacity: 0.8 }}>{day.description}</span>
                </div>

                {/* Extra info */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", fontSize: "11px", opacity: 0.75 }}>
                  {day.pop > 0 && <span>🌧️ {day.pop}%</span>}
                  <span>💧 {day.humidity}%</span>
                  <span>🍃 {day.wind} km/h</span>
                </div>
              </div>
            ))}
          </div>
        )}

        </div>
      </div>
    </section>
  );
};

export default WeatherSection;
