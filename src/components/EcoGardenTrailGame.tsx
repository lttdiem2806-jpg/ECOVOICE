import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Sprout, 
  Award, 
  Check, 
  Lightbulb,
  ArrowRight,
  Heart,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

export interface EcoGardenQuestion {
  id: string;
  type: 'fill_sentence' | 'type_vocab';
  category: 1 | 2 | 3 | 4 | 5;
  categoryLabel: string;
  promptEn: string;
  promptVi: string;
  displaySentence?: string; // Sentence with blank ______
  targetWord: string;       // Target word to fill, e.g. "from", "Vietnam", "friend"
  fullSentence: string;     // Complete English sentence
  audioText: string;        // Text spoken by TTS
  meaningVi: string;        // Vietnamese meaning
  letterHint: string;       // E.g. "f _ _ _ _ d" or "f..."
  stationFlowerName: string; // Flower for this station
  flowerEmoji: string;
}

export interface EcoGardenTrailGameProps {
  selectedUnitName: string;
  selectedLessonName?: string;
  vocabularyList: any[];
  sentenceList?: any[];
  allUnitVocabularies?: any[];
  allUnitSentences?: any[];
  onBackToGames: () => void;
  playSoundEffect: (name: 'chime' | 'success' | 'click' | 'celebrate' | 'fail') => void;
  onAwardEP: (ep: number) => void;
  onAwardTree?: () => void;
  totalUserTrees?: number;
  onOpenGarden?: () => void;
}

const TOTAL_QUESTIONS = 5;

export const FLOWER_STATION_META = [
  { name: 'Khóm Hoa Hướng Dương', emoji: '🌻', color: 'from-amber-400 to-yellow-500', bloomDesc: 'Hướng dương nở vàng rực rỡ đón nắng sớm' },
  { name: 'Khóm Hoa Hồng Tươi Thắm', emoji: '🌹', color: 'from-rose-400 to-red-500', bloomDesc: 'Hoa hồng ngát hương làm đẹp lối đi' },
  { name: 'Khóm Cúc Họa Mi Trắng', emoji: '🌼', color: 'from-emerald-300 to-teal-400', bloomDesc: 'Cúc họa mi bừng nở tinh khôi mát lành' },
  { name: 'Khóm Hoa Tulip Sắc Màu', emoji: '🌷', color: 'from-fuchsia-400 to-pink-500', bloomDesc: 'Tulip kiêu hãnh khoe sắc thắm bên cỏ non' },
  { name: 'Vườn Hoa & Đàn Bướm Mật', emoji: '🌺', color: 'from-pink-500 to-purple-600', bloomDesc: 'Cả con đường mòn ngập tràn sắc hoa và bướm lượn' }
];

// Helper to create a letter hint, e.g. "f _ _ _ _ d"
export const makeLetterHint = (word: string): string => {
  const clean = (word || '').trim();
  if (clean.length <= 2) return clean;
  const first = clean[0];
  const last = clean[clean.length - 1];
  const middle = clean.slice(1, -1).split('').map(c => c === ' ' ? '  ' : '_').join(' ');
  return `${first} ${middle} ${last}`;
};

