import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Calendar, MapPin, Route, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const mockEvents = [
  { id: 1, name: "PACEONE São Paulo Marathon", city: "São Paulo", date: "2026-05-17", distances: ["5K", "10K", "21K", "42K"], price: 189, spots: 120 },
  { id: 2, name: "Night Run Rio", city: "Rio de Janeiro", date: "2026-06-08", distances: ["5K", "10K"], price: 99, spots: 340 },
  { id: 3, name: "PACEONE Curitiba Half", city: "Curitiba", date: "2026-07-12", distances: ["10K", "21K"], price: 149, spots: 85 },
  { id: 4, name: "BH Ultra Endurance", city: "Belo Horizonte", date: "2026-08-23", distances: ["21K", "42K", "Ultra"], price: 249, spots: 42 },
  { id: 5, name: "PACEONE Floripa Sprint", city: "Florianópolis", date: "2026-09-06", distances: ["5K", "10K"], price: 79, spots: 500 },
  { id: 6, name: "Brasília Capital Run", city: "Brasília", date: "2026-06-21", distances: ["5K", "10K", "21K"], price: 129, spots: 250 },
  { id: 7, name: "Porto Alegre Night Race", city: "Porto Alegre", date: "2026-07-26", distances: ["5K", "10K"], price: 89, spots: 180 },
  { id: 8, name: "PACEONE Salvador Beach Run", city: "Salvador", date: "2026-08-09", distances: ["5K", "10K", "21K"], price: 119, spots: 200 },
  { id: 9, name: "Recife Duathlon Challenge", city: "Recife", date: "2026-09-20", distances: ["10K", "21K"], price: 159, spots: 150 },
  { id: 10, name: "Manaus Jungle Ultra", city: "Manaus", date: "2026-10-11", distances: ["42K", "Ultra"], price: 299, spots: 60 },
  { id: 11, name: "PACEONE Goiânia Speed", city: "Goiânia", date: "2026-10-25", distances: ["5K", "10K"], price: 69, spots: 400 },
  { id: 12, name: "Vitória Sunrise Marathon", city: "Vitória", date: "2026-11-08", distances: ["10K", "21K", "42K"], price: 179, spots: 100 },
];

const cities = ["Todas", ...new Set(mockEvents.map((e) => e.city))];

const CompeticoesPage = () => {
  const [cityFilter, setCityFilter] = useState("Todas");
  const [showRegistration, setShowRegistration] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", distance: "", payment: "PIX" });
  const [submitting, setSubmitting] = useState(false);
  const { user, profile } = useAuth();
  const ref = useScrollReveal();

  const filtered = cityFilter === "Todas" ? mockEvents : mockEvents.filter((e) => e.city === cityFilter);

  const openRegistration = (eventId: number) => {
    const event = mockEvents.find((e) => e.id === eventId);
    setFormData({
      name: profile?.full_name || "",
      email: user?.email || "",
      distance: event?.distances[0] || "",
      payment: "PIX",
    });
    setShowRegistration(eventId);
    setConfirmed(null);
  };

  const handleSubmit = async (event: typeof mockEvents[0]) => {
    if (!formData.name || !formData.email || !formData.distance) {
      toast.error("Preencha todos os campos");
      return;
    }

    setSubmitting(true);

    if (user) {
      await supabase.from("competition_registrations").insert({
        user_id: user.id,
        event_name: event.name,
        distance: formData.distance,
        full_name: formData.name,
        email: formData.email,
        payment_method: formData.payment,
      });
    }

    setSubmitting(false);
    setConfirmed(event.id);
    toast.success("Inscrição confirmada!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16" ref={ref}>
        <div className="container">
          <p className="section-heading mb-3">EVENTOS</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            COMPETIÇÕES
          </h1>
          <p className="text-muted-foreground mb-8">{mockEvents.length} provas disponíveis em {cities.length - 1} cidades</p>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setCityFilter(c)}
                className={`px-4 py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition-all duration-200 active:scale-[0.97] ${
                  cityFilter === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Events */}
          <div className="space-y-4">
            {filtered.map((event) => (
              <div key={event.id} className="card-surface p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold mb-3">{event.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.city}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.date).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Route className="w-3.5 h-3.5" />
                        {event.distances.join(" · ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="stat-value text-2xl">R${event.price}</div>
                      <div className="text-xs text-muted-foreground">{event.spots} vagas</div>
                    </div>
                    {confirmed === event.id ? (
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-display font-bold text-sm">INSCRITO</span>
                      </div>
                    ) : (
                      <Button variant="hero" size="lg" onClick={() => openRegistration(event.id)}>
                        REGISTER NOW
                      </Button>
                    )}
                  </div>
                </div>

                {/* Registration form */}
                {showRegistration === event.id && confirmed !== event.id && (
                  <div className="mt-6 pt-6 border-t border-border/50 animate-reveal">
                    <h4 className="font-display font-bold mb-4">INSCRIÇÃO — {event.name}</h4>
                    <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Nome completo</label>
                        <input
                          className="w-full bg-muted/30 border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Seu nome"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">E-mail</label>
                        <input
                          className="w-full bg-muted/30 border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="email@exemplo.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Distância</label>
                        <select
                          className="w-full bg-muted/30 border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          value={formData.distance}
                          onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        >
                          {event.distances.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Pagamento</label>
                        <select
                          className="w-full bg-muted/30 border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          value={formData.payment}
                          onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                        >
                          <option>PIX</option>
                          <option>Cartão de Crédito</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button variant="hero" size="lg" onClick={() => handleSubmit(event)} disabled={submitting}>
                        {submitting ? "PROCESSANDO..." : "CONFIRMAR INSCRIÇÃO"}
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => setShowRegistration(null)}>
                        CANCELAR
                      </Button>
                    </div>
                  </div>
                )}

                {/* Confirmation */}
                {confirmed === event.id && showRegistration === event.id && (
                  <div className="mt-6 pt-6 border-t border-border/50 animate-reveal">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-display font-bold text-lg">INSCRIÇÃO CONFIRMADA!</h4>
                        <p className="text-sm text-muted-foreground">Você está inscrito na {event.name}</p>
                      </div>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-4 max-w-md space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Atleta</span><span className="font-semibold">{formData.name}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Distância</span><span className="font-semibold">{formData.distance}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Pagamento</span><span className="font-semibold">{formData.payment}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Valor</span><span className="font-semibold text-primary">R${event.price}</span></div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowRegistration(null)}>
                      FECHAR
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompeticoesPage;
