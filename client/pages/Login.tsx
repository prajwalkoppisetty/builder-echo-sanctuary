import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fakeLogin, fakeSignup, sendOtp, verifyOtp, setRole, setRegion } from "@/lib/auth";
import { ShieldCheck, Mail, Phone, LockKeyhole } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mode: "login" | "signup" = pathname.includes("signup") ? "signup" : "login";

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        fakeSignup({ email, phone, name });
        toast.success("Signed up successfully");
      } else {
        fakeLogin({ email, phone });
        toast.success("Logged in successfully");
      }
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    if (!phone) return toast.error("Enter phone");
    await sendOtp(phone);
    setOtpSent(true);
    toast.message("OTP sent via SMS (demo: 123456)");
  }

  function handleVerifyOtp() {
    if (verifyOtp(otp)) {
      toast.success("Phone verified");
    } else {
      toast.error("Invalid OTP");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border bg-card shadow-xl">
        <div className="absolute -inset-8 -z-10 bg-gradient-to-br from-saffron/20 to-indiaGreen/20 blur-3xl" />
        <div className="p-6 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">{mode === "login" ? "Login" : "Sign up"}</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Secure session with JWT • MFA via SMS OTP</p>
        </div>
        <div className="px-6 pt-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">Quick login (demo)</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <Button type="button" variant="secondary" onClick={() => { setRole("admin"); setRegion("Andhra Pradesh"); fakeLogin({ email: "admin@ap.gov.in", role: "admin", region: "Andhra Pradesh" }); toast.success("Logged in as Admin - Andhra Pradesh"); navigate("/dashboard"); }}>Login as Admin (Andhra Pradesh)</Button>
            <Button type="button" onClick={() => { setRole("citizen"); setRegion("Andhra Pradesh"); fakeLogin({ email: "citizen@ap.in", role: "citizen", region: "Andhra Pradesh" }); toast.success("Logged in as Citizen - Andhra Pradesh"); navigate("/dashboard"); }}>Login as Citizen (Andhra Pradesh)</Button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium flex items-center gap-2"><Mail className="h-4 w-4" /> Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</label>
            <div className="flex gap-2">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="+91 98765 43210" />
              <Button type="button" variant="outline" onClick={handleSendOtp}>Send OTP</Button>
            </div>
            {otpSent && (
              <div className="mt-2 flex gap-2 items-center">
                <input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 tracking-widest" placeholder="Enter OTP" />
                <Button type="button" onClick={handleVerifyOtp}><LockKeyhole className="h-4 w-4 mr-2"/>Verify</Button>
              </div>
            )}
          </div>
          <Button disabled={loading} className="w-full">{mode === "login" ? "Login" : "Create account"}</Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => toast.message("Google OAuth demo")}>Continue with Google</Button>
          <p className="text-xs text-center text-muted-foreground">
            {mode === "login" ? (
              <>No account? <a href="/signup" className="text-primary underline">Sign up</a></>
            ) : (
              <>Have an account? <a href="/login" className="text-primary underline">Login</a></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
