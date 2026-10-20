import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  X, 
  Zap, 
  Sprout, 
  Sparkles, 
  Award, 
  Download, 
  Calendar,
  Filter,
  Medal,
  CheckCircle2,
  Users,
  ChevronDown
} from 'lucide-react';
import { 
  getHonorBoardStudents, 
  HonorStudent, 
  exportHonorBoardToExcel,
  getAvailableClassesForHonor,
  AvailableHonorClass
} from '../services/honorBoardService';
import { STUDENTS_EVENT, CLASSES_EVENT } from '../services/teacherContentService';
import { isGuestUser } from '../services/studentActivityService';

interface HonorBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudentName: string;
  currentStudentClass: string;
  selectedGrade: string;
  currentEP: number;
  currentTrees: number;
  playSoundEffect?: (name: 'chime' | 'success' | 'click' | 'celebrate' | 'fail') => void;
  userRole?: 'student' | 'teacher' | 'guest';
  isGuestMode?: boolean;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

export const HonorBoardModal: React.FC<HonorBoardModalProps> = ({
  isOpen,
  onClose,
  currentStudentName,
  currentStudentClass,
  selectedGrade,
  currentEP,
  currentTrees,
  playSoundEffect,
  userRole = 'student',
  isGuestMode = false,
  isLoggedIn = false,
  onOpenLoginModal
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [classesList, setClassesList] = useState<AvailableHonorClass[]>(() => getAvailableClassesForHonor());

  // Determine if this is strictly a student account (not Teacher/Admin and not Guest mode)
  const isGuest = Boolean(
    isGuestMode ||
    userRole === 'guest' ||
    !isLoggedIn ||
    currentStudentClass === 'Trải nghiệm (Demo / Guest)' ||
    !currentStudentName ||
    isGuestUser(currentStudentName)
  );
  const isTeacher = userRole === 'teacher';
  const isStudentUser = Boolean(isLoggedIn && !isTeacher && !isGuest && currentStudentName);
  const cleanClassName = (cls?: string) => cls ? cls.replace(/^Lớp\s+/i, '').replace(/^\$/, '').trim() : '';
  const studentClassClean = cleanClassName(currentStudentClass) || '';

  // For Student accounts: strictly locked to their own class. For Teacher/Guest: flexible dropdown
  const [scope, setScope] = useState<string>(() => {
    if (isStudentUser) {
      return studentClassClean;
    }
    if (currentStudentClass && currentStudentClass !== 'Trải nghiệm (Demo / Guest)') {
      return currentStudentClass.replace(/^Lớp\s+/i, '').trim() || 'all';
    }
    return 'all';
  });

  const effectiveScope = isStudentUser ? studentClassClean : scope;
  const [students, setStudents] = useState<HonorStudent[]>([]);

  // Synchronize available classes list dynamically with Admin / Teacher Dashboard
  useEffect(() => {
    const syncClasses = () => {
      setClassesList(getAvailableClassesForHonor());
    };
    window.addEventListener(CLASSES_EVENT, syncClasses);
    window.addEventListener(STUDENTS_EVENT, syncClasses);
    window.addEventListener('storage', syncClasses);
    return () => {
      window.removeEventListener(CLASSES_EVENT, syncClasses);
      window.removeEventListener(STUDENTS_EVENT, syncClasses);
      window.removeEventListener('storage', syncClasses);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const fetchBoard = () => {
      if (isGuest) {
        if (currentEP > 0) {
          setStudents([{
            id: 'guest-session-student',
            name: 'Guest Mode',
            avatar: '🌟',
            ecoPoints: currentEP,
            trees: currentTrees,
            className: 'Khách trải nghiệm',
            grade: selectedGrade || '4',
            rank: 1,
            titleBadge: 'Khách trải nghiệm',
            score: Math.min(100, Math.round(currentEP * 1.5)),
            lastPractice: 'Phiên này'
          }]);
        } else {
          setStudents([]);
        }
        return;
      }
      const isQualifiedStudent = Boolean(isLoggedIn && isStudentUser && currentStudentName && currentEP > 0);
      const list = getHonorBoardStudents({
        scope: effectiveScope,
        timeRange,
        currentStudent: isQualifiedStudent ? {
          name: currentStudentName,
          ecoPoints: currentEP,
          trees: currentTrees,
          className: currentStudentClass,
          grade: selectedGrade
        } : undefined
      });
      // STRICT REQUIREMENT: Chỉ hiển thị học sinh có điểm tích lũy EP > 0
      setStudents(list.filter(s => (s.ecoPoints ?? 0) > 0));
    };

    fetchBoard();

    window.addEventListener(STUDENTS_EVENT, fetchBoard);
    window.addEventListener(CLASSES_EVENT, fetchBoard);
    window.addEventListener('storage', fetchBoard);
    return () => {
      window.removeEventListener(STUDENTS_EVENT, fetchBoard);
      window.removeEventListener(CLASSES_EVENT, fetchBoard);
      window.removeEventListener('storage', fetchBoard);
    };
  }, [isOpen, effectiveScope, timeRange, currentStudentName, currentStudentClass, selectedGrade, currentEP, currentTrees, isLoggedIn]);

  if (!isOpen) return null;

  const qualifiedStudents = students.filter(s => (s.ecoPoints ?? 0) > 0);
  const top1 = qualifiedStudents.find(s => s.rank === 1);
  const top2 = qualifiedStudents.find(s => s.rank === 2);
  const top3 = qualifiedStudents.find(s => s.rank === 3);

  const myRankInfo = !isGuest && isLoggedIn && isStudentUser && Boolean(currentStudentName)
    ? qualifiedStudents.find(s => s.name.trim().toLowerCase() === currentStudentName.trim().toLowerCase())
    : undefined;

  const getScopeLabel = () => {
    if (isStudentUser) return `Lớp ${studentClassClean}`;
    if (effectiveScope === 'all') return 'Toàn trường';
    const matched = classesList.find(c => c.name.toLowerCase() === effectiveScope.toLowerCase());
    if (matched) return matched.displayName;
    return effectiveScope.startsWith('Lớp') ? effectiveScope : `Lớp ${effectiveScope}`;
  };

  const handleExport = () => {
    if (playSoundEffect) playSoundEffect('celebrate');
    const scopeLabel = getScopeLabel();
    const timeLabel = timeRange === 'week' ? 'Tuần này' : 'Tháng này';
    exportHonorBoardToExcel(students, scopeLabel, timeLabel);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#f0faf4] rounded-3xl max-w-3xl w-full p-4 sm:p-6 border-[3px] border-[#86c898] shadow-2xl relative flex flex-col gap-4 max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-emerald-950 flex items-center justify-center text-xl sm:text-2xl shadow-md border-2 border-white">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-emerald-950 font-display">
                  {isStudentUser ? `Bảng Vinh Danh Lớp ${studentClassClean}` : 'Bảng Vinh Danh & Thi Đua'}
                </h3>
                <span className="text-[10px] uppercase font-black bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full shadow-2xs">
                  Honor Board
                </span>
              </div>
              <p className="text-xs text-emerald-800 font-medium">
                {isStudentUser
                  ? `Vinh danh các bạn học sinh Lớp ${studentClassClean} có điểm Eco Points > 0 & nhiều cây xanh nhất`
                  : 'Vinh danh các đại sứ xanh tích lũy điểm Eco Points > 0 & nhiều cây xanh nhất'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTeacher && (
              <button
                onClick={handleExport}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold text-xs shadow-xs cursor-pointer transition-all border border-emerald-600"
                title="Xuất bảng xếp hạng ra file Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Excel</span>
              </button>
            )}

            <button
              onClick={() => {
                if (playSoundEffect) playSoundEffect('click');
                onClose();
              }}
              className="p-1.5 rounded-xl hover:bg-emerald-100 text-emerald-900 hover:text-emerald-950 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white/80 p-2 sm:p-2.5 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Scope selection: In Guest Mode, hide class filter dropdown completely. In Student mode, lock to class. In Teacher mode, allow selection */}
          {isGuest ? (
            <div className="flex items-center gap-1.5 bg-emerald-100/90 text-emerald-950 px-3 py-1 rounded-xl border border-emerald-300 shadow-2xs text-xs font-black">
              <span>🌟</span>
              <span>Phiên Khách Trải Nghiệm</span>
            </div>
          ) : isStudentUser ? (
            <div className="flex items-center gap-2 bg-emerald-100/90 text-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs">
              <span className="text-emerald-800 font-black text-xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Phạm vi:</span>
              </span>
              <span className="bg-emerald-700 text-white font-black text-xs px-2.5 py-0.5 rounded-lg shadow-2xs">
                Lớp {studentClassClean}
              </span>
              <span className="text-[10px] text-emerald-800 font-bold bg-white/90 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <span>🔒</span>
                <span>Lớp của bạn</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <label htmlFor="student-honor-scope-select" className="text-emerald-950 font-extrabold text-xs flex items-center gap-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5 text-emerald-700" />
                <span>Lọc theo:</span>
              </label>
              
              <div className="relative">
                <select
                  id="student-honor-scope-select"
                  value={scope}
                  onChange={(e) => {
                    if (playSoundEffect) playSoundEffect('click');
                    setScope(e.target.value);
                  }}
                  className="appearance-none bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 font-bold text-xs py-1.5 pl-3 pr-8 rounded-xl border-2 border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer shadow-2xs"
                >
                  <option value="all">Toàn trường (Tất cả các lớp)</option>
                  {classesList.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {cls.displayName}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-800">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* Time range switch */}
          <div className="flex items-center gap-1.5 bg-[#dcf4e5] p-1 rounded-xl border border-emerald-300 shrink-0">
            <span className="text-[11px] font-bold text-emerald-900 pl-1 hidden sm:inline">
              Thời gian:
            </span>
            <button
              onClick={() => {
                if (playSoundEffect) playSoundEffect('click');
                setTimeRange('week');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                timeRange === 'week'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-950'
              }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => {
                if (playSoundEffect) playSoundEffect('click');
                setTimeRange('month');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                timeRange === 'month'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-950'
              }`}
            >
              Tháng này
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">

          {/* THANH TRẠNG THÁI CÁ NHÂN: Ẩn hoàn toàn đối với Chế độ Khách (Guest Mode) */}
          {isGuest ? null : !isLoggedIn ? (
            <div className="rounded-2xl p-3 bg-gradient-to-r from-amber-50 to-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                  🔑
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="font-extrabold text-xs sm:text-sm text-emerald-950">
                    Đăng nhập để xem thứ hạng của bạn!
                  </span>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    Đăng nhập tài khoản học sinh để theo dõi vị trí và nhận huy hiệu vinh danh thi đua.
                  </span>
                </div>
              </div>
              {onOpenLoginModal && (
                <button
                  onClick={() => {
                    if (playSoundEffect) playSoundEffect('click');
                    onClose();
                    onOpenLoginModal();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-black transition-all cursor-pointer shadow-xs shrink-0 self-end sm:self-auto"
                >
                  Đăng nhập ngay
                </button>
              )}
            </div>
          ) : isStudentUser && ((myRankInfo?.ecoPoints ?? 0) > 0 || currentEP > 0) ? (
            <div className="rounded-2xl p-3 sm:p-3.5 text-white flex items-center justify-between shadow-md border-2 transition-all bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 border-amber-400 ring-2 ring-amber-300/30">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl font-black text-base flex items-center justify-center shrink-0 shadow-xs bg-amber-400 text-emerald-950 ring-2 ring-white/50">
                  {myRankInfo && myRankInfo.ecoPoints > 0 ? `#${myRankInfo.rank}` : '🌱'}
                </span>
                <div className="flex flex-col min-w-0 leading-tight">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-amber-200 text-sm sm:text-base truncate">
                      {myRankInfo?.name || currentStudentName || 'Học sinh'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold shadow-2xs bg-emerald-600 text-white border border-emerald-400">
                      🏆 Bạn đang xếp Hạng #{myRankInfo ? myRankInfo.rank : 1}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-100 font-medium mt-0.5 truncate">
                    {myRankInfo?.titleBadge ? `${myRankInfo.titleBadge} • ` : ''}Lớp {studentClassClean}
                  </span>
                </div>
              </div>

              {/* Personal EP & Virtual Trees - Unified Single Source of Truth */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-wider text-amber-200 font-black">Điểm EP</span>
                  <div className="flex items-center gap-1 text-amber-300 font-black text-sm sm:text-base tabular-nums">
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>{myRankInfo ? myRankInfo.ecoPoints : (currentEP || 100)}</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-white/20" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-wider text-emerald-200 font-black">Cây xanh</span>
                  <div className="flex items-center gap-1 text-emerald-100 font-black text-sm sm:text-base tabular-nums">
                    <span>{myRankInfo ? myRankInfo.trees : Math.floor((currentEP || 100) / 30)}</span>
                    <span className="text-base">🌲</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Top 3 Podium (Bục vinh danh) */}
          <div className="bg-gradient-to-b from-[#e3f7ec] to-white rounded-3xl p-3 sm:p-5 border-2 border-emerald-300 shadow-sm flex items-center justify-center min-h-[160px]">
            {(!top1 || top1.ecoPoints === 0 || students.length === 0) ? (
              <div className="w-full py-8 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-300 flex items-center justify-center text-2xl mb-2 shadow-xs ring-4 ring-emerald-100">
                  🌱
                </div>
                <div className="flex flex-col gap-1.5 max-w-md items-center">
                  <h4 className="font-extrabold text-base sm:text-lg text-emerald-950 font-display">
                    {isGuest ? 'Phiên trải nghiệm chưa có dữ liệu' : 'No Accumulation Points Yet'}
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-emerald-800 leading-relaxed text-center">
                    {isGuest 
                      ? 'Hãy bắt đầu luyện nói hoặc chơi Eco Games để tích lũy EP và ghi tên lên Bảng Vàng ngay trong phiên này!'
                      : 'Chưa có học sinh nào đạt điểm tích lũy trong khoảng thời gian này'}
                  </p>
                </div>
                {!isGuest && (
                  <div className="text-xs text-emerald-800/90 max-w-md mt-1 leading-relaxed">
                    <span className="block font-semibold">The Honor Board displays students with Eco Points (EP &gt; 0).</span>
                    <span className="italic text-[11px]">Bảng vinh danh chỉ hiển thị học sinh có điểm tích lũy EP &gt; 0. Các em hãy hoàn thành bài luyện nói tiếng Anh hoặc tham gia Eco Games để tích lũy EP và bước lên Bục Quán Quân nhé! ✨</span>
                  </div>
                )}
              </div>
            ) : isGuest || (!top2 && !top3) ? (
              /* STREAMLINED CHAMPION DISPLAY: Biểu tượng ngôi sao vàng Quán quân (hạng 1) + tên đậm rõ ràng + thanh chi tiết tinh tế */
              <div className="w-full py-3.5 px-3 flex flex-col items-center justify-center text-center animate-fade-in">
                {/* Golden Star Champion (Hạng 1) */}
                <div className="relative mb-1.5">
                  <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 fill-amber-400 absolute -top-3.5 left-1/2 -translate-x-1/2 drop-shadow-sm animate-bounce-subtle" />
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 border-2 border-amber-400 flex items-center justify-center text-2xl sm:text-3xl shadow-sm ring-4 ring-amber-200/50">
                    🌟
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500 text-emerald-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                    1
                  </span>
                </div>

                {/* Name: Rõ ràng, phông chữ đậm, dễ đọc */}
                <h4 className="font-black text-base sm:text-lg text-emerald-950 font-display tracking-tight mt-0.5">
                  {top1?.name || 'Guest Mode'}
                </h4>

                {/* Compact, elegant bar for achievement metrics and Quán quân title */}
                <div className="mt-2 inline-flex items-center gap-2 sm:gap-2.5 bg-white/95 border border-emerald-200/90 px-3 py-1 rounded-full shadow-2xs text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-300/90 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <span>🏆</span>
                    <span>Quán quân</span>
                  </span>
                  <span className="text-emerald-300">•</span>
                  <div className="flex items-center gap-1 text-amber-700 font-black tabular-nums">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>{top1?.ecoPoints || 0} EP</span>
                  </div>
                  <span className="text-emerald-300">•</span>
                  <div className="flex items-center gap-1 text-emerald-800 font-black tabular-nums">
                    <span>{top1?.trees || 0}</span>
                    <span className="text-xs">🌲 cây</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-end justify-center gap-2 sm:gap-4 pt-3 pb-1">
                {/* Rank 2 (Silver) */}
                {top2 && (top2.ecoPoints > 0 || top2.trees > 0) ? (
                  <div className="flex-1 flex flex-col items-center max-w-[170px] text-center">
                    <div className="relative mb-1.5">
                      <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xl sm:text-2xl shadow-xs">
                        {top2.avatar}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-400 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                        2
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-emerald-950 truncate max-w-full">
                      {top2.name}
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-bold mb-1">
                      Lớp {cleanClassName(top2.className)}
                    </span>
                    <div className="w-full bg-white/90 rounded-xl p-1.5 border border-slate-200 flex items-center justify-center gap-2 shadow-2xs">
                      <div className="flex items-center gap-0.5 text-slate-800 font-black text-xs">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>{top2.ecoPoints} EP</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-emerald-900 font-bold text-[11px]">
                        <span>{top2.trees}</span>
                        <span>🌲</span>
                      </div>
                    </div>
                  </div>
                ) : <div className="flex-1" />}

                {/* Rank 1 (Gold - Center) */}
                {top1 && (top1.ecoPoints > 0 || top1.trees > 0) ? (
                  <div className="flex-1 flex flex-col items-center max-w-[190px] text-center -mt-2">
                    <div className="relative mb-1.5 animate-bounce-subtle">
                      <Crown className="w-6 h-6 text-amber-500 fill-amber-400 absolute -top-3.5 left-1/2 -translate-x-1/2 drop-shadow-sm" />
                      <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-2xl sm:text-3xl shadow-sm ring-4 ring-amber-300/40">
                        {top1.avatar}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-emerald-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                        1
                      </span>
                    </div>
                    <h4 className="font-black text-sm sm:text-base text-emerald-950 truncate max-w-full font-display">
                      {top1.name}
                    </h4>
                    <span className="text-[11px] text-amber-800 font-black mb-1">
                      Lớp {cleanClassName(top1.className)}
                    </span>
                    <div className="w-full bg-amber-50/90 rounded-xl p-1.5 border border-amber-300 flex items-center justify-center gap-2 shadow-2xs">
                      <div className="flex items-center gap-0.5 text-amber-950 font-black text-xs">
                        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span>{top1.ecoPoints} EP</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-emerald-950 font-black text-xs">
                        <span>{top1.trees}</span>
                        <span>🌲</span>
                      </div>
                    </div>
                  </div>
                ) : <div className="flex-1" />}

                {/* Rank 3 (Bronze) */}
                {top3 && (top3.ecoPoints > 0 || top3.trees > 0) ? (
                  <div className="flex-1 flex flex-col items-center max-w-[170px] text-center">
                    <div className="relative mb-1.5">
                      <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-amber-50 border-2 border-amber-600/50 flex items-center justify-center text-xl sm:text-2xl shadow-xs">
                        {top3.avatar}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                        3
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-emerald-950 truncate max-w-full">
                      {top3.name}
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-bold mb-1">
                      Lớp {cleanClassName(top3.className)}
                    </span>
                    <div className="w-full bg-white/90 rounded-xl p-1.5 border border-amber-200 flex items-center justify-center gap-2 shadow-2xs">
                      <div className="flex items-center gap-0.5 text-amber-950 font-black text-xs">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>{top3.ecoPoints} EP</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-emerald-900 font-bold text-[11px]">
                        <span>{top3.trees}</span>
                        <span>🌲</span>
                      </div>
                    </div>
                  </div>
                ) : <div className="flex-1" />}
              </div>
            )}
          </div>

          {/* Full Leaderboard Table - Ẩn hoàn toàn khi chưa có dữ liệu học sinh */}
          {students.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm overflow-hidden mt-1">
              <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-emerald-50/90 border-b border-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <Medal className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <span className="font-black text-xs sm:text-sm text-emerald-950 truncate leading-snug">
                    {isGuest ? 'Bảng thành tích phiên trải nghiệm' : `Bảng xếp hạng đầy đủ (${students.length} học sinh)`}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 shrink-0 bg-white/90 px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                  Thời gian: {timeRange === 'week' ? 'Tuần này' : 'Tháng này'}
                </span>
              </div>

              <div className="divide-y divide-emerald-100">
              {students.map((st) => {
                const hasPoints = st.ecoPoints > 0 || st.trees > 0;
                const isTop1 = hasPoints && st.rank === 1;
                const isTop2 = hasPoints && st.rank === 2;
                const isTop3 = hasPoints && st.rank === 3;
                const isMe = !isGuest && isStudentUser && Boolean(currentStudentName) && st.name.trim().toLowerCase() === currentStudentName.trim().toLowerCase();

                return (
                  <div
                    key={st.id}
                    className={`px-3 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 transition-colors ${
                      isMe 
                        ? 'bg-emerald-100/70 font-bold' 
                        : isTop1 
                        ? 'bg-amber-50/40' 
                        : 'hover:bg-emerald-50/40'
                    }`}
                  >
                    {/* Left: Rank, Avatar, Name & clean subtitle */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank badge */}
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                        isTop1 
                          ? 'bg-amber-400 text-emerald-950' 
                          : isTop2 
                          ? 'bg-slate-300 text-slate-900' 
                          : isTop3 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {st.rank}
                      </span>

                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-base shadow-2xs shrink-0">
                        {st.avatar}
                      </div>

                      {/* Name & Subtitle - Căn chỉnh chuẩn, không đè chữ, không nhãn thừa */}
                      <div className="flex flex-col min-w-0 justify-center">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs sm:text-sm text-emerald-950 truncate">
                            {st.name}
                          </span>
                          {!isGuest && isMe && (
                            <span className="text-[9px] bg-emerald-800 text-white font-black px-1.5 py-0.5 rounded-sm shrink-0">
                              Tôi
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] sm:text-xs text-emerald-700 font-semibold truncate mt-0.5">
                          {isGuest ? 'Khách trải nghiệm' : `Lớp ${cleanClassName(st.className)}`}
                        </span>
                      </div>
                    </div>

                    {/* Right: Score Metrics with generous spacing */}
                    <div className="flex items-center gap-4 sm:gap-7 md:gap-9 shrink-0 text-right">
                      {st.score > 0 && (
                        <div className="flex flex-col items-end min-w-[50px] sm:min-w-[58px]">
                          <span className="text-xs sm:text-sm font-black text-emerald-950 tabular-nums">
                            {st.score}%
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold whitespace-nowrap">
                            Điểm nói
                          </span>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center min-w-[44px] sm:min-w-[52px]">
                        <span className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-0.5 tabular-nums">
                          <span>{st.trees}</span>
                          <span className="text-sm">🌲</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold whitespace-nowrap">
                          Cây
                        </span>
                      </div>

                      <div className="flex flex-col items-end min-w-[56px] sm:min-w-[65px]">
                        <span className="text-xs sm:text-sm font-black text-amber-700 flex items-center gap-0.5 tabular-nums">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>{st.ecoPoints}</span>
                        </span>
                        <span className="text-[10px] text-amber-800 font-black uppercase tracking-wider whitespace-nowrap">
                          EP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Mỗi 30 Eco Points (EP) sẽ giúp bạn trồng thêm 1 cây xanh cho lớp và trường học!</span>
          </div>

          {isTeacher && (
            <button
              onClick={handleExport}
              className="sm:hidden flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
