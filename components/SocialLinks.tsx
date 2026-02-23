interface SocialLinksProps {
  links: Record<string, string> | null;
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  telegram: "Telegram",
  website: "Website",
  linkedin: "LinkedIn",
  twitter: "X/Twitter",
};

export function SocialLinks({ links }: SocialLinksProps) {
  if (!links || Object.keys(links).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(links).map(([platform, url]) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full bg-bg-secondary px-3 py-1 text-xs font-medium text-text-secondary transition hover:bg-border hover:text-text-primary"
        >
          {PLATFORM_LABELS[platform.toLowerCase()] || platform}
        </a>
      ))}
    </div>
  );
}
