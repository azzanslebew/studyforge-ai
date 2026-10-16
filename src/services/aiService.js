/**
 * Client AI Service
 * Connects to the StudyForge AI backend server (/api/ai/...)
 * Provides transparent fallback and clear status indicators.
 */

export async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check status ' + res.status);
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      aiConfig: {
        hasKey: false,
        model: 'gemini-1.5-flash',
        status: 'demo_mode_client_offline'
      }
    };
  }
}

export async function generateLessonApi(params) {
  try {
    const res = await fetch('/api/ai/generate-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client fallback:', err.message);
    // Client-side fallback if server is disconnected
    return {
      success: true,
      isDemoFallback: true,
      demoNotice: 'Mode Demo Offline: Server backend tidak terhubung. Menggunakan generator lokal.',
      data: createClientFallbackLesson(params.topic, params.text, params.sourceTitle)
    };
  }
}

export async function tutorChatApi(params) {
  try {
    const res = await fetch('/api/ai/tutor-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client fallback for tutor:', err.message);
    return {
      success: true,
      isDemoFallback: true,
      demoNotice: 'Mode Demo Offline: Menggunakan respon tutor lokal.',
      reply: `Halo! Saya Forge Tutor. Materi "${params.contextLesson?.title || 'ini'}" sangat menarik untuk didiskusikan.\n\nDalam mode lokal, Anda dapat menanyakan ringkasan konsep, contoh penerapan nyata, atau meminta latihan soal.\n\nApa bagian yang ingin kita diskusikan lebih mendalam?`
    };
  }
}

export async function generateFlashcardsApi(params) {
  try {
    const res = await fetch('/api/ai/generate-flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client fallback for flashcards:', err.message);
    return {
      success: true,
      isDemoFallback: true,
      demoNotice: 'Mode Demo Offline: Flashcard dibuat dengan generator lokal.',
      flashcards: [
        {
          front: `Apa konsep utama dari ${params.lessonTitle}?`,
          back: `Prinsip fundamental dan mekanisme kerja inti yang mengatur pengolahan data atau materi terkait.`,
          explanation: `Pahami fungsi intinya sebelum beranjak ke optimasi lanjutan.`,
          difficulty: 'easy'
        },
        {
          front: `Kapan pendekatan ini paling efektif diterapkan?`,
          back: `Saat menghadapi masalah yang menuntut struktur terorganisir dan efisiensi waktu pemrosesan.`,
          explanation: `Selalu perhatikan batasan masalah (constraints).`,
          difficulty: 'medium'
        },
        {
          front: `Sebutkan kesalahan umum yang sering terjadi pada ${params.lessonTitle}!`,
          back: `Menerapkan solusi tanpa memverifikasi apakah asumsi dasar dan syarat batas telah terpenuhi.`,
          explanation: `Lakukan pengujian pada edge cases.`,
          difficulty: 'hard'
        }
      ]
    };
  }
}

export async function generateQuizApi(params) {
  try {
    const res = await fetch('/api/ai/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client fallback for quiz:', err.message);
    return {
      success: true,
      isDemoFallback: true,
      demoNotice: 'Mode Demo Offline: Kuis dibuat dengan generator lokal.',
      quiz: {
        title: `Kuis Pemahaman: ${params.lessonTitle}`,
        questions: [
          {
            id: 'cq_1',
            type: 'multiple_choice',
            question: `Apa tujuan utama mempelajari ${params.lessonTitle}?`,
            options: [
              'Memahami prinsip kerja sistematis dan pemecahan masalah teruji',
              'Menghindari seluruh proses analisis mendalam',
              'Membuat solusi serumit mungkin tanpa efisiensi',
              'Menghilangkan kebutuhan validasi data'
            ],
            correctAnswer: 'Memahami prinsip kerja sistematis dan pemecahan masalah teruji',
            explanation: 'Materi ini dirancang untuk memberikan kerangka kerja analitis yang terstruktur.',
            difficulty: 'easy'
          },
          {
            id: 'cq_2',
            type: 'true_false',
            question: `Penyederhanaan masalah dengan abstraksi yang tepat dapat mempermudah pemeliharaan sistem.`,
            options: ['Benar', 'Salah'],
            correctAnswer: 'Benar',
            explanation: 'Abstraksi memisahkan logika utama dari detail implementasi teknis tingkat rendah.',
            difficulty: 'easy'
          }
        ]
      }
    };
  }
}

