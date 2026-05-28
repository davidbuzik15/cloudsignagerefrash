// Simple HTML sanitization for embed content
// Allows iframes, scripts from trusted sources, and common embed patterns

const ALLOWED_TAGS = [
  'div', 'iframe', 'script', 'style', 'p', 'span', 'a',
  'video', 'source', 'img', 'canvas', 'section', 'article',
  'header', 'footer', 'nav', 'main', 'aside', 'figure', 'figcaption'
];

const ALLOWED_ATTRIBUTES = {
  '*': ['class', 'id', 'style', 'data-*'],
  'iframe': ['src', 'title', 'allow', 'allowfullscreen', 'width', 'height', 'frameborder', 'loading'],
  'a': ['href', 'target', 'rel'],
  'img': ['src', 'alt', 'width', 'height'],
  'video': ['src', 'controls', 'width', 'height', 'autoplay', 'muted', 'loop'],
  'source': ['src', 'type'],
  'script': ['src', 'async', 'defer'],
};

const ALLOWED_IFRAME_SOURCES = [
  'canva.com',
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'google.com',
  'docs.google.com',
  'loom.com',
  'figma.com',
  'codepen.io',
  'player.vimeo.com',
  'youtube-nocookie.com',
];

const ALLOWED_SCRIPTS = [
  'cdn.canva.com',
  'cdnjs.cloudflare.com',
  'platform.twitter.com',
  'connect.facebook.net',
  'apis.google.com',
];

export function sanitizeEmbedHTML(html: string): string {
  if (!html || typeof html !== 'string') return '';

  try {
    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = html;

    // Remove script tags that aren't from allowed sources
    const scripts = container.querySelectorAll('script');
    scripts.forEach((script) => {
      const src = script.getAttribute('src') || '';
      const isAllowed = ALLOWED_SCRIPTS.some((allowed) => src.includes(allowed));
      if (src && !isAllowed) {
        script.remove();
      }
    });

    // Remove iframes that aren't from allowed sources
    const iframes = container.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      const src = iframe.getAttribute('src') || '';
      const isAllowed = ALLOWED_IFRAME_SOURCES.some((allowed) => src.includes(allowed));
      if (!isAllowed) {
        iframe.remove();
      }
    });

    // Remove on* event handlers
    container.querySelectorAll('*').forEach((element) => {
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith('on')) {
          element.removeAttribute(attr.name);
        }
      });
    });

    return container.innerHTML;
  } catch (error) {
    console.error('Sanitization error:', error);
    return html; // Fallback to original if sanitization fails
  }
}

export function sanitizeEmbedHTMLServer(html: string): string {
  // Server-side sanitization using regex for security
  // This is a fallback for server-side rendering
  if (!html || typeof html !== 'string') return '';

  // Remove event handlers
  let sanitized = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove script tags not from allowed sources
  sanitized = sanitized.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match) => {
    const isAllowed = ALLOWED_SCRIPTS.some((allowed) => match.includes(allowed));
    return isAllowed ? match : '';
  });

  // Remove iframes not from allowed sources
  sanitized = sanitized.replace(/<iframe[^>]*src=["']([^"']*)["'][^>]*>/gi, (match) => {
    const isAllowed = ALLOWED_IFRAME_SOURCES.some((allowed) => match.includes(allowed));
    return isAllowed ? match : '';
  });

  return sanitized;
}
