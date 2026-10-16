/**
 * Dynamic fallback educational generator for StudyForge AI
 * Used when GEMINI_API_KEY is not configured or rate limits are reached.
 * Returns high-quality structured Indonesian learning content.
 */

export function generateFallbackLesson(topic, text, sourceTitle, educationLevel = 'Universitas', explanationStyle = 'Lengkap & Akademis') {
  const effectiveTitle = topic || sourceTitle || 'Materi Pembelajaran';
  const sampleExcerpt = text ? text.slice(0, 300) : '';

  return {
    title: effectiveTitle,
    overview: `Materi "${effectiveTitle}" merupakan pilar penting dalam kurikulum tingkat ${educationLevel}. Topik ini membahas prinsip-prinsip fundamental, metodologi operasional, serta pemecahan masalah praktis yang sering dijumpai dalam dunia akademik maupun industri modern. Melalui pemahaman yang mendalam terhadap konsep ini, Anda akan mampu menganalisis fenomena kompleks secara terstruktur dan kritis.`,
    learningObjectives: [
      `Memahami konsep fundamental, filosofi, dan arsitektur dasar dari ${effectiveTitle}.`,
      `Mampu mengidentifikasi perbedaan kunci antara elemen-elemen penting dalam materi ini.`,
      `Menerapkan formula, prinsip kerja, atau prosedur pemecahan masalah pada studi kasus nyata.`,
      `Mengevaluasi trade-off, batasan teknis, dan kelebihan pendekatan ini dalam skenario riil.`
    ],
    keyConcepts: [
      {
        name: `Prinsip Inti ${effectiveTitle}`,
        definition: `Kerangka acuan mendasar yang mengatur bagaimana seluruh komponen saling berinteraksi secara konsisten dan efisien.`
      },
      {
        name: `Komponen & Entitas Utama`,
        definition: `Struktur data, variabel, atau sub-sistem yang menjalankan fungsi spesifik untuk mencapai tujuan sistem.`
      },
      {
        name: `Mekanisme Evaluasi & Optimasi`,
        definition: `Metrik atau aturan baku yang digunakan untuk mengukur kinerja, kestabilan, atau validitas hasil keluaran.`
      }
    ],
    detailedSections: [
      {
        heading: `1. Landasan Teori & Konteks Dasar`,
        content: `### Mengapa Konsep Ini Penting?\nDalam dunia pendidikan dan industri, pemahaman terhadap **${effectiveTitle}** bukan sekadar menghafal definisi teoretis. ${sampleExcerpt ? `Berdasarkan materi yang dipelajari: "${sampleExcerpt}..." ` : ''}\n\nKonsep ini memfasilitasi abstraksi sehingga sistem yang sangat rumit dapat didekomposisi menjadi sub-bagian yang modular dan dapat diuji secara independen.\n\n* **Efisiensi:** Mengurangi beban komputasi / operasional.\n* **Keandalan:** Menjamin integritas data atau konsistensi logika.\n* **Skalabilitas:** Memungkinkan perluasan kapasitas tanpa mengorbankan performa.`
      },
      {
        heading: `2. Analisis Struktur & Cara Kerja`,
        content: `### Alur Mekanisme Kerja\n1. **Input / Premis Awal:** Mengumpulkan data masukan atau asumsi dasar sesuai parameter spesifikasi.\n2. **Transformasi / Pengolahan:** Menerapkan algoritma, kaidah logika, atau formulasi matematis yang relevan.\n3. **Verifikasi & Validasi:** Memeriksa kesesuaian hasil terhadap batasan (constraints) dan kondisi batas (edge cases).\n4. **Output / Sintesis:** Menghasilkan keputusan, struktur baru, atau estimasi kuantitatif yang dapat diverifikasi.`
      },
      {
        heading: `3. Tantangan Implementasi & Solusi`,
        content: `### Hambatan yang Sering Dihadapi\nPenerapan di lapangan kerap kali menemui tantangan berupa *resource constraints*, ambiguitas data masukan, atau perubahan parameter secara dinamis. Solusi standar yang direkomendasikan adalah melakukan normalisasi, pemisahan dependensi, serta pengujian berkala (iterative testing).`
      }
    ],
    terminology: [
      {
        term: `Abstraksi`,
        definition: `Proses menyederhanakan detail kompleks untuk fokus pada antarmuka dan konsep tingkat tinggi.`
      },
      {
        term: `Invarian`,
        definition: `Kondisi atau properti yang harus selalu bernilai benar selama eksekusi atau siklus proses.`
      },
      {
        term: `Benchmarking`,
        definition: `Pengujian komparatif untuk mengukur keandalan dan efisiensi terhadap standar industri.`
      }
    ],
    practicalExamples: [
      {
        title: `Penerapan Industri & Komputasi`,
        description: `Penggunaan prinsip ini di platform skala besar untuk mengoptimalkan waktu respons dan mencegah terjadinya bottleneck sistem.`
      },
      {
        title: `Studi Kasus Mahasiswa`,
        description: `Perancangan proyek akhir atau riset eksperimen di mana konsep ini diuji terhadap variasi beban kerja yang bertingkat.`
      }
    ],
    formulas: [
      {
        name: `Persamaan Efisiensi Relatif`,
        formula: `\\eta = \\frac{\\text{Keluaran Berguna}}{\\text{Total Masukan}} \\times 100\\%`,
        explanation: `Menghitung rasio performa aktual terhadap sumber daya yang dialokasikan.`
      }
    ],
    commonMisconceptions: [
      {
        misconception: `Menganggap bahwa sistem yang lebih rumit selalu menghasilkan performa yang lebih baik.`,
        correction: `Prinsip kesederhanaan (Occam's Razor) dan modularitas justru memberikan hasil yang lebih stabil, mudah dipelihara (maintainable), dan hemat biaya.`
      },
      {
        misconception: `Menghafal rumus atau sintaks tanpa memahami prasyarat asumsi awalnya.`,
        correction: `Sebagian besar kesalahan timbul karena rumus diterapkan pada domain di mana asumsi dasarnya tidak terpenuhi.`
      }
    ],
    keyTakeaways: [
      `Kuasai konsep fondasi sebelum beralih ke optimasi tingkat lanjut.`,
      `Selalu pertimbangkan trade-off antara kecepatan, kompleksitas, dan biaya implementasi.`,
      `Lakukan validasi berkala untuk memastikan konsistensi hasil sesuai tujuan pembelajaran.`
    ],
    reviewQuestions: [
      `Bagaimana Anda akan menjelaskan prinsip utama dari ${effectiveTitle} kepada rekan studi Anda?`,
      `Kondisi apa saja yang menyebabkan pendekatan ini gagal atau tidak efisien?`,
      `Sebutkan 2 contoh nyata penerapan konsep ini dalam memecahkan masalah sehari-hari!`
    ],
    suggestedNextSteps: [
      `Pelajari implementasi algoritma lanjutan dan studi kasus empiris.`,
      `Coba buat simulasi mandiri menggunakan dataset atau skenario yang lebih menantang.`
    ]
  };
}

