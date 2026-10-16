import Dexie from 'dexie';

export class StudyForgeDB extends Dexie {
  constructor() {
    super('StudyForgeAIDB');

    this.version(1).stores({
      lessons: 'id, title, subject, folderId, isFavorite, isArchived, isCompleted, createdAt, updatedAt',
      folders: 'id, name, createdAt',
      flashcards: 'id, lessonId, subject, difficulty, nextReviewDate, status, createdAt',
      quizzes: 'id, lessonId, title, createdAt',
      quizAttempts: 'id, quizId, lessonId, date, score',
      plannerSessions: 'id, date, subject, lessonId, priority, isCompleted, createdAt',
      userProfile: 'id',
      achievements: 'id, code, unlockedAt'
    });
  }
}

export const db = new StudyForgeDB();

// Initial Seed Data for immediate rich out-of-the-box experience
export async function seedInitialDataIfEmpty(force = false) {
  if (!force && localStorage.getItem('studyforge_empty_mode') === 'true') {
    return;
  }
  const lessonCount = await db.lessons.count();
  if (lessonCount > 0 && !force) return;

  console.log('Seeding initial StudyForge AI data for Indonesian university students...');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. User Profile
  await db.userProfile.put({
    id: 'current_user',
    displayName: 'Ahmad Faiz',
    educationLevel: 'Universitas (S1)',
    university: 'Institut Teknologi Bandung',
    subjects: ['Ilmu Komputer', 'Ekonomi Makro', 'Biologi Molekuler', 'Statistika'],
    weeklyGoalMinutes: 300,
    explanationStyle: 'Lengkap & Akademis',
    xp: 320,
    level: 2,
    streak: 3,
    lastStudyDate: todayStr,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  });

  // 2. Folders
  const folder1Id = 'f_semester_3';
  const folder2Id = 'f_persiapan_uts';
  const folder3Id = 'f_riset_skripsi';

  await db.folders.bulkPut([
    { id: folder1Id, name: 'Mata Kuliah Semester 3', color: '#6366f1', icon: 'FolderGit2', createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
    { id: folder2Id, name: 'Persiapan Ujian Tengah Semester (UTS)', color: '#ec4899', icon: 'Sparkles', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: folder3Id, name: 'Bahan Bacaan & Riset', color: '#10b981', icon: 'BookOpen', createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  ]);

  // 3. Lessons
  const lesson1Id = 'lesson_cs_tree';
  const lesson2Id = 'lesson_bio_dna';
  const lesson3Id = 'lesson_econ_moneter';

  await db.lessons.bulkPut([
    {
      id: lesson1Id,
      title: 'Struktur Data: Binary Search Tree & AVL Tree',
      subject: 'Ilmu Komputer',
      folderId: folder1Id,
      sourceType: 'topic',
      sourceTitle: 'Kuliah Struktur Data & Algoritma Pertemuan 5',
      sourceMaterial: 'Penjelasan pohon biner seimbang, operasi rotasi kiri/kanan pada AVL Tree, dan perbandingan kompleksitas pencarian O(log n) vs O(n).',
      isFavorite: true,
      isArchived: false,
      isCompleted: true,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      overview: 'Binary Search Tree (BST) dan AVL Tree adalah struktur data hierarkis fundamental dalam ilmu komputer. Struktur ini dirancang untuk mempercepat pencarian, penyisipan, dan penghapusan data secara dinamis. AVL Tree secara khusus mengatasi kelemahan BST yang dapat terdegenerasi menjadi linked list dengan mekanisme penyeimbangan otomatis (self-balancing).',
      learningObjectives: [
        'Memahami struktur dasar Binary Search Tree dan aturan invarian pencarian (kiri < akar < kanan).',
        'Mengidentifikasi masalah "Skewed Tree" (pohon miring) pada BST biasa dan dampaknya terhadap kompleksitas O(n).',
        'Menganalisis mekanisme self-balancing pada AVL Tree menggunakan rotasi tunggal (LL, RR) dan rotasi ganda (LR, RL).',
        'Menghitung Faktor Keseimbangan (Balance Factor) pada setiap simpul pohon.'
      ],
      keyConcepts: [
        {
          name: 'Binary Search Tree (BST)',
          definition: 'Pohon biner di mana setiap simpul kiri bernilai lebih kecil dari simpul induk, dan simpul kanan bernilai lebih besar.'
        },
        {
          name: 'AVL Tree (Adelson-Velsky & Landis)',
          definition: 'BST dengan mekanisme penyeimbangan otomatis di mana selisih tinggi subpohon kiri dan kanan maksimal 1 pada setiap simpul.'
        },
        {
          name: 'Balance Factor (Faktor Keseimbangan)',
          definition: 'Nilai selisih tinggi subpohon: BF = Height(Left) - Height(Right). Pada AVL yang valid, BF harus bernilai -1, 0, atau +1.'
        }
      ],
      detailedSections: [
        {
          heading: '1. Mengapa Kita Membutuhkan AVL Tree?',
          content: `Pada BST standar, jika data dimasukkan secara terurut (misal: 1, 2, 3, 4, 5), pohon akan tumbuh memanjang ke satu sisi menjadi **Skewed Tree**.\n\nDalam kondisi terburuk ini, waktu pencarian memburuk dari $O(\\log n)$ menjadi $O(n)$, sama lambatnya dengan Linked List biasa.\n\nAVL Tree diciptakan oleh matematikawan Soviet Georgy Adelson-Velsky dan Evgenii Landis pada tahun 1962 untuk memastikan pohon selalu seimbang dengan ketinggian $O(\\log n)$.`
        },
        {
          heading: '2. Operasi Rotasi pada AVL Tree',
          content: `Jika penambahan atau penghapusan simpul menyebabkan $|BF| > 1$, pohon melakukan penyeimbangan ulang dengan rotasi:\n\n* **Left Rotation (RR):** Terjadi ketika simpul baru ditambahkan ke subpohon kanan dari anak kanan.\n* **Right Rotation (LL):** Terjadi ketika simpul baru ditambahkan ke subpohon kiri dari anak kiri.\n* **Left-Right Rotation (LR):** Rotasi kiri pada anak kiri, dilanjutkan rotasi kanan pada simpul yang tidak seimbang.\n* **Right-Left Rotation (RL):** Rotasi kanan pada anak kanan, dilanjutkan rotasi kiri pada simpul yang tidak seimbang.`
        },
        {
          heading: '3. Kompleksitas Waktu & Memori',
          content: `| Operasi | Kasus Terbaik (Best) | Kasus Rata-rata (Avg) | Kasus Terburuk (Worst) |\n| :--- | :--- | :--- | :--- |\n| **Pencarian (Search)** | $O(1)$ | $O(\\log n)$ | $O(\\log n)$ |\n| **Penyisipan (Insert)** | $O(1)$ | $O(\\log n)$ | $O(\\log n)$ |\n| **Penghapusan (Delete)** | $O(1)$ | $O(\\log n)$ | $O(\\log n)$ |\n\n*Catatan: Keunggulan AVL dibanding Red-Black Tree adalah pencarian yang lebih cepat karena pohon lebih seimbang secara ketat.*`
        }
      ],
      terminology: [
        { term: 'In-order Traversal', definition: 'Penelusuran pohon biner (kiri -> akar -> kanan) yang menghasilkan urutan data terurut naik (ascending).' },
        { term: 'Height of Tree', definition: 'Jumlah sisi terpanjang dari simpul akar menuju daun (leaf) terjauh.' }
      ],
      practicalExamples: [
        {
          title: 'Sistem Indeks Database (In-Memory Indexing)',
          description: 'Pohon seimbang seperti AVL digunakan untuk mempercepat pencarian query berbasis rentang (range queries) pada basis data memori tinggi.'
        }
      ],
      formulas: [
        {
          name: 'Rumus Balance Factor',
          formula: 'BF(v) = h(v.left) - h(v.right)',
          explanation: 'Jika BF(v) bernilai 2 atau -2, maka simpul v harus segera diseimbangkan dengan rotasi.'
        }
      ],
      commonMisconceptions: [
        {
          misconception: 'AVL Tree selalu lebih baik daripada Red-Black Tree dalam semua skenario.',
          correction: 'AVL lebih cepat untuk operasi pencarian, namun Red-Black Tree lebih cepat untuk operasi insert/delete yang sangat sering karena rotasinya lebih sedikit.'
        }
      ],
      keyTakeaways: [
        'BST biasa rentan terdegenerasi menjadi O(n) jika data masuk terurut.',
        'AVL Tree menjamin kompleksitas O(log n) dengan menjaga selisih tinggi subpohon <= 1.',
        'Rotasi LL dan RR adalah rotasi tunggal, sedangkan LR dan RL adalah rotasi ganda.'
      ],
      reviewQuestions: [
        'Apa yang terjadi jika kita memasukkan angka 10, 20, 30 ke dalam AVL Tree yang awalnya kosong?',
        'Mengapa operasi in-order traversal pada BST selalu menghasilkan urutan yang terurut?',
        'Kapan kita memilih menggunakan AVL Tree dibandingkan Hash Table?'
      ],
      suggestedNextSteps: [
        'Mempelajari Red-Black Tree dan B-Tree.',
        'Mengimplementasikan simulasi rotasi AVL Tree dalam bahasa pemrograman pilihan.'
      ]
    },
    {
      id: lesson2Id,
      title: 'Biologi Molekuler: Replikasi DNA & Dogma Sentral',
      subject: 'Biologi Molekuler',
      folderId: folder2Id,
      sourceType: 'text',
      sourceTitle: 'Modul Biologi Sel & Genetika Universitas',
      sourceMaterial: 'Proses replikasi semikonservatif DNA, enzim helikase, DNA polimerase, ligase, serta sintesis leading vs lagging strand (fragmen Okazaki).',
      isFavorite: false,
      isArchived: false,
      isCompleted: false,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      overview: 'Dogma Sentral Biologi Molekuler menjelaskan alur informasi genetik dari DNA menjadi RNA (Transkripsi) hingga menjadi Protein (Translasi). Replikasi DNA merupakan proses krusial sebelum pembelahan sel guna memastikan setiap sel anakan menerima salinan materi genetik yang identik.',
      learningObjectives: [
        'Menjelaskan model replikasi semikonservatif yang dibuktikan oleh eksperimen Meselson-Stahl.',
        'Mengidentifikasi fungsi enzim kunci: Helikase, Primase, DNA Polimerase III, dan DNA Ligase.',
        'Membedakan sintesis untai maju (leading strand) dan untai lambat (lagging strand).'
      ],
      keyConcepts: [
        { name: 'Model Semikonservatif', definition: 'Setiap molekul DNA baru terdiri dari satu untai induk lama dan satu untai baru yang disintesis.' },
        { name: 'Fragmen Okazaki', definition: 'Potongan pendek DNA yang disintesis secara diskontinu pada lagging strand.' }
      ],
      detailedSections: [
        {
          heading: '1. Inisiasi & Pembukaan Garpu Replikasi',
          content: 'Replikasi dimulai pada daerah spesifik yang disebut *origin of replication* (ori). Enzim **Helikase** membuka ikatan hidrogen antara pasangan basa nitrogen, sementara protein **SSB (Single-Strand Binding)** mencegah kedua untai menyatu kembali.'
        },
        {
          heading: '2. Enzim Pemanjangan (Elongasi)',
          content: 'DNA Polimerase hanya dapat menambahkan nukleotida baru pada ujung 3\'-OH bebas. Akibatnya:\n* **Leading Strand:** Disintesis secara kontinu searah dengan pergerakan garpu replikasi (arah 5\' ke 3\').\n* **Lagging Strand:** Disintesis berlawanan arah garpu replikasi secara bertahap membentuk fragmen Okazaki.'
        }
      ],
      terminology: [
        { term: 'Topoisomerase (Gyrase)', definition: 'Enzim yang meredakan tegangan superkoil DNA di depan garpu replikasi.' },
        { term: 'Primer RNA', definition: 'Urutan pendek RNA yang dibuat oleh primase sebagai titik awal DNA Polimerase.' }
      ],
      practicalExamples: [
        { title: 'Teknik PCR (Polymerase Chain Reaction)', description: 'Teknologi amplifikasi DNA di laboratorium yang meniru mekanisme replikasi seluler menggunakan enzim Taq polymerase tahan panas.' }
      ],
      formulas: [],
      commonMisconceptions: [
        {
          misconception: 'DNA polimerase dapat memulai sintesis rantai baru secara mandiri dari nol.',
          correction: 'DNA polimerase memerlukan primer RNA dengan gugus 3\'-OH bebas untuk memulai penambahan nukleotida.'
        }
      ],
      keyTakeaways: [
        'Replikasi bersifat semikonservatif dan bidireksional.',
        'Arah sintesis selalu dari 5\' ke 3\'.',
        'DNA ligase menyambungkan celah antar fragmen Okazaki.'
      ],
      reviewQuestions: [
        'Mengapa sintesis lagging strand harus berjalan secara diskontinu?',
        'Apa peran enzim telomerase pada sel eukariotik?'
      ],
      suggestedNextSteps: ['Mempelajari proses transkripsi dan modifikasi post-transkripsional mRNA.']
    },
    {
      id: lesson3Id,
      title: 'Ekonomi Makro: Kebijakan Moneter & Pengendalian Inflasi',
      subject: 'Ekonomi Makro',
      folderId: folder1Id,
      sourceType: 'topic',
      sourceTitle: 'Buku Ajar Pengantar Ekonomi Makro Mankiw',
      sourceMaterial: 'Peran Bank Sentral (Bank Indonesia), instrumen BI-Rate / suku bunga acuan, Operasi Pasar Terbuka, Giro Wajib Minimum (GWM), serta kurva Phillips.',
      isFavorite: true,
      isArchived: false,
      isCompleted: false,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      overview: 'Kebijakan moneter adalah serangkaian tindakan yang diambil oleh bank sentral untuk mengontrol jumlah uang beredar dan tingkat suku bunga demi mencapai stabilitas harga (inflasi rendah) dan pertumbuhan ekonomi berkelanjutan.',
      learningObjectives: [
        'Membedakan kebijakan moneter ekspansif dan kontraktif.',
        'Memahami 3 instrumen utama bank sentral: Suku bunga acuan, GWM, dan Operasi Pasar Terbuka.',
        'Menganalisis mekanisme transmisi moneter terhadap konsumsi dan investasi.'
      ],
      keyConcepts: [
        { name: 'Kebijakan Kontraktif (Tight Money Policy)', definition: 'Kebijakan menaikkan suku bunga untuk menekan inflasi yang terlalu tinggi.' },
        { name: 'Giro Wajib Minimum (GWM)', definition: 'Persentase simpanan dana nasabah yang wajib ditahan oleh bank umum di bank sentral.' }
      ],
      detailedSections: [
        {
          heading: '1. Transmisi Suku Bunga Acuan',
          content: 'Ketika inflasi meningkat melampaui target, Bank Sentral menaikkan suku bunga acuan. Hal ini menyebabkan bank umum menaikkan suku bunga kredit dan deposito, sehingga masyarakat lebih memilih menabung dan menunda belanja konsumtif.'
        }
      ],
      terminology: [
        { term: 'Demand-Pull Inflation', definition: 'Inflasi yang disebabkan oleh permintaan agregat yang melampaui kapasitas produksi nasional.' }
      ],
      practicalExamples: [
        { title: 'Respons Bank Indonesia Terhadap Gejolak Global', description: 'Kebijakan BI mempertahankan suku bunga untuk menjaga stabilitas nilai tukar Rupiah terhadap Dolar AS.' }
      ],
      formulas: [
        { name: 'Persamaan Kuantitas Uang (Fisher)', formula: 'M \\times V = P \\times Y', explanation: 'M = Uang beredar, V = Kecepatan peredaran, P = Tingkat harga, Y = Output riil.' }
      ],
      commonMisconceptions: [
        {
          misconception: 'Inflasi 0% selalu merupakan hal yang paling ideal bagi sebuah perekonomian.',
          correction: 'Inflasi rendah yang stabil (2-3%) justru menandakan pertumbuhan ekonomi yang sehat dan mendorong aktivitas produksi.'
        }
      ],
      keyTakeaways: [
        'Bank sentral independen bertugas menjaga stabilitas nilai mata uang.',
        'Kenaikan suku bunga menekan inflasi namun dapat memperlambat pertumbuhan ekonomi sesaat.'
      ],
      reviewQuestions: [
        'Apa dampak kenaikan GWM terhadap jumlah uang beredar di masyarakat?',
        'Jelaskan trade-off jangka pendek antara inflasi dan pengangguran menurut Kurva Phillips!'
      ],
      suggestedNextSteps: ['Mempelajari interaksi Kebijakan Fiskal Kementerian Keuangan dengan Kebijakan Moneter.']
    }
  ]);

  // 4. Flashcards (Smart Flashcards with Spaced Repetition fields)
  await db.flashcards.bulkPut([
    {
      id: 'fc_1',
      lessonId: lesson1Id,
      subject: 'Ilmu Komputer',
      front: 'Apa syarat utama agar sebuah simpul pohon biner memenuhi syarat BST (Binary Search Tree)?',
      back: 'Semua nilai di subpohon kiri < nilai simpul akar, dan semua nilai di subpohon kanan > nilai simpul akar.',
      explanation: 'Sifat ini berlaku secara rekursif untuk seluruh simpul di dalam pohon.',
      difficulty: 'easy',
      nextReviewDate: todayStr,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 1,
      status: 'due',
      createdAt: new Date().toISOString()
    },
    {
      id: 'fc_2',
      lessonId: lesson1Id,
      subject: 'Ilmu Komputer',
      front: 'Berapa rentang nilai Balance Factor (BF) yang diizinkan pada AVL Tree yang seimbang?',
      back: 'Nilai BF hanya boleh -1, 0, atau +1.',
      explanation: 'Jika BF bernilai 2 atau -2, maka rotasi harus segera dijalankan untuk menyeimbangkan simpul.',
      difficulty: 'medium',
      nextReviewDate: todayStr,
      interval: 3,
      easeFactor: 2.4,
      repetitions: 2,
      status: 'due',
      createdAt: new Date().toISOString()
    },
    {
      id: 'fc_3',
      lessonId: lesson1Id,
      subject: 'Ilmu Komputer',
      front: 'Kapan kita harus menggunakan rotasi Left-Right (LR) pada AVL Tree?',
      back: 'Ketika ketidakseimbangan terjadi di subpohon kiri, tepatnya karena penambahan di cabang kanan anak kiri.',
      explanation: 'Rotasi LR diawali dengan Left Rotation pada anak kiri, lalu Right Rotation pada simpul induk.',
      difficulty: 'hard',
      nextReviewDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      interval: 4,
      easeFactor: 2.3,
      repetitions: 2,
      status: 'learned',
      createdAt: new Date().toISOString()
    },
    {
      id: 'fc_4',
      lessonId: lesson2Id,
      subject: 'Biologi Molekuler',
      front: 'Enzim apa yang berfungsi membuka ikatan hidrogen heliks ganda DNA pada replikasi?',
      back: 'Enzim DNA Helikase.',
      explanation: 'Helikase bergerak membuka pilinan seperti ritsleting, menciptakan garpu replikasi.',
      difficulty: 'easy',
      nextReviewDate: todayStr,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      status: 'due',
      createdAt: new Date().toISOString()
    },
    {
      id: 'fc_5',
      lessonId: lesson2Id,
      subject: 'Biologi Molekuler',
      front: 'Mengapa fragmen Okazaki terbentuk pada lagging strand selama replikasi DNA?',
      back: 'Karena DNA Polimerase hanya bisa menyintesis dari arah 5\' ke 3\', sementara garpu replikasi membuka berlawanan arah.',
      explanation: 'Fragmen-fragmen pendek ini kemudian disambung oleh enzim DNA Ligase.',
      difficulty: 'medium',
      nextReviewDate: todayStr,
      interval: 2,
      easeFactor: 2.5,
      repetitions: 1,
      status: 'due',
      createdAt: new Date().toISOString()
    },
    {
      id: 'fc_6',
      lessonId: lesson3Id,
      subject: 'Ekonomi Makro',
      front: 'Apa yang dimaksud dengan Kebijakan Moneter Kontraktif?',
      back: 'Kebijakan mengurangi jumlah uang beredar (misal menaikkan suku bunga) untuk meredam laju inflasi.',
      explanation: 'Suku bunga tinggi menekan konsumsi berlebih dan mendorong masyarakat menabung.',
      difficulty: 'easy',
      nextReviewDate: todayStr,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      status: 'due',
      createdAt: new Date().toISOString()
    }
  ]);

  // 5. Quizzes
  const quiz1Id = 'quiz_cs_bst';
  await db.quizzes.put({
    id: quiz1Id,
    lessonId: lesson1Id,
    title: 'Kuis Evaluasi Pemahaman: BST & AVL Tree',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'Berapakah kompleksitas waktu pencarian kasus terburuk (worst case) pada Binary Search Tree biasa yang terdegenerasi (skewed)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
        correctAnswer: 'O(n)',
        explanation: 'Jika BST miring sempurna seperti linked list, kita harus menelusuri seluruh n simpul untuk menemukan elemen.',
        difficulty: 'medium'
      },
      {
        id: 'q2',
        type: 'true_false',
        question: 'Pada AVL Tree, faktor keseimbangan (Balance Factor) pada setiap simpul boleh bernilai 2 asalkan anak simpulnya memiliki tinggi genap.',
        options: ['Benar', 'Salah'],
        correctAnswer: 'Salah',
        explanation: 'Faktor keseimbangan AVL harus selalu berada dalam rentang {-1, 0, +1}. Nilai 2 mengindikasikan pohon tidak seimbang dan harus segera dirotasi.',
        difficulty: 'easy'
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        question: 'Urutan penelusuran (traversal) manakah yang menjamin nilai elemen BST dicetak dalam urutan terurut menaik (ascending)?',
        options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
        correctAnswer: 'In-order',
        explanation: 'In-order traversal mengunjungi (Subpohon Kiri -> Akar -> Subpohon Kanan), yang secara matematis sesuai dengan sifat pengurutan BST.',
        difficulty: 'easy'
      },
      {
        id: 'q4',
        type: 'multiple_choice',
        question: 'Jika sebuah simpul memiliki tinggi subpohon kiri = 4 dan tinggi subpohon kanan = 2, berapakah Balance Factor simpul tersebut?',
        options: ['-2', '0', '+2', '+6'],
        correctAnswer: '+2',
        explanation: 'Balance Factor = Tinggi Kiri - Tinggi Kanan = 4 - 2 = +2.',
        difficulty: 'medium'
      },
      {
        id: 'q5',
        type: 'true_false',
        question: 'Rotasi ganda Left-Right (LR) terdiri dari rotasi kiri pada anak kiri diikuti rotasi kanan pada simpul yang tidak seimbang.',
        options: ['Benar', 'Salah'],
        correctAnswer: 'Benar',
        explanation: 'Benar, rotasi LR dirancang untuk meluruskan tekukan zig-zag terlebih dahulu sebelum simpul utama diseimbangkan.',
        difficulty: 'hard'
      }
    ]
  });

  // 6. Recent Quiz Attempt
  await db.quizAttempts.put({
    id: 'attempt_demo_1',
    quizId: quiz1Id,
    lessonId: lesson1Id,
    score: 80,
    totalQuestions: 5,
    correctCount: 4,
    timeSpentSeconds: 145,
    answers: { q1: 'O(n)', q2: 'Salah', q3: 'In-order', q4: '+2', q5: 'Salah' },
    date: new Date(Date.now() - 1 * 86400000).toISOString()
  });

  // 7. Planner Sessions
  await db.plannerSessions.bulkPut([
    {
      id: 'session_1',
      title: 'Review AVL Tree Rotations & Implementasi Kode',
      subject: 'Ilmu Komputer',
      lessonId: lesson1Id,
      date: todayStr,
      startTime: '16:00',
      durationMinutes: 45,
      priority: 'high',
      isCompleted: false,
      notes: 'Latihan soal rotasi LR dan RL di kertas.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'session_2',
      title: 'Hafalan Flashcard Dogma Sentral Replikasi DNA',
      subject: 'Biologi Molekuler',
      lessonId: lesson2Id,
      date: todayStr,
      startTime: '19:30',
      durationMinutes: 30,
      priority: 'medium',
      isCompleted: false,
      notes: 'Selesaikan 5 kartu yang jatuh tempo hari ini.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'session_3',
      title: 'Membaca Bab Transmisi Moneter Bank Indonesia',
      subject: 'Ekonomi Makro',
      lessonId: lesson3Id,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      startTime: '10:00',
      durationMinutes: 60,
      priority: 'low',
      isCompleted: false,
      notes: 'Buat catatan ringkasan di StudyForge.',
      createdAt: new Date().toISOString()
    }
  ]);

  // 8. Achievements
  await db.achievements.bulkPut([
    {
      id: 'ach_first_lesson',
      code: 'FIRST_LESSON',
      title: 'Langkah Pertama',
      description: 'Membuat atau mempelajari materi pertama di StudyForge AI.',
      icon: 'BookOpen',
      unlockedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      progress: 1,
      maxProgress: 1
    },
    {
      id: 'ach_streak_3',
      code: 'STREAK_3',
      title: 'Konsistensi Terjaga',
      description: 'Mencapai streak belajar 3 hari berturut-turut.',
      icon: 'Flame',
      unlockedAt: new Date().toISOString(),
      progress: 3,
      maxProgress: 3
    },
    {
      id: 'ach_quiz_master',
      code: 'QUIZ_MASTER',
      title: 'Pemikir Kritis',
      description: 'Menyelesaikan kuis dengan nilai di atas 75%.',
      icon: 'Award',
      unlockedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      progress: 1,
      maxProgress: 1
    },
    {
      id: 'ach_flashcard_10',
      code: 'FLASHCARD_10',
      title: 'Ingatan Super',
      description: 'Meninjau 10 kartu flashcard menggunakan spaced repetition.',
      icon: 'Brain',
      unlockedAt: null,
      progress: 6,
      maxProgress: 10
    }
  ]);

  console.log('StudyForge AI initial data seeded successfully.');
}

/**
 * Reset data: can be completely empty (emptyMode = true) or reloaded with demo data (emptyMode = false)
 */
export async function clearAllData(emptyMode = true) {
  await db.lessons.clear();
  await db.folders.clear();
  await db.flashcards.clear();
  await db.quizzes.clear();
  await db.quizAttempts.clear();
  await db.plannerSessions.clear();
  await db.achievements.clear();

  if (emptyMode) {
    localStorage.setItem('studyforge_empty_mode', 'true');
    await db.userProfile.put({
      id: 'current_user',
      displayName: 'Pelajar Baru',
      educationLevel: 'Universitas (S1)',
      university: '',
      subjects: ['Umum'],
      weeklyGoalMinutes: 240,
      explanationStyle: 'Lengkap & Akademis',
      xp: 0,
      level: 1,
      streak: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });
  } else {
    localStorage.removeItem('studyforge_empty_mode');
    await seedInitialDataIfEmpty(true);
  }
}
