import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const input = await FileBlob.load('formato_90_dias.xlsx');
const workbook = await SpreadsheetFile.importXlsx(input);
const summary = await workbook.inspect({
  kind: 'workbook,sheet,table',
  maxChars: 12000,
  tableMaxRows: 12,
  tableMaxCols: 24,
  tableMaxCellChars: 120,
});
console.log(summary.ndjson);
const sheets = await workbook.inspect({ kind: 'sheet', include: 'id,name', maxChars: 4000 });
console.log('SHEETS');
console.log(sheets.ndjson);
for (const name of ['PETROPERU']) {
  try {
    const region = await workbook.inspect({ kind: 'region', sheetId: name, range: 'A1:Z40', maxChars: 14000 });
    if (region.ndjson) {
      console.log(`REGION ${name}`);
      console.log(region.ndjson);
      const preview = await workbook.render({ sheetName: name, autoCrop: 'all', scale: 1.4, format: 'png' });
      await fs.writeFile('preview.png', new Uint8Array(await preview.arrayBuffer()));
      break;
    }
  } catch {}
}
