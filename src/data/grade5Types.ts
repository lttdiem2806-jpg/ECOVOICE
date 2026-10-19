// Builder script for Grade 5 Global Success Dataset (Units 1 - 20)
// Following Bộ Giáo Dục & Đào Tạo standard curriculum for Primary Grade 5

export interface VocabItem {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  speechText: string;
  colorHex: string;
  icon: string;
  sentence: string;
  sentenceVi: string;
  lesson: 'Lesson 1' | 'Lesson 2';
}

export interface SentenceItem {
  id: string;
  structure: string;
  meaning: string;
  example: string;
  exampleVi: string;
  speechText: string;
  lesson: 'Lesson 1' | 'Lesson 2';
}

export interface LessonData {
  lessonNumber: number;
  lessonTitle: string;
  theme: string;
  vocabulary: VocabItem[];
  sentences: SentenceItem[];
}

export interface Unit5Data {
  unitNumber: number;
  unitKey: string;
  unitName: string;
  unitFullName: string;
  theme: string;
  lessons: LessonData[];
  vocabulary: VocabItem[];
  sentences: SentenceItem[];
}
