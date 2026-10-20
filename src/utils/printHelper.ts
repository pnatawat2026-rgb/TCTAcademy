// Utility for opening clean popup A4 print windows and exporting files
// Solves iframe cutoff, scrolling limits, and CSS overflow: hidden constraints

export interface PrintA4Options {
  title: string;
  elementOrHtml: HTMLElement | string;
  orientation?: 'portrait' | 'landscape';
  autoPrint?: boolean;
}

/**
 * Opens a clean, dedicated popup window with the exact HTML and CSS,
 * formatted for A4 printing (portrait or landscape), without iframe limitations.
 */
export function printA4Document(options: PrintA4Options): boolean {
  const { title, elementOrHtml, orientation = 'portrait', autoPrint = true } = options;

  const contentHtml = typeof elementOrHtml === 'string' ? elementOrHtml : elementOrHtml.outerHTML;

  // Gather current styles and stylesheets
  let styles = '';
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    styles += node.outerHTML + '\n';
  });

  let printWindow: Window | null = null;
  try {
    printWindow = window.open('', '_blank', 'width=1100,height=900,menubar=no,toolbar=no,location=no,status=no');
  } catch (e) {
    printWindow = null;
  }

  if (!printWindow) {
    // Popup was blocked by browser sandbox -> Fallback to hidden iframe print
    const iframeId = 'tct-print-fallback-frame';
    let frame = document.getElementById(iframeId) as HTMLIFrameElement;
    if (frame && frame.parentNode) {
      frame.parentNode.removeChild(frame);
    }
    frame = document.createElement('iframe');
    frame.id = iframeId;
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    frame.style.visibility = 'hidden';
    document.body.appendChild(frame);

    const doc = frame.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>${styles}<style>@page{size:A4 ${orientation};margin:6mm;}body{background:white;margin:0;padding:12px;}.no-print{display:none !important;}</style></head><body>${contentHtml}</body></html>`);
      doc.close();
      setTimeout(() => {
        try {
          frame.contentWindow?.focus();
          frame.contentWindow?.print();
        } catch (err) {
          console.debug('Fallback frame print error:', err);
        }
      }, 500);
      return true;
    }
    return false;
  }

  const printHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Charm:wght@400;700&family=Sarabun:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  ${styles}
  <style>
    @page {
      size: A4 ${orientation};
      margin: ${orientation === 'landscape' ? '6mm' : '8mm'};
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      color: #0f172a !important;
      font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, sans-serif !important;
    }
    .no-print, button.no-print, .action-bar-print {
      display: none !important;
    }
    .print-sheet {
      width: 100% !important;
      max-width: ${orientation === 'landscape' ? '297mm' : '210mm'} !important;
      margin: 0 auto !important;
      background: white !important;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-after: always;
      }
    }
  </style>
</head>
<body class="bg-white">
  <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #002D5A; color: white; position: sticky; top: 0; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
    <div style="font-size: 14px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
      <span>📄 พิมพ์เอกสาร A4: ${title}</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="padding: 8px 18px; background: #005A9C; color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
        🖨️ สั่งพิมพ์ทันที (Print A4)
      </button>
      <button onclick="downloadHtmlFile()" style="padding: 8px 14px; background: #059669; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer;">
        📥 บันทึกไฟล์ (Save HTML)
      </button>
      <button onclick="window.close()" style="padding: 8px 14px; background: #334155; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer;">
        ✕ ปิดหน้าต่าง
      </button>
    </div>
  </div>

  <div class="print-sheet" style="padding: 16px;">
    ${contentHtml}
  </div>

  <script>
    function downloadHtmlFile() {
      const cloneDoc = document.documentElement.cloneNode(true);
      const topBar = cloneDoc.querySelector('.no-print');
      if (topBar) topBar.remove();
      const blob = new Blob(['<!DOCTYPE html>' + cloneDoc.outerHTML], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${title.replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_')}.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    ${autoPrint ? `
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          window.focus();
          window.print();
        } catch(e) {}
      }, 600);
    });
    ` : ''}
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(printHtml);
  printWindow.document.close();
  return true;
}

/**
 * Download complete HTML file for offline archival and local printing
 */
export function downloadDocumentHtml(filename: string, title: string, elementOrHtml: HTMLElement | string, orientation: 'portrait' | 'landscape' = 'portrait'): void {
  const contentHtml = typeof elementOrHtml === 'string' ? elementOrHtml : elementOrHtml.outerHTML;

  let styles = '';
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    styles += node.outerHTML + '\n';
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet">
  ${styles}
  <style>
    @page { size: A4 ${orientation}; margin: 8mm; }
    body { font-family: 'Sarabun', sans-serif; background: white; color: black; margin: 0; padding: 20px; }
  </style>
</head>
<body>
  ${contentHtml}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data rows as UTF-8 BOM CSV for Excel
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '');
    return `"${str.replace(/"/g, '""')}"`;
  };

  const csvContent = '\uFEFF' + [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
