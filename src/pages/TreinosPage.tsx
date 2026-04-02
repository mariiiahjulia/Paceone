import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Timer, Flame, TrendingUp, Footprints, Zap, Target, Check, Circle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type GoalKey = "5k" | "10k" | "21k" | "42k";

interface CheckinRecord {
  week_index: number;
  session_index: number;
}

const trainingPlans: Record<GoalKey, { week: string; sessions: { day: string; type: string; desc: string; duration: string }[] }[]> = {
  "5k": [
    {
      week: "Semana 1-2 — Base",
      sessions: [
        { day: "Seg", type: "Easy Run", desc: "Corrida leve 3km em ritmo conversacional", duration: "20min" },
        { day: "Qua", type: "Intervalado", desc: "6x400m com 90s de recuperação", duration: "30min" },
        { day: "Sex", type: "Tempo Run", desc: "2km aquecimento + 2km no ritmo de prova + 1km volta", duration: "25min" },
        { day: "Dom", type: "Long Run", desc: "Corrida contínua 5-6km ritmo confortável", duration: "35min" },
      ],
    },
    {
      week: "Semana 3-4 — Construção",
      sessions: [
        { day: "Seg", type: "Easy Run", desc: "Corrida leve 4km + strides", duration: "25min" },
        { day: "Qua", type: "Intervalado", desc: "8x400m com 75s de recuperação", duration: "35min" },
        { day: "Sex", type: "Fartlek", desc: "30min alternando ritmo forte e moderado", duration: "30min" },
        { day: "Dom", type: "Long Run", desc: "Corrida contínua 7km", duration: "40min" },
      ],
    },
    {
      week: "Semana 5-6 — Afiação",
      sessions: [
        { day: "Seg", type: "Easy Run", desc: "Corrida leve 3km + 6x strides", duration: "20min" },
        { day: "Qua", type: "Race Pace", desc: "3x1km no ritmo de prova com 2min descanso", duration: "30min" },
        { day: "Sex", type: "Shakeout", desc: "Corrida leve 2km + mobilidade", duration: "15min" },
        { day: "Dom", type: "PROVA 5K", desc: "Dia da corrida! Aqueça 10min e entregue tudo", duration: "~25min" },
      ],
    },
  ],
  "10k": [
    {
      week: "Semana 1-2 — Base Aeróbica",
      sessions: [
        { day: "Seg", type: "Easy Run", desc: "Corrida leve 5km", duration: "30min" },
        { day: "Ter", type: "Força", desc: "Treino de fortalecimento + core", duration: "40min" },
        { day: "Qui", type: "Intervalado", desc: "5x800m com 2min recuperação", duration: "40min" },
        { day: "Sáb", type: "Long Run", desc: "Corrida contínua 8-10km", duration: "55min" },
      ],
    },
    {
      week: "Semana 3-4 — Intensidade",
      sessions: [
        { day: "Seg", type: "Recovery Run", desc: "Corrida regenerativa 4km", duration: "25min" },
        { day: "Qua", type: "Tempo Run", desc: "3km aquec. + 5km ritmo de prova + 2km volta", duration: "50min" },
        { day: "Sex", type: "Hill Repeats", desc: "8x200m subida com trote de volta", duration: "35min" },
        { day: "Dom", type: "Long Run", desc: "Corrida contínua 12km", duration: "65min" },
      ],
    },
    {
      week: "Semana 5-6 — Pico & Prova",
      sessions: [
        { day: "Seg", type: "Easy Run", desc: "Corrida leve 5km + strides", duration: "30min" },
        { day: "Qua", type: "Race Pace", desc: "2x3km no ritmo de prova com 3min descanso", duration: "40min" },
        { day: "Sex", type: "Shakeout", desc: "Corrida leve 3km + alongamento", duration: "20min" },
        { day: "Dom", type: "PROVA 10K", desc: "Dia da corrida! Controle o ritmo nos primeiros 5km", duration: "~50min" },
      ],
    },
  ],
  "21k": [
    {
      week: "Semana 1-3 — Fundação",
      sessions: [
        { day: "Seg", type: "Easy Run", desc: "Corrida leve 6-8km", duration: "40min" },
        { day: "Qua", type: "Intervalado", desc: "6x1km com 2min recuperação", duration: "50min" },
        { day: "Sex", type: "Tempo Run", desc: "8km em ritmo de meia maratona", duration: "45min" },
        { day: "Dom", type: "Long Run", desc: "Corrida longa 14-16km", duration: "90min" },
      ],
    },
    {
      week: "Semana 4-6 — Pico",
      sessions: [
        { day: "Seg", type: "Recovery", desc: "Corrida regenerativa 5km + mobilidade", duration: "30min" },
        { day: "Qua", type: "Progressivo", desc: "10km começando leve e terminando em ritmo de prova", duration: "55min" },
        { day: "Sex", type: "Intervalado", desc: "4x2km com 3min recuperação", duration: "55min" },
        { day: "Dom", type: "Long Run", desc: "Corrida longa 18-20km", duration: "120min" },
      ],
    },
  ],
  "42k": [
    {
      week: "Semana 1-4 — Base Sólida",
      sessions: [
        { day: "Seg", type: "Easy Run", desc: "Corrida leve 8-10km", duration: "50min" },
        { day: "Qua", type: "Intervalado", desc: "8x1km com 90s recuperação", duration: "55min" },
        { day: "Sex", type: "Tempo Run", desc: "12km em ritmo de maratona", duration: "60min" },
        { day: "Dom", type: "Long Run", desc: "Corrida longa 22-26km", duration: "150min" },
      ],
    },
    {
      week: "Semana 5-8 — Resistência Máxima",
      sessions: [
        { day: "Seg", type: "Recovery", desc: "Corrida regenerativa 6km + alongamento", duration: "35min" },
        { day: "Qua", type: "Progressivo", desc: "16km com últimos 6km em ritmo de prova", duration: "80min" },
        { day: "Sex", type: "Hill Training", desc: "10km com variações de elevação", duration: "55min" },
        { day: "Dom", type: "Long Run", desc: "Corrida longa 28-32km", duration: "180min" },
      ],
    },
  ],
};

