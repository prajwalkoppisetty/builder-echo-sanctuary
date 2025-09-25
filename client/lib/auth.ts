export function fakeLogin({ email, phone }: { email?: string; phone?: string }) {
  const token = btoa(JSON.stringify({ sub: email || phone, role: "citizen", iat: Date.now() / 1000 }));
  localStorage.setItem("jwt", token);
  return token;
}

export function fakeLogout() {
  localStorage.removeItem("jwt");
}

export function fakeSignup(payload: { email?: string; phone?: string; name?: string }) {
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
