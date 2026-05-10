import { Injectable, Logger } from '@nestjs/common';

export interface SiteMetadata {
  url: string;
  title: string | null;
  description: string | null;
  favicon: string | null;
  ogImage: string | null;
  themeColor: string | null;
  generator: string | null;
  language: string | null;
  domain: string;
  isReachable: boolean;
}

@Injectable()
export class SiteMetaService {
  private readonly logger = new Logger(SiteMetaService.name);

  async fetchMetadata(rawUrl: string): Promise<SiteMetadata> {
    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let domain: string;
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return this.emptyResult(url, url);
    }

    const result: SiteMetadata = {
      url,
      domain,
      title: null,
      description: null,
      favicon: null,
      ogImage: null,
      themeColor: null,
      generator: null,
      language: null,
      isReachable: false,
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'QuickApps-Bot/1.0 (+https://quickapps.in)',
          Accept: 'text/html',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        // Still mark as reachable if we got a response (even 403/etc)
        result.isReachable = res.status < 500;
        result.favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        return result;
      }

      result.isReachable = true;
      const html = await res.text();

      // Parse meta tags using regex (no dependency needed)
      result.title = this.extractTag(html, 'title') || this.extractMeta(html, 'og:title');
      result.description = this.extractMeta(html, 'description') || this.extractMeta(html, 'og:description');
      result.ogImage = this.extractMeta(html, 'og:image');
      result.themeColor = this.extractMeta(html, 'theme-color');
      result.generator = this.extractMeta(html, 'generator');
      result.language = this.extractLang(html);

      // Favicon: try to find from HTML, fallback to Google S2
      const faviconFromHtml = this.extractFavicon(html, url);
      result.favicon = faviconFromHtml || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

      // Make relative OG image absolute
      if (result.ogImage && !result.ogImage.startsWith('http')) {
        try {
          result.ogImage = new URL(result.ogImage, url).toString();
        } catch {}
      }

      this.logger.log(`Fetched metadata for ${domain}: title="${result.title}", generator="${result.generator}"`);
    } catch (err) {
      this.logger.warn(`Failed to fetch ${url}: ${(err as Error).message}`);
      result.favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }

    return result;
  }

  private extractTag(html: string, tag: string): string | null {
    const match = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i'));
    return match?.[1]?.trim() || null;
  }

  private extractMeta(html: string, nameOrProp: string): string | null {
    // Match both name="..." and property="..."
    const patterns = [
      new RegExp(`<meta[^>]*(?:name|property)=["']${nameOrProp}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${nameOrProp}["']`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
    return null;
  }

  private extractFavicon(html: string, baseUrl: string): string | null {
    // Look for <link rel="icon" or rel="shortcut icon" or rel="apple-touch-icon"
    const patterns = [
      /<link[^>]*rel=["'](?:apple-touch-icon|icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:apple-touch-icon|icon|shortcut icon)["']/i,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const href = match[1];
        if (href.startsWith('http')) return href;
        try {
          return new URL(href, baseUrl).toString();
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private extractLang(html: string): string | null {
    const match = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
    return match?.[1]?.trim() || null;
  }

  private emptyResult(url: string, domain: string): SiteMetadata {
    return {
      url, domain, title: null, description: null,
      favicon: null, ogImage: null, themeColor: null,
      generator: null, language: null, isReachable: false,
    };
  }
}
