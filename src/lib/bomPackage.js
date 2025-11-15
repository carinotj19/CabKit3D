import JSZip from 'jszip';

export async function buildBomPackageZip({ sku, csvText, glbBlob }) {
  const zip = new JSZip();
  zip.file(`${sku}-bom.csv`, csvText);
  zip.file(`${sku}.glb`, glbBlob);
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
