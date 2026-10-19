import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Mic, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  X, 
  Sprout, 
  Heart, 
  Home, 
  ShieldCheck, 
  Trees, 
  Compass,
  Check,
  Undo2
} from 'lucide-react';
import { checkSpeechAnswerMatch } from '../services/pronunciationFeedbackService';

export interface AnimalEcoFriend {
  id: string;
  nameEn: string;
  nameVi: string;
  emoji: string;
  soundHint: string;
  homeNameEn: string;
  homeNameVi: string;
  homeEmoji: string;
  habitatDescEn: string;
  habitatDescVi: string;
  ecoTipEn: string;
  ecoTipVi: string;
  posX: string; // Habitat coordinates on simulator canvas
  posY: string;
}

export const ANIMAL_ECO_FRIENDS: AnimalEcoFriend[] = [
  {
    id: 'dog',
    nameEn: 'Dog',
    nameVi: 'Cún con',
    emoji: '🐶',
    soundHint: 'Woof woof! 🐾',
    homeNameEn: 'Garden Kennel',
    homeNameVi: 'Nhà gỗ sân vườn xanh',
    homeEmoji: '🏡',
    habitatDescEn: 'A clean shaded wooden house with green grass and cool water bowl.',
    habitatDescVi: 'Ngôi nhà gỗ ấm cúng có bóng râm và cỏ xanh mát rượi.',
    ecoTipEn: 'Keep gardens clean and plastic-free so domestic pets can run happily.',
    ecoTipVi: 'Giữ sân vườn sạch đẹp, không vứt rác nhựa để thú cưng chạy nhảy an toàn.',
    posX: '15%',
    posY: '65%'
  },
  {
    id: 'cat',
    nameEn: 'Cat',
    nameVi: 'Mèo con',
    emoji: '🐱',
    soundHint: 'Meow meow! 🐾',
    homeNameEn: 'Cozy Flower Porch',
    homeNameVi: 'Góc ấm ban công hoa',
    homeEmoji: '🧺',
    habitatDescEn: 'A soft cushion surrounded by colorful potted plants and morning sunlight.',
    habitatDescVi: 'Chiếc nệm êm ái bên những chậu hoa đón ánh ban mai ấm áp.',
    ecoTipEn: 'Loving pets and caring for their safe space creates harmony with nature.',
    ecoTipVi: 'Yêu thương và chăm sóc thú cưng chu đáo giúp tạo nên cuộc sống hòa hợp với thiên nhiên.',
    posX: '32%',
    posY: '45%'
  },
  {
    id: 'bird',
    nameEn: 'Bird',
    nameVi: 'Chim non',
    emoji: '🐦',
    soundHint: 'Chirp chirp! 🎵',
    homeNameEn: 'Treetop Canopy Nest',
    homeNameVi: 'Tổ ấm cành cây cổ thụ',
    homeEmoji: '🪺',
    habitatDescEn: 'A safe straw nest nestled among lush green branches and fruit blossoms.',
    habitatDescVi: 'Tổ chim rơm an toàn nép mình dưới những tán lá cây xanh mát.',
    ecoTipEn: 'Protect trees and avoid disturbing nests so birds can sing in morning gardens.',
    ecoTipVi: 'Bảo vệ cây xanh và không phá tổ chim để muôn loài chim cất tiếng hót líu lo.',
    posX: '50%',
    posY: '25%'
  },
  {
    id: 'rabbit',
    nameEn: 'Rabbit',
    nameVi: 'Thỏ trắng',
    emoji: '🐰',
    soundHint: 'Hop hop! 🥕',
    homeNameEn: 'Meadow Burrow',
    homeNameVi: 'Hang cỏ đồng hoa',
    homeEmoji: '🌾',
    habitatDescEn: 'A quiet underground burrow in a lush clover meadow with wild carrots.',
    habitatDescVi: 'Chiếc hang nhỏ êm dịu giữa cánh đồng hoa cỏ tự nhiên xanh rì.',
    ecoTipEn: 'Natural meadows support biodiversity and safe homes for burrowing wildlife.',
    ecoTipVi: 'Đồng cỏ tự nhiên là mái nhà bình yên nuôi dưỡng thỏ hoang dã và côn trùng có ích.',
    posX: '68%',
    posY: '55%'
  },
  {
    id: 'fish',
    nameEn: 'Fish',
    nameVi: 'Cá nhỏ',
    emoji: '🐟',
    soundHint: 'Splash splash! 🫧',
    homeNameEn: 'Crystal Lotus Stream',
    homeNameVi: 'Hồ sen nước trong veo',
    homeEmoji: '🪷',
    habitatDescEn: 'A clear bubbling stream shaded by lotus leaves, fresh and pollution-free.',
    habitatDescVi: 'Dòng suối và hồ sen trong lành rợp bóng hoa sen, không ô nhiễm.',
    ecoTipEn: 'Never dump garbage into rivers and ponds so aquatic life can thrive.',
    ecoTipVi: 'Tuyệt đối không xả rác xuống nguồn nước để bảo vệ môi trường sống của các loài cá.',
    posX: '85%',
    posY: '70%'
  }
];

export interface AnimalQuestion {
  id: string;
  animal: AnimalEcoFriend;
  sentenceWithBlank: string;      // e.g. "I love my cute ______."
  targetWord: string;             // e.g. "dog"
  fullSentence: string;           // e.g. "I love my cute dog."
  promptHintVi?: string;
  options: Array<{ id: string; word: string; isCorrect: boolean }>;
}

