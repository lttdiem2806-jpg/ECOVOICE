import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Search, 
  Sparkles, 
  Mic, 
  MessageSquare, 
  Gamepad2, 
  ArrowRight, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Layers,
  RotateCcw,
  X
} from 'lucide-react';
import { bookmapDatabase, UnitData } from '../data/bookmapData';
import { isUnitUnlockedForGrade, PERMS_EVENT, getUnitsForGrade } from '../services/teacherContentService';

interface LessonsOverviewViewProps {
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
  studentClass: string;
  userRole: 'student' | 'teacher' | 'guest';
  isGuestMode: boolean;
  onSelectUnit: (unitKey: string, initialTab?: 'vocabulary' | 'sentences') => void;
  onStartGameForUnit: (unitKey: string) => void;
  playSoundEffect: (effect: 'chime' | 'success' | 'click' | 'celebrate' | 'fail') => void;
}

export const LessonsOverviewView: React.FC<LessonsOverviewViewProps> = ({
  selectedGrade,
  onGradeChange,
  studentClass,
  userRole,
  isGuestMode,
  onSelectUnit,
  onStartGameForUnit,
  playSoundEffect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<'all' | 'term1' | 'term2'>('all');
  const [lockedUnitNotice, setLockedUnitNotice] = useState<{ unitName: string; unitNumber: number } | null>(null);
  const [permsVersion, setPermsVersion] = useState(0);

  // Listen to live teacher permission changes and unit unlocking events
  React.useEffect(() => {
    const handlePerms = () => setPermsVersion(v => v + 1);
    window.addEventListener(PERMS_EVENT, handlePerms);
    window.addEventListener('ecovoice_unit_completed', handlePerms);
    window.addEventListener('ecovoice_practiced_words_updated', handlePerms);
    window.addEventListener('ecovoice_practiced_sentences_updated', handlePerms);
    window.addEventListener('ecovoice_custom_units_updated', handlePerms);
    return () => {
      window.removeEventListener(PERMS_EVENT, handlePerms);
      window.removeEventListener('ecovoice_unit_completed', handlePerms);
      window.removeEventListener('ecovoice_practiced_words_updated', handlePerms);
      window.removeEventListener('ecovoice_practiced_sentences_updated', handlePerms);
      window.removeEventListener('ecovoice_custom_units_updated', handlePerms);
    };
  }, []);

  const handleUnitAction = (unit: UnitData, unitNumber: number, isUnlocked: boolean, action: () => void) => {
    if (!isUnlocked) {
      playSoundEffect('fail');
      setLockedUnitNotice({
        unitName: unit.unitName || unit.unitFullName,
        unitNumber
      });
      return;
    }
    action();
  };

  // Detect grade from student's registered class (e.g. 4A3 -> Grade 4)
  const studentRegisteredGrade = useMemo(() => {
    const clean = (studentClass || '').replace(/^Lớp\s+/i, '').trim();
    const match = clean.match(/[3-5]/);
    return match ? match[0] : null;
  }, [studentClass]);

  const unitsList: UnitData[] = useMemo(() => {
    return getUnitsForGrade(selectedGrade);
  }, [selectedGrade, permsVersion]);

  // Total vocabulary and sentence count for this grade
  const totalVocab = useMemo(() => {
    return unitsList.reduce((acc, u) => acc + (u.vocabulary?.length || 0), 0);
  }, [unitsList]);

  const totalSentences = useMemo(() => {
    return unitsList.reduce((acc, u) => acc + (u.sentences?.length || 0), 0);
  }, [unitsList]);

  // Filter units by search query and semester
  const filteredUnits = useMemo(() => {
    return unitsList.filter((u, index) => {
      // Semester filter: Unit 1-10 is Term 1, Unit 11-20 is Term 2
      const unitNum = u.unitNumber || (index + 1);
      if (semesterFilter === 'term1' && unitNum > 10) return false;
      if (semesterFilter === 'term2' && unitNum <= 10) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.unitName?.toLowerCase().includes(q);
      const matchFull = u.unitFullName?.toLowerCase().includes(q);
      const matchTheme = u.theme?.toLowerCase().includes(q);
      const matchNum = `unit ${unitNum}`.includes(q) || `unit ${u.unitNumber}`.includes(q);
      const matchWord = u.vocabulary?.some(v => v.word.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q));
      
      return matchName || matchFull || matchTheme || matchNum || matchWord;
    });
  }, [unitsList, searchQuery, semesterFilter]);

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & GRADE SELECTION BAR */}
      <div className="w-full bg-[#f2faf5]/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-[2.5px] border-[#86c898] shadow-sm flex flex-col gap-3.5">
        
        {/* Row 1: Title and Registered Class Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#0c4326] to-[#15803d] text-white flex items-center justify-center shadow-md shrink-0 border border-emerald-400">
              <BookOpen className="w-6 h-6 text-amber-300" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-display">
                  Grade {selectedGrade} · Units Overview
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs">
                  {unitsList.length} Units / {unitsList.length} Bài học
                </span>
              </div>
              <p className="text-xs sm:text-sm italic font-medium text-emerald-800 mt-0.5">
                (Tổng quan bài học Khối {selectedGrade}) · Tiếng Anh Global Success
              </p>
            </div>
          </div>

          {/* Account Class Indicator - Ẩn hoàn toàn khi ở Chế độ Khách (Guest Mode) để tránh lặp lại thừa thãi */}
          {!(isGuestMode || userRole === 'guest') && (
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white/95 border-2 border-emerald-300 rounded-2xl px-3.5 py-1.5 shadow-2xs">
              <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  {userRole === 'teacher' ? 'MANAGING CLASS / LỚP PHỤ TRÁCH' : 'MY CLASS / LỚP HỌC'}
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-950">
                  {userRole === 'teacher'
                    ? (studentClass && !studentClass.includes('Demo') && !studentClass.includes('Guest')
                        ? (studentClass.startsWith('Lớp') ? studentClass : `Lớp ${studentClass.replace(/^Lớp\s+/i, '').replace(/^\$/, '').trim()}`)
                        : `Lớp ${selectedGrade}A3`)
                    : (studentClass ? (studentClass.startsWith('Lớp') ? studentClass : `Lớp ${studentClass.replace(/^Lớp\s+/i, '').replace(/^\$/, '').trim()}`) : `Khối ${selectedGrade}`)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Grade Switcher Tabs & Quick Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-emerald-200/80">
          
          {/* Role-based Grade Selector / Fixed Student Grade Badge */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col leading-none shrink-0 hidden sm:flex">
              <span className="text-xs font-black text-emerald-950">
                {(userRole === 'teacher' || isGuestMode || userRole === 'guest') ? 'Select Grade / Chọn khối:' : 'Khối lớp của em:'}
              </span>
            </div>
            {(userRole === 'teacher' || isGuestMode || userRole === 'guest') ? (
              // Teacher / Guest Mode: Full interactive switcher for Grade 3, Grade 4, Grade 5
              <div className="flex items-center gap-1.5 p-1 bg-emerald-100/70 rounded-2xl border border-emerald-200">
                {(['3', '4', '5'] as const).map(g => {
                  const isSelected = selectedGrade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        playSoundEffect('click');
                        onGradeChange(g);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#0c4326] to-[#15803d] text-white shadow-xs border border-[#4ade80]'
                          : 'bg-white/80 hover:bg-white text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      <span>Grade {g}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Student Role (e.g. Chí Vỹ): Strictly show ONLY the student's registered grade, hide all other grade buttons!
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-[#0c4326] to-[#15803d] text-white rounded-2xl border border-[#4ade80] shadow-xs">
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span className="font-black text-xs">Grade {selectedGrade} (Lớp {selectedGrade})</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-amber-400 text-emerald-950">
                  {studentClass ? `Lớp ${studentClass.replace(/^Lớp\s+/i, '')}` : 'Lớp em'}
                </span>
              </div>
            )}
          </div>

          {/* Key Grade Statistics Strip */}
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-bold text-emerald-900 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-xl border border-emerald-200 shrink-0 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <div className="flex flex-col leading-tight">
                <span className="font-black text-xs text-emerald-950">{unitsList.length} Units</span>
                <span className="text-[9px] italic font-medium text-emerald-800">{unitsList.length} Bài học</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-xl border border-emerald-200 shrink-0 shadow-2xs">
              <span className="text-xs">🔤</span>
              <div className="flex flex-col leading-tight">
                <span className="font-black text-xs text-emerald-950">{totalVocab} Vocabularies</span>
                <span className="text-[9px] italic font-medium text-emerald-800">{totalVocab} từ vựng</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-xl border border-emerald-200 shrink-0 shadow-2xs">
              <span className="text-xs">💬</span>
              <div className="flex flex-col leading-tight">
                <span className="font-black text-xs text-emerald-950">{totalSentences} Sentences</span>
                <span className="text-[9px] italic font-medium text-emerald-800">{totalSentences} mẫu câu</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-xl border border-emerald-200 shrink-0 shadow-2xs">
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-700" />
              <div className="flex flex-col leading-tight">
                <span className="font-black text-xs text-emerald-950">7 Eco Games</span>
                <span className="text-[9px] italic font-medium text-emerald-800">7 Trò chơi xanh</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="w-full bg-white/85 backdrop-blur-md rounded-2xl p-3 border-2 border-[#86c898] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        
        {/* Semester / Term Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => {
              playSoundEffect('click');
              setSemesterFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap flex flex-col items-center justify-center leading-tight ${
              semesterFilter === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            <span className="font-black text-xs">All 20 Units</span>
            <span className={`text-[10px] italic font-medium ${semesterFilter === 'all' ? 'text-emerald-100' : 'text-emerald-700'}`}>Tất cả 20 Unit</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playSoundEffect('click');
              setSemesterFilter('term1');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap flex flex-col items-center justify-center leading-tight ${
              semesterFilter === 'term1'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            <span className="font-black text-xs">Term 1 / Học kỳ 1</span>
            <span className={`text-[10px] italic font-medium ${semesterFilter === 'term1' ? 'text-emerald-100' : 'text-emerald-700'}`}>(Unit 1 - 10)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playSoundEffect('click');
              setSemesterFilter('term2');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap flex flex-col items-center justify-center leading-tight ${
              semesterFilter === 'term2'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            <span className="font-black text-xs">Term 2 / Học kỳ 2</span>
            <span className={`text-[10px] italic font-medium ${semesterFilter === 'term2' ? 'text-emerald-100' : 'text-emerald-700'}`}>(Unit 11 - 20)</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Unit (e.g. Unit 1, birthday...) / Tìm kiếm Unit..."
            className="w-full pl-9 pr-8 py-2 bg-[#f4fbf6] border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none transition-all placeholder:text-emerald-700/60"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* 3. UNITS GRID CARDS (UNIT 1 -> UNIT 20) */}
      {filteredUnits.length === 0 ? (
        <div className="bg-white/80 rounded-3xl p-8 border-2 border-dashed border-[#86c898] text-center flex flex-col items-center justify-center gap-3 my-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-3xl shadow-xs">
            🔍
          </div>
          <div className="flex flex-col gap-0.5 max-w-md">
            <h3 className="text-base sm:text-lg font-black text-emerald-950 font-display">
              No Units Found
            </h3>
            <p className="text-xs sm:text-sm italic font-medium text-emerald-800">
              Không tìm thấy bài học Unit nào khớp với từ khóa "{searchQuery}"
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSemesterFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>All 20 Units / Xem tất cả 20 Unit</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUnits.map((unit, index) => {
            const unitNumber = unit.unitNumber || (index + 1);
            const isStudent = userRole === 'student';
            const isTeacher = userRole === 'teacher';
            // Guest Mode or Teacher: automatically unlock 100% of units
            const isGuestModeActive = !isStudent && !isTeacher && Boolean(
              isGuestMode || 
              userRole === 'guest' || 
              (typeof window !== 'undefined' && (
                localStorage.getItem('ecovoice_is_guest_mode') === 'true' ||
                (localStorage.getItem('ecovoice_user_name') || '').includes('Guest')
              ))
            );
            // Permission check: Teacher and Guest Mode always unlock 100% of units. Regular students are guarded by teacher permissions.
            const isUnlocked = isTeacher || isGuestModeActive || isUnitUnlockedForGrade(selectedGrade, unit.unitKey);
            const vocabCount = unit.vocabulary?.length || 0;
            const sentenceCount = unit.sentences?.length || 0;
            const lessonsCount = unit.lessons?.length || 2;
            const sampleWords = (unit.vocabulary || []).slice(0, 4);

            return (
              <div
                key={unit.unitKey}
                onClick={() => {
                  if (!isUnlocked) {
                    handleUnitAction(unit, unitNumber, isUnlocked, () => {});
                  } else {
                    playSoundEffect('click');
                    onSelectUnit(unit.unitKey);
                  }
                }}
                className={`rounded-2xl border-2 shadow-sm transition-all duration-200 p-4 flex flex-col justify-between gap-3 group ${
                  isUnlocked
                    ? 'bg-white/95 border-[#86c898] hover:border-[#34a853] hover:shadow-md cursor-pointer'
                    : 'bg-stone-50/95 border-amber-300/80 hover:border-amber-400 cursor-pointer shadow-2xs'
                }`}
              >
                {/* Card Top: Unit Number Badge & Lock Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-xl text-white font-black text-xs flex items-center justify-center shadow-xs ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-[#0c4326] via-[#15803d] to-[#1cb55b]'
                        : 'bg-stone-500'
                    }`}>
                      {unitNumber < 10 ? `0${unitNumber}` : unitNumber}
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      Unit {unitNumber}
                    </span>
                  </div>

                  {/* Lock/Unlock Badge: Soft green for unlocked, amber for locked */}
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-all shadow-2xs ${
                    isUnlocked
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    {isUnlocked ? (
                      <>
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        <span>Ready / Sẵn sàng</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>Locked / Tạm khóa</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Middle: Unit Title & Theme */}
                <div className="flex flex-col gap-1 min-h-[58px]">
                  <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 group-hover:text-emerald-800 transition-colors line-clamp-1 font-display">
                    {unit.unitName || unit.unitFullName}
                  </h3>
                  <p className="text-[11px] text-emerald-700/90 font-medium line-clamp-1">
                    {unit.theme ? `Theme: ${unit.theme}` : `Khối ${selectedGrade} · Tiếng Anh Global Success`}
                  </p>
                </div>

                {/* Card Stats: Vocabulary, Sentences, Lessons */}
                <div className="grid grid-cols-2 gap-1.5 py-1.5 px-2 bg-[#f4fbf6] rounded-xl border border-emerald-100 text-xs font-bold text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🔤</span>
                    <span className="text-[11px] font-bold">{vocabCount} Vocab / từ vựng</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">💬</span>
                    <span className="text-[11px] font-bold">{sentenceCount} Sentences / câu</span>
                  </div>
                </div>

                {/* Sample Vocabulary Chips */}
                {sampleWords.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap overflow-hidden h-[26px]">
                    {sampleWords.map((v, i) => (
                      <span
                        key={v.id || i}
                        className="text-[10px] bg-white border border-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-md font-semibold truncate max-w-[85px]"
                        title={`${v.word}: ${v.meaning}`}
                      >
                        {v.icon ? `${v.icon} ` : ''}{v.word}
                      </span>
                    ))}
                    {vocabCount > 4 && (
                      <span className="text-[10px] text-emerald-700 font-bold">
                        +{vocabCount - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-emerald-100">
                  {/* Primary Start Lesson Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnitAction(unit, unitNumber, isUnlocked, () => {
                        playSoundEffect('click');
                        onSelectUnit(unit.unitKey);
                      });
                    }}
                    className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] active:scale-95 text-white'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 active:scale-95'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <Mic className="w-3.5 h-3.5 text-white" />
                        <span>Start Unit / Vào học ngay</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto text-emerald-200" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Start Unit / Vào học ngay</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto text-amber-700 opacity-60" />
                      </>
                    )}
                  </button>

                  {/* Secondary Quick Access: Vocab / Sentences / Eco Games */}
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnitAction(unit, unitNumber, isUnlocked, () => {
                          playSoundEffect('click');
                          onSelectUnit(unit.unitKey, 'vocabulary');
                        });
                      }}
                      className={`py-1 px-1 rounded-lg border text-[10px] font-bold text-center cursor-pointer transition-colors ${
                        isUnlocked
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                          : 'bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-950 border-stone-200'
                      }`}
                      title={isUnlocked ? "Luyện từ vựng / Practice Vocabulary" : "Bài học đang tạm khóa"}
                    >
                      Vocab / Từ vựng
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnitAction(unit, unitNumber, isUnlocked, () => {
                          playSoundEffect('click');
                          onSelectUnit(unit.unitKey, 'sentences');
                        });
                      }}
                      className={`py-1 px-1 rounded-lg border text-[10px] font-bold text-center cursor-pointer transition-colors ${
                        isUnlocked
                          ? 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-200'
                          : 'bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-950 border-stone-200'
                      }`}
                      title={isUnlocked ? "Luyện mẫu câu / Practice Sentences" : "Bài học đang tạm khóa"}
                    >
                      Sentences / Mẫu câu
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnitAction(unit, unitNumber, isUnlocked, () => {
                          playSoundEffect('celebrate');
                          onStartGameForUnit(unit.unitKey);
                        });
                      }}
                      className={`py-1 px-1 rounded-lg border text-[10px] font-bold text-center cursor-pointer transition-colors flex items-center justify-center gap-0.5 ${
                        isUnlocked
                          ? 'bg-amber-50 hover:bg-amber-100 text-emerald-950 border-amber-300'
                          : 'bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-950 border-stone-200'
                      }`}
                      title={isUnlocked ? "Chơi trò chơi xanh Eco Games cho Unit này" : "Bài học đang tạm khóa"}
                    >
                      <Gamepad2 className="w-2.5 h-2.5 text-amber-700" />
                      <span>Eco Games</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* POPUP THÔNG BÁO BÀI HỌC BỊ KHÓA CHO HỌC SINH */}
      {lockedUnitNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#f2faf5] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border-[3.5px] border-amber-300 text-center animate-scaleUp">
            <button
              onClick={() => {
                playSoundEffect('click');
                setLockedUnitNotice(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Lock Icon */}
            <div className="w-16 h-16 rounded-3xl bg-amber-100 border-2 border-amber-300 text-amber-700 flex items-center justify-center mx-auto mb-3.5 shadow-inner">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>

            {/* Unit Title */}
            <h3 className="text-lg sm:text-xl font-black text-emerald-950 font-display mb-1.5">
              Unit {lockedUnitNotice.unitNumber}: {lockedUnitNotice.unitName}
            </h3>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black mb-3.5 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Locked / Tạm khóa</span>
            </div>

            {/* Friendly Notification Message */}
            <div className="p-4 bg-white/95 rounded-2xl border-2 border-amber-200/90 text-emerald-950 text-xs sm:text-sm font-semibold leading-relaxed mb-5 shadow-xs text-left space-y-2">
              <p className="font-bold text-amber-950 flex items-start gap-1.5">
                <span className="text-base shrink-0">🔒</span>
                <span>This unit is currently locked by your teacher.</span>
              </p>
              <p className="text-emerald-900 pl-5">
                Bài học này đang được tạm khóa bởi Giáo viên. Vui lòng hoàn thành các bài học trước nhé! 🌱
              </p>
            </div>

            {/* Got it CTA */}
            <button
              onClick={() => {
                playSoundEffect('click');
                setLockedUnitNotice(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] hover:from-[#0f5430] hover:to-[#22c55e] active:scale-95 text-white font-black text-sm rounded-xl shadow-md cursor-pointer transition-all"
            >
              Đã hiểu / Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
