import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Calendar, 
  Sparkles, 
  Play, 
  Gamepad2, 
  Mic, 
  CheckCircle2, 
  Clock, 
  Flame,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { 
  TeacherAssignment, 
  getTeacherAssignments, 
  ASSIGNMENTS_EVENT, 
  getAssignmentDisplayInfo,
  isAssignmentForStudent,
  TeacherClass,
  getTeacherClasses,
  GUEST_DEMO_ASSIGNMENTS,
  getGuestCompletedAssignmentIds
} from '../services/teacherContentService';

interface StudentAssignmentsViewProps {
  selectedGrade: string;
  studentClass?: string;
  isGuestMode?: boolean;
  userRole?: 'student' | 'teacher' | 'guest';
  availableClasses?: TeacherClass[];
  onSelectClass?: (className: string) => void;
  onStartGame: (gameId: string, gameName: string, asg: TeacherAssignment) => void;
  onStartSpeaking: (type: 'vocab' | 'sentence', unitKey?: string, asg?: TeacherAssignment) => void;
  playSoundEffect: (name: 'chime' | 'success' | 'click' | 'celebrate' | 'fail') => void;
  onBackToLessons?: () => void;
}

export const StudentAssignmentsView: React.FC<StudentAssignmentsViewProps> = ({
  selectedGrade,
  studentClass = '3A1',
  isGuestMode = false,
  userRole = 'student',
  availableClasses,
  onSelectClass,
  onStartGame,
  onStartSpeaking,
  playSoundEffect,
  onBackToLessons
}) => {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>(() => getTeacherAssignments());
  const [filterType, setFilterType] = useState<'all' | 'games' | 'speaking'>('all');
  const [completedDemoIds, setCompletedDemoIds] = useState<string[]>(() => getGuestCompletedAssignmentIds());

  useEffect(() => {
    const handleUpdate = () => {
      setAssignments(getTeacherAssignments());
      if (isGuestMode) {
        setCompletedDemoIds(getGuestCompletedAssignmentIds());
      }
    };
    window.addEventListener(ASSIGNMENTS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(ASSIGNMENTS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [isGuestMode]);

  const studentClassClean = (studentClass || '3A1').replace(/^Lớp\s+/i, '').trim();
  const effectiveGrade = studentClassClean.charAt(0) || selectedGrade || '3';

  // REQUIREMENT 1 & 2: Permanent Mock Data cho Guest Mode
  // - Khi ở Guest Mode: luôn nạp sẵn danh sách gồm 3 nhiệm vụ mẫu cố định (Unit 9 Colours Vocab, Sentences, Grow a Tree Game)
  // - Tuyệt đối không để màn hình rơi vào trạng thái trống rỗng
  // - Dù khách/giám khảo đã hoàn thành xong, danh sách bài tập mẫu này vẫn tiếp tục hiển thị cố định (không bị xóa)
  // - Cho phép bấm làm lại (Do again / Practice again) thoải mái
  const baseAssignments = isGuestMode
    ? GUEST_DEMO_ASSIGNMENTS
    : assignments.filter(asg => isAssignmentForStudent(asg, studentClassClean, effectiveGrade));

  const gamesCount = baseAssignments.filter(a => getAssignmentDisplayInfo(a).isGame).length;
  const speakingCount = baseAssignments.length - gamesCount;

  const filteredAssignments = baseAssignments
    .filter(asg => {
      const info = getAssignmentDisplayInfo(asg);
      if (filterType === 'games') {
        return info.isGame;
      }
      if (filterType === 'speaking') {
        return !info.isGame;
      }
      return true;
    })
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. HERO BANNER */}
      <div className="w-full bg-gradient-to-r from-[#d8f5e3] via-[#bbf2d0] to-[#a3eec0] rounded-3xl p-4 sm:p-6 border-[2.5px] border-[#86c898] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-md border-2 border-emerald-400 flex items-center justify-center text-3xl sm:text-4xl shrink-0 animate-soft-float">
            {isGuestMode ? '⚡' : '📋'}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              {userRole === 'teacher' ? (
                <div className="flex items-center gap-1.5 bg-white/95 px-3 py-1 rounded-full border-2 border-emerald-500 shadow-2xs">
                  <span className="text-[11px] font-black text-emerald-950 flex items-center gap-1">
                    <span>🏫</span>
                    <span>Đang xem:</span>
                  </span>
                  <select
                    value={studentClassClean}
                    onChange={(e) => {
                      if (playSoundEffect) playSoundEffect('click');
                      onSelectClass?.(e.target.value);
                    }}
                    className="bg-emerald-100/90 text-emerald-950 font-black text-xs py-0.5 px-2 rounded-lg border border-emerald-300 outline-none cursor-pointer hover:bg-emerald-200 transition-colors"
                  >
                    {(availableClasses && availableClasses.length > 0 ? availableClasses : getTeacherClasses()).map(cls => (
                      <option key={cls.id} value={cls.name}>
                        Lớp {cls.name.replace(/^Lớp\s+/i, '')} ({cls.grade ? `Khối ${cls.grade}` : `Khối ${cls.name.charAt(0)}`})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-2xs ${
                  isGuestMode 
                    ? 'bg-amber-500 text-emerald-950' 
                    : 'bg-emerald-700 text-white'
                }`}>
                  {isGuestMode ? '⚡ GUEST MODE - KHÁCH TRẢI NGHIỆM' : `KHỐI ${effectiveGrade} • LỚP ${studentClassClean}`}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-800 text-white shadow-2xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {baseAssignments.length} {userRole === 'teacher' ? `bài tập Lớp ${studentClassClean}` : isGuestMode ? 'nhiệm vụ mẫu có sẵn' : 'nhiệm vụ được giao'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-display mt-1">
              {userRole === 'teacher' 
                ? `Danh sách bài tập Lớp ${studentClassClean}` 
                : isGuestMode 
                ? 'Nhiệm vụ mẫu trải nghiệm (Demo Task)' 
                : 'Bài tập & Thử thách cô giáo giao'}
            </h2>
            {userRole !== 'teacher' && (
              <p className="text-xs sm:text-sm text-emerald-800 font-medium">
                {isGuestMode 
                  ? 'Danh sách bài tập mẫu giúp Khách trải nghiệm nhanh tương tác luyện nói AI và 7 trò chơi Eco Games (dữ liệu được cách ly an toàn).'
                  : 'Hoàn thành các bài luyện nói và trò chơi Eco Games để nhận thêm nhiều Eco Points và vun trồng cây xanh nhé!'}
              </p>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs p-1.5 rounded-2xl border border-emerald-300 z-10 shrink-0 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => {
              playSoundEffect('click');
              setFilterType('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            Tất cả ({baseAssignments.length})
          </button>
          <button
            onClick={() => {
              playSoundEffect('click');
              setFilterType('games');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'games'
                ? 'bg-amber-500 text-emerald-950 shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            {isGuestMode ? `Trò chơi Demo (${gamesCount})` : `Trò chơi Eco (${gamesCount})`}
          </button>
          <button
            onClick={() => {
              playSoundEffect('click');
              setFilterType('speaking');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'speaking'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            {isGuestMode ? `Luyện nói Demo (${speakingCount})` : `Luyện nói (${speakingCount})`}
          </button>
        </div>

        {/* Decorative corner icon */}
        <span className="absolute -right-3 -bottom-5 text-8xl opacity-15 select-none pointer-events-none">
          🌟
        </span>
      </div>

      {/* 2. ASSIGNMENTS GRID */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white/80 rounded-3xl p-8 border-2 border-[#86c898] text-center flex flex-col items-center justify-center gap-3 shadow-sm my-4">
          <span className="text-5xl">{userRole === 'teacher' ? '📋' : isGuestMode ? '⚡' : '🎉'}</span>
          <div className="flex flex-col gap-1 max-w-lg">
            <h3 className="text-lg sm:text-xl font-black text-emerald-950 font-display">
              {userRole === 'teacher'
                ? `No Assignments for Class ${studentClassClean}`
                : isGuestMode
                ? 'Nhiệm vụ mẫu trải nghiệm (Demo Tasks)'
                : 'All Caught Up! No Pending Assignments'}
            </h3>
            <p className="text-xs sm:text-sm italic font-medium text-emerald-800">
              {userRole === 'teacher'
                ? `Lớp ${studentClassClean} hiện chưa có bài tập nào được giao.`
                : isGuestMode
                ? 'Khám phá các nhiệm vụ mẫu bên dưới để trải nghiệm luyện phát âm AI và trò chơi Eco Games!'
                : 'Tuyệt vời! Hiện không có bài tập nào còn tồn đọng!'}
            </p>
          </div>
          {isGuestMode ? (
            <button
              onClick={() => {
                playSoundEffect('click');
                setFilterType('all');
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center leading-tight active:scale-95"
            >
              <span className="text-xs font-black">Xem tất cả bài tập mẫu</span>
              <span className="text-[10px] italic font-medium text-emerald-100">Hiển thị đầy đủ nhiệm vụ Demo</span>
            </button>
          ) : (
            <>
              {userRole !== 'teacher' && (
                <div className="text-xs text-emerald-700 max-w-md leading-relaxed">
                  <span className="block font-semibold">Keep practicing speaking topics or play 7 Eco Games to grow more trees!</span>
                  <span className="italic text-[11px]">Bé hãy tiếp tục luyện phát âm các chủ đề yêu thích hoặc khám phá 7 trò chơi Eco Games để trồng thêm nhiều cây xanh nhé!</span>
                </div>
              )}
              {onBackToLessons && (
                <button
                  onClick={onBackToLessons}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer transition-all shadow-sm flex flex-col items-center justify-center leading-tight active:scale-95"
                >
                  <span className="text-xs font-black">Back to Lessons</span>
                  <span className="text-[10px] italic font-medium text-emerald-100">Quay lại luyện nói bài học</span>
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((asg) => {
            const info = getAssignmentDisplayInfo(asg);
            const isCompletedByGuest = isGuestMode && completedDemoIds.includes(asg.id);
            return (
              <div
                key={asg.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#86c898] hover:border-emerald-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3.5 group relative"
              >
                {/* Header row: Badge + Reward */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border shadow-2xs ${info.badgeColorClass}`}>
                      {info.badge}
                    </span>
                    {isGuestMode && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border shadow-2xs flex items-center gap-1 ${
                        isCompletedByGuest
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-200 text-amber-950 border-amber-300'
                      }`}>
                        {isCompletedByGuest ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Đã hoàn thành</span>
                          </>
                        ) : (
                          <span>⚡ Demo</span>
                        )}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-gray-500">
                      {isGuestMode ? 'Mẫu trải nghiệm' : `Khối ${asg.grade} • ${asg.targetClass}`}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs shrink-0 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-600" />
                    +{asg.rewardEP} EP
                  </span>
                </div>

                {/* Title & Unit */}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-emerald-950 leading-snug group-hover:text-emerald-700 transition-colors">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      {asg.unitName}
                    </span>
                    {asg.lessonName && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {asg.lessonName}
                      </span>
                    )}
                  </p>
                </div>

                {/* EXACT GAME NAME DISPLAY (If Eco Game) */}
                {info.isGame && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 flex items-center gap-3 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-amber-300 flex items-center justify-center text-2xl shrink-0">
                      {info.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                        🎮 Trò chơi Eco Games:
                      </span>
                      <span className="text-xs sm:text-sm font-black text-emerald-950 truncate font-display">
                        {info.gameName || asg.gameName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Due Date & Submission info */}
                <div className="bg-[#f0faf4] px-3 py-2 rounded-xl border border-emerald-200 flex items-center justify-between text-xs font-semibold text-emerald-900">
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-800">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Hạn nộp: <strong className="text-emerald-950">{asg.dueDate}</strong>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    Đang mở
                  </span>
                </div>

                {/* ACTION BUTTON: VÀO CHƠI NGAY (Cho Game) hoặc VÀO LUYỆN NGAY */}
                <div className="pt-2 border-t border-emerald-100">
                  {info.isGame ? (
                    <button
                      onClick={() => {
                        playSoundEffect('celebrate');
                        onStartGame(info.gameId || 'grow-tree', info.gameName || asg.gameName || 'Trò chơi xanh', asg);
                      }}
                      className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 hover:from-emerald-700 hover:to-green-600 active:scale-98 text-white font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer tracking-wide"
                    >
                      <Play className="w-4 h-4 fill-white text-white shrink-0" />
                      <div className="flex flex-col items-center leading-tight">
                        <span className="font-black text-xs sm:text-sm">
                          {isCompletedByGuest ? 'Play Again' : 'Play Now'}
                        </span>
                        <span className="text-[10px] italic font-medium text-emerald-100">
                          {isCompletedByGuest ? 'Chơi lại' : 'Chơi ngay'}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playSoundEffect('click');
                        onStartSpeaking(asg.type === 'sentence' ? 'sentence' : 'vocab', asg.unitKey, asg);
                      }}
                      className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-[#206740] to-[#2b8855] hover:from-[#1b5736] hover:to-[#227045] active:scale-98 text-white font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <Mic className="w-4 h-4 shrink-0" />
                      <div className="flex flex-col items-center leading-tight">
                        <span className="font-black text-xs sm:text-sm">
                          {isCompletedByGuest ? 'Practice Again' : 'Practice Now'}
                        </span>
                        <span className="text-[10px] italic font-medium text-emerald-100">
                          {isCompletedByGuest ? 'Luyện lại' : (info.actionText || 'Vào luyện ngay')}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
