#!/usr/bin/env python3
"""Build the printable public sample from projected learner JSON, never originals.

Run with the bundled Python that includes reportlab and pypdf:
  python3 scripts/build-sample-workbook.py
  python3 scripts/build-sample-workbook.py --check

Defaults are relative to this script's repository, independent of current cwd.
Only public/ai-confidence-sample-workbook.pdf and its manifest are written.
PDF bytes are reproducible with identical input, script and ReportLab runtime.
The manifest hashes both the complete public projection and selected sample data.
No canonical lessons, instructor scripts, account data or external services load.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
from pathlib import Path
import re
import sys

from reportlab import Version as REPORTLAB_VERSION
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, Flowable,
)
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
SAMPLE_IDS = ['day-01', 'day-02', 'day-03']
CLEAR = ['Context', 'Lead with goal', 'Examples', 'Add constraints', 'Refine']
DENIED = {'demonstration', 'recording_notes', 'source_references', 'prerequisites'}
VERSION = '1.0'
PDF_NAME = 'ai-confidence-sample-workbook.pdf'
MANIFEST_NAME = 'ai-confidence-sample-workbook.manifest.json'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def stable(data):
    return json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')


def normalize(value):
    # PDF typography only: preserve wording and explicit template line breaks.
    return str(value).translate(str.maketrans({
        '\u2010': '-', '\u2011': '-', '\u2012': '-', '\u2013': '-',
        '\u2014': '-', '\u2212': '-', '\u00a0': ' ',
    }))


def escaped(value):
    return html.escape(normalize(value), quote=False)


def check_no_denied(value):
    if isinstance(value, dict):
        require(not DENIED.intersection(value), 'Instructor or internal provenance fields are not a public sample source')
        for child in value.values():
            check_no_denied(child)
    elif isinstance(value, list):
        for child in value:
            check_no_denied(child)


def nonempty(value, label):
    require(isinstance(value, str) and value.strip(), f'{label}: nonempty text required')


def validate(payload):
    require(isinstance(payload, dict) and payload.get('schema_version') == '1.0', 'Expected version 1.0 public projection')
    course = payload.get('course', {})
    require(course.get('id') == '21-days-to-ai-confidence', 'Unexpected course')
    require(course.get('clear') == CLEAR, 'Exact CLEAR expansion required')
    require(course.get('price_usd') == 79, 'Recovered course price must remain USD 79')
    require(payload.get('preview', {}).get('sample_ids') == SAMPLE_IDS, 'Expected only sample days 01-03')
    samples = payload.get('samples')
    require(isinstance(samples, list) and [s.get('id') for s in samples] == SAMPLE_IDS, 'Sample array must be exactly day-01, day-02, day-03')
    check_no_denied(payload)
    for index, sample in enumerate(samples, 1):
        require(sample.get('order') == index and sample.get('phase') == 1, 'Sample order/phase mismatch')
        require(sample.get('status') == {
            'content': 'content-complete', 'recording': 'recording-pending',
            'author_review': 'review-pending',
        }, 'Sample status must retain pending author review and recording')
        for key in ['title', 'objective', 'reflection']:
            nonempty(sample.get(key), f'{sample["id"]}.{key}')
        require(isinstance(sample.get('estimated_minutes'), int) and sample['estimated_minutes'] > 0, 'Positive written-preview estimate required')
        exercise = sample.get('exercise', {})
        nonempty(exercise.get('artifact_name'), 'artifact_name')
        nonempty(exercise.get('transfer_option'), 'transfer_option')
        for key, minimum in [('instructions', 4), ('success_criteria', 3)]:
            require(isinstance(exercise.get(key), list) and len(exercise[key]) >= minimum, f'Incomplete exercise {key}')
            for item in exercise[key]:
                nonempty(item, key)
        require(isinstance(exercise.get('writing_fields'), list) and len(exercise['writing_fields']) >= 4, 'Writing fields required')
        for field in exercise['writing_fields']:
            nonempty(field.get('label'), 'writing label')
            nonempty(field.get('hint'), 'writing hint')
            require(type(field.get('lines')) is int and 2 <= field['lines'] <= 3, 'Each canonical writing field needs 2-3 lines')
        require(isinstance(sample.get('prompts'), list) and sample['prompts'], 'Reusable prompts required')
        for prompt in sample['prompts']:
            for key in ['id', 'title', 'when_to_use', 'template']:
                nonempty(prompt.get(key), f'prompt.{key}')
            require(re.fullmatch(f'd0{index}-p[0-9]{{2}}', prompt['id']), 'Prompt ID must belong to selected day')
        check = sample.get('check', {})
        require(check.get('type') in ['questions', 'rubric'], 'Questions or rubric required')
        require(isinstance(check.get('items'), list) and len(check['items']) >= 3, 'Answered checks required')
        nonempty(check.get('pass_rule'), 'pass_rule')
        for item in check['items']:
            for key in ['question', 'answer', 'explanation']:
                nonempty(item.get(key), f'check.{key}')
    return samples


class RuledLines(Flowable):
    """Actual printable rules, with room for handwriting on each requested line."""

    def __init__(self, count, width, line_height=18):
        super().__init__()
        self.count = count
        self.width = width
        self.height = count * line_height
        self.line_height = line_height

    def draw(self):
        self.canv.setStrokeColor(colors.HexColor('#888888'))
        self.canv.setLineWidth(.45)
        for i in range(self.count):
            y = self.height - (i + 1) * self.line_height + 2
            self.canv.line(0, y, self.width, y)


def styles():
    common = dict(fontName='Times-Roman', fontSize=11, leading=14, textColor=colors.black,
                  spaceAfter=6, allowWidows=0, allowOrphans=0)
    return {
        'body': ParagraphStyle('Body', **common),
        'bold': ParagraphStyle('Bold', **{**common, 'fontName': 'Times-Bold'}),
        'title': ParagraphStyle('Title', fontName='Helvetica-Bold', fontSize=24, leading=29,
                                textColor=colors.black, alignment=TA_CENTER, spaceAfter=18),
        'subtitle': ParagraphStyle('Subtitle', fontName='Helvetica', fontSize=16, leading=20,
                                   textColor=colors.black, alignment=TA_CENTER, spaceAfter=14),
        'h1': ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=18, leading=22,
                             textColor=colors.black, spaceAfter=12, keepWithNext=True),
        'h2': ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=12, leading=15,
                             textColor=colors.black, spaceBefore=8, spaceAfter=5, keepWithNext=True),
        'field': ParagraphStyle('Field', fontName='Times-Bold', fontSize=11, leading=14,
                                textColor=colors.black, spaceBefore=5, spaceAfter=2, keepWithNext=True),
        'hint': ParagraphStyle('Hint', **{**common, 'spaceAfter': 1, 'keepWithNext': True}),
        'list': ParagraphStyle('List', **{**common, 'leftIndent': 14, 'firstLineIndent': -14, 'spaceAfter': 4}),
        'prompt': ParagraphStyle('Prompt', fontName='Helvetica', fontSize=11, leading=13.5,
                                 textColor=colors.black, borderColor=colors.HexColor('#777777'),
                                 borderWidth=.5, borderPadding=8, spaceBefore=8, spaceAfter=12,
                                 leftIndent=8, rightIndent=8, splitLongWords=True),
        'small': ParagraphStyle('Small', fontName='Helvetica', fontSize=9, leading=12,
                                textColor=colors.black, spaceAfter=5),
    }


def paragraph(value, style):
    return Paragraph(escaped(value).replace('\n', '<br/>'), style)


def labeled(label, value, style):
    return Paragraph(f'<b>{escaped(label)}</b> {escaped(value)}', style)


def numbered(items, style):
    return [Paragraph(f'{i}. {escaped(item)}', style) for i, item in enumerate(items, 1)]


def bullets(items, style):
    return [Paragraph(f'&#8226; {escaped(item)}', style) for item in items]


def deterministic_canvas(*args, **kwargs):
    kwargs['invariant'] = 1
    return canvas.Canvas(*args, **kwargs)


def footer(pdf_canvas, doc):
    pdf_canvas.saveState()
    pdf_canvas.setFillColor(colors.black)
    pdf_canvas.setFont('Helvetica', 9)
    pdf_canvas.drawString(doc.leftMargin, .3 * inch, '21 Days to AI Confidence | Sample workbook Days 1-3')
    pdf_canvas.drawRightString(letter[0] - doc.rightMargin, .3 * inch, str(doc.page))
    pdf_canvas.restoreState()


def create_pdf(payload, output):
    samples = validate(payload)
    st = styles()
    course = payload['course']
    doc = SimpleDocTemplate(str(output), pagesize=letter, leftMargin=.7 * inch,
                            rightMargin=.7 * inch, topMargin=.6 * inch, bottomMargin=.55 * inch,
                            title='21 Days to AI Confidence - Sample workbook Days 1-3',
                            author=course['author'], subject='Written public sample; author review and recordings pending',
                            pageCompression=1)
    story = [Spacer(1, .55 * inch), paragraph(course['title'], st['title']),
             paragraph('Sample workbook - Days 1-3', st['subtitle']),
             paragraph(f'{course["academy"]}\n{course["author"]}', st['body']), Spacer(1, 14)]
    story.append(paragraph('This workbook goes with the first three written lessons. Use a simple task of your own or try the sample exercise. Keep your notes and the answer you checked so you can use them in the next lesson.', st['body']))
    story.append(labeled('CLEAR:', '; '.join(course['clear']) + '.', st['body']))
    story.append(paragraph('Written content is complete, while author review and recordings remain pending. The full self-paced course is USD 79 and coming soon. This sample does not establish paid enrollment or a learner account.', st['body']))
    story.append(paragraph('Use the original numbered days in order and keep each named artifact for the next sample. Written-preview estimates cover reading, practice and checks, excluding the planned demonstration. All messages remain drafts, and sending or changing a record is a separate human decision.', st['body']))
    story.append(paragraph('In this sample', st['h2']))
    story.extend(bullets([f'Day {s["order"]}: {s["title"]} - {s["estimated_minutes"]} estimated minutes' for s in samples], st['list']))
    story.append(paragraph('The answer key includes all questions, answers, explanations and completion rules.', st['body']))

    for sample in samples:
        story.append(PageBreak())
        story.append(paragraph(f'Day {sample["order"]} {sample["title"]}', st['h1']))
        story.append(labeled('Learning objective:', sample['objective'], st['body']))
        story.append(labeled('Written preview estimate:', f'{sample["estimated_minutes"]} minutes for reading, practice and checks; planned demonstration excluded.', st['body']))
        story.append(labeled('Save as:', sample['exercise']['artifact_name'], st['body']))
        story.append(paragraph('Your task', st['h2']))
        story.extend(numbered(sample['exercise']['instructions'], st['list']))
        story.append(paragraph('Success criteria', st['h2']))
        story.extend(bullets(sample['exercise']['success_criteria'], st['list']))
        story.append(labeled('Another way to practice:', sample['exercise']['transfer_option'], st['body']))
        for prompt in sample['prompts']:
            story.append(paragraph(prompt['title'], st['h2']))
            story.append(paragraph(prompt['when_to_use'], st['body']))
            story.append(KeepTogether([paragraph(prompt['template'], st['prompt'])]))

        story.append(PageBreak())
        story.append(paragraph(f'Day {sample["order"]} Working space', st['h1']))
        for field in sample['exercise']['writing_fields']:
            story.append(KeepTogether([
                paragraph(field['label'], st['field']), paragraph(field['hint'], st['hint']),
                RuledLines(field['lines'], doc.width), Spacer(1, 3),
            ]))
        story.append(paragraph('Check and reflect', st['h2']))
        story.extend(numbered([item['question'] for item in sample['check']['items']], st['list']))
        story.append(paragraph(sample['reflection'], st['body']))
        story.append(RuledLines(2, doc.width))

    story.append(PageBreak())
    story.append(paragraph('Check answers and completion rules', st['h1']))
    for sample in samples:
        section = [paragraph(f'Day {sample["order"]} {sample["title"]}', st['h2'])]
        for i, item in enumerate(sample['check']['items'], 1):
            section.extend([
                paragraph(f'{i}. {item["question"]}', st['bold']),
                labeled('Answer or scoring:', item['answer'], st['body']),
                paragraph(item['explanation'], st['body']),
            ])
        section.append(labeled('Completion rule:', sample['check']['pass_rule'], st['body']))
        story.append(KeepTogether(section))
    doc.build(story, onFirstPage=footer, onLaterPages=footer, canvasmaker=deterministic_canvas)


def source_info(payload, source_bytes):
    return {
        'schema_version': VERSION, 'generator_version': VERSION,
        'course_id': payload['course']['id'], 'sample_ids': SAMPLE_IDS,
        'source_file': 'src/data/course-preview.json',
        'source_json_sha256': sha256(source_bytes),
        'sample_source_sha256': sha256(stable({'course': payload['course'], 'samples': payload['samples']})),
        'content_revision': payload['content_revision'],
        'generator_sha256': sha256(Path(__file__).read_bytes()),
        'reportlab_version': REPORTLAB_VERSION,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=ROOT / 'src/data/course-preview.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'public' / PDF_NAME)
    parser.add_argument('--manifest', type=Path, default=ROOT / 'public' / MANIFEST_NAME)
    parser.add_argument('--check', action='store_true', help='Verify existing PDF/manifest freshness without writing')
    args = parser.parse_args()
    source_bytes = args.source.read_bytes()
    payload = json.loads(source_bytes)
    samples = validate(payload)
    expected = source_info(payload, source_bytes)
    if args.check:
        manifest = json.loads(args.manifest.read_text())
        require(all(manifest.get(key) == value for key, value in expected.items()), 'Workbook source/generator manifest is stale; rebuild sample PDF')
        require(manifest.get('pdf_sha256') == sha256(args.output.read_bytes()), 'Workbook PDF hash differs from manifest')
        print(json.dumps({'status': 'fresh', 'pdf': str(args.output), 'pages': manifest['pages'], **expected}, indent=2))
        return
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_name(args.output.name + '.tmp')
    try:
        create_pdf(payload, temporary)
        pages = len(PdfReader(str(temporary)).pages)
        require(pages > 0, 'Empty PDF')
        os.replace(temporary, args.output)
    finally:
        temporary.unlink(missing_ok=True)
    fields = [{'id': sample['id'], 'field_lines': sum(field['lines'] for field in sample['exercise']['writing_fields']), 'reflection_lines': 2} for sample in samples]
    manifest = {
        **expected, 'pdf_file': 'public/ai-confidence-sample-workbook.pdf',
        'pdf_filename': args.output.name, 'pdf_sha256': sha256(args.output.read_bytes()),
        'pages': pages, 'page_size': 'Letter portrait', 'body_font_points': 11,
        'writing_lines': fields, 'total_ruled_lines': sum(item['field_lines'] + item['reflection_lines'] for item in fields),
        'answered_checks': sum(len(sample['check']['items']) for sample in samples),
        'text_normalization': 'Typographic Unicode dash variants become ASCII hyphens; nonbreaking spaces become ordinary spaces. Wording and template line breaks are preserved.',
        'visual_review': 'Required separately after generation; this manifest checks freshness, not inspected layout.',
    }
    args.manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'status': 'generated', 'pdf': str(args.output), 'manifest': str(args.manifest), **manifest}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, TypeError, OSError) as error:
        print(f'Sample workbook build failed: {error}', file=sys.stderr)
        sys.exit(1)
