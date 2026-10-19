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
  Waves,
  RefreshCw,
  Heart,
  Fish,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { getCustomVisual } from '../services/teacherContentService';
import { checkSpeechAnswerMatch } from '../services/pronunciationFeedbackService';

export interface TrashItem {
  id: string;
  nameEn: string;
  nameVi: string;
  emoji: string;
  description: string;
  posX: string; // CSS percentage
  posY: string; // CSS percentage
  rotation: string;
  floatDelay: string;
}

export const OCEAN_TRASH_ITEMS: TrashItem[] = [
  {
    id: 'plastic-bag',
    nameEn: 'Plastic Bag',
    nameVi: 'Túi nilon trôi nổi',
    emoji: '🛍️',
    description: 'Túi nilon dễ làm rùa biển nhầm là sứa biển',
    posX: '18%',
    posY: '26%',
    rotation: '-12deg',
    floatDelay: '0s'
  },
  {
    id: 'plastic-bottle',
    nameEn: 'Plastic Bottle',
    nameVi: 'Chai nhựa dùng một lần',
    emoji: '🧴',
    description: 'Chai nhựa mất hàng trăm năm mới phân hủy',
    posX: '52%',
    posY: '20%',
    rotation: '22deg',
    floatDelay: '1s'
  },
  {
    id: 'tin-can',
    nameEn: 'Crushed Tin Can',
    nameVi: 'Lon thiếc rỉ sét',
    emoji: '🥫',
    description: 'Vỏ lon rỉ sét gây độc hại cho rạn san hô',
    posX: '78%',
    posY: '36%',
    rotation: '-10deg',
    floatDelay: '1.5s'
  },
  {
    id: 'straws-carton',
    nameEn: 'Straws & Carton',
    nameVi: 'Hộp sữa & ống hút nhựa',
    emoji: '🧃',
    description: 'Ống hút nhựa đe dọa trực tiếp các loài rùa biển',
    posX: '32%',
    posY: '55%',
    rotation: '14deg',
    floatDelay: '0.6s'
  },
  {
    id: 'broken-net',
    nameEn: 'Net Debris',
    nameVi: 'Mảnh lưới rác trôi nổi',
    emoji: '🗑️',
    description: 'Lưới phế thải làm kẹt cá heo và sinh vật biển',
    posX: '68%',
    posY: '62%',
    rotation: '-16deg',
    floatDelay: '2s'
  }
];

export interface OceanEcoLesson {
  id: string;
  en: string;
  vi: string;
  tip: string;
}

export const OCEAN_ECO_LESSONS: OceanEcoLesson[] = [
  {
    id: 'say-no-plastic',
    en: 'Say NO to single-use plastics! Protect our oceans and keep sea turtles and dolphins safe and happy!',
    vi: 'Hãy nói KHÔNG với rác thải nhựa dùng một lần! Cùng chung tay bảo vệ đại dương, giảm thiểu túi nilon để các bạn rùa biển và cá heo luôn có một ngôi nhà xanh trong lành em nhé!',
    tip: 'Em hãy mang theo bình nước cá nhân và hộp đựng tái sử dụng khi đi học thay vì túi nilon nhé! 💧'
  },
  {
    id: 'save-turtles',
    en: 'Sea turtles often mistake floating plastic bags for jellyfish. Cleaning the ocean saves their lives!',
    vi: 'Rùa biển rất dễ nhầm túi nilon trôi nổi là sứa biển để nuốt phải. Dọn sạch rác biển là em đang trực tiếp cứu sống các bạn rùa biển đáng yêu!',
    tip: 'Khi đi biển cùng gia đình, em hãy nhớ nhặt rác và không để lại bất kỳ túi nilon nào trên bãi cát nhé! 🏖️'
  },
  {
    id: 'coral-reefs',
    en: 'Healthy coral reefs are the rainforests of the sea, giving shelter to thousands of colorful marine creatures!',
    vi: 'Những rạn san hô sạch sẽ là ngôi nhà rực rỡ dưới lòng biển sâu, che chở cho hàng ngàn sinh vật biển nhỏ bé phát triển an toàn!',
    tip: 'Chung tay phân loại rác và không xả rác xuống sông hồ để nước nguồn ra biển luôn trong sạch nhé! 🪸'
  }
];

export interface CleanOceanOption {
  id: string;
  text: string;
  subText?: string;
  icon?: string;
  isCorrect: boolean;
}

export interface CleanOceanQuestion {
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
  options: CleanOceanOption[];
  trash: TrashItem;
}

export interface CleanOceanGameProps {
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

export const CleanOceanGame: React.FC<CleanOceanGameProps> = ({
  selectedUnitName,
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
  const TOTAL_QUESTIONS = 5;
  const [questions, setQuestions] = useState<CleanOceanQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cleanedCount, setCleanedCount] = useState<number>(0); // 0 -> 5
  const [justCleanedIndex, setJustCleanedIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showEcoKnowledgePopup, setShowEcoKnowledgePopup] = useState<boolean>(false);
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [claimNotification, setClaimNotification] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Feedback state
  const [speechAttempts, setSpeechAttempts] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    text: string;
    isCorrect: boolean | null;
  }>({
    text: 'Click the Speaker button to listen, then select the matching English word/sentence! / Bấm biểu tượng Loa để nghe và chọn từ/câu tương ứng nhé! 🎧',
    isCorrect: null
  });

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

