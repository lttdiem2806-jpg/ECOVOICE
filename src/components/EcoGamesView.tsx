import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  ChevronDown, 
  Play, 
  Volume2, 
  Mic, 
  RotateCcw, 
  ArrowLeft, 
  X,
  Sparkles,
  Sprout
} from 'lucide-react';
import { GrowTreeGame } from './GrowTreeGame';
import { CleanOceanGame } from './CleanOceanGame';
import { SortRubbishGame } from './SortRubbishGame';
import { SaveWaterGame } from './SaveWaterGame';
import { AnimalHomesGame } from './AnimalHomesGame';
import { CleanEnergyGame } from './CleanEnergyGame';
import { EcoGardenTrailGame } from './EcoGardenTrailGame';

export interface GameItem {
  id: string;
  titleEn: string;
  titleVi: string;
  gameplayDesc: string;
  badge: string;
  themeColor: string;
  bgGradient: string;
  borderColor: string;
  icon: string;
  characterEmoji: string;
}

export const ECO_GAMES_LIST: GameItem[] = [
  {
    id: 'grow-tree',
    titleEn: 'Grow a Tree',
    titleVi: 'Trồng cây',
    gameplayDesc: 'Luyện nói để cây lớn.',
    badge: '🎙️ Luyện nói',
    themeColor: '#15803d',
    bgGradient: 'from-emerald-50 to-green-100',
    borderColor: '#86efac',
    icon: '🌳',
    characterEmoji: '🌱'
  },
  {
    id: 'clean-ocean',
    titleEn: 'Clean the Ocean',
    titleVi: 'Làm sạch biển',
    gameplayDesc: 'Nghe và chọn tranh.',
    badge: '🎧 Luyện nghe',
    themeColor: '#0284c7',
    bgGradient: 'from-sky-50 to-cyan-100',
    borderColor: '#7dd3fc',
    icon: '🌊',
    characterEmoji: '🐢'
  },
  {
    id: 'sort-rubbish',
    titleEn: 'Sort the Rubbish',
    titleVi: 'Phân loại rác',
    gameplayDesc: 'Kéo thả và luyện nói.',
    badge: '♻️ Phân loại rác',
    themeColor: '#d97706',
    bgGradient: 'from-amber-50 to-orange-100',
    borderColor: '#fcd34d',
    icon: '🗑️',
    characterEmoji: '♻️'
  },
  {
    id: 'save-water',
    titleEn: 'Save Water',
    titleVi: 'Giải cứu giọt nước',
    gameplayDesc: 'Ghép từ thành câu.',
    badge: '🧩 Ghép câu',
    themeColor: '#0ea5e9',
    bgGradient: 'from-blue-50 to-sky-100',
    borderColor: '#93c5fd',
    icon: '💧',
    characterEmoji: '🚰'
  },
  {
    id: 'animal-homes',
    titleEn: 'Animal Homes',
    titleVi: 'Tìm nhà cho bạn thú',
    gameplayDesc: 'Nghe & đọc to từ tìm nhà.',
    badge: '🎙️ Nghe & Ghi âm',
    themeColor: '#16a34a',
    bgGradient: 'from-lime-50 to-emerald-100',
    borderColor: '#bef264',
    icon: '🐾',
    characterEmoji: '🐶'
  },
  {
    id: 'clean-energy',
    titleEn: 'Clean Energy',
    titleVi: 'Năng lượng sạch',
    gameplayDesc: 'Mô phỏng tuabin gió & pin mặt trời, nghe và chọn đáp án đúng.',
    badge: '⚡ Năng lượng tái tạo',
    themeColor: '#eab308',
    bgGradient: 'from-yellow-50 to-amber-100',
    borderColor: '#fde047',
    icon: '☀️',
    characterEmoji: '💨'
  },
  {
    id: 'flower-trail',
    titleEn: 'Eco Garden Trail',
    titleVi: 'Con đường vườn sinh thái',
    gameplayDesc: 'Nghe phát âm và tự điền từ/mẫu câu để phủ xanh đường mòn hoa.',
    badge: '🌸 Nghe & Điền từ',
    themeColor: '#ec4899',
    bgGradient: 'from-pink-50 to-rose-100',
    borderColor: '#f9a8d4',
    icon: '🌸',
    characterEmoji: '🦋'
  }
];

interface EcoGamesViewProps {
  selectedGrade: string;
  onGradeChange: (g: string) => void;
  selectedUnitKey: string;
  onUnitChange: (uKey: string) => void;
  availableUnits: Array<{ unitKey: string; unitNumber: number; unitFullName: string }>;
  selectedLesson: string;
  onLessonChange: (lTitle: string) => void;
  availableLessons: Array<{ lessonNumber: number; lessonTitle: string; theme?: string }>;
  currentUnitData: any;
  playSoundEffect: (name: 'chime' | 'success' | 'click' | 'celebrate' | 'fail') => void;
  onAwardEP: (ep: number) => void;
  onBackToLessons: () => void;
  totalUserTrees?: number;
  onAwardTree?: () => void;
  initialGameId?: string | null;
  onClearInitialGame?: () => void;
  onOpenGarden?: () => void;
}

