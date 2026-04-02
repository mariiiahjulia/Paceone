import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/", label: "HOME" },
  { to: "/atletas", label: "ATLETAS" },
  { to: "/competicoes", label: "COMPETIÇÕES" },
  { to: "/treinos", label: "TREINOS" },
  { to: "/geek", label: "GEEK ZONE" },
];

const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold tracking-[0.15em] text-foreground">
          PACE<span className="text-primary">ONE</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-xs font-semibold tracking-[0.15em] transition-colors duration-200 ${
                location.pathname === l.to
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{profile?.full_name || user.email}</span>
              <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">ENTRAR</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <div className="container py-4 flex flex-col gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`text-xs font-semibold tracking-[0.15em] ${
                  location.pathname === l.to ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="text-xs font-semibold tracking-[0.15em] text-muted-foreground text-left"
              >
                SAIR
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold tracking-[0.15em] text-primary"
              >
                ENTRAR
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
