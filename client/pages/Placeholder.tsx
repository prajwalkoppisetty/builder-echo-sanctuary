import { useLocation } from "react-router-dom";

export default function Placeholder() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center max-w-lg">
        <h1 className="text-2xl font-bold">Coming Soon</h1>
        <p className="mt-2 text-muted-foreground">
          The page <span className="font-mono">{pathname}</span> is a placeholder. Tell me to build it next (maps, dashboards, chat, analytics, etc.).
        </p>
      </div>
    </div>
  );
}
