import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Mic, 
  Square,
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  X,
  Play,
  Sprout,
  Award,
  RefreshCw,
  Heart
} from 'lucide-react';
import { getCustomVisual } from '../services/teacherContentService';
import { calculatePronunciationScoreWithTolerances } from '../services/pronunciationFeedbackService';

export interface EcoLessonItem {
  id: string;
  en: string;
  vi: string;
  tip: string;
}

export const ECO_LESSONS: EcoLessonItem[] = [
  {
    id: 'lungs-of-earth',
    en: 'Trees are the green lungs of our Earth. Always plant and protect trees around us!!',
    vi: 'Cây xanh là lá phổi xanh của Trái Đất, giúp cung cấp oxy và làm sạch không khí. Hãy luôn có ý thức trồng, chăm sóc và bảo vệ cây xanh quanh trường, quanh nhà em nhé',
    tip: 'Em hãy nhớ tưới nước cho cây mỗi sáng và không ngắt hoa bẻ cành quanh trường nhé! 💧'
  },
  {
    id: 'cool-shade-home',
    en: 'Every green tree gives shade, absorbs carbon dioxide, and creates a lovely home for birds!',
    vi: 'Mỗi cây xanh cho bóng râm mát lành, hấp thụ khí CO2 và là ngôi nhà ấm áp cho các bạn chim non ríu rít ca vang!',
    tip: 'Cùng chung tay dọn rác và giữ gìn môi trường xanh quanh gốc cây em nhé! 🍃'
  },
  {
    id: 'plant-for-future',
    en: 'Caring for a little sapling today creates a thriving, fresh forest for our future tomorrow!',
    vi: 'Chăm sóc một mầm cây nhỏ bé hôm nay sẽ tạo nên khu rừng bạt ngàn tươi tốt cho tương lai xanh ngày mai!',
    tip: 'Hãy lan tỏa thông điệp yêu thiên nhiên đến bạn bè và gia đình nhé! 🌍'
  }
];

export interface GrowTreeGameProps {
  selectedUnitName: string;
  selectedLessonName: string;
  vocabularyList: Array<{
    word: string;
    phonetic?: string;
    meaning: string;
    speechText?: string;
    icon?: string;
  }>;
  onBackToGames: () => void;
  playSoundEffect: (name: 'chime' | 'success' | 'click' | 'celebrate' | 'fail') => void;
  onAwardEP: (ep: number) => void;
  onAwardTree: () => void;
  totalUserTrees: number;
  onOpenGarden?: () => void;
}

