import { App } from '../types';
import { transformIpfsUrl } from './url';

export type ResolvedAppMetadata = NonNullable<App['metadata']> & {
  id: string;
  title: string;
};

const FETCH_TIMEOUT_MS = 10000;
const metadataPayloadCache = new Map<string, Promise<unknown | null>>();

export async function resolveAppMetadata(app: App): Promise<ResolvedAppMetadata> {
  const resolved: ResolvedAppMetadata = {
    id: cleanText(app.metadata?.id) || `${app.id}-metadata`,
    title: cleanText(app.metadata?.title) || cleanText(app.name) || `App ${app.id}`,
    description: cleanText(app.metadata?.description),
    externalUrl: cleanText(app.metadata?.externalUrl),
    logoUrl: cleanText(app.metadata?.logoUrl),
    bannerUrl: cleanText(app.metadata?.bannerUrl),
  };

  if (!app.metadataURI || resolved.logoUrl) {
    return resolved;
  }

  const fallback = await getMetadataFromIpfs(app.metadataURI);
  if (!fallback) {
    return resolved;
  }

  return {
    ...resolved,
    title: resolved.title || fallback.title || cleanText(app.name) || `App ${app.id}`,
    description: resolved.description || fallback.description,
    externalUrl: resolved.externalUrl || fallback.externalUrl,
    logoUrl: resolved.logoUrl || fallback.logoUrl,
    bannerUrl: resolved.bannerUrl || fallback.bannerUrl,
  };
}

async function getMetadataFromIpfs(metadataURI: string): Promise<Partial<ResolvedAppMetadata> | null> {
  const cacheKey = metadataURI.trim();
  let payloadPromise = metadataPayloadCache.get(cacheKey);

  if (!payloadPromise) {
    payloadPromise = fetchMetadataPayload(metadataURI);
    metadataPayloadCache.set(cacheKey, payloadPromise);
  }

  const payload = await payloadPromise;
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return parseAppMetadataPayload(payload, metadataURI);
}

async function fetchMetadataPayload(metadataURI: string): Promise<unknown | null> {
  const url = resolveIpfsUrl(metadataURI);
  if (!url) {
    return null;
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json, text/plain, */*',
      },
      signal: abortController.signal,
    });

    if (!response.ok) {
      return null;
    }

    const text = (await response.text()).trim();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Failed to fetch app metadata payload from IPFS:', error);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseAppMetadataPayload(payload: unknown, metadataURI: string): Partial<ResolvedAppMetadata> {
  return {
    title: cleanText(findStringValue(payload, ['title', 'name', 'appName', 'projectName'])),
    description: cleanText(findStringValue(payload, ['description', 'projectIntro', 'shortDescription'])),
    externalUrl: toAbsoluteUrl(cleanText(findStringValue(payload, ['external_url', 'externalUrl', 'website', 'projectWebsite']))),
    logoUrl: toMetadataAssetUrl(
      cleanText(findStringValue(payload, ['logo', 'logoUrl', 'icon', 'image', 've_world.featured_image', 'veWorld.featuredImage'])),
      metadataURI
    ),
    bannerUrl: toMetadataAssetUrl(
      cleanText(findStringValue(payload, ['banner', 'bannerUrl', 'cover', 've_world.banner', 'veWorld.banner'])),
      metadataURI
    ),
  };
}

function toAbsoluteUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value) || /^ipfs:\/\//i.test(value)) {
    return value;
  }

  if (/^[a-z0-9-]+\.[a-z]{2,}/i.test(value)) {
    return `https://${value}`;
  }

  return value;
}

function toMetadataAssetUrl(value: string | undefined, metadataURI: string): string | undefined {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value) || /^ipfs:\/\//i.test(value)) {
    return transformIpfsUrl(value);
  }

  const basePath = extractIpfsPath(metadataURI);
  if (!basePath) {
    return value;
  }

  const normalizedValue = value.replace(/^\.?\//, '');
  const folder = basePath.includes('/') ? basePath.slice(0, basePath.lastIndexOf('/') + 1) : `${basePath}/`;
  return transformIpfsUrl(`ipfs://${folder}${normalizedValue}`);
}

function resolveIpfsUrl(uri: string): string | null {
  const ipfsPath = extractIpfsPath(uri);
  if (!ipfsPath) {
    return /^https?:\/\//i.test(uri.trim()) ? uri.trim() : null;
  }

  return transformIpfsUrl(`ipfs://${ipfsPath}`);
}

function extractIpfsPath(uri: string): string | null {
  const trimmed = uri.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.toLowerCase().startsWith('ipfs://')) {
    return trimmed.slice('ipfs://'.length).replace(/^ipfs\//i, '').replace(/^\/+/, '');
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const path = parsed.pathname.replace(/^\/+/, '');
      const ipfsPathMatch = path.match(/ipfs\/(.+)/i);
      if (ipfsPathMatch?.[1]) {
        return ipfsPathMatch[1];
      }

      const hostCidMatch = parsed.hostname.match(/^([^.]+)\.ipfs\./i);
      if (hostCidMatch?.[1]) {
        const suffix = path ? `/${path}` : '';
        return `${hostCidMatch[1]}${suffix}`.replace(/^\/+/, '');
      }
    } catch {
      return null;
    }
    return null;
  }

  return trimmed.replace(/^\/?ipfs\//i, '').replace(/^\/+/, '') || null;
}

function findStringValue(payload: unknown, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = findPathValue(payload, key);
    const text = valueToText(value);
    if (text) {
      return text;
    }
  }

  return undefined;
}

function findPathValue(payload: unknown, keyPath: string): unknown {
  const segments = keyPath.split('.');
  let current: unknown = payload;

  for (const segment of segments) {
    if (!isRecord(current)) {
      return undefined;
    }

    const direct = current[segment];
    if (direct !== undefined) {
      current = direct;
      continue;
    }

    const match = Object.entries(current).find(([key]) => key.toLowerCase() === segment.toLowerCase());
    if (!match) {
      return undefined;
    }
    current = match[1];
  }

  return current;
}

function valueToText(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return cleanText(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const values = value
      .map((item) => valueToText(item))
      .filter((item): item is string => Boolean(item));
    return values.length > 0 ? values.join(', ') : undefined;
  }

  if (isRecord(value)) {
    const prioritizedKeys = ['title', 'name', 'description', 'url', 'value', 'image'];
    for (const key of prioritizedKeys) {
      const nested = valueToText(value[key]);
      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
}

function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null') {
    return undefined;
  }

  return trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
