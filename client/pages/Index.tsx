import { useEffect, useMemo, useState } from "react";
import { Megaphone, MapPin, Siren, Users, ShieldCheck, MessageSquare, PhoneCall } from "lucide-react";
import { DemoResponse } from "@shared/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getRole } from "@/lib/auth";

const translations: Record<string, { tagline: string; sub: string; actions: string[] }> = {
  en: {
    tagline: "Connecting Citizens, Transforming Governance",
    sub: "Report issues, track progress, and collaborate with your city.",
    actions: ["Submit Complaint", "Track Status", "Emergency Help", "Volunteer Signup"],
  },
  hi: {
    tagline: "नागरिकों को जोड़ना, शासन बदलना",
    sub: "समस्याएँ दर्ज करें, प्रगति देखें और शहर के साथ मिलकर काम करें।",
    actions: ["शिकायत दर्ज करें", "स्थिति ट्रैक करें", "आपातकालीन सहायता", "स्वयंसेवी जुड़ें"],
  },
  ta: {
    tagline: "குடிமக்களை இணைத்து, ஆட்சியை மாற்றுதல்",
    sub: "சிக்கல்களை தெரிவிக்கவும், முன்னேற்றத்தை கண்காணிக்கவும், நகரத்துடன் சேர்ந்து செயல்படவும்.",
    actions: ["புகார் சமர்ப்பிக்க", "நிலை கண்காணிக்க", "அவசர உதவி", "தன்னார்வ பதிவு"],
  },
  te: {
    tagline: "పౌరులను కలుపుతూ, పాలనను మార్చడం",
    sub: "సమస్యలను నమోదు చేయండి, పురోగతిని ట్రాక్ చేయండి మరియు నగరంతో కలిసి పని చేయండి.",
    actions: ["ఫిర్యాదు సమర్పించండి", "స్థితి ట్రాక్ చేయండి", "అత్యవసర సహాయం", "స్వచ్ఛందంగా చేరండి"],
  },
  bn: {
    tagline: "নাগরিকদের সংযুক্ত করা, শাসন ব্যবস্থার রূপান্তর",
    sub: "সমস্যা জানান, অগ্রগতি ট্র্যাক করুন এবং শহরের সাথে সহযোগিতা করুন।",
    actions: ["অভিযোগ জমা দিন", "স্ট্যাটাস ট্র্যাক করুন", "জরুরি সহায়তা", "স্বেচ্ছাসেবক নিবন্ধন"],
  },
  mr: {
    tagline: "नागरिकांना जोडणे, शासन बदलण��",
    sub: "समस्या नोंदवा, प्रगती ट्रॅक करा आणि आपल्या शहरासोबत सहकार्य करा.",
    actions: ["तक्रार नोंदवा", "स्थिती ट्रॅक करा", "आपत्कालीन मदत", "स्वयंसेवक नोंदणी"],
  },
  kn: {
    tagline: "ನಾಗರಿಕರನ್ನು ಸಂಪರ್ಕಿಸಿ, ಆಡಳಿತ ಪರಿವರ್ತನೆ",
    sub: "ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ, ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ನಗರೊಂದಿಗೆ ಸಹಕರಿಸಿ.",
    actions: ["ದೂರು ಸಲ್ಲಿಸಿ", "ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್", "ತುರ್ತು ಸಹಾಯ", "ಸೇವಕರ ನೋಂದಣಿ"],
  },
};

