import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Menu, UserCircle2 } from "lucide-react";
import { getRole, fakeLogout } from "@/lib/auth";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "kn", label: "ಕನ್ನಡ" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<string>(() => localStorage.getItem("lang") || "en");
  const [role, setRole] = useState<"citizen" | "officer" | "admin">(() => getRole());
  const isAuthed = !!localStorage.getItem("jwt");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    window.dispatchEvent(new CustomEvent("lang-change", { detail: lang }));
  }, [lang]);

  useEffect(() => {
    const onRole = (e: any) => setRole(e.detail || getRole());
    window.addEventListener("role-change", onRole as any);
    return () => window.removeEventListener("role-change", onRole as any);
  }, []);

  const t = useMemo(() => getTranslations(lang), [lang]);

  const links = [
    { to: "/", label: t.nav.home },
    { to: "/dashboard", label: t.nav.dashboard },
    { to: "/complaints", label: t.nav.complaints },
    { to: "/map", label: t.nav.map },
    ...(role === "admin" ? [] : [{ to: "/volunteers", label: t.nav.volunteers }]),
    { to: "/emergency", label: t.nav.emergency },
    { to: "/feedback", label: t.nav.feedback },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="tricolor-border h-1 w-full" />
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 rounded-md border hover:bg-muted" onClick={() => setOpen(!open)} aria-label="Toggle Menu">
            <Menu className="h-5 w-5" />
          </button>
          <div onClick={() => navigate("/")} className="cursor-pointer select-none">
            <div className="flex items-center gap-2">
              <div className="chakra-ring h-8 w-8" />
              <span className="text-xl font-extrabold tracking-tight" style={{ color: "hsl(var(--navy))" }}>Citizen Hub</span>
            </div>
            <p className="text-[10px] text-muted-foreground -mt-1">Connecting Citizens, Transforming Governance</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `hover:text-primary ${isActive ? "text-primary" : "text-foreground"}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                {LANGS.find((l) => l.code === lang)?.label ?? "Language"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LANGS.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {isAuthed ? (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard")}>
                <UserCircle2 className="mr-2 h-4 w-4" /> Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => { fakeLogout(); navigate("/"); }}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Login</Button>
              <Button size="sm" onClick={() => navigate("/signup")}>Sign up</Button>
            </div>
          )}
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-2 grid grid-cols-2 gap-2 text-sm">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="p-2 rounded hover:bg-muted">{l.label}</NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function getTranslations(code: string) {
  switch (code) {
    case "hi":
      return { nav: { home: "होम", dashboard: "डैशबोर्ड", complaints: "शिकायतें", map: "मानचित्र", volunteers: "स्वयंसेवक", emergency: "आपातकाल", feedback: "प्रतिपुष्टि" } };
    case "ta":
      return { nav: { home: "முகப்பு", dashboard: "டாஷ்போர்டு", complaints: "புகார்கள்", map: "வரைபடம்", volunteers: "தன்னார்வலர்கள்", emergency: "அவசரம்", feedback: "கருத்து" } };
    case "te":
      return { nav: { home: "హోం", dashboard: "డాష్‌బోర్డ్", complaints: "ఫిర్యాదులు", map: "మ్యాప్", volunteers: "స్వచ్ఛంద", emergency: "అత్యవసర", feedback: "అభిప్రాయం" } };
    case "bn":
      return { nav: { home: "হোম", dashboard: "ড্য���শবোর্ড", complaints: "অভিযোগ", map: "মানচিত্র", volunteers: "স্বেচ্ছাসেবক", emergency: "জরুরি", feedback: "প্রতিক্রিয়া" } };
    case "mr":
      return { nav: { home: "मुख्य", dashboard: "डॅशबोर्ड", complaints: "तक्रारी", map: "नकाशा", volunteers: "स्वयंसेवक", emergency: "आपत्कालीन", feedback: "अभिप्राय" } };
    case "kn":
      return { nav: { home: "ಮುಖಪುಟ", dashboard: "ಡ್ಯಾಶ್ಬೋರ್ಡ್", complaints: "ದೂರುಗಳು", map: "ನಕ್ಷೆ", volunteers: "ಸೇವಕರು", emergency: "ತುರ್ತು", feedback: "ಪ್ರತಿಕ್ರಿಯೆ" } };
    default:
      return { nav: { home: "Home", dashboard: "Dashboard", complaints: "Complaints", map: "Map", volunteers: "Volunteers", emergency: "Emergency", feedback: "Feedback" } };
  }
}
