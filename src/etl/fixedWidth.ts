export type FixedWidthColumn = {
  name: string;
  start: number;
  end: number;
  trim?: boolean;
};

export type ParsedFixedWidthRow = Record<string, string>;

export function parseFixedWidthLine(line: string, columns: FixedWidthColumn[]): ParsedFixedWidthRow {
  const row: ParsedFixedWidthRow = {};

  for (const column of columns) {
    const raw = line.slice(column.start, column.end);
    row[column.name] = column.trim === false ? raw : raw.trim();
  }

  return row;
}

export function parseFixedWidthText(text: string, columns: FixedWidthColumn[]): ParsedFixedWidthRow[] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => parseFixedWidthLine(line, columns));
}

export function validateColumns(columns: FixedWidthColumn[]): string[] {
  const issues: string[] = [];

  for (const column of columns) {
    if (column.start < 0) issues.push(`${column.name}: start must be >= 0`);
    if (column.end <= column.start) issues.push(`${column.name}: end must be greater than start`);
  }

  const sorted = [...columns].sort((a, b) => a.start - b.start);
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (current.start < previous.end) {
      issues.push(`${current.name}: overlaps ${previous.name}`);
    }
  }

  return issues;
}
