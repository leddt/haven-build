import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveContentAssetUrl } from "@/content/assets";
import { resolveGuideHref, slugifyHeading } from "@/content/links";
import { cn } from "@/lib/utils";

function GuideImage({ src, alt }: { src: string; alt: string }) {
  const [wide, setWide] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("guide-image", wide && "guide-image-wide")}
      onLoad={(event) => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        if (naturalWidth > 0 && naturalHeight > 0) {
          setWide(naturalWidth / naturalHeight > 1.1);
        }
      }}
    />
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

export function MarkdownPage({
  content,
  assetBase,
  gameId,
  characterId,
  buildId,
}: {
  content: string;
  /** Path under content/, e.g. frosthaven/characters/banner-spear/shared */
  assetBase: string;
  gameId: string;
  characterId: string;
  buildId?: string;
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
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const id = slugifyHeading(headingText(children));
            return (
              <h2 id={id} className="scroll-mt-4">
                {children}
              </h2>
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
          img: ({ src, alt }) => {
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
            return <GuideImage src={resolved} alt={alt ?? ""} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
