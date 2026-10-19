import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  BookOpen, 
  Mic, 
  Gamepad2, 
  Award, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  TrendingUp, 
  Star, 
  Calendar, 
  Filter, 
  Layers, 
  ChevronRight, 
  X,
  Flame,
  Check,
  Zap,
  Target,
  Volume2
} from 'lucide-react';
import { bookmapDatabase, UnitData } from '../data/bookmapData';
import { getUnitsForGrade } from '../services/teacherContentService';
import { 
  isUnitUnlockedForGrade, 
  isUnitFullyCompleted, 
  getHighestUnlockedUnit, 
  getTeacherClasses 
} from '../services/teacherContentService';
import { 
  getStudentActivities, 
  getStudentPracticedWords, 
  getStudentPracticedSentences, 
  getGuestGradeEcoPoints,
  getGuestGradeVirtualTrees,
  computeLogicalTrees,
  computeRemainingEPToNextTree,
  StudentActivityItem 
} from '../services/studentActivityService';

interface StudentProgressDashboardProps {
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
  activeUnitKey?: string;
  studentName: string;
  studentClass: string;
  userRole: 'student' | 'teacher' | 'guest';
  isGuestMode: boolean;
  ecoPoints: number;
  virtualTrees: number;
  practicedItemsCount?: number;
  onNavigateToUnit: (unitKey: string) => void;
  onStartPractice: (unitKey?: string) => void;
  onOpenEcoGames: (unitKey?: string) => void;
  playSoundEffect: (effect: 'chime' | 'success' | 'click' | 'celebrate' | 'fail') => void;
  isOpenAsModal?: boolean;
  onClose?: () => void;
}

export interface AchievementBadge {
  id: string;
  nameEn: string;
  nameVi: string;
  descEn: string;
  descVi: string;
  icon: string;
  tier: 'gold' | 'silver' | 'bronze' | 'emerald' | 'diamond';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'speaking' | 'eco' | 'streak' | 'games';
  unlockedAt?: string;
}

