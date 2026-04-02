import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Zap, Target, Crown, Star } from "lucide-react";

const levels = [
  {
    name: "ROOKIE",
    subtitle: "O início da jornada",
    xp: "0 - 500 XP",
    progress: 100,
    icon: Star,
    color: "text-muted-foreground",
    barColor: "bg-muted-foreground",
  },
  {
    name: "STRIDER",
    subtitle: "Velocidade em construção",
    xp: "500 - 2.000 XP",
    progress: 65,
    icon: Zap,
    color: "text-pace-light",
    barColor: "bg-pace-light",
  },
  {
    name: "ENDURANCE MASTER",
    subtitle: "Resistência inabalável",
    xp: "2.000 - 5.000 XP",
    progress: 30,
    icon: Target,
    color: "text-primary",
    barColor: "bg-primary",
  },
  {
    name: "LEGEND",
    subtitle: "Além dos limites",
    xp: "5.000+ XP",
    progress: 10,
    icon: Crown,
    color: "text-yellow-400",
    barColor: "bg-yellow-400",
  },
];

const LevelSystemSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="py-24" ref={ref}>
      <div className="container">
        <p className="section-heading mb-3">PROGRESSÃO</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
          LEVEL SYSTEM
        </h2>
        <p className="text-muted-foreground max-w-lg mb-12">
          Evolua sua classificação completando provas e alcançando metas. Cada corrida conta para sua progressão.
        </p>

        <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
          {levels.map((level, i) => {
            const Icon = level.icon;
            return (
              <div
                key={level.name}
                className="card-surface p-6 group hover:border-primary/30 transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-muted/50 ${level.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-display font-bold tracking-wider text-sm ${level.color}`}>
                      {level.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{level.subtitle}</p>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{level.xp}</span>
                    <span>{level.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${level.barColor} rounded-full transition-all duration-1000`}
                      style={{ width: `${level.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LevelSystemSection;
