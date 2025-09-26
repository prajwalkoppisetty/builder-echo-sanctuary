import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getRole, getRegion } from "@/lib/auth";
import {
  BadgeCheck,
  CalendarClock,
  Check,
  Clock3,
  Medal,
  Users,
} from "lucide-react";

const demoSchedules = [
  {
    id: "S-001",
    city: "Vijayawada",
    ward: "12",
    date: "2025-01-10",
    time: "10:00 - 13:00",
    slots: 20,
  },
  {
    id: "S-002",
    city: "Guntur",
    ward: "4",
    date: "2025-01-11",
    time: "14:00 - 17:00",
    slots: 15,
  },
  {
    id: "S-003",
    city: "Visakhapatnam",
    ward: "8",
    date: "2025-01-12",
    time: "09:00 - 12:00",
    slots: 30,
  },
];

const demoRegistrations = [
  {
    id: "V-1001",
    name: "Ananya",
    skills: "First-aid, Telugu",
    status: "Pending",
  },
  {
    id: "V-1002",
    name: "Rahul",
    skills: "Traffic mgmt, Hindi",
    status: "Approved",
  },
];

export default function Volunteers() {
  const [role, setRole] = useState<"citizen" | "officer" | "admin">(() =>
    getRole(),
  );
  const [region] = useState<string>(() => getRegion() || "Andhra Pradesh");

  useEffect(() => {
    const onRole = (e: any) => setRole(e.detail || getRole());
    window.addEventListener("role-change", onRole as any);
    return () => window.removeEventListener("role-change", onRole as any);
  }, []);

  if (role === "admin") {
    return (
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: "hsl(var(--navy))" }}
          >
            Volunteer Management
          </h1>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Registrations
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Skills</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demoRegistrations.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{v.id}</td>
                  <td className="px-4 py-3">{v.name}</td>
                  <td className="px-4 py-3">{v.skills}</td>
                  <td className="px-4 py-3">{v.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        Reject
                      </Button>
                      <Button size="sm" className="gap-1">
                        <Medal className="h-4 w-4" />
                        Badge
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm p-5">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" /> Mobile Help Desk
            Schedules
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {demoSchedules.map((s) => (
              <li key={s.id} className="rounded-xl border p-4 bg-background">
                <div className="font-medium">
                  {s.city} • Ward {s.ward}
                </div>
                <div className="text-sm text-muted-foreground">
                  {s.date} • {s.time}
                </div>
                <div className="text-xs mt-1">Slots: {s.slots}</div>
                <div className="mt-2">
                  <Button size="sm" variant="outline">
                    Manage
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <h1
        className="text-2xl md:text-3xl font-bold"
        style={{ color: "hsl(var(--navy))" }}
      >
        Volunteer With Us
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="text-sm text-muted-foreground">Region: {region}</div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                placeholder="+91"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Skills</label>
              <input
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                placeholder="First-aid, languages, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Availability</label>
              <select className="mt-1 w-full rounded-md border bg-background px-3 py-2">
                {["Weekdays", "Weekends", "Evenings", "Flexible"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Preferred Areas</label>
              <input
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                placeholder="City, ward, landmarks"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button className="gap-2">
              <BadgeCheck className="h-4 w-4" /> Register
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">Recognition</div>
            <ul className="mt-3 text-sm space-y-2">
              <li className="flex items-center gap-2">
                <Medal className="h-4 w-4 text-amber-500" /> Swachh Champion
              </li>
              <li className="flex items-center gap-2">
                <Medal className="h-4 w-4 text-sky-500" /> Traffic Hero
              </li>
              <li className="flex items-center gap-2">
                <Medal className="h-4 w-4 text-emerald-500" /> Community Star
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="font-semibold flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" /> Upcoming Mobile Help
              Desk
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {demoSchedules.slice(0, 2).map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <span>
                    {s.city} • Ward {s.ward} • {s.date}
                  </span>
                  <Button size="sm" variant="outline">
                    Book
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