export interface AnimalHomesGameProps {
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

export const AnimalHomesGame: React.FC<AnimalHomesGameProps> = ({
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

  // Game States
  const [questions, setQuestions] = useState<AnimalQuestion[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [rescuedCount, setRescuedCount] = useState<number>(0);
  const [isMovingHome, setIsMovingHome] = useState<boolean>(false);
  const [justRescuedAnimalId, setJustRescuedAnimalId] = useState<string | null>(null);

  // Audio & Voice Recording States
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [speechAttempts, setSpeechAttempts] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean | null }>({
    text: 'Bấm biểu tượng Loa để nghe câu mẫu, sau đó bấm Ghi âm để đọc to từ còn thiếu nhé! 🎧🐾',
    isCorrect: null
  });

  // Eco Knowledge Completion Popup
  const [showEcoPopup, setShowEcoPopup] = useState<boolean>(false);
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);
  const [claimNotification, setClaimNotification] = useState<string | null>(null);

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

  // Helper to strip punctuation and clean a word token
  const cleanWordToken = (w: string): string => {
    return (w || '').trim().replace(/^[^\w']+|[^\w']+$/gu, '');
  };

  // Helper to extract blank from a sentence matching a target word
  const extractBlankFromSentence = (
    sentence: string, 
    word: string
  ): { sentenceWithBlank: string; targetWordInSentence: string } | null => {
    if (!sentence || !word) return null;
    const cw = cleanWordToken(word);
    if (cw.length < 2) return null;
    const escaped = cw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s|[.,!?;:"'\\(])(${escaped})([.,!?;:"'\\)]|\\s|$)`, 'i');
    const match = sentence.match(regex);
    if (match) {
      const targetWordInSentence = match[2];
      const sentenceWithBlank = sentence.replace(regex, `$1______$3`);
      return { sentenceWithBlank, targetWordInSentence };
    }
    return null;
  };

  // Initialize Game Sessions aligned 100% with Current Unit Curriculum
  const initGameSession = () => {
    const generated: AnimalQuestion[] = [];

    // 1. Gather all vocabulary from current unit and lesson
    const primaryVocabs = (vocabularyList && vocabularyList.length > 0)
      ? [...vocabularyList]
      : (allUnitVocabularies || []);

    const allVocabs = (allUnitVocabularies && allUnitVocabularies.length > 0)
      ? [...allUnitVocabularies]
      : primaryVocabs;

    // 2. Gather all sentences from current unit
    const allSentences = [
      ...(sentenceList || []),
      ...(allUnitSentences || [])
    ];

    // 3. Pool of all vocabulary words in the unit for authentic distractors
    const unitWordPool: string[] = Array.from(new Set([
      ...primaryVocabs.map((v: any) => cleanWordToken(v.word)),
      ...allVocabs.map((v: any) => cleanWordToken(v.word))
    ])).filter(w => Boolean(w) && w.length >= 2);

    // Grade fallback distractors if unit has very few words
    const standardDistractorPool = [
      'Hello', 'Friend', 'School', 'Teacher', 'Book', 'Happy', 'Name', 'Nice', 'Family', 'Student', 'Fine', 'Learn'
    ];

    // 4. Build candidate questions derived directly from the unit's vocabulary & sentences
    interface CandidateQ {
      targetWord: string;
      fullSentence: string;
      sentenceWithBlank: string;
    }

    const candidateList: CandidateQ[] = [];

    // (A) Check vocabulary items with their example sentences
    const combinedVocabList = [...primaryVocabs, ...allVocabs];
    combinedVocabList.forEach((v: any) => {
      const word = cleanWordToken(v.word);
      if (!word || word.length < 2) return;

      // Check if candidate already has this target word
      if (candidateList.some(c => c.targetWord.toLowerCase() === word.toLowerCase())) return;

      let matched: { sentenceWithBlank: string; targetWordInSentence: string } | null = null;

      // Check v.sentence
      if (v.sentence) {
        matched = extractBlankFromSentence(v.sentence, word);
      }

      // If not found in v.sentence, check unit's official sentence list
      if (!matched && allSentences.length > 0) {
        for (const s of allSentences) {
          const sText = s.example || s.structure;
          if (sText) {
            matched = extractBlankFromSentence(sText, word);
            if (matched) {
              v.sentence = sText;
              break;
            }
          }
        }
      }

      // If still no sentence, generate a natural curriculum sentence for this word
      if (!matched) {
        const lowerW = word.toLowerCase();
        let syntheticSentence = `This is my ${lowerW}.`;
        let syntheticBlank = `This is my ______.`;

        if (lowerW === 'hello' || lowerW === 'hi') {
          syntheticSentence = `Hello, nice to meet you.`;
          syntheticBlank = `______, nice to meet you.`;
        } else if (['vietnam', 'britain', 'america', 'japan', 'australia', 'singapore', 'malaysia', 'england'].includes(lowerW)) {
          const capWord = word.charAt(0).toUpperCase() + word.slice(1);
          syntheticSentence = `I am from ${capWord}.`;
          syntheticBlank = `I am from ______.`;
        } else if (['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'].includes(lowerW)) {
          syntheticSentence = `She is ${lowerW} years old.`;
          syntheticBlank = `She is ______ years old.`;
        } else if (['fine', 'great', 'happy', 'good', 'well'].includes(lowerW)) {
          syntheticSentence = `I am very ${lowerW}, thank you.`;
          syntheticBlank = `I am very ______, thank you.`;
        } else if (['meet', 'see', 'listen', 'read', 'sing', 'draw'].includes(lowerW)) {
          syntheticSentence = `Nice to ${lowerW} you.`;
          syntheticBlank = `Nice to ______ you.`;
        }

        matched = {
          sentenceWithBlank: syntheticBlank,
          targetWordInSentence: word
        };
        v.sentence = syntheticSentence;
      }

      if (matched && v.sentence) {
        candidateList.push({
          targetWord: matched.targetWordInSentence,
          fullSentence: v.sentence,
          sentenceWithBlank: matched.sentenceWithBlank
        });
      }
    });

    // (B) Also extract sentences from sentenceList if candidateList still has space
    allSentences.forEach((s: any) => {
      if (candidateList.length >= TOTAL_ROUNDS) return;
      const sText = s.example || s.structure;
      if (!sText) return;

      // Extract words from the sentence
      const tokens = sText.split(/\s+/).map((t: string) => cleanWordToken(t)).filter((t: string) => t.length >= 3);
      if (tokens.length === 0) return;

      // Pick the last content word or a word matching unit vocab
      let chosenWord = tokens[tokens.length - 1];
      for (const t of tokens) {
        if (unitWordPool.some(uw => uw.toLowerCase() === t.toLowerCase())) {
          chosenWord = t;
          break;
        }
      }

      if (chosenWord && !candidateList.some(c => c.targetWord.toLowerCase() === chosenWord.toLowerCase())) {
        const matched = extractBlankFromSentence(sText, chosenWord);
        if (matched) {
          candidateList.push({
            targetWord: matched.targetWordInSentence,
            fullSentence: sText,
            sentenceWithBlank: matched.sentenceWithBlank
          });
        }
      }
    });

    // (C) Standard curriculum fallbacks if still fewer than TOTAL_ROUNDS
    const curriculumFallbacks: CandidateQ[] = [
      { fullSentence: 'Nice to meet you.', sentenceWithBlank: 'Nice to ______ you.', targetWord: 'meet' },
      { fullSentence: "I am from Vietnam.", sentenceWithBlank: "I am from ______.", targetWord: "Vietnam" },
      { fullSentence: "What is your name?", sentenceWithBlank: "What is your ______?", targetWord: "name" },
      { fullSentence: "How old are you?", sentenceWithBlank: "How ______ are you?", targetWord: "old" },
      { fullSentence: "I am very fine, thank you.", sentenceWithBlank: "I am very ______, thank you.", targetWord: "fine" }
    ];

    for (const fb of curriculumFallbacks) {
      if (candidateList.length >= TOTAL_ROUNDS) break;
      if (!candidateList.some(c => c.targetWord.toLowerCase() === fb.targetWord.toLowerCase())) {
        candidateList.push(fb);
      }
    }

    // 5. Construct 5 questions paired with the 5 Animal Friends
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const animal = ANIMAL_ECO_FRIENDS[i % ANIMAL_ECO_FRIENDS.length];
      const qData = candidateList[i] || candidateList[0] || curriculumFallbacks[0];
      const targetWord = qData.targetWord;

      // Distractor choices: Pick 3 words from unitWordPool or standard pool
      const isTargetCap = targetWord.length > 0 && targetWord[0] === targetWord[0].toUpperCase() && targetWord[0] !== targetWord[0].toLowerCase();
      
      const availableDistractors = [
        ...unitWordPool,
        ...standardDistractorPool
      ].filter(w => w.toLowerCase() !== targetWord.toLowerCase());

      const chosenDistractors: string[] = [];
      const shuffledDistPool = [...availableDistractors].sort(() => 0.5 - Math.random());
      
      for (const d of shuffledDistPool) {
        if (chosenDistractors.length >= 3) break;
        const formatted = isTargetCap 
          ? d.charAt(0).toUpperCase() + d.slice(1).toLowerCase() 
          : d.toLowerCase();
        if (!chosenDistractors.some(cd => cd.toLowerCase() === formatted.toLowerCase())) {
          chosenDistractors.push(formatted);
        }
      }

      // Ensure 4 choices
      while (chosenDistractors.length < 3) {
        chosenDistractors.push(`word${chosenDistractors.length + 1}`);
      }

      const optionsList = [
        { id: `opt-${i}-correct`, word: targetWord, isCorrect: true },
        ...chosenDistractors.slice(0, 3).map((w, idx) => ({
          id: `opt-${i}-dist-${idx}`,
          word: w,
          isCorrect: false
        }))
      ].sort(() => 0.5 - Math.random());

      generated.push({
        id: `q-${i}-${animal.id}`,
        animal,
        sentenceWithBlank: qData.sentenceWithBlank,
        targetWord,
        fullSentence: qData.fullSentence,
        options: optionsList
      });
    }

    setQuestions(generated);
    setCurrentRound(0);
    setRescuedCount(0);
    setIsMovingHome(false);
    setJustRescuedAnimalId(null);
    setSelectedWord(null);
    setIsAnswerCorrect(null);
    setSpokenTranscript('');
    setShowEcoPopup(false);
    setHasClaimedReward(false);
    setClaimNotification(null);
    setFeedback({
      text: 'Bấm biểu tượng Loa để nghe câu mẫu, sau đó bấm Ghi âm để đọc to từ còn thiếu nhé! 🎧🐾',
      isCorrect: null
    });
  };

  useEffect(() => {
    initGameSession();
  }, [selectedUnitName, selectedLessonName, vocabularyList, sentenceList, allUnitVocabularies, allUnitSentences]);

  const currentQ: AnimalQuestion = questions[currentRound] || {
    id: 'default',
    animal: ANIMAL_ECO_FRIENDS[0],
    sentenceWithBlank: 'Nice to ______ you.',
    targetWord: 'meet',
    fullSentence: 'Nice to meet you.',
    options: [
      { id: '1', word: 'meet', isCorrect: true },
      { id: '2', word: 'hello', isCorrect: false },
      { id: '3', word: 'name', isCorrect: false },
      { id: '4', word: 'fine', isCorrect: false }
    ]
  };

  // TTS audio speech supporting sentence, slow rate, and target word
  const handleTTS = (mode: 'sentence' | 'slow' | 'word' = 'sentence') => {
    playSoundEffect('click');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = mode === 'word' ? currentQ.targetWord : currentQ.fullSentence;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = mode === 'slow' ? 0.65 : mode === 'word' ? 0.8 : 0.9;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle Correct Answer Trigger
  const handleAnswerSuccess = (wordMatched: string) => {
    if (isAnswerCorrect) return;

    playSoundEffect('success');
    setSpeechAttempts(0);
    setIsAnswerCorrect(true);
    setSelectedWord(wordMatched);
    setIsMovingHome(true);
    setJustRescuedAnimalId(currentQ.animal.id);
    onAwardEP(6);

    const nextCount = rescuedCount + 1;
    setRescuedCount(nextCount);

    setFeedback({
      text: `🎉 Xuất sắc! Em đã phát âm chuẩn xác từ "${wordMatched}"! Bạn ${currentQ.animal.nameEn} đã trở về mái nhà an toàn! (+6 EP) ✨`,
      isCorrect: true
    });

    // Animate animal hopping/running to its eco-home
    setTimeout(() => {
      setIsMovingHome(false);

      if (nextCount >= TOTAL_ROUNDS) {
        // Complete the entire sanctuary mission!
        setTimeout(() => {
          playSoundEffect('celebrate');
          setShowEcoPopup(true);
        }, 1200);
      } else {
        // Next animal round
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
          setSelectedWord(null);
          setIsAnswerCorrect(null);
          setSpokenTranscript('');
          setFeedback({
            text: 'Tiếp tục lắng nghe và đọc to từ tiếp theo để giúp bạn nhỏ tiếp theo về nhà an toàn nhé! 🐾🎧',
            isCorrect: null
          });
        }, 1500);
      }
    }, 1800);
  };

