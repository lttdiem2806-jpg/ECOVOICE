/**
 * Eco-Voice: Student Activity Service
 * Manages chronological activity timeline (speaking practice, games, rewards)
 */

import { recordActivityToFirestore } from './firestoreSyncService';

export interface StudentActivityItem {
  id: string;
  type: 'speaking_vocab' | 'speaking_sentence' | 'eco_game' | 'badge_unlocked' | 'tree_planted';
  titleEn: string;
  titleVi: string;
  detailEn: string;
  detailVi: string;
  score?: number;
  epAwarded: number;
  timestamp: string; // e.g. "Vừa xong", "10 phút trước", "Hôm nay", etc.
  icon: string;
  badgeColor: string;
  grade?: string; // Grade isolation: '3' | '4' | '5'
  unitKey?: string;
  unitNumber?: number;
}

const ACTIVITY_STORAGE_KEY = 'ecovoice_student_activity_log';
const GUEST_ACTIVITY_STORAGE_KEY = 'ecovoice_guest_activity_log';
const PRACTICED_WORDS_PREFIX = 'ecovoice_student_practiced_words_';
const GUEST_PRACTICED_WORDS_KEY = 'ecovoice_guest_practiced_words';
const PRACTICED_SENTENCES_PREFIX = 'ecovoice_student_practiced_sentences_';
const GUEST_PRACTICED_SENTENCES_KEY = 'ecovoice_guest_practiced_sentences';

// Clean up any legacy guest keys stored in localStorage from prior sessions
if (typeof window !== 'undefined') {
  try {
    const legacyKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('ecovoice_guest_') || k.includes('_guest_'))) {
        legacyKeys.push(k);
      }
    }
    legacyKeys.forEach(k => localStorage.removeItem(k));
  } catch {}
}

/**
 * Reset all guest session data (sessionStorage and temporary memory)
 */
export function resetGuestSession(): void {
  if (typeof window === 'undefined') return;
  try {
    const sessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith('ecovoice_guest_') || k.includes('_guest_'))) {
        sessionKeys.push(k);
      }
    }
    sessionKeys.forEach(k => sessionStorage.removeItem(k));

    const localKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('ecovoice_guest_') || k.includes('_guest_'))) {
        localKeys.push(k);
      }
    }
    localKeys.forEach(k => localStorage.removeItem(k));

    window.dispatchEvent(new CustomEvent('ecovoice_guest_points_updated', { detail: { grade: '3', ep: 0 } }));
    window.dispatchEvent(new CustomEvent('ecovoice_guest_trees_updated', { detail: { grade: '3', trees: 0 } }));
    window.dispatchEvent(new CustomEvent('ecovoice_practiced_words_updated', { detail: { words: [] } }));
    window.dispatchEvent(new CustomEvent('ecovoice_practiced_sentences_updated', { detail: { sentences: [] } }));
    window.dispatchEvent(new CustomEvent('ecovoice_student_activity_updated', { detail: { grade: '3' } }));
  } catch (e) {
    console.warn('Failed to reset guest session', e);
  }
}

/**
 * Grade-based State Isolation for Guest Mode: Eco Points & Virtual Trees per grade
 * Stored strictly in SessionStorage so closing browser/tab or logging out resets to 0!
 */
export function getGuestGradeEcoPoints(grade: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    // Ensure no legacy persistence in localStorage
    localStorage.removeItem(`ecovoice_guest_eco_points_grade_${grade}`);
    localStorage.removeItem('ecovoice_guest_eco_points');
    const raw = sessionStorage.getItem(`ecovoice_guest_eco_points_grade_${grade}`);
    if (raw !== null) {
      return parseInt(raw, 10) || 0;
    }
  } catch {}
  return 0; // Strictly zero-state for new session!
}

export function setGuestGradeEcoPoints(grade: string, ep: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`ecovoice_guest_eco_points_grade_${grade}`, String(ep));
    sessionStorage.setItem('ecovoice_guest_eco_points', String(ep));
    // Prune any localStorage leaks
    localStorage.removeItem(`ecovoice_guest_eco_points_grade_${grade}`);
    localStorage.removeItem('ecovoice_guest_eco_points');
  } catch {}
  window.dispatchEvent(new CustomEvent('ecovoice_guest_points_updated', { detail: { grade, ep } }));
}

export function computeLogicalTrees(ep: number, _isChiVy?: boolean): number {
  const safeEP = Math.max(0, ep || 0);
  return Math.floor(safeEP / 30);
}

