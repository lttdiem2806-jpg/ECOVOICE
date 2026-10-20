import React, { useState, useEffect } from 'react';
import { Trophy, Award, Zap, Sprout, ChevronRight, Sparkles, Crown, Filter } from 'lucide-react';
import { 
  getHonorBoardStudents, 
  HonorStudent, 
  getAvailableClassesForHonor, 
  AvailableHonorClass 
} from '../services/honorBoardService';
import { STUDENTS_EVENT, CLASSES_EVENT } from '../services/teacherContentService';
import { isGuestUser } from '../services/studentActivityService';

interface HonorBoardWidgetProps {
  currentStudentName: string;
  currentStudentClass: string;
  selectedGrade: string;
  currentEP: number;
  currentTrees: number;
  onOpenFullBoard: () => void;
  playSoundEffect?: (name: 'chime' | 'success' | 'click' | 'celebrate' | 'fail') => void;
  userRole?: 'student' | 'teacher' | 'guest';
  isGuestMode?: boolean;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

export const HonorBoardWidget: React.FC<HonorBoardWidgetProps> = ({
  currentStudentName,
  currentStudentClass,
  selectedGrade,
  currentEP,
  currentTrees,
  onOpenFullBoard,
  playSoundEffect,
  userRole = 'student',
  isGuestMode = false,
  isLoggedIn = false,
  onOpenLoginModal
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [classesList, setClassesList] = useState<AvailableHonorClass[]>(() => getAvailableClassesForHonor());

  // Determine if this is strictly a logged-in student account (not Teacher/Admin, not Guest mode, and user is logged in)
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
  const studentClassClean = (currentStudentClass || '').replace(/^Lớp\s+/i, '').trim();

  // For Student accounts: strictly locked to their own class. For Teacher/Guest/Logged-out: flexible dropdown
  const [scope, setScope] = useState<string>(() => {
    if (isStudentUser) {
      return studentClassClean;
    }
    if (isLoggedIn && currentStudentClass && currentStudentClass !== 'Trải nghiệm (Demo / Guest)') {
      return currentStudentClass.replace(/^Lớp\s+/i, '').trim() || 'all';
    }
    return 'all';
  });

  const effectiveScope = isStudentUser ? studentClassClean : scope;
  const [students, setStudents] = useState<HonorStudent[]>([]);

  // Sync classes list with teacher dashboard
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
    const fetchTopStudents = () => {
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
      // STRICT REQUIREMENT: Chỉ lấy học sinh có điểm tích lũy EP > 0. Tuyệt đối KHÔNG hiển thị học sinh có 0 EP (như Bảo Duy)
      setStudents(list.filter(s => (s.ecoPoints ?? 0) > 0));
    };

    fetchTopStudents();

    window.addEventListener(STUDENTS_EVENT, fetchTopStudents);
    window.addEventListener(CLASSES_EVENT, fetchTopStudents);
    window.addEventListener('storage', fetchTopStudents);
    return () => {
      window.removeEventListener(STUDENTS_EVENT, fetchTopStudents);
      window.removeEventListener(CLASSES_EVENT, fetchTopStudents);
      window.removeEventListener('storage', fetchTopStudents);
    };
  }, [timeRange, effectiveScope, currentStudentName, currentStudentClass, selectedGrade, currentEP, currentTrees, isLoggedIn, isStudentUser]);

  // Strictly only show students with ecoPoints > 0
  const top3 = students.filter(s => (s.ecoPoints ?? 0) > 0).slice(0, 3);
  const myRankInfo = Boolean(isLoggedIn && isStudentUser && currentStudentName && currentEP > 0)
    ? students.find(s => s.name.trim().toLowerCase() === currentStudentName.trim().toLowerCase())
    : undefined;

