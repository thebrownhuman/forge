import type { SdModule } from './schema';
import { validateAllModules } from './schema';
import { framework } from './modules/framework';
import { caching, databases, estimation, loadBalancing } from './modules/concepts-a';
import { apiEdge, asyncQueues, consistency, observability, replicationSharding } from './modules/concepts-b';
import { chatSystem, newsFeed, rateLimiter, urlShortener } from './modules/cases-a';
import { fileStorage, rideHailing, videoPlatform, webCrawler } from './modules/cases-b';

/**
 * The System Design track. Ordered as it should be worked: the method first,
 * then the concepts each case will draw on, then the cases themselves.
 *
 * This track is scheduled AFTER the DSA target date of June 2027. It exists now
 * so the material is ready, not so it competes with the round you are sitting first.
 */
export const SD_MODULES: SdModule[] = [
  framework,
  // Concepts
  estimation,
  loadBalancing,
  caching,
  databases,
  replicationSharding,
  consistency,
  asyncQueues,
  apiEdge,
  observability,
  // Cases
  urlShortener,
  rateLimiter,
  newsFeed,
  chatSystem,
  webCrawler,
  videoPlatform,
  fileStorage,
  rideHailing,
];

export const SD_BY_ID: Record<string, SdModule> = Object.fromEntries(
  SD_MODULES.map((m) => [m.id, m]),
);

export const SD_ISSUES = validateAllModules(SD_MODULES);

export const SD_TOTAL_HOURS = SD_MODULES.reduce((n, m) => n + m.estHours, 0);

export const SD_COUNTS = {
  framework: SD_MODULES.filter((m) => m.kind === 'framework').length,
  concepts: SD_MODULES.filter((m) => m.kind === 'concept').length,
  cases: SD_MODULES.filter((m) => m.kind === 'case').length,
  tradeoffs: SD_MODULES.reduce(
    (n, m) => n + m.tradeoffs.length + (m.caseStudy?.deepDives.length ?? 0),
    0,
  ),
  figures: SD_MODULES.reduce(
    (n, m) => n + m.figures.length + (m.caseStudy?.estimation.length ?? 0),
    0,
  ),
};
