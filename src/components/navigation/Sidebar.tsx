import React from "react";
import { NavLink } from "react-router-dom";
import { usePhaseFlags } from "@/hooks/usePhaseFlags";
import { useAuth } from "@/hooks/useAuth"; 
import { 
  Home, 
  Users, 
  Calendar as CalendarIcon, 
  Trophy, 
  Settings, 
  Sparkles, 
  Clock, 
  Brain, 
  LayoutDashboard, 
  ListChecks, 
  LineChart, 
  FlaskConical, 
  Network, 
  Activity, 
  Shield, 
  Key, 
  Bot, 
  Gauge 
} from "lucide-react";

// Helper komponens az ikonokhoz
type IconType = React.ComponentType<{ className?: string }>

const linkBase = "h-11 w-11 grid place-items-center rounded-xl transition-all";
const activeClasses = "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40";
const inactiveClasses = "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30";

function NavIconLink({ to, Icon }: { to: string; Icon: IconType }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${linkBase} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {({ isActive }) => (
        <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
      )}
    </NavLink>
  );
}

const Sidebar = () => {
  const { isPhase5Enabled, isPhase6Enabled, isPhase7Enabled, isPhase8Enabled, isPhase9Enabled } = usePhaseFlags();
  const { profile } = useAuth(); 

  // Egyszerű jogosultság ellenőrzés a profile.role string alapján
  // Nem használunk hasAnyRole függvényt, így nem lesz hiba
  const isAdminOrAnalyst = profile?.role === 'admin' || profile?.role === 'analyst';

  return (
    <aside className="hidden md:flex flex-col w-[84px] h-full justify-between py-6 border-r border-border bg-background/50 backdrop-blur">
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Logo */}
        <NavLink to="/" className="group">
          <div className="h-9 w-9 rounded-xl bg-card ring-1 ring-border grid place-items-center text-primary text-[10px] font-semibold tracking-tight hover:ring-primary/30 transition-all">
            WT
          </div>
        </NavLink>

        {/* Menu Items */}
        <div className="mt-4 flex flex-col items-center gap-3 w-full px-2">
          <NavIconLink to="/" Icon={Home} />
          <NavIconLink to="/dashboard" Icon={LayoutDashboard} />
          <NavIconLink to="/analytics" Icon={LineChart} />
          <NavIconLink to="/ai-chat" Icon={Bot} />

          {/* Phase 5: Pattern Detection */}
          {isPhase5Enabled && <NavIconLink to="/patterns" Icon={Shield} />}

          <NavIconLink to="/predictions/new" Icon={Sparkles} />
          <NavIconLink to="/predictions" Icon={ListChecks} />
          <NavIconLink to="/teams" Icon={Users} />
          <NavIconLink to="/matches" Icon={CalendarIcon} />
          
          {/* Phase 6: Models */}
          {isPhase6Enabled && <NavIconLink to="/models" Icon={FlaskConical} />}

          {/* Phase 7: Cross-League Intelligence */}
          {isPhase7Enabled && <NavIconLink to="/crossleague" Icon={Network} />}

          {/* Phase 8: Monitoring */}
          {isPhase8Enabled && <NavIconLink to="/monitoring" Icon={Activity} />}

          <NavIconLink to="/leagues" Icon={Trophy} />

          {/* Phase 9: Collaborative Market Intelligence */}
          {isPhase9Enabled && <NavIconLink to="/phase9" Icon={Brain} />}

          {/* ------------------------------------------------------------------ */}
          {/* ADMIN SECTION (Csak admin/elemző látja)                            */}
          {/* ------------------------------------------------------------------ */}
          {isAdminOrAnalyst && (
            <>
              <div className="w-10 h-px bg-border my-2" />

              <NavIconLink to="/admin" Icon={Shield} /> {/* Fő admin link */}
              
              {/* Ez a link minden adminnak/elemzőnek megjelenik */}
              <NavIconLink to="/jobs" Icon={Clock} />

              {(isPhase5Enabled || isPhase6Enabled || isPhase7Enabled || isPhase8Enabled) && (
                <NavIconLink to="/admin/jobs" Icon={Clock} />
              )}

              {(isPhase6Enabled || isPhase8Enabled) && (
                <NavIconLink to="/admin/models" Icon={FlaskConical} />
              )}

              {isPhase8Enabled && (
                <>
                  <NavIconLink to="/admin/matches" Icon={CalendarIcon} />
                  <NavIconLink to="/admin/monitoring" Icon={Activity} />
                </>
              )}

              <NavIconLink to="/admin/model-status" Icon={Gauge} />
              <NavIconLink to="/admin/environment" Icon={Key} />
            </>
          )}
        </div>
      </div>

      {/* Settings / Footer */}
      <div className="px-4 flex justify-center">
        <button className="w-11 h-11 rounded-xl bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30 grid place-items-center transition-all">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;