// MASTER DIVERSE QUESTION POOL (Over 25+ authentic textbook questions structured across 5 distinct linguistic facets)
export const MASTER_DIVERSE_QUESTION_POOL: Record<1 | 2 | 3 | 4 | 5, EcoGardenQuestion[]> = {
  // Category 1: Từ vựng tên quốc gia / Chủ điểm chính (Country & Topic Vocab)
  1: [
    {
      id: 'egt_cat1_america',
      type: 'fill_sentence',
      category: 1,
      categoryLabel: 'Từ vựng quốc gia (Country)',
      promptEn: 'Listen and fill in the country name in the sentence:',
      promptVi: 'Nghe phát âm và điền tên quốc gia (Nước Mỹ / Hoa Kỳ):',
      displaySentence: 'He is from ______ .',
      targetWord: 'America',
      fullSentence: 'He is from America.',
      audioText: 'America. He is from America.',
      meaningVi: 'Cậu ấy đến từ nước Mỹ.',
      letterHint: 'A _ _ _ _ _ a',
      stationFlowerName: 'Khóm Hoa Hướng Dương',
      flowerEmoji: '🌻'
    },
    {
      id: 'egt_cat1_britain',
      type: 'fill_sentence',
      category: 1,
      categoryLabel: 'Từ vựng quốc gia (Country)',
      promptEn: 'Listen and fill in the country name in the sentence:',
      promptVi: 'Nghe phát âm và điền tên quốc gia (Nước Anh):',
      displaySentence: 'She is from ______ .',
      targetWord: 'Britain',
      fullSentence: 'She is from Britain.',
      audioText: 'Britain. She is from Britain.',
      meaningVi: 'Cô ấy đến từ nước Anh.',
      letterHint: 'B _ _ _ _ _ n',
      stationFlowerName: 'Khóm Hoa Hướng Dương',
      flowerEmoji: '🌻'
    },
    {
      id: 'egt_cat1_malaysia',
      type: 'fill_sentence',
      category: 1,
      categoryLabel: 'Từ vựng quốc gia (Country)',
      promptEn: 'Listen and fill in the country name in the sentence:',
      promptVi: 'Nghe phát âm và điền tên quốc gia (Nước Ma-lay-xi-a):',
      displaySentence: 'He is from ______ .',
      targetWord: 'Malaysia',
      fullSentence: 'He is from Malaysia.',
      audioText: 'Malaysia. He is from Malaysia.',
      meaningVi: 'Bạn ấy đến từ nước Ma-lay-xi-a.',
      letterHint: 'M _ _ _ _ _ _ a',
      stationFlowerName: 'Khóm Hoa Hướng Dương',
      flowerEmoji: '🌻'
    },
    {
      id: 'egt_cat1_singapore',
      type: 'fill_sentence',
      category: 1,
      categoryLabel: 'Từ vựng quốc gia (Country)',
      promptEn: 'Listen and fill in the country name in the sentence:',
      promptVi: 'Nghe phát âm và điền tên quốc gia (Nước Xin-ga-po):',
      displaySentence: 'They are from ______ .',
      targetWord: 'Singapore',
      fullSentence: 'They are from Singapore.',
      audioText: 'Singapore. They are from Singapore.',
      meaningVi: 'Họ đến từ nước Xin-ga-po.',
      letterHint: 'S _ _ _ _ _ _ _ e',
      stationFlowerName: 'Khóm Hoa Hướng Dương',
      flowerEmoji: '🌻'
    },
    {
      id: 'egt_cat1_japan',
      type: 'fill_sentence',
      category: 1,
      categoryLabel: 'Từ vựng quốc gia (Country)',
      promptEn: 'Listen and fill in the country name in the sentence:',
      promptVi: 'Nghe phát âm và điền tên quốc gia (Nước Nhật Bản):',
      displaySentence: 'We are from ______ .',
      targetWord: 'Japan',
      fullSentence: 'We are from Japan.',
      audioText: 'Japan. We are from Japan.',
      meaningVi: 'Chúng mình đến từ nước Nhật Bản.',
      letterHint: 'J _ _ _ n',
      stationFlowerName: 'Khóm Hoa Hướng Dương',
      flowerEmoji: '🌻'
    },
    {
      id: 'egt_cat1_vietnam',
      type: 'fill_sentence',
      category: 1,
      categoryLabel: 'Từ vựng quốc gia (Country)',
      promptEn: 'Listen and fill in the country name in the sentence:',
      promptVi: 'Nghe phát âm và điền tên quê hương (Nước Việt Nam):',
      displaySentence: 'I am from ______ .',
      targetWord: 'Vietnam',
      fullSentence: 'I am from Vietnam.',
      audioText: 'Vietnam. I am from Vietnam.',
      meaningVi: 'Mình đến từ Việt Nam.',
      letterHint: 'V _ _ _ _ _ m',
      stationFlowerName: 'Khóm Hoa Hướng Dương',
      flowerEmoji: '🌻'
    }
  ],

  // Category 2: Mẫu câu hỏi và trả lời quê quán / Trọng tâm giao tiếp (Where are you from / I'm from)
  2: [
    {
      id: 'egt_cat2_from',
      type: 'fill_sentence',
      category: 2,
      categoryLabel: 'Mẫu câu hỏi quê quán (Question)',
      promptEn: 'Listen and fill in the missing word in the question:',
      promptVi: 'Nghe và điền từ còn thiếu vào câu hỏi về quê quán:',
      displaySentence: 'Where are you ______ ?',
      targetWord: 'from',
      fullSentence: 'Where are you from?',
      audioText: 'Where are you from?',
      meaningVi: 'Bạn đến từ đâu?',
      letterHint: 'f _ _ m',
      stationFlowerName: 'Khóm Hoa Hồng Tươi Thắm',
      flowerEmoji: '🌹'
    },
    {
      id: 'egt_cat2_where',
      type: 'fill_sentence',
      category: 2,
      categoryLabel: 'Từ để hỏi nơi chốn (Wh- Question)',
      promptEn: 'Listen and fill in the question word (Where):',
      promptVi: 'Nghe và điền từ để hỏi nơi chốn (Ở đâu):',
      displaySentence: '______ are you from?',
      targetWord: 'Where',
      fullSentence: 'Where are you from?',
      audioText: 'Where are you from?',
      meaningVi: 'Bạn đến từ đâu? (Từ để hỏi: Ở đâu)',
      letterHint: 'W _ _ _ e',
      stationFlowerName: 'Khóm Hoa Hồng Tươi Thắm',
      flowerEmoji: '🌹'
    },
    {
      id: 'egt_cat2_from_ans',
      type: 'fill_sentence',
      category: 2,
      categoryLabel: 'Mẫu câu trả lời xuất xứ (Origin)',
      promptEn: 'Listen and fill in the preposition (from):',
      promptVi: 'Nghe và điền giới từ xuất xứ (đến từ...):',
      displaySentence: "I'm ______ Vietnam.",
      targetWord: 'from',
      fullSentence: "I'm from Vietnam.",
      audioText: "I'm from Vietnam.",
      meaningVi: 'Mình đến từ Việt Nam.',
      letterHint: 'f _ _ m',
      stationFlowerName: 'Khóm Hoa Hồng Tươi Thắm',
      flowerEmoji: '🌹'
    },
    {
      id: 'egt_cat2_where_she',
      type: 'fill_sentence',
      category: 2,
      categoryLabel: 'Từ để hỏi người khác (Wh- Question)',
      promptEn: 'Listen and fill in the question word (Where):',
      promptVi: 'Nghe và điền từ để hỏi về quê hương người khác:',
      displaySentence: '______ is she from?',
      targetWord: 'Where',
      fullSentence: 'Where is she from?',
      audioText: 'Where is she from?',
      meaningVi: 'Cô ấy đến từ đâu?',
      letterHint: 'W _ _ _ e',
      stationFlowerName: 'Khóm Hoa Hồng Tươi Thắm',
      flowerEmoji: '🌹'
    }
  ],

  // Category 3: Nghe, điền đại từ nhân xưng (he / she / they / you)
  3: [
    {
      id: 'egt_cat3_she',
      type: 'fill_sentence',
      category: 3,
      categoryLabel: 'Đại từ nhân xưng (Pronoun: she)',
      promptEn: 'Listen and fill in the pronoun (he or she):',
      promptVi: 'Nghe và điền đại từ chỉ bạn nữ (cô ấy / bạn gái):',
      displaySentence: 'Where is ______ from? - She is from Britain.',
      targetWord: 'she',
      fullSentence: 'Where is she from? She is from Britain.',
      audioText: 'Where is she from? She is from Britain.',
      meaningVi: 'Cô ấy đến từ đâu? - Cô ấy đến từ nước Anh.',
      letterHint: 's _ e',
      stationFlowerName: 'Khóm Cúc Họa Mi Trắng',
      flowerEmoji: '🌼'
    },
    {
      id: 'egt_cat3_he',
      type: 'fill_sentence',
      category: 3,
      categoryLabel: 'Đại từ nhân xưng (Pronoun: he)',
      promptEn: 'Listen and fill in the pronoun (he or she):',
      promptVi: 'Nghe và điền đại từ chỉ bạn nam (cậu ấy / bạn trai):',
      displaySentence: 'Where is ______ from? - He is from America.',
      targetWord: 'he',
      fullSentence: 'Where is he from? He is from America.',
      audioText: 'Where is he from? He is from America.',
      meaningVi: 'Cậu ấy đến từ đâu? - Cậu ấy đến từ nước Mỹ.',
      letterHint: 'h _',
      stationFlowerName: 'Khóm Cúc Họa Mi Trắng',
      flowerEmoji: '🌼'
    },
    {
      id: 'egt_cat3_they',
      type: 'fill_sentence',
      category: 3,
      categoryLabel: 'Đại từ số nhiều (Pronoun: they)',
      promptEn: 'Listen and fill in the plural pronoun (they):',
      promptVi: 'Nghe và điền đại từ số nhiều (họ / các bạn ấy):',
      displaySentence: 'Where are ______ from? - They are from Singapore.',
      targetWord: 'they',
      fullSentence: 'Where are they from? They are from Singapore.',
      audioText: 'Where are they from? They are from Singapore.',
      meaningVi: 'Họ đến từ đâu? - Họ đến từ Xin-ga-po.',
      letterHint: 't _ _ y',
      stationFlowerName: 'Khóm Cúc Họa Mi Trắng',
      flowerEmoji: '🌼'
    },
    {
      id: 'egt_cat3_you',
      type: 'fill_sentence',
      category: 3,
      categoryLabel: 'Đại từ người đối thoại (Pronoun: you)',
      promptEn: 'Listen and fill in the pronoun (you):',
      promptVi: 'Nghe và điền đại từ người đối thoại (bạn):',
      displaySentence: 'Where are ______ from? - I am from Vietnam.',
      targetWord: 'you',
      fullSentence: 'Where are you from? I am from Vietnam.',
      audioText: 'Where are you from? I am from Vietnam.',
      meaningVi: 'Bạn đến từ đâu? - Mình đến từ Việt Nam.',
      letterHint: 'y _ u',
      stationFlowerName: 'Khóm Cúc Họa Mi Trắng',
      flowerEmoji: '🌼'
    }
  ],

  // Category 4: Nghe, điền động từ To-be (is / are / am)
  4: [
    {
      id: 'egt_cat4_is_she',
      type: 'fill_sentence',
      category: 4,
      categoryLabel: 'Động từ to-be số ít (Verb: is)',
      promptEn: 'Listen and fill in the correct to-be verb (is / are):',
      promptVi: 'Nghe và điền động từ to-be đi với ngôi she (is / are):',
      displaySentence: 'Where ______ she from?',
      targetWord: 'is',
      fullSentence: 'Where is she from?',
      audioText: 'Where is she from?',
      meaningVi: 'Cô ấy đến từ đâu? (Điền to-be số ít)',
      letterHint: 'i _',
      stationFlowerName: 'Khóm Hoa Tulip Sắc Màu',
      flowerEmoji: '🌷'
    },
    {
      id: 'egt_cat4_is_he',
      type: 'fill_sentence',
      category: 4,
      categoryLabel: 'Động từ to-be số ít (Verb: is)',
      promptEn: 'Listen and fill in the correct to-be verb (is / are):',
      promptVi: 'Nghe và điền động từ to-be đi với ngôi he (is / are):',
      displaySentence: 'Where ______ he from?',
      targetWord: 'is',
      fullSentence: 'Where is he from?',
      audioText: 'Where is he from?',
      meaningVi: 'Cậu ấy đến từ đâu? (Điền to-be số ít)',
      letterHint: 'i _',
      stationFlowerName: 'Khóm Hoa Tulip Sắc Màu',
      flowerEmoji: '🌷'
    },
    {
      id: 'egt_cat4_are_you',
      type: 'fill_sentence',
      category: 4,
      categoryLabel: 'Động từ to-be cho you (Verb: are)',
      promptEn: 'Listen and fill in the correct to-be verb (is / are):',
      promptVi: 'Nghe và điền động từ to-be đi với ngôi you (is / are):',
      displaySentence: 'Where ______ you from?',
      targetWord: 'are',
      fullSentence: 'Where are you from?',
      audioText: 'Where are you from?',
      meaningVi: 'Bạn đến từ đâu? (Điền to-be cho you)',
      letterHint: 'a _ e',
      stationFlowerName: 'Khóm Hoa Tulip Sắc Màu',
      flowerEmoji: '🌷'
    },
    {
      id: 'egt_cat4_are_they',
      type: 'fill_sentence',
      category: 4,
      categoryLabel: 'Động từ to-be số nhiều (Verb: are)',
      promptEn: 'Listen and fill in the correct to-be verb (is / are):',
      promptVi: 'Nghe và điền động từ to-be số nhiều đi với they:',
      displaySentence: 'Where ______ they from?',
      targetWord: 'are',
      fullSentence: 'Where are they from?',
      audioText: 'Where are they from?',
      meaningVi: 'Họ đến từ đâu? (Điền to-be số nhiều)',
      letterHint: 'a _ e',
      stationFlowerName: 'Khóm Hoa Tulip Sắc Màu',
      flowerEmoji: '🌷'
    },
    {
      id: 'egt_cat4_am',
      type: 'fill_sentence',
      category: 4,
      categoryLabel: 'Động từ to-be cho I (Verb: am)',
      promptEn: 'Listen and fill in the correct to-be verb (am):',
      promptVi: 'Nghe và điền động từ to-be đi với chủ ngữ I (am):',
      displaySentence: 'I ______ from Vietnam.',
      targetWord: 'am',
      fullSentence: 'I am from Vietnam.',
      audioText: 'I am from Vietnam.',
      meaningVi: 'Mình đến từ Việt Nam.',
      letterHint: 'a _',
      stationFlowerName: 'Khóm Hoa Tulip Sắc Màu',
      flowerEmoji: '🌷'
    }
  ],

  // Category 5: Từ vựng mở rộng & Lời chào thân mật / Môi trường (Extended Vocab & Greetings)
  5: [
    {
      id: 'egt_cat5_friend',
      type: 'fill_sentence',
      category: 5,
      categoryLabel: 'Từ vựng tình bạn (Friend)',
      promptEn: 'Listen and fill in the friendship word in the sentence:',
      promptVi: 'Nghe và điền từ vựng chỉ tình bạn (người bạn):',
      displaySentence: 'She is my best ______ .',
      targetWord: 'friend',
      fullSentence: 'She is my best friend.',
      audioText: 'Friend. She is my best friend.',
      meaningVi: 'Cô ấy là người bạn thân nhất của mình.',
      letterHint: 'f _ _ _ _ d',
      stationFlowerName: 'Vườn Hoa & Đàn Bướm Mật',
      flowerEmoji: '🌺'
    },
    {
      id: 'egt_cat5_meet',
      type: 'fill_sentence',
      category: 5,
      categoryLabel: 'Câu chào gặp gỡ (Greeting: meet)',
      promptEn: 'Listen and fill in the verb in the greeting:',
      promptVi: 'Nghe và điền động từ làm quen (gặp gỡ):',
      displaySentence: 'Nice to ______ you.',
      targetWord: 'meet',
      fullSentence: 'Nice to meet you.',
      audioText: 'Nice to meet you.',
      meaningVi: 'Rất vui được gặp bạn.',
      letterHint: 'm _ _ t',
      stationFlowerName: 'Vườn Hoa & Đàn Bướm Mật',
      flowerEmoji: '🌺'
    },
    {
      id: 'egt_cat5_nice',
      type: 'fill_sentence',
      category: 5,
      categoryLabel: 'Tính từ xã giao (Greeting: Nice)',
      promptEn: 'Listen and fill in the greeting word (Nice):',
      promptVi: 'Nghe và điền từ đầu câu chào (Rất vui / Tốt đẹp):',
      displaySentence: '______ to meet you.',
      targetWord: 'Nice',
      fullSentence: 'Nice to meet you.',
      audioText: 'Nice to meet you.',
      meaningVi: 'Rất vui được gặp bạn.',
      letterHint: 'N _ _ e',
      stationFlowerName: 'Vườn Hoa & Đàn Bướm Mật',
      flowerEmoji: '🌺'
    },
    {
      id: 'egt_cat5_hello',
      type: 'fill_sentence',
      category: 5,
      categoryLabel: 'Lời chào thân mật (Greeting: Hello)',
      promptEn: 'Listen and fill in the greeting (Hello):',
      promptVi: 'Nghe và điền lời chào tiếng Anh thân mật (Xin chào):',
      displaySentence: '______ ! My name is Lucy.',
      targetWord: 'Hello',
      fullSentence: 'Hello! My name is Lucy.',
      audioText: 'Hello! My name is Lucy.',
      meaningVi: 'Xin chào! Mình tên là Lucy.',
      letterHint: 'H _ _ _ o',
      stationFlowerName: 'Vườn Hoa & Đàn Bướm Mật',
      flowerEmoji: '🌺'
    },
    {
      id: 'egt_cat5_flowers',
      type: 'fill_sentence',
      category: 5,
      categoryLabel: 'Khu vườn sinh thái (Nature: flowers)',
      promptEn: 'Listen and fill in the nature word (flowers):',
      promptVi: 'Nghe và điền từ thiên nhiên (những bông hoa):',
      displaySentence: 'I water the ______ in my garden.',
      targetWord: 'flowers',
      fullSentence: 'I water the flowers in my garden.',
      audioText: 'I water the flowers in my garden.',
      meaningVi: 'Em tưới những bông hoa trong vườn sinh thái.',
      letterHint: 'f _ _ _ _ _ s',
      stationFlowerName: 'Vườn Hoa & Đàn Bướm Mật',
      flowerEmoji: '🌺'
    },
    {
      id: 'egt_cat5_garden',
      type: 'fill_sentence',
      category: 5,
      categoryLabel: 'Khu vườn sinh thái (Nature: garden)',
      promptEn: 'Listen and fill in the nature word (garden):',
      promptVi: 'Nghe và điền từ chỉ khu vườn sinh thái (garden):',
      displaySentence: 'Welcome to our green ______ .',
      targetWord: 'garden',
      fullSentence: 'Welcome to our green garden.',
      audioText: 'Welcome to our green garden.',
      meaningVi: 'Chào mừng các bạn đến với khu vườn xanh.',
      letterHint: 'g _ _ _ _ n',
      stationFlowerName: 'Vườn Hoa & Đàn Bướm Mật',
      flowerEmoji: '🌺'
    }
  ]
};

