import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import RoleAwareNav from "@/components/layout/RoleAwareNav";
import { useAuth } from "@/hooks/useAuth";

const AppSidebar = () => {
  const { profile } = useAuth();

  const initials = (() => {
    const source = profile?.full_name ?? profile?.email ?? "WT";
    return source
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  })();

  const roleLabel = profile?.role ?? "user";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-background/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      <SidebarHeader className="border-b border-border/40 px-2 py-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-muted/70"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/30">
              WT
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-foreground">WinMix</span>
              <span className="text-xs text-muted-foreground">TipsterHub</span>
            </div>
          </Link>
          <SidebarTrigger className="hidden h-9 w-9 rounded-full border border-border/50 bg-card/50 backdrop-blur md:inline-flex" />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-1 py-3">
        <RoleAwareNav />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 px-3 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 ring-1 ring-border/40">
          <Avatar className="h-10 w-10 border border-border/40 bg-background/60">
            <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-foreground">
              {profile?.full_name ?? profile?.email ?? "Vendég"}
            </span>
            <Badge variant="outline" className="w-fit border-primary/30 text-[11px] uppercase tracking-wide text-primary">
              {roleLabel}
            </Badge>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
