import React from 'react';
import { NavLink } from 'react-router-dom';
import { usePhaseFlags } from '@/hooks/usePhaseFlags';
import { RoleGuard } from '@/features/auth/guards';
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
  Gauge,
  Radar,
} from 'lucide-react';

type IconType = React.ComponentType<{ className?: string }>;

const linkBase = 'h-11 w-11 grid place-items-center rounded-xl transition-all';
const activeClasses = 'bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40';
const inactiveClasses = 'bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30';

interface NavIconLinkProps {
  to: string;
  Icon: IconType;
  label: string;
}

function NavIconLink({ to, Icon, label }: NavIconLinkProps) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      title={label}
      className={({ isActive }) => `${linkBase} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {({ isActive }) => <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
    </NavLink>
  );
}

const AppSidebar = () => {
  const { isPhase5Enabled, isPhase6Enabled, isPhase7Enabled, isPhase8Enabled, isPhase9Enabled } = usePhaseFlags();
  const adminScope = RoleGuard.useGuard({ allowedRoles: ['admin', 'analyst'], notify: false });
  const adminOnlyScope = RoleGuard.useGuard({ allowedRoles: ['admin'], notify: false });

  const showAdminSection = !adminScope.loading && adminScope.canAccess;
  const showAdminOnlyLinks = !adminOnlyScope.loading && adminOnlyScope.canAccess;

  return (
    <aside className="hidden md:flex flex-col w-[84px] h-full justify-between py-6 border-r border-border bg-background/50 backdrop-blur">
      <div className="flex flex-col items-center gap-4 w-full">
        <NavLink to="/" className="group" aria-label="Home">
          <div className="h-9 w-9 rounded-xl bg-card ring-1 ring-border grid place-items-center text-primary text-[10px] font-semibold tracking-tight hover:ring-primary/30 transition-all">
            WT
          </div>
        </NavLink>

        <div className="mt-4 flex flex-col items-center gap-3 w-full px-2">
          <NavIconLink to="/" Icon={Home} label="Landing" />
          <NavIconLink to="/dashboard" Icon={LayoutDashboard} label="Dashboard" />
          <NavIconLink to="/analytics" Icon={LineChart} label="Analytics" />
          <NavIconLink to="/ai-chat" Icon={Bot} label="AI Chat" />

          {isPhase5Enabled && <NavIconLink to="/patterns" Icon={Shield} label="Pattern Detection" />}

          <NavIconLink to="/predictions/new" Icon={Sparkles} label="New Predictions" />
          <NavIconLink to="/predictions" Icon={ListChecks} label="Predictions" />
          <NavIconLink to="/teams" Icon={Users} label="Teams" />
          <NavIconLink to="/matches" Icon={CalendarIcon} label="Matches" />

          {isPhase6Enabled && <NavIconLink to="/models" Icon={FlaskConical} label="Models" />}
          {isPhase7Enabled && <NavIconLink to="/crossleague" Icon={Network} label="Cross League" />}
          {isPhase8Enabled && <NavIconLink to="/monitoring" Icon={Activity} label="Monitoring" />}

          <NavIconLink to="/leagues" Icon={Trophy} label="Leagues" />
          {isPhase9Enabled && <NavIconLink to="/phase9" Icon={Brain} label="Phase 9" />}

          {showAdminSection && (
            <>
              <div className="w-10 h-px bg-border my-2" />
              <NavIconLink to="/admin" Icon={Shield} label="Admin Dashboard" />
              <NavIconLink to="/jobs" Icon={Clock} label="Scheduled Jobs" />
              <NavIconLink to="/admin/jobs" Icon={Clock} label="Admin Jobs" />
              <NavIconLink to="/admin/models" Icon={FlaskConical} label="Admin Models" />
              {isPhase8Enabled && (
                <>
                  <NavIconLink to="/admin/matches" Icon={CalendarIcon} label="Admin Matches" />
                  <NavIconLink to="/admin/monitoring" Icon={Activity} label="Admin Monitoring" />
                </>
              )}
              <NavIconLink to="/admin/model-status" Icon={Gauge} label="Model Status" />
              {showAdminOnlyLinks && (
                <>
                  <NavIconLink to="/admin/system-overview" Icon={Radar} label="System Overview" />
                  <NavIconLink to="/admin/environment" Icon={Key} label="Environment" />
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="px-4 flex justify-center">
        <button
          type="button"
          className="w-11 h-11 rounded-xl bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30 grid place-items-center transition-all"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