  return (
    <div className="bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-sm border-[2.5px] border-[#86c898] shrink-0 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 flex items-center justify-center shadow-xs shrink-0">
            <Trophy className="w-4 h-4 fill-emerald-950" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-extrabold text-emerald-950 text-xs sm:text-sm font-display truncate">
                Honor Board
              </h3>
              <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
            </div>
            <p className="text-[9px] sm:text-[10px] text-emerald-800 font-medium leading-none truncate">
              {isGuest ? 'Bảng Vinh Danh · Guest Mode' : (isStudentUser ? `Top 3 • Lớp ${studentClassClean}` : 'Bảng Vinh Danh Top 3')}
            </p>
          </div>
        </div>

        {/* Time Range Toggle */}
        <div className="flex items-center bg-white/80 p-0.5 rounded-lg border border-emerald-300 shrink-0 text-[9px] font-black">
          <button
            onClick={() => {
              if (playSoundEffect) playSoundEffect('click');
              setTimeRange('week');
            }}
            className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
              timeRange === 'week'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-emerald-900 hover:text-emerald-950'
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => {
              if (playSoundEffect) playSoundEffect('click');
              setTimeRange('month');
            }}
            className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
              timeRange === 'month'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-emerald-900 hover:text-emerald-950'
            }`}
          >
            Tháng
          </button>
        </div>
      </div>

      {/* Scope Selector: Student is strictly locked to their class; Teacher/Admin have full flexible dropdown; Guest displays clean layout */}
      {isGuest ? null : isStudentUser ? (
        <div className="flex items-center justify-between bg-[#e4f5ea] px-2.5 py-1 rounded-xl border border-emerald-200 text-[10px] font-bold">
          <span className="text-emerald-950 font-black flex items-center gap-1 shrink-0 text-[10px]">
            <span>🏫</span>
            <span>Bảng vinh danh:</span>
          </span>
          <span className="bg-emerald-700 text-white font-black px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 shadow-2xs">
            <span>Lớp {studentClassClean}</span>
            <span className="text-[9px]">🔒</span>
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 bg-[#e4f5ea] px-2 py-1 rounded-xl border border-emerald-200 text-[10px] font-bold">
          <span className="text-emerald-950 font-black flex items-center gap-1 shrink-0 text-[10px]">
            <Filter className="w-2.5 h-2.5 text-emerald-700" />
            <span>Lọc:</span>
          </span>
          <select
            value={scope}
            onChange={(e) => {
              if (playSoundEffect) playSoundEffect('click');
              setScope(e.target.value);
            }}
            className="flex-1 bg-white text-emerald-950 font-bold text-[10px] py-0.5 px-1.5 rounded-lg border border-emerald-300 outline-none cursor-pointer truncate shadow-2xs"
          >
            <option value="all">Toàn trường</option>
            {classesList.map(c => (
              <option key={c.id} value={c.name}>{c.displayName}</option>
            ))}
          </select>
        </div>
      )}

      {/* 
        REQUIREMENT:
        1. Ẩn thẻ cá nhân khi chưa đăng nhập và ở chế độ Khách.
        2. Ẩn thẻ cá nhân đối với Giáo viên/Admin.
        3. Chỉ hiển thị cho Học sinh có điểm EP > 0.
      */}
      {isGuest ? null : !isLoggedIn ? (
        <button
          onClick={() => {
            if (playSoundEffect) playSoundEffect('click');
            if (onOpenLoginModal) onOpenLoginModal();
          }}
          className="w-full bg-gradient-to-r from-amber-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 text-emerald-950 rounded-xl px-2.5 py-1.5 shadow-2xs flex items-center justify-between text-[10px] border border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-4 h-4 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 text-[10px] shadow-2xs">
              🔑
            </span>
            <span className="font-bold text-emerald-900 group-hover:text-emerald-950 truncate">
              Đăng nhập để xem thứ hạng của bạn!
            </span>
          </div>
          <span className="text-[9px] font-extrabold text-emerald-700 bg-white/90 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0 shadow-2xs">
            Đăng nhập
          </span>
        </button>
      ) : isStudentUser && ((myRankInfo?.ecoPoints ?? 0) > 0 || currentEP > 0) ? (
        /* Thanh trạng thái cá nhân: CHỈ hiển thị cho Học sinh có điểm EP > 0 - Thống nhất dữ liệu */
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-xl px-2.5 py-1.5 shadow-2xs flex items-center justify-between text-[10px] border border-emerald-600/50">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-4 h-4 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 text-[9px] font-black shadow-2xs">
              {myRankInfo && myRankInfo.ecoPoints > 0 ? `#${myRankInfo.rank}` : '🌱'}
            </span>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-extrabold text-amber-200 truncate">{myRankInfo?.name || currentStudentName || 'Bạn'}</span>
              <span className="text-[9px] text-emerald-200 font-medium truncate">
                {myRankInfo && myRankInfo.ecoPoints > 0 ? `Hạng #${myRankInfo.rank} • Lớp ${studentClassClean}` : `Lớp ${studentClassClean}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-black tabular-nums">
            <div className="flex items-center gap-0.5 text-amber-300">
              <Zap className="w-3 h-3 fill-amber-300" />
              <span>{myRankInfo ? myRankInfo.ecoPoints : (currentEP || 100)} EP</span>
            </div>
            <div className="flex items-center gap-0.5 text-emerald-100">
              <span>{myRankInfo ? myRankInfo.trees : Math.floor((currentEP || 100) / 30)}</span>
              <span>🌲</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Top 3 List / Guest Mode Ranking Display */}
      <div className="flex flex-col gap-1.5 mt-0.5">
        {isGuest ? (
          currentEP > 0 ? (
            <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border bg-gradient-to-r from-amber-50 to-amber-100/90 border-amber-300 shadow-2xs ring-2 ring-emerald-500/40">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-2xs shrink-0 bg-amber-500">
                    1
                  </span>
                  <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-400 absolute -top-1.5 -right-1" />
                </div>
                <div className="w-6 h-6 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  🌟
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-xs font-black text-emerald-950 truncate">
                    Guest Mode
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold truncate mt-0.5">
                    Khách trải nghiệm
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 tabular-nums">
                <div className="flex items-center gap-0.5 text-emerald-800 font-bold text-[10px]">
                  <span>{currentTrees}</span>
                  <span className="text-[10px]">🌲</span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-700 font-black text-xs">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                  <span>{currentEP} EP</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 sm:p-3 bg-emerald-50/90 rounded-xl border border-emerald-200/90 text-center text-[10px] sm:text-[11px] text-emerald-900 leading-relaxed shadow-2xs">
              <span className="font-bold">🌟 Chế độ Khách (Guest Mode):</span> Dữ liệu điểm số và cây xanh được ghi nhận trực tiếp theo phiên làm việc độc lập này.
            </div>
          )
        ) : top3.length === 0 ? (
          <div className="text-center py-2.5 px-2 bg-emerald-50/70 rounded-xl border border-dashed border-emerald-300 flex flex-col items-center justify-center gap-1">
            <span className="text-sm">🌱</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-black text-emerald-950 font-display leading-tight">
                No Ranking Data Yet
              </span>
              <span className="text-[9px] italic font-medium text-emerald-800 leading-tight">
                Chưa có học sinh nào đạt điểm tích lũy
              </span>
            </div>
            <div className="text-[9px] text-emerald-700 leading-tight mt-0.5">
              {!isLoggedIn ? (
                <>
                  <span className="block font-semibold">Log in to view rankings!</span>
                  <span className="italic">Đăng nhập để xem thứ hạng của bạn!</span>
                </>
              ) : isTeacher ? (
                <>
                  <span className="block font-semibold">Updates as students practice</span>
                  <span className="italic">Cập nhật khi học sinh tích lũy điểm</span>
                </>
              ) : (
                <>
                  <span className="block font-semibold">Practice speaking to earn EP!</span>
                  <span className="italic">Luyện phát âm để tích lũy EP & trồng cây!</span>
                </>
              )}
            </div>
          </div>
        ) : (
          top3.map((student) => {
            const isRank1 = student.rank === 1;
            const isRank2 = student.rank === 2;
            const isRank3 = student.rank === 3;
            const isMe = !isGuest && isLoggedIn && isStudentUser && Boolean(currentStudentName) && student.name.trim().toLowerCase() === currentStudentName.trim().toLowerCase();

            return (
              <div
                key={student.id}
                className={`flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-xl border transition-all ${
                  isRank1
                    ? 'bg-gradient-to-r from-amber-50 to-amber-100/90 border-amber-300 shadow-2xs'
                    : isRank2
                    ? 'bg-gradient-to-r from-slate-50 to-slate-100/90 border-slate-300'
                    : 'bg-gradient-to-r from-orange-50/80 to-amber-50/60 border-orange-200'
                } ${isMe ? 'ring-2 ring-emerald-500' : ''}`}
              >
                {/* Rank & Avatar & Name */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="relative shrink-0">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-2xs shrink-0"
                      style={{
                        backgroundColor: isRank1 ? '#d97706' : isRank2 ? '#64748b' : isRank3 ? '#b45309' : '#94a3b8'
                      }}
                    >
                      {student.rank}
                    </span>
                    {isRank1 && (
                      <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-400 absolute -top-1.5 -right-1" />
                    )}
                  </div>

                  <div className="w-6 h-6 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {student.avatar}
                  </div>

                  <div className="flex flex-col min-w-0 leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-black text-emerald-950 truncate max-w-[85px] sm:max-w-[95px]">
                        {student.name}
                      </span>
                      {isMe && (
                        <span className="text-[8px] bg-emerald-700 text-white font-black px-1 rounded-sm shrink-0">
                          Bé
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-emerald-800 font-semibold truncate">
                      Lớp {student.className ? student.className.replace(/^Lớp\s+/i, '').replace(/^\$/, '').trim() : ''}
                    </span>
                  </div>
                </div>

                {/* Points & Trees */}
                <div className="flex flex-col items-end leading-none shrink-0">
                  <div className="flex items-center gap-0.5 text-amber-700 font-black text-[11px] tabular-nums">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>{student.ecoPoints}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-emerald-800 font-bold text-[9px] tabular-nums mt-0.5">
                    <span>{student.trees}</span>
                    <span className="text-[10px]">🌲</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Button to view full Honor Board Modal */}
      <button
        onClick={() => {
          if (playSoundEffect) playSoundEffect('click');
          onOpenFullBoard();
        }}
        className="w-full mt-0.5 py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-black text-[10px] sm:text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all"
      >
        <span>Xem toàn bộ Bảng Vàng</span>
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};
