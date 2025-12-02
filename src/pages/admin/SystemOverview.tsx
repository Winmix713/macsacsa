import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import { Activity, Cpu, Database, ShieldCheck } from "lucide-react";

const SYSTEM_CARDS = [
  {
    id: "uptime",
    title: "Platform Uptime",
    description: "Synthetic health checks across core regions",
    icon: ShieldCheck,
    value: "99.95%",
    subtext: "rolling 30 days",
  },
  {
    id: "jobs",
    title: "Active Pipelines",
    description: "Phase jobs queued vs running",
    icon: Activity,
    value: "12 running",
    subtext: "3 queued",
  },
  {
    id: "models",
    title: "Model Footprint",
    description: "Primary + experiment deployments",
    icon: Cpu,
    value: "8 primary",
    subtext: "5 experiments",
  },
  {
    id: "storage",
    title: "Storage Utilization",
    description: "Warehouse + feature store footprint",
    icon: Database,
    value: "62%",
    subtext: "capacity threshold",
  },
];

const SystemOverviewPage = () => {
  return (
    <AdminLayout
      title="System Overview"
      description="Snapshot of operational health, data pipelines, and ML workloads."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "System Overview" },
      ]}
    >
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {SYSTEM_CARDS.map((card) => (
          <Card key={card.id} className="h-full border-dashed border-border/70 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {card.title}
              </CardTitle>
              <card.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-semibold text-foreground">{card.value}</div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.subtext}</p>
              <p className="text-sm text-muted-foreground/90">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </AdminLayout>
  );
};

export default SystemOverviewPage;
