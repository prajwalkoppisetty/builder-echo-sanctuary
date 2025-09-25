import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3, CheckCircle2, Clock, Gauge, PieChart as PieIcon } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend } from "recharts";
import { getRole, getRegion } from "@/lib/auth";

const COLORS = ["#FF9933", "#138808", "#000080", "#66b3ff", "#ffd166", "#ef476f"];

export default function Dashboard() {
  const [role, setRole] = useState<"citizen" | "officer" | "admin">(() => getRole());
  const [region, setRegion] = useState<string>(() => getRegion());

  // sync with role/region changes from quick login
  useEffect(() => {
    const onRole = (e: any) => setRole(e.detail || getRole());
    const onRegion = (e: any) => setRegion(e.detail || getRegion());
    window.addEventListener("role-change", onRole as any);
    window.addEventListener("region-change", onRegion as any);
    return () => {
      window.removeEventListener("role-change", onRole as any);
      window.removeEventListener("region-change", onRegion as any);
    };
  }, []);

  const stats = useMemo(() => (
    role === "citizen"
      ? [
          { label: "My Complaints", value: 12, icon: Activity },
          { label: "Resolved", value: 8, icon: CheckCircle2 },
          { label: "Pending", value: 4, icon: Clock },
        ]
      : role === "officer"
      ? [
          { label: "Assigned", value: 34, icon: Activity },
          { label: "SLA Breaches", value: 3, icon: Gauge },
          { label: "In Progress", value: 21, icon: Clock },
        ]
      : [
          { label: "Total Complaints", value: 1243, icon: Activity },
          { label: "Satisfaction %", value: 86, icon: PieIcon },
          { label: "Avg Resolution (hrs)", value: 28, icon: BarChart3 },
        ]
  ), [role]);

  const trendData = [
    { name: "Mon", water: 23, roads: 12, waste: 18 },
    { name: "Tue", water: 18, roads: 22, waste: 14 },
    { name: "Wed", water: 28, roads: 25, waste: 19 },
    { name: "Thu", water: 20, roads: 15, waste: 22 },
    { name: "Fri", water: 30, roads: 18, waste: 25 },
    { name: "Sat", water: 26, roads: 20, waste: 21 },
    { name: "Sun", water: 18, roads: 12, waste: 15 },
  ];

  const pieData = [
    { name: "Roads", value: 34 },
    { name: "Water", value: 28 },
    { name: "Electricity", value: 16 },
    { name: "Waste", value: 22 },
  ];

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "hsl(var(--navy))" }}>Dashboard</h1>
        <div className="text-sm text-muted-foreground">Role: <span className="font-medium capitalize">{role}</span>{region ? ` • ${region}` : ""}</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
              </div>
              <s.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-primary/5" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-2"><span className="font-semibold">Complaint Categories (Weekly)</span></div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="water" stroke="#138808" strokeWidth={2} />
                <Line type="monotone" dataKey="roads" stroke="#FF9933" strokeWidth={2} />
                <Line type="monotone" dataKey="waste" stroke="#000080" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="font-semibold mb-2">Satisfaction Score</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between"><span className="font-semibold">SLA Performance</span></div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="water" fill="#66bb6a" name="On-time" />
              <Bar dataKey="roads" fill="#ffa726" name="Delayed" />
              <Bar dataKey="waste" fill="#29b6f6" name="Escalated" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
