import { intro, log, spinner, text, outro, cancel } from '@clack/prompts';
import Sitemapper from 'sitemapper';
import { PlaywrightCrawler, Dataset, PuppeteerCrawler, CheerioCrawler } from 'crawlee';
import { getSitemaps, getSitemapsUrls } from './sitemaps';
import { router } from './crawler/routes';

export const s = spinner();

const main = async () => {
  intro("Welcome to notinsitemap! Let's get started.");
  
  const domain = await text({
    message: "Enter the domain you want to check for sitemap:",
    placeholder: "example.com",
    validate: (input) => {
      if (!input || input === "") {
        return "Please enter a domain.";
      }
      if (!/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g.test(input)) {
        return "Please enter a valid domain.";
      }
    }
  }) as string;

  const sitemaps = await getSitemaps(domain);

  const sitemapsUrls = await getSitemapsUrls(sitemaps);

  const crawledUrls = await crawlUrls(sitemapsUrls);

  const urlsNotInSitemap = sitemapsUrls.filter(url => !crawledUrls.includes(url));

  log.message(`Found ${urlsNotInSitemap.length} URLs not in sitemap:`);
  log.message("")
  urlsNotInSitemap.forEach(url => log.message(url));

  outro("Thanks for using notinsitemap! Goodbye.");
}

const crawlUrls = async (urls: string[]) => {
  log.info("Crawling URLs");

  let crawledUrls: string[] = [];

  const crawler = new CheerioCrawler({
    // Use the requestHandler to process each of the crawled pages.
    async requestHandler({ request, $, enqueueLinks, log }) {
        const title = $('title').text();
        log.info(`Title of ${request.loadedUrl} is '${title}'`);

        // Save results as JSON to ./storage/datasets/default
        // await Dataset.pushData({ title, url: request.loadedUrl });
        crawledUrls.push(request.loadedUrl);

        // Extract links from the current page
        // and add them to the crawling queue.
        await enqueueLinks();
    },

    // Let's limit our crawls to make our tests shorter and safer.
    maxRequestsPerCrawl: 100000,
  });


  // Add first URL to the queue and start the crawl.
  await crawler.run(urls);

  log.message(`Crawled ${crawledUrls.length} URLs.`);
  return crawledUrls;
}


main();