export function computeRemainingEPToNextTree(ep: number, _isChiVy?: boolean): number {
  const safeEP = Math.max(0, ep || 0);
  const mod = safeEP % 30;
  return mod === 0 ? 30 : 30 - mod;
}

export function getGuestGradeVirtualTrees(grade: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    localStorage.removeItem(`ecovoice_guest_virtual_trees_grade_${grade}`);
    localStorage.removeItem('ecovoice_guest_virtual_trees');
  } catch {}
  const guestEP = getGuestGradeEcoPoints(grade);
  return Math.floor(guestEP / 30);
}

export function setGuestGradeVirtualTrees(grade: string, trees: number): void {
  if (typeof window === 'undefined') return;
  const guestEP = getGuestGradeEcoPoints(grade);
  const maxLogical = Math.max(1, Math.floor(guestEP / 30) + 2);
  const safeTrees = (trees === 27 || trees > 15) ? Math.min(trees, maxLogical) : trees;
  try {
    sessionStorage.setItem(`ecovoice_guest_virtual_trees_grade_${grade}`, String(safeTrees));
    sessionStorage.setItem('ecovoice_guest_virtual_trees', String(safeTrees));
    localStorage.removeItem(`ecovoice_guest_virtual_trees_grade_${grade}`);
    localStorage.removeItem('ecovoice_guest_virtual_trees');
  } catch {}
  window.dispatchEvent(new CustomEvent('ecovoice_guest_trees_updated', { detail: { grade, trees: safeTrees } }));
}

/**
 * Checks if a username or context represents Guest Mode / Demo User / Visitor
 */
export function isGuestUser(userName?: string): boolean {
  if (!userName) {
    if (typeof window !== 'undefined') {
      const sessionRole = sessionStorage.getItem('ecovoice_user_role');
      const sessionGuestMode = sessionStorage.getItem('ecovoice_is_guest_mode');
      if (sessionRole === 'guest' || sessionGuestMode === 'true') {
        return true;
      }
      const storedRole = localStorage.getItem('ecovoice_user_role');
      const isGuestMode = localStorage.getItem('ecovoice_is_guest_mode');
      const isLoggedIn = localStorage.getItem('ecovoice_is_logged_in');
      if (storedRole === 'guest' || isGuestMode === 'true' || isLoggedIn === 'false' || !storedRole) {
        return true;
      }
    }
    return false;
  }
  const lower = userName.toLowerCase().trim();
  return (
    lower.includes('guest') ||
    lower.includes('visitor') ||
    lower.includes('khách') ||
    lower.includes('demo') ||
    lower.includes('trải nghiệm')
  );
}

export const G4_U1_ALL_WORDS = [
  'g4_u1_1', 'g4_u1_2', 'g4_u1_3', 'g4_u1_4', 'g4_u1_5',
  'g4_u1_6', 'g4_u1_7', 'g4_u1_8', 'g4_u1_9', 'g4_u1_10'
];

export const G4_U1_ALL_SENTENCES = [
  'g4_u1_s1', 'g4_u1_s2', 'g4_u1_s3', 'g4_u1_s4', 'g4_u1_s5'
];

/**
 * Granular tracking: Get unique vocabulary IDs actually practiced by a student
 * Student Chí Vỹ has mastered 100% of Unit 1: all 10 words ('g4_u1_1' to 'g4_u1_10')
 * For Guest Mode: Isolated storage, starts completely clean (0 words) without pulling official student data!
 */