// Icon mapping helper for vocabulary words
const getWordIllustration = (word: string, fallbackIcon?: string): string => {
  // If a valid fallback icon exists (including unicode compound emojis), use it directly
  if (fallbackIcon && fallbackIcon.trim().length > 0) return fallbackIcon.trim();
  const w = word.trim().toUpperCase();

  // 1. Colors (Accurately matched 100%)
  if (w === 'ORANGE' || w.includes('ORANGE COLOUR')) return '🟠';
  if (w === 'RED') return '🔴';
  if (w === 'BLUE') return '🔵';
  if (w === 'GREEN') return '🟢';
  if (w === 'YELLOW') return '🟡';
  if (w === 'BLACK') return '⚫';
  if (w === 'WHITE') return '⚪';
  if (w === 'BROWN') return '🟤';
  if (w === 'PINK') return '🌸';
  if (w === 'PURPLE') return '🟣';

  // 2. Animals (Accurately matched 100%)
  if (w.includes('TIGER')) return '🐅';
  if (w.includes('LION')) return '🦁';
  if (w.includes('MONKEY')) return '🐒';
  if (w.includes('ELEPHANT')) return '🐘';
  if (w.includes('PEACOCK')) return '🦚';
  if (w.includes('GIRAFFE')) return '🦒';
  if (w.includes('ZEBRA')) return '🦓';
  if (w.includes('CROCODILE')) return '🐊';
  if (w.includes('KANGAROO')) return '🦘';
  if (w.includes('HIPPO')) return '🦛';
  if (w.includes('CAT')) return '🐱';
  if (w.includes('DOG')) return '🐶';
  if (w.includes('BIRD')) return '🐦';
  if (w.includes('RABBIT')) return '🐰';
  if (w.includes('PARROT')) return '🦜';
  if (w.includes('HAMSTER')) return '🐹';
  if (w.includes('GOLDFISH') || w.includes('FISH')) return '🐠';

  // 3. Food & Drinks
  if (w.includes('ORANGE JUICE')) return '🧃';
  if (w.includes('JUICE')) return '🧃';
  if (w.includes('MILK')) return '🥛';
  if (w.includes('WATER')) return '💧';
  if (w.includes('BREAD')) return '🍞';
  if (w.includes('RICE')) return '🍚';
  if (w.includes('CHICKEN')) return '🍗';
  if (w.includes('MEAT')) return '🥩';
  if (w.includes('APPLE')) return '🍎';
  if (w.includes('EGGS') || w.includes('EGG')) return '🥚';

  // 4. School Items
  if (w.includes('PENCIL CASE')) return '👝';
  if (w.includes('PENCIL')) return '✏️';
  if (w.includes('PEN')) return '🖊️';
  if (w.includes('RULER')) return '📏';
  if (w.includes('ERASER')) return '🧽';
  if (w.includes('NOTEBOOK')) return '📒';
  if (w.includes('BOOK') || w.includes('READ')) return '📚';
  if (w.includes('BAG') || w.includes('SCHOOL BAG')) return '🎒';
  if (w.includes('CRAYON')) return '🖍️';

  // 5. Clothes
  if (w.includes('T-SHIRT') || w.includes('SHIRT')) return '👕';
  if (w.includes('SKIRT')) return '👗';
  if (w.includes('JACKET')) return '🧥';
  if (w.includes('CAP') || w.includes('HAT')) return '🧢';
  if (w.includes('TROUSERS') || w.includes('JEANS')) return '👖';
  if (w.includes('SHOES') || w.includes('SHOE')) return '👟';
  if (w.includes('SOCKS') || w.includes('SOCK')) return '🧦';

  // 6. Rooms & House
  if (w.includes('LIVING ROOM')) return '🛋️';
  if (w.includes('BEDROOM') || w.includes('BED')) return '🛏️';
  if (w.includes('KITCHEN') || w.includes('COOK')) return '🍳';
  if (w.includes('BATHROOM')) return '🚿';
  if (w.includes('DINING ROOM')) return '🍽️';
  if (w.includes('DESK')) return '🗄️';
  if (w.includes('CHAIR')) return '🪑';
  if (w.includes('DOOR')) return '🚪';
  if (w.includes('WINDOW')) return '🪟';
  if (w.includes('WARDROBE')) return '👗';
  if (w.includes('LAMP')) return '💡';
  if (w.includes('CLOCK')) return '⏰';
  if (w.includes('PICTURE')) return '🖼️';
  if (w.includes('GARDEN') || w.includes('FLOWER')) return '🌸';
  if (w.includes('HOME') || w.includes('HOUSE')) return '🏡';

  // 7. Weather
  if (w.includes('SUN') || w.includes('SUNNY')) return '☀️';
  if (w.includes('RAIN') || w.includes('RAINY')) return '🌧️';
  if (w.includes('WIND') || w.includes('WINDY')) return '💨';
  if (w.includes('SNOW') || w.includes('SNOWY')) return '❄️';
  if (w.includes('STORM') || w.includes('STORMY')) return '⛈️';
  if (w.includes('HOT')) return '🥵';
  if (w.includes('COLD')) return '🥶';

  // 8. Toys & Activities
  if (w.includes('ROBOT')) return '🤖';
  if (w.includes('DOLL')) return '🪆';
  if (w.includes('KITE')) return '🪁';
  if (w.includes('TEDDY')) return '🧸';
  if (w.includes('BALL') || w.includes('FOOTBALL')) return '⚽';
  if (w.includes('BASKETBALL')) return '🏀';
  if (w.includes('CAR')) return '🚗';
  if (w.includes('BUS')) return '🚌';
  if (w.includes('TRAIN')) return '🚆';
  if (w.includes('PLANE')) return '✈️';
  if (w.includes('SHIP')) return '🚢';
  if (w.includes('BIKE') || w.includes('CYCLE')) return '🚲';

  // 9. Greetings & People
  if (w.includes('BYE') || w.includes('HELLO') || w.includes('HI')) return '👋';
  if (w.includes('FAMILY')) return '👨‍👩‍👧‍👦';
  if (w.includes('TEACHER')) return '👩‍🏫';
  if (w.includes('DOCTOR')) return '👨‍⚕️';
  if (w.includes('NURSE')) return '👩‍⚕️';
  if (w.includes('PILOT')) return '👨‍✈️';
  if (w.includes('SING') || w.includes('SONG') || w.includes('MUSIC')) return '🎵';
  if (w.includes('RUN') || w.includes('PLAY')) return '🏃';
  if (w.includes('SCHOOL') || w.includes('CLASS')) return '🏫';
  if (w.includes('NAME')) return '🏷️';
  if (w.includes('CLEAN') || w.includes('ECO')) return '🌱';

  return '🌱';
};

