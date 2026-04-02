import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const goals = [
  { value: "5k", label: "5K", desc: "Velocidade e explosão" },
  { value: "10k", label: "10K", desc: "Ritmo e resistência" },
  { value: "21k", label: "21K", desc: "Meia maratona" },
  { value: "42k", label: "42K", desc: "Maratona completa" },
];

const experienceLevels = [
  { value: "iniciante", label: "Iniciante", desc: "Estou começando agora" },
  { value: "intermediario", label: "Intermediário", desc: "Já corro regularmente" },
  { value: "avancado", label: "Avançado", desc: "Compito em provas" },
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [goal, setGoal] = useState("5k");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [city, setCity] = useState("");
  const [experience, setExperience] = useState("iniciante");
  const [best5k, setBest5k] = useState("");
  const [best10k, setBest10k] = useState("");
  const [best21k, setBest21k] = useState("");
  const [best42k, setBest42k] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/treinos");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              goal,
              age: age ? parseInt(age) : null,
              weight: weight ? parseFloat(weight) : null,
              city,
              experience,
            },
          },
        });
        if (error) throw error;

        // Update profile with best times after signup
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({
            best_5k: best5k || null,
            best_10k: best10k || null,
            best_21k: best21k || null,
            best_42k: best42k || null,
          }).eq("user_id", user.id);
        }

        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo à PACEONE. Seu plano de treino está pronto.",
        });
        navigate("/treinos");
      }
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-muted/30 border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 flex items-center justify-center">
        <div className="w-full max-w-lg px-4">
          <div className="card-surface p-8 animate-reveal">
            <h1 className="font-display text-2xl font-bold tracking-tight mb-2 text-center">
              {isLogin ? "ENTRAR" : step === 1 ? "CRIAR CONTA" : "PERFIL DE ATLETA"}
            </h1>
            <p className="text-muted-foreground text-sm text-center mb-8">
              {isLogin
                ? "Acesse sua conta PACEONE"
                : step === 1
                ? "Junte-se à comunidade PACEONE"
                : "Complete seu perfil de corredor"}
            </p>

            {!isLogin && step === 2 && (
              <div className="flex gap-2 mb-6">
                <div className="h-1 flex-1 rounded-full bg-primary" />
                <div className="h-1 flex-1 rounded-full bg-primary" />
              </div>
            )}
            {!isLogin && step === 1 && (
              <div className="flex gap-2 mb-6">
                <div className="h-1 flex-1 rounded-full bg-primary" />
                <div className="h-1 flex-1 rounded-full bg-muted" />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isLogin ? (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">E-mail</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@exemplo.com" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Senha</label>
                    <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Mínimo 6 caracteres" />
                  </div>
                </>
              ) : step === 1 ? (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Nome completo</label>
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Seu nome" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">E-mail</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@exemplo.com" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Senha</label>
                    <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Mínimo 6 caracteres" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Idade</label>
                      <input type="number" min={10} max={99} value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} placeholder="28" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Peso (kg)</label>
                      <input type="number" min={30} max={200} step={0.1} value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} placeholder="72.5" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Cidade</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="São Paulo, SP" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-3">Nível de experiência</label>
                    <div className="grid grid-cols-3 gap-2">
                      {experienceLevels.map((lvl) => (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => setExperience(lvl.value)}
                          className={`p-3 rounded-lg border text-center transition-all duration-200 active:scale-[0.97] ${
                            experience === lvl.value
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="font-display font-bold text-xs block">{lvl.label}</span>
                          <span className="text-[10px] leading-tight">{lvl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-3">Seu objetivo principal</label>
                    <div className="grid grid-cols-2 gap-2">
                      {goals.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setGoal(g.value)}
                          className={`p-4 rounded-lg border text-left transition-all duration-200 active:scale-[0.97] ${
                            goal === g.value
                              ? "border-primary bg-primary/10 text-foreground glow-royal"
                              : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="font-display font-bold text-2xl block">{g.label}</span>
                          <span className="text-xs">{g.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-3">Melhores tempos (opcional)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">5K</label>
                        <input type="text" value={best5k} onChange={(e) => setBest5k(e.target.value)} className={inputClass} placeholder="25:30" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">10K</label>
                        <input type="text" value={best10k} onChange={(e) => setBest10k(e.target.value)} className={inputClass} placeholder="52:00" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">21K</label>
                        <input type="text" value={best21k} onChange={(e) => setBest21k(e.target.value)} className={inputClass} placeholder="1:55:00" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">42K</label>
                        <input type="text" value={best42k} onChange={(e) => setBest42k(e.target.value)} className={inputClass} placeholder="4:10:00" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-2">
                {!isLogin && step === 2 && (
                  <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                    VOLTAR
                  </Button>
                )}
                <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={loading}>
                  {loading
                    ? "CARREGANDO..."
                    : isLogin
                    ? "ENTRAR"
                    : step === 1
                    ? "PRÓXIMO"
                    : "CRIAR CONTA"}
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setStep(1);
                }}
                className="text-primary hover:underline font-semibold"
              >
                {isLogin ? "Criar conta" : "Entrar"}
              </button>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthPage;