export function getStudentPracticedWords(userName?: string, grade?: string): Set<string> {
  if (typeof window === 'undefined') return new Set(G4_U1_ALL_WORDS);

  const isGuest = isGuestUser(userName) || (
    typeof window !== 'undefined' &&
    (sessionStorage.getItem('ecovoice_is_guest_mode') === 'true' || localStorage.getItem('ecovoice_is_guest_mode') === 'true') &&
    (!userName || isGuestUser(userName))
  );

  if (isGuest) {
    // If grade is specified, strictly use grade-isolated storage in sessionStorage
    if (grade && (grade === '3' || grade === '4' || grade === '5')) {
      try {
        localStorage.removeItem(`ecovoice_guest_practiced_words_grade_${grade}`);
        const rawGrade = sessionStorage.getItem(`ecovoice_guest_practiced_words_grade_${grade}`);
        if (rawGrade) {
          const arr = JSON.parse(rawGrade);
          if (Array.isArray(arr)) return new Set(arr);
        }
      } catch (e) {
        console.warn('Failed to parse guest practiced words for grade', e);
      }
      return new Set<string>(); // Strictly zero-state for new session!
    }

    try {
      localStorage.removeItem(GUEST_PRACTICED_WORDS_KEY);
      const raw = sessionStorage.getItem(GUEST_PRACTICED_WORDS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return new Set(arr);
        }
      }
    } catch (e) {
      console.warn('Failed to parse guest practiced words', e);
    }
    return new Set<string>();
  }

  const nameKey = (userName || 'chivy').trim().toLowerCase();
  const storageKey = `${PRACTICED_WORDS_PREFIX}${nameKey}`;
  const isChiVy = nameKey.includes('chí vỹ') || nameKey.includes('chi vy');

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) {
        if (isChiVy) {
          // Guarantee all 10 words of Unit 1 are mastered for Chi Vy
          const merged = Array.from(new Set([...G4_U1_ALL_WORDS, ...arr]));
          return new Set(merged);
        }
        return new Set(arr);
      }
    }
  } catch (e) {
    console.warn('Failed to parse practiced words', e);
  }

  const initialWords = isChiVy ? G4_U1_ALL_WORDS : [];
  try {
    localStorage.setItem(storageKey, JSON.stringify(initialWords));
  } catch {}
  return new Set(initialWords);
}

