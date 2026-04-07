import { useState, useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface WeatherData {
  temp: number;
  description: string;
  humidity: number;
  wind: number;
  city: string;
  main: string;
}

const API_KEY = "44ac8e23bfcbd81b9d3521145559e365";

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

const WeatherSection = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [statusMsg, setStatusMsg] = useState("Aguardando local...");
  const [inputCidade, setInputCidade] = useState("");
  const ref = useScrollReveal();

  const parseWeather = (data: Record<string, unknown>) => {
    const main = data.main as Record<string, number>;
    const wind = data.wind as Record<string, number>;
    const weatherArr = data.weather as Array<Record<string, string>>;
    return {
      temp: Math.round(main.temp),
      description: weatherArr[0].description,
      humidity: main.humidity,
      wind: Math.round(wind.speed * 3.6),
      city: data.name as string,
      main: weatherArr[0].main,
    };
  };

  const buscarClima = async (cidade: string) => {
    setStatusMsg("Procurando cidade...");
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      if (!res.ok) throw new Error("Cidade não encontrada");
      const data = await res.json();
      const parsed = parseWeather(data);
      setWeather(parsed);
      setStatusMsg(parsed.city);
    } catch {
      setStatusMsg("Cidade não encontrada ☹️");
      setWeather(null);
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
        const parsed = parseWeather(data);
        setWeather(parsed);
        setStatusMsg(parsed.city);
      } catch {
        const fallback: WeatherData = { temp: 24, description: "céu limpo", humidity: 55, wind: 12, city: "São Paulo", main: "Clear" };
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

        <div
          style={{
            background: "linear-gradient(135deg, #00B4B8 0%, #03045E 100%)",
            width: "380px",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 4px 15px rgba(3,4,98,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "25px",
            transition: "transform 0.3s ease",
            color: "#ffffff",
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
          <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
            {statusMsg}
          </h2>

          {/* Weather body */}
          {weather && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "80px", marginBottom: "10px", filter: "drop-shadow(0 5px 10px rgba(0,0,0,0.2))" }}>
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
            </div>
          )}

          {/* Footer: humidity & wind */}
          {weather && (
            <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "rgba(3,4,98,0.8)", padding: "15px 20px", borderRadius: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "12px", opacity: 0.8, marginBottom: "5px" }}>💧 Umidade</span>
                <span style={{ fontSize: "16px", fontWeight: 600 }}>{weather.humidity}%</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "12px", opacity: 0.8, marginBottom: "5px" }}>🍃 Vento</span>
                <span style={{ fontSize: "16px", fontWeight: 600 }}>{weather.wind} Km/h</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WeatherSection;