export function generateFallbackFlashcards(lessonTitle, count = 6, subject = 'Umum') {
  return [
    {
      front: `Apa definisi esensial dari "${lessonTitle}"?`,
      back: `Kerangka acuan dan prinsip dasar yang mengatur pemrosesan, pemodelan, dan analisis dalam domain materi terkait.`,
      explanation: `Fokus pada fungsi utamanya dalam menyederhanakan pemecahan masalah.`,
      difficulty: 'easy'
    },
    {
      front: `Apa tujuan utama penerapan prinsip ini dalam konteks akademik?`,
      back: `Meningkatkan akurasi analisis, mengurangi redundansi, dan menyediakan struktur yang terukur untuk pengujian.`,
      explanation: `Penting untuk dipahami saat menyusun argumen atau laporan praktikum.`,
      difficulty: 'medium'
    },
    {
      front: `Sebutkan trade-off utama yang harus diperhatikan dalam implementasi "${lessonTitle}"!`,
      back: `Keseimbangan antara kompleksitas sistem, efisiensi waktu, serta kemudahan pemeliharaan (maintainability).`,
      explanation: `Optimasi berlebih (over-engineering) sering kali meningkatkan biaya pemeliharaan.`,
      difficulty: 'hard'
    },
    {
      front: `Apa perbedaan antara abstraksi teoretis dan implementasi empiris?`,
      back: `Abstraksi mengabaikan detail fisik demi kejelasan logika, sedangkan implementasi empiris harus menangani batasan perangkat dan galat nyata.`,
      explanation: `Mnemonik: Teori memandu arah, praktik menghadapi batasan.`,
      difficulty: 'medium'
    },
    {
      front: `Bagaimana cara mendeteksi kesalahan umum (misconception) dalam topik ini?`,
      back: `Dengan memverifikasi apakah asumsi prasyarat terpenuhi dan menjalankan pengujian pada kasus ekstrem (edge cases).`,
      explanation: `Selalu uji dengan nilai batas minimum dan maksimum.`,
      difficulty: 'hard'
    },
    {
      front: `Apa indikator keberhasilan dari pemahaman materi ini?`,
      back: `Mampu merekonstruksi solusi tanpa contekan dan menjelaskan analoginya kepada orang awam.`,
      explanation: `Metode Feynman: Jika Anda bisa menjelaskan secara sederhana, berarti Anda benar-benar paham.`,
      difficulty: 'easy'
    }
  ].slice(0, count);
}

