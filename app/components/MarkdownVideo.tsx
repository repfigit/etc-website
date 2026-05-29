'use client';

import { getVideoEmbed } from '@/lib/video-embed';

interface Props {
  src?: string;
  alt?: string;
  /** Optional inline styles applied to the fallback <img>. */
  imgStyle?: React.CSSProperties;
}

/**
 * Drop-in replacement for the markdown `img` renderer that mirrors Obsidian:
 * `![](youtube-or-vimeo-url)` becomes a responsive iframe player, while
 * `![alt](image.png)` still renders a normal image.
 *
 * Only URLs that parse as known video hosts produce an iframe, so this does
 * not open up arbitrary HTML/iframe injection.
 */
export default function MarkdownVideo({ src, alt, imgStyle }: Props) {
  const embed = getVideoEmbed(src);

  if (embed) {
    return (
      <span className="markdown-video-embed">
        <iframe
          src={embed.embedUrl}
          title={alt || `${embed.provider} video`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt || ''} style={imgStyle} />;
}
