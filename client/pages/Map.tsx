import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MapPage() {
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("Citywide");
  const [lang, setLang] = useState("All");

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "hsl(var(--navy))" }}>City Map</h1>
        <div className="flex gap-2">
          <select value={category} onChange={(e)=>setCategory(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
            {["All","Roads","Water","Electricity","Waste"].map(o=> <option key={o}>{o}</option>)}
          </select>
          <select value={region} onChange={(e)=>setRegion(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
            {["Citywide","North","South","East","West"].map(o=> <option key={o}>{o}</option>)}
          </select>
          <select value={lang} onChange={(e)=>setLang(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
            {["All","Hindi","Tamil","Telugu","Bengali","Marathi","Kannada"].map(o=> <option key={o}>{o}</option>)}
          </select>
          <Button>Apply</Button>
        </div>
      </div>
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="aspect-[16/8] w-full">
          <iframe title="Map" className="h-full w-full" src="https://www.openstreetmap.org/export/embed.html?bbox=67.5,6.5,97.5,37.5&layer=mapnik" />
        </div>
      </div>
    </div>
  );
}
