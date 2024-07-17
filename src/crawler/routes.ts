import { createPlaywrightRouter, createPuppeteerRouter } from 'crawlee';
import { s } from '..';

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ enqueueLinks }) => {
    s.message(`enqueueing new URLs`);
    await enqueueLinks({
        label: 'detail',
    });
});

router.addHandler('detail', async ({ request, page, pushData }) => {
    const title = await page.title();
    s.message(`${title} - ${request.loadedUrl}`);

    await pushData({
        url: request.loadedUrl,
        title,
    });
});
