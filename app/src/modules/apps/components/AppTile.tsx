import { Badge } from "@/modules/common/components/Badge";
import { Link } from "@/modules/common/components/Link";
import clsx from "clsx";
import Image from "next/image";
import * as FaIcons from "react-icons/fa";
import { FaExternalLinkAlt } from "react-icons/fa";
import type { App, RedactedApp } from "../utils/types";

interface Props {
  readonly className?: string;
  readonly app: Exclude<App, RedactedApp>;
  readonly variant?: "default" | "compact";
  readonly onClick?: () => void;
}

const isValidUrl = (src: string) => {
  try {
    new URL(src);
    return true;
  } catch {
    return false;
  }
};

export const AppTile = ({
  className,
  app,
  variant = "default",
  onClick,
}: Props) => {
  const href =
    "href" in app
      ? app.href
      : "defaultPage" in app && "externalUrl" in app.defaultPage
        ? app.defaultPage.externalUrl
        : `/app/external/${app.slug}`;

  const isExternal = "defaultPage" in app && "externalUrl" in app.defaultPage;

  const Icon =
    "icon" in app && app.icon
      ? (FaIcons as Record<string, React.ElementType>)[app.icon] ?? null
      : null;

  const staticImage =
    "imageSrc" in app && app.imageSrc && typeof app.imageSrc === "object"
      ? (app.imageSrc as Image)
      : null;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={clsx(
          "flex items-center justify-between gap-2 hover:outline-interaction-700 focus-visible:outline-interaction-700 active:outline-interaction-500 outline-offset-4 outline outline-transparent transition-colors rounded-primary overflow-hidden bg-secondary group p-2 text-xs",
          className,
        )}
        onClick={onClick}
      >
        <span title={app.name} className="flex-1 truncate">
          {app.name}
        </span>
        {isExternal && (
          <FaExternalLinkAlt className="flex-none text-neutral-500" />
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={clsx(
        "flex flex-col hover:outline-interaction-700 focus-visible:outline-interaction-700 active:outline-interaction-500 outline-offset-4 outline outline-transparent transition-colors rounded-primary overflow-hidden bg-secondary group",
        className,
      )}
    >
      {staticImage ? (
        // Lokales Asset aus /assets
        <Image
          src={staticImage}
          alt={`Screenshot der ${app.name} App`}
          className="aspect-video object-cover object-top grayscale group-hover:grayscale-0 group-focus-visible:grayscale-0 transition"
        />
      ) : app.imageSrc && isValidUrl(app.imageSrc) ? (
        // Externe URL
        <div className="aspect-video relative overflow-hidden grayscale group-hover:grayscale-0 group-focus-visible:grayscale-0 transition">
          <Image
            src={app.imageSrc}
            alt={`Screenshot der ${app.name} App`}
            fill
            className="object-cover object-top"
          />
        </div>
      ) : Icon ? (
        // Fallback: Icon
        <div className="aspect-video bg-black flex items-center justify-center">
          <Icon className="text-5xl text-neutral-400 group-hover:text-white transition-colors" />
        </div>
      ) : (
        // Fallback: schwarz
        <div className="aspect-video bg-black" />
      )}

      <div className="p-2 sm:p-4 flex flex-col gap-2 flex-1">
        <div className="flex gap-2 items-center">
          <h2
            title={app.name}
            className="font-bold truncate font-mono uppercase"
          >
            {app.name}
          </h2>
          {isExternal && (
            <FaExternalLinkAlt className="flex-none text-neutral-500 text-sm" />
          )}
        </div>
        {"description" in app && app.description && (
          <p className="text-xs text-neutral-400 flex-1">{app.description}</p>
        )}
        {app.tags?.length && (
          <div className="flex flex-wrap gap-0.5">
            {app.tags.map((tag) => (
              <Badge
                key={tag}
                label="Tag"
                value={tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : tag}
                className="text-xs"
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};