export function recordPracticedWord(userName: string, wordId: string, grade?: string): Set<string> {
  if (typeof window === 'undefined') return new Set([wordId]);
  const isGuest = isGuestUser(userName) || (
    typeof window !== 'undefined' &&
    (sessionStorage.getItem('ecovoice_is_guest_mode') === 'true' || localStorage.getItem('ecovoice_is_guest_mode') === 'true') &&
    (!userName || isGuestUser(userName))
  );

  const resolvedGrade = grade || (wordId.startsWith('g3_') ? '3' : wordId.startsWith('g4_') ? '4' : wordId.startsWith('g5_') ? '5' : '3');

  if (isGuest) {
    // Record to grade-isolated sessionStorage
    const gradeWords = getStudentPracticedWords(userName, resolvedGrade);
    gradeWords.add(wordId);
    try {
      sessionStorage.setItem(`ecovoice_guest_practiced_words_grade_${resolvedGrade}`, JSON.stringify(Array.from(gradeWords)));
      localStorage.removeItem(`ecovoice_guest_practiced_words_grade_${resolvedGrade}`);
    } catch (e) {
      console.warn('Failed to save grade practiced words', e);
    }

    // Also update global guest list in sessionStorage
    const words = getStudentPracticedWords(userName);
    words.add(wordId);
    try {
      sessionStorage.setItem(GUEST_PRACTICED_WORDS_KEY, JSON.stringify(Array.from(words)));
      localStorage.removeItem(GUEST_PRACTICED_WORDS_KEY);
      window.dispatchEvent(new CustomEvent('ecovoice_practiced_words_updated', { detail: { wordId, words: Array.from(words), grade: resolvedGrade } }));
    } catch (e) {
      console.warn('Failed to record guest practiced word', e);
    }
    return gradeWords;
  }

  const words = getStudentPracticedWords(userName);
  words.add(wordId);
  const nameKey = (userName || 'chivy').trim().toLowerCase();
  const storageKey = `${PRACTICED_WORDS_PREFIX}${nameKey}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(words)));
    window.dispatchEvent(new CustomEvent('ecovoice_practiced_words_updated', { detail: { wordId, words: Array.from(words), grade: resolvedGrade } }));
  } catch (e) {
    console.warn('Failed to record practiced word', e);
  }
  return words;
}

/**
 * Granular tracking: Get unique sentence IDs actually practiced by a student
 * Student Chí Vỹ has mastered 100% of Unit 1 sentences: all 5 sentences ('g4_u1_s1' to 'g4_u1_s5')
 * For Guest Mode: Isolated storage per grade, starts completely clean (0 sentences) in zero-state!
 */
export function getStudentPracticedSentences(userName?: string, grade?: string): Set<string> {
  if (typeof window === 'undefined') return new Set(G4_U1_ALL_SENTENCES);

  const isGuest = isGuestUser(userName) || (
    typeof window !== 'undefined' &&
    (sessionStorage.getItem('ecovoice_is_guest_mode') === 'true' || localStorage.getItem('ecovoice_is_guest_mode') === 'true') &&
    (!userName || isGuestUser(userName))
  );

  if (isGuest) {
    if (grade && (grade === '3' || grade === '4' || grade === '5')) {
      try {
        localStorage.removeItem(`ecovoice_guest_practiced_sentences_grade_${grade}`);
        const rawGrade = sessionStorage.getItem(`ecovoice_guest_practiced_sentences_grade_${grade}`);
        if (rawGrade) {
          const arr = JSON.parse(rawGrade);
          if (Array.isArray(arr)) return new Set(arr);
        }
      } catch (e) {
        console.warn('Failed to parse guest practiced sentences for grade', e);
      }
      return new Set<string>(); // Strictly zero-state for new session!
    }

    try {
      localStorage.removeItem(GUEST_PRACTICED_SENTENCES_KEY);
      const raw = sessionStorage.getItem(GUEST_PRACTICED_SENTENCES_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return new Set(arr);
        }
      }
    } catch (e) {
      console.warn('Failed to parse guest practiced sentences', e);
    }
    return new Set<string>();
  }

  const nameKey = (userName || 'chivy').trim().toLowerCase();
  const storageKey = `${PRACTICED_SENTENCES_PREFIX}${nameKey}`;
  const isChiVy = nameKey.includes('chí vỹ') || nameKey.includes('chi vy');

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) {
        if (isChiVy) {
          // Guarantee all 5 sentences of Unit 1 are mastered for Chi Vy
          const merged = Array.from(new Set([...G4_U1_ALL_SENTENCES, ...arr]));
          return new Set(merged);
        }
        return new Set(arr);
      }
    }
  } catch (e) {
    console.warn('Failed to parse practiced sentences', e);
  }

  const initialSentences = isChiVy ? G4_U1_ALL_SENTENCES : [];
  try {
    localStorage.setItem(storageKey, JSON.stringify(initialSentences));
  } catch {}
  return new Set(initialSentences);
}

export function recordPracticedSentence(userName: string, sentenceId: string, grade?: string): Set<string> {
  if (typeof window === 'undefined') return new Set([sentenceId]);
  const isGuest = isGuestUser(userName) || (
    typeof window !== 'undefined' &&
    (sessionStorage.getItem('ecovoice_is_guest_mode') === 'true' || localStorage.getItem('ecovoice_is_guest_mode') === 'true') &&
    (!userName || isGuestUser(userName))
  );

  const resolvedGrade = grade || (sentenceId.startsWith('g3_') ? '3' : sentenceId.startsWith('g4_') ? '4' : sentenceId.startsWith('g5_') ? '5' : '3');

  if (isGuest) {
    const gradeSentences = getStudentPracticedSentences(userName, resolvedGrade);
    gradeSentences.add(sentenceId);
    try {
      sessionStorage.setItem(`ecovoice_guest_practiced_sentences_grade_${resolvedGrade}`, JSON.stringify(Array.from(gradeSentences)));
      localStorage.removeItem(`ecovoice_guest_practiced_sentences_grade_${resolvedGrade}`);
    } catch (e) {
      console.warn('Failed to save grade practiced sentences', e);
    }

    const sentences = getStudentPracticedSentences(userName);
    sentences.add(sentenceId);
    try {
      sessionStorage.setItem(GUEST_PRACTICED_SENTENCES_KEY, JSON.stringify(Array.from(sentences)));
      localStorage.removeItem(GUEST_PRACTICED_SENTENCES_KEY);
      window.dispatchEvent(new CustomEvent('ecovoice_practiced_sentences_updated', { detail: { sentenceId, sentences: Array.from(sentences), grade: resolvedGrade } }));
    } catch (e) {
      console.warn('Failed to record guest practiced sentence', e);
    }
    return gradeSentences;
  }

  const sentences = getStudentPracticedSentences(userName);
  sentences.add(sentenceId);
  const nameKey = (userName || 'chivy').trim().toLowerCase();
  const storageKey = `${PRACTICED_SENTENCES_PREFIX}${nameKey}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(sentences)));
    window.dispatchEvent(new CustomEvent('ecovoice_practiced_sentences_updated', { detail: { sentenceId, sentences: Array.from(sentences), grade: resolvedGrade } }));
  } catch (e) {
    console.warn('Failed to record practiced sentence', e);
  }
  return sentences;
}

