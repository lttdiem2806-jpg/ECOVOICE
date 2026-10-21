import React from 'react';
import { Volume2, Mic, RotateCcw, Sparkles, CheckCircle2, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { PronunciationEvaluationResult } from '../services/pronunciationFeedbackService';

interface InteractivePronunciationFeedbackProps {
  evaluation: PronunciationEvaluationResult;
  transcript: string;
  targetText: string;
  attemptCount: number;
  onListen: (slow?: boolean) => void;
  onPracticeAgain: () => void;
  isSpeakingActive: boolean;
  onNextItem?: () => void;
  hasNextItem?: boolean;
}

export const InteractivePronunciationFeedback: React.FC<InteractivePronunciationFeedbackProps> = ({
  evaluation,
  transcript,
  targetText,
  attemptCount,
  onListen,
  onPracticeAgain,
  isSpeakingActive,
  onNextItem,
  hasNextItem = true
}) => {
  const { tier, score, tierBadgeEn, tierBadgeVi, feedbackEn, feedbackVi, tip, wordAnalysis, isPassed } = evaluation;

  // Tier color themes
  const tierStyles = {
    excellent: {
      cardBg: 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/90 border-emerald-400',
      badgeBg: 'bg-emerald-600 text-white',
      textColor: 'text-emerald-950',
      subTextColor: 'text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      tag: '🌟'
    },
    good: {
      cardBg: 'bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 border-sky-400',
      badgeBg: 'bg-sky-600 text-white',
      textColor: 'text-sky-950',
      subTextColor: 'text-emerald-900',
      icon: <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />,
      tag: '👍'
    },
    needs_practice: {
      cardBg: 'bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-100/70 border-amber-300',
      badgeBg: 'bg-amber-600 text-white',
      textColor: 'text-amber-950',
      subTextColor: 'text-amber-900',
      icon: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
      tag: '🌱'
    }
  }[tier];

  return (
    <div className={`w-full rounded-2xl border-2 p-3 sm:p-4 shadow-sm transition-all duration-200 ${tierStyles.cardBg} flex flex-col gap-2.5 animate-in fade-in`}>
      
      {/* 1. Header: Tier Badge, Score, and Attempt Loop Counter */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-black/5">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-1 shadow-2xs ${tierStyles.badgeBg}`}>
            <span>{tierStyles.tag}</span>
            <span>{tierBadgeEn} / {tierBadgeVi}</span>
          </span>
          <span className="font-black text-xs sm:text-sm text-emerald-950 tabular-nums">
            Score: <strong className="text-base sm:text-lg">{score}%</strong>
          </span>
        </div>

        {/* Practice Loop Attempt Counter */}
        <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${
          attemptCount >= 4 && !isPassed
            ? 'bg-amber-100 text-amber-900 border-amber-300'
            : 'text-emerald-800 bg-white/80 border-emerald-200'
        }`}>
          <RotateCcw className="w-3 h-3 text-emerald-600" />
          <span>{attemptCount >= 4 && !isPassed ? 'Lần thử #4/4 · Tự động chuyển thử thách ⏩' : `Lần thử #${attemptCount}/4`}</span>
        </div>
      </div>

      {/* 2. Pedagogical Encouraging Messages (Positive & Student-Centric) */}
      <div className="flex flex-col gap-0.5 leading-snug">
        <p className="text-xs sm:text-sm font-extrabold text-emerald-950">
          {feedbackEn}
        </p>
        <p className="text-[11px] sm:text-xs font-medium text-emerald-900">
          {feedbackVi}
        </p>
      </div>

      {/* What AI Heard */}
      <div className="text-[11px] text-emerald-900/90 bg-white/70 rounded-xl px-2.5 py-1.5 border border-emerald-200/80 flex items-center gap-1.5 flex-wrap">
        <span className="font-bold text-emerald-800">🎙️ AI nghe thấy:</span>
        <span className="italic font-bold text-emerald-950">"{transcript || '(chưa nghe rõ)'}"</span>
        {score < 80 && (
          <span className="text-[10px] text-emerald-700 ml-auto">
            (Chuẩn mục tiêu: "{targetText}")
          </span>
        )}
      </div>

      {/* 3. Word Analysis Breakdown for Sentences */}
      {wordAnalysis && wordAnalysis.length > 1 && (
        <div className="bg-white/80 rounded-xl p-2 border border-emerald-200 flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
            Chi tiết từng từ trong câu:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {wordAnalysis.map((w, idx) => (
              <span
                key={idx}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold border transition-all ${
                  w.status === 'correct'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : w.status === 'close'
                    ? 'bg-sky-100 text-sky-950 border-sky-300'
                    : 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-300/60 font-black'
                }`}
                title={w.status === 'correct' ? 'Đã phát âm chuẩn!' : 'Cần chú ý phát âm rõ hơn'}
              >
                {w.word} {w.status === 'correct' ? '✓' : w.status === 'close' ? '≈' : '•'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. Interactive Phonics & Mouth Shape Guidance (Gợi ý sửa lỗi thông minh) */}
      {!isPassed && tip && (
        <div className="bg-white/95 rounded-xl p-2.5 sm:p-3 border border-emerald-300 shadow-2xs flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-base shrink-0 shadow-2xs">
            👄
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1 leading-snug">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-emerald-950">
                {tip.focusSoundLabel}
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-1.5 py-0.2 rounded-md">
                Mẹo khẩu hình
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-900 font-semibold mt-0.5">
              {tip.mouthTipVi}
            </p>
            <p className="text-[10px] text-emerald-700 italic">
              {tip.mouthTipEn}
            </p>
          </div>
        </div>
      )}

      {/* 5. Practice Loop Action Buttons: Listen Sample, Listen Slowly, Speak Again & Next Button */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <button
          type="button"
          onClick={() => onListen(false)}
          className="flex-1 min-w-[100px] py-1.5 px-2.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Nghe mẫu</span>
        </button>

        <button
          type="button"
          onClick={() => onListen(true)}
          className="flex-1 min-w-[100px] py-1.5 px-2.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
        >
          <span>🐢</span>
          <span>Nghe chậm</span>
        </button>

        {isPassed && onNextItem && hasNextItem ? (
          <button
            type="button"
            onClick={onNextItem}
            className="w-full sm:w-auto sm:flex-1 min-w-[130px] py-2 px-3 bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] hover:from-[#0f5430] hover:to-[#22c55e] text-white font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ring-2 ring-emerald-400/80 animate-bounce-subtle"
          >
            <span>Next (Tiếp)</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        ) : attemptCount >= 4 && !isPassed ? (
          <div className="w-full sm:w-auto sm:flex-1 min-w-[130px] py-1.5 px-3 bg-amber-500 text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-center gap-1.5 animate-pulse">
            <span>⏩</span>
            <span>Đang chuyển thử thách tiếp theo...</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onPracticeAgain}
            disabled={isSpeakingActive}
            className="w-full sm:w-auto sm:flex-1 min-w-[130px] py-1.5 px-3 bg-gradient-to-r from-[#0c4326] to-[#16a34a] hover:from-[#0f5430] hover:to-[#22c55e] text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ring-2 ring-emerald-300/40"
          >
            <Mic className="w-3.5 h-3.5 text-white" />
            <span>Luyện nói lại</span>
          </button>
        )}
      </div>
    </div>
  );
};
