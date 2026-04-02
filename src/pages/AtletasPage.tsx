import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Trophy, TrendingUp, MapPin, Medal, Crown, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Athlete {
  id: string;
  name: string;
  city: string;
  performance: number;
  times: Record<string, string>;
  provas: number;
  goal: string;
  isReal?: boolean;
}

const mockAthletes: Athlete[] = [
  { id: "m1", name: "Lucas Martins", city: "São Paulo, SP", performance: 94.2, times: { "5K": "16:42", "10K": "34:18", "21K": "1:14:30", "42K": "2:38:15" }, provas: 47, goal: "42k" },
  { id: "m2", name: "Ana Ferreira", city: "Rio de Janeiro, RJ", performance: 95.1, times: { "5K": "17:55", "10K": "36:40", "21K": "1:18:22", "42K": "2:49:05" }, provas: 62, goal: "42k" },
  { id: "m3", name: "Pedro Almeida", city: "Belo Horizonte, MG", performance: 87.8, times: { "5K": "17:10", "10K": "35:45", "21K": "1:16:55", "42K": "2:42:30" }, provas: 34, goal: "21k" },
  { id: "m4", name: "Camila Santos", city: "Curitiba, PR", performance: 90.6, times: { "5K": "18:20", "10K": "37:50", "21K": "1:21:10", "42K": "2:55:40" }, provas: 51, goal: "21k" },
  { id: "m5", name: "Rafael Oliveira", city: "Brasília, DF", performance: 91.3, times: { "5K": "16:55", "10K": "34:50", "21K": "1:15:20", "42K": "2:40:10" }, provas: 39, goal: "42k" },
  { id: "m6", name: "Juliana Costa", city: "Porto Alegre, RS", performance: 88.5, times: { "5K": "19:10", "10K": "39:20", "21K": "1:25:45", "42K": "—" }, provas: 28, goal: "21k" },
  { id: "m7", name: "Thiago Nascimento", city: "Salvador, BA", performance: 85.2, times: { "5K": "18:45", "10K": "38:30", "21K": "1:23:00", "42K": "—" }, provas: 22, goal: "10k" },
  { id: "m8", name: "Mariana Ribeiro", city: "Florianópolis, SC", performance: 92.7, times: { "5K": "17:30", "10K": "36:10", "21K": "1:17:55", "42K": "2:46:30" }, provas: 56, goal: "42k" },
  { id: "m9", name: "Felipe Souza", city: "Recife, PE", performance: 83.4, times: { "5K": "19:50", "10K": "40:15", "21K": "—", "42K": "—" }, provas: 15, goal: "10k" },
  { id: "m10", name: "Beatriz Lima", city: "Goiânia, GO", performance: 86.9, times: { "5K": "20:05", "10K": "41:30", "21K": "1:30:00", "42K": "—" }, provas: 19, goal: "21k" },
  { id: "m11", name: "Diego Fernandes", city: "Manaus, AM", performance: 79.1, times: { "5K": "21:30", "10K": "44:00", "21K": "—", "42K": "—" }, provas: 8, goal: "5k" },
  { id: "m12", name: "Carolina Mendes", city: "Vitória, ES", performance: 89.3, times: { "5K": "18:00", "10K": "37:15", "21K": "1:20:40", "42K": "2:52:20" }, provas: 43, goal: "42k" },
];