export function getStudentActivities(userName?: string, grade?: string): StudentActivityItem[] {
  if (typeof window === 'undefined') return [];

  const isGuest = isGuestUser(userName) || (
    typeof window !== 'undefined' &&
    (sessionStorage.getItem('ecovoice_is_guest_mode') === 'true' || localStorage.getItem('ecovoice_is_guest_mode') === 'true') &&
    (!userName || isGuestUser(userName))
  );

  if (isGuest) {
    try {
      localStorage.removeItem(GUEST_ACTIVITY_STORAGE_KEY);
      const raw = sessionStorage.getItem(GUEST_ACTIVITY_STORAGE_KEY);
      if (raw) {
        const parsed: StudentActivityItem[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (grade && (grade === '3' || grade === '4' || grade === '5')) {
            return parsed.filter(p => {
              if (p.grade) return p.grade === grade;
              if (p.id?.includes(`g${grade}_`)) return true;
              if (p.titleVi?.includes(`Khối ${grade}`) || p.detailVi?.includes(`Khối ${grade}`) || p.titleEn?.includes(`Grade ${grade}`)) return true;
              return false;
            });
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse guest activities', e);
    }
    return []; // Zero-state for new session!
  }

  // Activities specifically tailored for Unit 1 completion and Unit 2 progression for student Chí Vỹ
  const defaultActivities: StudentActivityItem[] = [
    {
      id: 'act_chivy_u2_unlocked',
      type: 'badge_unlocked',
      titleEn: 'Unit 2 Unlocked! · Time and daily routines',
      titleVi: 'Mở khóa thành công Unit 2: Time and daily routines 🔓',
      detailEn: 'Completed 100% of Unit 1 (10/10 words, 5/5 sentences). Unit 2 is now unlocked and ready!',
      detailVi: 'Hoàn thành xuất sắc 100% Unit 1 (10/10 từ vựng, 5/5 mẫu câu). Hệ thống tự động mở khóa Unit 2 để bé vào học!',
      score: 100,
      epAwarded: 0,
      timestamp: 'Vừa xong / Just now',
      icon: '🔓',
      badgeColor: 'blue',
      grade: '4'
    },
    {
      id: 'act_chivy_vocab_u1',
      type: 'speaking_vocab',
      titleEn: 'Vocabulary Mastery · Unit 1: My friends',
      titleVi: 'Luyện phát âm chuẩn xác 10/10 từ vựng Unit 1: My friends',
      detailEn: 'Practiced all 10 Unit 1 words with 95% AI accuracy (+50 EP)',
      detailVi: 'Luyện phát âm chuẩn xác toàn bộ 10/10 từ vựng Unit 1 với độ chuẩn AI 95% (+50 EP)',
      score: 95,
      epAwarded: 50,
      timestamp: '15 phút trước / 15m ago',
      icon: '🎙️',
      badgeColor: 'emerald',
      grade: '4'
    },
    {
      id: 'act_chivy_sentence_u1',
      type: 'speaking_sentence',
      titleEn: 'Sentence Mastery · 5/5 Sentences Completed',
      titleVi: 'Luyện nói thành thạo 5/5 mẫu câu giao tiếp Unit 1',
      detailEn: 'Spoke all 5 communicative sentence structures of Unit 1 correctly (+30 EP)',
      detailVi: 'Luyện nói đúng 5/5 cấu trúc mẫu câu giới thiệu quốc gia và bạn bè ("Where are you from?", "I\'m from...") (+30 EP)',
      score: 95,
      epAwarded: 30,
      timestamp: '25 phút trước / 25m ago',
      icon: '💬',
      badgeColor: 'teal',
      grade: '4'
    },
    {
      id: 'act_chivy_game_u1',
      type: 'eco_game',
      titleEn: 'Eco Game · Unit 1 Vocabulary Game',
      titleVi: 'Eco Game: Thử thách đường hoa sinh thái Unit 1',
      detailEn: 'Played Unit 1 vocabulary challenge, scored 100/100 points (+40 EP)',
      detailVi: 'Tham gia thử thách từ vựng xanh Unit 1, vượt qua các câu hỏi và đạt 100/100 điểm tuyệt đối (+40 EP)',
      score: 100,
      epAwarded: 40,
      timestamp: '35 phút trước / 35m ago',
      icon: '🎮',
      badgeColor: 'amber',
      grade: '4'
    },
    {
      id: 'act_chivy_tree_1',
      type: 'tree_planted',
      titleEn: 'Virtual Tree Planted! · Khu vườn xanh',
      titleVi: 'Vun trồng thành công Cây xanh thứ 1 🌳',
      detailEn: 'Milestone reached: 30 Eco Points from Unit 1 converted to 1 Virtual Tree',
      detailVi: 'Đạt mốc 30 EP từ bài học Unit 1! Bé đã trồng thành công cây xanh đầu tiên vào vườn sinh thái',
      score: 100,
      epAwarded: 0,
      timestamp: 'Hôm nay / Today',
      icon: '🌳',
      badgeColor: 'emerald',
      grade: '4'
    },
    {
      id: 'act_chivy_tree_2',
      type: 'tree_planted',
      titleEn: 'Virtual Tree Planted! · Khu vườn xanh',
      titleVi: 'Vun trồng thành công Cây xanh thứ 2 🌳',
      detailEn: 'Milestone reached: 60 Eco Points from Unit 1 converted to 2 Virtual Trees',
      detailVi: 'Đạt mốc 60 EP từ luyện tập từ vựng và trò chơi xanh! Bé đã trồng thành công cây xanh thứ 2 vào vườn',
      score: 100,
      epAwarded: 0,
      timestamp: 'Hôm nay / Today',
      icon: '🌳',
      badgeColor: 'emerald',
      grade: '4'
    },
    {
      id: 'act_chivy_badge_u1',
      type: 'badge_unlocked',
      titleEn: 'Badges Unlocked · Unit 1 Master & Eco Planter',
      titleVi: 'Mở khóa huy hiệu: Bước chân đầu tiên 🌟 & Kiện tướng phát âm 🎙️',
      detailEn: 'Earned 5 honors by completing Unit 1 and environmental achievements',
      detailVi: 'Thành tích hoàn thành toàn bộ 10 từ vựng và 5 mẫu câu Unit 1 cùng 2 cây xanh sinh thái',
      score: 100,
      epAwarded: 0,
      timestamp: 'Hôm nay / Today',
      icon: '🏆',
      badgeColor: 'amber',
      grade: '4'
    }
  ];

  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (raw) {
      const parsed: StudentActivityItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const isChiVy = !userName || userName.toLowerCase().includes('chí vỹ') || userName.toLowerCase().includes('chi vy');
        if (isChiVy) {
          // If already has enriched activities including Unit 2 or completed Unit 1, use parsed
          const hasU2OrComplete = parsed.some(p => p.id?.includes('u2') || p.titleVi?.includes('Unit 2') || p.titleVi?.includes('10/10'));
          if (hasU2OrComplete) {
            return parsed;
          }
          return defaultActivities;
        } else {
          const hasOutdatedUnit = parsed.some(p => p.titleVi?.includes('Unit 8') || p.detailVi?.includes('Unit 8'));
          if (!hasOutdatedUnit) {
            return parsed;
          }
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse student activities', e);
  }

  try {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(defaultActivities));
  } catch {}

  return defaultActivities;
}

export function recordStudentActivity(
  activity: Omit<StudentActivityItem, 'id' | 'timestamp'> & { grade?: string },
  userName?: string,
  grade?: string
): void {
  if (typeof window === 'undefined') return;
  const isGuest = isGuestUser(userName) || (
    typeof window !== 'undefined' &&
    (sessionStorage.getItem('ecovoice_is_guest_mode') === 'true' || localStorage.getItem('ecovoice_is_guest_mode') === 'true') &&
    (!userName || isGuestUser(userName))
  );

  const storageKey = isGuest ? GUEST_ACTIVITY_STORAGE_KEY : ACTIVITY_STORAGE_KEY;
  const resolvedGrade = activity.grade || grade || (
    typeof window !== 'undefined' ? localStorage.getItem('ecovoice_selected_grade') || '3' : '3'
  );

  try {
    const list = getStudentActivities(userName);
    const newItem: StudentActivityItem = {
      ...activity,
      grade: resolvedGrade,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Vừa xong / Just now'
    };
    const updated = [newItem, ...list.slice(0, 29)]; // Keep latest 30 activities
    if (isGuest) {
      sessionStorage.setItem(GUEST_ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
      localStorage.removeItem(GUEST_ACTIVITY_STORAGE_KEY);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      // Sync activity to Firestore in background
      try {
        recordActivityToFirestore(newItem);
      } catch (e) {
        console.warn('Firestore activity sync warning:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('ecovoice_student_activity_updated', { detail: { grade: resolvedGrade } }));
  } catch (e) {
    console.warn('Failed to record student activity', e);
  }
}
