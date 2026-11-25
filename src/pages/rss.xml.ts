import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_CONFIG } from '../data/site-config';

export async function GET(context: { site?: URL }) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const knowledge = await getCollection('knowledge', ({ data }) => !data.draft);

  const items = [
    ...articles.map((a) => ({
      title: a.data.title,
      pubDate: new Date(a.data.publishDate),
      description: a.data.description,
      link: `/articles/${a.id}/`,
    })),
    ...knowledge.map((k) => ({
      title: k.data.title,
      pubDate: new Date(k.data.publishDate),
      description: k.data.description,
      link: `/knowledge/${k.id}/`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: `${SITE_CONFIG.siteName} (${SITE_CONFIG.englishName})`,
    description: SITE_CONFIG.homeSeo.description,
    site: context.site ?? SITE_CONFIG.domain,
    items,
  });
}
