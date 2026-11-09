import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const read = relative => readFile(new URL('../' + relative, import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const jsonBytes = await read('src/data/course-preview.json');
const content = JSON.parse(jsonBytes);
const manifest = JSON.parse(await read('public/ai-confidence-sample-workbook.manifest.json'));
const pdf = await read('public/ai-confidence-sample-workbook.pdf');
const html = await read('public/ai-confidence-sample-workbook.html');
if (manifest.source_json_sha256 !== hash(jsonBytes) || manifest.content_revision !== content.content_revision || manifest.pdf_sha256 !== hash(pdf)) {
 throw new Error('Sample workbook is stale. Rebuild the public projection and sample workbook from the same source before deploying. See ACADEMY_PREVIEW.md.');
}
if (!pdf.subarray(0,5).equals(Buffer.from('%PDF-')) || !html.toString('utf8').includes(content.content_revision) || JSON.stringify(manifest.sample_ids) !== JSON.stringify(content.preview.sample_ids)) {
 throw new Error('Sample workbook format, source revision or sample IDs do not match the public preview.');
}
console.log('Sample JSON, HTML and PDF have matching source revisions and verified file hashes.');
