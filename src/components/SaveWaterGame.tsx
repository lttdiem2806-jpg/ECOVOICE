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
  RefreshCw,
  Droplets,
  Droplet,
  Lock,
  Undo2,
  Check
} from 'lucide-react';
import { checkSpeechAnswerMatch } from '../services/pronunciationFeedbackService';

export interface WaterEcoLesson {
  id: string;
  en: string;
  vi: string;
  tip: string;
}

export const WATER_ECO_LESSONS: WaterEcoLesson[] = [
  {
    id: 'turn-off-tap',
    en: 'Turn off the tap while brushing your teeth and washing soap! Every drop of clean water is precious life on Earth!',
    vi: 'Hãy luôn khóa chặt vòi nước khi đánh răng hoặc xoa xà phòng! Từng giọt nước sạch là nguồn sống quý giá của muôn loài trên Trái Đất!',
    tip: 'Khóa vòi nước khi đánh răng giúp tiết kiệm tới 6-8 lít nước sạch mỗi lần đấy các em! 🚰'
  },
  {
    id: 'fix-leaks',
    en: 'A single dripping tap can waste more than 30 liters of clean water every day. Fix leaks immediately!',
    vi: 'Một vòi nước bị rò rỉ nhỏ giọt tưởng chừng nhỏ bé nhưng có thể lãng phí hơn 30 lít nước mỗi ngày! Hãy báo người lớn sửa chữa ngay khi thấy rò rỉ nhé!',
    tip: 'Nếu thấy vòi nước trong trường hoặc gia đình chưa được khóa chặt, em hãy chủ động vặn khóa lại nhé! 💧'
  },
  {
    id: 'reuse-rinse-water',
    en: 'Reuse clean water from washing vegetables and fruits to water plants. Be a proud Water Hero!',
    vi: 'Tận dụng nước rửa rau củ quả sạch để tưới cây hoặc rửa sân giúp tiết kiệm gấp đôi nguồn tài nguyên nước sạch!',
    tip: 'Hãy rủ gia đình dùng xô gom nước tưới cho cây cối trong vườn để cây xanh tốt và tiết kiệm nước nhé! 🪴'
  },
  {
    id: 'protect-water-sources',
    en: 'Keep rivers, lakes, and oceans clean. Never throw trash or chemicals into water drainage!',
    vi: 'Bảo vệ nguồn nước ngầm và sông hồ bằng cách không xả rác bừa bãi. Nước sạch là món quà vô giá của thiên nhiên!',
    tip: 'Nước sạch chiếm chưa đầy 1% lượng nước trên Trái Đất, vì thế chúng mình phải luôn nâng niu và tiết kiệm nhé! 🌍'
  }
];

export interface SaveWaterQuestion {
  id: string;
  targetSentence: string;
  targetMeaning: string;
  speechText: string;
  words: string[];
  endingPunctuation?: string;
  scrambledWords: { id: string; word: string }[];
  badgeLabelEn: string;
  badgeLabelVi: string;
}

