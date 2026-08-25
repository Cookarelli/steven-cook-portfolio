export function getSiteUrl(): URL | undefined {
  const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  return productionDomain ? new URL(`https://${productionDomain}`) : undefined;
}
