/**
 * Detect video URLs (YouTube / Vimeo) inside markdown image embeds and
 * convert them to an embeddable player URL.
 *
 * This mirrors Obsidian's behaviour where the image-embed syntax `![](url)`
 * is overloaded: if the URL points at a supported video host it is rendered
 * as an iframe player rather than an <img>. Bare links (without the `![]`
 * prefix) are left untouched and stay as ordinary links.
 */

export interface VideoEmbed {
  provider: 'youtube' | 'vimeo';
  /** The src to use for the player iframe. */
  embedUrl: string;
}

/** Parse a YouTube video id (and optional start time) from common URL shapes. */
function parseYouTube(url: URL): VideoEmbed | null {
  const host = url.hostname.replace(/^www\./, '');

  let id: string | null = null;

  if (host === 'youtu.be') {
    // https://youtu.be/<id>
    id = url.pathname.slice(1).split('/')[0] || null;
  } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') {
      // https://www.youtube.com/watch?v=<id>
      id = url.searchParams.get('v');
    } else if (url.pathname.startsWith('/embed/')) {
      // https://www.youtube.com/embed/<id>
      id = url.pathname.split('/')[2] || null;
    } else if (url.pathname.startsWith('/shorts/')) {
      // https://www.youtube.com/shorts/<id>
      id = url.pathname.split('/')[2] || null;
    } else if (url.pathname.startsWith('/live/')) {
      // https://www.youtube.com/live/<id>
      id = url.pathname.split('/')[2] || null;
    }
  }

  if (!id || !/^[\w-]{11}$/.test(id)) return null;

  // Honour timestamps: ?t=90, ?t=1m30s, ?start=90
  const params = new URLSearchParams();
  const start = parseStartSeconds(url.searchParams.get('t') ?? url.searchParams.get('start'));
  if (start) params.set('start', String(start));

  const query = params.toString();
  return {
    provider: 'youtube',
    embedUrl: `https://www.youtube.com/embed/${id}${query ? `?${query}` : ''}`,
  };
}

/** Parse a Vimeo video id from common URL shapes. */
function parseVimeo(url: URL): VideoEmbed | null {
  const host = url.hostname.replace(/^www\./, '');
  if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null;

  // https://vimeo.com/<id>  or  https://player.vimeo.com/video/<id>
  const segments = url.pathname.split('/').filter(Boolean);
  const id = segments[segments.length - 1];
  if (!id || !/^\d+$/.test(id)) return null;

  return {
    provider: 'vimeo',
    embedUrl: `https://player.vimeo.com/video/${id}`,
  };
}

/** Convert a YouTube `t`/`start` value (e.g. "90", "1m30s") into seconds. */
function parseStartSeconds(value: string | null): number | null {
  if (!value) return null;
  if (/^\d+$/.test(value)) return parseInt(value, 10);

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return null;
  const [, h, m, s] = match;
  const seconds = (parseInt(h || '0', 10) * 3600) + (parseInt(m || '0', 10) * 60) + parseInt(s || '0', 10);
  return seconds > 0 ? seconds : null;
}

/**
 * Returns embed info if the given URL is a supported video host, otherwise null
 * (in which case the caller should render a normal image).
 */
export function getVideoEmbed(src: string | undefined): VideoEmbed | null {
  if (!src) return null;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  return parseYouTube(url) ?? parseVimeo(url);
}
