import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDone, 2600);
    return () => clearTimeout(timer);
  }, [toast, onDone]);

  if (!toast) return null;

  const Icon = toast.type === "error" ? XCircle : CheckCircle2;

  return (
    <div className={`admin-toast admin-toast-${toast.type ?? "success"}`}>
      <Icon size={16} />
      <span>{toast.message}</span>
    </div>
  );
}

export default Toast;
