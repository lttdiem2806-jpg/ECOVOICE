import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  X, 
  Zap, 
  Sun, 
  Wind, 
  Sprout, 
  Award, 
  Check, 
  Lightbulb,
  ArrowRight,
  Mic,
  Square
} from 'lucide-react';
import { checkSpeechAnswerMatch } from '../services/pronunciationFeedbackService';

export interface CleanEnergyQuestion {
  id: string;
  question: string;
  speechText: string;
  options: {
    id: 'A' | 'B' | 'C';
    text: string;
    isCorrect: boolean;
  }[];
  correctAnswerText: string;
}

export interface CleanEnergyGameProps {
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

const TOTAL_QUESTIONS = 4;

const STANDARD_DISTRACTORS = [
  "I'm from Vietnam.",
  "She's from Britain.",
  "My name is Lucy.",
  "I am nine years old.",
  "Yes, I can.",
  "It is in the pencil case.",
  "I like playing badminton.",
  "It's sunny and warm today.",
  "We have English on Monday.",
  "They are reading comic books."
];

export const FALLBACK_CURRICULUM_QUESTIONS: CleanEnergyQuestion[] = [
  {
    id: 'ceq_fb1',
    question: 'Where are you from?',
    speechText: 'Where are you from?',
    options: [
      { id: 'A', text: "I'm from Vietnam.", isCorrect: true },
      { id: 'B', text: "She is a teacher.", isCorrect: false },
      { id: 'C', text: "It is nine o'clock.", isCorrect: false }
    ],
    correctAnswerText: "I'm from Vietnam."
  },
  {
    id: 'ceq_fb2',
    question: 'What is your favourite subject?',
    speechText: 'What is your favourite subject?',
    options: [
      { id: 'A', text: "He is nine years old.", isCorrect: false },
      { id: 'B', text: "I like English and Science.", isCorrect: true },
      { id: 'C', text: "Yes, I can swim.", isCorrect: false }
    ],
    correctAnswerText: "I like English and Science."
  },
  {
    id: 'ceq_fb3',
    question: 'Can you ride a bike?',
    speechText: 'Can you ride a bike?',
    options: [
      { id: 'A', text: "My name is Peter.", isCorrect: false },
      { id: 'B', text: "They are from Japan.", isCorrect: false },
      { id: 'C', text: "Yes, I can ride very well.", isCorrect: true }
    ],
    correctAnswerText: "Yes, I can ride very well."
  },
  {
    id: 'ceq_fb4',
    question: 'What do you do in your free time?',
    speechText: 'What do you do in your free time?',
    options: [
      { id: 'A', text: "I water the flowers in my garden.", isCorrect: true },
      { id: 'B', text: "She is in the classroom.", isCorrect: false },
      { id: 'C', text: "It is green and yellow.", isCorrect: false }
    ],
    correctAnswerText: "I water the flowers in my garden."
  }
];

export function buildCleanEnergyQuestions(
  sentenceList: any[] = [],
  allUnitSentences: any[] = [],
  vocabularyList: any[] = [],
  allUnitVocabularies: any[] = []
): CleanEnergyQuestion[] {
  const generated: CleanEnergyQuestion[] = [];

  const allSentences = [
    ...(sentenceList || []),
    ...(allUnitSentences || [])
  ];

  const allVocabs = (allUnitVocabularies && allUnitVocabularies.length > 0)
    ? [...allUnitVocabularies]
    : (vocabularyList || []);

  // (A) Process Q&A pairs from sentences that have structure with "-" or "?"
  for (const s of allSentences) {
    if (generated.length >= TOTAL_QUESTIONS) break;
    const rawExample = s.example || s.structure || s.speechText || '';
    
    if (rawExample.includes(' - ') || rawExample.includes(' – ')) {
      const parts = rawExample.split(/\s*[-–]\s*/);
      if (parts.length >= 2) {
        const qText = parts[0].trim();
        const ansText = parts[1].trim();
        if (qText.endsWith('?') && ansText.length > 0) {
          const otherAnswers = allSentences
            .map((other: any) => {
              const ex = other.example || other.structure || '';
              if (ex.includes(' - ') || ex.includes(' – ')) {
                return ex.split(/\s*[-–]\s*/)[1]?.trim();
              }
              return ex.trim();
            })
            .filter((txt: string) => Boolean(txt) && txt !== ansText && !txt.endsWith('?'));

          const candidateDistractors = Array.from(new Set([...otherAnswers, ...STANDARD_DISTRACTORS]))
            .filter(d => d.toLowerCase() !== ansText.toLowerCase());

          const d1 = candidateDistractors[0] || "No, I am not.";
          const d2 = candidateDistractors[1] || "It is very green.";

          const rawOptions = [
            { text: ansText, isCorrect: true },
            { text: d1, isCorrect: false },
            { text: d2, isCorrect: false }
          ].sort(() => 0.5 - Math.random());

          const formattedOptions: CleanEnergyQuestion['options'] = [
            { id: 'A', text: rawOptions[0].text, isCorrect: rawOptions[0].isCorrect },
            { id: 'B', text: rawOptions[1].text, isCorrect: rawOptions[1].isCorrect },
            { id: 'C', text: rawOptions[2].text, isCorrect: rawOptions[2].isCorrect }
          ];

          generated.push({
            id: `ceq_${generated.length + 1}`,
            question: qText,
            speechText: qText,
            options: formattedOptions,
            correctAnswerText: ansText
          });
        }
      }
    }
  }

  // (B) If not enough questions, use vocabulary sentences
  if (generated.length < TOTAL_QUESTIONS) {
    for (const v of allVocabs) {
      if (generated.length >= TOTAL_QUESTIONS) break;
      if (v.sentence && v.word) {
        const sent = v.sentence.trim();
        let qText = `Choose the correct sentence for "${v.word}":`;

        const otherVocabSentences = allVocabs
          .filter((ov: any) => ov.id !== v.id && ov.sentence)
          .map((ov: any) => ov.sentence.trim());

        const candidateDistractors = Array.from(new Set([...otherVocabSentences, ...STANDARD_DISTRACTORS]))
          .filter(d => d.toLowerCase() !== sent.toLowerCase());

        const d1 = candidateDistractors[0] || "We are happy friends.";
        const d2 = candidateDistractors[1] || "The weather is very cool.";

        const rawOptions = [
          { text: sent, isCorrect: true },
          { text: d1, isCorrect: false },
          { text: d2, isCorrect: false }
        ].sort(() => 0.5 - Math.random());

        const formattedOptions: CleanEnergyQuestion['options'] = [
          { id: 'A', text: rawOptions[0].text, isCorrect: rawOptions[0].isCorrect },
          { id: 'B', text: rawOptions[1].text, isCorrect: rawOptions[1].isCorrect },
          { id: 'C', text: rawOptions[2].text, isCorrect: rawOptions[2].isCorrect }
        ];

        generated.push({
          id: `ceq_${generated.length + 1}`,
          question: qText,
          speechText: qText,
          options: formattedOptions,
          correctAnswerText: sent
        });
      }
    }
  }

  // (C) Fallback standard curriculum questions
  let fallbackIndex = 0;
  while (generated.length < TOTAL_QUESTIONS && fallbackIndex < FALLBACK_CURRICULUM_QUESTIONS.length) {
    generated.push(FALLBACK_CURRICULUM_QUESTIONS[fallbackIndex]);
    fallbackIndex++;
  }

  return generated.length > 0 ? generated : FALLBACK_CURRICULUM_QUESTIONS;
}

export const CleanEnergyGame: React.FC<CleanEnergyGameProps> = ({
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
  // Game States - initialized with valid questions immediately
  const [questions, setQuestions] = useState<CleanEnergyQuestion[]>(() => 
    buildCleanEnergyQuestions(sentenceList, allUnitSentences, vocabularyList, allUnitVocabularies)
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<'A' | 'B' | 'C' | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [wrongOptionId, setWrongOptionId] = useState<'A' | 'B' | 'C' | null>(null);

  // Progress state: 0% -> 25% -> 50% -> 75% -> 100%
  const [energyProgress, setEnergyProgress] = useState<number>(0);

  // Completion & Popup
  const [showEcoPopup, setShowEcoPopup] = useState<boolean>(false);
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  // Speech Recognition States
  const [isListening, setIsListening] = useState<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>('');
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
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Build authentic curriculum questions from the current Unit
  const initGameSession = () => {
    clearTimer();
    setSelectedOptionId(null);
    setAttemptCount(0);
    setIsAnswerCorrect(null);
    setWrongOptionId(null);
    setCurrentIndex(0);
    setEnergyProgress(0);
    setShowEcoPopup(false);
    setHasClaimedReward(false);
    setClaimSuccessMsg(null);

    const generated = buildCleanEnergyQuestions(
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

  const currentQ = questions[currentIndex] || questions[0] || FALLBACK_CURRICULUM_QUESTIONS[0];

  // TTS: Speak question text
  const speakQuestion = (text: string) => {
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

  // Speech Recognition handler (Click to Start / Click to Stop)
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
      
      if (transcript) {
        // Find matching option
        const correctOpt = currentQ.options.find(o => o.isCorrect);
        const spokenMatchesOption = currentQ.options.find(o => 
          transcript.toLowerCase().includes(o.id.toLowerCase()) ||
          checkSpeechAnswerMatch(transcript, o.text)
        );

        if (spokenMatchesOption) {
          setAttemptCount(0);
          handleSelectOption(spokenMatchesOption);
        } else if (correctOpt && checkSpeechAnswerMatch(transcript, correctOpt.text)) {
          setAttemptCount(0);
          handleSelectOption(correctOpt);
        } else {
          const nextAttempts = attemptCount + 1;
          setAttemptCount(nextAttempts);

          if (nextAttempts >= 4) {
            playSoundEffect('chime');
            clearTimer();
            timeoutRef.current = setTimeout(() => {
              setAttemptCount(0);
              if (currentIndex + 1 >= TOTAL_QUESTIONS) {
                setShowEcoPopup(true);
              } else {
                setCurrentIndex(prev => prev + 1);
                setSelectedOptionId(null);
                setIsAnswerCorrect(null);
                setWrongOptionId(null);
              }
            }, 2000);
          } else {
            playSoundEffect('fail');
            setIsAnswerCorrect(false);
          }
        }
      }
      return;
    }

    playSoundEffect('click');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speakQuestion(currentQ.speechText);
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

        // 25s safety timeout
        clearTimer();
        timeoutRef.current = setTimeout(() => {
          if (isListeningRef.current) {
            isListeningRef.current = false;
            setIsListening(false);
            try { recognition.stop(); } catch {}

            const transcript = accumulatedTranscriptRef.current.trim().toLowerCase();
            if (transcript) {
              const correctOpt = currentQ.options.find(o => o.isCorrect);
              const spokenMatchesOption = currentQ.options.find(o => 
                transcript.toLowerCase().includes(o.id.toLowerCase()) ||
                checkSpeechAnswerMatch(transcript, o.text)
              );

              if (spokenMatchesOption) {
                setAttemptCount(0);
                handleSelectOption(spokenMatchesOption);
              } else if (correctOpt && checkSpeechAnswerMatch(transcript, correctOpt.text)) {
                setAttemptCount(0);
                handleSelectOption(correctOpt);
              } else {
                const nextAttempts = attemptCount + 1;
                setAttemptCount(nextAttempts);

                if (nextAttempts >= 4) {
                  playSoundEffect('chime');
                  clearTimer();
                  timeoutRef.current = setTimeout(() => {
                    setAttemptCount(0);
                    if (currentIndex + 1 >= TOTAL_QUESTIONS) {
                      setShowEcoPopup(true);
                    } else {
                      setCurrentIndex(prev => prev + 1);
                      setSelectedOptionId(null);
                      setIsAnswerCorrect(null);
                      setWrongOptionId(null);
                    }
                  }, 2000);
                } else {
                  playSoundEffect('fail');
                  setIsAnswerCorrect(false);
                }
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

  // Handle Option Selection
  const handleSelectOption = (opt: CleanEnergyQuestion['options'][0]) => {
    if (isAnswerCorrect) return; // Already answered correctly, wait for Next button

    setSelectedOptionId(opt.id);

    if (opt.isCorrect) {
      // Correct!
      playSoundEffect('success');
      setIsAnswerCorrect(true);
      setWrongOptionId(null);

      // Increase energy progress: 25% per round
      const newProgress = Math.min(100, Math.round(((currentIndex + 1) / TOTAL_QUESTIONS) * 100));
      setEnergyProgress(newProgress);

      // If last question reached 100%
      if (currentIndex + 1 >= TOTAL_QUESTIONS) {
        timeoutRef.current = setTimeout(() => {
          playSoundEffect('celebrate');
          setShowEcoPopup(true);
        }, 1200);
      }
    } else {
      // Wrong! Gentle feedback, no point deduction, allow retry
      playSoundEffect('fail');
      setIsAnswerCorrect(false);
      setWrongOptionId(opt.id);

      timeoutRef.current = setTimeout(() => {
        setWrongOptionId(null);
        setSelectedOptionId(null);
        setIsAnswerCorrect(null);
      }, 1400);
    }
  };

  // Next Question Button handler
  const handleNextQuestion = () => {
    if (!isAnswerCorrect) return;
    playSoundEffect('click');

    if (currentIndex + 1 < TOTAL_QUESTIONS) {
      setCurrentIndex(prev => prev + 1);
      setAttemptCount(0);
      setSelectedOptionId(null);
      setIsAnswerCorrect(null);
      setWrongOptionId(null);
    } else {
      // Complete game
      setShowEcoPopup(true);
    }
  };

  // Claim completion reward: +30 EP and 1 tree
  const handleClaimReward = () => {
    if (hasClaimedReward) return;
    playSoundEffect('celebrate');
    onAwardEP(30);
    if (onAwardTree) {
      onAwardTree();
    }
    setHasClaimedReward(true);
    setClaimSuccessMsg('🎉 Chúc mừng! Bạn đã nhận thành công +30 EP và 1 cây xanh tươi tốt vào khu vườn sinh thái!');
  };

  // Visualizer calculations based on energyProgress (0, 25, 50, 75, 100)
  // Turbine spin speed:
  // 0% = paused
  // 25% = 4s
  // 50% = 2.5s
  // 75% = 1.5s
  // 100% = 0.8s
  const isTurbineSpinning = energyProgress > 0;
  const turbineSpinDuration = energyProgress === 100 
    ? '0.8s' 
    : energyProgress >= 75 
    ? '1.5s' 
    : energyProgress >= 50 
    ? '2.5s' 
    : energyProgress >= 25 
    ? '4s' 
    : '0s';

  const isSolarGlowing = energyProgress >= 25;
  const isCityLit = energyProgress >= 75;
  const isMaxPower = energyProgress === 100;

  return (
    <div className="w-full flex flex-col gap-4 max-w-5xl mx-auto pb-10">
      {/* 1. TOP BAR NAVIGATION & TITLE */}
      <div className="w-full bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playSoundEffect('click');
              onBackToGames();
            }}
            className="p-2 sm:p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold border border-amber-200 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 text-xs sm:text-sm shadow-xs"
            title="Quay lại danh sách trò chơi"
          >
            <ArrowLeft className="w-4 h-4 text-amber-800" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">⚡</span>
              <h2 className="text-lg sm:text-xl font-black text-amber-950 tracking-tight">
                Clean Energy - Năng lượng sạch
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                Unit Curriculum
              </span>
            </div>
            <p className="text-xs text-stone-600 font-medium mt-0.5">
              {selectedUnitName} {selectedLessonName ? `• ${selectedLessonName}` : ''}
            </p>
          </div>
        </div>

        {/* Question Counter & Clean Energy Badge */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="px-3 py-1.5 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-black">
            Question {currentIndex + 1} / {TOTAL_QUESTIONS}
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 text-xs font-black shadow-xs flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-amber-950" />
            <span>{energyProgress}% Clean Power</span>
          </div>
        </div>
      </div>

      {/* 2. RENEWABLE ENERGY VISUALIZER (Visual wind turbine, solar panels, and eco grid) */}
      <div className="w-full bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100 rounded-3xl p-4 sm:p-6 border-2 border-sky-300 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[260px] sm:min-h-[320px]">
        {/* Background Clouds & Sun */}
        <div className="absolute top-3 left-6 flex items-center gap-2 opacity-80 pointer-events-none">
          <div className="w-12 h-5 bg-white/70 rounded-full blur-[1px]" />
          <div className="w-16 h-6 bg-white/90 rounded-full -ml-4" />
        </div>
        <div className="absolute top-4 right-20 flex items-center gap-2 opacity-80 pointer-events-none">
          <div className="w-14 h-5 bg-white/80 rounded-full" />
          <div className="w-20 h-7 bg-white/90 rounded-full -ml-4" />
        </div>

        {/* Glowing Sun */}
        <div 
          className={`absolute top-4 right-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-700 flex items-center justify-center ${
            isSolarGlowing 
              ? 'bg-amber-300 shadow-[0_0_40px_rgba(251,191,36,0.9)] scale-110' 
              : 'bg-amber-100/70 shadow-none scale-95'
          }`}
        >
          <Sun className={`w-10 h-10 sm:w-12 sm:h-12 text-amber-500 transition-transform duration-1000 ${isSolarGlowing ? 'rotate-90 animate-spin-slow' : ''}`} />
          {isSolarGlowing && (
            <div className="absolute inset-0 rounded-full border-2 border-amber-400/50 animate-ping opacity-30" />
          )}
        </div>

        {/* Visualizer Status & Progress Header */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white/85 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/60 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-sm">
              ⚡
            </span>
            <div>
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                Năng lượng sạch / Clean Energy Progress
              </span>
              <span className="text-[11px] font-bold text-emerald-800">
                {energyProgress === 0 && 'Trạng thái: Thiết bị đang ngừng hoạt động'}
                {energyProgress === 25 && 'Bắt đầu tạo điện sạch: Tuabin quay nhẹ (25%)'}
                {energyProgress === 50 && 'Năng lượng tăng tốc: Pin mặt trời hấp thụ quang năng (50%)'}
                {energyProgress === 75 && 'Công suất cao: Dòng điện sạch dẫn về trường học (75%)'}
                {energyProgress === 100 && 'Hoàn thành 100%: Thành phố & Trường học sáng đèn rực rỡ! 🌟'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-48">
            <div className="w-full bg-stone-200/90 h-3 rounded-full overflow-hidden border border-stone-300 relative">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-green-500 transition-all duration-700 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                style={{ width: `${energyProgress}%` }}
              />
            </div>
            <span className="text-xs font-black text-emerald-950 tabular-nums shrink-0">
              {energyProgress}%
            </span>
          </div>
        </div>

        {/* Visual Apparatus Canvas: Wind Turbine, Solar Panels, Grid, Eco Town */}
        <div className="relative z-10 w-full mt-auto pt-6 pb-2 flex items-end justify-around px-2 sm:px-6">
          
          {/* 1. WIND TURBINE (Tuabin gió trực quan) */}
          <div className="flex flex-col items-center relative group">
            {/* Turbine Blades & Rotor */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center -mb-4 z-20">
              {/* Rotating Blades SVG */}
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full transition-transform"
                style={{
                  animation: isTurbineSpinning ? `spin ${turbineSpinDuration} linear infinite` : 'none',
                  filter: isMaxPower ? 'drop-shadow(0 0 8px rgba(34,197,94,0.9))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                }}
              >
                {/* Center Hub */}
                <circle cx="50" cy="50" r="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
                {/* Blade 1 (Up) */}
                <path d="M 49 50 C 47 30, 48 10, 50 4 C 52 10, 53 30, 51 50 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                {/* Blade 2 (Bottom-Right, 120 deg) */}
                <g transform="rotate(120 50 50)">
                  <path d="M 49 50 C 47 30, 48 10, 50 4 C 52 10, 53 30, 51 50 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                </g>
                {/* Blade 3 (Bottom-Left, 240 deg) */}
                <g transform="rotate(240 50 50)">
                  <path d="M 49 50 C 47 30, 48 10, 50 4 C 52 10, 53 30, 51 50 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                </g>
                {/* Center Pin */}
                <circle cx="50" cy="50" r="2.5" fill="#10b981" />
              </svg>

              {/* Wind stream effect when spinning */}
              {isTurbineSpinning && (
                <div className="absolute -left-6 top-8 pointer-events-none opacity-70">
                  <Wind className="w-5 h-5 text-sky-600 animate-pulse" />
                </div>
              )}
            </div>

            {/* Nacelle & Tower Mast */}
            <div className="w-3.5 sm:w-4 h-24 sm:h-32 bg-gradient-to-r from-slate-200 via-white to-slate-300 rounded-t-sm shadow-md border-x border-slate-300 relative z-10 flex flex-col items-center justify-end">
              {/* Foundation base */}
              <div className="w-8 sm:w-10 h-3 bg-slate-400 rounded-t-md -mb-1 shadow-sm" />
            </div>

            {/* Label */}
            <div className="mt-1 px-2 py-0.5 rounded-md bg-white/90 border border-slate-200 shadow-2xs text-[10px] sm:text-xs font-black text-slate-800">
              💨 Tuabin gió
            </div>
          </div>

          {/* 2. POWER TRANSMISSION LINE (Dây dẫn truyền tải điện) */}
          <div className="hidden sm:flex flex-col items-center justify-center flex-1 max-w-[120px] mb-8 relative">
            {/* Animated Electricity Sparks */}
            <div className="w-full h-1 bg-slate-400/60 rounded-full relative overflow-hidden">
              {isTurbineSpinning && (
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-yellow-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                  style={{ width: `${energyProgress}%` }}
                />
              )}
            </div>
            {isTurbineSpinning && (
              <span className="absolute -top-4 text-xs font-black text-amber-600 flex items-center gap-0.5 animate-bounce">
                ⚡ <span>+{energyProgress}%</span>
              </span>
            )}
          </div>

          {/* 3. SOLAR PANELS (Tấm pin năng lượng mặt trời) */}
          <div className="flex flex-col items-center relative group">
            {/* Sparkles on solar panel when active */}
            {isSolarGlowing && (
              <div className="absolute -top-3 right-0 text-amber-500 animate-pulse pointer-events-none z-30">
                <Sparkles className="w-5 h-5 fill-amber-400" />
              </div>
            )}

            {/* Solar Panel Array SVG */}
            <div className="relative w-28 sm:w-36 h-20 sm:h-24 z-10 flex items-center justify-center">
              <svg 
                viewBox="0 0 120 70" 
                className="w-full h-full"
                style={{
                  filter: isSolarGlowing 
                    ? 'drop-shadow(0 0 10px rgba(251,191,36,0.75))' 
                    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                }}
              >
                {/* Stand / Mount */}
                <line x1="60" y1="45" x2="60" y2="65" stroke="#475569" strokeWidth="4" />
                <line x1="45" y1="65" x2="75" y2="65" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

                {/* Angled Solar Array Frame */}
                <polygon 
                  points="15,45 105,45 95,15 25,15" 
                  fill={isSolarGlowing ? '#1e40af' : '#334155'} 
                  stroke="#94a3b8" 
                  strokeWidth="2" 
                />

                {/* Solar Cells Grid */}
                <line x1="42" y1="15" x2="35" y2="45" stroke="#93c5fd" strokeWidth="1" opacity="0.8" />
                <line x1="60" y1="15" x2="60" y2="45" stroke="#93c5fd" strokeWidth="1" opacity="0.8" />
                <line x1="78" y1="15" x2="85" y2="45" stroke="#93c5fd" strokeWidth="1" opacity="0.8" />
                
                <line x1="20" y1="30" x2="100" y2="30" stroke="#93c5fd" strokeWidth="1" opacity="0.8" />

                {/* Golden Sun reflection glaze when active */}
                {isSolarGlowing && (
                  <polygon 
                    points="25,15 65,15 50,45 15,45" 
                    fill="url(#solarGlaze)" 
                    opacity="0.6" 
                  />
                )}

                <defs>
                  <linearGradient id="solarGlaze" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Label */}
            <div className="mt-1 px-2 py-0.5 rounded-md bg-white/90 border border-slate-200 shadow-2xs text-[10px] sm:text-xs font-black text-slate-800">
              ☀️ Pin mặt trời
            </div>
          </div>

          {/* 4. ECO SCHOOL / COMMUNITY (Trường học & thành phố xanh) */}
          <div className="flex flex-col items-center relative">
            <div className="relative w-24 sm:w-32 h-20 sm:h-24 flex items-end justify-center z-10">
              {/* Building structure */}
              <div className={`w-20 sm:w-26 h-16 sm:h-18 rounded-t-xl border-2 transition-all duration-500 relative flex flex-col justify-between p-1.5 shadow-md ${
                isCityLit 
                  ? 'bg-gradient-to-t from-emerald-700 to-emerald-600 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)]' 
                  : 'bg-slate-300 border-slate-400'
              }`}>
                {/* Roof solar / flag */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-amber-400 text-[9px] font-black text-amber-950 border border-amber-500 shadow-2xs">
                  🏫 ECO
                </div>

                {/* Windows that glow when clean energy is high */}
                <div className="grid grid-cols-3 gap-1 mt-2">
                  {[1, 2, 3, 4, 5, 6].map(w => (
                    <div 
                      key={w}
                      className={`h-2.5 rounded-xs transition-colors duration-500 border ${
                        isCityLit 
                          ? 'bg-amber-300 border-amber-200 shadow-[0_0_6px_rgba(251,191,36,0.9)]' 
                          : 'bg-slate-500 border-slate-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Door */}
                <div className={`w-4 h-5 rounded-t-sm mx-auto ${isCityLit ? 'bg-amber-100' : 'bg-slate-600'}`} />
              </div>
            </div>

            {/* Label */}
            <div className="mt-1 px-2 py-0.5 rounded-md bg-white/90 border border-slate-200 shadow-2xs text-[10px] sm:text-xs font-black text-slate-800">
              🏡 Trường học xanh
            </div>
          </div>

        </div>

        {/* Grass bottom strip */}
        <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-emerald-600 to-emerald-500" />
      </div>

      {/* 3. QUESTION & AUDIO SECTION (Listen & Select) */}
      <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-400 shadow-md flex flex-col gap-4">
        
        {/* Listen to Question Prominent Card */}
        <div className="w-full bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-4 sm:p-5 border-2 border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              onClick={() => speakQuestion(currentQ.speechText)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all active:scale-90 cursor-pointer ${
                isPlayingAudio 
                  ? 'bg-emerald-600 text-white animate-pulse ring-4 ring-emerald-300' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
              }`}
              title="Click to listen to the question"
            >
              <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">
                  Question · Listen & Answer
                </span>
                {isPlayingAudio && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 text-[10px] font-extrabold animate-pulse">
                    Playing audio...
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-emerald-950 mt-1 tracking-tight leading-snug">
                "{currentQ.question}"
              </h3>
            </div>
          </div>

          <button
            onClick={() => speakQuestion(currentQ.speechText)}
            className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-xs sm:text-sm rounded-xl border border-emerald-300 flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 self-end sm:self-center"
          >
            <Volume2 className="w-4 h-4 text-emerald-800" />
            <span>Listen / Nghe</span>
          </button>
        </div>

        {/* Speak with Mic button (Click to Start / Click to Stop) */}
        <button
          type="button"
          onClick={startListening}
          className={`w-full py-3 px-4 rounded-2xl border-2 font-black text-xs sm:text-sm flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-98 my-1 ${
            isListening 
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-lg ring-4 ring-rose-300 animate-pulse' 
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2">
            {isListening ? <Square className="w-4 h-4 fill-white shrink-0" /> : <Mic className="w-4 h-4 text-emerald-700 shrink-0" />}
            <span className="font-extrabold">
              {isListening ? 'Stop & Evaluate / Dừng & Chấm điểm 🛑' : 'Speak with Mic · Luyện phát âm trực tiếp 🎤'}
            </span>
          </div>
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
            isListening ? 'bg-white/25 text-white' : 'bg-emerald-200/80 text-emerald-900'
          }`}>
            {isListening ? 'Bấm khi đọc xong' : 'Bấm để nói'}
          </span>
        </button>

        {/* 4. ANSWER OPTIONS (A, B, C) - Clean English Only */}
        <div className="grid grid-cols-1 gap-3 w-full mt-1">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isThisCorrect = isAnswerCorrect && isSelected;
            const isThisWrong = wrongOptionId === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswerCorrect === true}
                className={`w-full p-4 sm:p-5 rounded-2xl border-2 font-bold text-left transition-all flex items-center justify-between gap-3 shadow-xs cursor-pointer ${
                  isThisCorrect
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-md ring-4 ring-emerald-200 scale-[1.01]'
                    : isThisWrong
                    ? 'bg-rose-50 border-rose-400 text-rose-950 animate-shake'
                    : isSelected
                    ? 'bg-amber-50 border-amber-400 text-amber-950'
                    : 'bg-white border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-2xs ${
                    isThisCorrect
                      ? 'bg-white text-emerald-700'
                      : isThisWrong
                      ? 'bg-rose-200 text-rose-900'
                      : 'bg-stone-100 text-stone-700 group-hover:bg-emerald-200'
                  }`}>
                    {opt.id}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold tracking-tight">
                    {opt.text}
                  </span>
                </div>

                {isThisCorrect && (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Banner & Next Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold min-h-[32px]">
            {isAnswerCorrect === true && (
              <span className="text-emerald-700 flex items-center gap-1.5 font-black animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>🎉 Excellent! Tuyệt vời! Clean power activated! (+25% Energy) ⚡</span>
              </span>
            )}
            {isAnswerCorrect === false && (
              <span className="text-amber-800 flex items-center gap-1.5 font-extrabold animate-fade-in">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Not quite right! Please try again! 🎤</span>
              </span>
            )}
            {isAnswerCorrect === null && (
              <span className="text-stone-500 font-semibold">
                Click the speaker to listen, then select option A, B, or C.
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

      {/* 5. ECO-KNOWLEDGE COMPLETION POPUP (Thẻ kiến thức xanh - Không gian rộng rãi, thoáng đãng) */}
      {showEcoPopup && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl sm:rounded-4xl w-[94vw] max-w-4xl lg:max-w-[920px] max-h-[92vh] overflow-y-auto p-6 sm:p-8 md:p-10 shadow-2xl relative border-[4px] border-emerald-400 flex flex-col gap-6 animate-scale-up my-auto">
            
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
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left border-b border-emerald-200/80 pb-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-400 to-emerald-500 text-amber-950 flex items-center justify-center text-4xl sm:text-5xl shadow-lg shrink-0 animate-bounce">
                ☀️
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="inline-flex items-center justify-center sm:justify-start">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs sm:text-sm font-black border border-emerald-300 shadow-2xs tracking-wide">
                    🌱 Thẻ kiến thức xanh · Eco-Knowledge Card
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                  Năng lượng sạch & Tương lai xanh
                </h3>
                <p className="text-sm sm:text-base font-bold text-emerald-900/80">
                  Chúc mừng em đã hoàn thành thử thách năng lượng và thắp sáng 100% mạng lưới điện sạch!
                </p>
              </div>
            </div>

            {/* Educational Message Content - Divided into 3 Distinct Clear Blocks */}
            <div className="flex flex-col gap-3.5">
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                <span>⚡ Bài học năng lượng sạch cùng Eco-Buddy (Clean Energy Lesson)</span>
              </div>

              {/* Block 1 */}
              <div className="bg-gradient-to-r from-teal-50 via-emerald-50/70 to-white rounded-2xl p-4 sm:p-5 border-2 border-teal-200 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-200/70 flex items-center justify-center text-2xl shrink-0">
                  💨
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-black text-teal-950 mb-1">
                    Năng lượng tái tạo vô tận (Wind & Solar Power)
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-emerald-950 font-medium leading-relaxed">
                    <strong>Năng lượng gió (Wind Power)</strong> và <strong>năng lượng mặt trời (Solar Power)</strong> là nguồn năng lượng tái tạo sạch, vô tận, không tạo ra khói bụi và không gây ô nhiễm môi trường.
                  </p>
                </div>
              </div>

              {/* Block 2 */}
              <div className="bg-gradient-to-r from-emerald-50 via-green-50/70 to-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-200 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-200/70 flex items-center justify-center text-2xl shrink-0">
                  🌍
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-black text-emerald-950 mb-1">
                    Bảo vệ bầu không khí & Giảm phát thải CO₂
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-emerald-950 font-medium leading-relaxed">
                    Sử dụng điện từ năng lượng sạch giúp giữ cho bầu không khí quanh trường học và khu dân cư luôn trong lành, bảo vệ rừng cây tự nhiên và đẩy lùi hiện tượng biến đổi khí hậu trên Trái Đất.
                  </p>
                </div>
              </div>

              {/* Block 3 */}
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50/70 to-white rounded-2xl p-4 sm:p-5 border-2 border-amber-200 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-200/70 flex items-center justify-center text-2xl shrink-0">
                  💡
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-black text-amber-950 mb-1">
                    Hành động tiết kiệm điện của chúng mình (Energy Saving Tip)
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-emerald-950 font-medium leading-relaxed">
                    Em hãy nhớ luôn <strong>tắt đèn, quạt và máy lạnh</strong> khi rời khỏi lớp học hoặc phòng ngủ, đồng thời mở cửa sổ để tận dụng ánh sáng tự nhiên và gió trời trong lành!
                  </p>
                </div>
              </div>
            </div>

            {/* Reward Section (Spacious, prominent metrics) */}
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

              {!hasClaimedReward ? (
                <button
                  onClick={handleClaimReward}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black text-xs sm:text-sm md:text-base rounded-2xl shadow-md cursor-pointer transition-all active:scale-95 animate-pulse shrink-0 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-amber-800" />
                  <span>Nhận 30 EP & 1 Cây xanh</span>
                </button>
              ) : (
                <span className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 text-white font-black text-xs sm:text-sm md:text-base rounded-2xl flex items-center justify-center gap-2 shrink-0 shadow-md">
                  <Check className="w-5 h-5 text-white" />
                  <span>Đã nhận thưởng ✓</span>
                </span>
              )}
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
