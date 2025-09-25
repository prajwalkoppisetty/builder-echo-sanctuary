export function fakeLogin({ email, phone, role = getRole(), region = getRegion() }: { email?: string; phone?: string; role?: "citizen" | "officer" | "admin"; region?: string }) {
  const payload = { sub: email || phone, role, region, iat: Date.now() / 1000 };
  const token = btoa(JSON.stringify(payload));
  localStorage.setItem("jwt", token);
  setRole(role);
  setRegion(region);
  return token;
}

export function fakeLogout() {
  localStorage.removeItem("jwt");
}

export function fakeSignup(payload: { email?: string; phone?: string; name?: string; role?: "citizen" | "officer" | "admin"; region?: string }) {
  return fakeLogin(payload);
}

export async function sendOtp(phone: string) {
  await new Promise((r) => setTimeout(r, 600));
  sessionStorage.setItem("otp", "123456");
  return true;
}

export function verifyOtp(code: string) {
  const ok = code === sessionStorage.getItem("otp");
  if (ok) sessionStorage.removeItem("otp");
  return ok;
}

export function setRole(role: "citizen" | "officer" | "admin") {
  localStorage.setItem("role", role);
  window.dispatchEvent(new CustomEvent("role-change", { detail: role }));
}

export function getRole(): "citizen" | "officer" | "admin" {
  return (localStorage.getItem("role") as any) || "citizen";
}

export function setRegion(region: string) {
  if (!region) return;
  localStorage.setItem("region", region);
  window.dispatchEvent(new CustomEvent("region-change", { detail: region }));
}

export function getRegion(): string {
  return localStorage.getItem("region") || "";
}
