/**
 * PDF Parsing Service
 * Extracts text from PDF files via server endpoint or client-side pdfjs.
 * Validates file size, detects image-only/scanned documents, and provides preview.
 */

export async function parsePdfFile(file) {
  if (!file) {
    throw new Error('File tidak ditemukan.');
  }

  // Size limit: 15MB
  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('Ukuran file PDF terlalu besar. Maksimum ukuran adalah 15MB.');
  }

  if (file.type && file.type !== 'application/pdf') {
    throw new Error('Format file bukan PDF. Silakan unggah dokumen berekstensi .pdf.');
  }

  // 1. Try server-side parsing endpoint
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/materials/parse-pdf', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text) {
        return {
          text: data.text,
          pageCount: data.pageCount || 1,
          characterCount: data.text.length,
          filename: file.name
        };
      }
    } else if (res.status === 422) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Dokumen PDF berupa scan gambar murni tanpa lapisan teks OCR.');
    }
  } catch (err) {
    if (err.message && err.message.includes('OCR')) {
      throw err;
    }
    console.warn('Server PDF parse failed, trying browser parser:', err.message);
  }

  // 2. Client-side fallback reading with FileReader / basic extraction
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function() {
      try {
        const typedArray = new Uint8Array(this.result);
        
        // Dynamic import of pdfjs-dist if in browser
        let pdfjsLib;
        try {
          pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
          // Point worker to standard CDN or fallback
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
          }
        } catch (libErr) {
          console.warn('pdfjs-dist import error, using text fallback', libErr);
        }

        if (pdfjsLib && pdfjsLib.getDocument) {
          const loadingTask = pdfjsLib.getDocument({ data: typedArray });
          const pdfDoc = await loadingTask.promise;
          let fullText = '';
          const numPages = pdfDoc.numPages;

          for (let pageNum = 1; pageNum <= Math.min(numPages, 30); pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `\n[Halaman ${pageNum}]\n` + pageText;
          }

          const trimmed = fullText.trim();
          if (!trimmed || trimmed.length < 30) {
            throw new Error('PDF ini tampaknya berupa hasil scan/foto gambar murni tanpa lapisan teks (OCR). Silakan gunakan dokumen dengan teks digital atau salin teksnya langsung.');
          }

          resolve({
            text: trimmed,
            pageCount: numPages,
            characterCount: trimmed.length,
            filename: file.name
          });
          return;
        }

        // If all else fails
        throw new Error('Tidak dapat mengekstrak teks dari file PDF ini secara otomatis. Silakan salin teks materi langsung ke tab "Teks Manual".');
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file di peramban.'));
    reader.readAsArrayBuffer(file);
  });
}
