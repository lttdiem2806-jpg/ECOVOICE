/**
 * Pronunciation Feedback Service
 * Thiết lập cơ chế chấm điểm phát âm thực tế nhưng nhân văn & hỗ trợ sửa lỗi thông minh cho học sinh tiểu học.
 */

export type PronunciationTier = 'excellent' | 'good' | 'needs_practice';

export interface PhonicsTip {
  focusSound: string;
  focusSoundLabel: string;
  mouthTipEn: string;
  mouthTipVi: string;
  tongueTipVi?: string;
  highlightPart?: string;
}

export interface WordAnalysis {
  word: string;
  status: 'correct' | 'close' | 'needs_practice';
  userSpoke?: string;
}

export interface PronunciationEvaluationResult {
  score: number;
  tier: PronunciationTier;
  tierBadgeEn: string;
  tierBadgeVi: string;
  feedbackEn: string;
  feedbackVi: string;
  mascotEncouragement: string;
  tip?: PhonicsTip;
  wordAnalysis?: WordAnalysis[];
  isPassed: boolean;
}

// Levenshtein distance for close word matching
export const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

/**
 * Acceptable phonetic variations & fuzzy tolerances for young primary learners:
 * Specifically supports 'lane' (/leɪn/) where pupils may soften or slur the final /-n/,
 * as well as homophones, vowel variations, and ASR phonetic artifacts.
 */
export const ACCEPTABLE_PHONETIC_VARIATIONS: Record<string, string[]> = {
  // 'lane' (/leɪn/): accept softened final /n/, homophones, near-phonetic tokens
  lane: [
    'lane', 'lain', 'layn', 'lay', 'lei', 'lai', 'len', 'lan', 'lame', 
    'late', 'lake', 'plane', 'rain', 'main', 'pain', 'land', 'line', 'learn', 'leyn', 'layne'
  ],
  // 'road' (/rəʊd/): soft ending /d/
  road: ['road', 'rode', 'rowed', 'rot', 'ro', 'load', 'rod', 'rote'],
  // 'street' (/striːt/):
  street: ['street', 'streat', 'streed', 'treat', 'strit'],
  // 'tree' / 'trees' (/triː/):
  tree: ['tree', 'three', 'tri', 'chree'],
  trees: ['trees', 'tree', 'threes', 'chrees'],
  // 'water' (/ˈwɔː.tər/):
  water: ['water', 'wata', 'woter', 'wota', 'warder', 'wada'],
  // 'clean' (/kliːn/):
  clean: ['clean', 'cleen', 'clen', 'klin', 'clea'],
  // 'plant' / 'plants' (/plɑːnt/):
  plant: ['plant', 'plan', 'plent', 'plants'],
  plants: ['plants', 'plant', 'plans'],
  // 'flower' / 'flowers':
  flower: ['flower', 'flowers', 'flour', 'flawa'],
  flowers: ['flowers', 'flower', 'flours'],
  // 'save' (/seɪv/):
  save: ['save', 'sav', 'seiv', 'safe'],
  // 'green' (/ɡriːn/):
  green: ['green', 'greene', 'grin', 'gren'],
  // 'blue' (/bluː/):
  blue: ['blue', 'blew', 'bloo', 'blu'],
  // 'red' (/red/):
  red: ['red', 'read', 'rad', 'ret'],
  // 'yellow' (/ˈjel.əʊ/):
  yellow: ['yellow', 'yello', 'yelo'],
  // 'bin' (/bɪn/):
  bin: ['bin', 'been', 'pin', 'ben'],
  // 'rubbish' (/ˈrʌb.ɪʃ/):
  rubbish: ['rubbish', 'rubish', 'rabish'],
  // 'sea' / 'ocean':
  sea: ['sea', 'see', 'si'],
  ocean: ['ocean', 'oshun', 'ochan'],
  // 'fish':
  fish: ['fish', 'fiss', 'fist'],
  // 'turtle':
  turtle: ['turtle', 'turtel', 'tortle', 'turle'],
  // 'dolphin':
  dolphin: ['dolphin', 'dolfin', 'dolpin']
};

/**
 * Checks if a spoken word token matches the target word under primary-school pronunciation tolerances
 */
/**
 * Checks if a spoken word token matches the target word under primary-school pronunciation tolerances
 */
