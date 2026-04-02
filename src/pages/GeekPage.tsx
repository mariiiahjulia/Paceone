import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Film, Tv, Sparkles, Star } from "lucide-react";

const recommendations = {
  filmes: [
    {
      title: "Spirit of the Marathon",
      year: "2007",
      desc: "Documentário que acompanha seis corredores se preparando para a Maratona de Chicago. Histórias reais e inspiradoras.",
      rating: 4.5,
    },
    {
      title: "McFarland, USA",
      year: "2015",
      desc: "Baseado em fatos reais, um treinador transforma um grupo de jovens latinos em uma equipe campeã de cross-country.",
      rating: 4.3,
    },
    {
      title: "Brittany Runs a Marathon",
      year: "2019",
      desc: "Uma jovem transforma sua vida ao decidir correr a Maratona de Nova York. Comédia dramática tocante.",
      rating: 4.0,
    },
    {
      title: "Chariots of Fire",
      year: "1981",
      desc: "Clássico vencedor do Oscar sobre dois atletas britânicos competindo nas Olimpíadas de 1924.",
      rating: 4.6,
    },
    {
      title: "Free to Run",
      year: "2016",
      desc: "Documentário sobre a história da corrida como esporte popular e a luta pela igualdade de gênero no atletismo.",
      rating: 4.2,
    },
  ],
  series: [
    {
      title: "The Speed Project",
      year: "2019",
      desc: "Série documental sobre a ultramaratona de revezamento não oficial de Los Angeles a Las Vegas.",
      rating: 4.4,
    },
    {
      title: "Losers",
      year: "2019",
      desc: "Série Netflix que explora histórias de atletas que encontraram sentido além da vitória. Episódios sobre corredores.",
      rating: 4.1,
    },
    {
      title: "Skid Row Marathon",
      year: "2017",
      desc: "Juiz criminal forma grupo de corrida com moradores de rua. Transformação através do esporte.",
      rating: 4.3,
    },
    {
      title: "Running Wild",
      year: "2020",
      desc: "Série sobre ultramaratonistas que encaram as corridas mais extremas do mundo em paisagens épicas.",
      rating: 4.0,
    },
  ],
  animes: [
    {
      title: "Run with the Wind",
      year: "2018",
      desc: "Kaze ga Tsuyoku Fuiteiru — 10 universitários se preparam para a Hakone Ekiden, a corrida de revezamento mais famosa do Japão. Obra-prima.",
      rating: 4.9,
    },
    {
      title: "Yowamushi Pedal",
      year: "2013",
      desc: "Otaku descobre talento natural para ciclismo de estrada. Ação, superação e estratégia em corridas de bicicleta.",
      rating: 4.3,
    },
    {
      title: "Stride: Alternative",
      year: "2016",
      desc: "Prince of Stride — Esporte fictício de revezamento urbano com corrida, parkour e estratégia. Visual impactante.",
      rating: 3.8,
    },
    {
      title: "Suzume no Tojimari",
      year: "2022",
      desc: "Embora não seja sobre corrida, Makoto Shinkai captura a energia do movimento e da jornada como ninguém.",
      rating: 4.5,
    },
    {
      title: "Ao Ashi",
      year: "2022",
      desc: "Embora sobre futebol, trata profundamente de resistência, disciplina tática e evolução física — temas centrais do endurance.",
      rating: 4.4,
    },
  ],
};

const categoryConfig = {
  filmes: { icon: Film, label: "FILMES", color: "text-primary" },
  series: { icon: Tv, label: "SÉRIES", color: "text-pace-light" },
  animes: { icon: Sparkles, label: "ANIMES", color: "text-yellow-400" },
};

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-3 h-3 ${star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
      />
    ))}
    <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
  </div>
);

const GeekPage = () => {
  const ref = useScrollReveal();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16" ref={ref}>
        <div className="container">
          <p className="section-heading mb-3">CULTURA RUNNER</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            GEEK ZONE
          </h1>
          <p className="text-muted-foreground max-w-lg mb-12">
            Filmes, séries e animes que todo corredor precisa assistir. Inspiração além das pistas.
          </p>

          {(Object.entries(recommendations) as [keyof typeof recommendations, typeof recommendations.filmes][]).map(
            ([category, items]) => {
              const config = categoryConfig[category];
              const Icon = config.icon;

              return (
                <div key={category} className="mb-14">
                  <h2 className={`font-display text-xl font-bold tracking-wider mb-6 flex items-center gap-3 ${config.color}`}>
                    <Icon className="w-5 h-5" />
                    {config.label}
                  </h2>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item, i) => (
                      <div
                        key={i}
                        className="card-surface p-6 group hover:border-primary/30 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display font-bold text-sm">{item.title}</h3>
                            <span className="text-xs text-muted-foreground">{item.year}</span>
                          </div>
                          <RatingStars rating={item.rating} />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GeekPage;
