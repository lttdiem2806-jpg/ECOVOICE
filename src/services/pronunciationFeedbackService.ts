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
export const isWordMatchWithTolerances = (spokenWord: string, targetWord: string): boolean => {
  const s = (spokenWord || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const t = (targetWord || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  if (!s || !t) return false;
  if (s === t) return true;

  // Check acceptable variations dictionary
  const variations = ACCEPTABLE_PHONETIC_VARIATIONS[t];
  if (variations && variations.includes(s)) {
    return true;
  }

  // Check if spoken word matches any key's variations
  for (const [key, variants] of Object.entries(ACCEPTABLE_PHONETIC_VARIATIONS)) {
    if (key === t && variants.some(v => v === s || (s.length >= 3 && v === s))) {
      return true;
    }
  }

  // Levenshtein fuzzy tolerance:
  // For words with length >= 4 (e.g. 'lane' vs 'lay' distance 1), allow dist <= 1
  // For words with length >= 7, allow dist <= 2
  const dist = getLevenshteinDistance(s, t);
  if (t.length >= 4 && dist <= 1) return true;
  if (t.length >= 7 && dist <= 2) return true;

  return false;
};

/**
 * Calculates a fair, encouraging pronunciation accuracy score (0 - 100%)
 * Incorporates fuzzy matching, phonetic tolerances for 'lane' and other target words,
 * and handles both isolated words and multi-word sentences.
 */
export const calculatePronunciationScoreWithTolerances = (spoken: string, target: string): number => {
  const cleanSpoken = (spoken || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const cleanTarget = (target || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  if (!cleanSpoken || !cleanTarget) return 0;
  if (cleanSpoken === cleanTarget) return 100;

  const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);
  const targetWords = cleanTarget.split(/\s+/).filter(Boolean);

  // Single word target (e.g. "Lane", "Road", "Water")
  if (targetWords.length === 1) {
    const tWord = targetWords[0];
    for (const sWord of spokenWords) {
      if (isWordMatchWithTolerances(sWord, tWord)) {
        return 100;
      }
    }
    if (isWordMatchWithTolerances(cleanSpoken, tWord)) {
      return 100;
    }
    if (cleanSpoken.includes(tWord) || tWord.includes(cleanSpoken)) {
      return 85;
    }
    return 0;
  }

  // Multi-word sentence target (e.g. "She lives in a quiet lane.")
  let matchedCount = 0;
  for (const tWord of targetWords) {
    const hasMatch = spokenWords.some(sWord => isWordMatchWithTolerances(sWord, tWord));
    if (hasMatch) {
      matchedCount += 1;
    } else {
      const close = spokenWords.some(sWord => getLevenshteinDistance(sWord, tWord) <= 1 && tWord.length > 3);
      if (close) {
        matchedCount += 0.85;
      }
    }
  }

  const percentage = (matchedCount / targetWords.length) * 100;
  return Math.min(100, Math.round(percentage));
};

/**
 * Unified game speech check: returns true if pronunciation passes (threshold >= 70%)
 */
export const checkSpeechAnswerMatch = (spoken: string, target: string): boolean => {
  const score = calculatePronunciationScoreWithTolerances(spoken, target);
  return score >= 70;
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
  score: number,
  phonetic?: string,
  attemptCount: number = 1
): PronunciationEvaluationResult => {
  const isSentence = target.trim().split(/\s+/).length > 1;
  const tip = getPhonicsTipForTarget(target, phonetic);
  const wordAnalysis = isSentence ? analyzeSentenceWords(target, transcript) : undefined;

  // Tier 1: Excellent (Xuất sắc) - Score >= 80%
  if (score >= 80) {
    const isImproved = attemptCount > 1;
    return {
      score,
      tier: 'excellent',
      tierBadgeEn: 'Excellent!',
      tierBadgeVi: 'Xuất sắc!',
      feedbackEn: isImproved 
        ? `Brilliant improvement! You scored ${score}% on your practice loop! ⭐` 
        : `Awesome pronunciation! Clear, accurate, and natural (${score}%)! ⭐`,
      feedbackVi: isImproved
        ? `🎉 Tuyệt vời! Bạn đã vượt lên chính mình sau ${attemptCount} lần luyện tập (${score}%). Thưởng +10 EP! ⭐`
        : `🎉 Xuất sắc! Phát âm rất chuẩn xác và tự tin (${score}%). Thưởng +10 EP! ⭐`,
      mascotEncouragement: `Awesome job! Bạn phát âm từ "${target}" rất chuẩn xác! ⭐`,
      tip,
      wordAnalysis,
      isPassed: true
    };
  }

  // Special encouragement when reaching max 4 attempts without passing
  if (attemptCount >= 4) {
    return {
      score,
      tier: score >= 50 ? 'good' : 'needs_practice',
      tierBadgeEn: 'Completed Attempts',
      tierBadgeVi: 'Đã thử 4 lần',
      feedbackEn: "Good effort! Let's move to the next challenge! 🌟",
      feedbackVi: "Cố gắng lắm! Em đã rất nỗ lực thử thách 4 lần. Let's move to the next challenge! / Cùng chuyển sang thử thách tiếp theo nhé! 🌟",
      mascotEncouragement: "Cố gắng lắm! Em đã thử 4 lần rất kiên trì. Let's move to the next challenge! Cùng chuyển sang thử thách tiếp theo nhé! 🌟",
      tip,
      wordAnalysis,
      isPassed: false
    };
  }

  // Tier 2: Good Effort (Cố gắng rất tốt) - 50% <= Score < 80%
  if (score >= 50) {
    return {
      score,
      tier: 'good',
      tierBadgeEn: 'Good Progress!',
      tierBadgeVi: 'Tiến bộ tốt!',
      feedbackEn: `Great effort! Almost there! Let's listen again and level up! 👍`,
      feedbackVi: `👍 Cố gắng rất tốt! Bạn đã phát âm gần chuẩn rồi (${score}%). Hãy nghe lại âm mẫu chuẩn và nói lại để đạt điểm tối đa nhé!`,
      mascotEncouragement: `Keep it up! Bạn làm rất tốt, nghe lại mẫu một lần nữa nhé! 🎧`,
      tip,
      wordAnalysis,
      isPassed: false
    };
  }

  // Tier 3: Needs Practice (Cần luyện thêm / Cố gắng lắm) - Score < 50%
  // TUYỆT ĐỐI KHÔNG DÙNG TỪ TIÊU CỰC (Fail, Sai rồi, Kém)
  return {
    score,
    tier: 'needs_practice',
    tierBadgeEn: 'Needs Practice',
    tierBadgeVi: 'Cần luyện thêm',
    feedbackEn: `Good effort! Let's check the audio sample again! 🌱`,
    feedbackVi: `🌱 Good effort! Let's check the audio sample again! / Cố gắng lắm! Hãy nghe lại mẫu chuẩn và thử lại nhé!`,
    mascotEncouragement: `You can do it! / Bạn làm được mà! Hãy nghe mẫu chậm 🐢 rồi đọc to rõ hơn nào!`,
    tip,
    wordAnalysis,
    isPassed: false
  };
};
