import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PhoneCall, ShieldAlert, Siren, Ambulance, Shield, FlameKindling } from "lucide-react";

export default function Emergency() {
  const [coords, setCoords] = useState<string>("");

  function withGPS(action: string) {
    if (!navigator.geolocation) {
      toast.error("Location not available");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setCoords(c);
        toast.success(`${action} notified with GPS ${c}`);
      },
      () => toast.error("Location denied"),
    );
  }

  return (
    <div className="container py-10 space-y-8">
      <h1 className="text-3xl font-extrabold" style={{ color: "hsl(var(--navy))" }}>Emergency Assistance</h1>
      <p className="text-muted-foreground">One-tap alert to nearest services. Your GPS coordinates are shared.</p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border p-6 bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg">
          <div className="flex items-center gap-2 text-lg font-semibold"><Shield className="h-5 w-5"/> Police</div>
          <p className="text-sm/6 opacity-90 mt-1">Law & order, theft, assaults, public safety.</p>
          <Button onClick={() => withGPS("Police")} className="mt-4 w-full bg-white text-red-600 hover:bg-white/90">Alert Police</Button>
        </div>
        <div className="rounded-2xl border p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
          <div className="flex items-center gap-2 text-lg font-semibold"><FlameKindling className="h-5 w-5"/> Fire</div>
          <p className="text-sm/6 opacity-90 mt-1">Fires, gas leaks, structural hazards.</p>
          <Button onClick={() => withGPS("Fire")} className="mt-4 w-full bg-white text-amber-700 hover:bg-white/90">Alert Fire Dept</Button>
        </div>
        <div className="rounded-2xl border p-6 bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg">
          <div className="flex items-center gap-2 text-lg font-semibold"><Ambulance className="h-5 w-5"/> Medical</div>
          <p className="text-sm/6 opacity-90 mt-1">Accidents, injuries, medical emergencies.</p>
          <Button onClick={() => withGPS("Ambulance")} className="mt-4 w-full bg-white text-emerald-700 hover:bg-white/90">Alert Ambulance</Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-semibold"><Siren className="h-5 w-5 text-primary"/> SOS Broadcast</div>
        <p className="text-sm text-muted-foreground">Share your location with a trusted contact.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted" href="tel:112"><PhoneCall className="h-4 w-4"/> Call 112</a>
          <a className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent("Emergency! Need help at "+(coords||"[tap a service to capture GPS]"))}`}>WhatsApp</a>
          <a className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Emergency! Need help at "+(coords||"[tap a service to capture GPS]"))}`}>Twitter/X</a>
        </div>
        {coords && <div className="mt-3 text-xs">Last location: {coords}</div>}
      </div>
    </div>
  );
}
