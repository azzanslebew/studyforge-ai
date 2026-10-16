import { jsPDF } from 'jspdf';

export function exportLessonToMarkdown(lesson) {
  if (!lesson) return;

  let md = `# ${lesson.title}\n\n`;
  md += `**Subjek:** ${lesson.subject || 'Umum'}  \n`;
  md += `**Dibuat:** ${new Date(lesson.createdAt).toLocaleDateString('id-ID')}  \n\n`;

  if (lesson.overview) {
    md += `## Gambaran Umum (Overview)\n${lesson.overview}\n\n`;
  }

  if (lesson.learningObjectives && lesson.learningObjectives.length > 0) {
    md += `## Tujuan Pembelajaran\n`;
    lesson.learningObjectives.forEach((obj, idx) => {
      md += `${idx + 1}. ${obj}\n`;
    });
    md += `\n`;
  }

  if (lesson.keyConcepts && lesson.keyConcepts.length > 0) {
    md += `## Konsep Kunci\n`;
    lesson.keyConcepts.forEach(c => {
      md += `* **${c.name}:** ${c.definition}\n`;
    });
    md += `\n`;
  }

  if (lesson.detailedSections && lesson.detailedSections.length > 0) {
    lesson.detailedSections.forEach(sec => {
      md += `## ${sec.heading}\n${sec.content}\n\n`;
    });
  }

  if (lesson.terminology && lesson.terminology.length > 0) {
    md += `## Terminologi & Istilah Penting\n`;
    lesson.terminology.forEach(t => {
      md += `* **${t.term}:** ${t.definition}\n`;
    });
    md += `\n`;
  }

  if (lesson.practicalExamples && lesson.practicalExamples.length > 0) {
    md += `## Contoh Kasus Nyata\n`;
    lesson.practicalExamples.forEach(ex => {
      md += `### ${ex.title}\n${ex.description}\n\n`;
    });
  }

  if (lesson.formulas && lesson.formulas.length > 0) {
    md += `## Rumus & Persamaan\n`;
    lesson.formulas.forEach(f => {
      md += `* **${f.name}:** \`${f.formula}\`\n  *Penjelasan:* ${f.explanation}\n`;
    });
    md += `\n`;
  }

  if (lesson.commonMisconceptions && lesson.commonMisconceptions.length > 0) {
    md += `## Kekeliruan Umum (Misconceptions)\n`;
    lesson.commonMisconceptions.forEach(m => {
      md += `* ❌ **Mitos:** ${m.misconception}\n  * ✅ **Fakta:** ${m.correction}\n`;
    });
    md += `\n`;
  }

  if (lesson.keyTakeaways && lesson.keyTakeaways.length > 0) {
    md += `## Poin Inti Rangkuman (Key Takeaways)\n`;
    lesson.keyTakeaways.forEach(k => {
      md += `* ${k}\n`;
    });
    md += `\n`;
  }

  if (lesson.reviewQuestions && lesson.reviewQuestions.length > 0) {
    md += `## Pertanyaan Refleksi & Ujian\n`;
    lesson.reviewQuestions.forEach((q, idx) => {
      md += `${idx + 1}. ${q}\n`;
    });
    md += `\n`;
  }

  md += `---\n*Dihasilkan secara eksklusif oleh StudyForge AI — Learn Smarter. Understand Deeper.*\n`;

  // Download markdown blob
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${lesson.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_StudyForge.md`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportLessonToPdf(lesson) {
  if (!lesson) return;

  try {
    const doc = new jsPDF();
    const margin = 14;
    let y = 20;

    // Header Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // #4F46E5 Indigo
    doc.text('StudyForge AI', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Rangkuman Materi & Catatan Belajar', 140, y);

    y += 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, 196, y);

    // Title
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(lesson.title || 'Materi Belajar', 180);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 7;

    // Metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Mata Kuliah / Subjek: ${lesson.subject || 'Umum'} | Tanggal: ${new Date(lesson.createdAt).toLocaleDateString('id-ID')}`, margin, y);
    y += 8;

    // Helper for page break
    const checkPageBreak = (neededHeight) => {
      if (y + neededHeight > 280) {
        doc.addPage();
        y = 20;
      }
    };

    // Overview
    if (lesson.overview) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(67, 56, 202);
      doc.text('1. Gambaran Umum (Overview)', margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const overviewLines = doc.splitTextToSize(lesson.overview, 180);
      checkPageBreak(overviewLines.length * 5 + 4);
      doc.text(overviewLines, margin, y);
      y += overviewLines.length * 5 + 6;
    }

    // Key Concepts
    if (lesson.keyConcepts && lesson.keyConcepts.length > 0) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(67, 56, 202);
      doc.text('2. Konsep-Konsep Kunci', margin, y);
      y += 6;

      lesson.keyConcepts.forEach((kc) => {
        const conceptText = `• ${kc.name}: ${kc.definition}`;
        const lines = doc.splitTextToSize(conceptText, 176);
        checkPageBreak(lines.length * 5 + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(lines, margin + 4, y);
        y += lines.length * 5 + 3;
      });
      y += 4;
    }

    // Key Takeaways
    if (lesson.keyTakeaways && lesson.keyTakeaways.length > 0) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(67, 56, 202);
      doc.text('3. Poin Rangkuman Penting (Takeaways)', margin, y);
      y += 6;

      lesson.keyTakeaways.forEach((k) => {
        const lines = doc.splitTextToSize(`✓ ${k}`, 176);
        checkPageBreak(lines.length * 5 + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(lines, margin + 4, y);
        y += lines.length * 5 + 2;
      });
      y += 6;
    }

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`StudyForge AI — Halaman ${i} dari ${pageCount}`, margin, 290);
    }

    doc.save(`${(lesson.title || 'Materi').replace(/[^a-zA-Z0-9_-]/g, '_')}_StudyForge.pdf`);
  } catch (err) {
    console.error('PDF export failed, using window print:', err);
    window.print();
  }
}