// Builder function that constructs a 15-25+ Question Pool and selects 5 diverse, non-repeating questions
export function buildEcoGardenTrailQuestions(
  sentenceList: any[] = [],
  allUnitSentences: any[] = [],
  vocabularyList: any[] = [],
  allUnitVocabularies: any[] = []
): EcoGardenQuestion[] {
  // Deep clone candidate pools for categories 1..5
  const dynamicPool: Record<1 | 2 | 3 | 4 | 5, EcoGardenQuestion[]> = {
    1: [...MASTER_DIVERSE_QUESTION_POOL[1]],
    2: [...MASTER_DIVERSE_QUESTION_POOL[2]],
    3: [...MASTER_DIVERSE_QUESTION_POOL[3]],
    4: [...MASTER_DIVERSE_QUESTION_POOL[4]],
    5: [...MASTER_DIVERSE_QUESTION_POOL[5]]
  };

  const allSentences = [
    ...(sentenceList || []),
    ...(allUnitSentences || [])
  ];

  const allVocabs = (allUnitVocabularies && allUnitVocabularies.length > 0)
    ? [...allUnitVocabularies]
    : (vocabularyList || []);

  // Dynamically analyze current Unit's vocabulary for Category 1 & Category 5
  allVocabs.forEach((v: any, idx: number) => {
    if (v.word && v.meaning) {
      const wordClean = (v.word || '').trim();
      if (wordClean.length >= 3) {
        // If word is a capitalized noun / country / subject -> Category 1
        const isTopicNoun = /^[A-Z][a-z]+$/.test(wordClean) || v.meaning.includes('Nước') || v.meaning.includes('Môn');
        const targetCategory = isTopicNoun ? 1 : 5;
        const displaySent = v.sentence ? v.sentence.replace(new RegExp(`\\b${wordClean}\\b`, 'i'), '______') : undefined;

        dynamicPool[targetCategory].push({
          id: `egt_dyn_vocab_${idx}`,
          type: displaySent ? 'fill_sentence' : 'type_vocab',
          category: targetCategory,
          categoryLabel: isTopicNoun ? 'Từ vựng trọng tâm (Topic Vocab)' : 'Từ vựng mở rộng (Extended Vocab)',
          promptEn: displaySent ? 'Listen and fill in the missing word in the sentence:' : 'Listen and type the English word:',
          promptVi: displaySent ? `Nghe và điền từ "${wordClean}" vào câu:` : `Nghe phát âm và gõ từ vựng (${v.meaning}):`,
          displaySentence: displaySent,
          targetWord: wordClean,
          fullSentence: v.sentence || `The word is ${wordClean}.`,
          audioText: v.sentence ? `${wordClean}. ${v.sentence}` : wordClean,
          meaningVi: v.meaning,
          letterHint: makeLetterHint(wordClean),
          stationFlowerName: FLOWER_STATION_META[targetCategory - 1].name,
          flowerEmoji: FLOWER_STATION_META[targetCategory - 1].emoji
        });
      }
    }
  });

  // Dynamically analyze current Unit's sentences for Pronouns (Cat 3), To-Be (Cat 4), and Wh-questions (Cat 2)
  allSentences.forEach((s: any, idx: number) => {
    const rawText = s.example || s.structure || s.speechText || '';
    if (!rawText) return;
    const sent = rawText.includes(' - ') ? rawText.split(/\s*-\s*/)[0].trim() : rawText.trim();

    // Check for Pronouns (he, she, they, we, you) -> Category 3
    const pronounMatch = sent.match(/\b(she|he|they|you|we)\b/i);
    if (pronounMatch && pronounMatch[1]) {
      const pWord = pronounMatch[1];
      const blanked = sent.replace(new RegExp(`\\b${pWord}\\b`, 'i'), '______');
      dynamicPool[3].push({
        id: `egt_dyn_pronoun_${idx}`,
        type: 'fill_sentence',
        category: 3,
        categoryLabel: `Đại từ nhân xưng (${pWord.toLowerCase()})`,
        promptEn: `Listen and fill in the pronoun (${pWord}):`,
        promptVi: `Nghe phát âm và điền đại từ nhân xưng (${pWord.toLowerCase()}):`,
        displaySentence: blanked,
        targetWord: pWord,
        fullSentence: sent,
        audioText: sent,
        meaningVi: s.meaning || s.exampleVi || 'Mẫu câu đại từ nhân xưng',
        letterHint: makeLetterHint(pWord),
        stationFlowerName: FLOWER_STATION_META[2].name,
        flowerEmoji: FLOWER_STATION_META[2].emoji
      });
    }

    // Check for To-be / Auxiliary (is, are, am, can, do) -> Category 4
    const tobeMatch = sent.match(/\b(is|are|am|can|do)\b/i);
    if (tobeMatch && tobeMatch[1]) {
      const verbWord = tobeMatch[1];
      const blanked = sent.replace(new RegExp(`\\b${verbWord}\\b`, 'i'), '______');
      dynamicPool[4].push({
        id: `egt_dyn_tobe_${idx}`,
        type: 'fill_sentence',
        category: 4,
        categoryLabel: `Động từ liên kết (${verbWord.toLowerCase()})`,
        promptEn: `Listen and fill in the verb (${verbWord}):`,
        promptVi: `Nghe phát âm và điền động từ (${verbWord.toLowerCase()}):`,
        displaySentence: blanked,
        targetWord: verbWord,
        fullSentence: sent,
        audioText: sent,
        meaningVi: s.meaning || s.exampleVi || 'Mẫu câu động từ to-be',
        letterHint: makeLetterHint(verbWord),
        stationFlowerName: FLOWER_STATION_META[3].name,
        flowerEmoji: FLOWER_STATION_META[3].emoji
      });
    }

    // Check for Wh- Question words (Where, What, When, How) -> Category 2
    const whMatch = sent.match(/\b(Where|What|When|How)\b/i);
    if (whMatch && whMatch[1]) {
      const whWord = whMatch[1];
      const blanked = sent.replace(new RegExp(`\\b${whWord}\\b`, 'i'), '______');
      dynamicPool[2].push({
        id: `egt_dyn_wh_${idx}`,
        type: 'fill_sentence',
        category: 2,
        categoryLabel: `Từ để hỏi (${whWord})`,
        promptEn: `Listen and fill in the question word (${whWord}):`,
        promptVi: `Nghe phát âm và điền từ để hỏi (${whWord}):`,
        displaySentence: blanked,
        targetWord: whWord,
        fullSentence: sent,
        audioText: sent,
        meaningVi: s.meaning || s.exampleVi || 'Mẫu câu hỏi giao tiếp',
        letterHint: makeLetterHint(whWord),
        stationFlowerName: FLOWER_STATION_META[1].name,
        flowerEmoji: FLOWER_STATION_META[1].emoji
      });
    }
  });

  // SMART DIVERSE RANDOM SELECTION:
  // Select EXACTLY 1 question from Category 1, 1 from Cat 2, 1 from Cat 3, 1 from Cat 4, 1 from Cat 5
  // with STRICT Target Word Deduplication so no word (like 'from') ever repeats in the same session!
  const usedTargetWords = new Set<string>();
  const selectedQuestions: EcoGardenQuestion[] = [];

  for (let catNum = 1; catNum <= 5; catNum++) {
    const cat = catNum as 1 | 2 | 3 | 4 | 5;
    const candidates = [...dynamicPool[cat]].sort(() => 0.5 - Math.random());
    
    // Find candidate whose targetWord is not already used in this round
    let chosen = candidates.find(q => !usedTargetWords.has(q.targetWord.toLowerCase().trim()));
    if (!chosen && candidates.length > 0) {
      chosen = candidates[0];
    }

    if (chosen) {
      usedTargetWords.add(chosen.targetWord.toLowerCase().trim());
      const station = FLOWER_STATION_META[catNum - 1];
      selectedQuestions.push({
        ...chosen,
        id: `egt_session_q${catNum}_${chosen.id}`,
        stationFlowerName: station.name,
        flowerEmoji: station.emoji
      });
    }
  }

  // Guarantee exactly 5 questions
  return selectedQuestions.length === 5 
    ? selectedQuestions 
    : [
        MASTER_DIVERSE_QUESTION_POOL[1][0],
        MASTER_DIVERSE_QUESTION_POOL[2][0],
        MASTER_DIVERSE_QUESTION_POOL[3][0],
        MASTER_DIVERSE_QUESTION_POOL[4][0],
        MASTER_DIVERSE_QUESTION_POOL[5][0]
      ];
}

