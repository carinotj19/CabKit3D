import { DEFAULT_PARAMS } from '../store/useConfiguratorStore';

const SHARE_QUERY_KEY = 'cabkit';
const SHARE_KEYS = Object.keys(DEFAULT_PARAMS);
const PREVIEW_BASE =
  import.meta.env.VITE_SSR_PREVIEW_BASE && import.meta.env.VITE_SSR_PREVIEW_BASE.length > 0
    ? import.meta.env.VITE_SSR_PREVIEW_BASE
    : '/dist-ssr/index.html';

export { SHARE_QUERY_KEY };

export function buildShareUrl(params, baseHref) {
  const url = createBaseUrl(baseHref);
  if (!url) return '';
  url.searchParams.set(SHARE_QUERY_KEY, encodeShareToken(params));
  return url.toString();
}

export function buildPreviewUrl(params, options = {}) {
  const origin = options.origin || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!origin) return '';
  const previewBase = options.base || PREVIEW_BASE;
  const url = new URL(previewBase, origin);
  url.searchParams.set(SHARE_QUERY_KEY, encodeShareToken(params));
  return url.toString();
}

export function readParamsFromSearch(search) {
  if (!search) return null;
  const query = search.startsWith('?') ? search : `?${search}`;
  const params = new URLSearchParams(query);
  const token = params.get(SHARE_QUERY_KEY);
  if (!token) return null;
  try {
    const payload = decodeShareToken(token);
    return sanitizePayload(payload);
  } catch {
    return null;
  }
}

function encodeShareToken(params) {
  const payload = {};
  SHARE_KEYS.forEach((key) => {
    if (params[key] !== undefined) {
      payload[key] = params[key];
    }
  });
  const json = JSON.stringify(payload);
  return encodeURIComponent(base64Encode(json));
}

function decodeShareToken(value) {
  const decoded = base64Decode(decodeURIComponent(value));
  return JSON.parse(decoded);
}

function sanitizePayload(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const next = {};
  SHARE_KEYS.forEach((key) => {
    if (payload[key] === undefined) return;
    if (typeof DEFAULT_PARAMS[key] === 'number') {
      const num = Number(payload[key]);
      if (!Number.isFinite(num)) return;
      next[key] = num;
    } else {
      next[key] = payload[key];
    }
  });
  return Object.keys(next).length ? next : null;
}

function createBaseUrl(baseHref) {
  try {
    if (typeof baseHref === 'string' && baseHref.length > 0) {
      return new URL(baseHref, 'http://localhost:5173');
    }
    if (typeof window !== 'undefined') {
      return new URL(window.location.href);
    }
  } catch {
    return null;
  }
  return null;
}

function base64Encode(str) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(str);
  }
  return '';
}

function base64Decode(str) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64').toString('utf-8');
  }
  if (typeof window !== 'undefined' && window.atob) {
    return window.atob(str);
  }
  return '';
}