  // Web Speech API Voice Recognition (AI Speech-to-Text)
  const startVoiceRecording = () => {
    if (isListeningVoice) {
      clearTimer();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      setIsListeningVoice(false);
      return;
    }

    playSoundEffect('click');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback for browsers without Web Speech Recognition
      setFeedback({
        text: 'Trình duyệt không hỗ trợ micro trực tiếp. Em hãy bấm chọn từ bên dưới để điền vào chỗ trống nhé! 💡',
        isCorrect: null
      });
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
        setIsListeningVoice(true);
        setSpokenTranscript('');
        setFeedback({
          text: `Đang lắng nghe... Hãy đọc to từ tiếng Anh: "${currentQ.targetWord}"! 🎤🐾`,
          isCorrect: null
        });

        timeoutRef.current = setTimeout(() => {
          try { recognition.abort(); } catch {}
          setIsListeningVoice(false);
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
              const nextRound = currentRound + 1;
              if (nextRound >= TOTAL_ROUNDS) {
                playSoundEffect('celebrate');
                setShowEcoPopup(true);
              } else {
                setCurrentRound(nextRound);
                setSelectedWord(null);
                setIsAnswerCorrect(null);
                setSpokenTranscript('');
                setFeedback({
                  text: 'Hãy nghe phát âm rồi đọc to từ còn thiếu để giúp bạn động vật về nhà nhé! 🐾',
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
        setIsListeningVoice(false);

        const transcript = (event.results && event.results[0] && event.results[0][0])
          ? event.results[0][0].transcript.trim().toLowerCase()
          : '';

        setSpokenTranscript(transcript);

        const target = currentQ.targetWord.toLowerCase().trim();
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetNorm = normalize(target);
        const spokenTokens = transcript.toLowerCase().split(/\s+/).map((w: string) => normalize(w));

        const isMatch = spokenTokens.includes(targetNorm) ||
          normalize(transcript).includes(targetNorm) ||
          targetNorm.includes(normalize(transcript)) ||
          checkSpeechAnswerMatch(transcript, currentQ.targetWord);

        if (isMatch) {
          setSpeechAttempts(0);
          handleAnswerSuccess(currentQ.targetWord);
        } else {
          const newAttempts = speechAttempts + 1;
          setSpeechAttempts(newAttempts);

          if (newAttempts >= 4) {
            playSoundEffect('chime');
            setFeedback({
              text: "Cố gắng lắm! Em đã rất nỗ lực thử thách 4 lần. Let's move to the next challenge! / Cùng chuyển sang thử thách tiếp theo nhé! 🌟",
              isCorrect: null
            });

            // Auto-skip to next round without awarding EP
            setTimeout(() => {
              setSpeechAttempts(0);
              const nextRound = currentRound + 1;
              if (nextRound >= TOTAL_ROUNDS) {
                playSoundEffect('celebrate');
                setShowEcoPopup(true);
              } else {
                setCurrentRound(nextRound);
                setSelectedWord(null);
                setIsAnswerCorrect(null);
                setSpokenTranscript('');
                setFeedback({
                  text: 'Hãy nghe phát âm rồi đọc to từ còn thiếu để giúp bạn động vật về nhà nhé! 🐾',
                  isCorrect: null
                });
              }
            }, 2000);
          } else {
            playSoundEffect('fail');
            setIsAnswerCorrect(false);
            setFeedback({
              text: `Em vừa phát âm: "${transcript || 'chưa rõ'}". Lần thử ${newAttempts}/4. Hãy bấm nút Loa nghe phát âm chuẩn rồi thử đọc lại nhé! 🎤`,
              isCorrect: false
            });
          }
        }
      };

      recognition.onerror = () => {
        clearTimer();
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        clearTimer();
        setIsListeningVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListeningVoice(false);
    }
  };

  // Option selection (Hybrid click support for noisy environments)
  const handleSelectWordOption = (opt: { id: string; word: string; isCorrect: boolean }) => {
    if (isAnswerCorrect) return;

    if (opt.isCorrect) {
      handleAnswerSuccess(opt.word);
    } else {
      playSoundEffect('fail');
      setIsAnswerCorrect(false);
      setSelectedWord(opt.word);
      setFeedback({
        text: `🌱 Từ "${opt.word}" chưa khớp với câu mẫu. Em hãy nghe lại phát âm rồi thử lại nhé! 🎧`,
        isCorrect: false
      });
    }
  };

  // Claim completion reward
  const handleClaimReward = () => {
    if (hasClaimedReward) return;
    playSoundEffect('celebrate');
    onAwardEP(30);
    if (onAwardTree) onAwardTree();
    setHasClaimedReward(true);
    setShowEcoPopup(false);
    setClaimNotification('Chúc mừng em đã nhận trọn vẹn +30 Eco Points và trồng thêm 1 Cây Xanh vào My Garden! 🌿');
  };

  const progressPercent = Math.round((rescuedCount / TOTAL_ROUNDS) * 100);

  return (
    <div className="w-full flex flex-col gap-3 font-sans pb-8">
      {/* 1. TOP BAR */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-[2px] border-lime-300 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lime-500 to-emerald-600 text-white flex items-center justify-center text-2xl shadow-xs">
            🐾
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-lime-950">
              Animal Homes · Tìm nhà cho bạn thú
            </h2>
            <span className="text-[11px] font-semibold text-lime-700">
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
          className="flex flex-col items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 bg-white hover:bg-lime-50 text-lime-950 rounded-2xl border-2 border-lime-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-lime-900">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Games</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-lime-600">
            Về trò chơi
          </span>
        </button>
      </div>

      {/* CLAIM CONFIRMATION BANNER */}
      {claimNotification && (
        <div className="w-full bg-lime-50 border-2 border-lime-400 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs sm:text-sm text-lime-950 font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg shrink-0">🌟</span>
            <span>{claimNotification}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenGarden && (
              <button
                type="button"
                onClick={onOpenGarden}
                className="px-2.5 py-1 bg-white hover:bg-lime-100 text-lime-900 border border-lime-300 rounded-xl text-xs font-black cursor-pointer shadow-2xs"
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
              className="w-6 h-6 rounded-full hover:bg-lime-200/60 flex items-center justify-center text-lime-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. PROGRESS BANNER */}
      <div className="w-full bg-white rounded-2xl px-4 py-2.5 border-[1.5px] border-lime-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-bold text-lime-950">
          <span className="text-base sm:text-lg shrink-0">🏡</span>
          <div>
            <span className="font-extrabold text-lime-950">
              Listen & Voice-Fill Blank · Nghe và phát âm đúng để giúp bạn thú về tổ ấm!
            </span>
            <span className="text-lime-700 font-medium block sm:inline sm:ml-1.5">
              (Mỗi câu đọc chuẩn sẽ dẫn lối 1 bạn nhỏ về mái nhà tự nhiên an toàn)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-lime-900 font-black text-xs shrink-0 self-start sm:self-auto">
          <span>{rescuedCount}/{TOTAL_ROUNDS} Safe · Đã về nhà</span>
          <span>({progressPercent}%)</span>
        </div>
      </div>

      {/* 3. MAIN ARENA: ANIMAL ECO-HABITAT (LEFT) + VOICE-FILL BLANK STATION (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 w-full items-stretch">
        
        {/* ======================================================== */}
        {/* LEFT / UPPER: THE ANIMAL ECO-HABITAT ARENA               */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border-[2.5px] border-lime-300 shadow-sm flex flex-col justify-between gap-3">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🌲</span>
              <h3 className="font-black text-sm text-lime-950">
                Eco Habitat Sanctuary · Mái nhà muôn loài
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border shadow-2xs ${
              rescuedCount >= TOTAL_ROUNDS
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              {rescuedCount >= TOTAL_ROUNDS ? '✨ All Animals Home' : `🐾 ${5 - rescuedCount} Animals Waiting`}
            </span>
          </div>

          {/* SIMULATOR CANVAS: THE NATURAL ECO-HOMES */}
          <div className="w-full bg-gradient-to-b from-[#e0f2fe] via-[#dcfce7] to-[#86efac]/50 rounded-2xl p-3 border-2 border-lime-200 shadow-inner flex flex-col justify-between relative overflow-hidden min-h-[280px] sm:min-h-[310px] select-none">
            
            {/* SVG illustrated backdrop: mountains, sun, hills */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 240">
              <defs>
                <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bbf7d0" />
                  <stop offset="100%" stopColor="#4ade80" />
                </linearGradient>
                <linearGradient id="pondGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
              <circle cx="340" cy="40" r="30" fill="#fef08a" opacity="0.8" />
              <path d="M0,130 Q120,90 240,120 T400,100 L400,240 L0,240 Z" fill="url(#hillGrad)" opacity="0.7" />
              <path d="M280,180 Q340,165 400,180 L400,240 L280,240 Z" fill="url(#pondGrad)" opacity="0.85" />
            </svg>

            {/* Top Indicator: Animal Tracker */}
            <div className="relative z-10 flex items-center justify-between w-full bg-white/95 backdrop-blur-xs rounded-xl px-2.5 py-1.5 border border-lime-300 shadow-2xs">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {ANIMAL_ECO_FRIENDS.map((af, idx) => {
                  const isSaved = idx < rescuedCount;
                  const isCurrent = idx === currentRound && rescuedCount < TOTAL_ROUNDS;
                  return (
                    <div
                      key={af.id}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black border transition-all ${
                        isSaved
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                          : isCurrent
                          ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-300/80 animate-pulse'
                          : 'bg-gray-100 text-gray-400 border-gray-200 opacity-60'
                      }`}
                    >
                      <span>{af.emoji}</span>
                      <span className="hidden sm:inline">{af.nameEn}</span>
                      {isSaved && <span className="text-emerald-700">✓</span>}
                    </div>
                  );
                })}
              </div>
              <span className="text-xs font-black text-emerald-900 shrink-0 ml-2 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                {rescuedCount}/5 Safe
              </span>
            </div>

            {/* FIVE ECO-HOMES IN THE SCENE */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {ANIMAL_ECO_FRIENDS.map((animal, idx) => {
                const isSaved = idx < rescuedCount;
                const isCurrent = idx === currentRound;

                return (
                  <div
                    key={animal.id}
                    style={{ left: animal.posX, top: animal.posY }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-all"
                  >
                    {/* The Eco Home Icon */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl border-2 shadow-md transition-all ${
                      isSaved 
                        ? 'bg-emerald-100 border-emerald-400 scale-105 shadow-emerald-200' 
                        : isCurrent 
                        ? 'bg-white border-amber-400 ring-4 ring-amber-300/80 scale-110 animate-pulse' 
                        : 'bg-white/80 border-gray-300 opacity-60'
                    }`}>
                      {animal.homeEmoji}
                    </div>

                    {/* Animal inside if saved */}
                    {isSaved && (
                      <div className="text-2xl sm:text-3xl -mt-6 z-20 animate-bounce">
                        {animal.emoji}
                      </div>
                    )}

                    {/* Clean Label */}
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md mt-1 backdrop-blur-xs whitespace-nowrap shadow-2xs ${
                      isSaved 
                        ? 'bg-emerald-800 text-white' 
                        : isCurrent 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-black/50 text-white'
                    }`}>
                      {animal.homeNameEn} {isSaved ? '✓' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ACTIVE ANIMAL AT TRAILHEAD / GLIDING TO ECO-HOME */}
            {rescuedCount < TOTAL_ROUNDS && (
              <div 
                style={{
                  left: isMovingHome ? currentQ.animal.posX : '50%',
                  top: isMovingHome ? currentQ.animal.posY : '65%',
                  transition: 'all 1200ms cubic-bezier(0.34, 1.25, 0.64, 1)'
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center select-none ${
                  isMovingHome ? 'scale-110' : 'scale-100 animate-bounce'
                }`}
              >
                {/* Speech Bubble */}
                {!isMovingHome ? (
                  <div className="bg-white/95 px-3 py-1 rounded-2xl border-2 border-lime-400 shadow-md text-[11px] font-black text-lime-950 mb-1 flex items-center gap-1">
                    <span>{currentQ.animal.soundHint}</span>
                    <span className="text-emerald-700">Guide me home!</span>
                  </div>
                ) : (
                  <div className="bg-emerald-600 text-white px-3 py-1 rounded-2xl shadow-md text-[11px] font-black mb-1 flex items-center gap-1 animate-pulse">
                    <span>Heading home!</span>
                    <span>🏡✨</span>
                  </div>
                )}

                <div className="text-6xl sm:text-7xl filter drop-shadow-xl relative">
                  {currentQ.animal.emoji}
                  {isMovingHome && (
                    <>
                      <span className="absolute -top-3 -right-2 text-2xl animate-ping">❤️</span>
                      <span className="absolute -bottom-2 -left-2 text-2xl animate-spin">✨</span>
                    </>
                  )}
                </div>

                <span className="px-3 py-0.5 rounded-full bg-emerald-600 text-white font-black text-xs shadow-xs mt-1">
                  {currentQ.animal.nameEn}
                </span>
              </div>
            )}

            {/* ALL SAVED CELEBRATION */}
            {rescuedCount >= TOTAL_ROUNDS && (
              <div className="relative z-20 flex flex-col items-center justify-center my-auto animate-in zoom-in-90 duration-500 text-center">
                <div className="text-5xl sm:text-6xl animate-bounce">
                  🎉🐾✨
                </div>
                <h4 className="font-black text-base sm:text-lg text-emerald-950 mt-1">
                  All Animals Safe at Home!
                </h4>
                <p className="text-xs font-bold text-emerald-800">
                  Tất cả bạn thú đã về đến ngôi nhà xanh ấm cúng!
                </p>
              </div>
            )}

            {/* Bottom mini-bar checklist */}
            <div className="w-full bg-white/90 backdrop-blur-xs rounded-xl p-2 border border-lime-300 flex items-center justify-between text-[11px] font-extrabold text-lime-950 z-10 mt-auto shadow-2xs">
              <div className="flex items-center gap-1">
                <span>🐾</span>
                <span>Tiến độ tìm nhà:</span>
              </div>
              <span className="font-black text-emerald-900">{rescuedCount}/5 Bạn thú ({progressPercent}%)</span>
            </div>

          </div>

          {/* Environmental Insight Footer */}
          <div className="w-full bg-lime-50 rounded-2xl p-2.5 border border-lime-200 flex items-center gap-2 text-xs font-bold text-lime-950">
            <span className="text-base shrink-0">💡</span>
            <span>
              <strong>Ý thức xanh:</strong> {currentQ.animal.ecoTipVi}
            </span>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT / LOWER: VOICE-FILL BLANK QUESTION STATION         */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border-[2.5px] border-lime-300 shadow-sm flex flex-col justify-between gap-3.5">
          
          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              <h2 className="text-base sm:text-lg font-black text-lime-950 tracking-tight">
                Listen & Voice-Fill Blank · Nghe & Điền từ
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-lime-100 text-lime-900 border border-lime-300 shadow-2xs">
              Animal {currentRound + 1}/{TOTAL_ROUNDS} · Bạn thú {currentRound + 1}
            </span>
          </div>

          {/* 2. THE AUDIO LISTENING BOX */}
          <div className="w-full bg-gradient-to-br from-lime-50 via-emerald-50/70 to-teal-50 rounded-2xl p-4 border-2 border-lime-300 shadow-sm flex flex-col items-center text-center gap-2.5 relative overflow-hidden">
            {isPlayingAudio && (
              <div className="absolute inset-0 bg-lime-400/10 animate-pulse pointer-events-none" />
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-[11px] font-black shadow-2xs">
              <span>{currentQ.animal.emoji} Rescue Mission: Guide {currentQ.animal.nameEn} to {currentQ.animal.homeNameEn}</span>
            </div>

            {/* BIG PROMINENT SPEAKER BUTTON */}
            <div className="flex flex-col items-center gap-2 my-1">
              <button
                type="button"
                onClick={() => handleTTS('sentence')}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-600 via-lime-600 to-green-700 hover:from-emerald-500 hover:to-lime-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer border-4 border-white ring-4 ring-lime-300/80 group relative ${
                  isPlayingAudio ? 'ring-amber-300 animate-pulse' : ''
                }`}
                title="Bấm vào Loa để nghe âm thanh câu mẫu"
              >
                <Volume2 className={`w-9 h-9 sm:w-11 sm:h-11 text-white group-hover:scale-110 transition-transform ${
                  isPlayingAudio ? 'animate-bounce text-amber-200' : ''
                }`} />
                <span className="text-[10px] font-black text-lime-100 mt-0.5">
                  {isPlayingAudio ? 'Playing...' : 'Listen / Nghe'}
                </span>
              </button>

              {/* Standard, Slow & Word Audio Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => handleTTS('sentence')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-lime-100 text-lime-950 border border-lime-300 text-xs font-black shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Listen Sentence / Nghe câu</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTTS('slow')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-lime-100 text-lime-950 border border-lime-300 text-xs font-black shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <span className="text-sm">🐢</span>
                  <span>Slow / Chậm</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTTS('word')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-lime-100 text-lime-950 border border-lime-300 text-xs font-black shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <span className="text-sm">🗣️</span>
                  <span>Word Sound / Nghe từ</span>
                </button>
              </div>
            </div>

            {/* Target Animal Mission Banner */}
            <div className="w-full flex items-center justify-center">
              <span className="text-xs font-bold text-lime-950 text-center">
                🎯 Listen to the sound and speak the missing word to guide the {currentQ.animal.nameEn} home!
              </span>
            </div>
          </div>

          {/* 3. THE SENTENCE BLANK CARD (KHUNG CÂU ĐIỀN TỪ) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-extrabold text-lime-950">
              Sentence with Blank · Đọc to hoặc chạm chọn từ còn thiếu vào ô trống:
            </span>

            <div className={`w-full p-4 rounded-2xl border-2 flex items-center justify-center text-center transition-all ${
              isAnswerCorrect === true 
                ? 'bg-emerald-100/90 border-emerald-400 ring-2 ring-emerald-300' 
                : isAnswerCorrect === false 
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200 animate-shake' 
                : 'bg-lime-50/70 border-lime-300'
            }`}>
              <div className="text-base sm:text-xl font-black text-lime-950 leading-relaxed tracking-wide flex flex-wrap items-center justify-center gap-1.5">
                {(() => {
                  const parts = currentQ.sentenceWithBlank.split('______');
                  return (
                    <>
                      <span>{parts[0]}</span>
                      <span className={`px-3 py-1 rounded-xl border-2 font-black inline-flex items-center gap-1 transition-all ${
                        isAnswerCorrect 
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm animate-bounce' 
                          : selectedWord 
                          ? 'bg-rose-200 text-rose-900 border-rose-400' 
                          : isListeningVoice 
                          ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse' 
                          : 'bg-white text-emerald-800 border-dashed border-emerald-400'
                      }`}>
                        {isAnswerCorrect ? (
                          <>
                            <span>{currentQ.targetWord}</span>
                            <Check className="w-4 h-4 text-white" />
                          </>
                        ) : isListeningVoice ? (
                          '🎙️ Listening...'
                        ) : selectedWord ? (
                          selectedWord
                        ) : (
                          '[ ______ ]'
                        )}
                      </span>
                      <span>{parts[1]}</span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* 4. VOICE RECORDING ACTION BUTTON (MICROPHONE) */}
          <div className="flex flex-col items-center gap-2 w-full my-1">
            <button
              type="button"
              onClick={startVoiceRecording}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 cursor-pointer shadow-md transition-all active:scale-98 border-2 ${
                isListeningVoice 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 ring-4 ring-rose-300 animate-pulse' 
                  : 'bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white border-emerald-400'
              }`}
            >
              <Mic className={`w-5 h-5 ${isListeningVoice ? 'animate-bounce' : ''}`} />
              <span>
                {isListeningVoice 
                  ? 'Listening... Đang nghe, em hãy đọc to từ cần điền!' 
                  : 'Hold / Click Mic to Speak · Bấm Micro để đọc to từ điền'}
              </span>
            </button>

            {spokenTranscript && (
              <span className="text-xs font-bold text-lime-900 bg-lime-100/80 px-3 py-1 rounded-full border border-lime-300">
                🎙️ Em vừa phát âm: <strong>"{spokenTranscript}"</strong>
              </span>
            )}
          </div>

          {/* 5. HYBRID WORD SELECTION CHIPS (TỰ ĐIỀN NẾU THIẾT BỊ KHÔNG CÓ MIC) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold text-lime-900">
              Hoặc chạm trực tiếp vào thẻ từ bên dưới để điền:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswerCorrect === true}
                  onClick={() => handleSelectWordOption(opt)}
                  className={`p-2.5 rounded-xl border-2 font-black text-xs sm:text-sm text-center shadow-2xs hover:shadow-sm cursor-pointer transition-all active:scale-95 ${
                    isAnswerCorrect && opt.isCorrect 
                      ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300' 
                      : selectedWord === opt.word && !opt.isCorrect
                      ? 'bg-rose-100 text-rose-950 border-rose-400 ring-2 ring-rose-300 animate-shake'
                      : 'bg-white hover:bg-lime-50 text-lime-950 border-lime-300 hover:border-lime-500'
                  }`}
                >
                  {opt.word}
                </button>
              ))}
            </div>
          </div>

          {/* 6. STATUS & FEEDBACK BOX */}
          <div className={`w-full rounded-2xl p-3 border flex items-center gap-2.5 transition-all text-xs sm:text-sm font-bold ${
            feedback.isCorrect === true
              ? 'bg-emerald-100/90 text-emerald-950 border-emerald-400 shadow-2xs'
              : feedback.isCorrect === false
              ? 'bg-rose-100/90 text-rose-950 border-rose-300 shadow-2xs'
              : 'bg-lime-50 text-lime-900 border-lime-200'
          }`}>
            <div className="text-lg shrink-0">
              {feedback.isCorrect === true ? '🎉' : feedback.isCorrect === false ? '⚠️' : '🐾'}
            </div>
            <p className="flex-1 leading-snug">
              {feedback.text}
            </p>
          </div>

        </div>

      </div>

      {/* 4. ECO-KNOWLEDGE COMPLETION POPUP (Thẻ kiến thức xanh - Không gian rộng rãi, thoáng đãng) */}
      {showEcoPopup && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-white via-[#f7fee7] to-[#ecfdf5] rounded-3xl sm:rounded-4xl w-[94vw] max-w-4xl lg:max-w-[920px] max-h-[92vh] overflow-y-auto p-6 sm:p-8 md:p-10 border-[4px] border-[#84cc16] shadow-2xl flex flex-col gap-6 my-auto relative animate-scale-up">
            
            {/* Mascot & Celebration Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left border-b border-lime-200/80 pb-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#84cc16] via-[#10b981] to-[#047857] border-4 border-white shadow-lg flex items-center justify-center text-4xl sm:text-5xl shrink-0 animate-bounce">
                🐾
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="inline-flex items-center justify-center sm:justify-start">
                  <span className="px-3.5 py-1 rounded-full bg-lime-100 text-lime-900 text-xs sm:text-sm font-black border border-lime-300 shadow-2xs tracking-wide">
                    🌱 Thẻ kiến thức xanh · Eco-Knowledge Card
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-lime-950 tracking-tight">
                  Tổ ấm muôn loài & Bảo vệ đa dạng sinh học
                </h3>
                <p className="text-sm sm:text-base font-bold text-lime-900/80">
                  Em đã hoàn thành xuất sắc thử thách phát âm và dẫn đường cho toàn bộ 5 bạn nhỏ về đúng ngôi nhà sinh thái tự nhiên!
                </p>
              </div>
            </div>

            {/* GREEN LESSON WITH ECO-BUDDY CARD (3 Khối kiến thức rõ ràng) */}
            <div className="flex flex-col gap-3.5">
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                <span>🌿 Bài học bảo vệ động vật cùng Eco-Buddy (Animal Protection Lesson)</span>
              </div>

              {/* Block 1 */}
              <div className="bg-white/90 rounded-2xl p-4 sm:p-5 border-2 border-lime-200 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-lime-100 flex items-center justify-center text-2xl shrink-0">
                  🏡
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-black text-lime-950 mb-1">
                    Môi trường sống tự nhiên là tổ ấm quý giá
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-emerald-950 font-medium leading-relaxed">
                    Mỗi loài động vật đều gắn liền với một ngôi nhà tự nhiên riêng (rừng rậm, dòng sông, tán cây, cánh đồng). Giữ gìn cây xanh và nguồn nước chính là giữ gìn mái nhà bình yên cho muôn loài.
                  </p>
                </div>
              </div>

              {/* Block 2 */}
              <div className="bg-white/90 rounded-2xl p-4 sm:p-5 border-2 border-emerald-200 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl shrink-0">
                  ⚖️
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-black text-emerald-950 mb-1">
                    Cân bằng sinh thái & Mắt xích sự sống
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-emerald-950 font-medium leading-relaxed">
                    Động vật là người bạn đồng hành và là mắt xích vô cùng thiết yếu của Trái Đất. Bảo vệ chim muông bắt sâu bọ, bảo vệ ong thụ phấn giúp duy trì sự sống xanh cho toàn nhân loại!
                  </p>
                </div>
              </div>

              {/* Block 3 */}
              <div className="bg-white/90 rounded-2xl p-4 sm:p-5 border-2 border-amber-200 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">
                  💚
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-black text-amber-950 mb-1">
                    3 Việc làm xanh em có thể làm ngay
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-emerald-950 font-medium leading-relaxed">
                    1. Yêu thương và chăm sóc thú cưng chu đáo. 2. Không chọc phá tổ chim hay săn bắt bừa bãi. 3. Vứt rác đúng nơi quy định để rác thải nhựa không làm hại động vật hoang dã.
                  </p>
                </div>
              </div>
            </div>

            {/* Reward Summary Banner */}
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 rounded-2xl p-4 sm:p-5 border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xs shrink-0">
                  🎁
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

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-4 py-2 rounded-xl bg-amber-500 text-white font-black text-xs sm:text-sm shadow-xs">
                  +30 Eco Points
                </span>
                <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-xs">
                  +1 Cây xanh
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3.5 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click');
                  setShowEcoPopup(false);
                  initGameSession();
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-lime-50 text-lime-950 border-2 border-lime-300 font-black text-xs sm:text-sm md:text-base shadow-2xs hover:shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-5 h-5 text-lime-700" />
                <span>Chơi lại (Play Again)</span>
              </button>

              <button
                type="button"
                onClick={handleClaimReward}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white font-black text-xs sm:text-sm md:text-base shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>Nhận 30 EP & Về danh sách trò chơi</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
