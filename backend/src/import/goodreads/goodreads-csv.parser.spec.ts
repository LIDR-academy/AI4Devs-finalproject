import { BadRequestException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  cleanGoodreadsIsbn,
  parseCsvRecordLine,
  parseGoodreadsCsv,
} from './goodreads-csv.parser';

const minFixturePath = join(
  __dirname,
  '../../../test/fixtures/goodreads_library_export.min.csv',
);
const realFixturePath = join(
  __dirname,
  '../../../test/fixtures/goodreads_library_export.csv',
);

describe('cleanGoodreadsIsbn', () => {
  it('strips Excel-style wrapper from ISBN13', () => {
    expect(cleanGoodreadsIsbn('="9780618640157"')).toBe('9780618640157');
    expect(cleanGoodreadsIsbn('=""842705291X""')).toBe('842705291X');
  });

  it('returns null for empty values', () => {
    expect(cleanGoodreadsIsbn('')).toBeNull();
    expect(cleanGoodreadsIsbn('   ')).toBeNull();
    expect(cleanGoodreadsIsbn('=""""')).toBeNull();
  });
});

describe('parseCsvRecordLine', () => {
  it('parses quoted fields with commas inside', () => {
    expect(parseCsvRecordLine('"a","b,c","d"')).toEqual(['a', 'b,c', 'd']);
  });

  it('parses unquoted fields with selective quoting', () => {
    expect(
      parseCsvRecordLine(
        '214506802,Hacia mareas malditas,Laura  Díaz,"Díaz, Laura",,=""842705291X""',
      ),
    ).toEqual([
      '214506802',
      'Hacia mareas malditas',
      'Laura  Díaz',
      'Díaz, Laura',
      '',
      '=842705291X',
    ]);
  });

  it('unescapes doubled quotes', () => {
    expect(parseCsvRecordLine('"say ""hi""",next')).toEqual(['say "hi"', 'next']);
  });
});

describe('parseGoodreadsCsv', () => {
  it('parses the minimal fixture with edge cases', () => {
    const content = readFileSync(minFixturePath, 'utf8');
    const result = parseGoodreadsCsv(content);

    expect(result.meta.total_rows).toBe(6);
    expect(result.meta.parsed_rows).toBe(6);
    expect(result.rows).toHaveLength(6);

    const hobbit = result.rows[0];
    expect(hobbit.title).toBe('The Hobbit');
    expect(hobbit.isbn).toBe('0618640150');
    expect(hobbit.isbn13).toBe('9780618640157');

    const dune = result.rows[1];
    expect(dune.date_read).toBe('2024/05/01');
    expect(dune.date_added).toBe('2024/06/20');

    const noIsbn = result.rows[3];
    expect(noIsbn.isbn).toBeNull();
    expect(noIsbn.isbn13).toBeNull();
    expect(noIsbn.binding).toBe('Kindle Edition');

    const finishedNoDate = result.rows[5];
    expect(finishedNoDate.exclusive_shelf).toBe('read');
    expect(finishedNoDate.date_read).toBe('');
    expect(finishedNoDate.read_count).toBe('2');
  });

  it('parses the real Goodreads library export fixture', () => {
    const content = readFileSync(realFixturePath, 'utf8');
    const result = parseGoodreadsCsv(content);

    expect(result.meta).toEqual({
      total_rows: 1167,
      parsed_rows: 1167,
      skipped_rows: 0,
      mapped_rows: 1167,
    });
    expect(result.warnings).toHaveLength(0);

    const first = result.rows[0];
    expect(first.title).toBe('Hacia mareas malditas');
    expect(first.author).toBe('Laura  Díaz');
    expect(first.isbn).toBe('842705291X');
    expect(first.isbn13).toBe('9788427052918');
    expect(first.exclusive_shelf).toBe('read');

    const noIsbn = result.rows.find((row) => row.book_id === '35295874');
    expect(noIsbn?.title).toContain('Culpa tuya');
    expect(noIsbn?.isbn).toBeNull();
    expect(noIsbn?.isbn13).toBeNull();

    const readWithoutDate = result.rows.filter(
      (row) => row.exclusive_shelf === 'read' && !row.date_read,
    );
    expect(readWithoutDate.length).toBe(10);
  });

  it('rejects empty files', () => {
    expect(() => parseGoodreadsCsv('')).toThrow(BadRequestException);
  });

  it('rejects missing required headers', () => {
    expect(() => parseGoodreadsCsv('"Title"\n"Only title"')).toThrow(
      BadRequestException,
    );
  });

  it('skips malformed rows and records warnings', () => {
    const content = `${readFileSync(minFixturePath, 'utf8')}\n"broken","row"`;
    const result = parseGoodreadsCsv(content);
    expect(result.meta.parsed_rows).toBe(6);
    expect(result.meta.skipped_rows).toBe(1);
    expect(result.warnings[0]?.code).toBe('COLUMN_COUNT_MISMATCH');
  });
});
