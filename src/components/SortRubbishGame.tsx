import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Mic, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  X,
  Sprout,
  RefreshCw,
  Heart,
  ShieldCheck,
  BookOpen,
  Trash2,
  Recycle,
  HelpCircle,
  ArrowDown
} from 'lucide-react';
import { getCustomVisual } from '../services/teacherContentService';
import { checkSpeechAnswerMatch } from '../services/pronunciationFeedbackService';

export type WasteCategory = 'organic' | 'recyclable' | 'general';

export interface RubbishItem {
  id: string;
  nameEn: string;
  nameVi: string;
  emoji: string;
  category: WasteCategory;
  reasonVi: string;
  reasonEn: string;
}

export const RUBBISH_ITEMS: RubbishItem[] = [
  {
    id: 'banana-peel',
    nameEn: 'Banana Peel',
    nameVi: 'Vỏ chuối',
    emoji: '🍌',
    category: 'organic',
    reasonVi: 'Vỏ chuối là rác hữu cơ, phân hủy tự nhiên và ủ thành phân bón tốt cho cây.',
    reasonEn: 'Banana peels are organic and can be composted into nutrient-rich soil.'
  },
  {
    id: 'plastic-bottle',
    nameEn: 'Plastic Bottle',
    nameVi: 'Chai nước nhựa',
    emoji: '🧴',
    category: 'recyclable',
    reasonVi: 'Chai nhựa thuộc nhóm rác tái chế, có thể xử lý thành chai mới hoặc sợi vải.',
    reasonEn: 'Plastic bottles can be recycled into new products and textiles.'
  },
  {
    id: 'apple-core',
    nameEn: 'Apple Core',
    nameVi: 'Lõi táo thừa',
    emoji: '🍎',
    category: 'organic',
    reasonVi: 'Lõi quả và thức ăn thừa là rác hữu cơ, cần ủ phân xanh bảo vệ môi trường.',
    reasonEn: 'Fruit leftovers decompose naturally and belong to organic waste.'
  },
  {
    id: 'cardboard-box',
    nameEn: 'Cardboard Box',
    nameVi: 'Hộp giấy carton',
    emoji: '📦',
    category: 'recyclable',
    reasonVi: 'Bìa carton và giấy sạch tái chế giúp giảm đốn hạ cây rừng tự nhiên.',
    reasonEn: 'Recycling cardboard boxes saves trees and conserves natural forests.'
  },
  {
    id: 'dirty-napkin',
    nameEn: 'Used Napkin',
    nameVi: 'Khăn giấy bẩn',
    emoji: '🧻',
    category: 'general',
    reasonVi: 'Khăn giấy đã qua sử dụng dính bẩn không thể tái chế, thuộc nhóm rác khác.',
    reasonEn: 'Used napkins are contaminated and belong to general non-recyclable waste.'
  },
  {
    id: 'aluminum-can',
    nameEn: 'Soda Can',
    nameVi: 'Lon nước ngọt nhôm',
    emoji: '🥫',
    category: 'recyclable',
    reasonVi: 'Lon nhôm có thể tái chế vô hạn lần mà không giảm chất lượng kim loại.',
    reasonEn: 'Aluminum cans can be recycled indefinitely without degradation.'
  },
  {
    id: 'leftover-food',
    nameEn: 'Leftover Veggies',
    nameVi: 'Rau củ thừa',
    emoji: '🥦',
    category: 'organic',
    reasonVi: 'Rau củ quả thừa phân hủy nhanh chóng trong đất, là nguồn phân hữu cơ tuyệt vời.',
    reasonEn: 'Vegetable scraps decompose quickly into rich compost for plants.'
  },
  {
    id: 'broken-mug',
    nameEn: 'Broken Ceramic',
    nameVi: 'Mảnh gốm sứ vỡ',
    emoji: '🏺',
    category: 'general',
    reasonVi: 'Gốm sứ vỡ không phân hủy và không nấu chảy tái chế được, là rác thông thường.',
    reasonEn: 'Broken ceramics cannot be composted or melted down, so they go into general waste.'
  },
  {
    id: 'egg-shell',
    nameEn: 'Eggshell',
    nameVi: 'Vỏ trứng gà',
    emoji: '🥚',
    category: 'organic',
    reasonVi: 'Vỏ trứng giàu canxi, là nguyên liệu ủ phân hữu cơ tuyệt vời cho đất trồng.',
    reasonEn: 'Eggshells are rich in calcium and make wonderful organic compost for plants.'
  },
  {
    id: 'plastic-wrapper',
    nameEn: 'Snack Wrapper',
    nameVi: 'Vỏ gói bánh kẹo',
    emoji: '🍬',
    category: 'general',
    reasonVi: 'Bao bì kẹo nhiều lớp màng nhôm phức hợp không tái chế được, thuộc nhóm rác khác.',
    reasonEn: 'Multi-layer snack wrappers cannot be recycled and belong to general waste.'
  },
  {
    id: 'milk-carton',
    nameEn: 'Milk Carton',
    nameVi: 'Hộp sữa giấy',
    emoji: '🧃',
    category: 'recyclable',
    reasonVi: 'Vỏ hộp sữa giấy sau khi rửa sạch ép bẹp có thể tái chế thành tấm lợp sinh thái.',
    reasonEn: 'Clean milk cartons can be recycled into eco-friendly building boards and paper.'
  }
];

export interface WasteBin {
  id: WasteCategory;
  nameEn: string;
  nameVi: string;
  subTitleVi: string;
  colorName: string;
  binGradient: string;
  borderColor: string;
  badgeBg: string;
  icon: string;
  acceptedExamplesVi: string;
}

export const WASTE_BINS: WasteBin[] = [
  {
    id: 'organic',
    nameEn: 'Organic Waste',
    nameVi: 'Thùng Hữu Cơ',
    subTitleVi: 'Dễ phân hủy sinh học',
    colorName: 'emerald',
    binGradient: 'from-[#15803d] via-[#16a34a] to-[#22c55e]',
    borderColor: 'border-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    icon: '🍏',
    acceptedExamplesVi: 'Vỏ trái cây, rau thừa, bã trà, thức ăn thừa...'
  },
  {
    id: 'recyclable',
    nameEn: 'Recyclables',
    nameVi: 'Thùng Tái Chế',
    subTitleVi: 'Tái sinh tài nguyên',
    colorName: 'sky',
    binGradient: 'from-[#0369a1] via-[#0284c7] to-[#0ea5e9]',
    borderColor: 'border-sky-500',
    badgeBg: 'bg-sky-100 text-sky-950 border-sky-300',
    icon: '♻️',
    acceptedExamplesVi: 'Chai nhựa, lon nhôm, giấy, hộp carton...'
  },
  {
    id: 'general',
    nameEn: 'General Waste',
    nameVi: 'Thùng Rác Khác',
    subTitleVi: 'Xử lý chôn lấp/đốt',
    colorName: 'amber',
    binGradient: 'from-[#b45309] via-[#d97706] to-[#f59e0b]',
    borderColor: 'border-amber-500',
    badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
    icon: '🗑️',
    acceptedExamplesVi: 'Khăn giấy bẩn, mảnh sành sứ, tã lót...'
  }
];