const goalLabels: Record<GoalKey, { title: string; subtitle: string; icon: typeof Timer }> = {
  "5k": { title: "5K", subtitle: "Velocidade & Explosão", icon: Zap },
  "10k": { title: "10K", subtitle: "Ritmo & Resistência", icon: Flame },
  "21k": { title: "21K", subtitle: "Meia Maratona", icon: TrendingUp },
  "42k": { title: "42K", subtitle: "Maratona Completa", icon: Target },
};

const evolutionData: Record<GoalKey, { semana: string; km: number; pace: number }[]> = {
  "5k": [
    { semana: "S1", km: 12, pace: 6.2 }, { semana: "S2", km: 15, pace: 6.0 },
    { semana: "S3", km: 18, pace: 5.7 }, { semana: "S4", km: 20, pace: 5.5 },
    { semana: "S5", km: 18, pace: 5.3 }, { semana: "S6", km: 14, pace: 5.1 },
  ],
  "10k": [
    { semana: "S1", km: 18, pace: 6.5 }, { semana: "S2", km: 22, pace: 6.2 },
    { semana: "S3", km: 28, pace: 5.9 }, { semana: "S4", km: 32, pace: 5.7 },
    { semana: "S5", km: 30, pace: 5.5 }, { semana: "S6", km: 25, pace: 5.3 },
  ],
  "21k": [
    { semana: "S1", km: 30, pace: 6.3 }, { semana: "S2", km: 38, pace: 6.1 },
    { semana: "S3", km: 45, pace: 5.8 }, { semana: "S4", km: 50, pace: 5.6 },
    { semana: "S5", km: 48, pace: 5.4 }, { semana: "S6", km: 40, pace: 5.2 },
  ],
  "42k": [
    { semana: "S1", km: 40, pace: 6.5 }, { semana: "S2", km: 50, pace: 6.2 },
    { semana: "S3", km: 60, pace: 6.0 }, { semana: "S4", km: 65, pace: 5.8 },
    { semana: "S6", km: 70, pace: 5.6 }, { semana: "S7", km: 60, pace: 5.4 },
    { semana: "S8", km: 50, pace: 5.3 },
  ],
};