export function generateFallbackQuiz(lessonTitle, count = 5) {
  const sample = [
    {
      id: "q_demo_1",
      type: "multiple_choice",
      question: `Manakah dari pernyataan berikut yang paling tepat mendeskripsikan tujuan utama dari "${lessonTitle}"?`,
      options: [
        "Meningkatkan kompleksitas prosedural tanpa memperhatikan hasil luaran",
        "Menyediakan struktur analisis teratur untuk memecahkan masalah secara efektif",
        "Menghilangkan seluruh kebutuhan komputasi dan analisis data",
        "Menggantikan peran penalaran manusia secara mutlak"
      ],
      correctAnswer: "Menyediakan struktur analisis teratur untuk memecahkan masalah secara efektif",
      explanation: "Tujuan utama pembelajaran adalah memberi metodologi teruji agar pemecahan masalah lebih terstruktur, konsisten, dan dapat dievaluasi.",
      difficulty: "easy"
    },
    {
      id: "q_demo_2",
      type: "true_false",
      question: `Dalam penerapan konsep ini, menyederhanakan masalah melalui abstraksi selalu berakibat pada penurunan kualitas hasil akhir.`,
      options: ["Benar", "Salah"],
      correctAnswer: "Salah",
      explanation: "Abstraksi yang tepat justru menyingkirkan 'noise' dan fokus pada aspek krusial, sehingga meningkatkan kualitas keputusan dan efisiensi.",
      difficulty: "medium"
    },
    {
      id: "q_demo_3",
      type: "multiple_choice",
      question: `Kapan sebuah solusi dikatakan mengalami 'over-engineering' pada materi ini?`,
      options: [
        "Ketika solusi menggunakan pendekatan paling sederhana yang mungkin",
        "Ketika kompleksitas kode/desain jauh melampaui kebutuhan nyata masalah",
        "Ketika dokumentasi materi dibuat secara mendalam",
        "Ketika dilakukan pengujian pada kasus batas (edge cases)"
      ],
      correctAnswer: "Ketika kompleksitas kode/desain jauh melampaui kebutuhan nyata masalah",
      explanation: "Over-engineering terjadi saat arsitektur dibuat terlalu rumit untuk masalah yang sebetulnya sederhana, membuang sumber daya dan menyulitkan pemeliharaan.",
      difficulty: "medium"
    },
    {
      id: "q_demo_4",
      type: "multiple_choice",
      question: `Langkah pertama yang paling krusial sebelum menerapkan algoritma atau formula dalam materi ini adalah:`,
      options: [
        "Langsung menjalankan komputasi tanpa validasi input",
        "Mengidentifikasi asumsi dasar dan batasan domain masalah",
        "Mempublikasikan hasil sebelum diverifikasi",
        "Menghapus parameter yang sulit dihitung"
      ],
      correctAnswer: "Mengidentifikasi asumsi dasar dan batasan domain masalah",
      explanation: "Rumus dan algoritma hanya valid jika data masukan memenuhi syarat batas dan asumsi teoretis yang mendasarinya.",
      difficulty: "hard"
    },
    {
      id: "q_demo_5",
      type: "true_false",
      question: `Pengujian pada kasus ekstrem (edge cases) diperlukan untuk memastikan stabilitas sistem ketika parameter masukan berada di batas toleransi.`,
      options: ["Benar", "Salah"],
      correctAnswer: "Benar",
      explanation: "Edge case testing membuktikan apakah sistem tetap stabil dan berperilaku terprediksi saat menghadapi nilai batas terendah atau tertinggi.",
      difficulty: "easy"
    }
  ];

  return {
    title: `Kuis Pemahaman: ${lessonTitle}`,
    questions: sample.slice(0, count)
  };
}

export function generateFallbackExam(subject, lessonTitles, count = 10, timeMinutes = 30) {
  const quiz = generateFallbackQuiz(lessonTitles[0] || subject, count);
  return {
    title: `Simulasi Ujian Semester: ${subject}`,
    subject: subject,
    totalTimeMinutes: timeMinutes,
    passingScore: 75,
    questions: quiz.questions.map((q, idx) => ({
      ...q,
      id: `exam_${idx + 1}`,
      topic: lessonTitles[idx % lessonTitles.length] || subject,
      difficulty: idx % 2 === 0 ? 'hard' : 'medium'
    }))
  };
}