export interface SortEcoLesson {
  id: string;
  en: string;
  vi: string;
  tip: string;
}

export const SORT_ECO_LESSONS: SortEcoLesson[] = [
  {
    id: 'sort-at-source',
    en: 'Sort rubbish at source! Separating organics, recyclables, and general waste turns garbage into green resources!',
    vi: 'Phân loại rác tại nguồn là hành động nhỏ mang ý nghĩa lớn! Tách riêng rác hữu cơ, rác tái chế và rác vô cơ giúp giảm 70% lượng rác chôn lấp và tái sinh tài nguyên!',
    tip: 'Tại nhà và lớp học, em hãy luôn để ý các thùng rác riêng biệt để bỏ rác đúng nơi quy định nhé! 🏠'
  },
  {
    id: 'organic-compost',
    en: 'Organic waste like fruit peels and vegetable scraps can be composted into natural fertilizer for healthy gardens!',
    vi: 'Rác hữu cơ như vỏ rau củ quả, bã trà sau khi ủ phân sẽ trở thành chất dinh dưỡng màu mỡ nuôi dưỡng cây cối và hoa lá!',
    tip: 'Em có thể dùng bã trà hoặc vỏ chuối băm nhỏ bón vào chậu cây để cây thêm xanh tốt nhé! 🪴'
  },
  {
    id: 'recycle-power',
    en: 'Recycling saves energy and prevents plastic waste from leaking into our rivers and oceans!',
    vi: 'Tái chế rác thải nhựa và kim loại giúp tiết kiệm năng lượng, ngăn chặn rác thải xâm hại đất đai và bảo vệ các loài động vật hoang dã!',
    tip: 'Em hãy nhớ súc sạch chai nhựa và lon nước trước khi bỏ vào thùng tái chế để rác luôn sạch nhé! 🌟'
  }
];

export interface SortGameOption {
  id: string;
  text: string;
  subText?: string;
  icon?: string;
  isCorrect: boolean;
}

export interface SortGameQuestion {
  id: string;
  type: 'vocabulary' | 'sentence';
  targetWord: string;
  targetPhonetic?: string;
  targetMeaning: string;
  speechText: string;
  exampleSentence?: string;
  exampleSentenceVi?: string;
  icon?: string;
  badgeLabelEn: string;
  badgeLabelVi: string;
  promptQuestionEn: string;
  promptQuestionVi: string;
  options: SortGameOption[];
  rewardTrash: RubbishItem;
}

export interface SortRubbishGameProps {
  selectedUnitName: string;
  selectedLessonName: string;
  vocabularyList: Array<{
    id?: string;
    word: string;
    phonetic?: string;
    meaning: string;
    speechText?: string;
    icon?: string;
    sentence?: string;
    sentenceVi?: string;
    colorHex?: string;
    lesson?: string;
  }>;
  sentenceList?: Array<{
    id?: string;
    structure?: string;
    meaning?: string;
    example?: string;
    exampleVi?: string;
    speechText?: string;
    lesson?: string;
  }>;
  allUnitVocabularies?: Array<any>;
  allUnitSentences?: Array<any>;
  onBackToGames: () => void;
  playSoundEffect: (name: 'chime' | 'success' | 'click' | 'celebrate' | 'fail') => void;
  onAwardEP: (ep: number) => void;
  onAwardTree?: () => void;
  totalUserTrees?: number;
  onOpenGarden?: () => void;
}

