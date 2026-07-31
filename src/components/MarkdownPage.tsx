import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { XIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveContentAssetUrl } from "@/content/assets";
import { parseImageAlt } from "@/content/imageAlt";
import { resolveGuideHref, slugifyHeading } from "@/content/links";
import { remarkCheckId } from "@/content/remarkCheckId";
import { cn } from "@/lib/utils";
import { useProgress } from "@/state/progress";

const TaskCheckIdContext = createContext<string | undefined>(undefined);

function GuideImage({
  src,
  alt,
  height,
  width,
}: {
  src: string;
  alt: string;
  height?: string;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const label = alt.trim() || "Guide image";
  const zoomable = Boolean(height || width);
  const sizeStyle: CSSProperties = {
    ...(height ? { height } : null),
    ...(width ? { width } : null),
  };

  const image = (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="guide-image"
      style={sizeStyle}
    />
  );

  if (!zoomable) {
    return image;
  }

  return (
    <>
      <button
        type="button"
        className="guide-image-trigger"
        onClick={() => setOpen(true)}
        aria-label={`View ${label} full size`}
      >
        {image}
      </button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content
            className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
            aria-describedby={undefined}
            onClick={() => setOpen(false)}
          >
            <Dialog.Title className="sr-only">{label}</Dialog.Title>
            <img
              src={src}
              alt={alt}
              className="max-h-full max-w-full object-contain"
              onClick={(event) => event.stopPropagation()}
            />
            <Dialog.Close
              className="absolute top-3 right-3 rounded-md bg-black/50 p-2 text-white opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close image"
            >
              <XIcon className="size-5" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function headingText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(headingText).join("");
  return "";
}

function scrollToHeading(headingId: string) {
  requestAnimationFrame(() => {
    document.getElementById(headingId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

function TaskCheckbox({
  pageKey,
  mdDefault,
}: {
  pageKey: string;
  mdDefault: boolean;
}) {
  const checkId = useContext(TaskCheckIdContext);
  const { isCheckboxChecked, toggleCheckbox } = useProgress();

  if (!checkId) {
    return (
      <input
        type="checkbox"
        className="task-list-checkbox"
        checked={mdDefault}
        disabled
        readOnly
      />
    );
  }

  const checked = isCheckboxChecked(pageKey, checkId, mdDefault);
  return (
    <input
      type="checkbox"
      className="task-list-checkbox"
      checked={checked}
      onChange={() => toggleCheckbox(pageKey, checkId, mdDefault)}
    />
  );
}

export function MarkdownPage({
  content,
  assetBase,
  gameId,
  characterId,
  buildId,
  pageKey,
}: {
  content: string;
  /** Path under content/, e.g. frosthaven/characters/banner-spear/shared */
  assetBase: string;
  gameId: string;
  characterId: string;
  buildId?: string;
  pageKey: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (scrollTo) scrollToHeading(scrollTo);
  }, [location.pathname, location.state, content]);

  return (
    <article className="prose-guide">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCheckId]}
        components={{
          h2: ({ children }) => {
            const id = slugifyHeading(headingText(children));
            return (
              <h2 id={id} className="scroll-mt-4">
                {children}
              </h2>
            );
          },
          li: ({ children, className, ...props }) => {
            const checkId =
              typeof (props as { "data-check-id"?: unknown })[
                "data-check-id"
              ] === "string"
                ? (props as { "data-check-id": string })["data-check-id"]
                : undefined;
            const isTask = Boolean(
              className?.includes("task-list-item") || checkId,
            );
            return (
              <TaskCheckIdContext.Provider value={checkId}>
                <li
                  className={cn(
                    className,
                    isTask && "task-list-item",
                    checkId && "task-list-item-interactive",
                    isTask && !checkId && "task-list-item-static",
                  )}
                  data-check-id={checkId}
                >
                  {children}
                </li>
              </TaskCheckIdContext.Provider>
            );
          },
          input: ({ type, checked, ...props }) => {
            if (type !== "checkbox") {
              return <input type={type} checked={checked} {...props} />;
            }
            return (
              <TaskCheckbox pageKey={pageKey} mdDefault={Boolean(checked)} />
            );
          },
          a: ({ href, children }) => {
            const resolved = resolveGuideHref(href, {
              gameId,
              characterId,
              buildId,
            });

            if (!resolved) {
              if (href && /^(https?:|mailto:)/i.test(href)) {
                return (
                  <a href={href} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                );
              }
              return <span className="font-medium">{children}</span>;
            }

            if (/^(https?:|mailto:)/i.test(resolved.path)) {
              return (
                <a href={resolved.path} target="_blank" rel="noreferrer">
                  {children}
                </a>
              );
            }

            return (
              <a
                href={resolved.path}
                onClick={(event) => {
                  event.preventDefault();
                  const onSamePage =
                    location.pathname === resolved.path ||
                    location.pathname + location.search === resolved.path;
                  if (onSamePage && resolved.heading) {
                    scrollToHeading(resolved.heading);
                    return;
                  }
                  navigate(resolved.path, {
                    state: resolved.heading
                      ? { scrollTo: resolved.heading }
                      : undefined,
                  });
                }}
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt: rawAlt }) => {
            const resolved = src
              ? resolveContentAssetUrl(assetBase, src)
              : undefined;
            if (!resolved) {
              return (
                <span className="text-sm text-muted-foreground">
                  [Missing image: {src}]
                </span>
              );
            }
            const { alt, height, width } = parseImageAlt(rawAlt ?? "");
            return (
              <GuideImage
                src={resolved}
                alt={alt}
                height={height}
                width={width}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
