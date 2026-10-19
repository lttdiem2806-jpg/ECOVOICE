import rawData from './bookmap_globalsuccess.json';

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  speechText: string;
  colorHex?: string;
  icon: string;
  sentence: string;
  sentenceVi: string;
  lesson?: string;
}

export interface SentenceStructure {
  id: string;
  structure: string;
  meaning: string;
  example: string;
  exampleVi: string;
  speechText: string;
  lesson?: string;
}

export interface LessonSection {
  lessonNumber: number;
  lessonTitle: string;
  theme?: string;
  vocabulary: VocabularyItem[];
  sentences: SentenceStructure[];
}

export interface UnitData {
  unitKey: string;
  unitNumber: number;
  unitName: string;
  unitFullName: string;
  theme: string;
  lessons?: LessonSection[];
  vocabulary: VocabularyItem[];
  sentences: SentenceStructure[];
}

export interface GradeData {
  grade?: number;
  gradeNumber?: number;
  gradeTitle: string;
  curriculum: string;
  publisher?: string;
  description?: string;
  totalUnits?: number;
  units: UnitData[];
}

export interface BookmapDatabase {
  curriculumName?: string;
  standard?: string;
  grades: {
    [gradeKey: string]: GradeData;
  };
}

import { grade3Data } from './grade3Data';
import { grade4Data } from './grade4Data';
import { grade5Data } from './grade5Data';

export const bookmapDatabase: BookmapDatabase = {
  ...((rawData as unknown) as BookmapDatabase),
  grades: {
    ...((rawData as unknown) as BookmapDatabase).grades,
    '3': grade3Data,
    '4': grade4Data,
    '5': grade5Data
  }
};
export { grade3Data, grade4Data, grade5Data };