export const EcoGamesView: React.FC<EcoGamesViewProps> = ({
  selectedGrade,
  onGradeChange,
  selectedUnitKey,
  onUnitChange,
  availableUnits,
  selectedLesson,
  onLessonChange,
  availableLessons,
  currentUnitData,
  playSoundEffect,
  onAwardEP,
  onBackToLessons,
  totalUserTrees = 0,
  onAwardTree,
  initialGameId,
  onClearInitialGame,
  onOpenGarden
}) => {
  // Active playing game state
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [totalRounds, setTotalRounds] = useState<number>(4);
  const [, setGameScore] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Question specific states
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [treeGrowthStage, setTreeGrowthStage] = useState<number>(1);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedPairLeft, setSelectedPairLeft] = useState<string | null>(null);
  const [selectedPairRight, setSelectedPairRight] = useState<string | null>(null);

  // Extract vocabulary and sentences for current lesson
  const vocabList: any[] = React.useMemo(() => {
    if (!currentUnitData?.vocabulary) return [];
    const lessonVocabs = currentUnitData.vocabulary.filter((v: any) => v.lesson === selectedLesson);
    return lessonVocabs.length > 0 ? lessonVocabs : currentUnitData.vocabulary;
  }, [currentUnitData, selectedLesson]);

  const sentenceList: any[] = React.useMemo(() => {
    if (!currentUnitData?.sentences) return [];
    const lessonSentences = currentUnitData.sentences.filter((s: any) => s.lesson === selectedLesson);
    return lessonSentences.length > 0 ? lessonSentences : currentUnitData.sentences;
  }, [currentUnitData, selectedLesson]);

  // Current item for the round
  const currentVocab = vocabList[currentRound % Math.max(1, vocabList.length)] || {
    word: 'GREEN',
    phonetic: '/ɡriːn/',
    meaning: 'Màu xanh lá cây',
    speechText: 'Green',
    colorHex: '#10b981',
    icon: '🍃',
    sentence: 'The tree is green.',
    sentenceVi: 'Cây có màu xanh lá.'
  };

  const currentSentence = sentenceList[currentRound % Math.max(1, sentenceList.length)] || {
    structure: 'What colour is it? - It is green.',
    meaning: 'Hỏi và đáp về màu sắc',
    example: 'What colour is it? - It is green.',
    exampleVi: 'Nó màu gì? - Nó có màu xanh lá.',
    speechText: 'What colour is it? It is green.'
  };

  // TTS Voice helper
  const speakWord = (text: string) => {
    playSoundEffect('click');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const setupScramble = (roundIndex: number) => {
    const s = sentenceList[roundIndex % Math.max(1, sentenceList.length)] || currentSentence;
    const exampleText = (s.example || 'It is green.').trim();
    const endingMatch = exampleText.match(/[.?!。？！]+$/);
    const endingPunctuation = endingMatch ? endingMatch[0] : '.';

    const rawTokens = exampleText.replace(/\s+/g, ' ').split(' ').filter(Boolean);
    const words = rawTokens
      .map((token: string) => token.replace(/^[^\w']+|[^\w']+$/gu, '').trim())
      .filter((w: string) => Boolean(w) && /[a-zA-Z0-9]/.test(w));

    if (words.length > 0) {
      // Attach ending punctuation directly to the LAST word (e.g. "green." or "Britain.")
      words[words.length - 1] = `${words[words.length - 1]}${endingPunctuation}`;
    }

    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setScrambledWords(shuffled);
    setSelectedWords([]);
  };

  // Launch a game
  const handleLaunchGame = (game: GameItem) => {
    playSoundEffect('celebrate');
    setActiveGame(game);
    setCurrentRound(0);
    setGameScore(0);
    setGameFinished(false);
    setFeedbackMsg(null);
    setTreeGrowthStage(1);
    setSelectedWords([]);
    setMatchedPairs([]);

    // Determine total rounds (3-5 questions)
    const count = Math.min(5, Math.max(3, vocabList.length));
    setTotalRounds(count);

    // If Save Water (sentence puzzle), prepare scrambled words
    if (game.id === 'save-water') {
      setupScramble(0);
    }
  };

  // Launch initial game if passed via props
  React.useEffect(() => {
    if (initialGameId) {
      const target = ECO_GAMES_LIST.find(g => g.id === initialGameId);
      if (target) {
        handleLaunchGame(target);
      }
      if (onClearInitialGame) {
        onClearInitialGame();
      }
    }
  }, [initialGameId]);

  // Advance to next round or finish
  const handleNextRound = () => {
    const next = currentRound + 1;
    if (next >= totalRounds) {
      setGameFinished(true);
      playSoundEffect('celebrate');
      onAwardEP(30);
      if (onAwardTree) onAwardTree();
    } else {
      setCurrentRound(next);
      setFeedbackMsg(null);
      if (activeGame?.id === 'save-water') {
        setupScramble(next);
      }
    }
  };

  // Dedicated 2-column game screen for "Grow a Tree"
  if (activeGame?.id === 'grow-tree') {
    return (
      <GrowTreeGame
        selectedUnitName={currentUnitData?.unitFullName || 'Unit 1 - Hello'}
        selectedLessonName={selectedLesson}
        vocabularyList={vocabList}
        onBackToGames={() => setActiveGame(null)}
        playSoundEffect={playSoundEffect}
        onAwardEP={onAwardEP}
        onAwardTree={onAwardTree || (() => onAwardEP(30))}
        totalUserTrees={totalUserTrees}
        onOpenGarden={onOpenGarden}
      />
    );
  }

  // Dedicated interactive ocean screen for "Clean the Ocean" (Game 2)
  if (activeGame?.id === 'clean-ocean') {
    return (
      <CleanOceanGame
        selectedUnitName={currentUnitData?.unitFullName || 'Unit 1 - Hello'}
        selectedLessonName={selectedLesson}
        vocabularyList={vocabList}
        sentenceList={sentenceList}
        allUnitVocabularies={currentUnitData?.vocabulary || []}
        allUnitSentences={currentUnitData?.sentences || []}
        onBackToGames={() => setActiveGame(null)}
        playSoundEffect={playSoundEffect}
        onAwardEP={onAwardEP}
        onAwardTree={onAwardTree}
        totalUserTrees={totalUserTrees}
        onOpenGarden={onOpenGarden}
      />
    );
  }

  // Dedicated interactive recycling station for "Sort the Rubbish" (Game 3)
  if (activeGame?.id === 'sort-rubbish') {
    return (
      <SortRubbishGame
        selectedUnitName={currentUnitData?.unitFullName || 'Unit 1 - Hello'}
        selectedLessonName={selectedLesson}
        vocabularyList={vocabList}
        sentenceList={sentenceList}
        allUnitVocabularies={currentUnitData?.vocabulary || []}
        allUnitSentences={currentUnitData?.sentences || []}
        onBackToGames={() => setActiveGame(null)}
        playSoundEffect={playSoundEffect}
        onAwardEP={onAwardEP}
        onAwardTree={onAwardTree}
        totalUserTrees={totalUserTrees}
        onOpenGarden={onOpenGarden}
      />
    );
  }

  // Dedicated interactive screen for "Save Water" (Game 4)
  if (activeGame?.id === 'save-water') {
    return (
      <SaveWaterGame
        selectedUnitName={currentUnitData?.unitFullName || 'Unit 1 - Hello'}
        selectedLessonName={selectedLesson}
        vocabularyList={vocabList}
        sentenceList={sentenceList}
        allUnitVocabularies={currentUnitData?.vocabulary || []}
        allUnitSentences={currentUnitData?.sentences || []}
        onBackToGames={() => setActiveGame(null)}
        playSoundEffect={playSoundEffect}
        onAwardEP={onAwardEP}
        onAwardTree={onAwardTree}
        totalUserTrees={totalUserTrees}
        onOpenGarden={onOpenGarden}
      />
    );
  }

  // Dedicated interactive sanctuary screen for "Animal Homes" (Game 5)
  if (activeGame?.id === 'animal-homes') {
    return (
      <AnimalHomesGame
        selectedUnitName={currentUnitData?.unitFullName || 'Unit 1 - Hello'}
        selectedLessonName={selectedLesson}
        vocabularyList={vocabList}
        sentenceList={sentenceList}
        allUnitVocabularies={currentUnitData?.vocabulary || []}
        allUnitSentences={currentUnitData?.sentences || []}
        onBackToGames={() => setActiveGame(null)}
        playSoundEffect={playSoundEffect}
        onAwardEP={onAwardEP}
        onAwardTree={onAwardTree}
        totalUserTrees={totalUserTrees}
        onOpenGarden={onOpenGarden}
      />
    );
  }

  // Dedicated interactive screen for "Clean Energy" (Game 6)
  if (activeGame?.id === 'clean-energy') {
    return (
      <CleanEnergyGame
        selectedUnitName={currentUnitData?.unitFullName || 'Unit 1 - Hello'}
        selectedLessonName={selectedLesson}
        vocabularyList={vocabList}
        sentenceList={sentenceList}
        allUnitVocabularies={currentUnitData?.vocabulary || []}
        allUnitSentences={currentUnitData?.sentences || []}
        onBackToGames={() => setActiveGame(null)}
        playSoundEffect={playSoundEffect}
        onAwardEP={onAwardEP}
        onAwardTree={onAwardTree}
        totalUserTrees={totalUserTrees}
        onOpenGarden={onOpenGarden}
      />
    );
  }

  // Dedicated interactive screen for "Eco Garden Trail" (Game 7)
  if (activeGame?.id === 'flower-trail') {
    return (
      <EcoGardenTrailGame
        selectedUnitName={currentUnitData?.unitFullName || 'Unit 1 - Hello'}
        selectedLessonName={selectedLesson}
        vocabularyList={vocabList}
        sentenceList={sentenceList}
        allUnitVocabularies={currentUnitData?.vocabulary || []}
        allUnitSentences={currentUnitData?.sentences || []}
        onBackToGames={() => setActiveGame(null)}
        playSoundEffect={playSoundEffect}
        onAwardEP={onAwardEP}
        onAwardTree={onAwardTree}
        totalUserTrees={totalUserTrees}
        onOpenGarden={onOpenGarden}
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. ECO GAMES HEADER */}
      <div className="w-full bg-gradient-to-r from-[#e3f7eb] via-[#d1fae5] to-[#c7f4d8] rounded-3xl p-4 sm:p-5 border-[2.5px] border-[#86c898] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#15803d] to-[#047857] text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md border-2 border-white shrink-0">
            🎮
          </div>
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                Eco Games - Trò chơi xanh
              </h2>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-[#86efac] text-[#13492a] border border-[#4ade80]">
                7 Games
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-emerald-800">
              Học tiếng Anh qua những nhiệm vụ nhỏ
            </p>
          </div>
        </div>

        {/* Back to practice button */}
        <button
          onClick={() => {
            playSoundEffect('click');
            onBackToLessons();
          }}
          className="relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 hover:bg-white text-emerald-900 rounded-full font-bold text-xs border border-emerald-300 shadow-xs transition-all hover:scale-102 cursor-pointer self-end sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-700" />
          <span>Back to Lessons</span>
        </button>

        {/* Decorative backdrop leaf shapes */}
        <div className="absolute -right-6 -bottom-8 text-8xl opacity-15 pointer-events-none select-none">
          🍃
        </div>
      </div>

      {/* 2. TOP FILTER BAR (Grade, Current Lesson, Prompt: Mỗi lượt 3-5 câu) */}
      <div className="w-full bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl px-3 sm:px-4 py-2.5 shadow-sm border-[2px] border-[#86c898] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Grade Selector (Role-based) */}
          <div className="h-9 inline-flex items-center gap-1.5 pl-2.5 pr-2 bg-[#e2f4e8] rounded-xl border border-[#86c898] text-xs font-bold text-emerald-950 shrink-0 shadow-2xs">
            <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-emerald-950">Grade</span>
            {(() => {
              const canSwitchGrades = typeof window !== 'undefined' && (
                localStorage.getItem('ecovoice_user_role') === 'teacher' ||
                localStorage.getItem('ecovoice_user_role') === 'guest' ||
                localStorage.getItem('ecovoice_is_guest_mode') === 'true' ||
                (localStorage.getItem('ecovoice_user_name') || '').includes('Guest')
              );
              if (canSwitchGrades) {
                return (
                  <div className="relative flex items-center">
                    <select
                      value={selectedGrade}
                      onChange={(e) => onGradeChange(e.target.value)}
                      className="w-[54px] sm:w-[58px] h-7 bg-white border border-[#10b981] rounded-[10px] pl-2.5 pr-5 font-black text-emerald-950 text-xs sm:text-sm cursor-pointer outline-none focus:ring-1 focus:ring-emerald-400 appearance-none text-left"
                    >
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-emerald-600 absolute right-1.5 pointer-events-none" />
                  </div>
                );
              }
              return (
                <div className="h-7 px-2.5 bg-white border border-[#10b981] rounded-[10px] flex items-center justify-center font-black text-emerald-950 text-xs sm:text-sm shadow-2xs">
                  <span>{selectedGrade}</span>
                </div>
              );
            })()}
          </div>

          {/* Current Lesson / Unit Selector */}
          <div className="h-9 flex items-center gap-1.5 bg-[#e2f4e8] px-2.5 py-1 rounded-xl border border-[#86c898] text-xs font-bold text-emerald-950 shrink-0">
            <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-emerald-950">Current Unit</span>
            <select
              value={selectedUnitKey}
              onChange={(e) => onUnitChange(e.target.value)}
              className="bg-white border border-[#86c898] rounded-lg px-2 py-0.5 font-bold text-emerald-950 text-xs cursor-pointer outline-none focus:ring-1 focus:ring-emerald-400 max-w-[150px] sm:max-w-[200px]"
            >
              {availableUnits.map(unit => (
                <option key={unit.unitKey} value={unit.unitKey}>
                  {unit.unitFullName}
                </option>
              ))}
            </select>
          </div>

          {/* Lesson toggle (Lesson 1 vs Lesson 2) */}
          <div className="inline-flex items-center gap-1 bg-[#e2f4e8] p-1 rounded-xl border border-[#86c898]">
            {availableLessons.map((l) => (
              <button
                key={l.lessonNumber}
                type="button"
                onClick={() => onLessonChange(l.lessonTitle)}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  selectedLesson === l.lessonTitle
                    ? 'bg-[#15803d] text-white shadow-2xs'
                    : 'text-emerald-900 hover:bg-emerald-200/50'
                }`}
              >
                {l.lessonTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt reminder badge: "Mỗi lượt 3-5 câu" */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200/80 border border-amber-300 text-amber-900 font-extrabold text-xs shadow-2xs">
          <span className="text-sm">⏱️</span>
          <span>Mỗi lượt 3-5 câu</span>
        </div>
      </div>

      {/* 3. GAME CARDS GRID (7 GAMES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
        {ECO_GAMES_LIST.map((game, idx) => (
          <div
            key={game.id}
            className="group rounded-3xl p-4 sm:p-5 bg-white border-[2.5px] border-[#86c898]/80 hover:border-[#10b981] shadow-[0_4px_16px_rgba(13,74,43,0.06)] hover:shadow-[0_8px_24px_rgba(13,74,43,0.14)] transition-all duration-200 flex flex-col justify-between relative overflow-hidden hover:-translate-y-1"
          >
            {/* Top Badge & Number */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#e2f4e8] text-emerald-900 border border-emerald-300/80 shadow-2xs">
                {game.badge}
              </span>
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                {idx + 1}
              </span>
            </div>

            {/* Illustration Canvas / Image Card */}
            <div className={`w-full h-36 rounded-2xl bg-gradient-to-br ${game.bgGradient} border border-emerald-200/70 p-3 flex flex-col items-center justify-center relative overflow-hidden my-2 shadow-inner group-hover:scale-102 transition-transform`}>
              {/* Animated Scene Elements */}
              <div className="text-5xl sm:text-6xl filter drop-shadow-md select-none transform transition-transform group-hover:scale-110">
                {game.characterEmoji}
              </div>
              <div className="absolute right-2 top-2 text-2xl opacity-60">
                {game.icon}
              </div>
              <div className="absolute left-2 bottom-1.5 flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                <span>🌱 Eco Mission</span>
              </div>
            </div>

            {/* Title & Meaning */}
            <div className="flex flex-col gap-1 my-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight leading-snug">
                  {game.titleEn}
                </h3>
                <span className="text-xs sm:text-sm font-bold text-emerald-700">
                  ({game.titleVi})
                </span>
              </div>

              {/* Gameplay description */}
              <p className="text-xs font-semibold text-emerald-800/90 bg-[#f0fbf4] px-2.5 py-1.5 rounded-xl border border-[#bbf7d0]/80">
                {game.gameplayDesc}
              </p>
            </div>

            {/* Primary Action Button: "Play Now / Chơi ngay" */}
            <button
              onClick={() => handleLaunchGame(game)}
              className="mt-2 w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#0d4a2b] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-[0_2px_8px_rgba(13,74,43,0.25)] hover:shadow-[0_4px_12px_rgba(13,74,43,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play Now / Chơi ngay</span>
            </button>
          </div>
        ))}
      </div>

      {/* 4. FOOTER NOTE & MASCOT */}
      <div className="w-full bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border-[2px] border-[#86c898] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xl shrink-0">
            🌱
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-emerald-950 text-sm">
              🌱 Em có thể thử lại, không bị trừ điểm.
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              Hoàn thành mỗi trò chơi để nhận thưởng +15 Eco Points và trồng thêm cây xanh!
            </span>
          </div>
        </div>

        {/* Mascot Cây Xanh vui nhộn góc phải với bóng thoại */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <div className="relative bg-white text-emerald-950 font-black text-xs sm:text-sm px-3.5 py-2 rounded-2xl border-2 border-[#10b981] shadow-sm">
            Let's play together!
            <div className="absolute right-[-7px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-[#10b981]"></div>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#86efac] to-[#22c55e] border-2 border-white shadow-md flex items-center justify-center text-2xl">
            🌳
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE MINI-GAME MODAL */}
      {activeGame && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-6 border-[3px] border-[#10b981] shadow-2xl flex flex-col gap-4 relative max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{activeGame.characterEmoji}</span>
                <div>
                  <h3 className="font-black text-lg sm:text-xl text-emerald-950">
                    {activeGame.titleEn} - {activeGame.titleVi}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    {activeGame.gameplayDesc} • Câu {currentRound + 1}/{totalRounds}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  playSoundEffect('click');
                  setActiveGame(null);
                }}
                className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Game Progress Bar */}
            <div className="w-full bg-emerald-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#10b981] to-[#059669] h-full transition-all duration-300"
                style={{ width: `${((currentRound + (gameFinished ? 1 : 0)) / totalRounds) * 100}%` }}
              />
            </div>

            {/* Game Playing Content Area */}
            {!gameFinished ? (
              <div className="flex flex-col items-center gap-4 py-2">
                {/* Specific game implementations */}
                {/* Game 1: Grow a Tree */}
                {activeGame.id === 'grow-tree' && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-b from-sky-100 to-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-6xl shadow-inner relative overflow-hidden">
                      {treeGrowthStage === 1 && '🌱'}
                      {treeGrowthStage === 2 && '🌿'}
                      {treeGrowthStage === 3 && '🌸'}
                      {treeGrowthStage >= 4 && '🌳'}
                    </div>

                    <div className="text-center">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                        Nhiệm vụ: Phát âm từ vựng tiếng Anh để tưới cây
                      </span>
                      <h4 className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                        {currentVocab.word}
                      </h4>
                      {currentVocab.phonetic && (
                        <p className="text-sm font-semibold text-emerald-700 font-mono">
                          {currentVocab.phonetic}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => speakWord(currentVocab.speechText)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-900 font-extrabold text-xs cursor-pointer border border-sky-300 shadow-2xs"
                      >
                        <Volume2 className="w-4 h-4 text-sky-700" />
                        <span>Listen / Nghe phát âm</span>
                      </button>

                      <button
                        onClick={() => {
                          playSoundEffect('success');
                          setTreeGrowthStage(s => Math.min(4, s + 1));
                          setGameScore(s => s + 1);
                          setFeedbackMsg({ text: `🎉 Giỏi lắm! Cây xanh đã lớn thêm một bậc!`, isCorrect: true });
                        }}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#15803d] to-[#22c55e] hover:from-[#166534] hover:to-[#15803d] text-white font-extrabold text-xs cursor-pointer shadow-md"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Nói chuẩn & Tưới cây</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Game 2: Clean the Ocean */}
                {activeGame.id === 'clean-ocean' && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="w-full bg-sky-50 rounded-2xl p-3 border border-sky-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">🐢</span>
                        <span className="text-xs font-bold text-sky-950">
                          Bấm nghe rồi chọn đúng từ tiếng Anh để vớt rác làm sạch biển nhé!
                        </span>
                      </div>
                      <button
                        onClick={() => speakWord(currentVocab.speechText)}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Listen / Nghe</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                      {[currentVocab, ...vocabList.filter(v => v.id !== currentVocab.id).slice(0, 3)]
                        .sort(() => 0.5 - Math.random())
                        .map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (opt.id === currentVocab.id) {
                                playSoundEffect('success');
                                setGameScore(s => s + 1);
                                setFeedbackMsg({ text: `🌊 Tuyệt vời! Bạn đã vớt được 1 món rác thải nhựa giúp rùa biển!`, isCorrect: true });
                              } else {
                                playSoundEffect('fail');
                                setFeedbackMsg({ text: `🌱 Chưa đúng rồi, em hãy nghe kỹ lại nhé!`, isCorrect: false });
                              }
                            }}
                            className="p-3.5 rounded-2xl bg-white border-2 border-sky-200 hover:border-sky-500 hover:bg-sky-50/50 text-left font-bold text-xs sm:text-sm text-sky-950 transition-all flex items-center gap-2.5 cursor-pointer shadow-2xs"
                          >
                            <span className="text-xl">{opt.icon || '🌊'}</span>
                            <span className="font-black text-sm">{opt.word}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Game 3: Sort the Rubbish */}
                {activeGame.id === 'sort-rubbish' && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 w-full text-center">
                      <span className="text-xs font-bold text-amber-900">
                        Vocabulary:
                      </span>
                      <h4 className="text-2xl font-black text-amber-950 mt-0.5">
                        {currentVocab.word}
                      </h4>
                      {currentVocab.phonetic && (
                        <p className="text-xs font-mono text-amber-800 mt-0.5">{currentVocab.phonetic}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakWord(currentVocab.speechText)}
                        className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer border border-amber-300"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>

                    <p className="text-xs font-bold text-emerald-800">
                      Chọn thùng rác phù hợp để phân loại tại nguồn:
                    </p>

                    <div className="grid grid-cols-3 gap-2.5 w-full">
                      {[
                        { name: 'Organic (Hữu cơ)', icon: '🍏', color: 'bg-green-100 border-green-300 text-green-950' },
                        { name: 'Recycle (Tái chế)', icon: '📦', color: 'bg-blue-100 border-blue-300 text-blue-950' },
                        { name: 'General (Khác)', icon: '🗑️', color: 'bg-amber-100 border-amber-300 text-amber-950' }
                      ].map((bin, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            playSoundEffect('success');
                            setGameScore(s => s + 1);
                            setFeedbackMsg({ text: `♻️ Xuất sắc! Em đã phân loại rác đúng thùng!`, isCorrect: true });
                          }}
                          className={`p-3 rounded-2xl border-2 ${bin.color} flex flex-col items-center gap-1.5 hover:scale-102 transition-all cursor-pointer shadow-2xs`}
                        >
                          <span className="text-3xl">{bin.icon}</span>
                          <span className="text-[11px] font-black text-center leading-tight">
                            {bin.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Game 4: Save Water */}
                {activeGame.id === 'save-water' && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    {/* Audio Listen Box - No Vietnamese translation clue */}
                    <div className="w-full bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-3 border border-sky-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💧</span>
                        <span className="text-xs font-bold text-sky-950">
                          Bấm nghe mẫu câu tiếng Anh rồi ghép các từ đúng thứ tự:
                        </span>
                      </div>
                      <button
                        onClick={() => speakWord(currentSentence.example || currentSentence.structure)}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Listen / Nghe</span>
                      </button>
                    </div>

                    {/* Target Answer Dropzone */}
                    <div className="w-full min-h-[50px] p-2.5 bg-blue-100/70 border-2 border-dashed border-blue-300 rounded-2xl flex flex-wrap items-center justify-center gap-2">
                      {selectedWords.length === 0 ? (
                        <span className="text-xs text-blue-600 font-bold italic">
                          Chạm các từ bên dưới theo đúng thứ tự để khoá van nước rò rỉ!
                        </span>
                      ) : (
                        selectedWords.map((w, idx) => (
                          <span
                            key={idx}
                            onClick={() => {
                              setSelectedWords(selectedWords.filter((_, i) => i !== idx));
                              setScrambledWords([...scrambledWords, w]);
                            }}
                            className="px-3 py-1 bg-white text-blue-950 font-black text-xs sm:text-sm rounded-xl border border-blue-400 shadow-xs cursor-pointer hover:bg-rose-50 hover:text-rose-700"
                          >
                            {w} ✕
                          </span>
                        ))
                      )}
                    </div>

                    {/* Scrambled word chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                      {scrambledWords
                        .filter(w => Boolean(w) && /[a-zA-Z0-9]/.test(w))
                        .map((word, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            playSoundEffect('click');
                            setSelectedWords([...selectedWords, word]);
                            setScrambledWords(scrambledWords.filter((_, i) => i !== idx));
                          }}
                          className="px-3.5 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-950 font-black text-xs sm:text-sm rounded-xl border border-sky-300 shadow-2xs cursor-pointer transition-all active:scale-95"
                        >
                          {word}
                        </button>
                      ))}
                    </div>

                    {/* Check Answer Button */}
                    <button
                      onClick={() => {
                        const assembled = selectedWords.join(' ').toLowerCase();
                        const target = (currentSentence.example || '').toLowerCase().trim();
                        const targetClean = target.replace(/[.,!?;:'"“”‘’]/g, '');
                        const assembledClean = assembled.replace(/[.,!?;:'"“”‘’]/g, '');

                        const lastWord = selectedWords[selectedWords.length - 1] || '';
                        const expectedPunct = target.match(/[.?!]+$/)?.[0] || '.';
                        const hasEndingPunct = lastWord.endsWith(expectedPunct) || lastWord.includes('.');

                        if ((assembledClean === targetClean && hasEndingPunct) || assembled === target || selectedWords.length >= 2) {
                          playSoundEffect('success');
                          setGameScore(s => s + 1);
                          setFeedbackMsg({ text: `💧 Hoan hô! Em đã khóa chặt vòi nước và ghép câu chuẩn xác!`, isCorrect: true });
                        } else {
                          playSoundEffect('fail');
                          setFeedbackMsg({ text: `🌱 Chưa khớp rồi, em hãy sắp xếp lại nhé!`, isCorrect: false });
                        }
                      }}
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-sky-600 text-white font-extrabold text-xs shadow cursor-pointer mt-1"
                    >
                      Kiểm tra câu
                    </button>
                  </div>
                )}

                {/* Game 5: Animal Homes */}
                {activeGame.id === 'animal-homes' && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="w-full bg-lime-50 rounded-2xl p-3 border border-lime-200 text-center">
                      <span className="text-xs font-bold text-lime-900">
                        Listen to the English audio and help the animal find its eco home:
                      </span>
                      <div className="flex items-center justify-center gap-2 mt-1.5">
                        <button
                          onClick={() => speakWord(currentVocab.speechText)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Listen / Bấm nghe</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      {[
                        { label: currentVocab.word, icon: currentVocab.icon || '🌲', isCorrect: true },
                        ...vocabList
                          .filter(v => v.id !== currentVocab.id)
                          .slice(0, 3)
                          .map(v => ({ label: v.word, icon: v.icon || '🐾', isCorrect: false }))
                      ]
                        .slice(0, 4)
                        .sort(() => 0.5 - Math.random())
                        .map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (opt.isCorrect) {
                                playSoundEffect('success');
                                setGameScore(s => s + 1);
                                setFeedbackMsg({ text: `🐾 Chính xác! Bạn thú đã tìm về đúng ngôi nhà xanh an toàn!`, isCorrect: true });
                              } else {
                                playSoundEffect('fail');
                                setFeedbackMsg({ text: `🌱 Chưa phải rồi, em hãy nghe lại nhé!`, isCorrect: false });
                              }
                            }}
                            className="p-3.5 rounded-2xl border-2 border-lime-300 bg-white hover:bg-lime-50 font-bold text-xs sm:text-sm text-lime-950 flex items-center gap-2.5 cursor-pointer shadow-2xs"
                          >
                            <span className="text-2xl">{opt.icon}</span>
                            <span className="font-black text-sm">{opt.label}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}





                {/* Feedback message banner */}
                {feedbackMsg && (
                  <div
                    className={`w-full p-3 rounded-2xl text-xs sm:text-sm font-black text-center border ${
                      feedbackMsg.isCorrect
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                        : 'bg-amber-100 border-amber-300 text-amber-950'
                    }`}
                  >
                    {feedbackMsg.text}
                  </div>
                )}

                {/* Next button */}
                <div className="w-full flex items-center justify-between border-t border-emerald-100 pt-3">
                  <span className="text-xs font-bold text-emerald-700">
                    🌱 Có thể thử lại, không lo trừ điểm!
                  </span>
                  <button
                    onClick={handleNextRound}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-[#15803d] to-[#22c55e] text-white font-extrabold text-xs shadow-md cursor-pointer hover:scale-102 transition-transform"
                  >
                    {currentRound + 1 >= totalRounds ? 'Hoàn thành' : 'Câu tiếp theo →'}
                  </button>
                </div>
              </div>
            ) : (
              /* Game Finished / Trophy Screen with Green Lesson Eco Card */
              <div className="flex flex-col items-center gap-3.5 py-3 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 border-3 border-amber-300 flex items-center justify-center text-3xl shadow-md">
                  🏆
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-emerald-950">
                    Mission Complete · Hoàn thành xuất sắc!
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-emerald-800 mt-1">
                    Em đã chinh phục thử thách <span className="text-emerald-950 underline">{activeGame.titleEn}</span>!
                  </p>
                </div>

                {/* THẺ BÀI HỌC XANH (GREEN LESSON WITH ECO-BUDDY) */}
                <div className="w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 rounded-2xl p-4 border-2 border-emerald-300 text-left shadow-xs flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌿</span>
                    <span className="text-xs font-black uppercase text-emerald-900 tracking-wide">
                      Green Lesson with Eco-Buddy · Bài học xanh
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed">
                    "Mỗi hành động nhỏ bé như phân loại rác, tiết kiệm từng giọt nước, sử dụng năng lượng sạch và chăm sóc cỏ cây đều góp phần bảo vệ hành tinh xanh của chúng ta!"
                  </p>
                  <div className="flex items-center gap-2 pt-1 border-t border-emerald-200 text-xs font-extrabold text-emerald-800">
                    <span>💡 Eco Tip:</span>
                    <span>Hãy chia sẻ kiến thức xanh này với bạn bè và người thân cùng thực hiện nhé!</span>
                  </div>
                </div>

                {/* Rewards Bar */}
                <div className="flex items-center justify-center gap-3">
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs shadow-2xs">
                    🎁 Thưởng: +15 Eco Points
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs shadow-2xs">
                    🌱 +1 Cây xanh
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => handleLaunchGame(activeGame)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold text-xs cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Chơi lại</span>
                  </button>

                  <button
                    onClick={() => {
                      playSoundEffect('click');
                      setActiveGame(null);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#15803d] to-[#22c55e] text-white font-extrabold text-xs cursor-pointer shadow-md"
                  >
                    <span>Chọn trò khác</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
