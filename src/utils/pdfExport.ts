import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export interface PdfExportOptions {
  filename: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4';
  title?: string;
  marginMm?: number;
  scale?: number;
}

/**
 * Downloads any React DOM Element as a real, crisp, edge-to-edge A4 PDF file using jsPDF + html-to-image.
 * Calculates exact standard A4 pixel ratios (1122.5px × 793.7px @ 96dpi) so it completely fills the A4 page
 * with zero unwanted white borders or stretching.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  options: PdfExportOptions
): Promise<boolean> {
  const {
    filename,
    orientation = 'landscape',
    format = 'a4',
    marginMm = 0,
    scale = 2.5
  } = options;

  try {
    // 0. Ensure fonts are fully loaded before capturing
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const isLandscape = orientation === 'landscape';
    // Exact standard A4 dimensions at 96 DPI for pixel-perfect rasterization
    const a4PxWidth = isLandscape ? 1122.5 : 793.7;

    const captureStyle = {
      width: `${a4PxWidth}px`,
      minWidth: `${a4PxWidth}px`,
      maxWidth: `${a4PxWidth}px`,
      borderRadius: '0px',
      boxShadow: 'none',
      transform: 'none',
      fontFamily: "'Sarabun', 'TH Sarabun New', 'Prompt', sans-serif"
    };

    // 1. Capture element with html-to-image preserving fonts
    let imgData: string;
    try {
      imgData = await toPng(element, {
        pixelRatio: scale,
        backgroundColor: '#FFFFFF',
        cacheBust: true,
        skipFonts: false,
        style: captureStyle,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('no-print')) {
            return false;
          }
          return true;
        }
      });
    } catch (fontErr) {
      console.warn('Fallback capture with skipFonts enabled:', fontErr);
      imgData = await toPng(element, {
        pixelRatio: scale,
        backgroundColor: '#FFFFFF',
        cacheBust: true,
        skipFonts: true,
        style: captureStyle,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('no-print')) {
            return false;
          }
          return true;
        }
      });
    }

    // A4 dimensions in mm: Landscape: 297x210, Portrait: 210x297
    const pdfWidth = isLandscape ? 297 : 210;
    const pdfHeight = isLandscape ? 210 : 297;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    const targetWidth = pdfWidth - (marginMm * 2);
    const targetHeight = pdfHeight - (marginMm * 2);

    // Calculate natural aspect ratio from captured image to fit page exactly without distortion or clipping
    const imgProps = pdf.getImageProperties(imgData);
    const aspectRatio = imgProps.height / imgProps.width;

    let renderWidth = targetWidth;
    let renderHeight = renderWidth * aspectRatio;

    // If slightly taller than A4 height, scale down proportionally to fit the entire page
    if (renderHeight > targetHeight) {
      renderHeight = targetHeight;
      renderWidth = renderHeight / aspectRatio;
    }

    const offsetX = marginMm + (targetWidth - renderWidth) / 2;
    const offsetY = marginMm + (targetHeight - renderHeight) / 2;

    pdf.addImage(
      imgData,
      'PNG',
      offsetX,
      offsetY,
      renderWidth,
      renderHeight,
      undefined,
      'FAST'
    );

    // Save triggers native browser download dialog / save to files on mobile
    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Failed to generate direct PDF via jsPDF:', error);
    // Fallback: try opening standalone printable document
    return printElementViaStandaloneWindow(element, options.title || filename, orientation);
  }
}

/**
 * Downloads multiple React DOM page elements sequentially into a single multi-page A4 PDF file.
 */
export async function downloadMultiPagePdf(
  elements: HTMLElement[],
  options: {
    filename: string;
    orientation?: 'portrait' | 'landscape';
    format?: 'a4';
    marginMm?: number;
    scale?: number;
  }
): Promise<boolean> {
  const {
    filename,
    orientation = 'portrait',
    format = 'a4',
    marginMm = 0,
    scale = 2.5
  } = options;

  try {
    // 0. Ensure fonts are fully loaded before capturing
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const isLandscape = orientation === 'landscape';
    const a4PxWidth = isLandscape ? 1122.5 : 793.7;
    const a4PxHeight = isLandscape ? 793.7 : 1122.5;
    const pdfWidth = isLandscape ? 297 : 210;
    const pdfHeight = isLandscape ? 210 : 297;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (!el) continue;
      if (i > 0) {
        pdf.addPage(format, orientation);
      }

      const captureStyle = {
        width: `${a4PxWidth}px`,
        minWidth: `${a4PxWidth}px`,
        maxWidth: `${a4PxWidth}px`,
        height: `${a4PxHeight}px`,
        minHeight: `${a4PxHeight}px`,
        maxHeight: `${a4PxHeight}px`,
        borderRadius: '0px',
        boxShadow: 'none',
        transform: 'none',
        fontFamily: "'Sarabun', 'TH Sarabun New', 'Prompt', sans-serif"
      };

      let imgData: string;
      try {
        imgData = await toPng(el, {
          pixelRatio: scale,
          backgroundColor: '#FFFFFF',
          cacheBust: true,
          skipFonts: false,
          style: captureStyle,
          filter: (node) => {
            if (node instanceof HTMLElement && node.classList.contains('no-print')) {
              return false;
            }
            return true;
          }
        });
      } catch (fontErr) {
        console.warn('Fallback capture with skipFonts enabled:', fontErr);
        imgData = await toPng(el, {
          pixelRatio: scale,
          backgroundColor: '#FFFFFF',
          cacheBust: true,
          skipFonts: true,
          style: captureStyle,
          filter: (node) => {
            if (node instanceof HTMLElement && node.classList.contains('no-print')) {
              return false;
            }
            return true;
          }
        });
      }

      const targetWidth = pdfWidth - (marginMm * 2);
      const targetHeight = pdfHeight - (marginMm * 2);

      pdf.addImage(
        imgData,
        'PNG',
        marginMm,
        marginMm,
        targetWidth,
        targetHeight,
        undefined,
        'FAST'
      );
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Failed to generate multi-page PDF via jsPDF:', error);
    return false;
  }
}

