import { log } from "@clack/prompts";
import { s } from ".";
import Sitemapper from "sitemapper";

export const getSitemaps = async (domain: string) => {
  s.start("Checking sitemap");
  let sitemaps: string[] = [];

  // check robots.txt for sitemap
  try {
    const robotsUrl = `https://${domain}/robots.txt`;
    const robotsResponse = await fetch(robotsUrl);

    if (robotsResponse.ok) {
      const robotsText = await robotsResponse.text();
      const sitemapRegex = /Sitemap:\s*(http[^\s]+)/gi;
      let match;

      while ((match = sitemapRegex.exec(robotsText)) !== null) {
        sitemaps.push(match[1]);
        s.message(`Found sitemap in robots.txt: ${match[1]}`);
      }
    }
  } catch (error) {
    log.error(`Error fetching robots.txt from ${domain}:`);
  }

  // check domain/sitemap.xml
  try {
    const sitemapUrl = `https://${domain}/sitemap.xml`;
    const sitemapResponse = await fetch(sitemapUrl);

    if (sitemapResponse.ok) {
      sitemaps.push(sitemapUrl);
    }
  } catch (error) {
    console.error(`Error fetching sitemap.xml from ${domain}:`, error);
  }

  // avoid duplicates
  sitemaps = Array.from(new Set(sitemaps));

  s.stop(`Found ${sitemaps.length} sitemaps.`);
  return sitemaps;
}

export const getSitemapsUrls = async (sitemaps: string[]) => {
  s.start("Fetching sitemap URLs");

  let urls: string[] = [];

  for (const sitemap of sitemaps) {
    const Sitemap = new Sitemapper({
      url: sitemap,
    });

    const { sites } = await Sitemap.fetch();
    urls = [...urls, ...sites];
    s.message(`Found ${sites.length} URLs in sitemap: ${sitemap}`);
  }

  // avoid duplicates
  urls = Array.from(new Set(urls));

  s.stop(`Found ${urls.length} URLs.`);
  return urls;
}