const AtletasPage = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [allAthletes, setAllAthletes] = useState<Athlete[]>([]);
  const { user } = useAuth();
  const ref = useScrollReveal();

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) {
        setAllAthletes(mockAthletes);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, city, goal, best_5k, best_10k, best_21k, best_42k, experience");

      const realAthletes: Athlete[] = (data || []).map((p) => ({
        id: p.user_id,
        name: p.full_name || "Atleta PACEONE",
        city: p.city || "Brasil",
        performance: p.experience === "avancado" ? 88 + Math.random() * 10 : p.experience === "intermediario" ? 70 + Math.random() * 15 : 50 + Math.random() * 20,
        times: { "5K": p.best_5k || "—", "10K": p.best_10k || "—", "21K": p.best_21k || "—", "42K": p.best_42k || "—" },
        provas: Math.floor(Math.random() * 10),
        goal: p.goal || "5k",
        isReal: true,
      }));

      // Merge real + mock, deduplicate
      const realIds = new Set(realAthletes.map((a) => a.id));
      const combined = [...realAthletes, ...mockAthletes.filter((m) => !realIds.has(m.id))];
      setAllAthletes(combined);
    };

    fetchProfiles();
  }, [user]);

  // Sort by performance for ranking
  const ranked = [...allAthletes].sort((a, b) => b.performance - a.performance);
  const selectedAthlete = ranked.find((a) => a.id === selected);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (index === 1) return <Medal className="w-4 h-4 text-gray-300" />;
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16" ref={ref}>
        <div className="container">
          <p className="section-heading mb-3">RANKING</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            ATLETAS
          </h1>
          <p className="text-muted-foreground mb-12">
            {ranked.length} atletas registrados · Classificados por índice de performance
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Athletes list with ranking */}
            <div className="lg:col-span-1 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              {ranked.map((a, index) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                  className={`w-full text-left card-surface p-4 transition-all duration-200 active:scale-[0.98] ${
                    selected === a.id ? "border-primary/50 glow-royal" : "hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 text-center flex-shrink-0">
                      {getRankIcon(index) || (
                        <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary text-sm flex-shrink-0">
                      {a.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-sm truncate">
                        {a.name}
                        {a.isReal && (
                          <span className="ml-2 text-[10px] font-normal text-primary bg-primary/10 px-1.5 py-0.5 rounded">NOVO</span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {a.city}
                      </p>
                    </div>
                    <div className="ml-auto text-right flex-shrink-0">
                      <div className="font-display font-bold text-primary text-sm">{a.performance.toFixed(1)}%</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{a.goal}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-2">
              {selectedAthlete ? (
                <div className="card-surface p-8 animate-reveal">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary text-xl">
                      {selectedAthlete.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold">{selectedAthlete.name}</h2>
                      <p className="text-muted-foreground text-sm">{selectedAthlete.city}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-xs text-muted-foreground mb-1">RANKING</div>
                      <div className="font-display font-bold text-2xl text-primary">
                        #{ranked.findIndex((a) => a.id === selectedAthlete.id) + 1}
                      </div>
                    </div>
                  </div>

                  <p className="section-heading mb-4">TEMPOS PESSOAIS</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {Object.entries(selectedAthlete.times).map(([dist, time]) => (
                      <div key={dist} className="bg-muted/30 rounded-lg p-4 text-center">
                        <div className="text-xs text-muted-foreground mb-1">{dist}</div>
                        <div className="stat-value text-xl">{time}</div>
                      </div>
                    ))}
                  </div>

                  <p className="section-heading mb-4">ESTATÍSTICAS</p>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <Trophy className="w-4 h-4 text-primary mx-auto mb-2" />
                      <div className="stat-value text-xl">#{ranked.findIndex((a) => a.id === selectedAthlete.id) + 1}</div>
                      <div className="text-xs text-muted-foreground">Geral</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <TrendingUp className="w-4 h-4 text-primary mx-auto mb-2" />
                      <div className="stat-value text-xl">{selectedAthlete.provas}</div>
                      <div className="text-xs text-muted-foreground">Provas</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <Target className="w-4 h-4 text-primary mx-auto mb-2" />
                      <div className="stat-value text-xl uppercase">{selectedAthlete.goal}</div>
                      <div className="text-xs text-muted-foreground">Objetivo</div>
                    </div>
                  </div>

                  <p className="section-heading mb-2">ÍNDICE DE PERFORMANCE</p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${selectedAthlete.performance}%` }} />
                  </div>
                  <div className="text-right mt-1">
                    <span className="font-display font-bold text-primary">{selectedAthlete.performance.toFixed(1)}%</span>
                  </div>
                </div>
              ) : (
                <div className="card-surface p-16 flex items-center justify-center text-muted-foreground">
                  <p>Selecione um atleta para ver os detalhes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AtletasPage;
