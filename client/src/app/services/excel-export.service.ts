import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';

export type RowHeightOptions = {
  fontSize?: number;
  padding?: number;
  maxHeight?: number;
  avgCharWidthFactor?: number;
};

export type HeaderCellOptions = {
  fillColor?: string;
  fontSize?: number;
};

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {

  /**
   * Estimates a wrapped-text row height in pixels based on content length vs column width.
   * Shared across export functions since ExcelJS doesn't auto-size row height for wrapped text.
   */
  calculateRowHeight(rowData: unknown[], columnWidths: number[], options: RowHeightOptions = {}): number {
    const fontSize = options.fontSize ?? 10;
    const padding = options.padding ?? 4;
    const maxHeight = options.maxHeight ?? 150;
    const avgCharWidth = options.avgCharWidthFactor ? fontSize * options.avgCharWidthFactor : 6.5;
    const lineHeightPixels = fontSize * 1.2;

    let maxLines = 1;

    rowData.forEach((value, colIndex) => {
      const text = (value?.toString() || '').trim();
      if (text === '') return;

      const columnWidth = columnWidths[colIndex];
      if (!columnWidth) return;

      const maxCharsPerLine = Math.floor((columnWidth * 7) / avgCharWidth);

      const words = text.split(' ');
      let lines = 1;
      let currentLineLength = 0;

      for (const word of words) {
        const wordLength = word.length;
        if (currentLineLength + wordLength + 1 > maxCharsPerLine) {
          lines++;
          currentLineLength = wordLength;
        } else {
          currentLineLength += wordLength + 1;
        }
      }

      const manualBreaks = (text.match(/\n/g) || []).length;
      lines = Math.max(lines, manualBreaks + 1);
      maxLines = Math.max(maxLines, lines);
    });

    return Math.min(maxLines * lineHeightPixels + padding, maxHeight);
  }

  /** Applies the shared header-row look (colored fill, bold white text, centered, thin borders). */
  styleHeaderCell(cell: ExcelJS.Cell, options: HeaderCellOptions = {}): void {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: options.fillColor ?? 'FF4472C4' }
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: options.fontSize ?? 11,
      name: 'Calibri'
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  /** Triggers a browser download of the given workbook as an .xlsx file. */
  async downloadWorkbook(workbook: ExcelJS.Workbook, fileName: string): Promise<void> {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