export function generateFallbackTutorResponse(message, contextLesson, history) {
  const lower = message.toLowerCase();
  const title = contextLesson?.title || 'Materi Ini';

  if (lower.includes('sederhana') || lower.includes('bahasa sederhana') || lower.includes('simpel')) {
    return `### Penjelasan Sederhana tentang ${title} 💡\n\nBayangkan konsep ini seperti **sistem dapur di restoran cepat saji**:\n1. **Pesanan Masuk (Input):** Pelanggan memilih menu yang diinginkan.\n2. **Koki Mengolah (Proses):** Koki mengikuti SOP standar agar rasa makanan konsisten, tidak peduli siapa koki yang bertugas hari itu.\n3. **Makanan Siap (Output):** Pelanggan menerima pesanan yang tepat dan lezat.\n\nPada dasarnya, **${title}** bekerja dengan cara yang sama: mengatur alur proses agar hasilnya terstandar, cepat, dan bebas dari kekeliruan.\n\n*Apakah analogi ini cukup membantu, atau ada bagian tertentu yang ingin kita telusuri lebih detail?*`;
  }

  if (lower.includes('contoh') || lower.includes('nyata') || lower.includes('kasus')) {
    return `### Contoh Nyata dalam Kehidupan Sehari-hari 🚀\n\nMari kita lihat bagaimana **${title}** diterapkan di industri saat ini:\n\n* **Aplikasi E-Commerce (Shopee / Tokopedia):** Saat jutaan pengguna melakukan *checkout* bersamaan di tanggal kembar (11.11), prinsip ini digunakan untuk mengelola antrean transaksi agar server tidak ambruk (*crash*) dan stok barang tidak tercatat ganda.\n* **Sistem Navigasi (Google Maps):** Memilih rute tercepat berdasarkan kepadatan jalan raya secara real-time dengan menimbang waktu tempuh vs jarak tempuh.\n\nDari kedua contoh di atas, bagian mana yang paling menarik bagi topik riset atau tugas kuliah Anda?`;
  }

  if (lower.includes('soal') || lower.includes('latihan') || lower.includes('kuis')) {
    return `### Latihan Soal Pemahaman 📝\n\nCoba jawab pertanyaan refleksi berikut:\n\n> **Kasus:** Anda diminta merancang sistem pemrosesan data untuk ${title}. Klien menginginkan proses secepat mungkin, namun kapasitas memori server sangat terbatas.\n>\n> **Pertanyaan:** Apa strategi trade-off yang akan Anda pilih antara *kecepatan waktu eksekusi* vs *penghematan memori*?\n\nKetikkan hipotesis jawaban Anda, dan saya akan berikan masukan langsung!`;
  }

  if (lower.includes('hafal') || lower.includes('penting') || lower.includes('rumus')) {
    return `### Poin-Poin Kunci yang Wajib Diingat 🎯\n\nUntuk persiapan ujian pada materi **${title}**, berikut 3 pilar yang wajib dikuasai:\n\n1. **Definisi & Tujuan Utama:** Pahami *mengapa* konsep ini diciptakan, bukan hanya *bagaimana* cara kerjanya.\n2. **Asumsi & Batasan Masalah:** Ketahui kondisi di mana konsep ini **TIDAK** boleh diterapkan.\n3. **Indikator Efisiensi:** Metrik apa yang dipakai untuk mengukur apakah hasil analisis sudah optimal.\n\n*Ingin saya buatkan kartu flashcard otomatis dari 3 poin ini?*`;
  }

  // Default thoughtful tutor response
  return `Halo! Senang bisa mendiskusikan **${title}** bersama Anda.\n\nDalam konteks materi yang sedang Anda pelajari, konsep ini memegang peranan krusial untuk melatih kemampuan berpikir analitis.\n\nBeberapa aspek inti yang bisa kita pelajari bersama:\n* **Membedah definisi dasar & terminologi:** Memastikan tidak ada salah paham konsep awal.\n* **Menganalisis mekanisme kerja:** Langkah demi langkah dengan analogi dunia nyata.\n* **Simulasi latihan soal ujian:** Menguji kesiapan pemahaman Anda sebelum evaluasi resmi.\n\nApa bagian spesifik yang menurut Anda paling menantang dari materi ini? Ceritakan pada saya, kita selesaikan bersama!`;
}