export const EcoGardenTrailGame: React.FC<EcoGardenTrailGameProps> = ({
  selectedUnitName,
  selectedLessonName,
  vocabularyList,
  sentenceList = [],
  allUnitVocabularies = [],
  allUnitSentences = [],
  onBackToGames,
  playSoundEffect,
  onAwardEP,
  onAwardTree
}) => {
  // Game session questions
  const [questions, setQuestions] = useState<EcoGardenQuestion[]>(() =>
    buildEcoGardenTrailQuestions(sentenceList, allUnitSentences, vocabularyList, allUnitVocabularies)
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Blooming stations state: array of boolean indicating whether station 0..4 is bloomed
  const [bloomedStations, setBloomedStations] = useState<boolean[]>([false, false, false, false, false]);

  // Completion modal & reward
  const [showEcoPopup, setShowEcoPopup] = useState<boolean>(false);
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const initGameSession = () => {
    clearTimer();
    setCurrentIndex(0);
    setUserInput('');
    setIsAnswerCorrect(null);
    setShowHint(false);
    setFeedbackMsg(null);
    setBloomedStations([false, false, false, false, false]);
    setShowEcoPopup(false);
    setHasClaimedReward(false);
    setClaimSuccessMsg(null);

    const generated = buildEcoGardenTrailQuestions(
      sentenceList,
      allUnitSentences,
      vocabularyList,
      allUnitVocabularies
    );
    setQuestions(generated);
  };

  useEffect(() => {
    initGameSession();
  }, [selectedUnitName, selectedLessonName]);

  // Focus input on mount or question change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

  const currentQ = questions[currentIndex] || questions[0] || MASTER_DIVERSE_QUESTION_POOL[1][0];

  // Text to Speech
  const speakAudio = (text: string) => {
    if (!text) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-play audio on question switch
  useEffect(() => {
    if (currentQ?.audioText) {
      const t = setTimeout(() => {
        speakAudio(currentQ.audioText);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [currentIndex, currentQ?.id]);

  // Normalize string for lenient comparison
  const normalizeText = (txt: string): string => {
    return (txt || '')
      .toLowerCase()
      .trim()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
      .replace(/\s+/g, ' ');
  };

  // Check Answer Handler (Instant Audio & Visual Feedback)
  const handleCheckAnswer = () => {
    if (isAnswerCorrect === true) return; // Already correct

    // If input is empty, trigger gentle audio feedback and visual guide
    if (!userInput.trim()) {
      playSoundEffect('fail');
      setIsAnswerCorrect(false);
      setFeedbackMsg({
        text: `🌱 Bé hãy bấm "Listen / Nghe" rồi gõ từ vào ô trước khi bấm Kiểm tra nhé! 🎧`,
        isCorrect: false
      });
      return;
    }

    const normalizedInput = normalizeText(userInput);
    const normalizedTarget = normalizeText(currentQ.targetWord);
    const normalizedFull = normalizeText(currentQ.fullSentence);

    // Accept if student typed the exact target word OR the full sentence!
    const isCorrect = normalizedInput === normalizedTarget || 
                      normalizedInput === normalizedFull || 
                      (normalizedTarget.length > 2 && normalizedInput.endsWith(normalizedTarget));

    if (isCorrect) {
      playSoundEffect('success');
      setIsAnswerCorrect(true);
      setFeedbackMsg({
        text: `🌸 Chính xác! Khóm "${currentQ.stationFlowerName}" đã bung nở rực rỡ trên con đường sinh thái! (+10 EP)`,
        isCorrect: true
      });

      // Bloom the current station
      setBloomedStations(prev => {
        const next = [...prev];
        next[currentIndex] = true;
        return next;
      });

      // If last question completed
      if (currentIndex + 1 >= TOTAL_QUESTIONS) {
        timerRef.current = setTimeout(() => {
          playSoundEffect('celebrate');
          setShowEcoPopup(true);
        }, 1200);
      }
    } else {
      // Gentle encouraging cartoon feedback, no point penalty
      playSoundEffect('fail');
      setIsAnswerCorrect(false);
      setFeedbackMsg({
        text: `🌱 Chưa chính xác lắm. Bé hãy bấm "Listen / Nghe" lại thật kỹ và thử gõ lại nhé! 🌸`,
        isCorrect: false
      });
    }
  };

  // Next Question Handler
  const handleNextQuestion = () => {
    if (!isAnswerCorrect) return;
    playSoundEffect('click');

    if (currentIndex + 1 < TOTAL_QUESTIONS) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setIsAnswerCorrect(null);
      setShowHint(false);
      setFeedbackMsg(null);
    } else {
      setShowEcoPopup(true);
    }
  };

  // Claim Reward Handler: +30 EP and 1 tree according to standard system rules
  const handleClaimReward = () => {
    if (hasClaimedReward) return;
    playSoundEffect('celebrate');
    onAwardEP(30);
    if (onAwardTree) {
      onAwardTree();
    }
    setHasClaimedReward(true);
    setClaimSuccessMsg('🎉 Chúc mừng! Bạn đã nhận thành công +30 EP và vun trồng thêm 1 cây xanh tươi tốt vào khu vườn!');
  };

  const completedCount = bloomedStations.filter(Boolean).length;
  const progressPercent = Math.min(100, Math.round((completedCount / TOTAL_QUESTIONS) * 100));

  return (
    <div className="w-full flex flex-col gap-4 max-w-5xl mx-auto pb-10">
      
      {/* 1. TOP BAR NAVIGATION & TITLE */}
      <div className="w-full bg-white rounded-3xl p-4 sm:p-5 border-2 border-pink-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playSoundEffect('click');
              onBackToGames();
            }}
            className="p-2 sm:p-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-950 font-bold border border-pink-200 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 text-xs sm:text-sm shadow-xs"
            title="Quay lại danh sách trò chơi"
          >
            <ArrowLeft className="w-4 h-4 text-pink-800" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🌸</span>
              <h2 className="text-lg sm:text-xl font-black text-pink-950 tracking-tight">
                Eco Garden Trail - Con đường vườn sinh thái
              </h2>
            </div>
            <p className="text-xs text-stone-600 font-medium mt-0.5">
              {selectedUnitName} {selectedLessonName ? `• ${selectedLessonName}` : ''} · Phủ xanh con đường hoa
            </p>
          </div>
        </div>

        {/* Progress Counter Badge */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="px-3 py-1.5 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-black">
            Câu {currentIndex + 1} / {TOTAL_QUESTIONS}
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black shadow-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>{progressPercent}% Nở hoa</span>
          </div>
        </div>
      </div>

      {/* 2. ECO GARDEN TRAIL VISUALIZER (Visual Winding Cobblestone Trail with 5 Flower Stations) */}
      <div className="w-full bg-gradient-to-b from-sky-300 via-emerald-100 to-emerald-200 rounded-3xl p-4 sm:p-6 border-2 border-emerald-300 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[280px] sm:min-h-[340px]">
        
        {/* Soft Background Clouds & Sunshine */}
        <div className="absolute top-3 left-8 flex items-center gap-2 opacity-75 pointer-events-none">
          <div className="w-14 h-5 bg-white/80 rounded-full blur-[1px]" />
          <div className="w-18 h-7 bg-white/90 rounded-full -ml-5" />
        </div>
        <div className="absolute top-4 right-16 flex items-center gap-2 opacity-75 pointer-events-none">
          <div className="w-16 h-6 bg-white/80 rounded-full" />
          <div className="w-22 h-8 bg-white/90 rounded-full -ml-6" />
        </div>

        {/* Trail Status Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/70 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-black text-lg shadow-2xs">
              🌺
            </span>
            <div>
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                Tiến độ đường hoa sinh thái
              </span>
              <span className="text-[11px] font-bold text-emerald-800">
                {completedCount === 0 && 'Trạng thái: Con đường mòn đang chờ những mầm hoa đầu tiên'}
                {completedCount === 1 && 'Khởi đầu xanh: Khóm hoa hướng dương đầu tiên đã bung nở rực rỡ! (20%)'}
                {completedCount === 2 && 'Đường hoa đua nở: Hương hoa hồng thoang thoảng lối đi (40%)'}
                {completedCount === 3 && 'Ong bướm tìm về: Cúc họa mi trắng muốt đón nắng ấm (60%)'}
                {completedCount === 4 && 'Sắc màu ngập tràn: Khóm hoa tulip kiêu hãnh rực sáng (80%)'}
                {completedCount === 5 && 'Tuyệt vời: Toàn bộ con đường vườn sinh thái nở hoa ngát hương! 🌸 (100%)'}
              </span>
            </div>
          </div>

          {/* Mini Progress Bar */}
          <div className="flex items-center gap-2 w-full sm:w-52">
            <div className="w-full bg-stone-200/90 h-3 rounded-full overflow-hidden border border-stone-300 relative">
              <div 
                className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-emerald-500 transition-all duration-700 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-black text-emerald-950 tabular-nums shrink-0">
              {completedCount}/5
            </span>
          </div>
        </div>

        {/* Interactive Cobblestone Path Canvas */}
        <div className="relative z-10 w-full mt-auto pt-6 pb-2">
          
          {/* SVG Winding Path in the background */}
          <div className="absolute inset-x-0 bottom-8 h-20 pointer-events-none hidden sm:block">
            <svg viewBox="0 0 800 80" className="w-full h-full preserve-3d" fill="none">
              <path 
                d="M 20 60 Q 200 20, 400 50 T 780 40" 
                stroke="#d1d5db" 
                strokeWidth="28" 
                strokeLinecap="round" 
                strokeDasharray="4 8"
                opacity="0.85"
              />
              <path 
                d="M 20 60 Q 200 20, 400 50 T 780 40" 
                stroke="#a3e635" 
                strokeWidth="6" 
                strokeLinecap="round" 
                opacity="0.6"
              />
            </svg>
          </div>

          {/* 5 Flower Stations along the trail */}
          <div className="grid grid-cols-5 gap-2 sm:gap-4 relative z-20 px-1 sm:px-4">
            {FLOWER_STATION_META.map((st, idx) => {
              const isBloomed = bloomedStations[idx];
              const isCurrent = currentIndex === idx;

              return (
                <div 
                  key={idx}
                  className={`flex flex-col items-center justify-end text-center transition-all duration-500 ${
                    isCurrent ? 'scale-105' : 'scale-100'
                  }`}
                >
                  {/* Station Badge & Status */}
                  <div className="relative mb-2 flex flex-col items-center">
                    
                    {/* Flower Avatar / Bloom Animation */}
                    <div className={`w-14 h-14 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center transition-all duration-700 relative ${
                      isBloomed
                        ? `bg-gradient-to-br ${st.color} text-white shadow-lg ring-4 ring-white/80 animate-bounce-short`
                        : isCurrent
                        ? 'bg-amber-100 border-2 border-dashed border-amber-400 text-amber-900 shadow-sm'
                        : 'bg-stone-100/80 border border-stone-300 text-stone-400'
                    }`}>
                      {isBloomed ? (
                        <span className="text-3xl sm:text-4xl drop-shadow-md animate-pulse">
                          {st.emoji}
                        </span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-xl sm:text-2xl opacity-60">🌱</span>
                          <span className="text-[9px] font-black uppercase text-stone-500">Mầm {idx + 1}</span>
                        </div>
                      )}

                      {/* Sparkle badge when bloomed */}
                      {isBloomed && (
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-yellow-300 text-amber-950 flex items-center justify-center shadow-xs">
                          <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
                        </div>
                      )}

                      {/* Current marker */}
                      {isCurrent && !isBloomed && (
                        <div className="absolute -top-2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black animate-pulse shadow-xs">
                          Đang trồng
                        </div>
                      )}
                    </div>

                    {/* Butterfly fluttering near bloomed flower */}
                    {isBloomed && idx % 2 === 1 && (
                      <span className="absolute -top-6 -left-3 text-lg animate-bounce pointer-events-none">
                        🦋
                      </span>
                    )}
                    {isBloomed && idx % 2 === 0 && (
                      <span className="absolute -top-6 -right-3 text-lg animate-pulse pointer-events-none">
                        🐝
                      </span>
                    )}
                  </div>

                  {/* Cobblestone Base / Stepping Stone */}
                  <div className={`w-12 sm:w-16 h-3 rounded-full border shadow-inner transition-colors ${
                    isBloomed ? 'bg-amber-200 border-amber-400' : 'bg-stone-300 border-stone-400'
                  }`} />

                  {/* Label */}
                  <div className="mt-1 px-1.5 py-0.5 rounded-md bg-white/90 border border-stone-200 shadow-2xs text-[10px] font-black text-stone-800 line-clamp-1 max-w-[95px] sm:max-w-none">
                    Trạm {idx + 1}: {st.emoji}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Grass bottom strip */}
        <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-emerald-600 to-emerald-500" />
      </div>

      {/* 3. QUESTION & INTERACTION CARD (Listen & Fill in the Blank) */}
      <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border-2 border-pink-400 shadow-md flex flex-col gap-4">
        
        {/* Listen Audio Prominent Banner */}
        <div className="w-full bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 rounded-2xl p-4 sm:p-5 border-2 border-pink-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              onClick={() => speakAudio(currentQ.audioText)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all active:scale-90 cursor-pointer ${
                isPlayingAudio 
                  ? 'bg-pink-600 text-white animate-pulse ring-4 ring-pink-300' 
                  : 'bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white'
              }`}
              title="Bấm để nghe phát âm tiếng Anh"
            >
              <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase text-pink-900 tracking-wider">
                  Trạm {currentIndex + 1} · {currentQ.categoryLabel || 'Nghe & Điền từ'}
                </span>
                {isPlayingAudio && (
                  <span className="px-2 py-0.5 rounded-full bg-pink-200 text-pink-950 text-[10px] font-extrabold animate-pulse">
                    Đang phát âm...
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 font-semibold mt-0.5">
                {currentQ.promptVi}
              </p>
            </div>
          </div>

          <button
            onClick={() => speakAudio(currentQ.audioText)}
            className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-950 font-black text-xs sm:text-sm rounded-xl border border-pink-300 flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 self-end sm:self-center"
          >
            <Volume2 className="w-4 h-4 text-pink-800" />
            <span>Listen / Nghe lại</span>
          </button>
        </div>

        {/* Question Content Display */}
        <div className="w-full bg-stone-50 rounded-2xl p-4 sm:p-6 border border-stone-200 flex flex-col items-center justify-center text-center gap-3">
          
          {currentQ.type === 'fill_sentence' && currentQ.displaySentence ? (
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider">
                Mẫu câu tiếng Anh (Complete the sentence):
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight leading-snug">
                "{currentQ.displaySentence}"
              </h3>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider">
                Từ vựng tiếng Anh (English Vocabulary):
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight leading-snug flex items-center justify-center gap-2">
                <span>🎧 Nghe và điền từ vựng đúng:</span>
                <span className="text-pink-600 font-black">"______"</span>
              </h3>
            </div>
          )}

          {/* Vietnamese meaning reference */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs">
            <span>Ý nghĩa:</span>
            <span className="text-emerald-800 font-extrabold">"{currentQ.meaningVi}"</span>
          </div>

          {/* Letter Hint Section */}
          {showHint && (
            <div className="mt-1 px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-xs sm:text-sm font-black text-amber-950 tracking-widest animate-fade-in flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Gợi ý chữ cái: {currentQ.letterHint}</span>
            </div>
          )}
        </div>

        {/* Text Input Box & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                if (isAnswerCorrect !== null) {
                  setIsAnswerCorrect(null);
                  setFeedbackMsg(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCheckAnswer();
                }
              }}
              placeholder="Nhập từ hoặc mẫu câu tiếng Anh vào đây..."
              disabled={isAnswerCorrect === true}
              className={`w-full px-5 py-3.5 sm:py-4 rounded-2xl border-2 font-black text-base sm:text-lg text-emerald-950 placeholder:text-stone-400 placeholder:font-normal focus:outline-none transition-all shadow-inner ${
                isAnswerCorrect === true
                  ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-200 text-emerald-900'
                  : isAnswerCorrect === false
                  ? 'bg-rose-50 border-rose-400 ring-4 ring-rose-200 text-rose-950 animate-shake'
                  : 'bg-white border-stone-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-200'
              }`}
            />

            {/* Clear input button */}
            {userInput.length > 0 && isAnswerCorrect !== true && (
              <button
                type="button"
                onClick={() => setUserInput('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Hint Button */}
          <button
            type="button"
            onClick={() => setShowHint(prev => !prev)}
            className="px-4 py-3.5 sm:py-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
            title="Xem gợi ý ký tự"
          >
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>{showHint ? 'Ẩn gợi ý' : 'Gợi ý ký tự'}</span>
          </button>

          {/* Check Button (Immediate Audio & Visual Feedback) */}
          <button
            type="button"
            onClick={handleCheckAnswer}
            disabled={isAnswerCorrect === true}
            className={`px-7 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shrink-0 ${
              isAnswerCorrect === true
                ? 'bg-emerald-600 text-white cursor-default shadow-md'
                : !userInput.trim()
                ? 'bg-gradient-to-r from-stone-400 to-stone-500 hover:from-stone-500 hover:to-stone-600 text-white shadow-xs cursor-pointer active:scale-95'
                : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-md cursor-pointer active:scale-95'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Kiểm tra / Check</span>
          </button>
        </div>

        {/* Feedback Banner & Next Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold min-h-[32px]">
            {feedbackMsg && (
              <span className={`flex items-center gap-1.5 font-black animate-fade-in ${
                feedbackMsg.isCorrect ? 'text-emerald-700' : 'text-amber-800'
              }`}>
                {feedbackMsg.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{feedbackMsg.text}</span>
              </span>
            )}
            {!feedbackMsg && (
              <span className="text-stone-500 font-semibold">
                Bấm loa nghe âm thanh, gõ từ vào ô và bấm "Kiểm tra" hoặc nhấn Enter.
              </span>
            )}
          </div>

          {/* Next Button: Disabled until answered correctly */}
          <button
            onClick={handleNextQuestion}
            disabled={!isAnswerCorrect}
            className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              isAnswerCorrect
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/30 cursor-pointer animate-pulse'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span>{currentIndex + 1 >= TOTAL_QUESTIONS ? 'Hoàn thành / Complete' : 'Câu tiếp theo / Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 4. ECO-KNOWLEDGE COMPLETION POPUP (Thẻ kiến thức xanh - Không gian rộng rãi, thoáng đãng) */}
      {showEcoPopup && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl sm:rounded-4xl w-[94vw] max-w-4xl lg:max-w-[920px] max-h-[92vh] overflow-y-auto p-6 sm:p-8 md:p-10 shadow-2xl relative border-[4px] border-pink-400 flex flex-col gap-6 animate-scale-up my-auto">
            
            {/* Close Button */}
            <button
              onClick={() => {
                playSoundEffect('click');
                setShowEcoPopup(false);
              }}
              className="absolute top-5 right-5 p-2.5 rounded-full hover:bg-stone-100 text-stone-600 hover:text-stone-900 cursor-pointer transition-colors z-10"
              title="Đóng popup"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header with celebration visual */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left border-b border-pink-200/80 pb-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-pink-400 via-rose-500 to-emerald-500 text-white flex items-center justify-center text-4xl sm:text-5xl shadow-lg shrink-0 animate-bounce">
                🌸
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="inline-flex items-center justify-center sm:justify-start">
                  <span className="px-3.5 py-1 rounded-full bg-pink-100 text-pink-900 text-xs sm:text-sm font-black border border-pink-300 shadow-2xs tracking-wide">
                    🌱 Thẻ kiến thức xanh · Eco-Knowledge Card
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                  Đường hoa sinh thái & Sự sống tự nhiên
                </h3>
                <p className="text-sm sm:text-base font-bold text-pink-900/80">
                  Chúc mừng em đã hoàn thành thử thách từ vựng và phủ xanh thành công con đường sinh thái!
                </p>
              </div>
            </div>

            {/* Educational Message Content - Divided into 3 Distinct Clear Blocks */}
            <div className="flex flex-col gap-3.5">
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                <span>📚 Bài học sinh thái cùng Eco-Buddy (Eco Lesson)</span>
              </div>

              {/* Block 1 */}
              <div className="bg-gradient-to-r from-pink-50 via-rose-50/70 to-white rounded-2xl p-4 sm:p-5 border-2 border-pink-200 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-pink-200/70 flex items-center justify-center text-2xl shrink-0">
                  🌺
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-black text-pink-950 mb-1">
                    Thảm hoa và thực vật bản địa (Native Flowers)
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-emerald-950 font-medium leading-relaxed">
                    Các luống hoa quanh con đường sinh thái là nguồn cung cấp <strong>mật hoa và phấn hoa thiết yếu</strong> cho các loài thụ phấn có ích như ong mật, bướm và chim ruồi phát triển.
                  </p>
                </div>
              </div>

              {/* Block 2 */}
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50/70 to-white rounded-2xl p-4 sm:p-5 border-2 border-amber-200 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-200/70 flex items-center justify-center text-2xl shrink-0">
                  🐝
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-black text-amber-950 mb-1">
                    75% Cây lương thực phụ thuộc vào sự thụ phấn (Pollination Power)
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-emerald-950 font-medium leading-relaxed">
                    Hơn <strong>75% cây lương thực và thực vật có hoa</strong> trên Trái Đất phụ thuộc vào sự thụ phấn của côn trùng. Trồng và chăm sóc hoa giúp cân bằng hệ sinh thái và bảo vệ nguồn lương thực toàn cầu!
                  </p>
                </div>
              </div>

              {/* Block 3 */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50/70 to-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-200 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-200/70 flex items-center justify-center text-2xl shrink-0">
                  🌍
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-black text-emerald-950 mb-1">
                    Hành động xanh của học sinh (Your Eco Action)
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-emerald-950 font-medium leading-relaxed">
                    Hãy cùng các bạn chăm sóc bồn hoa ở trường và gia đình, <strong>không bẻ cành ngắt hoa bừa bãi</strong> và tích cực trồng thêm cây xanh để giữ cho Trái Đất luôn rực rỡ và trong lành!
                  </p>
                </div>
              </div>
            </div>

            {/* Reward Notification Banner (Spacious, prominent metrics) */}
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 rounded-2xl p-4 sm:p-5 border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xs shrink-0">
                  🏆
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-amber-950 flex items-center gap-2">
                    <span>Phần thưởng hoàn thành thử thách</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-extrabold">30 EP = 1 Cây</span>
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-amber-800 mt-0.5">
                    Cộng <strong className="text-amber-950">+30 Eco Points (EP)</strong> tích lũy và vun trồng <strong className="text-emerald-900">+1 cây xanh mới 🌳</strong> vào khu vườn sinh thái!
                  </p>
                </div>
              </div>

              <button
                onClick={handleClaimReward}
                disabled={hasClaimedReward}
                className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-md shrink-0 ${
                  hasClaimedReward
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 cursor-pointer active:scale-95 animate-pulse shadow-amber-300/50'
                }`}
              >
                <Sprout className="w-5 h-5" />
                <span>{hasClaimedReward ? 'Đã nhận thưởng ✓' : 'Nhận 30 EP & 1 Cây xanh'}</span>
              </button>
            </div>

            {claimSuccessMsg && (
              <div className="p-3.5 bg-emerald-100 border-2 border-emerald-400 rounded-2xl text-center text-xs sm:text-sm md:text-base font-black text-emerald-950 animate-fade-in shadow-xs">
                {claimSuccessMsg}
              </div>
            )}

            {/* Action Buttons: Play Again or Back to Games (Spacious & Easy to Click) */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3.5 pt-3 border-t border-stone-200">
              <button
                onClick={() => {
                  playSoundEffect('click');
                  initGameSession();
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-2 border-stone-300 hover:bg-stone-100 text-stone-800 font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs hover:shadow-xs active:scale-95"
              >
                <RotateCcw className="w-5 h-5 text-stone-600" />
                <span>Chơi lại (Play Again)</span>
              </button>

              <button
                onClick={() => {
                  playSoundEffect('click');
                  setShowEcoPopup(false);
                  onBackToGames();
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#0d4a2b] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer active:scale-95 transition-all"
              >
                <span>Về danh sách trò chơi</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