export default function Index() {
  const [exampleFromServer, setExampleFromServer] = useState("");
  const [lang, setLang] = useState<string>(() => localStorage.getItem("lang") || "en");
  const [role, setRole] = useState<"citizen" | "officer" | "admin">(() => getRole());

  useEffect(() => {
    const onChange = (e: any) => setLang(e.detail || localStorage.getItem("lang") || "en");
    window.addEventListener("lang-change", onChange as any);
    return () => window.removeEventListener("lang-change", onChange as any);
  }, []);

  useEffect(() => {
    fetchDemo();
  }, []);

  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  const fetchDemo = async () => {
    try {
      const response = await fetch("/api/demo");
      const data = (await response.json()) as DemoResponse;
      setExampleFromServer(data.message);
    } catch (error) {
      // ignore
    }
  };

  const quickActions = [
    { label: t.actions[0], icon: Megaphone, to: "/complaints", color: "from-saffron/90 to-orange-400" },
    { label: t.actions[1], icon: ShieldCheck, to: "/complaints", color: "from-indigo-500 to-navy" },
    { label: t.actions[2], icon: Siren, to: "/emergency", color: "from-red-500 to-rose-600" },
    { label: t.actions[3], icon: Users, to: "/volunteers", color: "from-emerald-500 to-indiaGreen" },
  ];

  const liveComplaints = [
    { id: 1, text: "Pothole reported - Bengaluru", color: "text-emerald-700" },
    { id: 2, text: "Water leakage - Mumbai", color: "text-blue-700" },
    { id: 3, text: "Street light issue - Delhi", color: "text-yellow-700" },
    { id: 4, text: "Garbage collection delay - Kolkata", color: "text-orange-700" },
    { id: 5, text: "Tree fall - Chennai", color: "text-lime-700" },
  ];

  function handleEmergency(type: string) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          toast.success(`${type} alerted with GPS: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        },
        () => toast.error("Location access denied")
      );
    } else {
      toast.message(`${type} alerted`);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <IconCloud />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 opacity-20" style={{ backgroundImage: "var(--flag-gradient)" }} />
        <div className="container py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl" style={{ color: "hsl(var(--navy))" }}>
            {t.tagline}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{t.sub}</p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((a) => (
              <a key={a.label} href={a.to} className={`group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${a.color} text-white shadow-lg hover:shadow-xl transition-shadow` }>
                <a.icon className="h-6 w-6 mb-2 drop-shadow" />
                <div className="font-semibold">{a.label}</div>
                <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-white/15 blur-xl group-hover:scale-110 transition-transform" />
              </a>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live systems operational • {exampleFromServer || "Secure API connected"}
          </div>
        </div>
      </section>

      {/* Map preview in its own section */}
      <section className="container pb-4">
        <div className="rounded-3xl overflow-hidden border bg-card shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              Live Complaints Map
            </div>
            <a className="text-xs text-primary underline" href="/map">Open full map</a>
          </div>
          <div className="grid md:grid-cols-3">
            <div className="md:col-span-2 aspect-[16/9] md:aspect-auto">
              <iframe title="OSM India" className="h-full w-full" src="https://www.openstreetmap.org/export/embed.html?bbox=67.5,6.5,97.5,37.5&layer=mapnik" />
            </div>
            <div className="border-t md:border-t-0 md:border-l p-4 space-y-3">
              <div className="text-sm font-semibold">Live Feed</div>
              <div className="overflow-hidden">
                <div className="whitespace-nowrap animate-marquee flex gap-8">
                  {liveComplaints.concat(liveComplaints).map((c, i) => (
                    <span key={c.id + "-" + i} className={`text-xs md:text-sm ${c.color}`}>• {c.text}</span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Filters: Category • Region • Language</div>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement shortcuts */}
      <section className="container py-12 grid sm:grid-cols-3 gap-6">
        <EngageCard icon={MessageSquare} title="Chatbot & IVR" desc="Ask questions or submit complaints with guided steps." color="from-navy to-indigo-600" />
        <EngageCard icon={ShieldCheck} title="Real-time Tracking" desc="Stay updated with status changes and SLA timers." color="from-emerald-600 to-indiaGreen" />
        <EngageCard icon={Users} title="Volunteer & Help Desk" desc="Join city drives and schedule mobile help desk." color="from-orange-400 to-saffron" />
      </section>

      {/* Emergency floating action */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col gap-2">
          <Button className="shadow-lg" onClick={() => handleEmergency("Police")}>🚔 Police</Button>
          <Button variant="destructive" className="shadow-lg" onClick={() => handleEmergency("Fire")}>🔥 Fire</Button>
          <Button variant="secondary" className="shadow-lg" onClick={() => handleEmergency("Ambulance")}>🩺 Ambulance</Button>
          <Button variant="outline" className="mt-1 gap-2"> <PhoneCall className="h-4 w-4"/> SOS</Button>
        </div>
      </div>
    </div>
  );
}

function EngageCard({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${color} text-white p-6 shadow-lg`}>
      <Icon className="h-6 w-6" />
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm/6 opacity-90">{desc}</p>
      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}

function IconCloud() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Megaphone className="absolute left-10 top-24 h-8 w-8 text-saffron/70 animate-float" />
      <ShieldCheck className="absolute right-16 top-20 h-8 w-8 text-navy/70 animate-float-slow" />
      <MapPin className="absolute left-1/2 top-40 h-8 w-8 text-emerald-600/70 animate-float-fast" />
      <Users className="absolute right-12 bottom-24 h-8 w-8 text-saffron/70 animate-float" />
      <Siren className="absolute left-20 bottom-20 h-8 w-8 text-rose-600/70 animate-float-slow" />
    </div>
  );
}