export const SortRubbishGame: React.FC<SortRubbishGameProps> = ({
  selectedUnitName,
  selectedLessonName,
  vocabularyList,
  sentenceList = [],
  allUnitVocabularies = [],
  allUnitSentences = [],
  onBackToGames,
  playSoundEffect,
  onAwardEP,
  onAwardTree,
  onOpenGarden
}) => {
  const TOTAL_ROUNDS = 5;

  // Session questions (Phase 1 Q&A)
  const [questions, setQuestions] = useState<SortGameQuestion[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(0);
  
  // Game Phase: 'qa' (Answer English question) | 'sorting' (Sort the earned rubbish) | 'sorted' (Success feedback)
  const [phase, setPhase] = useState<'qa' | 'sorting' | 'sorted'>('qa');

  // Currently earned trash item for the active round
  const [activeTrash, setActiveTrash] = useState<RubbishItem | null>(null);

  // Sorting progress counters
  const [sortedCount, setSortedCount] = useState<number>(0);
  const [binCounts, setBinCounts] = useState<{ organic: number; recyclable: number; general: number }>({
    organic: 0,
    recyclable: 0,
    general: 0
  });

  // Selected option & animations
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedBinId, setSelectedBinId] = useState<WasteCategory | null>(null);
  const [isWrongBinShake, setIsWrongBinShake] = useState<WasteCategory | null>(null);
  const [draggedOverBin, setDraggedOverBin] = useState<WasteCategory | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Popups & rewards
  const [showEcoKnowledgePopup, setShowEcoKnowledgePopup] = useState<boolean>(false);
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [claimNotification, setClaimNotification] = useState<string | null>(null);

  // Status feedback
  const [feedback, setFeedback] = useState<{
    text: string;
    isCorrect: boolean | null;
  }>({
    text: 'Bước 1: Nghe và chọn đúng từ vựng/mẫu câu của Unit để nhận 1 món rác phân loại nhé! 🎧',
    isCorrect: null
  });

  // Speech recognition
  const [isListening, setIsListening] = useState<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>('');
  const [speechAttempts, setSpeechAttempts] = useState<number>(0);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  // Initialize questions from curriculum vocabulary & sentences
  const initGameSession = () => {
    let primaryVocabs = (vocabularyList && vocabularyList.length > 0) ? [...vocabularyList] : [];
    let unitVocabs = (allUnitVocabularies && allUnitVocabularies.length > 0) ? [...allUnitVocabularies] : [];

    if (primaryVocabs.length === 0 && unitVocabs.length > 0) {
      primaryVocabs = [...unitVocabs];
    }
    if (primaryVocabs.length === 0) {
      primaryVocabs = [
        { word: 'HELLO', phonetic: '/həˈləʊ/', meaning: 'Xin chào', speechText: 'Hello', icon: '👋', sentence: "Hello, I'm Ben.", sentenceVi: "Xin chào, mình là Ben." },
        { word: 'HI', phonetic: '/haɪ/', meaning: 'Chào bạn', speechText: 'Hi', icon: '🙋', sentence: "Hi, Ben. I'm Mai.", sentenceVi: "Chào Ben. Mình là Mai." },
        { word: 'NAME', phonetic: '/neɪm/', meaning: 'Tên, họ tên', speechText: 'Name', icon: '🏷️', sentence: "My name's Mai.", sentenceVi: "Tên mình là Mai." },
        { word: 'THANK YOU', phonetic: '/θæŋk juː/', meaning: 'Cảm ơn bạn', speechText: 'Thank you', icon: '🙏', sentence: "Fine, thank you.", sentenceVi: "Mình khỏe, cảm ơn bạn." },
        { word: 'GOODBYE', phonetic: '/ˌɡʊdˈbaɪ/', meaning: 'Tạm biệt', speechText: 'Goodbye', icon: '👋', sentence: "Goodbye, Mai.", sentenceVi: "Tạm biệt Mai." }
      ];
      unitVocabs = [...primaryVocabs];
    }

    const fullVocabPool = unitVocabs.length >= 4 ? unitVocabs : [...primaryVocabs, ...unitVocabs];
    const sentences = (sentenceList && sentenceList.length > 0)
      ? sentenceList
      : ((allUnitSentences && allUnitSentences.length > 0) ? allUnitSentences : []);

    const generated: SortGameQuestion[] = [];
    const shuffledVocab = [...primaryVocabs].sort(() => 0.5 - Math.random());
    const shuffledTrash = [...RUBBISH_ITEMS].sort(() => 0.5 - Math.random());

    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const rewardTrash = shuffledTrash[i % shuffledTrash.length];
      const isSentenceRound = sentences.length > 0 && (i === 2 || i === 4);

      if (isSentenceRound) {
        const sentenceItem = sentences[(i + Math.floor(Math.random() * sentences.length)) % sentences.length];
        const targetSentence = sentenceItem.example || sentenceItem.structure || 'Hello, how are you?';
        const targetMeaning = sentenceItem.exampleVi || sentenceItem.meaning || 'Chào bạn, bạn có khỏe không?';

        const otherSentences = sentences.filter((s: any) => (s.example || s.structure) !== targetSentence);
        const distractorSentences: string[] = [];

        otherSentences.forEach((s: any) => {
          const text = s.example || s.structure;
          if (text && !distractorSentences.includes(text) && text !== targetSentence) {
            distractorSentences.push(text);
          }
        });

        fullVocabPool.forEach((v: any) => {
          if (distractorSentences.length < 3 && v.sentence && !distractorSentences.includes(v.sentence) && v.sentence !== targetSentence) {
            distractorSentences.push(v.sentence);
          }
        });

        const fallbackSentences = [
          'What is your name?',
          'How are you today?',
          'Nice to meet you.',
          'Goodbye, see you again.'
        ];
        for (const fb of fallbackSentences) {
          if (distractorSentences.length >= 3) break;
          if (fb !== targetSentence && !distractorSentences.includes(fb)) {
            distractorSentences.push(fb);
          }
        }

        const options: SortGameOption[] = [
          { id: `opt-correct-${i}`, text: targetSentence, isCorrect: true, icon: '💬' },
          ...distractorSentences.slice(0, 3).map((ds, idx) => ({
            id: `opt-distractor-${i}-${idx}`,
            text: ds,
            isCorrect: false,
            icon: '💬'
          }))
        ].sort(() => 0.5 - Math.random());

        generated.push({
          id: `q-${i}`,
          type: 'sentence',
          targetWord: targetSentence,
          targetMeaning: targetMeaning,
          speechText: sentenceItem.speechText || targetSentence,
          exampleSentence: sentenceItem.structure ? `Mẫu câu: ${sentenceItem.structure}` : undefined,
          exampleSentenceVi: sentenceItem.meaning,
          icon: '💬',
          badgeLabelEn: 'Sentence Challenge',
          badgeLabelVi: 'Thử thách mẫu câu',
          promptQuestionEn: 'Click the Speaker, listen and choose the matching sentence:',
          promptQuestionVi: 'Bấm biểu tượng Loa để nghe và chọn mẫu câu tương ứng:',
          options,
          rewardTrash
        });
      } else {
        const targetVocab = shuffledVocab[i % shuffledVocab.length];
        const targetWord = targetVocab.word;
        const targetMeaning = targetVocab.meaning;

        const otherVocabs = fullVocabPool.filter((v: any) => v.word.toLowerCase() !== targetWord.toLowerCase());
        const shuffledOthers = [...otherVocabs].sort(() => 0.5 - Math.random());

        const distractorWords: { word: string; phonetic?: string; icon?: string }[] = [];
        shuffledOthers.forEach((v: any) => {
          if (
            distractorWords.length < 3 && 
            v.word && 
            !distractorWords.some(d => d.word.toLowerCase() === v.word.toLowerCase()) && 
            v.word.toLowerCase() !== targetWord.toLowerCase()
          ) {
            distractorWords.push({ word: v.word, phonetic: v.phonetic, icon: v.icon });
          }
        });

        if (distractorWords.length < 3) {
          const globalSuccessCore = [
            { word: 'FRIEND', phonetic: '/frend/', icon: '👫' },
            { word: 'SCHOOL', phonetic: '/skuːl/', icon: '🏫' },
            { word: 'TEACHER', phonetic: '/ˈtiːtʃər/', icon: '👩‍🏫' },
            { word: 'STUDENT', phonetic: '/ˈstjuːdnt/', icon: '🎒' },
            { word: 'HELLO', phonetic: '/həˈləʊ/', icon: '👋' }
          ];
          for (const item of globalSuccessCore) {
            if (distractorWords.length >= 3) break;
            if (item.word.toLowerCase() !== targetWord.toLowerCase() && !distractorWords.some(d => d.word.toLowerCase() === item.word.toLowerCase())) {
              distractorWords.push(item);
            }
          }
        }

        const options: SortGameOption[] = [
          { id: `opt-correct-${i}`, text: targetWord, subText: targetVocab.phonetic, isCorrect: true, icon: targetVocab.icon || '📖' },
          ...distractorWords.slice(0, 3).map((d, idx) => ({
            id: `opt-distractor-${i}-${idx}`,
            text: d.word,
            subText: d.phonetic,
            isCorrect: false,
            icon: d.icon || '📖'
          }))
        ].sort(() => 0.5 - Math.random());

        generated.push({
          id: `q-${i}`,
          type: 'vocabulary',
          targetWord: targetWord,
          targetPhonetic: targetVocab.phonetic,
          targetMeaning: targetMeaning,
          speechText: targetVocab.speechText || targetWord,
          exampleSentence: targetVocab.sentence,
          exampleSentenceVi: targetVocab.sentenceVi,
          icon: targetVocab.icon || '📖',
          badgeLabelEn: 'Vocabulary Challenge',
          badgeLabelVi: 'Thử thách từ vựng',
          promptQuestionEn: 'Click the Speaker, listen and choose the matching word:',
          promptQuestionVi: 'Bấm biểu tượng Loa để nghe và chọn từ vựng tương ứng:',
          options,
          rewardTrash
        });
      }
    }

    setQuestions(generated);
    setCurrentRound(0);
    setPhase('qa');
    setActiveTrash(null);
    setSortedCount(0);
    setBinCounts({ organic: 0, recyclable: 0, general: 0 });
    setSelectedOptionId(null);
    setSelectedBinId(null);
    setIsWrongBinShake(null);
    setShowEcoKnowledgePopup(false);
    setSpeechAttempts(0);
    setHasClaimedReward(false);
    setClaimNotification(null);
    setFeedback({
      text: 'Bước 1: Nghe và chọn đúng từ vựng/mẫu câu của Unit để nhận 1 món rác phân loại nhé! 🎧',
      isCorrect: null
    });
  };

  useEffect(() => {
    initGameSession();
  }, [vocabularyList, sentenceList, allUnitVocabularies, allUnitSentences]);

  const currentQ: SortGameQuestion = questions[currentRound] || {
    id: 'default',
    type: 'vocabulary',
    targetWord: 'HELLO',
    targetPhonetic: '/həˈləʊ/',
    targetMeaning: 'Xin chào',
    speechText: 'Hello',
    exampleSentence: "Hello, I'm Ben.",
    exampleSentenceVi: "Xin chào, mình là Ben.",
    icon: '👋',
    badgeLabelEn: 'Vocabulary Challenge',
    badgeLabelVi: 'Thử thách từ vựng',
    promptQuestionEn: 'Click the Speaker, listen and select the matching word:',
    promptQuestionVi: 'Bấm biểu tượng Loa để nghe và chọn từ vựng tương ứng:',
    options: [
      { id: '1', text: 'HELLO', subText: '/həˈləʊ/', isCorrect: true, icon: '👋' },
      { id: '2', text: 'GOODBYE', subText: '/ˌɡʊdˈbaɪ/', isCorrect: false, icon: '👋' },
      { id: '3', text: 'THANK YOU', subText: '/θæŋk juː/', isCorrect: false, icon: '🙏' },
      { id: '4', text: 'FRIEND', subText: '/frend/', isCorrect: false, icon: '👫' }
    ],
    rewardTrash: RUBBISH_ITEMS[0]
  };

  // Audio Text-To-Speech
  const handleTTS = (slow: boolean = false) => {
    playSoundEffect('click');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = currentQ.speechText || currentQ.targetWord;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = slow ? 0.65 : 0.9;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // 1. Phase 1: Handle Q&A Answer
  const handleSelectOption = (opt: SortGameOption) => {
    if (selectedOptionId !== null) return;
    setSelectedOptionId(opt.id);

    if (opt.isCorrect) {
      playSoundEffect('success');
      const earnedItem = currentQ.rewardTrash;
      setActiveTrash(earnedItem);

      setFeedback({
        text: `🎉 Chính xác! Bạn vừa nhận được "${earnedItem.nameVi}" (${earnedItem.nameEn} ${earnedItem.emoji})! Hãy kéo hoặc chọn đúng thùng rác bên dưới nhé! 👇`,
        isCorrect: true
      });

      // Transition to Phase 2: Sorting action
      setTimeout(() => {
        setPhase('sorting');
        setSelectedOptionId(null);
      }, 900);
    } else {
      playSoundEffect('fail');
      setFeedback({
        text: '🌱 Chưa chính xác rồi! Em hãy bấm nghe lại âm thanh rồi chọn đáp án đúng nhé! 🎧',
        isCorrect: false
      });
      setTimeout(() => {
        setSelectedOptionId(null);
      }, 800);
    }
  };

  // 2. Phase 2: Handle Sorting Trash into Bin
  const handleDropIntoBin = (binId: WasteCategory) => {
    if (!activeTrash) return;

    if (activeTrash.category === binId) {
      // CORRECT BIN!
      playSoundEffect('success');
      onAwardEP(6);
      setSelectedBinId(binId);
      setIsWrongBinShake(null);
      setPhase('sorted');

      const nextSorted = sortedCount + 1;
      setSortedCount(nextSorted);
      setBinCounts(prev => ({
        ...prev,
        [binId]: prev[binId] + 1
      }));

      setFeedback({
        text: `✨ Xuất sắc! ${activeTrash.nameVi} (${activeTrash.emoji}) được phân loại đúng vào ${
          binId === 'organic' ? 'Thùng Hữu Cơ 🍏' : binId === 'recyclable' ? 'Thùng Tái Chế ♻️' : 'Thùng Rác Khác 🗑️'
        }! ${activeTrash.reasonVi} (+6 EP)`,
        isCorrect: true
      });

      if (nextSorted >= TOTAL_ROUNDS) {
        // All 5 items sorted successfully!
        setTimeout(() => {
          playSoundEffect('celebrate');
          setShowEcoKnowledgePopup(true);
        }, 1300);
      } else {
        // Advance to next round after feedback
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
          setPhase('qa');
          setActiveTrash(null);
          setSelectedBinId(null);
          setFeedback({
            text: 'Bước 1: Nghe và chọn đúng từ vựng/mẫu câu cho lượt tiếp theo nhé! 🎧',
            isCorrect: null
          });
        }, 1600);
      }
    } else {
      // WRONG BIN!
      playSoundEffect('fail');
      setIsWrongBinShake(binId);
      setTimeout(() => setIsWrongBinShake(null), 600);

      const targetBinName = activeTrash.category === 'organic' 
        ? 'Thùng Hữu Cơ (Organic) 🍏' 
        : activeTrash.category === 'recyclable' 
        ? 'Thùng Tái Chế (Recyclable) ♻️' 
        : 'Thùng Rác Khác (General) 🗑️';

      setFeedback({
        text: `⚠️ Chưa đúng rồi! ${activeTrash.nameVi} (${activeTrash.emoji}) nên bỏ vào ${targetBinName}. ${activeTrash.reasonVi} Em hãy thử lại nhé!`,
        isCorrect: false
      });
    }
  };

  // Drag and Drop helpers
  const handleDragStart = (e: React.DragEvent) => {
    if (activeTrash) {
      e.dataTransfer.setData('text/plain', activeTrash.id);
    }
  };

  const handleDragOver = (e: React.DragEvent, binId: WasteCategory) => {
    e.preventDefault();
    setDraggedOverBin(binId);
  };

  const handleDragLeave = () => {
    setDraggedOverBin(null);
  };

  const handleDrop = (e: React.DragEvent, binId: WasteCategory) => {
    e.preventDefault();
    setDraggedOverBin(null);
    handleDropIntoBin(binId);
  };

  // Speech Recognition fallback (Click to Start / Click to Stop)
  const startListening = () => {
    // If currently active recording, stop & evaluate accumulated speech immediately
    if (isListening || isListeningRef.current) {
      clearTimer();
      isListeningRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }

      const transcript = accumulatedTranscriptRef.current.trim();
      const target = (currentQ.targetWord || currentQ.speechText).trim();
      const isMatch = checkSpeechAnswerMatch(transcript, target) || 
        (target.split(/\s+/).length <= 2 && transcript.toLowerCase().includes(target.toLowerCase()));

      if (isMatch) {
        setSpeechAttempts(0);
        const correctOpt = currentQ.options.find(o => o.isCorrect);
        if (correctOpt) {
          handleSelectOption(correctOpt);
        }
      } else if (transcript) {
        const nextAttempts = speechAttempts + 1;
        setSpeechAttempts(nextAttempts);

        if (nextAttempts >= 4) {
          playSoundEffect('chime');
          setFeedback({
            text: `Good effort! Let us move on to the next question. 🌟`,
            isCorrect: null
          });

          // Advance with 0 EP: do NOT sort trash or award points!
          setTimeout(() => {
            setSpeechAttempts(0);
            const nextRound = currentRound + 1;
            if (nextRound >= TOTAL_ROUNDS) {
              playSoundEffect('celebrate');
              setShowEcoKnowledgePopup(true);
            } else {
              setCurrentRound(nextRound);
              setPhase('qa');
              setActiveTrash(null);
              setSelectedBinId(null);
              setFeedback({
                text: 'Bước 1: Nghe và chọn đúng từ vựng/mẫu câu cho lượt tiếp theo nhé! 🎧',
                isCorrect: null
              });
            }
          }, 2000);
        } else {
          playSoundEffect('fail');
          setFeedback({
            text: `Incorrect! Please try again! 🎤 (Attempt ${nextAttempts}/4)`,
            isCorrect: false
          });
        }
      } else {
        setFeedback({
          text: 'Bé chưa phát âm xong, hãy bấm nút và đọc lại thật rõ ràng rồi bấm Dừng nhé! 🎤',
          isCorrect: false
        });
      }
      return;
    }

    playSoundEffect('click');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      handleTTS(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      clearTimer();
      accumulatedTranscriptRef.current = '';

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setFeedback({
          text: `🎤 Đang lắng nghe... Đọc hết câu rồi bấm nút "Dừng & Chấm điểm" nhé!`,
          isCorrect: null
        });

        // 25s safety timeout
        clearTimer();
        timeoutRef.current = setTimeout(() => {
          if (isListeningRef.current) {
            isListeningRef.current = false;
            setIsListening(false);
            try { recognition.stop(); } catch {}

            const transcript = accumulatedTranscriptRef.current.trim();
            const target = (currentQ.targetWord || currentQ.speechText).trim();
            const isMatch = checkSpeechAnswerMatch(transcript, target) || 
              (target.split(/\s+/).length <= 2 && transcript.toLowerCase().includes(target.toLowerCase()));

            if (isMatch) {
              setSpeechAttempts(0);
              const correctOpt = currentQ.options.find(o => o.isCorrect);
              if (correctOpt) {
                handleSelectOption(correctOpt);
              }
            } else if (transcript) {
              const nextAttempts = speechAttempts + 1;
              setSpeechAttempts(nextAttempts);

              if (nextAttempts >= 4) {
                playSoundEffect('chime');
                setFeedback({
                  text: `Good effort! Let us move on to the next question. 🌟`,
                  isCorrect: null
                });

                // Advance with 0 EP: do NOT sort trash or award points!
                setTimeout(() => {
                  setSpeechAttempts(0);
                  const nextRound = currentRound + 1;
                  if (nextRound >= TOTAL_ROUNDS) {
                    playSoundEffect('celebrate');
                    setShowEcoKnowledgePopup(true);
                  } else {
                    setCurrentRound(nextRound);
                    setPhase('qa');
                    setActiveTrash(null);
                    setSelectedBinId(null);
                    setFeedback({
                      text: 'Bước 1: Nghe và chọn đúng từ vựng/mẫu câu cho lượt tiếp theo nhé! 🎧',
                      isCorrect: null
                    });
                  }
                }, 2000);
              } else {
                playSoundEffect('fail');
                setFeedback({
                  text: `Incorrect! Please try again! 🎤 (Attempt ${nextAttempts}/4)`,
                  isCorrect: false
                });
              }
            }
          }
        }, 25000);
      };

      recognition.onresult = (event: any) => {
        let fullText = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i] && event.results[i][0]) {
            fullText += event.results[i][0].transcript + ' ';
          }
        }
        const clean = fullText.trim().toLowerCase();
        if (clean) {
          accumulatedTranscriptRef.current = clean;
          setFeedback({
            text: `🎙️ "${clean}" (Bấm "Dừng & Chấm điểm" khi đọc xong)`,
            isCorrect: null
          });
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' && accumulatedTranscriptRef.current.trim()) {
          return;
        }
        clearTimer();
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
            return;
          } catch {}
        }
        clearTimer();
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      clearTimer();
      isListeningRef.current = false;
      setIsListening(false);
    }
  };

  // Claim Reward Action
  const handleClaimReward = (destination?: 'continue' | 'garden' | 'replay' | 'games') => {
    playSoundEffect('celebrate');
    if (!hasClaimedReward) {
      onAwardEP(30);
      if (onAwardTree) onAwardTree();
      setHasClaimedReward(true);
    }

    setShowEcoKnowledgePopup(false);

    if (destination === 'garden' && onOpenGarden) {
      onOpenGarden();
    } else if (destination === 'replay') {
      initGameSession();
    } else if (destination === 'games') {
      onBackToGames();
    } else {
      setClaimNotification('🎉 +30 EP and Waste Sorting Master Badge credited! / Đã nạp +30 EP và danh hiệu Chuyên Gia Phân Loại Rác vào My Garden!');
      setFeedback({
        text: '🎉 Đã nhận thưởng phân loại rác! Em có thể bấm "Chơi lại" để luyện tập thêm với các bài học khác nhé.',
        isCorrect: true
      });
    }
  };

  const progressPercent = Math.round((sortedCount / TOTAL_ROUNDS) * 100);

  return (
    <div className="w-full flex flex-col gap-3 font-sans pb-8">
      {/* 1. TOP BAR */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-[2px] border-emerald-300 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center text-xl shadow-xs">
            ♻️
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-emerald-950">
              Sort the Rubbish · Phân loại rác tại nguồn
            </h2>
            <span className="text-[11px] font-semibold text-emerald-700">
              {selectedUnitName || 'Unit 1 - Hello'} · {selectedLessonName || 'Lesson'}
            </span>
          </div>
        </div>

        {/* Back to games button */}
        <button
          onClick={() => {
            playSoundEffect('click');
            onBackToGames();
          }}
          className="flex flex-col items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 bg-white hover:bg-emerald-50 text-emerald-950 rounded-2xl border-2 border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-emerald-900">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Games</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600">
            Về trò chơi
          </span>
        </button>
      </div>

      {/* CLAIM CONFIRMATION BANNER */}
      {claimNotification && (
        <div className="w-full bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs sm:text-sm text-emerald-950 font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg shrink-0">🌟</span>
            <span>{claimNotification}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenGarden && (
              <button
                type="button"
                onClick={onOpenGarden}
                className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black cursor-pointer shadow-2xs"
              >
                Vào My Garden
              </button>
            )}
            <button
              type="button"
              onClick={initGameSession}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-2xs"
            >
              Chơi lại
            </button>
            <button
              type="button"
              onClick={() => setClaimNotification(null)}
              className="w-6 h-6 rounded-full hover:bg-emerald-200/60 flex items-center justify-center text-emerald-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. PROGRESS BANNER */}
      <div className="w-full bg-white rounded-2xl px-4 py-2.5 border-[1.5px] border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-bold text-emerald-950">
          <span className="text-base sm:text-lg shrink-0">🎯</span>
          <div>
            <span className="font-extrabold text-emerald-950">
              Q&A Challenge + Waste Sorting at Source!
            </span>
            <span className="text-emerald-700 font-medium block sm:inline sm:ml-1.5">
              (Trả lời đúng bài học để nhận rác, sau đó kéo/chọn bỏ vào đúng thùng!)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs shrink-0 self-start sm:self-auto">
          <span>{sortedCount}/{TOTAL_ROUNDS} Sorted · Đã phân loại</span>
          <span>({progressPercent}%)</span>
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE ARENA: QUESTION STATION (TOP/LEFT) + 3 WASTE BINS (BOTTOM/RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 w-full items-stretch">
        
        {/* ======================================================== */}
        {/* UPPER/LEFT SECTION: Q&A STATION OR ACTIVE TRASH CARD    */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-4 sm:p-5 border-[2.5px] border-emerald-300 shadow-sm flex flex-col justify-between gap-4">
          
          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{phase === 'qa' ? '🎧' : '♻️'}</span>
              <h2 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight">
                {phase === 'qa' 
                  ? 'Step 1: Listen & Select / Nghe & Chọn từ đúng' 
                  : 'Step 2: Drag/Drop to Bin / Bỏ rác vào thùng'}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
              Round {currentRound + 1}/{TOTAL_ROUNDS} · Vòng {currentRound + 1}
            </span>
          </div>

          {/* PHASE A: QUESTION STATION */}
          {phase === 'qa' && (
            <div className="flex flex-col gap-3.5 my-auto">
              
              {/* Speaker Box */}
              <div className="w-full bg-gradient-to-br from-emerald-50 via-teal-50/70 to-green-50 rounded-2xl p-4 border-2 border-emerald-300 shadow-sm flex flex-col items-center text-center gap-2.5 relative overflow-hidden">
                {isPlayingAudio && (
                  <div className="absolute inset-0 bg-emerald-400/10 animate-pulse pointer-events-none" />
                )}

                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-black shadow-2xs">
                  <span>{currentQ.badgeLabelEn} · {currentQ.badgeLabelVi}</span>
                </div>

                {/* Big speaker button */}
                <button
                  type="button"
                  onClick={() => handleTTS(false)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#047857] via-[#059669] to-[#10b981] hover:from-[#065f46] hover:to-[#059669] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer border-4 border-white ring-4 ring-emerald-300/80 group relative ${
                    isPlayingAudio ? 'ring-amber-300 animate-pulse' : ''
                  }`}
                  title="Bấm vào Loa để nghe âm thanh tiếng Anh"
                >
                  <Volume2 className={`w-9 h-9 sm:w-11 sm:h-11 text-white group-hover:scale-110 transition-transform ${
                    isPlayingAudio ? 'animate-bounce text-amber-200' : ''
                  }`} />
                  <span className="text-[10px] font-black text-emerald-100 mt-0.5">
                    {isPlayingAudio ? 'Playing...' : 'Listen / Nghe'}
                  </span>
                </button>

                {/* Listen Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTTS(false)}
                    className="px-3 py-1 rounded-xl bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Listen / Nghe chuẩn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTTS(true)}
                    className="px-3 py-1 rounded-xl bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span className="text-sm">🐢</span>
                    <span>Slow / Nghe chậm</span>
                  </button>
                </div>

                {/* Reward preview badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold shadow-2xs">
                  <span className="text-amber-800 font-black">🎁 Reward Item / Phần thưởng rác:</span>
                  <span className="font-black text-amber-950">{currentQ.rewardTrash.nameVi}</span>
                  <span className="text-base">{currentQ.rewardTrash.emoji}</span>
                </div>
              </div>

              {/* Instruction banner */}
              <div className="text-center text-xs font-bold text-emerald-950">
                <span className="font-extrabold">{currentQ.promptQuestionEn}</span>
                <span className="text-emerald-700 font-medium block sm:inline sm:ml-1.5">({currentQ.promptQuestionVi})</span>
              </div>

              {/* 4 Answer Option Cards */}
              <div className={`w-full ${
                currentQ.type === 'sentence' ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-1 sm:grid-cols-2 gap-2'
              }`}>
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isCorrect = opt.isCorrect;

                  let cardStyle = 'bg-white border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/80 text-emerald-950';
                  if (isSelected) {
                    cardStyle = isCorrect 
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300' 
                      : 'bg-rose-100 border-rose-500 text-rose-950 ring-2 ring-rose-300 animate-shake';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={selectedOptionId !== null}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs group ${cardStyle}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-7 h-7 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 border border-emerald-300">
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={`font-black tracking-wide leading-snug break-words ${
                            currentQ.type === 'sentence' ? 'text-xs sm:text-sm text-emerald-950' : 'text-sm sm:text-base text-emerald-950'
                          }`}>
                            {opt.text}
                          </span>
                          {currentQ.type !== 'sentence' && opt.subText && (
                            <span className="text-[10px] font-mono text-emerald-700">
                              {opt.subText}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mic Speak Voice Trigger */}
              <button
                type="button"
                onClick={startListening}
                className={`w-full py-2 px-3 rounded-2xl border font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer transition-all ${
                  isListening 
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Mic className="w-4 h-4 shrink-0" />
                  <span className="font-extrabold">{isListening ? 'Listening...' : 'Speak with Mic · Luyện nói trực tiếp'}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold sm:border-l sm:border-emerald-300 sm:pl-2">
                  {isListening ? '(Đang lắng nghe...)' : '(Bấm để nói từ tiếng Anh)'}
                </span>
              </button>

            </div>
          )}

          {/* PHASE B: SORTING ACTION (HỌC SINH KÉO / BẤM VÀO THÙNG RÁC) */}
          {(phase === 'sorting' || phase === 'sorted') && activeTrash && (
            <div className="flex flex-col items-center justify-center my-auto py-2 gap-3 text-center">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black uppercase tracking-wider">
                <span>📦 Món rác đã thu gom được / Collected Item</span>
              </div>

              {/* DRAGGABLE TRASH ITEM CARD */}
              <div
                draggable={phase === 'sorting'}
                onDragStart={handleDragStart}
                className={`w-44 sm:w-48 p-4 rounded-3xl bg-gradient-to-b from-white to-amber-50/90 border-3 border-amber-400 shadow-lg flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing hover:scale-105 transition-all select-none relative ${
                  phase === 'sorted' ? 'scale-90 opacity-40 blur-[1px]' : 'animate-bounce ring-4 ring-amber-200'
                }`}
              >
                <div className="text-6xl sm:text-7xl filter drop-shadow-md">
                  {activeTrash.emoji}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base sm:text-lg font-black text-amber-950">
                    {activeTrash.nameVi}
                  </span>
                  <span className="text-xs font-bold text-amber-800">
                    ({activeTrash.nameEn})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 mt-1">
                  <span>✨ Sẵn sàng phân loại</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="flex flex-col items-center gap-1 max-w-sm">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                  <ArrowDown className="w-4 h-4 text-emerald-600 animate-bounce" />
                  <span>Kéo hoặc bấm vào đúng 1 trong 3 thùng rác bên phải:</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">
                  (Drag or click one of the 3 waste bins to sort correctly!)
                </span>
              </div>

            </div>
          )}

          {/* Status Feedback Box */}
          <div className={`w-full rounded-2xl p-3 border flex items-center gap-2.5 transition-all text-xs sm:text-sm font-bold ${
            feedback.isCorrect === true
              ? 'bg-emerald-100/90 text-emerald-950 border-emerald-400 shadow-2xs'
              : feedback.isCorrect === false
              ? 'bg-rose-100/90 text-rose-950 border-rose-300 shadow-2xs'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}>
            <div className="text-lg shrink-0">
              {feedback.isCorrect === true ? '🎉' : feedback.isCorrect === false ? '⚠️' : '♻️'}
            </div>
            <p className="flex-1 leading-snug">
              {feedback.text}
            </p>
          </div>

        </div>

        {/* ======================================================== */}
        {/* LOWER/RIGHT SECTION: THE 3 CLASSIFICATION WASTE BINS     */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-4 sm:p-5 border-[2.5px] border-emerald-300 shadow-sm flex flex-col justify-between gap-3">
          
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight flex items-center gap-2">
              <span>Recycling Station · Trạm Phân Loại Rác</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
              3 Bins System
            </span>
          </div>

          <p className="text-xs font-semibold text-emerald-800">
            Học sinh bỏ rác vào đúng thùng để biến rác thải thành tài nguyên xanh:
          </p>

          {/* THE 3 WASTE BINS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full my-auto">
            {WASTE_BINS.map((bin) => {
              const isTargeted = draggedOverBin === bin.id;
              const isShaking = isWrongBinShake === bin.id;
              const isSelected = selectedBinId === bin.id;
              const currentCount = binCounts[bin.id];

              return (
                <div
                  key={bin.id}
                  onDragOver={(e) => handleDragOver(e, bin.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, bin.id)}
                  onClick={() => {
                    if (phase === 'sorting') {
                      handleDropIntoBin(bin.id);
                    }
                  }}
                  className={`rounded-3xl border-3 p-3 sm:p-3.5 flex flex-col items-center text-center justify-between gap-2.5 transition-all select-none shadow-md relative ${
                    bin.borderColor
                  } ${
                    isShaking ? 'animate-shake ring-4 ring-rose-400 bg-rose-50' : ''
                  } ${
                    isSelected ? 'ring-4 ring-emerald-400 bg-emerald-50 scale-102' : ''
                  } ${
                    isTargeted ? 'scale-105 ring-4 ring-amber-300 bg-amber-50' : 'bg-gradient-to-b from-white to-gray-50/80 hover:shadow-lg'
                  } ${
                    phase === 'sorting' ? 'cursor-pointer hover:scale-102 active:scale-98' : ''
                  }`}
                >
                  {/* Bin Header badge */}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${bin.badgeBg}`}>
                    {bin.nameEn}
                  </span>

                  {/* 3D Realistic Bin Visual */}
                  <div className={`w-20 h-24 sm:w-22 sm:h-26 rounded-2xl bg-gradient-to-b ${bin.binGradient} border-2 border-white/60 shadow-inner flex flex-col items-center justify-between p-2 text-white relative group overflow-hidden`}>
                    {/* Bin Lid */}
                    <div className="w-full h-3 bg-white/30 rounded-lg flex items-center justify-center shadow-xs">
                      <div className="w-6 h-1 bg-white/60 rounded-full" />
                    </div>

                    {/* Central Icon */}
                    <span className="text-3xl sm:text-4xl filter drop-shadow-md my-auto">
                      {bin.icon}
                    </span>

                    {/* Bin Slot */}
                    <div className="w-12 h-1.5 bg-black/30 rounded-full shadow-inner" />
                  </div>

                  {/* Bin Name & Subtitle */}
                  <div className="flex flex-col items-center">
                    <h3 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                      {bin.nameVi}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-600 mt-0.5">
                      {bin.subTitleVi}
                    </span>
                  </div>

                  {/* Accepted Examples hint */}
                  <div className="w-full bg-white/90 rounded-xl p-1.5 border border-gray-200 text-[9px] font-medium text-gray-700 leading-snug">
                    <span className="font-bold text-gray-900 block">Bao gồm:</span>
                    {bin.acceptedExamplesVi}
                  </div>

                  {/* Collected Count pill */}
                  <div className="w-full bg-gray-100 rounded-xl py-1 px-2 flex items-center justify-between text-[10px] font-black text-gray-800 border border-gray-200">
                    <span>Đã phân loại:</span>
                    <span className="text-emerald-700 font-extrabold">{currentCount} món</span>
                  </div>

                  {/* Quick Click Action Button when in sorting phase */}
                  {phase === 'sorting' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDropIntoBin(bin.id);
                      }}
                      className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-[11px] shadow-xs cursor-pointer transition-all"
                    >
                      Bỏ vào thùng này 📥
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Classification guidelines footer */}
          <div className="w-full bg-emerald-50 rounded-2xl p-2.5 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-900">
            <span className="text-base shrink-0">💡</span>
            <span>
              <strong>Ghi nhớ phân loại:</strong> Hữu cơ (ủ phân bón) 🍏 · Tái chế (tái sinh tài nguyên) ♻️ · Rác khác (xử lý an toàn) 🗑️.
            </span>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. ECO-KNOWLEDGE POPUP (Kích hoạt khi hoàn thành 5/5 rác) */}
      {/* ======================================================== */}
      {showEcoKnowledgePopup && (() => {
        const currentLesson = SORT_ECO_LESSONS[activeLessonIndex % SORT_ECO_LESSONS.length];
        return (
          <div className="fixed inset-0 z-50 bg-emerald-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-gradient-to-b from-[#f0fbf4] via-white to-[#e8f8ed] rounded-3xl sm:rounded-4xl max-w-3xl lg:max-w-4xl w-full p-5 sm:p-7 md:p-8 border-[3.5px] border-emerald-400 shadow-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[96vh] overflow-y-auto">
              
              {/* Decorative Glows */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-300/30 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal-300/30 blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => handleClaimReward('continue')}
                title="Đóng và nhận thưởng"
                className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/95 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center cursor-pointer transition-colors shadow-xs z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Tag: Eco-Sorting */}
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs sm:text-sm font-black uppercase tracking-wider shadow-2xs">
                <span>♻️ Eco-Sorting · Phân loại rác tại nguồn</span>
              </div>

              {/* Celebration Visual & Heading (Harmonious horizontal layout on sm+) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full">
                {/* Celebration Visual: Eco-Buddy with 3 Bins */}
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] border-4 border-white shadow-lg flex items-center justify-center text-4xl sm:text-5xl select-none animate-bounce relative">
                    ♻️
                    <span className="absolute -top-1 -right-1 text-lg animate-ping">✨</span>
                    <span className="absolute -bottom-1 -left-1 text-sm">🌱</span>
                  </div>

                  <div 
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-2 border-emerald-300 shadow-md flex items-center justify-center text-2xl sm:text-3xl -ml-4 mt-5 z-10 select-none cursor-pointer hover:scale-110 transition-transform"
                    title="Eco-Buddy chào bé!"
                    onClick={() => playSoundEffect('celebrate')}
                  >
                    🍏
                  </div>
                </div>

                <div className="flex flex-col text-center sm:text-left gap-1">
                  <h2 className="text-2xl sm:text-3xl md:text-3xl font-black text-emerald-950 tracking-tight leading-tight">
                    Congratulations! Waste Sorted! 🌟♻️
                  </h2>
                  <span className="text-sm sm:text-base font-extrabold text-emerald-900 -mt-0.5">
                    Phân loại rác thành công 5/5 món rác thải!
                  </span>
                  <p className="text-xs sm:text-sm md:text-base font-bold text-emerald-800 leading-snug">
                    Great job mastering curriculum English and sorting waste at source! <br className="hidden sm:inline" />
                    <span className="text-emerald-700 font-semibold">(Chúc mừng em đã hoàn thành xuất sắc thử thách từ vựng và phân loại rác bảo vệ môi trường!)</span>
                  </p>
                </div>
              </div>

              {/* Eco-Knowledge Card: Green Lesson with Eco-Buddy (Bilingual EN - VI) */}
              <div className="w-full bg-gradient-to-br from-emerald-50 via-white to-green-50/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border-2 border-emerald-300 shadow-sm text-left flex flex-col gap-3 relative">
                
                {/* Title & Rotate Lesson Button */}
                <div className="flex items-center justify-between gap-3 border-b border-emerald-200/90 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl sm:text-3xl">♻️</span>
                    <div className="text-left">
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-emerald-950 flex items-center gap-1.5 leading-snug">
                        <span>Green Lesson with Eco-Buddy</span>
                      </h3>
                      <span className="text-xs sm:text-sm font-bold text-emerald-700">
                        Bài học phân loại rác xanh cùng Eco-Buddy
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect('click');
                      setActiveLessonIndex(prev => (prev + 1) % SORT_ECO_LESSONS.length);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0"
                    title="Đổi bài học sinh thái khác"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Next Lesson · Đổi bài</span>
                  </button>
                </div>

                {/* English Quote (Enlarged & High Readability) */}
                <div className="text-emerald-950 font-black text-base sm:text-lg md:text-xl leading-relaxed flex items-start gap-2">
                  <span className="text-emerald-600 text-2xl sm:text-3xl leading-none font-serif select-none shrink-0">“</span>
                  <span className="italic flex-1">{currentLesson.en}</span>
                  <span className="text-emerald-600 text-2xl sm:text-3xl leading-none font-serif select-none shrink-0">”</span>
                </div>

                {/* Vietnamese Meaning (Enlarged font & relaxed spacing) */}
                <div className="text-emerald-900 font-bold text-sm sm:text-base md:text-base leading-relaxed bg-white/95 p-3.5 sm:p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
                  <p>({currentLesson.vi})</p>
                </div>

                {/* Practical Tip (Enlarged & Clear) */}
                <div className="flex items-center gap-2.5 text-xs sm:text-sm md:text-base font-bold text-emerald-950 bg-emerald-100/90 px-4 py-2.5 rounded-2xl border border-emerald-300">
                  <span className="text-base sm:text-lg shrink-0">💡</span>
                  <span className="leading-snug">{currentLesson.tip}</span>
                </div>
              </div>

              {/* Rewards Breakdown Card (Spacious layout with large metrics) */}
              <div className="w-full bg-[#f0fbf4] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border-2 border-emerald-200 flex items-center justify-around gap-2 text-center shadow-2xs">
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl">✨</span>
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-950 tabular-nums">+30 EP</span>
                  <span className="text-xs sm:text-sm text-emerald-700 font-bold">Eco Points · Điểm sinh thái</span>
                </div>
                <div className="w-px h-10 bg-emerald-300" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl">🏆</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-emerald-950">Sorting Master</span>
                  <span className="text-xs sm:text-sm text-emerald-700 font-bold">Chuyên Gia Phân Loại</span>
                </div>
                <div className="w-px h-10 bg-emerald-300" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl">🏡</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-emerald-950">My Garden</span>
                  <span className="text-xs sm:text-sm text-emerald-700 font-bold">Vườn & Sinh thái</span>
                </div>
              </div>

              {/* Action Buttons (Generous touch targets and clean layout) */}
              <div className="flex flex-col gap-2.5 w-full mt-1">
                {/* Primary Button */}
                <button
                  type="button"
                  onClick={() => handleClaimReward('continue')}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-[#047857] via-[#059669] to-[#10b981] hover:from-[#065f46] hover:to-[#059669] text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-98 cursor-pointer transition-all flex flex-col items-center justify-center gap-0.5 border-2 border-emerald-300 ring-4 ring-emerald-200/50 group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                    <span>Nhận phần thưởng & Tiếp tục phân loại rác</span>
                    <Sparkles className="w-5 h-5 text-amber-300 group-hover:-rotate-12 transition-transform" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-emerald-100">
                    Claim Reward and Keep Sorting · Great job!
                  </span>
                </button>

                {/* Secondary Navigation Options (Bilingual) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full">
                  {onOpenGarden && (
                    <button
                      type="button"
                      onClick={() => handleClaimReward('garden')}
                      className="py-2.5 sm:py-3 px-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300 font-black text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Xem Vườn (My Garden)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleClaimReward('replay')}
                    className="py-2.5 sm:py-3 px-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300 font-black text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Chơi lại (Play Again)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClaimReward('games')}
                    className={`py-2.5 sm:py-3 px-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300 font-black text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      onOpenGarden ? '' : 'col-span-1'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Về trò chơi (Back to Games)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