const TreinosPage = () => {
  const { profile, user } = useAuth();
  const userGoal = (profile?.goal as GoalKey) || "5k";
  const ref = useScrollReveal();
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);

  const plan = trainingPlans[userGoal];
  const goalInfo = goalLabels[userGoal];
  const GoalIcon = goalInfo.icon;
  const chartData = evolutionData[userGoal];

  const totalSessions = plan.reduce((acc, w) => acc + w.sessions.length, 0);
  const completedCount = checkins.length;
  const progressPct = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("training_checkins")
      .select("week_index, session_index")
      .eq("user_id", user.id)
      .eq("goal", userGoal)
      .then(({ data }) => {
        if (data) setCheckins(data);
      });
  }, [user, userGoal]);

  const isChecked = (wi: number, si: number) =>
    checkins.some((c) => c.week_index === wi && c.session_index === si);

  const toggleCheckin = async (wi: number, si: number) => {
    if (!user) return;
    if (isChecked(wi, si)) {
      await supabase
        .from("training_checkins")
        .delete()
        .eq("user_id", user.id)
        .eq("goal", userGoal)
        .eq("week_index", wi)
        .eq("session_index", si);
      setCheckins((prev) => prev.filter((c) => !(c.week_index === wi && c.session_index === si)));
      toast("Sessão desmarcada");
    } else {
      await supabase.from("training_checkins").insert({
        user_id: user.id,
        goal: userGoal,
        week_index: wi,
        session_index: si,
      });
      setCheckins((prev) => [...prev, { week_index: wi, session_index: si }]);
      toast.success("Sessão concluída! 💪");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="card-surface p-12 text-center max-w-md animate-reveal">
            <GoalIcon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-3">PLANO DE TREINO</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Crie sua conta e escolha seu objetivo para acessar um plano de treino personalizado.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="lg">CRIAR CONTA</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16" ref={ref}>
        <div className="container">
          <p className="section-heading mb-3">EVOLUÇÃO</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            PLANO DE TREINO — {goalInfo.title}
          </h1>
          <p className="text-muted-foreground max-w-lg mb-10">
            Bem-vindo, {profile?.full_name || "atleta"}! Seu plano personalizado para conquistar os {goalInfo.title}.
          </p>

          {/* Progress bar */}
          <div className="card-surface p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/15">
                  <GoalIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">{goalInfo.title} — {goalInfo.subtitle}</h2>
                  <p className="text-xs text-muted-foreground">
                    {completedCount} de {totalSessions} sessões concluídas
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Footprints className="w-4 h-4 text-muted-foreground" />
                <span className="font-display font-bold text-2xl text-primary">{progressPct}%</span>
              </div>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Evolution chart */}
          <div className="card-surface p-6 mb-8">
            <h3 className="font-display font-bold text-lg mb-1">CURVA DE EVOLUÇÃO</h3>
            <p className="text-xs text-muted-foreground mb-6">Projeção de volume semanal (km) e pace (min/km)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 30% 18%)" />
                  <XAxis dataKey="semana" stroke="hsl(220 10% 55%)" fontSize={12} />
                  <YAxis yAxisId="km" stroke="hsl(220 10% 55%)" fontSize={12} />
                  <YAxis yAxisId="pace" orientation="right" stroke="hsl(220 10% 55%)" fontSize={12} domain={[4, 7]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220 60% 9%)",
                      border: "1px solid hsl(220 30% 18%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(0 0% 90%)",
                    }}
                  />
                  <Line yAxisId="km" type="monotone" dataKey="km" stroke="hsl(220 100% 50%)" strokeWidth={2} dot={{ fill: "hsl(220 100% 50%)", strokeWidth: 0, r: 4 }} name="Volume (km)" />
                  <Line yAxisId="pace" type="monotone" dataKey="pace" stroke="hsl(220 100% 65%)" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: "hsl(220 100% 65%)", strokeWidth: 0, r: 4 }} name="Pace (min/km)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Training weeks with check-in */}
          <div className="space-y-6">
            {plan.map((week, wi) => {
              const weekCompleted = week.sessions.filter((_, si) => isChecked(wi, si)).length;
              const weekTotal = week.sessions.length;
              return (
                <div key={wi}>
                  <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-primary" />
                    {week.week}
                    <span className="ml-auto text-xs text-muted-foreground font-normal">
                      {weekCompleted}/{weekTotal} concluídas
                    </span>
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {week.sessions.map((s, si) => {
                      const done = isChecked(wi, si);
                      return (
                        <button
                          key={si}
                          onClick={() => toggleCheckin(wi, si)}
                          className={`card-surface p-5 text-left transition-all duration-300 active:scale-[0.97] ${
                            done ? "border-primary/40 bg-primary/5" : "hover:border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                              {s.day}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-primary font-semibold">{s.duration}</span>
                              {done ? (
                                <Check className="w-4 h-4 text-primary" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground/40" />
                              )}
                            </div>
                          </div>
                          <h4 className="font-display font-bold text-sm mb-1.5">{s.type}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TreinosPage;