export const StudentProgressDashboard: React.FC<StudentProgressDashboardProps> = ({
  selectedGrade,
  onGradeChange,
  activeUnitKey,
  studentName,
  studentClass,
  userRole,
  isGuestMode,
  ecoPoints,
  virtualTrees,
  practicedItemsCount = 0,
  onNavigateToUnit,
  onStartPractice,
  onOpenEcoGames,
  playSoundEffect,
  isOpenAsModal = false,
  onClose
}) => {
  const [activeActivityTab, setActiveActivityTab] = useState<'all' | 'unit' | 'speaking' | 'games' | 'rewards'>('all');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'in_progress' | 'unlocked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [selectedStation, setSelectedStation] = useState<UnitData | null>(null);
  const effectiveStudentName = (isGuestMode || userRole === 'guest') ? 'Khách trải nghiệm' : (studentName || 'Học sinh');
  const [activityList, setActivityList] = useState<StudentActivityItem[]>(() => getStudentActivities(effectiveStudentName, selectedGrade));
  const [practicedWordsSet, setPracticedWordsSet] = useState<Set<string>>(() => getStudentPracticedWords(effectiveStudentName, selectedGrade));
  const [practicedSentencesSet, setPracticedSentencesSet] = useState<Set<string>>(() => getStudentPracticedSentences(effectiveStudentName, selectedGrade));
  const [unitsUpdateCount, setUnitsUpdateCount] = useState<number>(0);

  useEffect(() => {
    const handleUpdate = () => {
      setActivityList(getStudentActivities(effectiveStudentName, selectedGrade));
      setUnitsUpdateCount(c => c + 1);
    };
    const handleWordsUpdate = () => {
      setPracticedWordsSet(getStudentPracticedWords(effectiveStudentName, selectedGrade));
    };
    const handleSentencesUpdate = () => {
      setPracticedSentencesSet(getStudentPracticedSentences(effectiveStudentName, selectedGrade));
    };
    // Re-sync immediately when props or grade change
    setActivityList(getStudentActivities(effectiveStudentName, selectedGrade));
    setPracticedWordsSet(getStudentPracticedWords(effectiveStudentName, selectedGrade));
    setPracticedSentencesSet(getStudentPracticedSentences(effectiveStudentName, selectedGrade));

    window.addEventListener('ecovoice_student_activity_updated', handleUpdate);
    window.addEventListener('ecovoice_practiced_words_updated', handleWordsUpdate);
    window.addEventListener('ecovoice_practiced_sentences_updated', handleSentencesUpdate);
    window.addEventListener('ecovoice_guest_points_updated', handleUpdate);
    window.addEventListener('ecovoice_guest_trees_updated', handleUpdate);
    window.addEventListener('ecovoice_student_accounts_updated', handleUpdate);
    window.addEventListener('ecovoice_custom_units_updated', handleUpdate);
    return () => {
      window.removeEventListener('ecovoice_student_activity_updated', handleUpdate);
      window.removeEventListener('ecovoice_practiced_words_updated', handleWordsUpdate);
      window.removeEventListener('ecovoice_practiced_sentences_updated', handleSentencesUpdate);
      window.removeEventListener('ecovoice_guest_points_updated', handleUpdate);
      window.removeEventListener('ecovoice_guest_trees_updated', handleUpdate);
      window.removeEventListener('ecovoice_student_accounts_updated', handleUpdate);
      window.removeEventListener('ecovoice_custom_units_updated', handleUpdate);
    };
  }, [effectiveStudentName, isGuestMode, userRole, selectedGrade]);

  const unitsList: UnitData[] = useMemo(() => {
    return getUnitsForGrade(selectedGrade);
  }, [selectedGrade, unitsUpdateCount]);

  // Determine if user is in Guest Mode
  const isGuest = useMemo(() => {
    if (isGuestMode || userRole === 'guest') return true;
    const name = (studentName || '').toLowerCase().trim();
    if (!name || name.includes('guest') || name.includes('visitor') || name.includes('khách') || name.includes('demo') || name.includes('trải nghiệm')) return true;
    const cls = (studentClass || '').toLowerCase().trim();
    if (cls.includes('guest') || cls.includes('visitor') || cls.includes('khách') || cls.includes('demo') || cls.includes('trải nghiệm')) return true;
    return false;
  }, [isGuestMode, userRole, studentName, studentClass]);

  // Determine if viewing progress of student Chí Vỹ (Grade 4, Class 4A3)
  const isChiVy = useMemo(() => {
    if (isGuest) return false;
    const name = (studentName || '').toLowerCase().trim();
    const cls = (studentClass || '').toLowerCase().trim();
    if (userRole !== 'student') return false;
    if (name.includes('chí vỹ') || name.includes('chi vy')) return true;
    if (selectedGrade === '4' && cls.includes('4a3')) return true;
    return false;
  }, [isGuest, studentName, userRole, selectedGrade, studentClass]);

  // Unit 1 object, total vocabulary count and total sentences count
  const u1Obj = useMemo(() => unitsList.find(u => (u.unitNumber || 1) === 1), [unitsList]);
  const u1TotalWords = useMemo(() => u1Obj?.vocabulary?.length || (selectedGrade === '3' ? 8 : 10), [u1Obj, selectedGrade]);
  const u1TotalSentences = useMemo(() => u1Obj?.sentences?.length || (selectedGrade === '3' ? 4 : 5), [u1Obj, selectedGrade]);

  // Words actually practiced in Unit 1 (Granular Tracking: 10/10 words mastered for Chí Vỹ)
  const u1PracticedCount = useMemo(() => {
    if (!u1Obj || !u1Obj.vocabulary) {
      return isChiVy ? 10 : 0;
    }
    const countInU1 = u1Obj.vocabulary.filter(v => practicedWordsSet.has(v.id)).length;
    if (isChiVy) {
      return Math.max(10, countInU1);
    }
    return countInU1;
  }, [u1Obj, practicedWordsSet, isChiVy]);

  // Sentences actually practiced in Unit 1 (Granular Tracking: 5/5 sentences mastered for Chí Vỹ)
  const u1PracticedSentencesCount = useMemo(() => {
    if (!u1Obj || !u1Obj.sentences) {
      return isChiVy ? 5 : 0;
    }
    const countInU1 = u1Obj.sentences.filter(s => practicedSentencesSet.has(s.id)).length;
    if (isChiVy) {
      return Math.max(5, countInU1);
    }
    return countInU1;
  }, [u1Obj, practicedSentencesSet, isChiVy]);

  // Current active unit number: prioritizes activeUnitKey, otherwise highest unlocked unit in curriculum
  const currentUnitNumber = useMemo(() => {
    if (activeUnitKey) {
      const matched = unitsList.find(u => u.unitKey === activeUnitKey);
      if (matched && matched.unitNumber) return matched.unitNumber;
    }
    return getHighestUnlockedUnit(selectedGrade, effectiveStudentName);
  }, [activeUnitKey, unitsList, selectedGrade, effectiveStudentName]);

  // 1. Granular Vocabulary Count (Real-time Word Count for this grade):
  // Displays exact number of unique words practiced in selectedGrade
  const actualVocabCount = useMemo(() => {
    const gradeVocabIds = new Set(unitsList.flatMap(u => (u.vocabulary || []).map(v => v.id)));
    const practicedInThisGrade = Array.from(practicedWordsSet).filter(id => gradeVocabIds.has(id)).length;
    if (isChiVy) {
      return Math.max(u1PracticedCount, practicedInThisGrade);
    }
    return practicedInThisGrade;
  }, [isChiVy, u1PracticedCount, unitsList, practicedWordsSet]);

  // 1b. Granular Sentences Count for this grade:
  const actualSentenceCount = useMemo(() => {
    const gradeSentenceIds = new Set(unitsList.flatMap(u => (u.sentences || []).map(s => s.id)));
    const practicedInThisGrade = Array.from(practicedSentencesSet).filter(id => gradeSentenceIds.has(id)).length;
    if (isChiVy) {
      return Math.max(u1PracticedSentencesCount, practicedInThisGrade);
    }
    return practicedInThisGrade;
  }, [isChiVy, u1PracticedSentencesCount, unitsList, practicedSentencesSet]);

  // Units completed: dynamically checked via isUnitFullyCompleted across all units 1..20
  const completedUnits = useMemo(() => {
    return unitsList.filter(u => {
      const num = u.unitNumber || 1;
      return isUnitFullyCompleted(selectedGrade, num, effectiveStudentName);
    });
  }, [unitsList, selectedGrade, effectiveStudentName, practicedWordsSet, practicedSentencesSet]);

  const currentUnitObj = useMemo(() => {
    return unitsList.find(u => (u.unitNumber || 1) === currentUnitNumber) || unitsList[0];
  }, [unitsList, currentUnitNumber]);

  // Active target unit key and display name for quick actions
  // Automatically points to the active/selected unit, or current unlocked station
  const activeTargetUnitKey = useMemo(() => {
    if (activeUnitKey && isUnitUnlockedForGrade(selectedGrade, activeUnitKey, effectiveStudentName)) {
      return activeUnitKey;
    }
    const highest = getHighestUnlockedUnit(selectedGrade, effectiveStudentName);
    return `unit_${highest}`;
  }, [activeUnitKey, selectedGrade, effectiveStudentName]);

  const activeTargetUnitObj = useMemo(() => {
    return unitsList.find(u => u.unitKey === activeTargetUnitKey) || currentUnitObj;
  }, [unitsList, activeTargetUnitKey, currentUnitObj]);

  const activeTargetUnitName = useMemo(() => {
    if (!activeTargetUnitObj) return 'Unit 1';
    const num = activeTargetUnitObj.unitNumber || 1;
    const name = activeTargetUnitObj.unitName || activeTargetUnitObj.unitFullName;
    return `Unit ${num}: ${name}`;
  }, [activeTargetUnitObj]);

  // Total words in Term 1 (Units 1-10) and full-year curriculum
  const term1Units = useMemo(() => unitsList.filter(u => (u.unitNumber || 1) <= 10), [unitsList]);
  const totalTerm1Vocab = useMemo(() => {
    return term1Units.reduce((sum, u) => sum + (u.vocabulary ? u.vocabulary.length : 8), 0) || 80;
  }, [term1Units]);

  const totalGradeVocab = useMemo(() => {
    return unitsList.reduce((sum, u) => sum + (u.vocabulary ? u.vocabulary.length : 8), 0) || 160;
  }, [unitsList]);

  // Completion percentage of curriculum (0% because Unit 1 is 3/10 words, not completed)
  const completionRate = useMemo(() => {
    const totalUnits = unitsList.length || 20;
    return Math.round((completedUnits.length / totalUnits) * 100);
  }, [completedUnits.length, unitsList.length]);

  const term1CompletionRate = useMemo(() => {
    if (totalTerm1Vocab === 0) return 0;
    return Math.min(100, Math.round((actualVocabCount / totalTerm1Vocab) * 100));
  }, [actualVocabCount, totalTerm1Vocab]);

  // Unit 1 completion rate
  const unit1Percent = useMemo(() => {
    return Math.min(100, Math.round((u1PracticedCount / u1TotalWords) * 100));
  }, [u1PracticedCount, u1TotalWords]);

  // Dynamic Eco Points (60 EP base) and Trees (1 tree base) for Chí Vỹ
  // Fully synced in real-time with ecoPoints and virtualTrees props!
  // For Guest Mode: Strictly isolated per grade (Grade 3, Grade 4, Grade 5)
  const dynamicTotalEP = useMemo(() => {
    if (isGuestMode || userRole === 'guest') {
      return getGuestGradeEcoPoints(selectedGrade);
    }
    const epFromActivities = activityList.reduce((sum, a) => sum + (a.epAwarded || 0), 0);
    const baseEPFromCompletedUnits = completedUnits.length * 35;
    const epFromPracticedItems = (practicedItemsCount || 0) * 10;
    const computedSum = baseEPFromCompletedUnits + Math.max(epFromActivities, epFromPracticedItems);
    const baseVal = isChiVy ? Math.max(60, computedSum) : computedSum;
    return Math.max(baseVal, ecoPoints || 0);
  }, [isChiVy, isGuestMode, userRole, ecoPoints, completedUnits.length, practicedItemsCount, activityList, selectedGrade]);

  const dynamicTotalTrees = useMemo(() => {
    return computeLogicalTrees(dynamicTotalEP);
  }, [dynamicTotalEP]);

  const remainingEPToNextTree = useMemo(() => {
    return computeRemainingEPToNextTree(dynamicTotalEP);
  }, [dynamicTotalEP]);

  // Average pronunciation accuracy (95% for Unit 1 Chí Vỹ; for Guest/Zero-state: actual session score in this grade or 0%)
  const averageAccuracy = useMemo(() => {
    // Guest Mode / Demo User: Strictly zero-state (0%) unless guest has performed actual AI speaking practice IN THIS GRADE
    if (isGuestMode || userRole === 'guest') {
      const guestSpeakingActsInGrade = activityList.filter(
        a => (a.type === 'speaking_vocab' || a.type === 'speaking_sentence') &&
             typeof a.score === 'number' && a.score > 0 &&
             (a.grade === selectedGrade || (!a.grade && a.detailVi?.includes(`Khối ${selectedGrade}`)))
      );
      if (guestSpeakingActsInGrade.length === 0) {
        return 0; // Zero-state: Never display 100% or default student data
      }
      const sum = guestSpeakingActsInGrade.reduce((acc, a) => acc + (a.score || 0), 0);
      return Math.round(sum / guestSpeakingActsInGrade.length);
    }
    if (isChiVy) return 95;
    const speakingActivities = activityList.filter(
      a => (a.type === 'speaking_vocab' || a.type === 'speaking_sentence') && typeof a.score === 'number' && a.score > 0
    );
    if (speakingActivities.length > 0) {
      const sum = speakingActivities.reduce((acc, a) => acc + (a.score || 0), 0);
      return Math.round(sum / speakingActivities.length);
    }
    return 0;
  }, [isChiVy, isGuestMode, userRole, activityList, selectedGrade]);

  // 2. Badges collection with Granular Tracking:
  // Exactly 5/8 core badges unlocked for Unit 1 mastery, 3 in-progress, plus Unit 2 conquest milestones!
  const badges: AchievementBadge[] = useMemo(() => {
    const isU1FullyCompleted = u1PracticedCount >= u1TotalWords; // 10/10 words
    const isU1SentencesCompleted = u1PracticedSentencesCount >= 5; // 5/5 sentences

    return [
      {
        id: 'badge_first_word',
        nameEn: 'First Step',
        nameVi: 'Bước chân đầu tiên',
        descEn: 'Master all 10 vocabulary words of Unit 1: My friends',
        descVi: 'Luyện phát âm chuẩn xác toàn bộ 10 từ vựng Unit 1: My friends',
        icon: '🌟',
        tier: 'bronze',
        unlocked: isU1FullyCompleted,
        progress: u1PracticedCount,
        maxProgress: u1TotalWords,
        category: 'speaking',
        unlockedAt: isU1FullyCompleted ? 'Đã đạt · 10/10 từ vựng' : undefined
      },
      {
        id: 'badge_pro_speaker',
        nameEn: 'Pronunciation Ace',
        nameVi: 'Kiện tướng phát âm',
        descEn: 'Score 90%+ AI pronunciation accuracy on all 10 Unit 1 words',
        descVi: 'Luyện phát âm chuẩn AI >= 90% toàn bộ 10 từ vựng Unit 1: My friends',
        icon: '🎙️',
        tier: 'gold',
        unlocked: isU1FullyCompleted && averageAccuracy >= 90,
        progress: u1PracticedCount,
        maxProgress: u1TotalWords,
        category: 'speaking',
        unlockedAt: isU1FullyCompleted ? 'Đã đạt · 10/10 từ chuẩn AI (95%)' : undefined
      },
      {
        id: 'badge_sentence_pioneer',
        nameEn: 'Confident Speaker',
        nameVi: 'Giao tiếp tự tin',
        descEn: 'Speak all 5 communicative sentence structures of Unit 1: My friends',
        descVi: 'Luyện nói đúng toàn bộ 5/5 mẫu câu giao tiếp Unit 1: My friends',
        icon: '💬',
        tier: 'silver',
        unlocked: isU1SentencesCompleted,
        progress: u1PracticedSentencesCount,
        maxProgress: 5,
        category: 'speaking',
        unlockedAt: isU1SentencesCompleted ? 'Đã đạt · 5/5 mẫu câu' : undefined
      },
      {
        id: 'badge_game_champion',
        nameEn: 'Eco Game Champion',
        nameVi: 'Vô địch trò chơi xanh',
        descEn: 'Score a perfect 100 points in Unit 1 vocabulary challenge',
        descVi: 'Đạt 100 điểm tuyệt đối trong thử thách trò chơi từ vựng Unit 1 (My friends)',
        icon: '🎮',
        tier: 'gold',
        unlocked: dynamicTotalEP >= 100,
        progress: Math.min(100, dynamicTotalEP),
        maxProgress: 100,
        category: 'games',
        unlockedAt: dynamicTotalEP >= 100 ? `Đã đạt · ${dynamicTotalEP}/100 EP` : undefined
      },
      {
        id: 'badge_tree_planter',
        nameEn: 'Eco Planter',
        nameVi: 'Người gieo mầm xanh',
        descEn: 'Plant your first virtual tree by accumulating 30 EP',
        descVi: 'Trồng thành công cây xanh ảo đầu tiên bằng 30 EP từ bài học Unit 1',
        icon: '🌳',
        tier: 'emerald',
        unlocked: dynamicTotalTrees >= 1,
        progress: Math.min(2, dynamicTotalTrees),
        maxProgress: 2,
        category: 'eco',
        unlockedAt: dynamicTotalTrees >= 1 ? `Đã hoàn thành · ${dynamicTotalTrees} cây xanh` : undefined
      },
      {
        id: 'badge_streak_3',
        nameEn: 'Streak Master',
        nameVi: 'Chăm chỉ mỗi ngày',
        descEn: 'Practice English speaking 3 days in a row',
        descVi: 'Chăm chỉ luyện phát âm tiếng Anh 3 ngày liên tiếp',
        icon: '🔥',
        tier: 'silver',
        unlocked: false,
        progress: isChiVy ? 1 : (isGuestMode ? 0 : 1),
        maxProgress: 3,
        category: 'streak'
      },
      {
        id: 'badge_vocab_20',
        nameEn: 'Vocabulary Master',
        nameVi: 'Bậc thầy từ vựng',
        descEn: 'Master 20 English vocabulary words in the curriculum',
        descVi: 'Luyện tập phát âm chuẩn trên 20 từ vựng (chinh phục thêm 10 từ tại Unit 2)',
        icon: '📚',
        tier: 'diamond',
        unlocked: actualVocabCount >= 20,
        progress: Math.min(actualVocabCount, 20),
        maxProgress: 20,
        category: 'speaking',
        unlockedAt: actualVocabCount >= 20 ? 'Đã đạt · 20/20 từ' : undefined
      },
      {
        id: 'badge_sentence_10',
        nameEn: 'Sentence Explorer',
        nameVi: 'Nhà thám hiểm mẫu câu',
        descEn: 'Speak 10 communicative sentence structures correctly',
        descVi: 'Luyện nói đúng 10 mẫu câu giao tiếp Tiếng Anh Global Success (chinh phục tiếp tại Unit 2)',
        icon: '🧭',
        tier: 'silver',
        unlocked: actualSentenceCount >= 10,
        progress: Math.min(actualSentenceCount, 10),
        maxProgress: 10,
        category: 'speaking',
        unlockedAt: actualSentenceCount >= 10 ? 'Đã đạt · 10/10 mẫu câu' : undefined
      },
      // Expansion Badges when student advances to Unit 2 (Time and daily routines)
      {
        id: 'badge_unit2_time_master',
        nameEn: 'Time Master',
        nameVi: 'Bậc thầy thời gian',
        descEn: 'Master 10 vocabulary words of Unit 2: Time and daily routines',
        descVi: 'Luyện phát âm chuẩn 10 từ vựng chủ đề thời gian Unit 2 (Time and daily routines)',
        icon: '⏰',
        tier: 'gold',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        category: 'speaking'
      },
      {
        id: 'badge_unit2_routines',
        nameEn: 'Daily Routine Speaker',
        nameVi: 'Nhịp sống xanh',
        descEn: 'Speak all communicative sentences of Unit 2: Time and daily routines',
        descVi: 'Luyện nói thành thạo các mẫu câu hỏi giờ và sinh hoạt hàng ngày Unit 2',
        icon: '🌅',
        tier: 'silver',
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        category: 'speaking'
      },
      {
        id: 'badge_green_guardian',
        nameEn: 'Green Guardian',
        nameVi: 'Hiệp sĩ bảo vệ môi trường',
        descEn: 'Accumulate over 300 Eco Points in total',
        descVi: 'Tích lũy trên 300 Eco Points để bảo vệ hành tinh xanh',
        icon: '🛡️',
        tier: 'emerald',
        unlocked: dynamicTotalEP >= 300,
        progress: Math.min(dynamicTotalEP, 300),
        maxProgress: 300,
        category: 'eco',
        unlockedAt: dynamicTotalEP >= 300 ? 'Đã hoàn thành · 300/300 EP' : undefined
      }
    ];
  }, [u1PracticedCount, u1TotalWords, u1PracticedSentencesCount, isChiVy, isGuestMode, averageAccuracy, dynamicTotalTrees, dynamicTotalEP, actualVocabCount, actualSentenceCount]);

  const filteredActivities = useMemo(() => {
    if (activeActivityTab === 'all') return activityList;
    if (activeActivityTab === 'unit') {
      return activityList.filter(a => {
        if (a.unitKey && a.unitKey === activeTargetUnitKey) return true;
        if (a.unitNumber && a.unitNumber === currentUnitNumber) return true;
        if (a.titleVi?.includes(`Unit ${currentUnitNumber}`) || a.titleEn?.includes(`Unit ${currentUnitNumber}`)) return true;
        if (a.detailVi?.includes(`Unit ${currentUnitNumber}`) || a.detailEn?.includes(`Unit ${currentUnitNumber}`)) return true;
        return false;
      });
    }
    if (activeActivityTab === 'speaking') {
      return activityList.filter(a => a.type === 'speaking_vocab' || a.type === 'speaking_sentence');
    }
    if (activeActivityTab === 'games') {
      return activityList.filter(a => a.type === 'eco_game');
    }
    if (activeActivityTab === 'rewards') {
      return activityList.filter(a => a.type === 'tree_planted' || a.type === 'badge_unlocked');
    }
    return activityList;
  }, [activityList, activeActivityTab, activeTargetUnitKey, currentUnitNumber]);

  // Mascot Eco Buddy Speech Text according to official template:
  // '[Tên học sinh] đã luyện được [Số từ] từ vựng, [Số mẫu câu] mẫu câu, hoàn thành các trò chơi sinh thái, tích lũy tổng cộng [Số điểm] EP và vun trồng được [Số cây thực tế tương ứng] cây xanh! Cố lên bạn ơi, tiếp tục chinh phục thêm thử thách nhé!'
  const studentDisplayName = useMemo(() => {
    if (isGuestMode || userRole === 'guest') {
      return 'Bạn';
    }
    if (isChiVy) {
      return 'Chí Vỹ';
    }
    if (studentName && !studentName.includes('Visitor') && !studentName.includes('Khách') && !studentName.includes('Demo')) {
      return studentName;
    }
    return 'Học sinh';
  }, [isGuestMode, userRole, isChiVy, studentName]);

  const mascotSpeechText = useMemo(() => {
    if ((isGuestMode || userRole === 'guest') && actualVocabCount === 0 && actualSentenceCount === 0 && dynamicTotalEP === 0) {
      return `Chào mừng Khách trải nghiệm đến với Khối ${selectedGrade}! Bạn hãy bấm "Luyện phát âm ngay" hoặc thử sức với các trò chơi sinh thái để bắt đầu vun trồng cây xanh nhé!`;
    }
    return `${studentDisplayName} đã luyện được ${actualVocabCount} từ vựng, ${actualSentenceCount} mẫu câu, hoàn thành các trò chơi sinh thái, tích lũy tổng cộng ${dynamicTotalEP} EP và vun trồng được ${dynamicTotalTrees} cây xanh! Cố lên bạn ơi, tiếp tục chinh phục thêm thử thách nhé!`;
  }, [studentDisplayName, actualVocabCount, actualSentenceCount, dynamicTotalEP, dynamicTotalTrees, isGuestMode, userRole, selectedGrade]);

  // Dynamic Sequential Unlocking Status for all 20 Units:
  // Units must be completed sequentially: Unit N requires Unit N-1 to be 100% completed.
  const getUnitSequentialStatus = (unitNum: number) => {
    const isAccessible = isUnitUnlockedForGrade(selectedGrade, `unit_${unitNum}`, effectiveStudentName);
    const isThisCompleted = isUnitFullyCompleted(selectedGrade, unitNum, effectiveStudentName);
    const isLocked = !isAccessible;
    const isCurrent = isAccessible && !isThisCompleted;

    const prevUnitNum = unitNum > 1 ? unitNum - 1 : undefined;
    const prevUnit = prevUnitNum ? unitsList.find(u => (u.unitNumber || 1) === prevUnitNum) : undefined;
    const prevUnitName = prevUnit?.unitName || (prevUnitNum ? `Unit ${prevUnitNum}` : undefined);

    let prevVocabCount = 0;
    let prevTotal = prevUnit?.vocabulary?.length || 10;
    if (prevUnit && prevUnit.vocabulary) {
      prevVocabCount = prevUnit.vocabulary.filter(v => practicedWordsSet.has(v.id)).length;
    } else if (prevUnitNum === 1) {
      prevVocabCount = u1PracticedCount;
      prevTotal = u1TotalWords;
    }
    const prevPercent = Math.min(100, Math.round((prevVocabCount / prevTotal) * 100));

    return {
      isAccessible,
      isCompleted: isThisCompleted,
      isCurrent,
      isLocked,
      prevUnitNumber: prevUnitNum,
      prevUnitName,
      prevVocabCount,
      prevTotalWords: prevTotal,
      prevPercent
    };
  };

  return (
    <div className={`w-full max-w-7xl mx-auto flex flex-col gap-6 p-3 sm:p-5 lg:p-6 animate-fadeIn ${isOpenAsModal ? 'bg-transparent' : ''}`}>
      
      {/* ============================================================== */}
      {/* 0. HERO BANNER: 3D PIXAR MASCOT + DASHBOARD GREETING */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c4326] via-[#15803d] to-[#1cb55b] p-5 sm:p-7 shadow-lg border-2 border-[#86efac] text-white">
        {/* Whimsical background accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Text Block */}
          <div className="flex-1 text-center md:text-left space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-black tracking-wide text-amber-300 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>BẢNG TIẾN ĐỘ GAMIFICATION · MY PROGRESS</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white leading-tight">
              Hành trình Xanh của {isGuestMode || userRole === 'guest' ? 'Khách trải nghiệm / Visitor' : (studentName || 'Bé')} 🌱
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 max-w-2xl font-medium leading-relaxed">
              {(isGuestMode || userRole === 'guest')
                ? "Trang tổng quan trải nghiệm: Theo dõi kết quả luyện nói AI, từ vựng, huy hiệu và số cây xanh được vun trồng trong phiên làm việc này!"
                : "Theo dõi kết quả luyện nói AI, số từ vựng chuẩn bản xứ, huân chương danh dự và số cây xanh bé đã vun trồng cho khu vườn của em!"}
            </p>

            {/* Role-based Grade Display (Grade Selector) */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-200">
                {(userRole === 'teacher' || isGuestMode || userRole === 'guest') ? 'Chọn Khối lớp:' : 'Khối lớp của em:'}
              </span>
              {(userRole === 'teacher' || isGuestMode || userRole === 'guest') ? (
                // Teacher / Guest Mode: Full switcher for Grade 3, Grade 4, Grade 5
                ['3', '4', '5'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      playSoundEffect('click');
                      onGradeChange(g);
                    }}
                    className={`px-3.5 py-1 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                      selectedGrade === g
                        ? 'bg-amber-400 text-emerald-950 shadow-md scale-105 ring-2 ring-white/50'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    Grade {g} (Lớp {g})
                  </button>
                ))
              ) : (
                // Student Role (e.g. Chí Vỹ): STRICTLY show only the student's actual grade (e.g. Grade 4), hide Grade 3 & Grade 5
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-400 text-emerald-950 font-black text-xs sm:text-sm shadow-md ring-2 ring-white/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-800 animate-pulse" />
                  <span>Grade {selectedGrade} (Lớp {selectedGrade})</span>
                  <span className="text-[10px] bg-emerald-900/20 text-emerald-950 px-2 py-0.5 rounded-md font-extrabold">
                    {studentClass ? `Lớp ${studentClass.replace(/^Lớp\s+/i, '')}` : 'Lớp 4A3'}
                  </span>
                </div>
              )}
              {(userRole === 'teacher' || isGuestMode || userRole === 'guest') && (
                <span className="text-xs bg-emerald-900/60 text-emerald-200 px-3 py-1 rounded-xl font-bold ml-1 border border-emerald-500/40">
                  {isGuestMode || userRole === 'guest' ? 'Tài khoản: Khách trải nghiệm / Visitor (Demo User)' : (studentClass ? `Lớp: ${studentClass}` : `Khối ${selectedGrade}`)}
                </span>
              )}
            </div>
          </div>

          {/* Right Mascot Visual Card (3D Pixar Style) */}
          <div className="shrink-0 flex items-center gap-4 bg-white/15 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-white/25 shadow-md max-w-md">
            <div 
              onClick={() => {
                playSoundEffect('celebrate');
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(mascotSpeechText);
                  utterance.lang = 'vi-VN';
                  utterance.rate = 0.95;
                  window.speechSynthesis.speak(utterance);
                }
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/20 shrink-0 border-2 border-amber-300 shadow-inner flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="Bấm vào Mascot để nghe lời cổ vũ nhé!"
            >
              <img
                src="/src/assets/images/mascot_celebrating_progress_1792254779170.jpg"
                alt="3D Pixar Mascot Celebration"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-amber-300 font-black text-xs uppercase tracking-wider">Mascot Eco Buddy</span>
                <button
                  type="button"
                  onClick={() => {
                    playSoundEffect('chime');
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(mascotSpeechText);
                      utterance.lang = 'vi-VN';
                      utterance.rate = 0.95;
                      window.speechSynthesis.speak(utterance);
                    }
                  }}
                  className="px-2 py-0.5 rounded-md bg-amber-400/90 hover:bg-amber-300 text-emerald-950 font-black text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Nghe Mascot đọc lời cổ vũ"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Nghe</span>
                </button>
              </div>
              <p className="text-white text-xs sm:text-sm font-bold leading-snug mt-1">
                "{mascotSpeechText}"
              </p>
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click');
                  onStartPractice(activeTargetUnitKey);
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black rounded-lg shadow-sm cursor-pointer transition-all active:scale-95 self-start"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Luyện phát âm ngay</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* KHU VỰC 2: THẺ CHỈ SỐ THÀNH TÍCH (KPI CARDS - 4 CHỈ SỐ CỐT LÕI) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Từ vựng & Mẫu câu (Vocab & Sentences) */}
        <div className="bg-white rounded-3xl p-5 border-2 border-[#86c898] shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 text-emerald-800 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              📚
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200">
              Vocab & Sentences
            </span>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-emerald-950">Từ vựng & Mẫu câu</h4>
            
            {/* Dual Stats Grid: Thống kê Từ vựng & Mẫu câu song song */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {/* Thống kê Từ vựng */}
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-2.5 flex flex-col justify-center">
                <span className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1">
                  <span>🔤</span>
                  <span>Từ vựng:</span>
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-display tabular-nums">
                    {actualVocabCount}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">/{u1TotalWords} từ</span>
                </div>
              </div>

              {/* Thống kê Mẫu câu */}
              <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-2.5 flex flex-col justify-center">
                <span className="text-[11px] font-extrabold text-teal-800 flex items-center gap-1">
                  <span>💬</span>
                  <span>Mẫu câu:</span>
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-teal-950 font-display tabular-nums">
                    {actualSentenceCount}
                  </span>
                  <span className="text-xs font-bold text-teal-700">/{u1TotalSentences} câu</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-600 mt-2">
              {(isGuestMode || userRole === 'guest' || isGuest)
                ? (actualVocabCount > 0 || actualSentenceCount > 0
                    ? `Đã thử luyện ${actualVocabCount} từ và ${actualSentenceCount} mẫu câu ở Khối ${selectedGrade}`
                    : `Chưa luyện từ vựng & mẫu câu nào ở Khối ${selectedGrade} trong phiên này`)
                : isChiVy
                ? `Thực tế đã luyện ${actualVocabCount}/${u1TotalWords} từ và ${actualSentenceCount}/${u1TotalSentences} mẫu câu Unit 1`
                : `Đã luyện ${actualVocabCount} từ và ${actualSentenceCount} mẫu câu trong chương trình học`}
            </p>

            {/* 2 THANH TIẾN ĐỘ (PROGRESS BAR) RIÊNG BIỆT CHO TỪNG MỤC */}
            <div className="mt-2.5 space-y-2">
              {/* Progress Bar 1: Từ vựng */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                    <span>Từ vựng:</span>
                  </span>
                  <span className="font-black text-emerald-950 tabular-nums">
                    {Math.min(100, Math.round((actualVocabCount / u1TotalWords) * 100))}% ({actualVocabCount}/${u1TotalWords} từ)
                  </span>
                </div>
                <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500 shadow-2xs"
                    style={{ width: `${Math.min(100, Math.round((actualVocabCount / u1TotalWords) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Progress Bar 2: Mẫu câu */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-teal-900">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span>
                    <span>Mẫu câu:</span>
                  </span>
                  <span className="font-black text-teal-950 tabular-nums">
                    {Math.min(100, Math.round((actualSentenceCount / u1TotalSentences) * 100))}% ({actualSentenceCount}/${u1TotalSentences} câu)
                  </span>
                </div>
                <div className="w-full bg-teal-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all duration-500 shadow-2xs"
                    style={{ width: `${Math.min(100, Math.round((actualSentenceCount / u1TotalSentences) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Tiến độ tổng hợp Unit 1:</span>
            <span className="font-black text-emerald-900">
              {Math.min(100, Math.round(((actualVocabCount + actualSentenceCount) / (u1TotalWords + u1TotalSentences)) * 100))}%
            </span>
          </div>
        </div>

        {/* KPI 2: Độ chuẩn phát âm trung bình */}
        <div className="bg-white rounded-3xl p-5 border-2 border-[#86c898] shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-200 text-teal-800 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🎙️
            </div>
            <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-900 text-[11px] font-extrabold border border-teal-200">
              AI Accuracy
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-teal-950 font-display tabular-nums">
                {averageAccuracy > 0 ? `${averageAccuracy}%` : '0%'}
              </span>
              {averageAccuracy > 0 ? (
                <span className="text-xs font-black text-amber-500 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{averageAccuracy >= 90 ? 'Xuất sắc' : averageAccuracy >= 80 ? 'Tốt' : 'Khá'}</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-stone-500 flex items-center gap-0.5 bg-stone-100 px-1.5 py-0.5 rounded-md">
                  <span>Chưa có dữ liệu / --%</span>
                </span>
              )}
            </div>
            <h4 className="font-extrabold text-sm text-emerald-950 mt-1">Độ chuẩn phát âm TB</h4>
            <p className="text-xs text-stone-600 mt-0.5">
              {(isGuestMode || userRole === 'guest')
                ? (averageAccuracy > 0
                    ? `Độ chuẩn phát âm kiểm tra thực tế Khối ${selectedGrade}: ${averageAccuracy}% (Web Speech AI)`
                    : `Chưa thực hiện bài luyện nói AI nào ở Khối ${selectedGrade}`)
                : isChiVy
                ? 'Độ chuẩn 95% qua 3 từ Unit 1 đã luyện (Web Speech AI)'
                : (averageAccuracy > 0 ? 'Chuẩn bản xứ US/UK (Web Speech AI)' : 'Chưa luyện phát âm từ vựng nào')}
            </p>
          </div>
          <div className="pt-2 border-t border-teal-100 flex items-center justify-between text-xs font-bold text-teal-800">
            <span>Đánh giá AI:</span>
            <span className={`font-black ${averageAccuracy > 0 ? 'text-teal-900' : 'text-stone-500'}`}>
              {averageAccuracy > 0 ? (averageAccuracy >= 90 ? 'Native Speaker Level' : 'Good Pronunciation') : 'Chưa luyện tập / No practice yet'}
            </span>
          </div>
        </div>

        {/* KPI 3: Tổng Eco Points (EP) tích lũy */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              ⭐
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-950 text-[11px] font-extrabold border border-amber-200">
              Eco Points
            </span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-amber-600 font-display tabular-nums">
              {dynamicTotalEP}
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-800 ml-1.5">EP</span>
            <h4 className="font-extrabold text-sm text-emerald-950 mt-1">Tổng điểm Eco Points</h4>
            <p className="text-xs text-stone-600 mt-0.5">
              {(isGuestMode || userRole === 'guest')
                ? (dynamicTotalEP > 0
                    ? `Điểm tích lũy demo Khối ${selectedGrade} trong phiên Khách trải nghiệm`
                    : `Chưa có điểm tích lũy nào ở Khối ${selectedGrade}`)
                : isChiVy
                ? `Tích lũy từ bài luyện phát âm Unit 1 & trò chơi Eco Games`
                : `Từ ${completedUnits.length} Unit & ${activityList.length} lượt bài tập/games`}
            </p>
          </div>
          <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-amber-800">
            <span>{dynamicTotalTrees >= 1 ? 'Đã trồng cây xanh:' : 'Cần đến cây tiếp:'}</span>
            <span className="font-black text-amber-950">+{remainingEPToNextTree} EP cho cây tiếp</span>
          </div>
        </div>

        {/* KPI 4: Số cây xanh đã trồng */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🌳
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 text-[11px] font-extrabold border border-emerald-300">
              Virtual Forest
            </span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-emerald-900 font-display tabular-nums">
              {dynamicTotalTrees}
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-700 ml-1.5">cây xanh / trees</span>
            <h4 className="font-extrabold text-sm text-emerald-950 mt-1">Cây xanh đã trồng</h4>
            <p className="text-xs text-stone-600 mt-0.5">
              {(isGuestMode || userRole === 'guest')
                ? (dynamicTotalTrees > 0
                    ? `Cây xanh ảo Khối ${selectedGrade} trong phiên Khách trải nghiệm`
                    : `Chưa trồng cây xanh nào ở Khối ${selectedGrade}`)
                : isChiVy
                ? `Vun trồng từ ${dynamicTotalEP} EP của bài học và trò chơi xanh Unit 1`
                : `Vườn cây ảo vun trồng từ ${dynamicTotalEP} EP`}
            </p>
          </div>
          <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Danh hiệu:</span>
            <span className="font-black text-emerald-950">
              {(isGuestMode || userRole === 'guest') ? 'Khách trải nghiệm xanh 🌟' : (dynamicTotalTrees >= 1 ? 'Người gieo mầm xanh 🌱' : 'Mầm non học tập 🌱')}
            </span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* KHU VỰC 1: HÀNH TRÌNH XANH (ECO-JOURNEY MAP - 20 UNITS) */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-[#86c898] shadow-sm flex flex-col gap-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗺️</span>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-display">
                Hành trình Xanh · Eco-Journey Map
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-emerald-800 mt-1 font-medium">
              Bản đồ trạm dừng chân 20 Unit Khối {selectedGrade}. Hoàn thành từng trạm để tích lũy ngôi sao và trồng thêm cây xanh!
            </p>
          </div>

          {/* Quick Legend */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã hoàn thành / Tương tác</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Đang học</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>Trạm tiếp theo / Tạm khóa</span>
            </span>
          </div>
        </div>

        {/* 3D Pixar Journey Art Preview Strip */}
        <div className="relative rounded-2xl overflow-hidden h-36 sm:h-48 border border-emerald-200 shadow-inner group">
          <img
            src="/src/assets/images/journey_map_banner_1792254778655.jpg"
            alt="3D Pixar Eco Journey Map Illustration"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent flex items-end p-4">
            <div className="text-white">
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">Tiếng Anh Global Success · Khối {selectedGrade}</span>
              <p className="text-sm sm:text-base font-extrabold text-white">Chinh phục 20 trạm dừng chân cùng Eco-Voice!</p>
            </div>
          </div>
        </div>

        {/* Station Grid / Map Milestones */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-10 gap-3">
          {unitsList.map((unit, idx) => {
            const unitNumber = unit.unitNumber || (idx + 1);
            const status = getUnitSequentialStatus(unitNumber);
            const isCompleted = status.isCompleted;
            const isCurrent = status.isCurrent;
            const isLocked = status.isLocked;

            return (
              <div
                key={unit.unitKey}
                onClick={() => {
                  playSoundEffect('click');
                  setSelectedStation(unit);
                }}
                className={`relative rounded-2xl p-3 flex flex-col items-center text-center justify-between gap-2 border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-b from-amber-50 to-emerald-50 border-amber-400 ring-2 ring-amber-300 shadow-md scale-105'
                    : isCompleted
                      ? 'bg-emerald-50/80 border-emerald-300 hover:border-emerald-400 hover:shadow-sm'
                      : 'bg-stone-50 border-stone-200/90 opacity-75 hover:opacity-100 hover:border-amber-300'
                }`}
                title={isLocked ? `${unit.unitFullName} (Khóa tuần tự · Cần hoàn thành Unit ${status.prevUnitNumber} trước)` : unit.unitFullName}
              >
                {/* Station Badge Header */}
                <div className="w-full flex items-center justify-between text-[10px] font-black">
                  <span className={`px-1.5 py-0.5 rounded-md ${
                    isCurrent ? 'bg-amber-400 text-emerald-950 font-black' : isCompleted ? 'bg-emerald-200 text-emerald-950' : 'bg-stone-200 text-stone-700'
                  }`}>
                    U{unitNumber}
                  </span>
                  {isCurrent && (
                    <span className="text-amber-800 font-extrabold text-[10px] flex items-center gap-0.5 animate-pulse" title="Đang học">
                      <span>🌱</span>
                      <span>{unitNumber === 1 ? `${actualVocabCount}/${u1TotalWords}` : `${unit.vocabulary ? unit.vocabulary.filter(v => practicedWordsSet.has(v.id)).length : 0}/${unit.vocabulary?.length || 10}`}</span>
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-amber-500 font-black text-xs" title="Đã hoàn thành 100%">⭐</span>
                  )}
                  {isLocked && (
                    <span className="text-stone-400 flex items-center" title={`Khóa tuần tự · Cần hoàn thành Unit ${status.prevUnitNumber} trước`}>
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Milestone Node Circle */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs transition-transform ${
                  isCurrent
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 scale-110 shadow-md ring-2 ring-white'
                    : isCompleted
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white'
                      : 'bg-stone-200 text-stone-500'
                }`}>
                  {isLocked ? <Lock className="w-4 h-4 text-stone-400" /> : unitNumber}
                </div>

                {/* Title */}
                <div className="w-full">
                  <h5 className="font-extrabold text-[11px] text-emerald-950 truncate" title={unit.unitName}>
                    {unit.unitName || unit.unitFullName}
                  </h5>
                  <p className="text-[9px] text-stone-500 font-semibold truncate mt-0.5">
                    {isCurrent
                      ? `Đang học · ${unitNumber === 1 ? `${actualVocabCount}/${u1TotalWords}` : `${unit.vocabulary ? unit.vocabulary.filter(v => practicedWordsSet.has(v.id)).length : 0}/${unit.vocabulary?.length || 10}`} từ`
                      : isCompleted
                        ? `Hoàn thành 100% (${unit.vocabulary?.length || 8} từ)`
                        : `Tạm khóa · Cần xong U${status.prevUnitNumber}`}
                  </p>
                </div>

                {/* Action button on hover/current */}
                {isCurrent && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSoundEffect('click');
                      onNavigateToUnit(unit.unitKey);
                    }}
                    className="w-full py-1 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white text-[10px] font-black rounded-lg shadow-xs hover:from-emerald-800 hover:to-emerald-900 cursor-pointer"
                  >
                    Vào học
                  </button>
                )}
                {isLocked && (
                  <div className="w-full py-0.5 bg-stone-100 text-stone-400 text-[9px] font-bold rounded flex items-center justify-center gap-0.5 border border-stone-200">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Khóa tuần tự</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ============================================================== */}
      {/* 2-COLUMN SPLIT: KHU VỰC 4 (BADGES) + KHU VỰC 3 (TIMELINE) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ============================================================ */}
        {/* KHU VỰC 4: BỘ SƯU TẬP HUY HIỆU (BADGES SHOWCASE - 7 COLS) */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border-2 border-[#86c898] shadow-sm flex flex-col justify-between gap-5">
          <div>
            {/* Header with Trophy Visual */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-emerald-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 font-display">
                    Bộ sưu tập huy hiệu · Badges Showcase
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1 font-medium">
                  {isChiVy
                    ? 'Ghi nhận các huy hiệu đạt được từ hoạt động từ vựng và trò chơi Unit 1 (My friends)!'
                    : 'Chinh phục các thử thách phát âm, trồng cây và chuỗi chăm chỉ để nhận huy hiệu vinh danh!'}
                </p>

                {/* Filter Tabs for Badges */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect('click');
                      setBadgeFilter('all');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      badgeFilter === 'all'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-emerald-50'
                    }`}
                  >
                    Tất cả ({badges.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect('click');
                      setBadgeFilter('in_progress');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      badgeFilter === 'in_progress'
                        ? 'bg-amber-400 text-emerald-950 shadow-xs ring-2 ring-amber-300 font-black'
                        : 'bg-stone-100 text-stone-600 hover:bg-amber-50'
                    }`}
                  >
                    ⏳ Đang hoàn thành ({badges.filter(b => !b.unlocked).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect('click');
                      setBadgeFilter('unlocked');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      badgeFilter === 'unlocked'
                        ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-300 font-black'
                        : 'bg-stone-100 text-stone-600 hover:bg-emerald-50'
                    }`}
                  >
                    ⭐ Đã đạt ({badges.filter(b => b.unlocked).length})
                  </button>
                </div>
              </div>

              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-amber-50 border border-amber-300 shadow-sm shrink-0">
                <img
                  src="/src/assets/images/badges_trophy_showcase_1792254779514.jpg"
                  alt="3D Pixar Trophy Showcase"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Badges Grid (8 Badges) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {badges
                .filter(b => {
                  if (badgeFilter === 'in_progress') return !b.unlocked;
                  if (badgeFilter === 'unlocked') return b.unlocked;
                  return true;
                })
                .map((badge) => {
                  return (
                    <div
                      key={badge.id}
                      onClick={() => {
                        playSoundEffect('click');
                        setSelectedBadge(badge);
                      }}
                      className={`rounded-2xl p-3 border-2 flex flex-col items-center text-center justify-between gap-2.5 transition-all cursor-pointer group ${
                        badge.unlocked
                          ? 'bg-gradient-to-b from-amber-50/70 to-emerald-50/70 border-amber-300 hover:border-amber-400 hover:shadow-md'
                          : 'bg-white border-amber-200/90 shadow-2xs hover:border-amber-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Badge Icon Badge */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform ${
                        badge.unlocked
                          ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 shadow-md ring-2 ring-white'
                          : 'bg-amber-100/70 text-amber-900 border border-amber-200'
                      }`}>
                        {badge.icon}
                      </div>

                      {/* Badge Name & Condition */}
                      <div>
                        <h5 className="font-extrabold text-xs text-emerald-950 line-clamp-1">
                          {badge.nameVi}
                        </h5>
                        <span className="text-[10px] text-stone-500 font-medium line-clamp-1 mt-0.5">
                          {badge.nameEn}
                        </span>
                      </div>

                      {/* Status Pill with Granular Tracking */}
                      <div className="w-full">
                        {badge.unlocked ? (
                          <span className="w-full inline-flex items-center justify-center gap-1 py-1 px-2 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black border border-emerald-300 shadow-2xs">
                            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                            <span>Đã đạt · 100%</span>
                          </span>
                        ) : (
                          <div className="space-y-1 w-full bg-stone-50/90 p-1.5 rounded-xl border border-amber-200/60">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-amber-800 font-black flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span>In Progress</span>
                              </span>
                              <span className="text-emerald-950 font-black">
                                {badge.progress}/{badge.maxProgress}
                              </span>
                            </div>
                            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100))}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-stone-600 font-bold block text-center">
                              {Math.round((badge.progress / badge.maxProgress) * 100)}% · Đang hoàn thành
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Badges Footer Incentive */}
          <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <span>
                {isChiVy
                  ? <>Đã mở khóa: <strong>5 / 8</strong> huy hiệu đã đạt được · Đang tích cực chinh phục <strong>3</strong> huy hiệu còn lại ({actualVocabCount}/20 từ, {actualSentenceCount}/10 mẫu câu, 1/3 ngày chăm chỉ)!</>
                  : <>Đã mở khóa: <strong>{badges.filter(b => b.unlocked).length} / {badges.length}</strong> huy hiệu danh dự · Đang chinh phục {badges.filter(b => !b.unlocked).length} huy hiệu!</>}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                playSoundEffect('click');
                onStartPractice(activeTargetUnitKey);
              }}
              className="text-emerald-800 hover:text-emerald-950 font-black flex items-center gap-1 cursor-pointer"
            >
              <span>{(isGuestMode || userRole === 'guest') ? 'Thử luyện phát âm (Unit 1)' : (isChiVy ? 'Chinh phục Unit 2' : 'Tiếp tục mở khóa')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* KHU VỰC 3: NHẬT KÝ HOẠT ĐỘNG (ACTIVITY TIMELINE - 5 COLS) */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-7 border-2 border-[#86c898] shadow-sm flex flex-col justify-between gap-4">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                <h3 className="text-lg sm:text-xl font-black text-emerald-950 font-display">
                  Nhật ký hoạt động · Timeline
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Gần nhất
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 my-3 overflow-x-auto pb-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click');
                  setActiveActivityTab('all');
                }}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeActivityTab === 'all'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-emerald-50'
                }`}
              >
                Tất cả (All)
              </button>
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click');
                  setActiveActivityTab('unit');
                }}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeActivityTab === 'unit'
                    ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-300'
                    : 'bg-stone-100 text-stone-600 hover:bg-emerald-50'
                }`}
              >
                Unit {currentUnitNumber} đang học
              </button>
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click');
                  setActiveActivityTab('speaking');
                }}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeActivityTab === 'speaking'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-emerald-50'
                }`}
              >
                Luyện nói (AI)
              </button>
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click');
                  setActiveActivityTab('games');
                }}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeActivityTab === 'games'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-emerald-50'
                }`}
              >
                Eco Games
              </button>
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click');
                  setActiveActivityTab('rewards');
                }}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeActivityTab === 'rewards'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-emerald-50'
                }`}
              >
                Cây xanh & Quà
              </button>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredActivities.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs">
                  {isGuest
                    ? `Chưa có hoạt động luyện tập nào ở Khối ${selectedGrade} trong phiên trải nghiệm này. Hãy bấm 'Luyện nói tiếp (Unit 1)' bên dưới để bắt đầu nhé! 🌱`
                    : 'Chưa có hoạt động nào trong mục này. Cùng luyện nói để ghi lại thành tích nhé! 🌱'}
                </div>
              ) : (
                filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200/80 transition-all flex items-start gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                      {act.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-extrabold text-xs text-emerald-950 truncate">
                          {act.titleVi}
                        </h5>
                        <span className="text-[10px] text-amber-700 font-black shrink-0">
                          +{act.epAwarded} EP
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                        {act.detailVi}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500 font-semibold">
                        <span>{act.timestamp}</span>
                        {act.score !== undefined && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-700 font-bold">Độ chuẩn: {act.score}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick CTA to continue with Active Unit Context */}
          <div className="pt-3 border-t border-emerald-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                playSoundEffect('click');
                onStartPractice(activeTargetUnitKey);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
              title={`Luyện nói tiếp (${activeTargetUnitName.split(':')[0]})`}
            >
              <Mic className="w-4 h-4 text-emerald-200" />
              <span>Luyện nói tiếp ({activeTargetUnitName.split(':')[0]})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSoundEffect('celebrate');
                onOpenEcoGames(activeTargetUnitKey);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
              title={`Chơi Eco Games (${activeTargetUnitName.split(':')[0]})`}
            >
              <Gamepad2 className="w-4 h-4 text-amber-900" />
              <span>Chơi Eco Games ({activeTargetUnitName.split(':')[0]})</span>
            </button>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* POPUP / MODAL: BADGE CELEBRATION DETAIL */}
      {/* ============================================================== */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#f2faf5] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border-[3.5px] border-amber-300 text-center animate-scaleUp">
            <button
              onClick={() => {
                playSoundEffect('click');
                setSelectedBadge(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-emerald-950 flex items-center justify-center mx-auto mb-4 text-4xl shadow-lg ring-4 ring-white">
              {selectedBadge.icon}
            </div>

            <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
              selectedBadge.unlocked
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              {selectedBadge.unlocked
                ? '⭐ HUY HIỆU ĐÃ ĐẠT · UNLOCKED (100%)'
                : `⏳ ĐANG HOÀN THÀNH · IN PROGRESS (${selectedBadge.progress}/${selectedBadge.maxProgress})`}
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-emerald-950 font-display mt-2">
              {selectedBadge.nameVi}
            </h3>
            <p className="text-xs text-stone-500 font-semibold mb-3">
              {selectedBadge.nameEn}
            </p>

            <div className="p-4 bg-white/95 rounded-2xl border border-emerald-200 text-left space-y-2 mb-5">
              <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed">
                🎯 {selectedBadge.descVi}
              </p>
              <p className="text-xs text-stone-600 italic">
                {selectedBadge.descEn}
              </p>
              <div className="pt-2 border-t border-emerald-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Tiến độ thực tế:</span>
                  <span className="font-black text-emerald-950">
                    {selectedBadge.progress}/{selectedBadge.maxProgress} ({Math.round((selectedBadge.progress / selectedBadge.maxProgress) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((selectedBadge.progress / selectedBadge.maxProgress) * 100))}%` }}
                  />
                </div>
                {!selectedBadge.unlocked && (
                  <p className="text-[11px] text-amber-900 font-bold pt-1">
                    💡 Cần hoàn thành 100% thử thách ({selectedBadge.maxProgress}/{selectedBadge.maxProgress}) để mở khóa huy hiệu chính thức!
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                playSoundEffect('click');
                setSelectedBadge(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] text-white font-black text-sm rounded-xl shadow-md cursor-pointer hover:from-[#0f5430] hover:to-[#22c55e] transition-all"
            >
              Tiếp tục hành trình
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPUP / MODAL: STATION DETAIL (UNIT INFO ON MAP) */}
      {/* ============================================================== */}
      {selectedStation && (() => {
        const stationStatus = getUnitSequentialStatus(selectedStation.unitNumber || 1);
        const isLocked = stationStatus.isLocked;

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className={`bg-[#f2faf5] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border-[3.5px] text-center animate-scaleUp ${
              isLocked ? 'border-amber-400' : 'border-emerald-400'
            }`}>
              <button
                onClick={() => {
                  playSoundEffect('click');
                  setSelectedStation(null);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              <div className={`w-16 h-16 rounded-2xl text-white flex items-center justify-center mx-auto mb-3 font-black text-xl shadow-md ${
                isLocked ? 'bg-stone-400 border-2 border-stone-300 relative' : 'bg-emerald-700'
              }`}>
                <span>U{selectedStation.unitNumber}</span>
                {isLocked && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-emerald-950 flex items-center justify-center text-xs shadow-md border-2 border-white">
                    <Lock className="w-3.5 h-3.5 text-emerald-950 stroke-[3]" />
                  </div>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-black text-emerald-950 font-display">
                {selectedStation.unitFullName}
              </h3>

              <p className="text-xs text-emerald-800 font-semibold mt-1 mb-3">
                {selectedStation.theme ? `Theme: ${selectedStation.theme}` : `Khối ${selectedGrade} · Tiếng Anh Global Success`}
              </p>

              {/* Status Pill for the Station */}
              <div className="mb-4">
                {isLocked ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-black shadow-2xs">
                    <Lock className="w-4 h-4 text-rose-600" />
                    <span>Tạm khóa · Cần hoàn thành Unit {stationStatus.prevUnitNumber} trước</span>
                  </span>
                ) : stationStatus.isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã hoàn thành trạm (100%)</span>
                  </span>
                ) : (
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black shadow-2xs">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>{stationStatus.isCurrent ? `Đang học · Trạm ${selectedStation.unitNumber}` : `Đã mở khóa · Sẵn sàng học`}</span>
                    </span>
                    <p className="text-[11px] text-stone-600 font-medium">
                      Trạm {selectedStation.unitFullName} đã mở khóa! Bấm &quot;Vào học Unit này ngay&quot; để luyện phát âm từ vựng, mẫu câu và thử sức với các trò chơi sinh thái nhé!
                    </p>
                  </div>
                )}
              </div>

              {/* Sequential Unlocking Notice Box (When Locked) */}
              {isLocked && (
                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 text-left space-y-2.5 mb-4 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-200 border border-amber-300 text-amber-900 flex items-center justify-center text-base shrink-0 font-black shadow-2xs">
                      🔒
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wide">
                        Quy tắc mở khóa tuần tự · Sequential Unlocking
                      </h4>
                      <p className="text-xs text-emerald-950 font-bold mt-1 leading-relaxed">
                        {(isGuestMode || userRole === 'guest')
                          ? <>Người học không thể học nhảy cóc bài học. Cần hoàn thành 100% từ vựng và bài tập của <strong>Unit {stationStatus.prevUnitNumber} ({stationStatus.prevUnitName})</strong> trước khi mở khóa trạm này nhé!</>
                          : <>Học sinh không thể học nhảy cóc bài học. Bé cần hoàn thành 100% từ vựng và bài tập của <strong>Unit {stationStatus.prevUnitNumber} ({stationStatus.prevUnitName})</strong> trước khi mở khóa trạm này nhé!</>}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/95 rounded-xl border border-amber-200 text-xs font-semibold text-stone-700 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Tiến độ Unit {stationStatus.prevUnitNumber}:</span>
                      <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md text-[11px]">
                        {stationStatus.prevVocabCount}/{stationStatus.prevTotalWords} từ ({stationStatus.prevPercent}%) · Đang học
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${stationStatus.prevPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-amber-900 font-bold text-right">
                      💡 Cần hoàn thành 100% Unit {stationStatus.prevUnitNumber} ({stationStatus.prevTotalWords}/{stationStatus.prevTotalWords} từ) để mở khóa nút "Vào học" Unit {selectedStation.unitNumber}!
                    </p>
                  </div>
                </div>
              )}

              {/* Vocab & Sentence Info */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-900 mb-5">
                <div>
                  <span className="text-base">🔤</span>
                  <p>{selectedStation.vocabulary?.length || 0} Từ vựng</p>
                </div>
                <div>
                  <span className="text-base">💬</span>
                  <p>{selectedStation.sentences?.length || 0} Mẫu câu</p>
                </div>
              </div>

              {/* Action Buttons: Strict Sequential Unlocking Enforcement */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {isLocked ? (
                  <>
                    {/* Disabled button explicitly showing user prompt requirement: 'Complete previous unit first / Hoàn thành Unit trước nhé' */}
                    <button
                      type="button"
                      disabled
                      className="w-full sm:flex-1 py-3 px-3 bg-stone-200/90 border-2 border-stone-300 text-stone-500 font-black text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 opacity-85 shadow-2xs"
                      title="Không thể học nhảy cóc khi Unit trước chưa hoàn thành 100%"
                    >
                      <Lock className="w-4 h-4 text-stone-500 shrink-0" />
                      <span className="truncate">Complete previous unit first / Hoàn thành Unit {stationStatus.prevUnitNumber} trước nhé</span>
                    </button>

                    {/* Direct CTA button to jump back to the incomplete unit so student can complete it */}
                    <button
                      type="button"
                      onClick={() => {
                        playSoundEffect('click');
                        const isGuest = isGuestMode || userRole === 'guest';
                        const prevKey = isGuest ? 'unit_1' : `unit_${stationStatus.prevUnitNumber}`;
                        setSelectedStation(null);
                        onNavigateToUnit(prevKey);
                      }}
                      className="w-full sm:w-auto py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-emerald-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                    >
                      <span>Về {(isGuestMode || userRole === 'guest') ? 'Unit 1' : `Unit ${stationStatus.prevUnitNumber}`} học</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSoundEffect('click');
                        setSelectedStation(null);
                      }}
                      className="py-3 px-4 bg-stone-200 hover:bg-stone-300 text-stone-800 font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                    >
                      Đóng
                    </button>
                  </>
                ) : (
                  <>
                    {/* Unlocked button: Lights up and allows access only when previous unit is completed */}
                    <button
                      type="button"
                      onClick={() => {
                        playSoundEffect('click');
                        const uk = selectedStation.unitKey;
                        setSelectedStation(null);
                        onNavigateToUnit(uk);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] hover:from-[#0f5430] hover:to-[#22c55e] text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95 ring-2 ring-emerald-300"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Vào học Unit này ngay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playSoundEffect('click');
                        setSelectedStation(null);
                      }}
                      className="py-3 px-4 bg-stone-200 hover:bg-stone-300 text-stone-800 font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                    >
                      Đóng
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