/**
 * Constructs an exact HTML document preserving all compiled stylesheets and fonts
 * perfectly styled for A4 page dimensions.
 */
function buildPrintHtml(
  element: HTMLElement,
  title: string,
  orientation: 'portrait' | 'landscape'
): string {
  const isLandscape = orientation === 'landscape';
  const pageWidthMm = isLandscape ? '297mm' : '210mm';

  // Extract all existing stylesheet links and style tags to preserve Tailwind and fonts
  const headNodes = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(node => node.outerHTML)
    .join('\n');

  const htmlContent = element.outerHTML;

  return `<!DOCTYPE html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    ${headNodes}
    <style>
      @page {
        size: A4 ${orientation};
        margin: 0mm !important;
      }
      *, *::before, *::after {
        box-sizing: border-box !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        background-color: #ffffff !important;
        font-family: 'TH Sarabun New', 'Sarabun', 'Prompt', sans-serif !important;
        color: #000000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .a4-print-sheet {
        width: 100% !important;
        max-width: ${pageWidthMm} !important;
        margin: 0 auto !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        background: #ffffff !important;
      }
      #printable-course-approval-sheet,
      #printable-course-exam-sheet,
      #printable-courses-portfolio-sheet {
        width: 210mm !important;
        max-width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 auto !important;
        padding: 8mm 10mm !important;
        box-shadow: none !important;
        border-radius: 0px !important;
        box-sizing: border-box !important;
        page-break-after: auto !important;
      }
      #certificate-print-area.certificate-landscape-box {
        width: 297mm !important;
        height: 210mm !important;
        min-height: 210mm !important;
        max-width: 297mm !important;
        max-height: 210mm !important;
        box-sizing: border-box !important;
        margin: 0 auto !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
      }
      #certificate-print-area.certificate-portrait-box {
        width: 210mm !important;
        height: 297mm !important;
        min-height: 297mm !important;
        max-width: 210mm !important;
        max-height: 297mm !important;
        box-sizing: border-box !important;
        margin: 0 auto !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
      }
      table {
        border-collapse: collapse !important;
        width: 100% !important;
        page-break-inside: auto !important;
      }
      tr {
        page-break-inside: avoid !important;
        page-break-after: auto !important;
      }
      thead {
        display: table-header-group !important;
      }
      @media print {
        .no-print { display: none !important; }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    </style>
  </head>
  <body class="bg-white p-0 m-0">
    <div class="a4-print-sheet">
      ${htmlContent}
    </div>
  </body>
</html>`;
}

/**
 * Opens a dedicated standalone printing window or an invisible printing iframe.
 * Ensures the print document exactly matches the on-screen display and fits standard A4.
 */
export function printElementViaStandaloneWindow(
  element: HTMLElement,
  title: string = 'TCT E-Training Document',
  orientation: 'portrait' | 'landscape' = 'landscape'
): boolean {
  try {
    const html = buildPrintHtml(element, title, orientation);

    let printWindow: Window | null = null;
    try {
      printWindow = window.open('', '_blank');
    } catch {
      printWindow = null;
    }

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        try {
          printWindow?.focus();
          printWindow?.print();
        } catch (e) {
          console.debug('Window print trigger notice:', e);
        }
      }, 350);
      return true;
    }

    // Popup blocker or iframe sandbox intercepted window.open -> use invisible iframe to print ONLY this element
    const iframeId = 'tct-print-frame';
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.debug('Iframe print error:', e);
        }
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 3000);
      }, 350);
      return true;
    }

    window.print();
    return true;
  } catch (err) {
    console.error('Standalone print error:', err);
    window.print();
    return false;
  }
}

