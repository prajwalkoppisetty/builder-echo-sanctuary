import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, FileVideo, MapPin, Navigation, Search, Send, UploadCloud } from "lucide-react";
import { getRole } from "@/lib/auth";

const demoComplaints = [
  { id: "AP-2025-0001", title: "Pothole near Benz Circle", category: "Roads", ward: "Vijayawada - Ward 12", submittedBy: "citizen.ap01", status: "Open", slaHrs: 48, createdAt: "2025-01-08 10:15" },
  { id: "AP-2025-0002", title: "Water leakage at Dwarakanagar", category: "Water", ward: "Visakhapatnam - Ward 8", submittedBy: "citizen.ap02", status: "Assigned", slaHrs: 24, createdAt: "2025-01-08 09:10" },
  { id: "AP-2025-0003", title: "Streetlight not working, Brodipet", category: "Electricity", ward: "Guntur - Ward 4", submittedBy: "citizen.ap03", status: "In Progress", slaHrs: 36, createdAt: "2025-01-07 19:40" },
  { id: "AP-2025-0004", title: "Garbage overflow, RTC Colony", category: "Waste", ward: "Tirupati - Ward 6", submittedBy: "citizen.ap04", status: "Resolved", slaHrs: 12, createdAt: "2025-01-07 08:25" },
];

export default function Complaints() {
  const [role, setRole] = useState<"citizen" | "officer" | "admin">(() => getRole());
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("Roads");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [coords, setCoords] = useState<string>("");

  useEffect(() => {
    const onRole = (e: any) => setRole(e.detail || getRole());
    window.addEventListener("role-change", onRole as any);
    return () => window.removeEventListener("role-change", onRole as any);
  }, []);

  function next() { setStep((s) => Math.min(3, s + 1)); }
  function prev() { setStep((s) => Math.max(1, s - 1)); }

  function getGPS() {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      const c = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      setCoords(c);
      toast.success(`Location captured: ${c}`);
    }, () => toast.error("Location denied"));
  }

  function submit() {
    toast.success("Complaint submitted (demo)");
    setStep(1); setCategory("Roads"); setDescription(""); setMedia(null); setCoords("");
  }

  if (role === "admin") {
    return (
      <div className="container py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "hsl(var(--navy))" }}>Posted Complaints</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input placeholder="Search ID, title, ward" className="pl-8 pr-3 py-2 rounded-md border bg-background text-sm" />
            </div>
            <select className="rounded-md border bg-background px-3 py-2 text-sm">
              {["All Status","Open","Assigned","In Progress","Resolved"].map(o=> <option key={o}>{o}</option>)}
            </select>
            <select className="rounded-md border bg-background px-3 py-2 text-sm">
              {["All Categories","Roads","Water","Electricity","Waste"].map(o=> <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Ward</th>
                <th className="px-4 py-3">Submitted By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">SLA (hrs)</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {demoComplaints.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3">{c.category}</td>
                  <td className="px-4 py-3">{c.ward}</td>
                  <td className="px-4 py-3">{c.submittedBy}</td>
                  <td className="px-4 py-3">{c.status}</td>
                  <td className="px-4 py-3">{c.slaHrs}</td>
                  <td className="px-4 py-3">{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">Admins can view/triage complaints here. Submission is disabled for admins.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "hsl(var(--navy))" }}>Submit & Track Complaints</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm mb-4">
            <span className={`px-2 py-1 rounded ${step===1?"bg-primary text-primary-foreground":"bg-muted"}`}>1. Details</span>
            <span className={`px-2 py-1 rounded ${step===2?"bg-primary text-primary-foreground":"bg-muted"}`}>2. Media</span>
            <span className={`px-2 py-1 rounded ${step===3?"bg-primary text-primary-foreground":"bg-muted"}`}>3. Location</span>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select value={category} onChange={(e)=>setCategory(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2">
                  {['Roads','Water','Electricity','Waste','Parks','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={5} className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="Describe the issue with landmarks, time, etc." />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Attach photo/video evidence (optional).</p>
              <label className="flex items-center justify-between gap-4 rounded-md border p-4 cursor-pointer hover:bg-muted">
                <div className="flex items-center gap-3">
                  <UploadCloud className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Upload</div>
                    <div className="text-xs text-muted-foreground">JPG, PNG, MP4 up to 20MB</div>
                  </div>
                </div>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={(e)=>setMedia(e.target.files?.[0]||null)} />
              </label>
              {media && <div className="text-sm">Selected: {media.name}</div>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Button type="button" variant="outline" onClick={getGPS} className="gap-2"><Navigation className="h-4 w-4"/> Capture GPS</Button>
              {coords && <div className="text-sm">Coordinates: {coords}</div>}
              <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border">
                <iframe title="Map" className="h-full w-full" src="https://www.openstreetmap.org/export/embed.html?bbox=67.5,6.5,97.5,37.5&layer=mapnik" />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={prev} disabled={step===1}>Back</Button>
            {step<3 ? (
              <Button onClick={next} className="gap-2">Next <Send className="h-4 w-4"/></Button>
            ) : (
              <Button onClick={submit} className="gap-2">Submit <Send className="h-4 w-4"/></Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary"/> Tracking Timeline</div>
            <ol className="mt-3 space-y-3 text-sm">
              <li className="border-l-2 pl-3">Submitted • 10:15 AM</li>
              <li className="border-l-2 pl-3">Assigned to Ward Officer</li>
              <li className="border-l-2 pl-3">In Progress</li>
              <li className="border-l-2 pl-3">Resolved</li>
            </ol>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">Recently submitted</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between"><span className="flex items-center gap-2"><Camera className="h-4 w-4"/> Pothole - Ward 12</span><span>Open</span></li>
              <li className="flex items-center justify-between"><span className="flex items-center gap-2"><FileVideo className="h-4 w-4"/> Water leak - Sector 8</span><span>Assigned</span></li>
              <li className="flex items-center justify-between"><span className="flex items-center gap-2"><Camera className="h-4 w-4"/> Streetlight - Block C</span><span>Resolved</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
