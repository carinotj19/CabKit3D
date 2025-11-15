const DEFAULT_REVOKE_DELAY_MS = 750;

function triggerDownload(url, filename, revokeDelayMs = DEFAULT_REVOKE_DELAY_MS) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, revokeDelayMs);
}

export function downloadTextContent(content, filename, mime = 'text/plain') {
  if (typeof window === 'undefined') {
    return;
  }
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
}

export function downloadBlobContent(blob, filename) {
  if (typeof window === 'undefined') {
    return;
  }
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
}
