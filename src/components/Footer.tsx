import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const solutionLinks = [
  { label: "Predikciós motor", href: "/predictions/new" },
  { label: "Élő dashboard", href: "/dashboard" },
  { label: "Modellkönyvtár", href: "/models" },
  { label: "Edge monitor", href: "/monitoring" },
];

const resourceLinks = [
  { label: "Dokumentáció", href: "/docs" },
  { label: "Esettanulmányok", href: "/case-studies" },
  { label: "Termék roadmap", href: "/roadmap" },
  { label: "Status", href: "/status" },
];

const legalLinks = [
  { label: "ÁSZF", href: "/terms" },
  { label: "Adatvédelem", href: "/privacy" },
  { label: "Süti beállítások", href: "/cookies" },
  { label: "Impresszum", href: "/imprint" },
];

const Footer = () => {
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className="ml-0 md:ml-[84px] border-t border-white/10 bg-gradient-to-br from-background via-background/95 to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.5fr,1fr,1fr,1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg text-white shadow-lg shadow-primary/30">
                WM
              </span>
              WinMix TipsterHub
            </Link>
            <p className="mt-4 text-sm text-white/70">
              Prémium AI alapú predikciós platform, amely a sportfogadási döntésekhez modern, adatvezérelt támogatást ad.
            </p>
            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Hírlevél</p>
              <p className="mt-2 text-sm text-white/70">
                Heti tippek, modell frissítések és exkluzív hozzáférés az új funkciókhoz.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email cím
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="name@email.com"
                  required
                  className="h-12 flex-1 rounded-full border-white/20 bg-white/10 text-white placeholder:text-white/50"
                  aria-required="true"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 rounded-full bg-gradient-to-r from-primary via-emerald-500 to-secondary px-6 text-sm font-semibold text-white shadow-primary/40 hover:shadow-lg"
                >
                  Feliratkozás
                </Button>
              </form>
              {subscribed ? (
                <p className="mt-3 text-xs text-primary" role="status">
                  Köszönjük! Az első hírlevelet hamarosan megkapod.
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Megoldások</p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {solutionLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Erőforrások</p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Jog & támogatás</p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Közösség</p>
              <div className="mt-3 flex items-center gap-3">
                {[{
                  href: "https://twitter.com",
                  label: "Twitter közösség",
                  icon: Twitter,
                }, {
                  href: "https://www.linkedin.com",
                  label: "LinkedIn csatorna",
                  icon: Linkedin,
                }, {
                  href: "https://github.com",
                  label: "GitHub fejlesztések",
                  icon: Github,
                }, {
                  href: "https://youtube.com",
                  label: "YouTube workshopok",
                  icon: Youtube,
                }].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:border-white/30 hover:bg-white/20 hover:text-white"
                  >
                    <social.icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-white/60 sm:flex-row">
          <p>© {new Date().getFullYear()} WinMix Tipster. Minden jog fenntartva.</p>
          <div className="flex items-center gap-4">
            <span>Fejlesztve Budapesten</span>
            <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden="true" />
            <span>support@winmix.ai</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