export interface SaveWaterGameProps {
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

export const SaveWaterGame: React.FC<SaveWaterGameProps> = ({
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
  const TOTAL_ROUNDS = 4;

  const [questions, setQuestions] = useState<SaveWaterQuestion[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [assembledWords, setAssembledWords] = useState<{ id: string; word: string }[]>([]);
  const [bankWords, setBankWords] = useState<{ id: string; word: string }[]>([]);

  // Water Leak Simulator States
  const [lockedSteps, setLockedSteps] = useState<number>(0);
  const [isValveTurning, setIsValveTurning] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  // Popups & Rewards
  const [showEcoKnowledgePopup, setShowEcoKnowledgePopup] = useState<boolean>(false);
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [claimNotification, setClaimNotification] = useState<string | null>(null);

  // Status feedback
  const [speechAttempts, setSpeechAttempts] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    text: string;
    isCorrect: boolean | null;
  }>({
    text: 'Bấm biểu tượng Loa để nghe câu mẫu và chọn các từ ghép thành câu hoàn chỉnh để khóa van nước nhé! 🎧🚰',
    isCorrect: null
  });

  // Speech Recognition
  const [isListening, setIsListening] = useState<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>('');
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

  // Split sentence into kid-friendly tokens with punctuation attached to the LAST word only
  const tokenizeSentence = (rawSentence: string): { words: string[]; endingPunctuation: string } => {
    const trimmed = rawSentence.trim();
    // Detect ending punctuation (., ?, !, etc.)
    const endingMatch = trimmed.match(/[.?!。？！]+$/);
    const endingPunctuation = endingMatch ? endingMatch[0] : '.';

    // Split sentence into tokens while strictly preserving internal contractions like I'm, name's
    const rawTokens = trimmed.replace(/\s+/g, ' ').split(' ').filter(Boolean);
    const cleanTokens = rawTokens
      .map(token => {
        // Strip ANY non-alphanumeric character from start and end
        return token.replace(/^[^\w']+|[^\w']+$/gu, '').trim();
      })
      // Strictly exclude any token that contains no letters or digits
      .filter(w => Boolean(w) && /[a-zA-Z0-9]/.test(w));

    if (cleanTokens.length === 0) {
      return { words: [`Hello${endingPunctuation}`], endingPunctuation };
    }

    // Attach the ending punctuation directly to the LAST word (e.g. "Britain." or "Australia?")
    const lastIndex = cleanTokens.length - 1;
    cleanTokens[lastIndex] = `${cleanTokens[lastIndex]}${endingPunctuation}`;

    return { words: cleanTokens, endingPunctuation };
  };

  // Initialize Game Questions from Unit Sentences
  const initGameSession = () => {
    const candidateSentences: Array<{ example: string; exampleVi: string; speechText?: string }> = [];

    // 1. From sentenceList prop
    if (sentenceList && sentenceList.length > 0) {
      sentenceList.forEach(s => {
        const text = s.example || s.structure;
        if (text) {
          candidateSentences.push({
            example: text,
            exampleVi: s.exampleVi || s.meaning || 'Mẫu câu bài học',
            speechText: s.speechText || text
          });
        }
      });
    }

    // 2. From allUnitSentences
    if (allUnitSentences && allUnitSentences.length > 0) {
      allUnitSentences.forEach(s => {
        const text = s.example || s.structure;
        if (text && !candidateSentences.some(c => c.example === text)) {
          candidateSentences.push({
            example: text,
            exampleVi: s.exampleVi || s.meaning || 'Mẫu câu bài học',
            speechText: s.speechText || text
          });
        }
      });
    }

    // 3. From vocabulary sentences
    const fullVocabs = [
      ...(vocabularyList || []),
      ...(allUnitVocabularies || [])
    ];

    fullVocabs.forEach(v => {
      if (v.sentence && !candidateSentences.some(c => c.example === v.sentence)) {
        candidateSentences.push({
          example: v.sentence,
          exampleVi: v.sentenceVi || v.meaning || 'Câu ví học',
          speechText: v.sentence
        });
      }
    });

    // Fallback standard curriculum sentences
    if (candidateSentences.length < TOTAL_ROUNDS) {
      const fallbacks = [
        { example: "Hello, I'm Ben.", exampleVi: 'Xin chào, mình là Ben.' },
        { example: "Hi, Ben. I'm Mai.", exampleVi: 'Chào Ben. Mình là Mai.' },
        { example: "What is your name?", exampleVi: 'Bạn tên là gì?' },
        { example: "My name's Mai.", exampleVi: 'Tên của mình là Mai.' },
        { example: "How are you today?", exampleVi: 'Hôm nay bạn có khỏe không?' },
        { example: "Fine, thank you.", exampleVi: 'Mình khỏe, cảm ơn bạn.' },
        { example: "Nice to meet you.", exampleVi: 'Rất vui được gặp bạn.' },
        { example: "Goodbye, see you again.", exampleVi: 'Tạm biệt, hẹn gặp lại bạn.' }
      ];
      fallbacks.forEach(fb => {
        if (!candidateSentences.some(c => c.example === fb.example)) {
          candidateSentences.push({
            ...fb,
            speechText: fb.example
          });
        }
      });
    }

    const shuffled = [...candidateSentences].sort(() => 0.5 - Math.random());
    const generated: SaveWaterQuestion[] = [];

    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const item = shuffled[i % shuffled.length];
      const { words: tokens, endingPunctuation } = tokenizeSentence(item.example);
      const scrambled = tokens
        .map((w, idx) => ({ id: `word-${i}-${idx}-${Math.random().toString(36).substring(2, 6)}`, word: w }))
        .sort(() => 0.5 - Math.random());

      // If shuffled happens to be exact same order and has more than 1 word, reverse it
      if (scrambled.map(s => s.word).join(' ') === tokens.join(' ') && scrambled.length > 1) {
        scrambled.reverse();
      }

      generated.push({
        id: `q-${i}`,
        targetSentence: item.example,
        targetMeaning: item.exampleVi,
        speechText: item.speechText || item.example,
        words: tokens,
        endingPunctuation: endingPunctuation,
        scrambledWords: scrambled,
        badgeLabelEn: 'Sentence Puzzle',
        badgeLabelVi: 'Ghép câu khóa van nước'
      });
    }

    setQuestions(generated);
    setCurrentRound(0);
    setLockedSteps(0);
    setAssembledWords([]);
    setBankWords(
      generated[0]?.scrambledWords
        ? generated[0].scrambledWords.filter(s => Boolean(s.word) && /[a-zA-Z0-9]/.test(s.word))
        : []
    );
    setIsAnswerSubmitted(false);
    setSpeechAttempts(0);
    setShowEcoKnowledgePopup(false);
    setHasClaimedReward(false);
    setClaimNotification(null);
    setFeedback({
      text: 'Bấm biểu tượng Loa để nghe câu mẫu và chọn các từ ghép thành câu hoàn chỉnh để khóa van nước nhé! 🎧🚰',
      isCorrect: null
    });
  };

  useEffect(() => {
    initGameSession();
  }, [vocabularyList, sentenceList, allUnitVocabularies, allUnitSentences]);

  // Current Question
  const currentQ: SaveWaterQuestion = questions[currentRound] || {
    id: 'default',
    targetSentence: "Hello, I'm Ben.",
    targetMeaning: 'Xin chào, mình là Ben.',
    speechText: "Hello, I'm Ben.",
    words: ['Hello', "I'm", 'Ben.'],
    endingPunctuation: '.',
    scrambledWords: [
      { id: '1', word: "I'm" },
      { id: '2', word: 'Hello' },
      { id: '3', word: 'Ben.' }
    ],
    badgeLabelEn: 'Sentence Puzzle',
    badgeLabelVi: 'Ghép câu khóa van nước'
  };

  // Whenever round changes, populate bank words
  useEffect(() => {
    if (questions[currentRound]) {
      setAssembledWords([]);
      setBankWords(
        questions[currentRound].scrambledWords.filter(s => Boolean(s.word) && /[a-zA-Z0-9]/.test(s.word))
      );
      setIsAnswerSubmitted(false);
    }
  }, [currentRound, questions]);

  // TTS audio playback
  const handleTTS = (slow: boolean = false) => {
    playSoundEffect('click');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = currentQ.speechText || currentQ.targetSentence;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = slow ? 0.65 : 0.9;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Move word from Bank to Assembly Area
  const handleSelectBankWord = (item: { id: string; word: string }) => {
    if (isAnswerSubmitted) return;
    playSoundEffect('click');
    setBankWords(prev => prev.filter(w => w.id !== item.id));
    setAssembledWords(prev => [...prev, item]);
  };

  // Move word from Assembly Area back to Bank
  const handleRemoveAssembledWord = (item: { id: string; word: string }) => {
    if (isAnswerSubmitted) return;
    playSoundEffect('click');
    setAssembledWords(prev => prev.filter(w => w.id !== item.id));
    setBankWords(prev => [...prev, item]);
  };

  // Reset current question
  const handleResetWords = () => {
    playSoundEffect('click');
    setAssembledWords([]);
    setBankWords(
      currentQ.scrambledWords.filter(s => Boolean(s.word) && /[a-zA-Z0-9]/.test(s.word))
    );
    setFeedback({
      text: 'Đã hoàn tác các từ! Hãy nghe lại và ghép theo thứ tự chính xác nhé! 🔄',
      isCorrect: null
    });
  };

  // Check assembled sentence
  const handleCheckSentence = () => {
    if (assembledWords.length === 0 || isAnswerSubmitted) return;

    const assembledString = assembledWords.map(w => w.word).join(' ').trim();
    const targetString = currentQ.targetSentence.trim();

    // Check with loose punctuation/whitespace tolerance
    const normalize = (str: string) => str.toLowerCase().replace(/[.,!?;:'"“”‘’]/g, '').replace(/\s+/g, ' ').trim();
    const isExactWordsMatch = assembledWords.map(w => w.word.toLowerCase()).join(' ') === currentQ.words.map(w => w.toLowerCase()).join(' ');
    const lastWord = assembledWords[assembledWords.length - 1]?.word || '';
    const expectedLastWord = currentQ.words[currentQ.words.length - 1] || '';
    const isLastWordMatch = lastWord.toLowerCase() === expectedLastWord.toLowerCase();

    const isMatched = (isExactWordsMatch && isLastWordMatch) ||
                      (normalize(assembledString) === normalize(targetString) && isLastWordMatch) ||
                      assembledString.toLowerCase() === targetString.toLowerCase();

    if (isMatched) {
      playSoundEffect('success');
      setIsAnswerSubmitted(true);
      onAwardEP(6);

      // Trigger Valve Rotation Animation
      setIsValveTurning(true);
      setTimeout(() => setIsValveTurning(false), 900);

      const nextStep = lockedSteps + 1;
      setLockedSteps(nextStep);

      const percent = Math.round((nextStep / TOTAL_ROUNDS) * 100);
      setFeedback({
        text: `✨ Tuyệt vời! Em đã ghép đúng: "${currentQ.targetSentence}"! Van nước được vặn khóa thêm một nấc (${percent}% nước sạch được giữ lại)! (+6 EP)`,
        isCorrect: true
      });

      if (nextStep >= TOTAL_ROUNDS) {
        // Completed all rounds!
        setTimeout(() => {
          playSoundEffect('celebrate');
          setShowEcoKnowledgePopup(true);
        }, 1400);
      } else {
        // Advance to next round after animation
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
          setFeedback({
            text: 'Tiếp tục lắng nghe và ghép câu tiếp theo để khóa chặt hoàn toàn vòi nước nhé! 🚰💧',
            isCorrect: null
          });
        }, 1800);
      }
    } else {
      playSoundEffect('fail');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);

      setFeedback({
        text: `🌱 Chưa chính xác rồi! Thứ tự các từ vừa ghép chưa đúng câu mẫu. Em có thể bấm vào từng từ để gỡ ra hoặc bấm "Làm lại" nhé! 🎧`,
        isCorrect: false
      });
    }
  };

  // Speech Recognition pronunciation practice (Click to Start / Click to Stop)
  const startListening = () => {
    // If currently active recording, stop & evaluate accumulated speech immediately
    if (isListening || isListeningRef.current) {
      clearTimer();
      isListeningRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }

      playSoundEffect('click');
      const transcript = accumulatedTranscriptRef.current.trim().toLowerCase();
      const normalize = (str: string) => str.toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim();
      const target = normalize(currentQ.targetSentence);

      const isMatch = checkSpeechAnswerMatch(transcript, currentQ.targetSentence) || transcript.includes(target) || target.includes(transcript);

      if (isMatch) {
        setSpeechAttempts(0);
        const ordered = currentQ.words.map((w, idx) => ({ id: `speech-${idx}`, word: w }));
        setAssembledWords(ordered);
        setBankWords([]);
        playSoundEffect('success');
        setFeedback({
          text: `🎉 Excellent! Tuyệt vời! Em phát âm rất chuẩn câu: "${currentQ.targetSentence}"! Hãy bấm "Kiểm tra" để khóa van nhé!`,
          isCorrect: true
        });
      } else if (transcript) {
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
              setShowEcoKnowledgePopup(true);
            } else {
              setCurrentRound(nextRound);
              setIsAnswerSubmitted(false);
              setAssembledWords([]);
              const nextQ = questions[nextRound];
              setBankWords(
                nextQ?.scrambledWords
                  ? nextQ.scrambledWords.filter(s => Boolean(s.word) && /[a-zA-Z0-9]/.test(s.word))
                  : []
              );
              setFeedback({
                text: 'Tiếp tục lắng nghe và ghép câu tiếp theo để khóa chặt hoàn toàn vòi nước nhé! 🚰💧',
                isCorrect: null
              });
            }
          }, 2000);
        } else {
          playSoundEffect('fail');
          setFeedback({
            text: `Try again! Chưa chính xác (Em nói: "${transcript}"). Em có thể bấm 'Speak with Mic' để đọc lại HOẶC bấm xếp từ trực tiếp phía dưới! 🎤`,
            isCorrect: false
          });
        }
      } else {
        setFeedback({
          text: 'Bé chưa phát âm xong, bấm nút và đọc lại thật rõ ràng rồi bấm Dừng nhé! 🎤',
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

            const transcript = accumulatedTranscriptRef.current.trim().toLowerCase();
            const normalize = (str: string) => str.toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim();
            const target = normalize(currentQ.targetSentence);

            const isMatch = checkSpeechAnswerMatch(transcript, currentQ.targetSentence) || transcript.includes(target) || target.includes(transcript);

            if (isMatch) {
              setSpeechAttempts(0);
              const ordered = currentQ.words.map((w, idx) => ({ id: `speech-${idx}`, word: w }));
              setAssembledWords(ordered);
              setBankWords([]);
              playSoundEffect('success');
              setFeedback({
                text: `🎉 Giỏi lắm! Em phát âm rất chuẩn câu: "${currentQ.targetSentence}"! Hãy bấm "Kiểm tra" để khóa van nhé!`,
                isCorrect: true
              });
            } else {
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
                    setShowEcoKnowledgePopup(true);
                  } else {
                    setCurrentRound(nextRound);
                    setIsAnswerSubmitted(false);
                    setAssembledWords([]);
                    const nextQ = questions[nextRound];
                    setBankWords(
                      nextQ?.scrambledWords
                        ? nextQ.scrambledWords.filter(s => Boolean(s.word) && /[a-zA-Z0-9]/.test(s.word))
                        : []
                    );
                    setFeedback({
                      text: 'Tiếp tục lắng nghe và ghép câu tiếp theo để khóa chặt hoàn toàn vòi nước nhé! 🚰💧',
                      isCorrect: null
                    });
                  }
                }, 2000);
              } else {
                setFeedback({
                  text: `Chưa nghe rõ giọng bé (Lần thử ${newAttempts}/4). Hãy nghe lại rồi thử bấm nói nhé! 🎤`,
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

  // Claim Reward
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
      setClaimNotification('🎉 +30 EP and Water Guardian Badge credited! / Đã nạp +30 EP và Huy hiệu Người Bảo Vệ Nguồn Nước vào My Garden!');
      setFeedback({
        text: '🎉 Đã nhận thưởng bảo vệ nguồn nước! Em có thể bấm "Chơi lại" để luyện tập thêm với các câu khác nhé.',
        isCorrect: true
      });
    }
  };

  // Percentage of water saved & valve lock
  const savedPercent = Math.round((lockedSteps / TOTAL_ROUNDS) * 100);
  const valveRotationDeg = lockedSteps * 90; // 0deg -> 90deg -> 180deg -> 270deg -> 360deg

  // Leak rate calculation (120 L/h down to 0 L/h)
  const leakRate = Math.max(0, 120 - lockedSteps * 30);
  const waterSavedLiters = lockedSteps * 25;

  return (
    <div className="w-full flex flex-col gap-3 font-sans pb-8">
      {/* 1. TOP BAR */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-[2px] border-sky-300 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-xs">
            💧
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-sky-950">
              Save Water · Giải cứu giọt nước
            </h2>
            <span className="text-[11px] font-semibold text-sky-700">
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
            <span className="text-base sm:text-lg shrink-0">🌟</span>
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

      {/* 2. PROGRESS & METRICS BANNER */}
      <div className="w-full bg-white rounded-2xl px-4 py-2.5 border-[1.5px] border-sky-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-bold text-sky-950">
          <span className="text-base sm:text-lg shrink-0">🚰</span>
          <div>
            <span className="font-extrabold text-sky-950">
              Listen & Unscramble · Nghe & Ghép câu tiết kiệm nước
            </span>
            <span className="text-sky-700 font-medium block sm:inline sm:ml-1.5">
              (Nghe phát âm tiếng Anh và ghép câu đúng để vặn chặt van nước!)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 font-black text-xs">
            <span>Water Saved · Đã giữ được: {savedPercent}%</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-extrabold text-xs">
            <span>+{waterSavedLiters} Lít</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN ARENA: SIMULATOR (LEFT/UPPER) + UNSCRAMBLE STATION (RIGHT/LOWER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 w-full items-stretch">
        
        {/* ======================================================== */}
        {/* LEFT / UPPER: WATER LEAK AREA (VÒI NƯỚC RÒ RỈ)           */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border-[2.5px] border-sky-300 shadow-sm flex flex-col justify-between gap-3">
          
          {/* Header */}
          <div className="flex items-center justify-end">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border shadow-2xs ${
              lockedSteps >= TOTAL_ROUNDS
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
            }`}>
              {lockedSteps >= TOTAL_ROUNDS ? '✨ Secured · Đã khóa chặt' : '⚠️ Leaking · Đang rò rỉ'}
            </span>
          </div>

          {/* SIMULATOR CANVAS: THE FAUCET & WATER STREAM */}
          <div className="w-full bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd]/50 to-[#7dd3fc]/30 rounded-2xl p-4 border-2 border-sky-200 shadow-inner flex flex-col items-center justify-between relative overflow-hidden min-h-[260px] sm:min-h-[290px]">
            
            {/* Background Water Tile Patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            {/* Top Indicator: Leak Rate */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-sky-200 text-xs font-black shadow-xs z-10">
              <span className={lockedSteps >= TOTAL_ROUNDS ? 'text-emerald-700' : 'text-rose-600'}>
                {lockedSteps >= TOTAL_ROUNDS ? '✅ Zero Waste / Không còn rò rỉ!' : `⚠️ Rò rỉ lãng phí: ${leakRate} L/h`}
              </span>
            </div>

            {/* Central Animated Faucet Component */}
            <div className="relative flex flex-col items-center justify-center my-auto z-10">
              
              {/* Valve Wheel Handle (Rotatable) */}
              <div 
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white cursor-pointer relative z-20 transition-transform duration-700 select-none ${
                  lockedSteps >= TOTAL_ROUNDS 
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 ring-4 ring-emerald-300' 
                    : 'bg-gradient-to-br from-amber-500 via-rose-500 to-red-600 ring-4 ring-rose-200'
                } ${isValveTurning ? 'scale-110' : ''}`}
                style={{ transform: `rotate(${valveRotationDeg}deg)` }}
                title="Tay vặn van nước"
                onClick={() => playSoundEffect('click')}
              >
                {/* Valve Handle spokes */}
                <div className="absolute w-10 h-2 bg-white/80 rounded-full" />
                <div className="absolute w-2 h-10 bg-white/80 rounded-full" />
                <div className="w-5 h-5 rounded-full bg-white shadow-inner flex items-center justify-center text-[10px] text-gray-800 font-black z-10">
                  {lockedSteps >= TOTAL_ROUNDS ? <Lock className="w-3 h-3 text-emerald-600" /> : '🔒'}
                </div>
              </div>

              {/* Faucet Body & Spout (Metallic Curved Pipe) */}
              <div className="w-8 h-10 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-x-2 border-slate-500 shadow-sm -mt-2 z-10" />
              <div className="w-16 h-8 bg-gradient-to-b from-slate-300 to-slate-400 rounded-b-2xl border-2 border-slate-500 shadow-md flex items-center justify-center relative">
                {/* Faucet opening ring */}
                <div className="w-6 h-2 bg-slate-700 rounded-full absolute -bottom-1" />
              </div>

              {/* WATER STREAM EFFECT: Dynamic height, width, and particles */}
              <div className="relative flex flex-col items-center">
                {lockedSteps >= TOTAL_ROUNDS ? (
                  /* FULLY LOCKED: Sparkling drop suspended, zero leak */
                  <div className="flex flex-col items-center pt-2 animate-bounce">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md flex items-center justify-center text-white text-xs font-black border border-white">
                      💧
                    </div>
                    <span className="text-[10px] font-black text-emerald-800 bg-white/90 px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs mt-1">
                      ✨ Van đã khóa chặt!
                    </span>
                  </div>
                ) : (
                  /* ACTIVE LEAKING STREAM */
                  <div className="flex flex-col items-center">
                    {/* Water Column */}
                    <div 
                      className={`bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-500 rounded-full shadow-inner transition-all duration-500 ${
                        lockedSteps === 0 ? 'w-4 h-24 sm:h-28 animate-pulse' :
                        lockedSteps === 1 ? 'w-3 h-22 sm:h-26' :
                        lockedSteps === 2 ? 'w-2 h-20 sm:h-24' :
                        'w-1.5 h-16 sm:h-20 animate-bounce'
                      }`}
                    />

                    {/* Water Splash at the bottom */}
                    <div className="relative flex items-center justify-center -mt-2">
                      <div className={`rounded-full bg-cyan-300/80 blur-xs transition-all duration-300 ${
                        lockedSteps === 0 ? 'w-16 h-4 animate-ping' :
                        lockedSteps === 1 ? 'w-12 h-3.5 animate-pulse' :
                        lockedSteps === 2 ? 'w-8 h-2.5' :
                        'w-5 h-2'
                      }`} />
                      <div className="absolute text-base sm:text-lg animate-bounce select-none">
                        🫧
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Basin at the bottom */}
            <div className="w-full bg-gradient-to-t from-sky-200 to-white/80 rounded-xl p-2 border border-sky-300 flex items-center justify-between text-[11px] font-extrabold text-sky-950 shadow-2xs z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-base">💧</span>
                <span>Tiến độ khóa van:</span>
              </div>
              <span className="font-black text-blue-900">{lockedSteps}/{TOTAL_ROUNDS} nấc ({savedPercent}%)</span>
            </div>

          </div>

          {/* Environmental Meter Footer */}
          <div className="w-full bg-sky-50 rounded-2xl p-2.5 border border-sky-200 flex items-center gap-2 text-xs font-bold text-sky-950">
            <span className="text-base shrink-0">💡</span>
            <span>
              <strong>Ý thức xanh:</strong> Khóa vòi nước ngay khi không dùng giúp bảo tồn nguồn nước ngầm quý báu!
            </span>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT / LOWER: SENTENCE UNSCRAMBLE QUESTION STATION      */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border-[2.5px] border-sky-300 shadow-sm flex flex-col justify-between gap-3.5">
          
          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧩</span>
              <h2 className="text-base sm:text-lg font-black text-sky-950 tracking-tight">
                Listen & Unscramble · Nghe & Ghép câu
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-900 border border-sky-300 shadow-2xs">
              Challenge {currentRound + 1}/{TOTAL_ROUNDS} · Câu {currentRound + 1}
            </span>
          </div>

          {/* 2. THE AUDIO LISTENING STATION (TRẠM NGHE CÂU MẪU) */}
          <div className="w-full bg-gradient-to-br from-sky-50 via-blue-50/70 to-cyan-50 rounded-2xl p-4 border-2 border-sky-300 shadow-sm flex flex-col items-center text-center gap-2.5 relative overflow-hidden">
            {isPlayingAudio && (
              <div className="absolute inset-0 bg-sky-400/10 animate-pulse pointer-events-none" />
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-[11px] font-black shadow-2xs">
              <span>{currentQ.badgeLabelEn} · {currentQ.badgeLabelVi}</span>
            </div>

            {/* BIG PROMINENT SPEAKER BUTTON */}
            <div className="flex flex-col items-center gap-2 my-1">
              <button
                type="button"
                onClick={() => handleTTS(false)}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-sky-600 via-blue-600 to-cyan-700 hover:from-sky-500 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer border-4 border-white ring-4 ring-sky-300/80 group relative ${
                  isPlayingAudio ? 'ring-amber-300 animate-pulse' : ''
                }`}
                title="Bấm vào Loa để nghe âm thanh câu mẫu"
              >
                <Volume2 className={`w-9 h-9 sm:w-11 sm:h-11 text-white group-hover:scale-110 transition-transform ${
                  isPlayingAudio ? 'animate-bounce text-amber-200' : ''
                }`} />
                <span className="text-[10px] font-black text-sky-100 mt-0.5">
                  {isPlayingAudio ? 'Playing...' : 'Listen / Nghe'}
                </span>
              </button>

              {/* Audio Listen Buttons (Standard & Slow) */}
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => handleTTS(false)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-100 text-sky-950 border border-sky-300 text-xs font-black shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Listen / Nghe chuẩn</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTTS(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-100 text-sky-950 border border-sky-300 text-xs font-black shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span className="text-sm">🐢</span>
                  <span>Slow / Nghe chậm</span>
                </button>
              </div>
            </div>
          </div>

          {/* ASSEMBLY AREA: DÒNG GHÉP CÂU HOÀN CHỈNH */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-extrabold text-sky-950">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-sky-600" />
                <span>Câu đang ghép của em (Your sentence):</span>
              </span>
              <span className="text-[11px] font-semibold text-sky-700">
                (Chạm từ đã ghép để gỡ về kho)
              </span>
            </div>

            <div className={`w-full min-h-[64px] sm:min-h-[72px] p-3 rounded-2xl border-2 border-dashed flex flex-wrap items-center gap-2 transition-all ${
              isShaking ? 'animate-shake border-rose-400 bg-rose-50/80 ring-2 ring-rose-300' :
              assembledWords.length > 0 ? 'border-sky-400 bg-sky-50/50' : 'border-sky-300 bg-gray-50/80'
            }`}>
              {assembledWords.length === 0 ? (
                <div className="w-full text-center text-xs font-semibold text-gray-600 italic select-none py-2">
                  👉 Chạm vào các từ bên dưới theo thứ tự để ghép thành câu hoàn chỉnh...
                </div>
              ) : (
                assembledWords.map((item) => (
                  <button
                    key={`assembled-${item.id}`}
                    type="button"
                    onClick={() => handleRemoveAssembledWord(item)}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-black text-xs sm:text-sm shadow-sm hover:bg-rose-500 hover:from-rose-600 hover:to-red-600 cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 group animate-in zoom-in-90"
                    title="Bấm để trả từ về ngân hàng"
                  >
                    <span>{item.word}</span>
                    <X className="w-3.5 h-3.5 text-sky-200 group-hover:text-white shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* WORD BANK: NGÂN HÀNG TỪ XÁO TRỘN */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-extrabold text-sky-950">
              Ngân hàng từ xáo trộn (Word Bank) - Chạm để chọn từ:
            </span>

            <div className="w-full min-h-[56px] p-3 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-wrap items-center gap-2">
              {bankWords.filter(item => Boolean(item.word) && /[a-zA-Z0-9]/.test(item.word)).length === 0 ? (
                <span className="text-xs font-bold text-sky-800 italic select-none py-1">
                  ✨ Đã chọn hết các từ! Em hãy kiểm tra lại câu rồi bấm "Kiểm tra đáp án" bên dưới nhé.
                </span>
              ) : (
                bankWords
                  .filter(item => Boolean(item.word) && /[a-zA-Z0-9]/.test(item.word))
                  .map((item) => (
                    <button
                      key={`bank-${item.id}`}
                      type="button"
                      onClick={() => handleSelectBankWord(item)}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-sky-100 text-sky-950 border-2 border-sky-300 hover:border-sky-500 font-black text-xs sm:text-sm shadow-2xs hover:shadow-sm cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                    >
                      <span>{item.word}</span>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* ACTION BUTTONS: RESET & CHECK */}
          <div className="flex items-center gap-2.5 w-full">
            <button
              type="button"
              onClick={handleResetWords}
              disabled={assembledWords.length === 0}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all"
            >
              <Undo2 className="w-4 h-4" />
              <span>Làm lại (Reset)</span>
            </button>

            <button
              type="button"
              onClick={handleCheckSentence}
              disabled={assembledWords.length === 0 || isAnswerSubmitted}
              className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 ${
                assembledWords.length === 0 || isAnswerSubmitted
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white ring-2 ring-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>Kiểm tra & Khóa van nước (Check & Lock Valve)</span>
            </button>
          </div>

          {/* SPEAK WITH MIC TRIGGER */}
          <button
            type="button"
            onClick={startListening}
            className={`w-full py-2 px-3 rounded-2xl border font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer transition-all ${
              isListening 
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 shrink-0" />
              <span className="font-extrabold">{isListening ? '🛑 Dừng & Chấm điểm (Click to Stop)' : 'Speak with Mic · Luyện nói trực tiếp'}</span>
            </div>
            <span className="text-[10px] text-sky-700 font-semibold sm:border-l sm:border-sky-300 sm:pl-2">
              {isListening ? '(Bấm nút này sau khi đọc xong câu trả lời)' : '(Bấm để nói -> Đọc xong bấm Dừng để chấm điểm)'}
            </span>
          </button>

          {/* STATUS FEEDBACK BOX */}
          <div className={`w-full rounded-2xl p-3 border flex items-center gap-2.5 transition-all text-xs sm:text-sm font-bold ${
            feedback.isCorrect === true
              ? 'bg-emerald-100/90 text-emerald-950 border-emerald-400 shadow-2xs'
              : feedback.isCorrect === false
              ? 'bg-rose-100/90 text-rose-950 border-rose-300 shadow-2xs'
              : 'bg-sky-50 text-sky-900 border-sky-200'
          }`}>
            <div className="text-lg shrink-0">
              {feedback.isCorrect === true ? '🎉' : feedback.isCorrect === false ? '⚠️' : '🚰'}
            </div>
            <p className="flex-1 leading-snug">
              {feedback.text}
            </p>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. ECO-KNOWLEDGE POPUP (Kích hoạt khi khóa van nước 100%) */}
      {/* ======================================================== */}
      {showEcoKnowledgePopup && (() => {
        const currentLesson = WATER_ECO_LESSONS[activeLessonIndex % WATER_ECO_LESSONS.length];
        return (
          <div className="fixed inset-0 z-50 bg-sky-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-gradient-to-b from-[#f0f9ff] via-white to-[#e0f2fe] rounded-3xl sm:rounded-4xl max-w-3xl lg:max-w-4xl w-full p-5 sm:p-7 md:p-8 border-[3.5px] border-sky-400 shadow-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[96vh] overflow-y-auto">
              
              {/* Decorative Water Glows */}
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

              {/* Top Tag: Eco-Water */}
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-xs sm:text-sm font-black uppercase tracking-wider shadow-2xs">
                <span>💧 Eco-Water · Tiết kiệm nguồn nước sạch</span>
              </div>

              {/* Celebration Visual & Heading (Harmonious horizontal layout on sm+) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full">
                {/* Crowned Happy Droplet Visual */}
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-[#38bdf8] via-[#0284c7] to-[#0369a1] border-4 border-white shadow-lg flex items-center justify-center text-4xl sm:text-5xl select-none animate-bounce relative">
                    💧
                    <span className="absolute -top-1 -right-1 text-lg animate-ping">✨</span>
                    <span className="absolute -bottom-1 -left-1 text-sm">🚰</span>
                  </div>

                  <div 
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-2 border-sky-300 shadow-md flex items-center justify-center text-2xl sm:text-3xl -ml-4 mt-5 z-10 select-none cursor-pointer hover:scale-110 transition-transform"
                    title="Giọt Nước Xanh cảm ơn bé!"
                    onClick={() => playSoundEffect('celebrate')}
                  >
                    👑
                  </div>
                </div>

                <div className="flex flex-col text-center sm:text-left gap-1">
                  <h2 className="text-2xl sm:text-3xl md:text-3xl font-black text-sky-950 tracking-tight leading-tight">
                    Congratulations! Water Saved! 💧🚰
                  </h2>
                  <span className="text-sm sm:text-base font-extrabold text-sky-900 -mt-0.5">
                    Van nước đã được khóa chặt hoàn toàn · 100% Nước sạch được bảo vệ!
                  </span>
                  <p className="text-xs sm:text-sm md:text-base font-bold text-sky-800 leading-snug">
                    Thank you for fixing leaks and saving fresh water for our Earth! <br className="hidden sm:inline" />
                    <span className="text-sky-700 font-semibold">(Cảm ơn em đã hoàn thành các câu ghép chuẩn xác và khóa chặt vòi nước lãng phí!)</span>
                  </p>
                </div>
              </div>

              {/* Eco-Knowledge Card: Green Lesson with Eco-Buddy (Bilingual EN - VI) */}
              <div className="w-full bg-gradient-to-br from-sky-50 via-white to-cyan-50/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border-2 border-sky-300 shadow-sm text-left flex flex-col gap-3 relative">
                
                {/* Title & Rotate Lesson Button */}
                <div className="flex items-center justify-between gap-3 border-b border-sky-200/90 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl sm:text-3xl">🚰</span>
                    <div className="text-left">
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-sky-950 flex items-center gap-1.5 leading-snug">
                        <span>Green Lesson with Eco-Buddy</span>
                      </h3>
                      <span className="text-xs sm:text-sm font-bold text-sky-700">
                        Bài học bảo vệ nguồn nước cùng Eco-Buddy
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect('click');
                      setActiveLessonIndex(prev => (prev + 1) % WATER_ECO_LESSONS.length);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0"
                    title="Đổi bài học sinh thái nước khác"
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

                {/* Vietnamese Meaning (Enlarged font & relaxed spacing) */}
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
                  <span className="text-2xl sm:text-3xl">💧</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-sky-950">Water Guardian</span>
                  <span className="text-xs sm:text-sm text-sky-700 font-bold">Người Bảo Vệ Nguồn Nước</span>
                </div>
                <div className="w-px h-10 bg-sky-300" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl">🏡</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-sky-950">My Garden</span>
                  <span className="text-xs sm:text-sm text-sky-700 font-bold">Vườn & Nguồn nước</span>
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
                    <span>Nhận phần thưởng & Giữ nguồn nước sạch</span>
                    <Sparkles className="w-5 h-5 text-amber-300 group-hover:-rotate-12 transition-transform" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-sky-100">
                    Claim Reward and Save Water · Great job!
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
                    <span>Khóa lại (Play Again)</span>
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