  // Initialize or restart 5 questions from official curriculum vocabulary & sentences
  const initGameSession = () => {
    // 1. Primary pool from selected lesson's vocabulary
    let primaryVocabs = (vocabularyList && vocabularyList.length > 0) ? [...vocabularyList] : [];
    let unitVocabs = (allUnitVocabularies && allUnitVocabularies.length > 0) ? [...allUnitVocabularies] : [];

    // Fallbacks if empty
    if (primaryVocabs.length === 0 && unitVocabs.length > 0) {
      primaryVocabs = [...unitVocabs];
    }
    if (primaryVocabs.length === 0) {
      primaryVocabs = [
        { word: 'HELLO', phonetic: '/həˈləʊ/', meaning: 'Xin chào', speechText: 'Hello', icon: '👋', sentence: "Hello, I'm Ben.", sentenceVi: "Xin chào, mình là Ben." },
        { word: 'HI', phonetic: '/haɪ/', meaning: 'Chào bạn (thân mật)', speechText: 'Hi', icon: '🙋', sentence: "Hi, Ben. I'm Mai.", sentenceVi: "Chào Ben. Mình là Mai." },
        { word: 'NAME', phonetic: '/neɪm/', meaning: 'Tên, họ tên', speechText: 'Name', icon: '🏷️', sentence: "My name's Mai.", sentenceVi: "Tên mình là Mai." },
        { word: 'THANK YOU', phonetic: '/θæŋk juː/', meaning: 'Cảm ơn bạn', speechText: 'Thank you', icon: '🙏', sentence: "Fine, thank you.", sentenceVi: "Mình khỏe, cảm ơn bạn." },
        { word: 'GOODBYE', phonetic: '/ˌɡʊdˈbaɪ/', meaning: 'Tạm biệt', speechText: 'Goodbye', icon: '👋', sentence: "Goodbye, Mai.", sentenceVi: "Tạm biệt Mai." }
      ];
      unitVocabs = [...primaryVocabs];
    }

    // Combine pool for distractors so every distractor is authentic curriculum vocabulary
    const fullVocabPool = unitVocabs.length >= 4 ? unitVocabs : [...primaryVocabs, ...unitVocabs];

    // Official sentences of the Unit
    const sentences = (sentenceList && sentenceList.length > 0)
      ? sentenceList
      : ((allUnitSentences && allUnitSentences.length > 0) ? allUnitSentences : []);

    const generated: CleanOceanQuestion[] = [];
    const shuffledVocab = [...primaryVocabs].sort(() => 0.5 - Math.random());

    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const targetTrash = OCEAN_TRASH_ITEMS[i % OCEAN_TRASH_ITEMS.length];

      // If unit has sentence structures, incorporate in question 3 or 5 for rich curriculum practice
      const isSentenceRound = sentences.length > 0 && (i === 2 || i === 4);

      if (isSentenceRound) {
        const sentenceItem = sentences[(i + Math.floor(Math.random() * sentences.length)) % sentences.length];
        const targetSentence = sentenceItem.example || sentenceItem.structure || 'Hello, how are you?';
        const targetMeaning = sentenceItem.exampleVi || sentenceItem.meaning || 'Chào bạn, bạn có khỏe không?';

        // Gather distractor English sentences from other sentences in the unit
        const otherSentences = sentences.filter((s: any) => (s.example || s.structure) !== targetSentence);
        const distractorSentences: string[] = [];

        otherSentences.forEach((s: any) => {
          const text = s.example || s.structure;
          if (text && !distractorSentences.includes(text) && text !== targetSentence) {
            distractorSentences.push(text);
          }
        });

        // If fewer than 3, add sentence examples from unit vocabulary
        fullVocabPool.forEach((v: any) => {
          if (distractorSentences.length < 3 && v.sentence && !distractorSentences.includes(v.sentence) && v.sentence !== targetSentence) {
            distractorSentences.push(v.sentence);
          }
        });

        // Fallbacks if still fewer than 3
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

        const options: CleanOceanOption[] = [
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
          exampleSentence: sentenceItem.structure ? `Mẫu câu bài học: ${sentenceItem.structure}` : undefined,
          exampleSentenceVi: sentenceItem.meaning,
          icon: '💬',
          badgeLabelEn: 'Listen to Sentence',
          badgeLabelVi: 'Nghe & Chọn mẫu câu đúng',
          promptQuestionEn: 'Click the Speaker, listen and select the matching sentence:',
          promptQuestionVi: 'Bấm biểu tượng Loa để nghe và chọn mẫu câu tương ứng:',
          options,
          trash: targetTrash
        });
      } else {
        // Vocabulary Question from current unit
        const targetVocab = shuffledVocab[i % shuffledVocab.length];
        const targetWord = targetVocab.word;
        const targetMeaning = targetVocab.meaning;

        // Distractor English words strictly from current Unit
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

        // If unit vocabulary was very small (< 4), provide standard Global Success elementary core words
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

        const options: CleanOceanOption[] = [
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
          badgeLabelEn: 'Listen to Word',
          badgeLabelVi: 'Nghe & Chọn từ vựng đúng',
          promptQuestionEn: 'Click the Speaker, listen and select the matching word:',
          promptQuestionVi: 'Bấm biểu tượng Loa để nghe và chọn từ vựng tương ứng:',
          options,
          trash: targetTrash
        });
      }
    }

    setQuestions(generated);
    setCurrentIndex(0);
    setCleanedCount(0);
    setSpeechAttempts(0);
    setJustCleanedIndex(null);
    setSelectedOptionId(null);
    setShowEcoKnowledgePopup(false);
    setHasClaimedReward(false);
    setClaimNotification(null);
    setFeedback({
      text: 'Click the Speaker button to listen, then select the matching English word/sentence! / Bấm biểu tượng Loa để nghe và chọn từ/câu tương ứng nhé! 🎧',
      isCorrect: null
    });
  };

  useEffect(() => {
    initGameSession();
  }, [vocabularyList, sentenceList, allUnitVocabularies, allUnitSentences]);

  const currentQ: CleanOceanQuestion = questions[currentIndex] || {
    id: 'default',
    type: 'vocabulary',
    targetWord: 'HELLO',
    targetPhonetic: '/həˈləʊ/',
    targetMeaning: 'Xin chào',
    speechText: 'Hello',
    exampleSentence: "Hello, I'm Ben.",
    exampleSentenceVi: "Xin chào, mình là Ben.",
    icon: '👋',
    badgeLabelEn: 'Listen to Word',
    badgeLabelVi: 'Nghe & Chọn từ vựng đúng',
    promptQuestionEn: 'Click the Speaker, listen and select the matching word:',
    promptQuestionVi: 'Bấm biểu tượng Loa để nghe và chọn từ vựng tương ứng:',
    options: [
      { id: '1', text: 'HELLO', subText: '/həˈləʊ/', isCorrect: true, icon: '👋' },
      { id: '2', text: 'GOODBYE', subText: '/ˌɡʊdˈbaɪ/', isCorrect: false, icon: '👋' },
      { id: '3', text: 'THANK YOU', subText: '/θæŋk juː/', isCorrect: false, icon: '🙏' },
      { id: '4', text: 'FRIEND', subText: '/frend/', isCorrect: false, icon: '👫' }
    ],
    trash: OCEAN_TRASH_ITEMS[0]
  };

  // Text-To-Speech helper
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

  // Handle Answer Selection
  const handleSelectOption = (opt: CleanOceanOption) => {
    if (selectedOptionId !== null) return; // Prevent double taps during transition
    setSelectedOptionId(opt.id);

    const isCorrect = opt.isCorrect;

    if (isCorrect) {
      playSoundEffect('success');
      setSpeechAttempts(0);
      const targetTrash = currentQ.trash || OCEAN_TRASH_ITEMS[currentIndex % OCEAN_TRASH_ITEMS.length];
      setJustCleanedIndex(currentIndex);

      const nextCleaned = cleanedCount + 1;
      setCleanedCount(nextCleaned);

      // Check if all 5 questions done
      if (nextCleaned >= TOTAL_QUESTIONS) {
        setFeedback({
          text: `🎉 Wonderful! You answered all ${TOTAL_QUESTIONS}/${TOTAL_QUESTIONS} questions correctly! Retrieved ${targetTrash.nameEn} (${targetTrash.nameVi})! The ocean is now crystal clear and sea creatures rejoice! / Tuyệt vời! Bạn đã hoàn thành xuất sắc toàn bộ câu hỏi của ${selectedUnitName} và vớt sạch rác thải nhựa! Toàn bộ đại dương xanh biếc trở lại! 🌊🐬`,
          isCorrect: true
        });

        // 3. Trigger Eco-Knowledge popup after 1.2s to enjoy ocean celebration
        setTimeout(() => {
          playSoundEffect('celebrate');
          setShowEcoKnowledgePopup(true);
        }, 1200);
      } else {
        setFeedback({
          text: `🌊 Great job! Successfully retrieved "${targetTrash.nameEn}" (${targetTrash.nameVi})! / Giỏi lắm! Em vừa trả lời đúng từ vựng bài học và vớt sạch "${targetTrash.nameVi}" ra khỏi biển! (+6 EP)`,
          isCorrect: true
        });

        // Advance to next question after 1.4s
        setTimeout(() => {
          setSpeechAttempts(0);
          setCurrentIndex(prev => prev + 1);
          setSelectedOptionId(null);
          setJustCleanedIndex(null);
          setFeedback({
            text: 'Listen and choose the correct meaning for the next question to clean more trash! / Nghe phát âm và chọn đúng nghĩa cho câu tiếp theo để vớt thêm rác nhé!',
            isCorrect: null
          });
        }, 1400);
      }
    } else {
      playSoundEffect('fail');
      setFeedback({
        text: `🌱 Not quite right, listen again and try! / Chưa chính xác rồi! Em hãy bấm nghe lại phát âm rồi chọn đáp án đúng nhé! 🎧`,
        isCorrect: false
      });
      setTimeout(() => {
        setSelectedOptionId(null);
      }, 900);
    }
  };

  // Speech Recognition fallback (allow kids to speak the word too!)
  const startListening = () => {
    if (isListening) {
      clearTimer();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      setIsListening(false);
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
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback({
          text: `Listening... Please pronounce "${currentQ.targetWord}"! / Đang nghe... Bé hãy phát âm "${currentQ.targetWord}"! 🎤`,
          isCorrect: null
        });
        timeoutRef.current = setTimeout(() => {
          try { recognition.abort(); } catch {}
          setIsListening(false);
          const newAttempts = speechAttempts + 1;
          setSpeechAttempts(newAttempts);

          if (newAttempts >= 4) {
            playSoundEffect('chime');
            setFeedback({
              text: "Cố gắng lắm! Em đã rất nỗ lực thử thách 4 lần. Let's move to the next challenge! / Cùng chuyển sang thử thách tiếp theo nhé! 🌟",
              isCorrect: null
            });
            setTimeout(() => {
              setSpeechAttempts(0);
              const nextIndex = currentIndex + 1;
              if (nextIndex >= TOTAL_QUESTIONS) {
                playSoundEffect('celebrate');
                setShowEcoKnowledgePopup(true);
              } else {
                setCurrentIndex(nextIndex);
                setSelectedOptionId(null);
                setJustCleanedIndex(null);
                setFeedback({
                  text: 'Nghe phát âm và chọn đúng nghĩa cho câu tiếp theo để vớt thêm rác nhé! 🌊',
                  isCorrect: null
                });
              }
            }, 2000);
          } else {
            setFeedback({
              text: `Chưa nghe rõ giọng bé (Lần thử ${newAttempts}/4). Hãy nghe lại rồi thử bấm đọc lại nhé! 🎤`,
              isCorrect: false
            });
          }
        }, 8000);
      };

      recognition.onresult = (event: any) => {
        clearTimer();
        setIsListening(false);
        const transcript = (event.results && event.results[0] && event.results[0][0])
          ? event.results[0][0].transcript.trim().toLowerCase()
          : '';
        const target = (currentQ.targetWord || currentQ.speechText).trim().toLowerCase();
        const isMatch = checkSpeechAnswerMatch(transcript, target) || transcript.includes(target) || target.includes(transcript);
        if (isMatch) {
          setSpeechAttempts(0);
          const correctOpt = currentQ.options.find(o => o.isCorrect);
          if (correctOpt) {
            handleSelectOption(correctOpt);
          }
        } else {
          const newAttempts = speechAttempts + 1;
          setSpeechAttempts(newAttempts);

          if (newAttempts >= 4) {
            playSoundEffect('chime');
            setFeedback({
              text: "Cố gắng lắm! Em đã rất nỗ lực thử thách 4 lần. Let's move to the next challenge! / Cùng chuyển sang thử thách tiếp theo nhé! 🌟",
              isCorrect: null
            });

            // Auto-skip to next question without awarding EP
            setTimeout(() => {
              setSpeechAttempts(0);
              const nextIndex = currentIndex + 1;
              if (nextIndex >= TOTAL_QUESTIONS) {
                playSoundEffect('celebrate');
                setShowEcoKnowledgePopup(true);
              } else {
                setCurrentIndex(nextIndex);
                setSelectedOptionId(null);
                setJustCleanedIndex(null);
                setFeedback({
                  text: 'Nghe phát âm và chọn đúng nghĩa cho câu tiếp theo để vớt thêm rác nhé! 🌊',
                  isCorrect: null
                });
              }
            }, 2000);
          } else {
            playSoundEffect('fail');
            setFeedback({
              text: `You said: "${transcript || 'unclear'}". Lần thử ${newAttempts}/4. Listen again and try! / Em nói: "${transcript || 'chưa rõ'}". Lần thử ${newAttempts}/4. Hãy nghe lại rồi thử nhé! 🎤`,
              isCorrect: false
            });
          }
        }
      };

      recognition.onerror = () => {
        clearTimer();
        setIsListening(false);
      };

      recognition.onend = () => {
        clearTimer();
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      clearTimer();
      setIsListening(false);
    }
  };

  // 3. Action button: Claim reward and continue
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
      setClaimNotification('🎉 +30 EP and Sea Turtle Protector Badge credited! / Đã nạp +30 EP và danh hiệu Biệt Đội Rùa Biển vào My Garden! Đại dương cảm ơn em!');
      setFeedback({
        text: '🎉 Ocean cleanup reward claimed! / Đã nhận thưởng làm sạch biển! Em có thể bấm "Chơi lại" để giải cứu vùng biển mới nhé.',
        isCorrect: true
      });
    }
  };

  const isAllCleaned = cleanedCount >= TOTAL_QUESTIONS;
  const progressPercent = Math.round((cleanedCount / TOTAL_QUESTIONS) * 100);

  return (
    <div className="w-full flex flex-col gap-3 font-sans pb-8">
      {/* 1. TOP BAR */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-[2px] border-sky-300 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌊</span>
          <div>
            <h2 className="text-sm sm:text-base font-black text-sky-950">
              Clean the Ocean · Làm sạch biển
            </h2>
            <span className="text-[11px] font-semibold text-sky-700">
              {selectedUnitName || 'Unit 1 - Hello'}
            </span>
          </div>
        </div>

        {/* Back to games button */}
        <button
          onClick={() => {
            playSoundEffect('click');
            onBackToGames();
          }}
          className="flex flex-col items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 bg-white hover:bg-sky-50 text-sky-950 rounded-2xl border-2 border-sky-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-sky-900">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Games</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-sky-600">
            Về trò chơi
          </span>
        </button>
      </div>

      {/* CLAIM CONFIRMATION BANNER */}
      {claimNotification && (
        <div className="w-full bg-sky-50 border-2 border-sky-400 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs sm:text-sm text-sky-950 font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg shrink-0">🐬</span>
            <span>{claimNotification}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenGarden && (
              <button
                type="button"
                onClick={onOpenGarden}
                className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-xl text-xs font-black cursor-pointer shadow-2xs"
              >
                Vào My Garden
              </button>
            )}
            <button
              type="button"
              onClick={initGameSession}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-2xs"
            >
              Chơi lại
            </button>
            <button
              type="button"
              onClick={() => setClaimNotification(null)}
              className="w-6 h-6 rounded-full hover:bg-sky-200/60 flex items-center justify-center text-sky-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. NOTICE HEADER BANNER (Bilingual: English / Vietnamese) */}
      <div className="w-full bg-white rounded-2xl px-4 py-2.5 border-[1.5px] border-sky-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-bold text-sky-950">
          <span className="text-base sm:text-lg shrink-0">🎯</span>
          <div>
            <span className="font-extrabold text-sky-950">Each correct answer removes 1 piece of marine plastic waste!</span>
            <span className="text-sky-700 font-medium block sm:inline sm:ml-1.5">(Mỗi câu đúng sẽ vớt sạch 1 loại rác thải nhựa để giải cứu sinh vật biển!)</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 font-black text-xs shrink-0 self-start sm:self-auto">
          <span>{cleanedCount}/5 Cleaned · Lượt vớt</span>
          <span>({progressPercent}%)</span>
        </div>
      </div>

      {/* 3. TWO COLUMNS LAYOUT: OCEAN SIMULATOR (LEFT) + INTERACTIVE LISTENING STATION (RIGHT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full items-stretch">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: THE DYNAMIC OCEAN ECOSYSTEM                 */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-[2.5px] border-sky-300 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-end">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
              isAllCleaned 
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              {isAllCleaned ? '✨ Pristine Ocean' : `⚠️ Polluted (${5 - cleanedCount} items)`}
            </span>
          </div>

          {/* Ocean Landscape Simulation Screen */}
          <div className={`w-full h-64 sm:h-72 rounded-2xl relative overflow-hidden border-2 border-sky-300/80 shadow-inner flex flex-col justify-between p-3 select-none transition-all duration-700 ${
            cleanedCount === 0 ? 'bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0f172a]' :
            cleanedCount === 1 ? 'bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#164e63]' :
            cleanedCount === 2 ? 'bg-gradient-to-b from-[#0ea5e9] via-[#0284c7] to-[#0e7490]' :
            cleanedCount === 3 ? 'bg-gradient-to-b from-[#06b6d4] via-[#0284c7] to-[#0284c7]' :
            cleanedCount === 4 ? 'bg-gradient-to-b from-[#22d3ee] via-[#0ea5e9] to-[#0369a1]' :
            'bg-gradient-to-b from-[#38bdf8] via-[#06b6d4] to-[#0284c7]'
          }`}>
            {/* SVG Sun Rays and Water Waves */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 240">
              <defs>
                <linearGradient id="sunbeams" x1="0" y1="0" x2="0.8" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={isAllCleaned ? "0.4" : "0.15"} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="seabedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fdba74" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>

              {/* Sunbeams penetrating the water */}
              <polygon points="120,0 200,240 250,240 160,0" fill="url(#sunbeams)" />
              <polygon points="260,0 350,240 390,240 300,0" fill="url(#sunbeams)" />

              {/* Surface Waves */}
              <path d="M0,15 Q50,5 100,15 T200,15 T300,15 T400,15 L400,0 L0,0 Z" fill="#bae6fd" opacity="0.4" />
              <path d="M0,22 Q60,12 120,22 T240,22 T360,22 T400,22 L400,0 L0,0 Z" fill="#e0f2fe" opacity="0.3" />

              {/* Seabed with soft sand */}
              <path d="M0,210 Q100,195 200,212 T400,205 L400,240 L0,240 Z" fill="url(#seabedGrad)" />
            </svg>

            {/* Rising Bubbles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute left-[15%] bottom-4 text-xs animate-bounce opacity-60">🫧</div>
              <div className="absolute left-[45%] bottom-10 text-sm animate-pulse opacity-75">🫧</div>
              <div className="absolute left-[75%] bottom-6 text-xs animate-bounce opacity-50">🫧</div>
              {isAllCleaned && (
                <>
                  <div className="absolute left-[30%] bottom-14 text-base animate-ping opacity-70">✨</div>
                  <div className="absolute left-[60%] bottom-16 text-base animate-ping opacity-70">✨</div>
                </>
              )}
            </div>

            {/* Top Ocean Status Tag (Bilingual) */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-white/95 text-sky-950 border border-sky-300 shadow-sm flex items-center gap-1">
                🌊 Marine Sanctuary · Khu bảo tồn biển
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-900/80 text-white backdrop-blur-xs">
                Purity · Mức sạch: {progressPercent}%
              </span>
            </div>

            {/* THE 5 FLOATING TRASH ITEMS (Dynamic Interactive Progress with Bilingual Tooltips) */}
            <div className="absolute inset-0 pointer-events-none">
              {OCEAN_TRASH_ITEMS.map((item, idx) => {
                const isCleaned = idx < cleanedCount;
                const isJustBeingCleaned = idx === justCleanedIndex;

                if (isCleaned && !isJustBeingCleaned) {
                  return null; // Completely vanished!
                }

                return (
                  <div
                    key={item.id}
                    style={{
                      left: item.posX,
                      top: item.posY,
                      transform: `rotate(${item.rotation})`
                    }}
                    className={`absolute z-20 flex flex-col items-center transition-all duration-700 ${
                      isJustBeingCleaned 
                        ? 'scale-150 -translate-y-8 opacity-0 filter blur-[1px]' 
                        : 'scale-100 animate-pulse'
                    }`}
                  >
                    <div className="text-3xl sm:text-4xl filter drop-shadow-lg relative">
                      {item.emoji}
                      {/* Warning beacon over dirty trash */}
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <span className="text-[9px] font-extrabold text-white bg-black/60 px-1.5 py-0.5 rounded-md backdrop-blur-xs mt-0.5 shadow-xs whitespace-nowrap">
                      {item.nameEn} · {item.nameVi}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* SEA CREATURES: REACTION TO CLEANLINESS (Bilingual Prompts) */}
            <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
              {!isAllCleaned ? (
                // State when still polluted: Sea turtle is anxious near bottom
                <div className="flex flex-col items-center translate-y-6 animate-pulse">
                  <div className="text-5xl sm:text-6xl filter drop-shadow-md">🐢</div>
                  <div className="text-[10px] font-black bg-white/95 text-sky-950 px-2.5 py-1 rounded-full border border-sky-300 shadow-xs mt-1 text-center">
                    <span>Help us clean {5 - cleanedCount} more trash! 🥺</span>
                    <span className="block text-[9px] font-semibold text-sky-700">(Cần bạn giúp vớt {5 - cleanedCount} rác nữa!)</span>
                  </div>
                </div>
              ) : (
                // State when 100% clean: Joyful sea turtle and leaping dolphin!
                <div className="flex items-center justify-center gap-4 animate-in zoom-in-75 duration-700">
                  {/* Happy Sea Turtle */}
                  <div className="flex flex-col items-center animate-bounce">
                    <div className="text-6xl sm:text-7xl filter drop-shadow-xl relative">
                      🐢
                      <span className="absolute -top-2 -right-2 text-xl animate-ping">❤️</span>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 shadow-xs mt-1">
                      Sea Turtle Safe! · Rùa biển an toàn! ✨
                    </span>
                  </div>

                  {/* Leaping Dolphin */}
                  <div className="flex flex-col items-center animate-bounce delay-150">
                    <div className="text-6xl sm:text-7xl filter drop-shadow-xl relative">
                      🐬
                      <span className="absolute -top-2 -left-2 text-xl animate-bounce">💦</span>
                    </div>
                    <span className="text-[10px] font-black bg-cyan-100 text-cyan-950 px-2 py-0.5 rounded-full border border-cyan-300 shadow-xs mt-1">
                      Dolphins Rejoice! · Cá heo vui sướng! 🌊
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Progress Bar & Cleanup Tracker (Bilingual) */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between text-xs font-bold text-sky-950">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sky-950">Ocean Cleanup Progress:</span>
                <span className="text-sky-700 font-medium">Tiến độ dọn rác: {cleanedCount}/5</span>
              </div>
              <span className="text-sky-600 font-extrabold">{progressPercent}% Clean · Sạch</span>
            </div>

            {/* Blue Progress Bar */}
            <div className="w-full h-3 bg-sky-100 rounded-full overflow-hidden p-0.5 border border-sky-200">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-600 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Trash checklist pills (Bilingual) */}
            <div className="flex items-center justify-between gap-1 mt-1 overflow-x-auto pb-1">
              {OCEAN_TRASH_ITEMS.map((item, i) => {
                const done = i < cleanedCount;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold border shrink-0 transition-all ${
                      done 
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300' 
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.nameEn}</span>
                    <span className="text-[9px] text-gray-500 hidden sm:inline">({item.nameVi})</span>
                    {done ? ' ✓' : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: LISTENING & CHALLENGE STATION (BILINGUAL)  */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-[2.5px] border-sky-300 shadow-sm flex flex-col justify-between gap-4">
          
          {/* Header & Question Count Badge (Bilingual) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎧</span>
              <h2 className="text-lg sm:text-xl font-black text-sky-950 tracking-tight">
                Listen & Select / Nghe & Chọn
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-900 border border-sky-300 shadow-2xs">
              Challenge {currentIndex + 1}/{TOTAL_QUESTIONS} · Thử thách
            </span>
          </div>

          {/* 2. THE AUDIO LISTENING STATION (TRẠM NGHE & PHÁT ÂM TRỰC QUAN) */}
          <div className="w-full bg-gradient-to-br from-sky-50 via-cyan-50/70 to-blue-50 rounded-3xl p-4 sm:p-5 border-2 border-sky-300 shadow-sm flex flex-col items-center text-center gap-3 relative overflow-hidden my-auto">
            {/* Background audio waves pulse when playing */}
            {isPlayingAudio && (
              <div className="absolute inset-0 bg-sky-400/10 animate-pulse pointer-events-none" />
            )}

            {/* Curriculum Source Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-[11px] font-black shadow-2xs">
              <span>{currentQ.type === 'sentence' ? '💬 Mẫu câu chính khóa' : '📚 Từ vựng chính khóa'}</span>
              <span className="text-sky-600 font-semibold hidden sm:inline">· {selectedUnitName}</span>
            </div>

            {/* BIG INTERACTIVE SPEAKER BUTTON (Biểu tượng Loa phát âm) */}
            <div className="flex flex-col items-center gap-2 my-1">
              <button
                type="button"
                onClick={() => handleTTS(false)}
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985] hover:from-[#0ea5e9] hover:to-[#0284c7] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer border-4 border-white ring-4 ring-sky-300/80 group relative ${
                  isPlayingAudio ? 'ring-amber-300 animate-pulse' : ''
                }`}
                title="Bấm vào Loa để nghe âm thanh tiếng Anh"
              >
                <Volume2 className={`w-11 h-11 sm:w-13 sm:h-13 text-white group-hover:scale-110 transition-transform ${
                  isPlayingAudio ? 'animate-bounce text-amber-200' : ''
                }`} />
                <span className="text-[10px] sm:text-[11px] font-black text-sky-100 mt-1">
                  {isPlayingAudio ? 'Playing... / Đang phát' : 'Listen / Bấm nghe'}
                </span>
                {isPlayingAudio && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400"></span>
                  </span>
                )}
              </button>

              {/* Audio Listen Buttons (Standard & Slow) */}
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleTTS(false)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-100 text-sky-950 border border-sky-300 text-xs font-black shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Listen / Nghe chuẩn</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTTS(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-100 text-sky-950 border border-sky-300 text-xs font-black shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span className="text-sm">🐢</span>
                  <span>Slow / Nghe chậm</span>
                </button>
              </div>
            </div>

            {/* Target Trash Pill (Bilingual format: Target: Clean up / Mục tiêu: Vớt...) */}
            <div className="w-full flex flex-col items-center mt-1">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold shadow-2xs">
                <span className="text-amber-800 font-black">🎯 Target: Clean up / Mục tiêu: Vớt</span>
                <span className="font-black text-amber-950">{currentQ.trash?.nameEn}</span>
                <span className="text-amber-800 font-medium">({currentQ.trash?.nameVi})</span>
                <span>{currentQ.trash?.emoji}</span>
              </div>
            </div>
          </div>

          {/* Listening Controls & Multiple Choice Cards */}
          <div className="flex flex-col gap-3">
            {/* Instruction Banner (Bilingual: Listen & Select the matching English word/sentence) */}
            <div className="text-center text-xs font-bold text-sky-950 py-0.5">
              <span className="font-extrabold">{currentQ.promptQuestionEn}</span>
              <span className="text-sky-700 font-medium block sm:inline sm:ml-1.5">({currentQ.promptQuestionVi})</span>
            </div>

            {/* 4 Multiple Choice Answer Cards displaying English words/sentences */}
            <div className={`w-full ${
              currentQ.type === 'sentence' 
                ? 'grid grid-cols-1 gap-2.5' 
                : 'grid grid-cols-1 sm:grid-cols-2 gap-2.5'
            }`}>
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrect = opt.isCorrect;

                let cardStyle = 'bg-white border-sky-200 hover:border-sky-400 hover:bg-sky-50/80 text-sky-950';
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
                    className={`rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 cursor-pointer shadow-2xs group ${
                      currentQ.type === 'sentence' ? 'p-3.5 sm:p-4 min-h-[58px]' : 'p-3.5 sm:p-4'
                    } ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-8 h-8 rounded-xl bg-sky-100 group-hover:bg-sky-200 text-sky-800 flex items-center justify-center text-xs font-black shrink-0 border border-sky-300">
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={`font-black tracking-wide leading-snug break-words ${
                          currentQ.type === 'sentence' ? 'text-xs sm:text-sm text-sky-950' : 'text-sm sm:text-base text-sky-950'
                        }`}>
                          {opt.text}
                        </span>
                        {currentQ.type !== 'sentence' && opt.subText && (
                          <span className="text-[10px] sm:text-[11px] font-mono text-sky-700">
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

            {/* Optional Speak Voice Trigger (Bilingual format) */}
            <button
              type="button"
              onClick={startListening}
              className={`w-full py-2.5 px-3 rounded-2xl border font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer transition-all ${
                isListening 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Mic className="w-4 h-4 shrink-0" />
                <span className="font-extrabold">{isListening ? 'Listening to your voice...' : 'Speak with Mic · Luyện phát âm trực tiếp'}</span>
              </div>
              <span className="text-[10px] text-sky-700 font-semibold sm:border-l sm:border-sky-300 sm:pl-2">
                {isListening ? '(Đang lắng nghe...)' : '(Bấm để nói từ tiếng Anh)'}
              </span>
            </button>

            {/* Status / Feedback Box */}
            <div className={`w-full rounded-2xl p-3 border flex items-center gap-2.5 transition-all text-xs sm:text-sm font-bold ${
              feedback.isCorrect === true
                ? 'bg-emerald-100/90 text-emerald-950 border-emerald-400 shadow-2xs'
                : feedback.isCorrect === false
                ? 'bg-rose-100/90 text-rose-950 border-rose-300 shadow-2xs'
                : 'bg-sky-50 text-sky-900 border-sky-200'
            }`}>
              <div className="text-lg shrink-0">
                {feedback.isCorrect === true ? '🎉' : feedback.isCorrect === false ? '⚠️' : '🌊'}
              </div>
              <p className="flex-1 leading-snug">
                {feedback.text}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. ECO-KNOWLEDGE POPUP (Kích hoạt khi đại dương sạch 100%) */}
      {/* ======================================================== */}
      {showEcoKnowledgePopup && (() => {
        const currentLesson = OCEAN_ECO_LESSONS[activeLessonIndex % OCEAN_ECO_LESSONS.length];
        return (
          <div className="fixed inset-0 z-50 bg-sky-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-gradient-to-b from-[#f0f9ff] via-white to-[#e0f2fe] rounded-3xl sm:rounded-4xl max-w-3xl lg:max-w-4xl w-full p-5 sm:p-7 md:p-8 border-[3.5px] border-sky-400 shadow-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[96vh] overflow-y-auto">
              
              {/* Decorative Ocean Glows */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-cyan-300/30 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-300/30 blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => handleClaimReward('continue')}
                title="Đóng và nhận thưởng"
                className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/95 hover:bg-sky-100 text-sky-800 border border-sky-300 flex items-center justify-center cursor-pointer transition-colors shadow-xs z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Tag: Eco-Ocean */}
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-xs sm:text-sm font-black uppercase tracking-wider shadow-2xs">
                <span>🌊 Eco-Ocean · Bảo vệ đại dương xanh</span>
              </div>

              {/* Celebration Visual & Heading (Harmonious horizontal layout on sm+) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full">
                {/* Sea Turtle & Dolphin Visual */}
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-[#38bdf8] via-[#0284c7] to-[#0369a1] border-4 border-white shadow-lg flex items-center justify-center text-4xl sm:text-5xl select-none animate-bounce relative">
                    🐢
                    <span className="absolute -top-1 -right-1 text-lg animate-ping">✨</span>
                    <span className="absolute -bottom-1 -left-1 text-sm">🫧</span>
                  </div>

                  <div 
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-2 border-sky-300 shadow-md flex items-center justify-center text-2xl sm:text-3xl -ml-4 mt-5 z-10 select-none cursor-pointer hover:scale-110 transition-transform"
                    title="Chú cá heo tinh nghịch chào bé!"
                    onClick={() => playSoundEffect('celebrate')}
                  >
                    🐬
                  </div>
                </div>

                <div className="flex flex-col text-center sm:text-left gap-1">
                  <h2 className="text-2xl sm:text-3xl md:text-3xl font-black text-sky-950 tracking-tight leading-tight">
                    Congratulations! Ocean Rescued! 🐬🌊
                  </h2>
                  <span className="text-sm sm:text-base font-extrabold text-sky-900 -mt-0.5">
                    Đại dương đã sạch bóng rác thải!
                  </span>
                  <p className="text-xs sm:text-sm md:text-base font-bold text-sky-800 leading-snug">
                    Thank you for saving sea turtles and dolphins from plastic waste! <br className="hidden sm:inline" />
                    <span className="text-sky-700 font-semibold">(Cảm ơn em đã hoàn thành 5/5 thử thách và giải cứu sinh vật biển khỏi rác thải nhựa!)</span>
                  </p>
                </div>
              </div>

              {/* Eco-Knowledge Card: Green Lesson with Eco-Buddy (Bilingual EN - VI) */}
              <div className="w-full bg-gradient-to-br from-sky-50 via-white to-cyan-50/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border-2 border-sky-300 shadow-sm text-left flex flex-col gap-3 relative">
                
                {/* Title & Rotate Lesson Button */}
                <div className="flex items-center justify-between gap-3 border-b border-sky-200/90 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl sm:text-3xl">🐢</span>
                    <div className="text-left">
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-sky-950 flex items-center gap-1.5 leading-snug">
                        <span>Green Lesson with Eco-Buddy</span>
                      </h3>
                      <span className="text-xs sm:text-sm font-bold text-sky-700">
                        Bài học đại dương xanh cùng Biệt đội Rùa Biển
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect('click');
                      setActiveLessonIndex(prev => (prev + 1) % OCEAN_ECO_LESSONS.length);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0"
                    title="Đổi bài học sinh thái biển khác"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                    <span>Next Lesson · Đổi bài</span>
                  </button>
                </div>

                {/* English Quote (Enlarged & High Readability) */}
                <div className="text-sky-950 font-black text-base sm:text-lg md:text-xl leading-relaxed flex items-start gap-2">
                  <span className="text-sky-600 text-2xl sm:text-3xl leading-none font-serif select-none shrink-0">“</span>
                  <span className="italic flex-1">{currentLesson.en}</span>
                  <span className="text-sky-600 text-2xl sm:text-3xl leading-none font-serif select-none shrink-0">”</span>
                </div>

                {/* Vietnamese Meaning & Ecological Guidance (Enlarged font & relaxed spacing) */}
                <div className="text-sky-900 font-bold text-sm sm:text-base md:text-base leading-relaxed bg-white/95 p-3.5 sm:p-4 rounded-2xl border border-sky-200/80 shadow-2xs">
                  <p>({currentLesson.vi})</p>
                </div>

                {/* Practical Tip (Enlarged & Clear) */}
                <div className="flex items-center gap-2.5 text-xs sm:text-sm md:text-base font-bold text-sky-950 bg-sky-100/90 px-4 py-2.5 rounded-2xl border border-sky-300">
                  <span className="text-base sm:text-lg shrink-0">💡</span>
                  <span className="leading-snug">{currentLesson.tip}</span>
                </div>
              </div>

              {/* Rewards Breakdown Card (Spacious layout with large metrics) */}
              <div className="w-full bg-[#f0f9ff] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border-2 border-sky-200 flex items-center justify-around gap-2 text-center shadow-2xs">
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl">✨</span>
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-sky-950 tabular-nums">+30 EP</span>
                  <span className="text-xs sm:text-sm text-sky-700 font-bold">Eco Points · Điểm sinh thái</span>
                </div>
                <div className="w-px h-10 bg-sky-300" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl">🐢</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-sky-950">Sea Turtle Badge</span>
                  <span className="text-xs sm:text-sm text-sky-700 font-bold">Huy hiệu Rùa Biển Xanh</span>
                </div>
                <div className="w-px h-10 bg-sky-300" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl">🏡</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-sky-950">My Garden</span>
                  <span className="text-xs sm:text-sm text-sky-700 font-bold">Vườn & Đại dương</span>
                </div>
              </div>

              {/* Action Buttons (Generous touch targets and clean layout) */}
              <div className="flex flex-col gap-2.5 w-full mt-1">
                {/* Primary Button */}
                <button
                  type="button"
                  onClick={() => handleClaimReward('continue')}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#0ea5e9] hover:from-[#075985] hover:to-[#38bdf8] text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-98 cursor-pointer transition-all flex flex-col items-center justify-center gap-0.5 border-2 border-sky-300 ring-4 ring-sky-200/50 group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                    <span>Nhận phần thưởng & Giữ biển luôn sạch</span>
                    <Sparkles className="w-5 h-5 text-amber-300 group-hover:-rotate-12 transition-transform" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-sky-100">
                    Claim Reward and Keep Oceans Clean · Great job!
                  </span>
                </button>

                {/* Secondary Navigation Options (Bilingual) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full">
                  {onOpenGarden && (
                    <button
                      type="button"
                      onClick={() => handleClaimReward('garden')}
                      className="py-2.5 sm:py-3 px-3 rounded-2xl bg-white hover:bg-sky-50 text-sky-950 border border-sky-300 font-black text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Sprout className="w-4 h-4 text-sky-700 shrink-0" />
                      <span>Xem Vườn (My Garden)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleClaimReward('replay')}
                    className="py-2.5 sm:py-3 px-3 rounded-2xl bg-white hover:bg-sky-50 text-sky-950 border border-sky-300 font-black text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>Làm sạch lại (Play Again)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClaimReward('games')}
                    className={`py-2.5 sm:py-3 px-3 rounded-2xl bg-white hover:bg-sky-50 text-sky-950 border border-sky-300 font-black text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      onOpenGarden ? '' : 'col-span-1'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 text-sky-700 shrink-0" />
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