export const GrowTreeGame: React.FC<GrowTreeGameProps> = ({
  selectedUnitName,
  vocabularyList,
  onBackToGames,
  playSoundEffect,
  onAwardEP,
  onAwardTree,
  totalUserTrees,
  onOpenGarden
}) => {
  // Game session states (Fixed to 3 items as in the design)
  const TOTAL_ITEMS = 3;
  const [gameVocabs, setGameVocabs] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0); // 0, 1, 2
  const [completedCount, setCompletedCount] = useState<number>(0); // 0, 1, 2, 3
  const [isListening, setIsListening] = useState<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>('');
  const [isWatering, setIsWatering] = useState<boolean>(false);
  
  // Eco-Education popup & reward claim state
  const [showEcoKnowledgePopup, setShowEcoKnowledgePopup] = useState<boolean>(false);
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [claimNotification, setClaimNotification] = useState<string | null>(null);
  
  // Feedback state
  const [speechAttempts, setSpeechAttempts] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    text: string;
    isCorrect: boolean | null; // null: default prompt, true: correct, false: retry
  }>({
    text: 'Nghe mẫu rồi nói nhé!',
    isCorrect: null
  });

  // In-app browser detection
  const [isInAppBrowser, setIsInAppBrowser] = useState<boolean>(false);
  const [showInAppBanner, setShowInAppBanner] = useState<boolean>(true);

  // Track session trees and energy EP
  const [sessionEP, setSessionEP] = useState<number>(0);
  const [treesReceived, setTreesReceived] = useState<number>(totalUserTrees);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Detect in-app browsers on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      const inApp = /FBAN|FBAV|Instagram|Line|Zalo|Twitter|Snapchat|Pinterest|Musical_ly|TikTok|ByteDance|MicroMessenger|Messenger/i.test(ua) ||
        (ua.includes('wv') && ua.includes('Android')) ||
        (/iPhone|iPad|iPod/.test(ua) && !ua.includes('Safari') && ua.includes('WebKit'));
      if (inApp) {
        setIsInAppBrowser(true);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  // Accuracy helper with primary-school phonetic tolerances (e.g. for 'lane')
  const calculateAccuracy = (spoken: string, target: string): number => {
    return calculatePronunciationScoreWithTolerances(spoken, target);
  };

  // Initialize or restart 3 words from vocabularyList
  const initGameSession = () => {
    let pool = [...vocabularyList];
    if (pool.length === 0) {
      pool = [
        { word: 'BYE', phonetic: '/baɪ/', meaning: 'tạm biệt', speechText: 'Bye' },
        { word: 'HELLO', phonetic: '/həˈləʊ/', meaning: 'xin chào', speechText: 'Hello' },
        { word: 'TREE', phonetic: '/triː/', meaning: 'cây xanh', speechText: 'Tree' }
      ];
    }

    // Pick 3 random words (or repeat if < 3)
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected: any[] = [];
    for (let i = 0; i < TOTAL_ITEMS; i++) {
      selected.push(shuffled[i % shuffled.length]);
    }

    setGameVocabs(selected);
    setCurrentIndex(0);
    setCompletedCount(0);
    setSpeechAttempts(0);
    setSessionEP(0);
    setShowEcoKnowledgePopup(false);
    setHasClaimedReward(false);
    setClaimNotification(null);
    setIsWatering(false);
    setFeedback({
      text: 'Nghe mẫu rồi nói nhé!',
      isCorrect: null
    });
  };

  useEffect(() => {
    initGameSession();
  }, [vocabularyList]);

  // Current active word
  const currentItem = gameVocabs[currentIndex] || {
    word: 'BYE',
    phonetic: '/baɪ/',
    meaning: 'tạm biệt',
    speechText: 'Bye'
  };

  // Text-To-Speech helper
  const handleTTS = (slow: boolean = false) => {
    playSoundEffect('click');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = currentItem.speechText || currentItem.word;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = slow ? 0.65 : 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 3. Hành vi tiếp theo (Next Action):
  // Thẻ có nút bấm xác nhận "Nhận phần thưởng & Vun trồng tiếp" (Claim Reward and Keep Planting / Great job!),
  // khi học sinh bấm vào sẽ đóng popup, cộng điểm EP vào khu vườn ảo ('My Garden') và cho phép tiếp tục hành trình học tập.
  const handleClaimReward = (nextDestination?: 'continue' | 'garden' | 'replay' | 'games') => {
    playSoundEffect('celebrate');
    
    // Credit reward to My Garden if not claimed yet (only award EP for correctly spoken words)
    if (!hasClaimedReward) {
      const epToAward = Math.min(30, completedCount * 10);
      if (epToAward > 0) {
        onAwardEP(epToAward);
      }
      if (completedCount >= TOTAL_ITEMS) {
        onAwardTree();
        setTreesReceived(prev => prev + 1);
      }
      setHasClaimedReward(true);
    }

    setShowEcoKnowledgePopup(false);

    if (nextDestination === 'garden') {
      if (onOpenGarden) {
        onOpenGarden();
      }
    } else if (nextDestination === 'replay') {
      initGameSession();
    } else if (nextDestination === 'games') {
      onBackToGames();
    } else {
      const epEarned = Math.min(30, completedCount * 10);
      setClaimNotification(`🎉 Đã nạp +${epEarned} EP vào My Garden! Tiếp tục hành trình nào!`);
      setFeedback({
        text: `🎉 Đã nạp +${epEarned} EP vào My Garden! Em có thể bấm "Chơi lại" để gieo hạt giống cây mới nhé.`,
        isCorrect: true
      });
    }
  };

  // Trigger correct pronunciation flow
  const handleCorrectSpeech = (spokenText: string, accuracy: number = 100) => {
    playSoundEffect('success');
    setIsWatering(true);
    setSpeechAttempts(0);

    const nextCompleted = completedCount + 1;
    setCompletedCount(nextCompleted);

    // Track session EP: 10 EP per successful word
    const nextSessionEP = Math.min(30, nextCompleted * 10);
    setSessionEP(nextSessionEP);

    // Stop watering animation after 1.8s
    setTimeout(() => {
      setIsWatering(false);
    }, 1800);

    // 1. Khoảnh khắc kích hoạt (Trigger Moment):
    // Ngay khi học sinh hoàn thành xong trò chơi và mầm cây ảo phát triển thành cây trưởng thành/nở hoa,
    // hệ thống tự động hiển thị hộp thoại chúc mừng kèm kiến thức sinh thái (Eco-Knowledge Popup)
    if (nextCompleted >= TOTAL_ITEMS) {
      setFeedback({
        text: `Xuất sắc! Mầm cây đã phát triển thành cây trưởng thành nở hoa rực rỡ! 🌸🍎`,
        isCorrect: true
      });

      // Brief 1.2s delay for student to see tree fully bloom in the garden scene
      setTimeout(() => {
        playSoundEffect('celebrate');
        setShowEcoKnowledgePopup(true);
      }, 1200);
    } else {
        setFeedback({
          text: `🎉 Excellent! Tuyệt vời! Cây xanh đã lớn thêm một bước! (Độ chính xác: ${accuracy}%) (+10 EP)`,
          isCorrect: true
        });

        // Advance to next word after 1.6s
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setFeedback({
            text: 'Nghe mẫu rồi nói nhé!',
            isCorrect: null
          });
        }, 1600);
      }
  };

  // Trigger retry speech flow with 4-attempt auto-skip without EP
  const handleIncorrectSpeech = (spokenText: string, accuracy: number = 0) => {
    playSoundEffect('fail');
    const newAttempts = speechAttempts + 1;
    setSpeechAttempts(newAttempts);

    if (newAttempts >= 4) {
      playSoundEffect('chime');
      setFeedback({
        text: "Cố gắng lắm! Em đã rất nỗ lực thử thách 4 lần. Let's move to the next challenge! / Cùng chuyển sang thử thách tiếp theo nhé! 🌟",
        isCorrect: null
      });

      // Automatically advance to the next challenge after 2 seconds without awarding EP
      setTimeout(() => {
        setSpeechAttempts(0);
        if (currentIndex + 1 >= TOTAL_ITEMS) {
          if (completedCount > 0) {
            playSoundEffect('celebrate');
            setShowEcoKnowledgePopup(true);
          } else {
            setFeedback({
              text: 'Em đã hoàn thành lượt luyện tập. Cùng thử lại ở lượt tiếp theo để vun trồng mầm cây nhé! 🌱',
              isCorrect: null
            });
          }
        } else {
          setCurrentIndex(prev => prev + 1);
          setFeedback({
            text: 'Nghe mẫu rồi nói nhé!',
            isCorrect: null
          });
        }
      }, 2000);
    } else {
      setFeedback({
        text: `Try again! Chưa chính xác (Em phát âm: "${spokenText || 'chưa rõ'}" - ${accuracy}%). Em hãy bấm 'Speak with Mic' để phát âm lại nhé! 🎤`,
        isCorrect: false
      });
    }
  };

  // Speech Recognition handler optimized for mobile browsers (Click to Start / Click to Stop)
  const startListening = () => {
    // If currently listening, stop & evaluate accumulated speech immediately
    if (isListening || isListeningRef.current) {
      clearTimer();
      isListeningRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }

      playSoundEffect('click');
      const transcript = accumulatedTranscriptRef.current.trim();
      const target = currentItem.word.trim();

      if (transcript) {
        const accuracy = calculateAccuracy(transcript, target);
        if (accuracy >= 70) {
          handleCorrectSpeech(transcript, accuracy);
        } else {
          handleIncorrectSpeech(transcript, accuracy);
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
    accumulatedTranscriptRef.current = '';

    // Check browser speech recognition
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setFeedback({
        text: 'Trình duyệt chưa hỗ trợ Web Speech API. Bé hãy mở ứng dụng trên Google Chrome hoặc Safari nhé!',
        isCorrect: false
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
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setFeedback({
          text: `🎤 Đang lắng nghe... Đọc hết từ "${currentItem.word}" rồi bấm "Dừng & Chấm điểm" nhé!`,
          isCorrect: null
        });

        // 25s safety timeout guard
        clearTimer();
        timeoutRef.current = setTimeout(() => {
          if (isListeningRef.current) {
            isListeningRef.current = false;
            setIsListening(false);
            try { recognition.stop(); } catch {}
            const spoken = accumulatedTranscriptRef.current.trim();
            const target = currentItem.word.trim();
            if (spoken) {
              const accuracy = calculateAccuracy(spoken, target);
              if (accuracy >= 70) {
                handleCorrectSpeech(spoken, accuracy);
              } else {
                handleIncorrectSpeech(spoken, accuracy);
              }
            } else {
              handleIncorrectSpeech('', 0);
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
        const clean = fullText.trim();
        if (clean) {
          accumulatedTranscriptRef.current = clean;
          setFeedback({
            text: `🎙️ "${clean}" (Bấm "Dừng & Chấm điểm" khi đọc xong)`,
            isCorrect: null
          });
        }
      };

      recognition.onerror = (event: any) => {
        const err = event.error;
        if (err === 'no-speech' && accumulatedTranscriptRef.current.trim()) {
          return;
        }
        clearTimer();
        isListeningRef.current = false;
        setIsListening(false);

        if (err === 'not-allowed' || err === 'permission-denied' || err === 'service-not-allowed') {
          setFeedback({
            text: 'Vui lòng cấp quyền truy cập Micro trên trình duyệt điện thoại để tiếp tục!',
            isCorrect: false
          });
        } else if (err === 'no-speech') {
          setFeedback({
            text: 'Bé chưa nói gì nè, hãy bấm nói lại nhé! 🎤',
            isCorrect: false
          });
        } else if (err === 'audio-capture') {
          setFeedback({
            text: 'Không thu được tín hiệu âm thanh từ Microphone. Bé hãy kiểm tra kết nối mic nhé!',
            isCorrect: false
          });
        } else if (err === 'network') {
          setFeedback({
            text: 'Lỗi kết nối mạng khi nhận diện giọng nói. Bé vui lòng kiểm tra Internet nhé!',
            isCorrect: false
          });
        } else if (err !== 'aborted') {
          setFeedback({
            text: 'Chưa nghe rõ giọng bé, bé bấm nút và nói lại nhé! 🎤',
            isCorrect: false
          });
        }
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
    } catch (err) {
      clearTimer();
      isListeningRef.current = false;
      setIsListening(false);
      setFeedback({
        text: 'Vui lòng cấp quyền truy cập Micro trên trình duyệt điện thoại để tiếp tục!',
        isCorrect: false
      });
    }
  };

  // Simulated test button for quick testing / fallback
  const handleSimulatePass = () => {
    handleCorrectSpeech(currentItem.word, 100);
  };

  // Determine tree stage (0, 1, 2, 3)
  const treeStage = completedCount; // 0: sprout, 1: sapling, 2: bigger sapling, 3: full tree & flowers
  const stageName = 
    treeStage === 0 ? 'Mầm cây đang ươm 🌱' :
    treeStage === 1 ? 'Cây con đang lớn 🌿' :
    treeStage === 2 ? 'Cây vươn cành xanh 🎋' : 'Cây trưởng thành nở hoa 🌸';

  return (
    <div className="w-full flex flex-col gap-3 font-sans pb-8">
      {/* IN-APP BROWSER NOTICE (Zalo, Facebook, Messenger, TikTok...) */}
      {isInAppBrowser && showInAppBanner && (
        <div className="w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs sm:text-sm text-amber-950 font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg shrink-0">📱</span>
            <span>Mở bằng Chrome/Safari để sử dụng tính năng thu âm tốt nhất</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  setFeedback({ text: 'Đã sao chép liên kết! Dán vào Chrome/Safari nhé.', isCorrect: null });
                }
              }}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black cursor-pointer shadow-2xs"
            >
              Chép link
            </button>
            <button
              onClick={() => setShowInAppBanner(false)}
              className="w-6 h-6 rounded-full hover:bg-amber-200/60 flex items-center justify-center text-amber-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP BAR (Unit name + Back to Games button) */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-[2px] border-[#86c898]/80 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-black text-emerald-950">
            {selectedUnitName || 'Unit 1 - Hello'}
          </span>
        </div>

        {/* Back to games button with rounded style */}
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
            <span className="text-base sm:text-lg shrink-0">🎉</span>
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
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-2xs"
            >
              Trồng cây mới
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

      {/* 2. NOTICE HEADER BANNER */}
      <div className="w-full bg-white rounded-2xl px-4 py-2.5 border-[1.5px] border-emerald-200 shadow-xs flex items-center justify-start gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-bold text-emerald-950">
          <span className="text-base sm:text-lg">🎯</span>
          <span>Nói đúng mục luyện để chăm cây lớn dần.</span>
        </div>
      </div>

      {/* 3. TWO COLUMNS LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full items-stretch">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: YOUR GROWING TREE / CÂY ĐANG LỚN            */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-[2.5px] border-[#86c898]/90 shadow-sm flex flex-col justify-between gap-3">
          {/* Column Title */}
          <div>
            <h2 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight">
              Your Growing Tree / Cây đang lớn
            </h2>
          </div>

          {/* Garden Landscape Scene */}
          <div className="w-full h-56 sm:h-64 rounded-2xl relative overflow-hidden border border-emerald-300/80 shadow-inner flex flex-col justify-between p-3 select-none bg-gradient-to-b from-[#87ceeb] via-[#bbf2f6] to-[#78c962]">
            {/* SVG Illustrated Landscape Backdrop */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 240">
              <defs>
                {/* Sun Glow */}
                <radialGradient id="sunGlow" cx="65%" cy="25%" r="60%">
                  <stop offset="0%" stopColor="#fff7aa" stopOpacity="0.9" />
                  <stop offset="30%" stopColor="#fef08a" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                </radialGradient>
                {/* Mountain Gradients */}
                <linearGradient id="mountGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#86efac" />
                </linearGradient>
                {/* Lawn Gradient */}
                <linearGradient id="lawnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="40%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>

              {/* Distant Mountains */}
              <polygon points="0,150 70,110 140,150 220,105 310,160 400,120 400,240 0,240" fill="url(#mountGrad)" opacity="0.6" />
              <polygon points="30,160 110,125 180,165 260,115 350,170 400,140 400,240 0,240" fill="#a7f3d0" opacity="0.5" />

              {/* Sun Rays */}
              <circle cx="260" cy="50" r="140" fill="url(#sunGlow)" />
              <circle cx="260" cy="50" r="26" fill="#fef08a" />

              {/* Pine trees in background */}
              <polygon points="20,170 32,130 44,170" fill="#047857" opacity="0.45" />
              <polygon points="40,175 50,138 60,175" fill="#065f46" opacity="0.5" />
              <polygon points="340,170 352,132 364,170" fill="#047857" opacity="0.4" />
              <polygon points="360,175 372,136 384,175" fill="#065f46" opacity="0.45" />

              {/* Lush Green Lawn Ground */}
              <path d="M0,160 Q100,145 200,158 T400,152 L400,240 L0,240 Z" fill="url(#lawnGrad)" />
            </svg>

            {/* Top Badge: "Trồng cây" */}
            <div className="relative z-10 self-start">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-white/95 text-emerald-950 border border-emerald-300 shadow-sm flex items-center gap-1">
                🌱 Trồng cây
              </span>
            </div>

            {/* Tree Stump on Bottom-Left */}
            <div className="absolute left-2 sm:left-4 bottom-12 z-10 flex flex-col items-center pointer-events-none">
              <div className="text-3xl sm:text-4xl filter drop-shadow-md">🪵</div>
              <div className="text-xs -mt-1">🌼</div>
            </div>

            {/* Blue Watering Can on Bottom-Right */}
            <div className={`absolute right-3 sm:right-6 bottom-12 z-10 transition-transform duration-500 pointer-events-none ${isWatering ? '-translate-y-4 -rotate-12 scale-110' : ''}`}>
              <div className="text-3xl sm:text-4xl filter drop-shadow-md relative">
                🚰
                {/* Water drops stream when watering */}
                {isWatering && (
                  <div className="absolute -left-4 top-2 flex flex-col gap-1 animate-bounce">
                    <span className="text-xs text-sky-400">💧</span>
                    <span className="text-xs text-sky-500">💧</span>
                  </div>
                )}
              </div>
            </div>

            {/* Center: The Growing Tree & Animated Stage */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              {/* Mound of earth */}
              <div className="relative flex flex-col items-center">
                {/* Plant Graphic */}
                <div className={`transition-all duration-700 transform ${
                  treeStage === 0 ? 'scale-100' :
                  treeStage === 1 ? 'scale-125 -translate-y-2' :
                  treeStage === 2 ? 'scale-150 -translate-y-4' :
                  'scale-175 -translate-y-6'
                }`}>
                  {treeStage === 0 && (
                    <div className="flex flex-col items-center">
                      <div className="text-5xl sm:text-6xl filter drop-shadow-lg animate-pulse">🌱</div>
                      <div className="w-10 h-2 bg-amber-900/40 rounded-full blur-[1px]"></div>
                    </div>
                  )}
                  {treeStage === 1 && (
                    <div className="flex flex-col items-center">
                      <div className="text-6xl sm:text-7xl filter drop-shadow-lg">🌿</div>
                      <div className="w-14 h-2.5 bg-amber-900/50 rounded-full blur-[1px]"></div>
                    </div>
                  )}
                  {treeStage === 2 && (
                    <div className="flex flex-col items-center">
                      <div className="text-6xl sm:text-7xl filter drop-shadow-lg">🎋</div>
                      <div className="w-16 h-3 bg-amber-900/50 rounded-full blur-[1px]"></div>
                    </div>
                  )}
                  {treeStage === 3 && (
                    <div className="flex flex-col items-center relative">
                      <div className="text-7xl sm:text-8xl filter drop-shadow-xl animate-bounce">🌳</div>
                      <div className="absolute -top-2 -right-2 text-xl animate-ping">✨</div>
                      <div className="absolute -top-1 -left-2 text-base">🍎</div>
                      <div className="w-20 h-3.5 bg-amber-900/60 rounded-full blur-[1px]"></div>
                    </div>
                  )}
                </div>

                {/* Stage Label Badge */}
                <div className="mt-2">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-white/90 backdrop-blur-xs text-emerald-900 border border-emerald-300 shadow-xs">
                    {stageName}
                  </span>
                </div>
              </div>
            </div>

            {/* Glassmorphic Progress Overlay Box */}
            <div className="relative z-10 w-full bg-white/85 backdrop-blur-md rounded-2xl p-2.5 border border-white/80 shadow-md flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                <span>{completedCount}/{TOTAL_ITEMS} nhiệm vụ</span>
                <span className="text-emerald-700 font-extrabold">
                  {Math.round((completedCount / TOTAL_ITEMS) * 100)}%
                </span>
              </div>
              {/* Green Progress Bar */}
              <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden p-0.5 border border-emerald-200">
                <div 
                  className="h-full bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${(completedCount / TOTAL_ITEMS) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Under Garden Box: Energy & Trees stats */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
              <span>Năng lượng cây tiếp theo: {sessionEP}/30 EP</span>
              <span className="text-emerald-600 font-extrabold">{sessionEP} EP</span>
            </div>

            {/* EP Progress Bar */}
            <div className="w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-[#10b981] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (sessionEP / 30) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-extrabold text-emerald-900 mt-1">
              <span>{treesReceived} cây đã nhận</span>
              <span className="text-emerald-600">🌲 Bộ sưu tập vườn xanh</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: SAY THE WORD / NÓI TỪ                      */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-[2.5px] border-[#86c898]/90 shadow-sm flex flex-col justify-between gap-4">
          
          {/* Column Header & Turn Badge */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight">
              Say the Word / Nói từ
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#e2f4e8] text-emerald-900 border border-emerald-300 shadow-2xs">
              Mục {currentIndex + 1}/{TOTAL_ITEMS}
            </span>
          </div>

          {/* Center Word Illustration */}
          <div className="flex flex-col items-center justify-center my-auto py-2">
            {(() => {
              const custom = getCustomVisual(undefined, currentItem.word);
              return (
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-6xl sm:text-7xl shadow-sm hover:scale-105 transition-transform duration-300 select-none overflow-hidden p-2">
                  {custom?.imageUrl ? (
                    <img 
                      src={custom.imageUrl} 
                      alt={currentItem.word} 
                      className="w-full h-full object-contain rounded-2xl"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    getWordIllustration(currentItem.word, custom?.customIcon || currentItem.icon)
                  )}
                </div>
              );
            })()}

            {/* Word Display & Translation */}
            <div className="flex flex-col items-center mt-3 text-center">
              <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-wider uppercase">
                {currentItem.word}
              </h1>

              {/* Phonetic if available */}
              {currentItem.phonetic && (
                <span className="text-xs font-semibold text-emerald-700 tracking-wide font-mono mt-0.5">
                  {currentItem.phonetic}
                </span>
              )}

              {/* Audio Listen */}
              <button
                onClick={() => handleTTS(false)}
                className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-black text-emerald-800 cursor-pointer transition-colors shadow-2xs"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Listen / Nghe phát âm</span>
              </button>
            </div>
          </div>

          {/* Action Area: Listen & Speak Buttons */}
          <div className="flex flex-col gap-3">
            {/* Listen / Listen Slowly Buttons */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                onClick={() => handleTTS(false)}
                className="py-2.5 px-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 border-2 border-emerald-200 hover:border-emerald-400 font-extrabold text-xs sm:text-sm shadow-2xs transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
                  <span>Listen</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Nghe mẫu
                </span>
              </button>

              <button
                onClick={() => handleTTS(true)}
                className="py-2.5 px-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 border-2 border-emerald-200 hover:border-emerald-400 font-extrabold text-xs sm:text-sm shadow-2xs transition-all flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base group-hover:scale-110 transition-transform">🐢</span>
                  <span>Listen Slowly</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Nghe chậm
                </span>
              </button>
            </div>

            {/* Primary Action Button: Speak (Click to Start / Click to Stop) */}
            <button
              onClick={startListening}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base text-white shadow-md flex flex-col items-center justify-center cursor-pointer transition-all border border-emerald-400/40 relative overflow-hidden ${
                isListening
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 ring-4 ring-rose-200 animate-pulse'
                  : 'bg-gradient-to-r from-[#0d4a2b] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] active:scale-98 shadow-[0_4px_14px_rgba(13,74,43,0.3)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce text-white' : ''}`} />
                <span>{isListening ? 'Stop & Evaluate / Dừng & Chấm điểm 🛑' : 'Speak with Mic · Luyện phát âm 🎤'}</span>
              </div>
              <span className="text-[11px] font-extrabold text-emerald-100">
                {isListening ? 'Bấm vào đây khi bé đọc xong để chấm điểm' : 'Bấm để bắt đầu luyện phát âm'}
              </span>
            </button>

            {/* Status / Feedback Box */}
            <div className={`w-full rounded-2xl p-3 border flex items-center gap-2.5 transition-all text-xs sm:text-sm font-bold ${
              feedback.isCorrect === true
                ? 'bg-emerald-100/90 text-emerald-950 border-emerald-400 shadow-2xs'
                : feedback.isCorrect === false
                ? 'bg-amber-100/90 text-amber-950 border-amber-300 shadow-2xs'
                : 'bg-[#e7f7ed] text-emerald-900 border-emerald-200/80'
            }`}>
              <div className="text-lg shrink-0">
                {feedback.isCorrect === true ? '🎉' : feedback.isCorrect === false ? '🌱' : '🌱'}
              </div>
              <p className="flex-1 leading-snug">
                {feedback.text}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* 4. ECO-EDUCATION POPUP (Kích hoạt ngay khi mầm cây phát triển thành cây trưởng thành/nở hoa) */}
      {showEcoKnowledgePopup && (() => {
        const currentLesson = ECO_LESSONS[activeLessonIndex % ECO_LESSONS.length];
        return (
          <div className="fixed inset-0 z-50 bg-emerald-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-gradient-to-b from-[#f4fbf6] via-white to-[#edf9f1] rounded-3xl sm:rounded-4xl max-w-3xl lg:max-w-4xl w-full p-5 sm:p-7 md:p-8 border-[3.5px] border-[#10b981] shadow-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[96vh] overflow-y-auto">
              
              {/* Decorative Nature Glows */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-300/30 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal-300/30 blur-2xl pointer-events-none" />

              {/* Close button (safely claims reward if not yet claimed) */}
              <button
                type="button"
                onClick={() => handleClaimReward('continue')}
                title="Đóng và nhận thưởng"
                className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/95 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center cursor-pointer transition-colors shadow-xs z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Tag: Eco-Education */}
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs sm:text-sm font-black uppercase tracking-wider shadow-2xs">
                <span>🌱 Eco-Education · Giáo dục môi trường</span>
              </div>

              {/* Celebration Visual & Heading (Harmonious horizontal layout on sm+) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full">
                {/* Fully Grown Blossoming Tree */}
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-[#86efac] via-[#34d399] to-[#10b981] border-4 border-white shadow-lg flex items-center justify-center text-4xl sm:text-5xl select-none animate-bounce shrink-0 relative">
                  🌳
                  <span className="absolute -top-1 -right-1 text-lg animate-ping">✨</span>
                  <span className="absolute -top-1 -left-1 text-sm">🌸</span>
                  <span className="absolute bottom-0 right-0 text-sm">🍎</span>
                </div>

                <div className="flex flex-col text-center sm:text-left gap-1">
                  <h2 className="text-2xl sm:text-3xl md:text-3xl font-black text-emerald-950 tracking-tight leading-tight">
                    Congratulations! Cây xanh đã nở hoa! 🌸
                  </h2>
                  <p className="text-sm sm:text-base font-bold text-emerald-800 leading-snug">
                    Chúc mừng em đã hoàn thành xuất sắc 3/3 từ vựng và chăm sóc mầm cây lớn thành cây xanh rực rỡ!
                  </p>
                </div>
              </div>

              {/* Eco-Knowledge Card: Green Lesson with Eco-Buddy (Bilingual EN - VI) */}
              <div className="w-full bg-gradient-to-br from-emerald-50 via-white to-green-50/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border-2 border-emerald-300 shadow-sm text-left flex flex-col gap-3 relative">
                
                {/* Card Title & Rotate Lesson Button */}
                <div className="flex items-center justify-between gap-3 border-b border-emerald-200/90 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl sm:text-3xl">🌳</span>
                    <div className="text-left">
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-emerald-950 flex items-center gap-1.5 leading-snug">
                        <span>Green Lesson with Eco-Buddy</span>
                      </h3>
                      <span className="text-xs sm:text-sm font-bold text-emerald-700">
                        Bài học sinh thái cùng Eco-Buddy
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect('click');
                      setActiveLessonIndex(prev => (prev + 1) % ECO_LESSONS.length);
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

                {/* Vietnamese Translation & Environmental Value (Enlarged font & relaxed spacing) */}
                <div className="text-emerald-900 font-bold text-sm sm:text-base md:text-base leading-relaxed bg-white/95 p-3.5 sm:p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
                  <p>({currentLesson.vi})</p>
                </div>

                {/* Practical Eco Tip (Enlarged & Clear) */}
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
                  <span className="text-xs sm:text-sm text-emerald-700 font-bold">Điểm sinh thái</span>
                </div>
                <div className="w-px h-10 bg-emerald-300" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl">🌲</span>
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-950 tabular-nums">+1 Cây Xanh</span>
                  <span className="text-xs sm:text-sm text-emerald-700 font-bold">Khu vườn ảo</span>
                </div>
                <div className="w-px h-10 bg-emerald-300" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl">🏡</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-emerald-950">My Garden</span>
                  <span className="text-xs sm:text-sm text-emerald-700 font-bold">Khu vườn của em</span>
                </div>
              </div>

              {/* Action Buttons (Generous touch targets and clean layout) */}
              <div className="flex flex-col gap-2.5 w-full mt-1">
                {/* Primary Action Button: "Nhận phần thưởng & Vun trồng tiếp" */}
                <button
                  type="button"
                  onClick={() => handleClaimReward('continue')}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-[#0d4a2b] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-98 cursor-pointer transition-all flex flex-col items-center justify-center gap-0.5 border-2 border-emerald-300 ring-4 ring-emerald-200/50 group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                    <span>Nhận phần thưởng & Vun trồng tiếp</span>
                    <Sparkles className="w-5 h-5 text-amber-300 group-hover:-rotate-12 transition-transform" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-emerald-100">
                    Claim Reward and Keep Planting · Great job!
                  </span>
                </button>

                {/* Secondary Navigation Options */}
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
                    <span>Trồng cây mới (Play Again)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClaimReward('games')}
                    className={`py-2.5 sm:py-3 px-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300 font-black text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      onOpenGarden ? '' : 'col-span-1'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Về trò chơi</span>
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
