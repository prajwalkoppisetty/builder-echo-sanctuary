import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getRole, getRegion } from "@/lib/auth";
import { Star, MessageSquare, Smile, Meh, Frown, Share2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const COLORS = ["#FF9933", "#138808", "#000080", "#66b3ff", "#ffd166", "#ef476f"]; 

const demoDeptRatings = [
  { dept: "Roads", rating: 3.9 },
  { dept: "Water", rating: 4.2 },
  { dept: "Electricity", rating: 3.6 },
  { dept: "Waste", rating: 4.0 },
];

const demoSentiment = [
  { name: "Positive", value: 62 },
  { name: "Neutral", value: 24 },
  { name: "Negative", value: 14 },
];

export default function Feedback() {
  const [role, setRole] = useState<"citizen" | "officer" | "admin">(() => getRole());
  const [region] = useState<string>(() => getRegion() || "Andhra Pradesh");

  const [rating, setRating] = useState(0);
  const [sentiment, setSentiment] = useState<"pos" | "neu" | "neg" | null>(null);
  const [comment, setComment] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const onRole = (e: any) => setRole(e.detail || getRole());
    window.addEventListener("role-change", onRole as any);
    return () => window.removeEventListener("role-change", onRole as any);
  }, []);

  function submit() {
    const item = { id: Date.now(), rating, sentiment, comment, date: new Date().toLocaleString() };
    setHistory((h) => [item, ...h]);
    setRating(0); setSentiment(null); setComment("");
  }

  if (role === "admin") {
    return (
      <div className="container py-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "hsl(var(--navy))" }}>Department Performance & Feedback</h1>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
            <div className="font-semibold mb-2">Average Ratings by Department ({region})</div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoDeptRatings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="dept" />
                  <YAxis domain={[0,5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rating" fill="#138808" name="Avg Rating" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="font-semibold mb-2">Sentiment Distribution</div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={demoSentiment} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {demoSentiment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Admins can use this to benchmark departments and track satisfaction trends.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "hsl(var(--navy))" }}>Share Your Feedback</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm">
          <div>
            <div className="text-sm font-medium">Rating</div>
            <div className="mt-2 flex gap-2">
              {[1,2,3,4,5].map((n) => (
                <button key={n} onClick={()=>setRating(n)} className={`p-2 rounded-md border ${rating>=n?"bg-amber-400 text-white":"bg-background"}`} aria-label={`Rate ${n}`}>
                  <Star className="h-5 w-5"/>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-medium">Sentiment</div>
            <div className="mt-2 flex gap-2">
              <button onClick={()=>setSentiment("pos")} className={`p-2 rounded-md border ${sentiment==="pos"?"bg-emerald-500 text-white":"bg-background"}`}><Smile className="h-5 w-5"/></button>
              <button onClick={()=>setSentiment("neu")} className={`p-2 rounded-md border ${sentiment==="neu"?"bg-saffron text-white":"bg-background"}`}><Meh className="h-5 w-5"/></button>
              <button onClick={()=>setSentiment("neg")} className={`p-2 rounded-md border ${sentiment==="neg"?"bg-rose-500 text-white":"bg-background"}`}><Frown className="h-5 w-5"/></button>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-medium">Comment</div>
            <textarea value={comment} onChange={(e)=>setComment(e.target.value)} rows={5} className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="Describe your experience (department, ward, resolution quality)" />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={submit} className="gap-2"><MessageSquare className="h-4 w-4"/> Submit Feedback</Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="font-semibold">My Feedback History</div>
            <ul className="mt-3 space-y-2 text-sm">
              {history.length === 0 && <li className="text-muted-foreground">No feedback yet</li>}
              {history.map(item => (
                <li key={item.id} className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">{item.date}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">Rating: {item.rating}</span>
                    <span className="text-xs">Sentiment: {item.sentiment}</span>
                  </div>
                  {item.comment && <div className="mt-1 text-sm">{item.comment}</div>}
                  <div className="mt-2 flex gap-2 text-xs">
                    <a className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-muted" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(item.comment || "Feedback")}`}><Share2 className="h-3 w-3"/> Share</a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