export async function generateExamApi(params) {
  try {
    const res = await fetch('/api/ai/generate-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client fallback for exam:', err.message);
    return {
      success: true,
      isDemoFallback: true,
      demoNotice: 'Mode Demo Offline: Try Out dibuat dengan generator lokal.',
      exam: {
        title: `Simulasi Ujian: ${params.subject}`,
        subject: params.subject,
        totalTimeMinutes: params.timeMinutes || 30,
        passingScore: 75,
        questions: [
          {
            id: 'ce_1',
            topic: params.lessonTitles?.[0] || params.subject,
            type: 'multiple_choice',
            question: `Dalam menganalisis efisiensi sistem pada subjek ${params.subject}, parameter manakah yang paling krusial?`,
            options: [
              'Waktu komputasi, penggunaan memori, dan skalabilitas',
              'Banyaknya baris kode yang ditulis',
              'Warna tema visual antarmuka',
              'Kecepatan mengetik pengembang'
            ],
            correctAnswer: 'Waktu komputasi, penggunaan memori, dan skalabilitas',
            explanation: 'Metrik performa objektif selalu mengukur waktu, ruang memori, dan ketahanan skala beban.',
            difficulty: 'medium'
          }
        ]
      }
    };
  }
}

function createClientFallbackLesson(topic, text, sourceTitle) {
  const title = topic || sourceTitle || 'Materi Pembelajaran';
  return {
    title,
    overview: `Materi "${title}" menyajikan konsep fundamental yang dirancang untuk memperkuat pemahaman analitis Anda. Pembahasan ini mencakup teori dasar, implementasi sistematis, serta contoh kasus kontekstual.`,
    learningObjectives: [
      `Memahami arsitektur dan prinsip inti dari ${title}.`,
      `Menganalisis perbedaan peran tiap komponen dalam sistem.`,
      `Menerapkan pemahaman konseptual pada studi kasus nyata.`
    ],
    keyConcepts: [
      {
        name: `Konsep Inti ${title}`,
        definition: 'Landasan pemikiran utama yang mendasari pembentukan dan cara kerja seluruh bagian materi.'
      }
    ],
    detailedSections: [
      {
        heading: '1. Pengantar Teori & Relevansi',
        content: `### Fondasi Konseptual\n**${title}** memainkan peran penting dalam memecahkan masalah kompleks dengan cara yang terstruktur.\n\n${text ? `*Berdasarkan bahan bacaan:* ${text.slice(0, 200)}...\n\n` : ''}Dengan menerapkan metodologi ini, Anda dapat menyederhanakan abstraksi dan meminimalkan galat.`
      }
    ],
    terminology: [
      { term: 'Metrik Evaluasi', definition: 'Ukuran kuantitatif untuk menilai performa dan keandalan.' }
    ],
    practicalExamples: [
      { title: 'Aplikasi di Dunia Nyata', description: 'Pemanfaatan prinsip ini dalam lingkungan produksi modern untuk meningkatkan efisiensi proses.' }
    ],
    formulas: [],
    commonMisconceptions: [
      { misconception: 'Pendekatan ini dapat menyelesaikan semua masalah tanpa pengecualian.', correction: 'Setiap metodologi memiliki batasan asumsi dan trade-off tersendiri.' }
    ],
    keyTakeaways: [
      'Pahami fondasi sebelum optimasi.',
      'Perhatikan batasan kondisi batas (edge cases).'
    ],
    reviewQuestions: [
      `Apa saja faktor penentu keberhasilan implementasi ${title}?`
    ],
    suggestedNextSteps: [
      'Lanjutkan ke latihan soal dan pembuatan kartu pengingat (flashcard).'
    ]
  };
}
