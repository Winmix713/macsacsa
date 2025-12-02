import { Fragment, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { navigationConfig, type NavigationSection, type NavigationItem } from "@/config/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider";

interface RoleAwareNavProps {
  sections?: NavigationSection[];
}

const RoleAwareNav = ({ sections = navigationConfig }: RoleAwareNavProps) => {
  const { profile } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const location = useLocation();
  const sidebar = useSidebar();

  const role = profile?.role ?? "user";

  const visibleSections = useMemo(() => {
    const allowItem = (item: NavigationItem) => {
      const roleAllowed = !item.roles || item.roles.includes(role);
      const featureAllowed = !item.featureFlag || isEnabled(item.featureFlag);
      return roleAllowed && featureAllowed;
    };

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(allowItem),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, role, isEnabled]);

  const isItemActive = (item: NavigationItem) => {
    if (item.exact) {
      return location.pathname === item.href;
    }

    if (item.href === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(item.href);
  };

  const handleNavigate = () => {
    if (sidebar.isMobile) {
      sidebar.setOpenMobile(false);
    }
  };

  return (
    <>
      {visibleSections.map((section, sectionIndex) => (
        <Fragment key={section.key}>
          <SidebarGroup>
            {section.title ? (
              <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = isItemActive(item);

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        asChild
                        size="lg"
                        tooltip={item.title}
                        isActive={active}
                        onClick={handleNavigate}
                      >
                        <Link to={item.href} className="flex w-full items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="flex flex-col items-start">
                            <span className="text-sm font-medium leading-tight">{item.title}</span>
                            {item.description ? (
                              <span className="text-xs text-muted-foreground">{item.description}</span>
                            ) : null}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge ? (
                        <SidebarMenuBadge className="bg-primary/10 text-primary">
                          {item.badge}
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {sectionIndex < visibleSections.length - 1 ? <SidebarSeparator className="my-1" /> : null}
        </Fragment>
      ))}
    </>
  );
};

export default RoleAwareNav;
