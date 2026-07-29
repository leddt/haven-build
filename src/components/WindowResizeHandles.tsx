import { getCurrentWindow } from "@tauri-apps/api/window";
import { cn } from "@/lib/utils";

type ResizeDirection =
  | "East"
  | "North"
  | "NorthEast"
  | "NorthWest"
  | "South"
  | "SouthEast"
  | "SouthWest"
  | "West";

const edges: {
  direction: ResizeDirection;
  className: string;
}[] = [
  { direction: "North", className: "top-0 left-2 right-2 h-1.5 cursor-n-resize" },
  { direction: "South", className: "bottom-0 left-2 right-2 h-1.5 cursor-s-resize" },
  { direction: "West", className: "left-0 top-2 bottom-2 w-1.5 cursor-w-resize" },
  { direction: "East", className: "right-0 top-2 bottom-2 w-1.5 cursor-e-resize" },
  {
    direction: "NorthWest",
    className: "left-0 top-0 size-3 cursor-nw-resize",
  },
  {
    direction: "NorthEast",
    className: "right-0 top-0 size-3 cursor-ne-resize",
  },
  {
    direction: "SouthWest",
    className: "left-0 bottom-0 size-3 cursor-sw-resize",
  },
  {
    direction: "SouthEast",
    className: "right-0 bottom-0 size-3 cursor-se-resize",
  },
];

export function WindowResizeHandles() {
  return (
    <>
      {edges.map(({ direction, className }) => (
        <div
          key={direction}
          className={cn("fixed z-50", className)}
          onMouseDown={(event) => {
            event.preventDefault();
            void getCurrentWindow().startResizeDragging(direction);
          }}
        />
      ))}
    </>
  );
}
