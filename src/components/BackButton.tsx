import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { locationPath } from "@/content/types";
import { loadLastLocation } from "@/state/persistence";

type LocationState = {
  from?: { pathname: string; search?: string; hash?: string };
};

export function BackButton({ label = "← Back" }: { label?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from;

  return (
    <Button
      type="button"
      variant="link"
      className="h-auto px-0"
      onClick={() => {
        if (from?.pathname) {
          navigate(`${from.pathname}${from.search ?? ""}${from.hash ?? ""}`);
          return;
        }
        if (window.history.length > 1) {
          navigate(-1);
          return;
        }
        void loadLastLocation().then((loc) => {
          navigate(loc ? locationPath(loc) : "/", { replace: true });
        });
      }}
    >
      {label}
    </Button>
  );
}