export const isWordMatchWithTolerances = (spokenWord: string, targetWord: string): boolean => {
  const s = (spokenWord || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const t = (targetWord || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  if (!s || !t) return false;
  if (s === t) return true;

  // Check acceptable variations dictionary (curated homophones e.g. lane -> lain)
  const variations = ACCEPTABLE_PHONETIC_VARIATIONS[t];
  if (variations && variations.includes(s)) {
    return true;
  }

  // Strictly reject suffix additions (e.g. "address" vs "addressed", "play" vs "played", "book" vs "books")
  if (s.startsWith(t) && (s.endsWith('ed') || s.endsWith('ing') || s.endsWith('es') || s.endsWith('s'))) {
    return false;
  }
  if (t.startsWith(s) && (t.endsWith('ed') || t.endsWith('ing') || t.endsWith('es') || t.endsWith('s'))) {
    return false;
  }

  // Levenshtein fuzzy tolerance: ONLY allow dist === 1 for long words (length >= 6)
  // NEVER allow dist >= 2, which would match completely different words (address/addressed, kitchen/chicken)
  const dist = getLevenshteinDistance(s, t);
  if (t.length >= 6 && dist === 1) return true;

  return false;
};

/**
 * Calculates a fair, rigorous pronunciation accuracy score (0 - 100%)
 * Incorporates fuzzy matching, phonetic tolerances for 'lane' and other target words,
 * and handles both isolated words and multi-word sentences.
 * 
 * CRITICAL RULE: Score = 100% is STRICTLY reserved for exact letter-for-letter matches (or verified homophones).
 * Inexact words or words with extra suffixes (e.g. "addressed" for "address") are heavily penalized and never reach 100%.
 */
export const calculatePronunciationScoreWithTolerances = (spoken: string, target: string): number => {
  const cleanSpoken = (spoken || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanTarget = (target || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  if (!cleanSpoken || !cleanTarget) return 0;
  // Exact string match is always 100%
  if (cleanSpoken === cleanTarget) return 100;

  const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);
  const targetWords = cleanTarget.split(/\s+/).filter(Boolean);

  // Single word target (e.g. "address", "lane", "road")
  if (targetWords.length === 1) {
    const tWord = targetWords[0];
    
    // Check if any spoken token matches exactly
    if (spokenWords.includes(tWord)) {
      return 100;
    }

    // Check curated phonetic variations (e.g. homophones)
    const variations = ACCEPTABLE_PHONETIC_VARIATIONS[tWord];
    if (variations && spokenWords.some(w => variations.includes(w))) {
      return 95;
    }

    // Find the spoken word closest to tWord
    let bestWord = spokenWords[0] || cleanSpoken;
    let minDistance = getLevenshteinDistance(bestWord, tWord);
    for (const w of spokenWords) {
      const d = getLevenshteinDistance(w, tWord);
      if (d < minDistance) {
        minDistance = d;
        bestWord = w;
      }
    }

    // Check if user added an unwanted suffix (e.g. target="address", spoken="addressed")
    const hasUnwantedSuffix = 
      (bestWord.startsWith(tWord) && bestWord.length > tWord.length) ||
      (bestWord.endsWith('ed') && !tWord.endsWith('ed')) ||
      (bestWord.endsWith('ing') && !tWord.endsWith('ing')) ||
      (bestWord.endsWith('es') && !tWord.endsWith('es')) ||
      (bestWord.endsWith('s') && !tWord.endsWith('s'));

    const maxLen = Math.max(bestWord.length, tWord.length);
    const charSimilarity = Math.max(0, (maxLen - minDistance) / maxLen);

    // If unwanted suffix added (like "addressed" for "address"):
    // Heavily penalize, cap at 68% so it can NEVER get 100% or false 80% passing!
    if (hasUnwantedSuffix) {
      return Math.min(68, Math.round(charSimilarity * 80));
    }

    // Distance 1 on longer words (e.g. minor single-letter typo on long words >= 6)
    if (minDistance === 1 && tWord.length >= 6) {
      return 85;
    }
    if (minDistance === 1 && tWord.length >= 4) {
      return 75;
    }

    // Any other distance or general similarity: capped at 60%
    return Math.min(60, Math.round(charSimilarity * 75));
  }

  // Multi-word sentence target (e.g. "Where are you from?")
  let matchedCount = 0;
  for (const tWord of targetWords) {
    if (spokenWords.includes(tWord)) {
      matchedCount += 1.0;
    } else {
      const variations = ACCEPTABLE_PHONETIC_VARIATIONS[tWord];
      if (variations && spokenWords.some(w => variations.includes(w))) {
        matchedCount += 0.95;
      } else {
        const close = spokenWords.some(sWord => getLevenshteinDistance(sWord, tWord) <= 1 && tWord.length >= 4);
        if (close) {
          matchedCount += 0.8;
        }
      }
    }
  }

  const wordScore = (matchedCount / targetWords.length) * 100;
  // Penalty if length of spoken words is wildly different from target words
  const lengthRatio = Math.min(spokenWords.length, targetWords.length) / Math.max(spokenWords.length, targetWords.length);
  const finalPercentage = lengthRatio < 0.6 ? wordScore * lengthRatio : wordScore;
  return Math.min(100, Math.round(finalPercentage));
};

export interface VoiceFillBlankResult {
  isCorrect: boolean;
  score: number;
  isKeywordCorrect: boolean;
  isSentenceComplete: boolean;
  feedbackText: string;
}

/**
 * Unified game speech check: returns true if pronunciation passes (threshold >= 70%)
 */
export const checkSpeechAnswerMatch = (spoken: string, target: string): boolean => {
  const score = calculatePronunciationScoreWithTolerances(spoken, target);
  return score >= 70;
};

/**
 * Strict evaluation for Fill-in-the-Blank ('Listen & Voice-Fill Blank') questions in Eco-Games.
 * 
 * Enforces BOTH:
 * 1. Strict Keyword Validation: The target blank word MUST be present and correctly pronounced.
 * 2. Full-Sentence Pronunciation Validation: All remaining words in the sentence MUST also be pronounced clearly.
 */
export const evaluateVoiceFillBlank = (
  spokenText: string,
  targetKeyword: string,
  fullSentence: string
): VoiceFillBlankResult => {
  const cleanSpoken = (spokenText || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanKeyword = (targetKeyword || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanSentence = (fullSentence || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  if (!cleanSpoken) {
    return {
      isCorrect: false,
      score: 0,
      isKeywordCorrect: false,
      isSentenceComplete: false,
      feedbackText: 'Bé chưa phát âm xong, hãy bấm nút và đọc lại thật rõ ràng rồi bấm Dừng nhé! 🎤'
    };
  }

  const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);
  const keywordWords = cleanKeyword.split(/\s+/).filter(Boolean);
  const sentenceWords = cleanSentence.split(/\s+/).filter(Boolean);

  // 1. Strict Keyword Validation
  let isKeywordCorrect = false;
  if (keywordWords.length === 1) {
    const kWord = keywordWords[0];
    isKeywordCorrect = spokenWords.some(sWord => isWordMatchWithTolerances(sWord, kWord));
  } else if (keywordWords.length > 1) {
    let matchedKWords = 0;
    for (const kw of keywordWords) {
      if (spokenWords.some(sWord => isWordMatchWithTolerances(sWord, kw))) {
        matchedKWords++;
      }
    }
    isKeywordCorrect = (matchedKWords / keywordWords.length) >= 0.75;
  }

  // 2. Full-Sentence Pronunciation Validation (Remaining context words in full sentence)
  const contextWords = sentenceWords.filter(w => !keywordWords.includes(w));

  let contextMatchedCount = 0;
  for (const cWord of contextWords) {
    if (spokenWords.some(sWord => isWordMatchWithTolerances(sWord, cWord))) {
      contextMatchedCount++;
    }
  }

  // Ratio of remaining context words pronounced
  const contextRatio = contextWords.length > 0 ? contextMatchedCount / contextWords.length : 1;
  const isSentenceComplete = contextWords.length === 0 || contextRatio >= 0.65;

  // Total sentence pronunciation score
  const overallScore = calculatePronunciationScoreWithTolerances(cleanSpoken, cleanSentence);

  // Both must be true for overall success
  const isCorrect = isKeywordCorrect && isSentenceComplete && (contextWords.length === 0 || overallScore >= 65);

  let feedbackText = '';
  if (isCorrect) {
    feedbackText = `🎉 Excellent! Perfect pronunciation! "${fullSentence}"`;
  } else if (isKeywordCorrect && !isSentenceComplete) {
    feedbackText = `Almost there! Please remember to speak the whole sentence! 🎤`;
  } else {
    feedbackText = `Not quite right! Please try again! 🎤`;
  }

  return {
    isCorrect,
    score: overallScore,
    isKeywordCorrect,
    isSentenceComplete,
    feedbackText
  };
};

/**
 * Phân tích âm vị và đưa ra gợi ý khẩu hình / đặt lưỡi trực quan
 */
export const getPhonicsTipForTarget = (target: string, phonetic?: string): PhonicsTip => {
  const lower = target.toLowerCase().trim();

  // Special Phonics Tip for 'lane' (/leɪn/) & ending /n/
  if (lower === 'lane' || lower.endsWith('ane')) {
    return {
      focusSound: '/eɪn/ · Ending /n/',
      focusSoundLabel: 'Vowel /eɪ/ & Sound /n/ (Chạm đầu lưỡi nhẹ)',
      mouthTipEn: 'Say /eɪ/ like "say", then gently raise your tongue tip behind upper front teeth for /n/.',
      mouthTipVi: 'Phát âm /eɪ/ rõ ràng, rồi nâng nhẹ đầu lưỡi chạm vào chân răng trên để hoàn thiện âm /n/. (Hệ thống linh hoạt chấp nhận cả khi đọc lướt âm đuôi)',
      highlightPart: 'ane'
    };
  }

  // Ending sound /d/
  if (lower.endsWith('d') || lower.endsWith('de')) {
    return {
      focusSound: '/d/',
      focusSoundLabel: 'Ending Sound /d/ (Âm đuôi)',
      mouthTipEn: 'Lightly tap the tip of your tongue behind your upper teeth and release a soft "d" sound.',
      mouthTipVi: 'Chạm nhẹ đầu lưỡi vào chân răng hàm trên rồi hạ nhẹ xuống để phát âm "d" ở cuối từ.',
      highlightPart: 'd'
    };
  }

  // Ending sound /t/
  if (lower.endsWith('t') || lower.endsWith('te')) {
    return {
      focusSound: '/t/',
      focusSoundLabel: 'Ending Sound /t/ (Âm đuôi)',
      mouthTipEn: 'Touch your tongue behind upper teeth and release a gentle puff of air for "t".',
      mouthTipVi: 'Chạm đầu lưỡi vào vòm trên sau răng cửa và bật luồng hơi nhẹ cho âm "t".',
      highlightPart: 't'
    };
  }

  // Ending sound /s/ or /z/
  if (lower.endsWith('s') || lower.endsWith('es') || lower.endsWith('ce') || lower.endsWith('se')) {
    return {
      focusSound: '/s/ · /z/',
      focusSoundLabel: 'Ending Sound /s/ (Âm gió cuối)',
      mouthTipEn: 'Gently close your teeth, smile slightly, and blow a soft stream of air.',
      mouthTipVi: 'Khép hờ hai hàm răng, mỉm cười nhẹ và thổi luồng gió nhẹ qua kẽ răng.',
      highlightPart: 's'
    };
  }

  // Sound /th/ (three, think, this, that, mother, father)
  if (lower.includes('th')) {
    return {
      focusSound: '/θ/ · /ð/',
      focusSoundLabel: 'Sound "TH" (Đặt lưỡi giữa hai răng)',
      mouthTipEn: 'Place the tip of your tongue gently between your upper and lower teeth, then blow air.',
      mouthTipVi: 'Đặt nhẹ đầu lưỡi giữa hai hàm răng và thổi luồng hơi nhẹ ra ngoài.',
      highlightPart: 'th'
    };
  }

  // Sound /r/ (red, ruler, rubber, run, read)
  if (lower.startsWith('r') || lower.includes('r')) {
    return {
      focusSound: '/r/',
      focusSoundLabel: 'Sound /r/ (Uốn lưỡi nhẹ)',
      mouthTipEn: 'Curl the tip of your tongue slightly toward the roof of your mouth without touching it.',
      mouthTipVi: 'Hơi cong đầu lưỡi về phía vòm họng trên mà không để lưỡi chạm vào răng.',
      highlightPart: 'r'
    };
  }

  // Sound /l/ (yellow, blue, apple, ruler, school)
  if (lower.includes('l')) {
    return {
      focusSound: '/l/',
      focusSoundLabel: 'Sound /l/ (Nâng đầu lưỡi)',
      mouthTipEn: 'Press the tip of your tongue firmly against the ridge behind your upper front teeth.',
      mouthTipVi: 'Nâng đầu lưỡi chạm vào chân răng hàm trên khi phát âm.',
      highlightPart: 'l'
    };
  }

  // Sound /ch/ or /sh/ (chair, chicken, teacher, shoe, fish)
  if (lower.includes('ch') || lower.includes('sh')) {
    return {
      focusSound: '/tʃ/ · /ʃ/',
      focusSoundLabel: 'Sound CH / SH (Chu tròn môi)',
      mouthTipEn: 'Round your lips and push a gentle breath forward.',
      mouthTipVi: 'Hơi chu tròn môi về phía trước và bật luồng hơi gió êm dịu.',
      highlightPart: lower.includes('ch') ? 'ch' : 'sh'
    };
  }

  // Sound /w/ (white, water, window, what)
  if (lower.startsWith('w') || lower.includes('wh')) {
    return {
      focusSound: '/w/',
      focusSoundLabel: 'Sound /w/ (Tròn môi)',
      mouthTipEn: 'Round your lips like whistling, then open quickly as you voice the sound.',
      mouthTipVi: 'Chu môi tròn nhỏ như đang huýt sáo rồi mở rộng miệng khi phát âm.',
      highlightPart: 'w'
    };
  }

  // Long vowel /iː/ (green, see, read, teacher, please)
  if (lower.includes('ee') || lower.includes('ea')) {
    return {
      focusSound: '/iː/',
      focusSoundLabel: 'Long Vowel /iː/ (Cười tươi)',
      mouthTipEn: 'Widen your lips like a bright smile and hold the sound a bit longer.',
      mouthTipVi: 'Kéo khóe miệng sang hai bên như đang cười tươi và ngân dài âm một chút.',
      highlightPart: lower.includes('ee') ? 'ee' : 'ea'
    };
  }

  // Default general tip
  return {
    focusSound: phonetic || '/.../',
    focusSoundLabel: 'Phonics & Rhythm (Nhịp điệu phát âm)',
    mouthTipEn: 'Open your mouth clearly, listen to the sample rhythm, and speak with confidence!',
    mouthTipVi: 'Mở khẩu hình miệng to rõ ràng, lắng nghe nhịp điệu của âm mẫu và tự tin nói nhé!',
    highlightPart: lower
  };
};

/**
 * Phân tích từng từ trong câu để bôi sáng trực quan từ nào đạt / từ nào cần luyện thêm
 */
export const analyzeSentenceWords = (target: string, spoken: string): WordAnalysis[] => {
  const cleanSpoken = spoken.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const cleanTarget = target.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);
  const targetWords = cleanTarget.split(/\s+/).filter(Boolean);

  return targetWords.map((tWord) => {
    if (spokenWords.includes(tWord)) {
      return { word: tWord, status: 'correct' };
    }
    // Check phonetic tolerance match (e.g. 'lay' / 'lain' for 'lane')
    const tolerantMatch = spokenWords.find(sWord => isWordMatchWithTolerances(sWord, tWord));
    if (tolerantMatch) {
      return { word: tWord, status: 'correct', userSpoke: tolerantMatch };
    }
    const closeMatch = spokenWords.find(sWord => getLevenshteinDistance(sWord, tWord) <= 1 && tWord.length > 2);
    if (closeMatch) {
      return { word: tWord, status: 'close', userSpoke: closeMatch };
    }
    return { word: tWord, status: 'needs_practice' };
  });
};

/**
 * Đánh giá phát âm thông minh, nhân văn & phân cấp 3 tầng rõ ràng
 */
export const evaluateSmartPronunciation = (
  transcript: string,
  target: string,
  score: number | string,
  phonetic?: string,
  attemptCount: number = 1
): PronunciationEvaluationResult => {
  const numScore = typeof score === 'string' ? parseFloat(score) || 0 : Number(score) || 0;
  const isSentence = target.trim().split(/\s+/).length > 1;
  const tip = getPhonicsTipForTarget(target, phonetic);
  const wordAnalysis = isSentence ? analyzeSentenceWords(target, transcript) : undefined;

  // Tier 1: Excellent (Xuất sắc) - Score >= 80%
  if (numScore >= 80) {
    const isImproved = attemptCount > 1;
    return {
      score: numScore,
      tier: 'excellent',
      tierBadgeEn: 'Excellent!',
      tierBadgeVi: 'Xuất sắc!',
      feedbackEn: isImproved 
        ? `Brilliant improvement! You scored ${numScore}% on your practice loop! ⭐` 
        : `Awesome pronunciation! Clear, accurate, and natural (${numScore}%)! ⭐`,
      feedbackVi: isImproved
        ? `🎉 Tuyệt vời! Bạn đã vượt lên chính mình sau ${attemptCount} lần luyện tập (${numScore}%). Thưởng +10 EP! ⭐`
        : `🎉 Xuất sắc! Phát âm rất chuẩn xác và tự tin (${numScore}%). Thưởng +10 EP! ⭐`,
      mascotEncouragement: `Awesome job! Bạn phát âm từ "${target}" rất chuẩn xác! ⭐`,
      tip,
      wordAnalysis,
      isPassed: true
    };
  }

  // Special encouragement when reaching max 4 attempts: allow passing
  if (attemptCount >= 4) {
    return {
      score: numScore,
      tier: numScore >= 50 ? 'good' : 'needs_practice',
      tierBadgeEn: 'Completed Attempts',
      tierBadgeVi: 'Đã thử 4 lần',
      feedbackEn: "Good effort! Let's move to the next challenge! 🌟",
      feedbackVi: "Cố gắng lắm! Em đã rất nỗ lực thử thách 4 lần. Let's move to the next challenge! / Cùng chuyển sang thử thách tiếp theo nhé! 🌟",
      mascotEncouragement: "Cố gắng lắm! Em đã thử 4 lần rất kiên trì. Let's move to the next challenge! Cùng chuyển sang thử thách tiếp theo nhé! 🌟",
      tip,
      wordAnalysis,
      isPassed: true
    };
  }

  // Check if student spoke a single word with unwanted grammatical suffix (e.g. "addressed" for "address")
  const cleanSpoken = (transcript || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const cleanTarget = (target || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const hasSuffixError = !isSentence && cleanSpoken.startsWith(cleanTarget) && cleanSpoken.length > cleanTarget.length;

  // Tier 2: Good Effort (Cố gắng rất tốt) - 50% <= Score < 80%
  if (numScore >= 50) {
    const feedbackVi = hasSuffixError
      ? `⚠️ Lưu ý âm đuôi: Bạn vừa phát âm là "${transcript}" (bị thừa âm đuôi/hậu tố). Hãy phát âm chuẩn là "${target}" ${phonetic || ''} nhé! (${numScore}%)`
      : `👍 Cố gắng rất tốt! Bạn đã phát âm đạt yêu cầu (${numScore}%). Bấm 'Next (Tiếp)' để sang từ tiếp theo hoặc luyện nói lại nhé!`;
    const mascotEncouragement = hasSuffixError
      ? `Chú ý âm đuôi nhé! Hãy đọc là "${target}" không có âm đuôi thừa nào! 🎧`
      : `Keep it up! Bạn phát âm đạt yêu cầu rồi, bấm Next để tiếp tục nhé! 🎧`;

    return {
      score: numScore,
      tier: 'good',
      tierBadgeEn: 'Good Progress!',
      tierBadgeVi: 'Tiến bộ tốt!',
      feedbackEn: hasSuffixError 
        ? `Almost there! Watch out for extra suffix sounds: say "${target}" without "-ed" or extra endings! (${numScore}%)`
        : `Great effort! Almost there! Let's move to the next challenge or practice again! 👍`,
      feedbackVi,
      mascotEncouragement,
      tip,
      wordAnalysis,
      isPassed: !hasSuffixError && (isSentence ? numScore >= 65 : numScore >= 75)
    };
  }

  // Tier 3: Needs Practice (Cần luyện thêm / Cố gắng lắm) - Score < 50%
  return {
    score: numScore,
    tier: 'needs_practice',
    tierBadgeEn: 'Needs Practice',
    tierBadgeVi: 'Cần luyện thêm',
    feedbackEn: `Good effort! Let's check the audio sample again! 🌱`,
    feedbackVi: `🌱 Cố gắng lắm! Hãy nghe lại mẫu chuẩn và thử lại để đạt điểm qua bài nhé!`,
    mascotEncouragement: `You can do it! / Bạn làm được mà! Hãy nghe mẫu chậm 🐢 rồi đọc to rõ hơn nào!`,
    tip,
    wordAnalysis,
    isPassed: false
  };
};
