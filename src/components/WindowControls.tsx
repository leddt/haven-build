import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WindowControls() {
  const appWindow = getCurrentWindow();

  const minimize = useCallback(() => {
    void appWindow.minimize();
  }, [appWindow]);

  const toggleMaximize = useCallback(() => {
    void appWindow.toggleMaximize();
  }, [appWindow]);

  const close = useCallback(() => {
    void appWindow.close();
  }, [appWindow]);

  return (
    <div className="flex items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-none"
        aria-label="Minimize"
        onClick={minimize}
      >
        <Minus className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-none"
        aria-label="Maximize"
        onClick={toggleMaximize}
      >
        <Square className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-none hover:bg-red-600/90 hover:text-white"
        aria-label="Close"
        onClick={close}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
