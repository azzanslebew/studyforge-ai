import assert from 'node:assert';
import { calculateNextReview } from '../src/services/srsService.js';
import { calculateLevel, LEVEL_TITLES } from '../src/services/gamificationService.js';
import {
  generateLessonSchema,
  tutorChatSchema,
  generateFlashcardsSchema,
  generateQuizSchema,
  generateExamSchema
} from '../server/validation.js';
import {
  generateFallbackLesson,
  generateFallbackFlashcards,
  generateFallbackQuiz,
  generateFallbackExam,
  generateFallbackTutorResponse
} from '../server/mockEducationalData.js';

console.log('🧪 RUNNING STUDYFORGE AI UNIT TESTS...\n');

// 1. Spaced Repetition SM-2 Tests
console.log('1. Testing Spaced Repetition (SM-2) Algorithm...');
const cardInitial = { repetitions: 0, easeFactor: 2.5, interval: 1 };

// Rating 'again' (fail) should reset repetitions
const againResult = calculateNextReview(cardInitial, 'again');
assert.strictEqual(againResult.repetitions, 0, 'Repetitions must reset to 0 on "again"');
assert.strictEqual(againResult.interval, 1, 'Interval must be 1 day on "again"');
assert.strictEqual(againResult.status, 'learning');

// Rating 'good' should advance repetitions
const goodResult1 = calculateNextReview(cardInitial, 'good');
assert.strictEqual(goodResult1.repetitions, 1);
assert.strictEqual(goodResult1.interval, 1);
assert.strictEqual(goodResult1.status, 'learned');

const goodResult2 = calculateNextReview(goodResult1, 'good');
assert.strictEqual(goodResult2.repetitions, 2);
assert.strictEqual(goodResult2.interval, 6);

// Rating 'easy' should give bonus interval
const easyResult = calculateNextReview(cardInitial, 'easy');
assert.ok(easyResult.interval >= 1);
assert.ok(easyResult.easeFactor >= 2.5);
console.log('✅ Spaced Repetition SM-2 tests passed!\n');

// 2. Gamification and Level Tests
console.log('2. Testing Gamification and Leveling logic...');
const lvl0 = calculateLevel(0);
assert.strictEqual(lvl0.level, 1);
assert.strictEqual(lvl0.title, 'Mahasiswa Baru');
assert.strictEqual(lvl0.progressPercentage, 0);

const lvlHigh = calculateLevel(320);
assert.strictEqual(lvlHigh.level, 3);
assert.strictEqual(lvlHigh.title, 'Peneliti Muda');
assert.ok(lvlHigh.nextLevelXp > 320);
console.log('✅ Gamification level tests passed!\n');

// 3. Zod Schemas Validation Tests
console.log('3. Testing Server Zod Input Validation Schemas...');
// generateLessonSchema with valid topic
const validLessonInput = generateLessonSchema.parse({ topic: 'Jaringan Saraf Tiruan' });
assert.strictEqual(validLessonInput.topic, 'Jaringan Saraf Tiruan');
assert.strictEqual(validLessonInput.educationLevel, 'Universitas');

// generateLessonSchema with empty inputs should throw
assert.throws(() => {
  generateLessonSchema.parse({ topic: '', text: '' });
}, /Topik atau teks materi harus disertakan minimal satu/);

// tutorChatSchema
const validChat = tutorChatSchema.parse({ message: 'Apa itu overfitting?' });
assert.strictEqual(validChat.message, 'Apa itu overfitting?');

assert.throws(() => {
  tutorChatSchema.parse({ message: '' });
}, /Pesan tidak boleh kosong/);

// generateFlashcardsSchema
const validFlashcards = generateFlashcardsSchema.parse({
  lessonTitle: 'Ekonomi Makro',
  content: 'Inflasi adalah kenaikan harga barang dan jasa secara umum dan terus menerus.',
  count: 6
});
assert.strictEqual(validFlashcards.count, 6);
console.log('✅ Server Zod validation tests passed!\n');

// 4. Mock Educational Fallback Tests
console.log('4. Testing Educational Fallback Generators...');
const fbLesson = generateFallbackLesson('Basis Data Relasional', 'Normalisasi 1NF, 2NF, 3NF');
assert.ok(fbLesson.title.includes('Basis Data'));
assert.ok(fbLesson.learningObjectives.length > 0);
assert.ok(fbLesson.keyConcepts.length > 0);
assert.ok(fbLesson.detailedSections.length > 0);
assert.ok(fbLesson.keyTakeaways.length > 0);

const fbCards = generateFallbackFlashcards('Struktur Data', 4);
assert.strictEqual(fbCards.length, 4);
assert.ok(fbCards[0].front && fbCards[0].back);

const fbQuiz = generateFallbackQuiz('Biologi Sel', 3);
assert.strictEqual(fbQuiz.questions.length, 3);
assert.ok(fbQuiz.questions[0].options.includes(fbQuiz.questions[0].correctAnswer));

const fbTutor = generateFallbackTutorResponse('Jelaskan dengan bahasa sederhana dong', { title: 'AVL Tree' });
assert.ok(fbTutor.includes('Penjelasan Sederhana'));
console.log('✅ Educational Fallback tests passed!\n');

console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED.');
