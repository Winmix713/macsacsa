import { Fragment, useMemo } from "react";
import {
  Link,
  useMatches,
} from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, LogOut, Mail, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider";
import type { AppRouteHandle, RouteAction } from "@/types/router";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  unread?: boolean;
}

const notifications: NotificationItem[] = [
  {
    id: "prediction-ready",
    title: "Új predikció készült",
    description: "A legutóbbi 8 mérkőzés elemzése elérhető.",
    timestamp: "2 perce",
    unread: true,
  },
  {
    id: "phase-update",
    title: "Phase 9 frissítés",
    description: "Új beállítások érhetők el az admin felületen.",
    timestamp: "10 perce",
  },
];

const NotificationDropdown = () => {
  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full border border-border/40 bg-background/60"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-[20px] rounded-full bg-primary px-1 text-[10px]">
              {unreadCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Értesítések</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Minden naprakész.</div>
        ) : (
          notifications.map((item) => (
            <div key={item.id} className="flex flex-col gap-0.5 px-3 py-2">
              <span className="text-sm font-medium text-foreground">
                {item.title}
              </span>
              <span className="text-xs text-muted-foreground">{item.description}</span>
              <span className="text-[11px] text-muted-foreground/80">{item.timestamp}</span>
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserMenu = () => {
  const { user, profile, signOut } = useAuth();
  const initials = useMemo(() => {
    const source = profile?.full_name ?? user?.email ?? "WT";
    return source
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.full_name, user?.email]);

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link to="/login">Belépés</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full px-2 py-1">
          <Avatar className="h-8 w-8 border border-border/40 bg-background/70">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground md:inline-block">
            {profile?.full_name ?? user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              {profile?.full_name ?? user.email}
            </span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <span className="text-[11px] uppercase tracking-wide text-primary">
              {profile?.role ?? "user"}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Saját vezérlőpult
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/predictions" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Predikciók
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void signOut();
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Kijelentkezés
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const mapVariant = (variant?: RouteAction["variant"]) => {
  switch (variant) {
    case "outline":
      return "outline";
    case "secondary":
      return "secondary";
    case "ghost":
      return "ghost";
    default:
      return "default";
  }
};

const GlobalHeader = () => {
  const matches = useMatches<AppRouteHandle>();
  const { profile } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const role = profile?.role ?? "user";

  const breadcrumbs = useMemo(() => {
    const items = matches.flatMap((match) => {
      const handle = match.handle;
      if (!handle || !handle.breadcrumb || handle.hideFromBreadcrumb) {
        return [] as { label: string; href: string }[];
      }

      const label = typeof handle.breadcrumb === "function" ? handle.breadcrumb(match.params) : handle.breadcrumb;
      const href = handle.breadcrumbHref ?? match.pathname ?? match.pathnameBase ?? "/";

      return [{ label, href }];
    });

    if (!items.some((item) => item.href === "/")) {
      items.unshift({ label: "Kezdőlap", href: "/" });
    }

    return items;
  }, [matches]);

  const actions = useMemo(() => {
    const handle = matches[matches.length - 1]?.handle;
    if (!handle?.actions) {
      return [] as RouteAction[];
    }

    return handle.actions.filter((action) => {
      const roleAllowed = !action.roles || action.roles.includes(role);
      const featureAllowed = !action.featureFlag || isEnabled(action.featureFlag);
      return roleAllowed && featureAllowed;
    });
  }, [matches, role, isEnabled]);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/40 bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="h-9 w-9 rounded-full border border-border/60 bg-muted/40" />
        <Breadcrumb>
          <BreadcrumbList className="text-sm">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <Fragment key={`${crumb.href}-${index}`}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast ? <BreadcrumbSeparator /> : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const variant = mapVariant(action.variant);
          const isLink = Boolean(action.to);

          return (
            <Button
              key={action.key}
              variant={variant}
              size="sm"
              asChild={isLink}
              disabled={!isLink}
            >
              {isLink ? (
                <Link to={action.to!} className="flex items-center gap-2">
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span>{action.label}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-2">
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span>{action.label}</span>
                </span>
              )}
            </Button>
          );
        })}
        <NotificationDropdown />
        <ThemeToggle />
        <UserMenu />
      </div>
      <div id="global-toast-slot" className="sr-only" aria-live="polite" aria-atomic="true" />
    </header>
  );
};

export default GlobalHeader;
