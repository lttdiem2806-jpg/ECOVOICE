import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  Upload, 
  Link, 
  Check, 
  X, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Eye, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Save,
  CheckCircle2,
  FolderOpen,
  LayoutDashboard,
  Users,
  FileCheck,
  ShieldCheck,
  Plus,
  Calendar,
  Zap,
  Sprout,
  BarChart3,
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  EyeOff,
  Key,
  LogOut,
  Pencil,
  FileSpreadsheet,
  Download,
  Trophy,
  Crown,
  Medal,
  ChevronDown,
  Edit3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  getHonorBoardStudents, 
  HonorStudent, 
  exportHonorBoardToExcel 
} from '../services/honorBoardService';
import { bookmapDatabase, UnitData, VocabularyItem, SentenceStructure } from '../data/bookmapData';
import { 
  getCustomVisuals, 
  saveCustomVisual, 
  removeCustomVisual, 
  resetAllCustomVisuals,
  isTeacherUnlocked,
  setTeacherUnlocked,
  getTeacherClasses,
  saveTeacherClass,
  deleteTeacherClass,
  resetTeacherClassesToDefault,
  CLASSES_EVENT,
  getTeacherAssignments,
  saveTeacherAssignment,
  deleteTeacherAssignment,
  ASSIGNMENTS_EVENT,
  getUnitPermissions,
  toggleUnitPermission,
  setAllUnitsPermission,
  verifyTeacherPassword,
  setTeacherPassword,
  setCurrentUserRole,
  getTeacherPassword,
  CustomVisual,
  TeacherClass,
  TeacherAssignment,
  StudentAccount,
  getStudentAccounts,
  addStudentAccount,
  saveStudentAccount,
  deleteStudentAccount,
  STUDENTS_EVENT,
  calculateClassSpeakingAverage,
  syncClassesWithStudentData,
  ASSIGNMENT_TYPE_OPTIONS,
  getAssignmentDisplayInfo,
  isAssignmentForStudent,
  getUnitsForGrade,
  saveCustomUnit,
  deleteCustomUnit,
  UNITS_EVENT
} from '../services/teacherContentService';

interface TeacherDashboardProps {
  onClose: () => void;
  playSoundEffect?: (name: 'chime' | 'success' | 'click' | 'celebrate' | 'fail') => void;
}

export type TeacherTab = 'overview' | 'classes' | 'assignments' | 'honor' | 'illustrations' | 'unit_access';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  onClose, 
  playSoundEffect 
}) => {
  // Navigation: 6 Main Tabs
  const [activeTab, setActiveTab] = useState<TeacherTab>('overview');

  // Honor Board State in Teacher Dashboard (Main tab)
  const [honorScope, setHonorScope] = useState<string>('all');
  const [honorTimeRange, setHonorTimeRange] = useState<'week' | 'month'>('week');

  // Sub-tab inside Class Detail Modal (Roster vs Honor)
  const [classDetailTab, setClassDetailTab] = useState<'roster' | 'honor'>('roster');
  const [classDetailTimeRange, setClassDetailTimeRange] = useState<'week' | 'month'>('week');

  // Authentication State & Password Protection
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isTeacherUnlocked());
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Change Password Modal State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [oldPasswordInput, setOldPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [showOldPass, setShowOldPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);

  // Handle password submission to unlock teacher dashboard
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyTeacherPassword(pinInput)) {
      setTeacherUnlocked(true);
      setIsUnlocked(true);
      setCurrentUserRole('teacher');
      setPinError(null);
      showToast('Xác thực mật khẩu thành công! Chào mừng Thầy/Cô vào Teacher Dashboard.', 'success');
    } else {
      setPinError('Mật khẩu không đúng! Vui lòng thử lại.');
      if (playSoundEffect) playSoundEffect('fail');
    }
  };

  // Handle logout and switch back to student role
  const handleLogoutAndSwitchToStudent = () => {
    setTeacherUnlocked(false);
    setIsUnlocked(false);
    setCurrentUserRole('student');
    onClose();
  };

  // Handle change password
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);

    // 1. Kiểm tra mật khẩu hiện tại
    if (!oldPasswordInput.trim()) {
      setChangePasswordError('Vui lòng nhập mật khẩu hiện tại.');
      if (playSoundEffect) playSoundEffect('fail');
      return;
    }
    if (!verifyTeacherPassword(oldPasswordInput)) {
      setChangePasswordError('Mật khẩu hiện tại không chính xác! Vui lòng thử lại.');
      if (playSoundEffect) playSoundEffect('fail');
      return;
    }

    // 2. Kiểm tra mật khẩu mới
    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 4) {
      setChangePasswordError('Mật khẩu mới phải có ít nhất 4 ký tự.');
      if (playSoundEffect) playSoundEffect('fail');
      return;
    }

    // 3. Kiểm tra 2 ô mật khẩu mới có khớp nhau không
    if (newPasswordInput.trim() !== confirmPasswordInput.trim()) {
      setChangePasswordError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      if (playSoundEffect) playSoundEffect('fail');
      return;
    }

    // 4. Lưu mật khẩu giáo viên mới vào localStorage và hiển thị thông báo
    setTeacherPassword(newPasswordInput.trim());
    setShowChangePasswordModal(false);
    setOldPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setChangePasswordError(null);
    showToast('Đổi mật khẩu thành công!', 'success');
    if (playSoundEffect) playSoundEffect('celebrate');
  };

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Data States
  const [classesList, setClassesList] = useState<TeacherClass[]>(() => getTeacherClasses());
  const [assignmentsList, setAssignmentsList] = useState<TeacherAssignment[]>(() => getTeacherAssignments());
  const [asgClassFilter, setAsgClassFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ecovoice_teacher_selected_class') || 'all';
    }
    return 'all';
  });
  const [unitPermissions, setUnitPermissions] = useState<Record<string, boolean>>(() => getUnitPermissions());
  const [customVisuals, setCustomVisuals] = useState<Record<string, CustomVisual>>(() => getCustomVisuals());
  const [studentsList, setStudentsList] = useState<StudentAccount[]>(() => getStudentAccounts());
  const [showAddStudentForm, setShowAddStudentForm] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentPassword, setNewStudentPassword] = useState<string>('123456');
  const [studentToDelete, setStudentToDelete] = useState<StudentAccount | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<TeacherAssignment | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const studentImportFileInputRef = useRef<HTMLInputElement | null>(null);
  const [defaultImportPassword, setDefaultImportPassword] = useState<string>('123456');
  const [editingPasswordStudentId, setEditingPasswordStudentId] = useState<string | null>(null);
  const [tempPasswordInput, setTempPasswordInput] = useState<string>('');

  // -----------------------------------------------------------------
  // CONTENT EDITOR / ILLUSTRATIONS FILTER STATE
  // -----------------------------------------------------------------
  const [selectedGrade, setSelectedGrade] = useState<'3' | '4' | '5'>('3');
  const [selectedUnitKey, setSelectedUnitKey] = useState<string>('unit_1');
  const [filterType, setFilterType] = useState<'all' | 'vocab' | 'sentence'>('all');
  const [onlyCustomized, setOnlyCustomized] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing Modal State for Illustrations
  const [editingItem, setEditingItem] = useState<{
    id: string;
    type: 'vocab' | 'sentence';
    wordOrSentence: string;
    phonetic?: string;
    meaning: string;
    lesson?: string;
    unitKey: string;
    unitName: string;
    defaultIcon?: string;
    defaultColorHex?: string;
  } | null>(null);

  const [inputImageUrl, setInputImageUrl] = useState<string>('');
  const [inputCustomIcon, setInputCustomIcon] = useState<string>('');
  const [previewError, setPreviewError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -----------------------------------------------------------------
  // ASSIGNMENTS MODAL STATE
  // -----------------------------------------------------------------
  const [showNewAssignmentModal, setShowNewAssignmentModal] = useState<boolean>(false);
  const [asgTitle, setAsgTitle] = useState<string>('');
  const [asgGrade, setAsgGrade] = useState<'3' | '4' | '5'>('3');
  const [asgClass, setAsgClass] = useState<string>('Tất cả các lớp');
  const [asgUnitKey, setAsgUnitKey] = useState<string>('unit_9');
  const [asgLesson, setAsgLesson] = useState<string>('Lesson 1');
  const [asgType, setAsgType] = useState<string>('vocab');
  const [asgDueDate, setAsgDueDate] = useState<string>('2026-10-25');
  const [asgRewardEP, setAsgRewardEP] = useState<number>(30);

  // -----------------------------------------------------------------
  // FILTERED CLASSES FOR ASSIGNMENT CREATION (DEPENDENT ON asgGrade)
  // -----------------------------------------------------------------
  const classesForSelectedGrade = useMemo(() => {
    const selectedG = String(asgGrade).trim();
    return classesList.filter(c => {
      // Extract numeric grade from c.grade (handles '3', 'Grade 3', 'Khối 3', 3)
      const rawGrade = String(c.grade || '').trim();
      const gradeNumMatch = rawGrade.match(/\b([3-5])\b/) || rawGrade.match(/([3-5])/);
      const parsedGrade = gradeNumMatch ? gradeNumMatch[1] : rawGrade;

      // Extract numeric grade from class name (e.g. '3A1' -> '3', '4A3' -> '4', 'Lớp 5A2' -> '5')
      const nameNumMatch = c.name.match(/\b([3-5])[A-Za-z0-9]*/i) || c.name.match(/([3-5])/);
      const nameGrade = nameNumMatch ? nameNumMatch[1] : null;

      // STRICT EXCLUSION: If class name or grade belongs to another grade, hide it completely!
      if (nameGrade && nameGrade !== selectedG) {
        return false;
      }
      if (parsedGrade && parsedGrade !== selectedG) {
        return false;
      }

      return parsedGrade === selectedG || nameGrade === selectedG;
    });
  }, [classesList, asgGrade]);

  // Ensure asgClass is synchronized and valid whenever asgGrade or available classes change
  useEffect(() => {
    if (asgClass !== 'Tất cả các lớp' && !classesForSelectedGrade.some(c => c.name === asgClass)) {
      setAsgClass('Tất cả các lớp');
    }
  }, [asgGrade, classesForSelectedGrade, asgClass]);

  // -----------------------------------------------------------------
  // CLASSES MODAL / ROSTER STATE
  // -----------------------------------------------------------------
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<TeacherClass | null>(null);
  const [showNewClassModal, setShowNewClassModal] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassGrade, setNewClassGrade] = useState<'3' | '4' | '5'>('3');
  const [newClassTeacher, setNewClassTeacher] = useState<string>('');
  const [newClassCount, setNewClassCount] = useState<number>(35);

  // Edit Class State
  const [editingClass, setEditingClass] = useState<TeacherClass | null>(null);
  const [editClassName, setEditClassName] = useState<string>('');
  const [editClassGrade, setEditClassGrade] = useState<'3' | '4' | '5'>('3');
  const [editClassTeacher, setEditClassTeacher] = useState<string>('');
  const [editClassCount, setEditClassCount] = useState<number>(35);

  // Delete Class Confirmation State
  const [deletingClass, setDeletingClass] = useState<TeacherClass | null>(null);

  // Modal State for Adding New Custom Lesson Item
  const [showAddLessonModal, setShowAddLessonModal] = useState<boolean>(false);
  const [addLessonType, setAddLessonType] = useState<'vocab' | 'sentence'>('vocab');
  const [addLessonGrade, setAddLessonGrade] = useState<'3' | '4' | '5'>('3');
  const [addLessonUnitKey, setAddLessonUnitKey] = useState<string>('unit_1');
  const [addLessonSection, setAddLessonSection] = useState<string>('Lesson 1');
  const [addLessonWordOrSentence, setAddLessonWordOrSentence] = useState<string>('');
  const [addLessonPhonetic, setAddLessonPhonetic] = useState<string>('');
  const [addLessonMeaning, setAddLessonMeaning] = useState<string>('');
  const [addLessonImageUrl, setAddLessonImageUrl] = useState<string>('');
  const [addLessonIcon, setAddLessonIcon] = useState<string>('🌱');

  // Modal State for Adding / Editing Custom Unit
  const [showAddEditUnitModal, setShowAddEditUnitModal] = useState<boolean>(false);
  const [editingUnitObj, setEditingUnitObj] = useState<any | null>(null);
  const [unitFormNumber, setUnitFormNumber] = useState<number>(21);
  const [unitFormName, setUnitFormName] = useState<string>('');
  const [unitFormFullName, setUnitFormFullName] = useState<string>('');
  const [unitFormTheme, setUnitFormTheme] = useState<string>('');
  const [unitFormUnlocked, setUnitFormUnlocked] = useState<boolean>(true);

  // Listen to LocalStorage & Firestore real-time updates
  useEffect(() => {
    const handleUpdate = () => {
      setCustomVisuals(getCustomVisuals());
      setClassesList(getTeacherClasses());
      setAssignmentsList(getTeacherAssignments());
      setUnitPermissions(getUnitPermissions());
      setStudentsList(getStudentAccounts());
    };
    window.addEventListener('ecovoice_custom_visuals_updated', handleUpdate);
    window.addEventListener('ecovoice_unit_permissions_updated', handleUpdate);
    window.addEventListener('ecovoice_custom_units_updated', handleUpdate);
    window.addEventListener('ecovoice_perms_updated', handleUpdate);
    window.addEventListener('ecovoice_classes_updated', handleUpdate);
    window.addEventListener('ecovoice_assignments_updated', handleUpdate);
    window.addEventListener(ASSIGNMENTS_EVENT, handleUpdate);
    window.addEventListener(CLASSES_EVENT, handleUpdate);
    window.addEventListener(STUDENTS_EVENT, handleUpdate);
    window.addEventListener(UNITS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ecovoice_custom_visuals_updated', handleUpdate);
      window.removeEventListener('ecovoice_unit_permissions_updated', handleUpdate);
      window.removeEventListener('ecovoice_custom_units_updated', handleUpdate);
      window.removeEventListener('ecovoice_perms_updated', handleUpdate);
      window.removeEventListener('ecovoice_classes_updated', handleUpdate);
      window.removeEventListener('ecovoice_assignments_updated', handleUpdate);
      window.removeEventListener(ASSIGNMENTS_EVENT, handleUpdate);
      window.removeEventListener(CLASSES_EVENT, handleUpdate);
      window.removeEventListener(STUDENTS_EVENT, handleUpdate);
      window.removeEventListener(UNITS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Tự động rà soát và đồng bộ các bài tập với bài đã nộp thực tế của học sinh (loại bỏ dữ liệu mẫu cũ)
  useEffect(() => {
    const currentStudents = getStudentAccounts();
    const currentAssignments = getTeacherAssignments();
    let modified = false;

    const reconciled = currentAssignments.map(asg => {
      const actualSubmissions = currentStudents.filter(
        st => isAssignmentForStudent(asg, st.className, st.grade) && (st.completedAssignments || []).includes(asg.id)
      ).length;

      if ((asg.submittedCount || 0) !== actualSubmissions) {
        modified = true;
        return { ...asg, submittedCount: actualSubmissions };
      }
      return asg;
    });

    if (modified) {
      localStorage.setItem('ecovoice_teacher_assignments', JSON.stringify(reconciled));
      setAssignmentsList(reconciled);
    }

    // Luôn đồng bộ dữ liệu học sinh & lớp học đã được làm sạch trên giao diện
    setStudentsList(currentStudents);
    setClassesList(getTeacherClasses());
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    if (playSoundEffect) {
      playSoundEffect(type === 'error' ? 'fail' : 'celebrate');
    }
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Grade Data & Units for Illustrations & Unit Access
  const gradeData = bookmapDatabase.grades[selectedGrade];
  const unitsList = useMemo(() => getUnitsForGrade(selectedGrade), [selectedGrade, customVisuals]);

  // Handle Add or Edit Custom Unit Form Submit
  const handleSaveUnitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitFormName.trim()) {
      showToast('Vui lòng nhập Tên Unit tiếng Anh!', 'error');
      return;
    }

    const unitNum = Number(unitFormNumber) || 1;
    const unitKey = editingUnitObj?.unitKey || `unit_${unitNum}`;
    const unitFullName = unitFormFullName.trim() || `Unit ${unitNum}: ${unitFormName.trim()}`;
    const theme = unitFormTheme.trim() || 'Custom Unit Theme';

    const unitDataToSave = {
      unitKey,
      unitNumber: unitNum,
      unitName: unitFormName.trim(),
      unitFullName,
      theme,
      vocabulary: editingUnitObj?.vocabulary || [],
      sentences: editingUnitObj?.sentences || [],
      lessons: editingUnitObj?.lessons || []
    };

    saveCustomUnit(selectedGrade, unitDataToSave);
    toggleUnitPermission(selectedGrade, unitKey, unitFormUnlocked);

    setShowAddEditUnitModal(false);
    setEditingUnitObj(null);
    setUnitFormName('');
    setUnitFormFullName('');
    setUnitFormTheme('');
    showToast(`Đã ${editingUnitObj ? 'cập nhật' : 'tạo mới'} ${unitFullName} thành công!`, 'success');
  };

  // Handle Delete Unit
  const handleDeleteUnit = (unitKey: string, unitFullName: string) => {
    if (confirm(`Bạn có chắc chắn muốn XÓA ${unitFullName} khỏi Khối ${selectedGrade} không?`)) {
      deleteCustomUnit(selectedGrade, unitKey);
      showToast(`Đã xóa ${unitFullName} thành công!`, 'info');
    }
  };

  useEffect(() => {
    if (unitsList.length > 0 && !unitsList.some(u => u.unitKey === selectedUnitKey)) {
      setSelectedUnitKey(unitsList[0].unitKey);
    }
  }, [selectedGrade, unitsList, selectedUnitKey]);

  const currentUnit = unitsList.find(u => u.unitKey === selectedUnitKey) || unitsList[0];

  // Prepare vocabulary & sentence list for the current unit
  const currentUnitVocab = useMemo(() => {
    if (!currentUnit) return [];
    if (currentUnit.vocabulary && currentUnit.vocabulary.length > 0) {
      return currentUnit.vocabulary;
    }
    const combined: VocabularyItem[] = [];
    currentUnit.lessons?.forEach((l: any) => {
      if (l.vocabulary) combined.push(...l.vocabulary);
    });
    return combined;
  }, [currentUnit]);

  const currentUnitSentences = useMemo(() => {
    if (!currentUnit) return [];
    if (currentUnit.sentences && currentUnit.sentences.length > 0) {
      return currentUnit.sentences;
    }
    const combined: SentenceStructure[] = [];
    currentUnit.lessons?.forEach((l: any) => {
      if (l.sentences) combined.push(...l.sentences);
    });
    return combined;
  }, [currentUnit]);

  // Filtered items for Illustrations Tab
  const filteredItems = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'vocab' | 'sentence';
      wordOrSentence: string;
      phonetic?: string;
      meaning: string;
      lesson?: string;
      unitKey: string;
      unitName: string;
      defaultIcon?: string;
      defaultColorHex?: string;
      customData?: CustomVisual;
    }> = [];

    if (filterType === 'all' || filterType === 'vocab') {
      currentUnitVocab.forEach((v: any) => {
        const custom = customVisuals[v.id] || customVisuals[`WORD_${v.word?.toUpperCase()}`];
        if (onlyCustomized && !custom) return;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = 
            v.word.toLowerCase().includes(q) || 
            v.meaning.toLowerCase().includes(q) || 
            (v.phonetic && v.phonetic.toLowerCase().includes(q));
          if (!match) return;
        }

        list.push({
          id: v.id,
          type: 'vocab',
          wordOrSentence: v.word,
          phonetic: v.phonetic,
          meaning: v.meaning,
          lesson: v.lesson,
          unitKey: currentUnit?.unitKey || selectedUnitKey,
          unitName: currentUnit?.unitFullName || 'Unit',
          defaultIcon: v.icon,
          defaultColorHex: v.colorHex,
          customData: custom
        });
      });
    }

    if (filterType === 'all' || filterType === 'sentence') {
      currentUnitSentences.forEach((s: any) => {
        const custom = customVisuals[s.id];
        if (onlyCustomized && !custom) return;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = 
            s.example.toLowerCase().includes(q) || 
            s.exampleVi.toLowerCase().includes(q) || 
            (s.structure && s.structure.toLowerCase().includes(q));
          if (!match) return;
        }

        list.push({
          id: s.id,
          type: 'sentence',
          wordOrSentence: s.example,
          meaning: s.exampleVi || s.meaning,
          lesson: s.lesson,
          unitKey: currentUnit?.unitKey || selectedUnitKey,
          unitName: currentUnit?.unitFullName || 'Unit',
          defaultIcon: '💬',
          defaultColorHex: '#3b82f6',
          customData: custom
        });
      });
    }

    // Include teacher custom-added lesson items
    Object.values(customVisuals).forEach(custom => {
      if (!custom.isCustomAdded) return;
      if (custom.grade && custom.grade !== selectedGrade) return;
      if (custom.unitKey && custom.unitKey !== (currentUnit?.unitKey || selectedUnitKey)) return;

      if (filterType !== 'all' && filterType !== custom.type) return;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          custom.wordOrSentence.toLowerCase().includes(q) || 
          custom.meaning.toLowerCase().includes(q) || 
          (custom.phonetic && custom.phonetic.toLowerCase().includes(q));
        if (!match) return;
      }

      if (list.some(existing => existing.id === custom.id)) return;

      list.push({
        id: custom.id,
        type: custom.type,
        wordOrSentence: custom.wordOrSentence,
        phonetic: custom.phonetic,
        meaning: custom.meaning,
        lesson: custom.lesson || 'Lesson tùy chỉnh',
        unitKey: custom.unitKey || selectedUnitKey,
        unitName: custom.unitName || currentUnit?.unitFullName || 'Unit',
        defaultIcon: custom.customIcon || '🌱',
        defaultColorHex: custom.customColorHex || '#10b981',
        customData: custom
      });
    });

    return list;
  }, [currentUnitVocab, currentUnitSentences, filterType, onlyCustomized, searchQuery, customVisuals, currentUnit, selectedUnitKey, selectedGrade]);

  const totalCustomizations = Object.keys(customVisuals).length;

  // Overview stats calculation - dynamically aggregated and strictly matched with active classes & student data
  const activeClassNames = useMemo(() => new Set(classesList.map(c => c.name.toLowerCase().trim())), [classesList]);
  
  const activeClassStudents = useMemo(() => {
    return studentsList.filter(s => activeClassNames.has(s.className.toLowerCase().trim()));
  }, [studentsList, activeClassNames]);

  // Sĩ số thực tế của từng lớp: đếm số học sinh thuộc lớp đó trong cơ sở dữ liệu
  const getClassStudentCount = useCallback((className: string): number => {
    const target = className.toLowerCase().trim();
    return studentsList.filter(s => s.className.toLowerCase().trim() === target).length;
  }, [studentsList]);

  // Lọc danh sách các lớp thực tế có học sinh (> 0 em)
  const classesWithStudents = useMemo(() => {
    return classesList.filter(c => getClassStudentCount(c.name) > 0);
  }, [classesList, getClassStudentCount]);

  const activeClassesCount = classesWithStudents.length;

  // Yêu cầu 1: Tổng số học sinh ở thẻ tổng quan được tính bằng cách cộng dồn Sĩ số thực tế của tất cả các lớp có trong danh sách bảng dữ liệu
  const totalStudents = useMemo(() => {
    return classesList.reduce((acc, c) => acc + getClassStudentCount(c.name), 0);
  }, [classesList, getClassStudentCount]);

  // Tổng số cây xanh đã trồng: cộng dồn tổng số cây xanh thực tế từ trường dữ liệu trees của tất cả học sinh
  const totalTreesPlanted = useMemo(() => {
    return studentsList.reduce((acc, s) => acc + (s.trees || 0), 0);
  }, [studentsList]);
  
  // Độ chuẩn phát âm: Lấy giá trị điểm phát âm trung bình thực tế của các học sinh có trong hệ thống (không gán cứng 100%)
  const avgAccuracy = useMemo(() => {
    const studentsWithScore = studentsList.filter(s => (s.score || 0) > 0);
    if (studentsWithScore.length === 0) {
      return 0;
    }
    const totalScore = studentsWithScore.reduce((acc, s) => acc + (s.score || 0), 0);
    return Math.round(totalScore / studentsWithScore.length);
  }, [studentsList]);

  // Dynamic sync for class lesson and completion rate based on actual student activity
  const getClassLessonInfo = (c: TeacherClass): { unitName: string; lessonName?: string } => {
    const classAssignments = assignmentsList.filter(a => isAssignmentForStudent(a, c.name, c.grade));
    if (classAssignments.length === 0) return { unitName: 'Chưa giao bài' };
    const sorted = [...classAssignments].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const latest = sorted[0];
    return {
      unitName: latest.unitName || latest.title || 'Chưa giao bài',
      lessonName: latest.lessonName
    };
  };

  const getClassLesson = (c: TeacherClass): string => {
    return getClassLessonInfo(c).unitName;
  };

  const getClassCompletionRate = useCallback((c: TeacherClass): number => {
    const classStudents = studentsList.filter(
      s => s.className.toLowerCase().trim() === c.name.toLowerCase().trim()
    );
    // Lớp có sĩ số 0 em không được hiển thị tiến độ 100%, phải trả về 0%
    if (classStudents.length === 0) return 0;

    const classAssignments = assignmentsList.filter(a => isAssignmentForStudent(a, c.name, c.grade));
    if (classAssignments.length === 0) return 0;

    let studentCompletedCount = 0;
    classStudents.forEach(st => {
      const completedSet = new Set(st.completedAssignments || []);
      classAssignments.forEach(asg => {
        if (completedSet.has(asg.id)) {
          studentCompletedCount += 1;
        }
      });
    });

    const totalExpected = classStudents.length * classAssignments.length;
    if (totalExpected === 0) return 0;

    return Math.min(100, Math.round((studentCompletedCount / totalExpected) * 100));
  }, [studentsList, assignmentsList]);

  // Tỷ lệ hoàn thành: Tính toán dựa trên tiến độ hoàn thành bài học thực tế của các em học sinh (số bài đã học / tổng số bài)
  const avgCompletion = useMemo(() => {
    if (studentsList.length === 0) {
      return 0;
    }

    let totalAssigned = 0;
    let totalCompleted = 0;

    studentsList.forEach(st => {
      const studentAssignments = assignmentsList.filter(a => isAssignmentForStudent(a, st.className, st.grade));
      totalAssigned += studentAssignments.length;

      const completedSet = new Set(st.completedAssignments || []);
      studentAssignments.forEach(asg => {
        if (completedSet.has(asg.id)) {
          totalCompleted += 1;
        }
      });
    });

    if (totalAssigned === 0) {
      return 0;
    }

    return Math.min(100, Math.round((totalCompleted / totalAssigned) * 100));
  }, [studentsList, assignmentsList]);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, SVG, WebP).', 'error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast('Kích thước ảnh lớn hơn 3MB. Vui lòng nén nhỏ hơn để lưu mượt mà.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setInputImageUrl(dataUrl);
        setPreviewError(false);
        showToast('Đã tải ảnh lên thành công! Xem trước bên dưới.', 'info');
      }
    };
    reader.onerror = () => {
      showToast('Lỗi khi đọc tệp ảnh.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    const trimmedUrl = inputImageUrl.trim();
    const trimmedIcon = inputCustomIcon.trim();

    if (!trimmedUrl && !trimmedIcon) {
      showToast('Vui lòng nhập đường dẫn URL ảnh, tải ảnh lên hoặc chọn emoji minh họa.', 'error');
      return;
    }

    const newRecord: CustomVisual = {
      id: editingItem.id,
      fallbackKey: editingItem.wordOrSentence.toUpperCase(),
      type: editingItem.type,
      wordOrSentence: editingItem.wordOrSentence,
      phonetic: editingItem.phonetic,
      meaning: editingItem.meaning,
      grade: selectedGrade,
      unitKey: editingItem.unitKey,
      unitName: editingItem.unitName,
      lesson: editingItem.lesson,
      imageUrl: trimmedUrl || undefined,
      customIcon: trimmedIcon || undefined,
      updatedAt: Date.now()
    };

    saveCustomVisual(newRecord);
    setEditingItem(null);
    showToast(`Đã lưu hình ảnh tùy chỉnh cho "${editingItem.wordOrSentence}" vào LocalStorage!`, 'success');
  };

  const handleRevertSingle = (id: string, word: string) => {
    removeCustomVisual(id, word);
    showToast(`Đã khôi phục hình ảnh mặc định cho "${word}".`, 'info');
  };

  const handleResetAll = () => {
    if (window.confirm('Thầy/Cô có chắc chắn muốn xóa tất cả hình ảnh tùy chỉnh và quay về mặc định chương trình không?')) {
      resetAllCustomVisuals();
      showToast('Đã khôi phục toàn bộ hình ảnh về mặc định chương trình.', 'info');
    }
  };

  // Add new custom lesson item (Vocabulary / Sentence)
  const handleSaveAddLessonItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addLessonWordOrSentence.trim() || !addLessonMeaning.trim()) {
      showToast('Vui lòng nhập Từ vựng / Câu tiếng Anh và Nghĩa tiếng Việt!', 'error');
      return;
    }

    const currentGradeUnits = bookmapDatabase.grades[addLessonGrade]?.units || [];
    const matchedUnit = currentGradeUnits.find(u => u.unitKey === addLessonUnitKey) || currentGradeUnits[0];

    const newItemId = `custom_lesson_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newVisualRecord: CustomVisual = {
      id: newItemId,
      fallbackKey: addLessonWordOrSentence.trim().toUpperCase(),
      type: addLessonType,
      wordOrSentence: addLessonWordOrSentence.trim(),
      phonetic: addLessonPhonetic.trim() || undefined,
      meaning: addLessonMeaning.trim(),
      grade: addLessonGrade,
      unitKey: addLessonUnitKey,
      unitName: matchedUnit?.unitFullName || `Unit ${addLessonUnitKey.replace('unit_', '')}`,
      lesson: addLessonSection,
      imageUrl: addLessonImageUrl.trim() || undefined,
      customIcon: addLessonIcon || '🌱',
      isCustomAdded: true,
      updatedAt: Date.now()
    };

    saveCustomVisual(newVisualRecord);
    setCustomVisuals(getCustomVisuals());
    setShowAddLessonModal(false);
    setAddLessonWordOrSentence('');
    setAddLessonPhonetic('');
    setAddLessonMeaning('');
    setAddLessonImageUrl('');
    showToast(`Đã thêm bài học mới "${newVisualRecord.wordOrSentence}" vào ${newVisualRecord.unitName} thành công!`, 'success');
  };

  // Delete custom lesson item completely or revert built-in item
  const handleDeleteLessonItem = (id: string, wordOrSentence: string, isCustomAdded?: boolean) => {
    const message = isCustomAdded
      ? `Thầy/Cô có chắc chắn muốn XÓA hẳn bài học "${wordOrSentence}" khỏi hệ thống không?`
      : `Thầy/Cô có muốn khôi phục ảnh mặc định cho bài học "${wordOrSentence}" không?`;

    if (window.confirm(message)) {
      removeCustomVisual(id, wordOrSentence);
      setCustomVisuals(getCustomVisuals());
      showToast(`Đã ${isCustomAdded ? 'xóa' : 'khôi phục ảnh'} bài học "${wordOrSentence}" thành công!`, 'info');
    }
  };

  // Preset suggestions
  const PRESET_IMAGE_SUGGESTIONS: Record<string, string> = {
    'ORANGE': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&auto=format&fit=crop&q=80',
    'CROCODILE': 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&auto=format&fit=crop&q=80',
    'ZEBRA': 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=400&auto=format&fit=crop&q=80',
    'ELEPHANT': 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400&auto=format&fit=crop&q=80',
    'TIGER': 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=400&auto=format&fit=crop&q=80',
    'ROBOT': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&auto=format&fit=crop&q=80',
    'KITE': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80'
  };

  // Handle new assignment creation
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề bài tập.', 'error');
      return;
    }

    const currentGradeUnits = bookmapDatabase.grades[asgGrade]?.units || [];
    const matchedUnit = currentGradeUnits.find(u => u.unitKey === asgUnitKey) || currentGradeUnits[0];

    const selectedOption = ASSIGNMENT_TYPE_OPTIONS.find(opt => opt.value === asgType);
    const chosenUnitName = matchedUnit?.unitFullName || `Unit ${asgUnitKey.replace('unit_', '')}`;

    const newAsg: TeacherAssignment = {
      id: `asg_${Date.now()}`,
      title: asgTitle.trim(),
      grade: asgGrade,
      targetClass: asgClass,
      unitKey: asgUnitKey,
      unitName: chosenUnitName,
      lessonName: asgLesson,
      type: asgType,
      gameId: selectedOption?.isGame ? selectedOption.gameId : undefined,
      gameName: selectedOption?.isGame ? selectedOption.gameName : undefined,
      dueDate: asgDueDate,
      rewardEP: Number(asgRewardEP) || 30,
      submittedCount: 0,
      totalStudents: studentsList.filter(s => isAssignmentForStudent({
        targetClass: asgClass,
        grade: asgGrade,
        unitKey: asgUnitKey
      } as any, s.className, s.grade)).length,
      status: 'active',
      createdAt: Date.now()
    };

    saveTeacherAssignment(newAsg);
    setAssignmentsList(getTeacherAssignments());
    setClassesList(getTeacherClasses());
    setShowNewAssignmentModal(false);
    setAsgTitle('');
    showToast(`Đã giao bài tập mới "${chosenUnitName}" (${asgLesson}) thành công cho học sinh!`, 'success');
  };

  // Handle new class creation
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      showToast('Vui lòng nhập tên lớp.', 'error');
      return;
    }

    const newCls: TeacherClass = {
      id: `c_${Date.now()}`,
      name: newClassName.trim().toUpperCase(),
      grade: newClassGrade,
      studentCount: Number(newClassCount) || 35,
      teacherName: newClassTeacher.trim() || 'Giáo viên phụ trách',
      currentUnit: `Unit 1 (Khối ${newClassGrade})`,
      completionRate: 0,
      averageSpeakingScore: 0,
      plantedTrees: 0
    };

    saveTeacherClass(newCls);
    setClassesList(getTeacherClasses());
    setShowNewClassModal(false);
    setNewClassName('');
    setNewClassTeacher('');
    setNewClassCount(35);
    showToast(`Đã thêm lớp học ${newCls.name} thành công!`, 'success');
  };

  // Open Edit Class Modal
  const handleOpenEditClass = (cls: TeacherClass) => {
    setEditingClass(cls);
    setEditClassName(cls.name);
    setEditClassGrade(cls.grade as '3' | '4' | '5');
    setEditClassTeacher(cls.teacherName);
    setEditClassCount(cls.studentCount);
  };

  // Handle Save Edited Class
  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    if (!editClassName.trim()) {
      showToast('Vui lòng nhập tên lớp.', 'error');
      return;
    }

    const updatedCls: TeacherClass = {
      ...editingClass,
      name: editClassName.trim().toUpperCase(),
      grade: editClassGrade,
      studentCount: Number(editClassCount) || 35,
      teacherName: editClassTeacher.trim() || 'Giáo viên phụ trách'
    };

    saveTeacherClass(updatedCls);
    setClassesList(getTeacherClasses());
    setEditingClass(null);
    showToast(`Đã cập nhật thông tin lớp ${updatedCls.name} thành công!`, 'success');
  };

  // Handle Confirm Delete Class
  const handleConfirmDeleteClass = () => {
    if (!deletingClass) return;
    const name = deletingClass.name;
    deleteTeacherClass(deletingClass.id);
    setClassesList(getTeacherClasses());
    setStudentsList(getStudentAccounts());
    setDeletingClass(null);
    showToast(`Đã xóa lớp học ${name} thành công!`, 'info');
  };

  // Handle Reset Classes To Default
  const handleResetClassesToDefault = () => {
    const defaultList = resetTeacherClassesToDefault();
    setClassesList(defaultList);
    setStudentsList(getStudentAccounts());
    showToast('Đã nạp lại danh sách lớp mẫu thành công!', 'success');
  };

  // Handle Unit Lock / Unlock Toggle
  const handleToggleUnit = (unitKey: string, currentStatus: boolean) => {
    toggleUnitPermission(selectedGrade, unitKey, !currentStatus);
    setUnitPermissions(getUnitPermissions());
    showToast(
      !currentStatus 
        ? `Đã mở khóa bài học cho học sinh.` 
        : `Đã tạm khóa bài học này.`,
      !currentStatus ? 'success' : 'info'
    );
  };

  // Handle Unlock / Lock All
  const handleSetAllUnits = (unlock: boolean) => {
    const keys = unitsList.map(u => u.unitKey);
    setAllUnitsPermission(selectedGrade, keys, unlock);
    setUnitPermissions(getUnitPermissions());
    showToast(
      unlock 
        ? `Đã mở khóa toàn bộ ${keys.length} Unit của Khối ${selectedGrade}.` 
        : `Đã khóa toàn bộ các Unit của Khối ${selectedGrade}.`,
      'info'
    );
  };

  // Student roster handlers for selected class
  const handleAddStudentToClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedClassForRoster) return;
    const added = addStudentAccount({
      name: newStudentName.trim(),
      className: selectedClassForRoster.name,
      grade: selectedClassForRoster.grade,
      password: newStudentPassword.trim() || '123456',
      score: 0,
      trees: 0,
      status: 'Chưa luyện tập',
      lastPractice: 'Chưa luyện tập'
    });
    const updatedAccounts = getStudentAccounts();
    setStudentsList(updatedAccounts);

    // Update class studentCount immediately
    const currentClassStudents = updatedAccounts.filter(
      s => s.className.toLowerCase() === selectedClassForRoster.name.toLowerCase()
    );
    const updatedClass: TeacherClass = {
      ...selectedClassForRoster,
      studentCount: currentClassStudents.length
    };
    saveTeacherClass(updatedClass);
    setSelectedClassForRoster(updatedClass);
    setClassesList(getTeacherClasses());

    setNewStudentName('');
    setNewStudentPassword('123456');
    setShowAddStudentForm(false);
    showToast(`Đã thêm học sinh ${added.name} vào lớp ${selectedClassForRoster.name}! Mật khẩu: ${added.password}`, 'success');
  };

  const confirmDeleteStudent = () => {
    if (!studentToDelete || !selectedClassForRoster) return;
    const target = studentToDelete;
    deleteStudentAccount(target.id);
    const updatedAccounts = getStudentAccounts();
    setStudentsList(updatedAccounts);

    // Update class studentCount immediately
    const currentClassStudents = updatedAccounts.filter(
      s => s.className.toLowerCase() === selectedClassForRoster.name.toLowerCase()
    );
    const updatedClass: TeacherClass = {
      ...selectedClassForRoster,
      studentCount: currentClassStudents.length
    };
    saveTeacherClass(updatedClass);
    setSelectedClassForRoster(updatedClass);
    setClassesList(getTeacherClasses());

    setStudentToDelete(null);
    showToast(`Đã xóa học sinh ${target.name} khỏi Lớp ${selectedClassForRoster.name}.`, 'info');
    if (playSoundEffect) playSoundEffect('click');
  };

  const handleSaveStudentPassword = (studentId: string) => {
    const student = studentsList.find(s => s.id === studentId);
    if (!student) return;

    const newPass = tempPasswordInput.trim() || '123456';
    const updated: StudentAccount = {
      ...student,
      password: newPass
    };

    saveStudentAccount(updated);
    setStudentsList(getStudentAccounts());
    setEditingPasswordStudentId(null);
    setTempPasswordInput('');
    showToast(`Đã cập nhật mật khẩu cho học sinh "${student.name}" thành: ${newPass}`, 'success');
    if (playSoundEffect) playSoundEffect('celebrate');
  };

  const handleExportStudentAccounts = () => {
    if (!selectedClassForRoster) return;
    const currentStudents = studentsList.filter(
      st => st.className.toLowerCase() === selectedClassForRoster.name.toLowerCase()
    );

    if (currentStudents.length === 0) {
      showToast(`Lớp ${selectedClassForRoster.name} hiện chưa có học sinh nào để tải danh sách!`, 'error');
      if (playSoundEffect) playSoundEffect('fail');
      return;
    }

    try {
      // Build spreadsheet rows with full class student accounts
      const rows: (string | number)[][] = [
        [`DANH SÁCH TÀI KHOẢN HỌC SINH - LỚP ${selectedClassForRoster.name.toUpperCase()}`],
        [
          `Giáo viên phụ trách: ${selectedClassForRoster.teacherName || 'Lê Thị Thuý Diễm'}`,
          `Sĩ số: ${currentStudents.length} học sinh`,
          `Thời gian xuất: ${new Date().toLocaleDateString('vi-VN')}`
        ],
        [],
        ['STT', 'Họ và tên học sinh', 'Lớp', 'Mật khẩu đăng nhập', 'Tiến độ / Điểm số', 'Cây xanh 🌲', 'Trạng thái luyện tập']
      ];

      currentStudents.forEach((st, idx) => {
        const progressStr = st.lastPractice === 'Chưa luyện tập' || (st.score === 0 && st.trees === 0)
          ? '0%'
          : `${st.score}%`;
        const treesStr = `${st.trees} cây`;

        rows.push([
          idx + 1,
          st.name,
          st.className,
          st.password,
          progressStr,
          treesStr,
          st.lastPractice || 'Chưa luyện tập'
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Nicely formatted column widths
      ws['!cols'] = [
        { wch: 6 },  // STT
        { wch: 28 }, // Họ và tên học sinh
        { wch: 10 }, // Lớp
        { wch: 20 }, // Mật khẩu đăng nhập
        { wch: 18 }, // Tiến độ / Điểm số
        { wch: 15 }, // Cây xanh
        { wch: 22 }  // Trạng thái luyện tập
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Lớp ${selectedClassForRoster.name}`);

      const fileName = `Danh_sach_tai_khoan_Lop_${selectedClassForRoster.name}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showToast(`Đã tải thành công danh sách ${currentStudents.length} tài khoản Lớp ${selectedClassForRoster.name}!`, 'success');
      if (playSoundEffect) playSoundEffect('celebrate');
    } catch (err) {
      console.error('Export error, generating CSV fallback:', err);
      try {
        const headers = ['STT', 'Họ và tên học sinh', 'Lớp', 'Mật khẩu đăng nhập', 'Tiến độ / Điểm số', 'Cây xanh', 'Trạng thái luyện tập'];
        const csvRows = [
          headers.join(','),
          ...currentStudents.map((st, idx) => {
            const p = st.lastPractice === 'Chưa luyện tập' || (st.score === 0 && st.trees === 0) ? '0%' : `${st.score}%`;
            return [
              idx + 1,
              `"${st.name.replace(/"/g, '""')}"`,
              st.className,
              `"${st.password.replace(/"/g, '""')}"`,
              p,
              `${st.trees} cây`,
              `"${st.lastPractice || 'Chưa luyện tập'}"`
            ].join(',');
          })
        ];
        const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Danh_sach_tai_khoan_Lop_${selectedClassForRoster.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`Đã tải danh sách tài khoản CSV Lớp ${selectedClassForRoster.name}!`, 'success');
        if (playSoundEffect) playSoundEffect('celebrate');
      } catch (fallbackErr) {
        showToast('Có lỗi xảy ra khi tạo file xuất danh sách!', 'error');
        if (playSoundEffect) playSoundEffect('fail');
      }
    }
  };

  const handleImportStudentFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClassForRoster) return;

    setIsImporting(true);
    try {
      const fileName = file.name.toLowerCase();
      let extractedNames: string[] = [];

      const cleanCandidateName = (raw: string): string => {
        let text = String(raw).trim();
        text = text.replace(/^["'`]+|["'`]+$/g, '').trim();
        // Remove leading numbering like "1. ", "01. ", "1/ ", "1- ", "1) "
        text = text.replace(/^\d+[\.\-\/\)\:\s]+\s*/, '').trim();
        return text;
      };

      const isIgnoredHeaderOrInvalid = (val: string): boolean => {
        const v = val.trim().toLowerCase();
        if (!v || v.length < 2) return true;
        if (/^\d+$/.test(v)) return true; // purely numbers
        if (/^(stt|no|id|họ và tên|họ tên|tên học sinh|tên|full name|student name|name|lớp|class|khối|grade|ngày sinh|dob|ghi chú|note)$/i.test(v)) {
          return true;
        }
        return false;
      };

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[firstSheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        for (const row of rows) {
          if (!Array.isArray(row) || row.length === 0) continue;
          for (const cell of row) {
            if (cell !== undefined && cell !== null) {
              const str = cleanCandidateName(String(cell));
              if (!isIgnoredHeaderOrInvalid(str) && str.length >= 2) {
                extractedNames.push(str);
                break; // Take the first valid name per row
              }
            }
          }
        }
      } else {
        // .csv, .txt, or other text
        const text = await file.text();
        const lines = text.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Split by tab, semicolon or comma for CSV
          const cells = trimmed.split(/[\t;,]/).map(c => cleanCandidateName(c));
          let foundName = '';
          for (const cell of cells) {
            if (!isIgnoredHeaderOrInvalid(cell)) {
              foundName = cell;
              break;
            }
          }
          if (foundName) {
            extractedNames.push(foundName);
          } else {
            const single = cleanCandidateName(trimmed);
            if (!isIgnoredHeaderOrInvalid(single)) {
              extractedNames.push(single);
            }
          }
        }
      }

      // Filter and deduplicate names
      const validNames = Array.from(new Set(extractedNames.map(n => n.trim()))).filter(n => n.length >= 2);

      if (validNames.length === 0) {
        showToast('Không tìm thấy danh sách tên học sinh trong file. Vui lòng kiểm tra lại!', 'error');
        return;
      }

      // Batch add students with custom or default password
      const assignedPassword = defaultImportPassword.trim() || '123456';
      let count = 0;
      for (const name of validNames) {
        addStudentAccount({
          name,
          className: selectedClassForRoster.name,
          grade: selectedClassForRoster.grade,
          password: assignedPassword,
          score: 0,
          trees: 0,
          status: 'Chưa luyện tập',
          lastPractice: 'Chưa luyện tập'
        });
        count++;
      }

      const updatedAccounts = getStudentAccounts();
      setStudentsList(updatedAccounts);

      // Immediately update class studentCount (sĩ số)
      const currentClassStudents = updatedAccounts.filter(
        s => s.className.toLowerCase() === selectedClassForRoster.name.toLowerCase()
      );
      const updatedClass: TeacherClass = {
        ...selectedClassForRoster,
        studentCount: currentClassStudents.length
      };
      saveTeacherClass(updatedClass);
      setSelectedClassForRoster(updatedClass);
      setClassesList(getTeacherClasses());

      showToast(`Đã thêm thành công ${count} học sinh vào lớp!`, 'success');
      if (playSoundEffect) playSoundEffect('celebrate');
    } catch (err) {
      console.error('File import error:', err);
      showToast('Có lỗi xảy ra khi đọc file. Vui lòng kiểm tra định dạng!', 'error');
      if (playSoundEffect) playSoundEffect('fail');
    } finally {
      setIsImporting(false);
      if (studentImportFileInputRef.current) {
        studentImportFileInputRef.current.value = '';
      }
    }
  };

  // -------------------------------------------------------------
  // SECURITY GATE: REQUIRE TEACHER PASSWORD TO UNLOCK
  // -------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[#f0faf4] rounded-3xl max-w-md w-full p-6 sm:p-7 border-[3px] border-[#86c898] shadow-2xl relative flex flex-col gap-5">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer transition-colors"
            title="Đóng & Quay lại"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Icon & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0c4326] via-[#15803d] to-[#1cb55b] text-white flex items-center justify-center text-2xl shadow-md border-2 border-emerald-300 shrink-0">
              <Lock className="w-6 h-6 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
                Eco-Voice Security Gate
              </span>
              <h2 className="text-xl font-black text-emerald-950 font-display">
                Xác thực Mật khẩu Giáo viên
              </h2>
              <span className="text-xs text-emerald-800 font-medium">
                Teacher Dashboard & Admin Portal
              </span>
            </div>
          </div>

          <p className="text-xs text-emerald-900 leading-relaxed bg-[#e2f5e9] p-3 rounded-2xl border border-emerald-300">
            🔒 Khu vực bảo mật dành riêng cho Giáo viên & Quản trị viên. Học sinh không được phép truy cập. Vui lòng nhập mật khẩu giáo viên để tiếp tục.
          </p>

          {/* Form */}
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-emerald-950 block">
                Mật khẩu giáo viên:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  placeholder=""
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[#86c898] text-sm font-bold text-emerald-950 focus:outline-none focus:border-[#10b981] focus:ring-3 focus:ring-emerald-200 transition-all pr-11"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-emerald-700 hover:text-emerald-950 cursor-pointer"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinError && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-emerald-950 font-bold text-xs border border-emerald-300 cursor-pointer transition-all"
              >
                Hủy & Quay lại
              </button>

              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Unlock className="w-4 h-4" />
                <span>Mở khóa Quản trị</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#eef7f1] overflow-y-auto flex flex-col animate-in fade-in duration-200">
      
      {/* 1. TOP APP BAR */}
      <header className="sticky top-0 z-30 bg-[#f4fbf6]/95 backdrop-blur-md border-b-2 border-[#86c898] px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          {/* Logo & Header Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0c4326] via-[#15803d] to-[#1cb55b] text-white flex items-center justify-center text-xl shadow-md border-2 border-emerald-300 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-emerald-950 font-display">
                  Teacher Dashboard & Admin Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-emerald-950 shadow-2xs">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-emerald-800 font-medium">
                Hệ thống Quản lý lớp học, Giao bài luyện nói, Tùy biến hình ảnh & Phân quyền bài học
              </p>
            </div>
          </div>

          {/* Top Actions: Change Password, Logout & Close */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => {
                setShowChangePasswordModal(true);
                setOldPasswordInput('');
                setNewPasswordInput('');
                setConfirmPasswordInput('');
                setChangePasswordError(null);
                if (playSoundEffect) playSoundEffect('click');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold cursor-pointer transition-all shadow-2xs active:scale-95"
              title="Đổi mật khẩu Giáo viên / Admin"
            >
              <Key className="w-3.5 h-3.5 text-emerald-700" />
              <span>Đổi mật khẩu</span>
            </button>

            <button
              onClick={handleLogoutAndSwitchToStudent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              title="Khóa quản trị & chuyển sang học sinh"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Khóa & Thoát</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white text-xs sm:text-sm font-black shadow-sm cursor-pointer transition-all active:scale-98"
            >
              <X className="w-4 h-4" />
              <span>Quay lại học</span>
            </button>
          </div>

        </div>

        {/* 2. FIVE MAIN TABS BAR */}
        <div className="max-w-7xl mx-auto mt-3 border-t border-emerald-200/80 pt-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          
          {/* Tab 1: Overview */}
          <button
            onClick={() => {
              setActiveTab('overview');
              if (playSoundEffect) playSoundEffect('click');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#0c4326] to-[#1cb55b] text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-[#86c898]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-300" />
            <span>Overview (Tổng quan)</span>
          </button>

          {/* Tab 2: Classes */}
          <button
            onClick={() => {
              setActiveTab('classes');
              if (playSoundEffect) playSoundEffect('click');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'classes'
                ? 'bg-gradient-to-r from-[#0c4326] to-[#1cb55b] text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-[#86c898]'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Classes (Lớp học)</span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'classes' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {classesList.length}
            </span>
          </button>

          {/* Tab 3: Assignments */}
          <button
            onClick={() => {
              setActiveTab('assignments');
              if (playSoundEffect) playSoundEffect('click');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'assignments'
                ? 'bg-gradient-to-r from-[#0c4326] to-[#1cb55b] text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-[#86c898]'
            }`}
          >
            <FileCheck className="w-4 h-4 text-sky-600" />
            <span>Assignments (Giao bài)</span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'assignments' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
            }`}>
              {assignmentsList.length}
            </span>
          </button>

          {/* Tab 4: 🏆 Vinh danh & Thi đua */}
          <button
            onClick={() => {
              setActiveTab('honor');
              if (playSoundEffect) playSoundEffect('click');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'honor'
                ? 'bg-gradient-to-r from-[#0c4326] to-[#1cb55b] text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-[#86c898]'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>🏆 Vinh danh & Thi đua</span>
          </button>

          {/* Tab 4: Illustrations */}
          <button
            onClick={() => {
              setActiveTab('illustrations');
              if (playSoundEffect) playSoundEffect('click');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'illustrations'
                ? 'bg-gradient-to-r from-[#0c4326] to-[#1cb55b] text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-[#86c898]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-purple-600" />
            <span>Illustrations (Sửa ảnh từ & câu)</span>
            {totalCustomizations > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'illustrations' ? 'bg-white/20 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {totalCustomizations} đã sửa
              </span>
            )}
          </button>

          {/* Tab 5: Unit Access */}
          <button
            onClick={() => {
              setActiveTab('unit_access');
              if (playSoundEffect) playSoundEffect('click');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'unit_access'
                ? 'bg-gradient-to-r from-[#0c4326] to-[#1cb55b] text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-[#86c898]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Unit Access (Khóa/Mở bài)</span>
          </button>

        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs sm:text-sm font-bold ${
            notification.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-400'
              : notification.type === 'error'
              ? 'bg-rose-800 text-white border-rose-400'
              : 'bg-emerald-900 text-white border-emerald-500'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-5 flex-1">
        
        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW (TỔNG QUAN)                                     */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              
              <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#86c898] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Tổng số học sinh</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-display">
                    {totalStudents}
                  </span>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    {activeClassesCount > 0
                      ? `Đang hoạt động trong ${activeClassesCount} lớp học`
                      : `Phân bổ trên tổng số ${classesList.length} lớp học`}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#86c898] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Độ chuẩn phát âm</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-display">
                    {avgAccuracy}%
                  </span>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Đánh giá qua công nghệ Web Speech
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#86c898] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Tỷ lệ hoàn thành</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-display">
                    {avgCompletion}%
                  </span>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Tiến độ bài học trung bình
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#86c898] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Cây xanh đã trồng</span>
                  <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                    <Sprout className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-display">
                    {totalTreesPlanted} 🌳
                  </span>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Thưởng từ Eco Games & Luyện nói
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Action Shortcuts */}
            <div className="bg-gradient-to-r from-[#e3f7eb] via-[#d1fae5] to-[#c7f4d8] rounded-3xl p-5 border-[2px] border-[#86c898] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0c4326] text-white flex items-center justify-center text-2xl shadow-md border-2 border-emerald-300">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950">
                    Lối tắt Quản trị nhanh
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Truy cập nhanh các nghiệp vụ quản lý dành cho Giáo viên
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
                <button
                  onClick={() => {
                    setActiveTab('assignments');
                    setShowNewAssignmentModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#0c4326] hover:bg-[#115e37] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Giao bài tập mới</span>
                </button>

                <button
                  onClick={() => setActiveTab('illustrations')}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sửa ảnh từ vựng & câu</span>
                </button>

                <button
                  onClick={() => setActiveTab('unit_access')}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Khóa/Mở bài học</span>
                </button>
              </div>
            </div>

            {/* Classes Performance Summary Table */}
            <div className="bg-white rounded-3xl p-5 border-2 border-[#86c898] shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-emerald-950 font-display">
                    Bảng Tiến Độ & Xếp Hạng Các Lớp
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Tổng kết kết quả học tập và luyện phát âm của học sinh theo từng lớp
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('classes')}
                  className="text-xs font-black text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem chi tiết các lớp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Guest Data Isolation Note */}
              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Cơ chế cách ly dữ liệu Chế độ Khách (Guest Mode):</strong> Toàn bộ điểm số, lượt luyện nói và cây xanh khi khách trải nghiệm hệ thống được lưu riêng biệt, tuyệt đối <strong>không ghi đè hay làm ảnh hưởng đến báo cáo điểm số của Lớp 3A1</strong> hay bất kỳ lớp thực tế nào.
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 self-end sm:self-auto">
                  Isolated Data Protected
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-emerald-200 text-emerald-900 font-black uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Lớp</th>
                      <th className="py-2.5 px-3">Khối</th>
                      <th className="py-2.5 px-3">Sĩ số</th>
                      <th className="py-2.5 px-3">Giáo viên phụ trách</th>
                      <th className="py-2.5 px-3">Bài học hiện tại</th>
                      <th className="py-2.5 px-3">Độ chuẩn phát âm</th>
                      <th className="py-2.5 px-3">Cây xanh</th>
                      <th className="py-2.5 px-3 text-right">Tiến độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100 font-bold text-emerald-950">
                    {classesList.map(c => {
                      const cStudents = studentsList.filter(
                        s => s.className.toLowerCase() === c.name.toLowerCase()
                      );
                      const cCount = cStudents.length;
                      const cTrees = cStudents.reduce((acc, s) => acc + (s.trees || 0), 0);
                      const cAvg = calculateClassSpeakingAverage(cStudents);
                      const lessonInfo = getClassLessonInfo(c);
                      const cLesson = lessonInfo.unitName;
                      const cLessonName = lessonInfo.lessonName;
                      const cRate = getClassCompletionRate(c);

                      return (
                        <tr key={c.id} className="hover:bg-emerald-50/60 transition-colors">
                          <td className="py-3 px-3">
                            <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-black">
                              {c.name}
                            </span>
                          </td>
                          <td className="py-3 px-3">Lớp {c.grade}</td>
                          <td className="py-3 px-3">{cCount} em</td>
                          <td className="py-3 px-3 text-emerald-800">{c.teacherName}</td>
                          <td className="py-3 px-3">
                            {cLesson === 'Chưa giao bài' ? (
                              <span className="text-gray-400 italic font-medium">Chưa giao bài</span>
                            ) : (
                              <div className="flex flex-col">
                                <span className="font-semibold text-emerald-900">{cLesson}</span>
                                {cLessonName && (
                                  <span className="text-[10px] text-emerald-600 font-bold">{cLessonName}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {cCount === 0 ? (
                              <span className="text-gray-400 font-semibold italic">N/A</span>
                            ) : (
                              <span className="text-emerald-700 font-black">{cAvg}%</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span>{cTrees} 🌲</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {cCount === 0 ? (
                              <div className="flex items-center justify-end">
                                <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md italic">
                                  Chưa có dữ liệu học tập
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <span className={`font-black ${cRate > 0 ? 'text-emerald-800' : 'text-gray-400'}`}>
                                  {cRate}%
                                </span>
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-600 rounded-full transition-all duration-300" 
                                    style={{ width: `${cRate}%` }} 
                                  />
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CLASSES (QUẢN LÝ LỚP HỌC ĐỘNG)                          */}
        {/* ============================================================== */}
        {activeTab === 'classes' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            
            {/* Header row with Add Class Button & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-xs p-4 sm:p-5 rounded-3xl border border-emerald-200 shadow-2xs">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black text-emerald-950 font-display">
                    Quản lý danh sách Lớp học
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {classesList.length} lớp học
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-1">
                  Quản lý linh hoạt: Thêm lớp mới, chỉnh sửa thông tin hoặc xóa lớp. Dữ liệu được lưu trữ tự động trong LocalStorage.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {classesList.length === 0 && (
                  <button
                    onClick={handleResetClassesToDefault}
                    className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    title="Nạp lại danh sách các lớp mẫu mặc định"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Nạp lớp mẫu</span>
                  </button>
                )}
                <button
                  onClick={() => setShowNewClassModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm lớp học mới</span>
                </button>
              </div>
            </div>

            {/* Empty State */}
            {classesList.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-[#86c898] text-center flex flex-col items-center justify-center gap-3 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl shadow-inner">
                  🏫
                </div>
                <h3 className="text-lg font-black text-emerald-950">Chưa có lớp học nào trong danh sách</h3>
                <p className="text-xs text-emerald-700 max-w-md leading-relaxed">
                  Thầy/Cô hãy nhấn nút <strong>"+ Thêm lớp học mới"</strong> ở góc trên để tạo lớp học đầu tiên, hoặc nhấn nút bên dưới để khôi phục nhanh danh sách lớp học mẫu.
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => setShowNewClassModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0c4326] to-[#1cb55b] text-white text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer hover:brightness-110 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm lớp học mới</span>
                  </button>
                  <button
                    onClick={handleResetClassesToDefault}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Khôi phục danh sách lớp mẫu
                  </button>
                </div>
              </div>
            ) : (
              /* Classes Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classesList.map(cls => {
                  const classStudents = studentsList.filter(
                    s => s.className.toLowerCase() === cls.name.toLowerCase()
                  );
                  const classStudentCount = classStudents.length;
                  const classTrees = classStudents.reduce((acc, s) => acc + (s.trees || 0), 0);
                  const classAvgSpeaking = calculateClassSpeakingAverage(classStudents);

                  return (
                    <div 
                      key={cls.id}
                      className="bg-white rounded-3xl p-5 border-2 border-[#86c898] shadow-xs flex flex-col justify-between gap-4 hover:border-emerald-400 hover:shadow-md transition-all group relative"
                    >
                      {/* Card Header: Class name, Grade, and Action buttons (Edit & Delete) */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-800 text-white font-black text-sm">
                              Lớp {cls.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                              Khối {cls.grade}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-emerald-950 mt-1.5 flex items-center gap-1 truncate" title={cls.teacherName}>
                            <span className="text-xs">👩‍🏫</span>
                            <span>{cls.teacherName}</span>
                          </h3>
                          <p className="text-xs text-emerald-700 truncate mt-0.5">
                            {getClassLesson(cls) === 'Chưa giao bài' ? (
                              <span className="text-gray-400 italic">Chưa giao bài</span>
                            ) : (
                              <span className="font-semibold text-emerald-800">{getClassLesson(cls)}</span>
                            )}
                          </p>
                        </div>

                        {/* Action buttons on the corner of the card: Edit (✏️) and Delete (🗑️) */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-[#f0faf4] p-1 rounded-2xl border border-emerald-200 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleOpenEditClass(cls)}
                            className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-amber-100 text-amber-700 hover:text-amber-900 border border-emerald-200 hover:border-amber-400 transition-all cursor-pointer shadow-2xs"
                            title={`Sửa thông tin lớp ${cls.name}`}
                            aria-label={`Sửa lớp ${cls.name}`}
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingClass(cls)}
                            className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-emerald-200 hover:border-rose-400 transition-all cursor-pointer shadow-2xs"
                            title={`Xóa lớp ${cls.name}`}
                            aria-label={`Xóa lớp ${cls.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Class Stats Summary */}
                      <div className="grid grid-cols-3 gap-2 bg-[#f0faf4] p-3 rounded-2xl border border-emerald-200 text-center">
                        <div>
                          <span className="text-[10px] text-emerald-700 font-bold block">Sĩ số</span>
                          <span className="text-sm font-black text-emerald-950">{classStudentCount} em</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-700 font-bold block">Phát âm TB</span>
                          <span className="text-sm font-black text-emerald-700">
                            {classStudentCount === 0 ? 'N/A' : `${classAvgSpeaking}%`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-700 font-bold block">Cây xanh</span>
                          <span className="text-sm font-black text-emerald-950">{classTrees} 🌲</span>
                        </div>
                      </div>

                      {/* Actions: View Student Roster */}
                      <div className="flex items-center gap-2 pt-2 border-t border-emerald-100">
                        <button
                          onClick={() => setSelectedClassForRoster(cls)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Danh sách học sinh ({classStudentCount})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ASSIGNMENTS (GIAO BÀI & THỬ THÁCH)                       */}
        {/* ============================================================== */}
        {activeTab === 'assignments' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-emerald-950 font-display">
                  Quản lý Bài tập luyện nói & Thử thách
                </h2>
                <p className="text-xs text-emerald-800">
                  Giao nhiệm vụ luyện phát âm cho từng lớp, theo dõi hạn nộp và tiến độ hoàn thành
                </p>
              </div>

              <button
                onClick={() => setShowNewAssignmentModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0c4326] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Giao bài tập mới</span>
              </button>
            </div>

            {/* Assignments List & Empty State */}
            {assignmentsList.length === 0 ? (
              <div className="bg-white/80 rounded-3xl p-8 border-2 border-dashed border-[#86c898] text-center flex flex-col items-center justify-center gap-3 shadow-xs">
                <span className="text-5xl">📋</span>
                <div className="flex flex-col gap-1 max-w-md">
                  <h4 className="text-lg sm:text-xl font-black text-emerald-950 font-display">
                    No Assignments Created Yet
                  </h4>
                  <p className="text-xs sm:text-sm italic font-medium text-emerald-800">
                    Chưa có bài tập nào được tạo trong danh sách.
                  </p>
                </div>
                <div className="text-xs text-emerald-700 max-w-sm leading-relaxed">
                  <span className="block font-semibold">Assign speaking challenges or Eco Games to your classes.</span>
                  <span className="italic text-[11px]">Bấm vào nút bên dưới để tạo và giao bài tập mới cho học sinh.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewAssignmentModal(true);
                    if (playSoundEffect) playSoundEffect('click');
                  }}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white cursor-pointer transition-all shadow-sm flex flex-col items-center leading-tight active:scale-95"
                >
                  <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                    <Plus className="w-4 h-4" />
                    <span>Create Assignment</span>
                  </div>
                  <span className="text-[10px] italic font-medium text-emerald-100">Giao bài tập mới</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignmentsList.map(asg => {
                const subCount = asg.submittedCount || 0;
                // Đếm chính xác tổng sĩ số học sinh thực tế của các lớp được chọn nhận bài (Ví dụ: Lớp 4A3 có 1 học sinh -> 1 em, tuyệt đối không lấy 34)
                const realStudentsInTarget = studentsList.filter(s => isAssignmentForStudent(asg, s.className, s.grade)).length;
                const totalStudentsDisplay = realStudentsInTarget;
                const percent = (subCount > 0 && totalStudentsDisplay > 0) 
                  ? Math.min(100, Math.round((subCount / totalStudentsDisplay) * 100)) 
                  : 0;
                const info = getAssignmentDisplayInfo(asg);
                return (
                  <div 
                    key={asg.id}
                    className="bg-white rounded-3xl p-5 border-2 border-[#86c898] shadow-xs flex flex-col justify-between gap-4 hover:border-emerald-400 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${info.badgeColorClass}`}>
                            {info.badge}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500">
                            Khối {asg.grade} • {asg.targetClass}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-emerald-950 leading-snug">
                          {asg.title}
                        </h3>
                        {info.isGame && (
                          <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                            <span className="text-sm">{info.icon}</span>
                            <span>Trò chơi: <strong className="text-emerald-950 font-black">{info.gameName || asg.gameName}</strong></span>
                          </div>
                        )}
                        <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-2 flex-wrap">
                          <span>{asg.unitName}</span>
                          {asg.lessonName && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {asg.lessonName}
                            </span>
                          )}
                        </p>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                        +{asg.rewardEP} EP
                      </span>
                    </div>

                    {/* Progress Bar & Submissions */}
                    <div className="bg-[#f0faf4] p-3 rounded-2xl border border-emerald-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                        <span>Đã nộp bài:</span>
                        <span className="text-emerald-700 font-black">
                          {subCount}/{totalStudentsDisplay} em ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          Hạn nộp: {asg.dueDate}
                        </span>
                        <span className="text-emerald-600 font-bold">
                          {percent === 100 ? '✅ Hoàn thành' : '⏳ Đang diễn ra'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
                      <button
                        type="button"
                        onClick={() => setAssignmentToDelete(asg)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Xóa bài tập vĩnh viễn"
                        aria-label={`Xóa bài tập ${asg.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <span className="text-[11px] font-bold text-emerald-700">
                        Học sinh sẽ nhận thông báo trên bảng học
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: HONOR BOARD & LEADERBOARD (VINH DANH & THI ĐUA)           */}
        {/* ============================================================== */}
        {activeTab === 'honor' && (() => {
          const honorStudents = getHonorBoardStudents({
            scope: honorScope,
            timeRange: honorTimeRange
          });

          const top1 = honorStudents.find(s => s.rank === 1);
          const top2 = honorStudents.find(s => s.rank === 2);
          const top3 = honorStudents.find(s => s.rank === 3);

          const totalTrees = honorStudents.reduce((acc, s) => acc + (s.trees || 0), 0);
          const totalEP = honorStudents.reduce((acc, s) => acc + (s.ecoPoints || 0), 0);
          const practicedStudents = honorStudents.filter(s => (s.ecoPoints || 0) > 0 || (s.trees || 0) > 0 || (s.score || 0) > 0);
          const avgScore = practicedStudents.length > 0
            ? Math.round(practicedStudents.reduce((acc, s) => acc + (s.score || 0), 0) / practicedStudents.length)
            : 0;

          const getScopeName = () => {
            if (honorScope === 'all') return 'Toàn trường';
            if (honorScope === 'grade_3') return 'Khối 3';
            if (honorScope === 'grade_4') return 'Khối 4';
            if (honorScope === 'grade_5') return 'Khối 5';
            return `Lớp ${honorScope}`;
          };

          const handleExport = () => {
            if (playSoundEffect) playSoundEffect('celebrate');
            const timeLabel = honorTimeRange === 'week' ? 'Tuần này' : 'Tháng này';
            exportHonorBoardToExcel(honorStudents, getScopeName(), timeLabel);
            showToast(`Đã xuất Bảng Vinh Danh ${getScopeName()} (${timeLabel}) ra file Excel!`, 'success');
          };

          return (
            <div className="flex flex-col gap-5 animate-in fade-in duration-200">
              {/* Header and Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-sm">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-emerald-950 font-display flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
                    <span>🏆 Bảng Vinh Danh & Thi Đua Toàn Trường</span>
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Theo dõi bảng xếp hạng thi đua phát âm tiếng Anh, tích lũy Eco Points và vun trồng cây xanh
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleExport}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-900 hover:to-green-800 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all border border-emerald-600"
                  >
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>📥 Xuất Bảng Xếp Hạng (Excel/CSV)</span>
                  </button>
                </div>
              </div>

              {/* Filter Toolbar: Khối, Lớp, Toàn trường + Tuần này / Tháng này */}
              <div className="bg-[#f0faf4] p-3 rounded-2xl border-2 border-[#86c898] flex flex-wrap items-center justify-between gap-3">
                {/* Scope Filter Dropdown: Đồng bộ các Lớp thực tế từ Quản trị */}
                <div className="flex items-center gap-2">
                  <label htmlFor="teacher-honor-scope-select" className="text-xs font-black text-emerald-950 flex items-center gap-1.5 shrink-0">
                    <Filter className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Lọc theo:</span>
                  </label>

                  <div className="relative">
                    <select
                      id="teacher-honor-scope-select"
                      value={honorScope}
                      onChange={(e) => {
                        setHonorScope(e.target.value);
                        if (playSoundEffect) playSoundEffect('click');
                      }}
                      className="appearance-none bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs py-1.5 pl-3 pr-8 rounded-xl border-2 border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <option value="all">Toàn trường</option>
                      <option value="grade_3">Khối 3</option>
                      <option value="grade_4">Khối 4</option>
                      <option value="grade_5">Khối 5</option>
                      {classesList.map((cls) => (
                        <option key={cls.id} value={cls.name}>
                          {cls.name.startsWith('Lớp') ? cls.name : `Lớp ${cls.name}`}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-800">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Time Range Switch */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-emerald-300">
                  <span className="text-xs font-bold text-emerald-900 pl-1.5">
                    Thời gian:
                  </span>
                  <button
                    onClick={() => {
                      setHonorTimeRange('week');
                      if (playSoundEffect) playSoundEffect('click');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      honorTimeRange === 'week'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-emerald-900 hover:text-emerald-950'
                    }`}
                  >
                    Tuần này
                  </button>
                  <button
                    onClick={() => {
                      setHonorTimeRange('month');
                      if (playSoundEffect) playSoundEffect('click');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      honorTimeRange === 'month'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-emerald-900 hover:text-emerald-950'
                    }`}
                  >
                    Tháng này
                  </button>
                </div>
              </div>

              {/* Statistics Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-2xs flex flex-col">
                  <span className="text-[11px] font-bold text-emerald-800">Học sinh xếp hạng</span>
                  <span className="text-xl font-black text-emerald-950 mt-1">{honorStudents.length}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{getScopeName()}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-2xs flex flex-col">
                  <span className="text-[11px] font-bold text-emerald-800">Tổng cây xanh 🌲</span>
                  <span className="text-xl font-black text-emerald-950 mt-1">{totalTrees} cây</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{honorTimeRange === 'week' ? 'Tuần này' : 'Tháng này'}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-2xs flex flex-col">
                  <span className="text-[11px] font-bold text-emerald-800">Tổng Eco Points ⚡</span>
                  <span className="text-xl font-black text-amber-700 mt-1">{totalEP} EP</span>
                  <span className="text-[10px] text-amber-600 font-semibold">Tích lũy thi đua</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-2xs flex flex-col">
                  <span className="text-[11px] font-bold text-emerald-800">Điểm phát âm TB</span>
                  <span className="text-xl font-black text-emerald-950 mt-1">{avgScore}%</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Toàn bộ danh sách</span>
                </div>
              </div>

              {/* Top 3 Podium for Teachers */}
              <div className="bg-gradient-to-b from-[#e3f7ec] to-white rounded-3xl p-4 sm:p-6 border-2 border-emerald-300 shadow-sm flex items-center justify-center min-h-[180px]">
                {(!top1 || top1.ecoPoints === 0 || honorStudents.length === 0) ? (
                  <div className="w-full py-8 px-4 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-emerald-300 flex items-center justify-center text-3xl mb-3 shadow-xs ring-4 ring-emerald-100">
                      🌱
                    </div>
                    <div className="flex flex-col gap-1 max-w-md">
                      <h4 className="font-extrabold text-base sm:text-lg text-emerald-950 font-display">
                        No Accumulation Points Yet
                      </h4>
                      <p className="text-xs sm:text-sm italic font-medium text-emerald-800">
                        Chưa có học sinh nào đạt điểm tích lũy trong khoảng thời gian này
                      </p>
                    </div>
                    <div className="text-xs text-emerald-700 max-w-md mt-1 leading-relaxed">
                      <span className="block font-semibold">The Honor Board displays students with Eco Points (EP &gt; 0).</span>
                      <span className="italic text-[11px]">Bảng vinh danh chỉ hiển thị học sinh có điểm tích lũy EP &gt; 0. Khi học sinh luyện phát âm hoặc hoàn thành bài tập, hệ thống sẽ tự động cập nhật bảng vinh danh tại đây.</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex items-end justify-center gap-3 sm:gap-6 pt-6">
                    {/* Rank 2 */}
                    {top2 && (top2.ecoPoints > 0 || top2.trees > 0) ? (
                      <div className="flex-1 flex flex-col items-center max-w-[200px] text-center">
                        <div className="relative mb-2">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-3xl shadow-md">
                            {top2.avatar}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-500 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                            2
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-emerald-950 truncate max-w-full">
                          {top2.name}
                        </h4>
                        <span className="text-[11px] text-emerald-700 font-bold mb-1">
                          Lớp {top2.className ? top2.className.replace(/^Lớp\s+/i, '').replace(/^\$/, '').trim() : ''}
                        </span>
                        <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 rounded-2xl p-2.5 sm:p-3 border-t-2 border-slate-300 flex flex-col items-center justify-center h-28 sm:h-32 shadow-xs">
                          <div className="flex items-center gap-1 text-slate-800 font-black text-sm">
                            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>{top2.ecoPoints} EP</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-900 font-bold text-xs mt-0.5">
                            <span>{top2.trees} 🌲 cây</span>
                          </div>
                          <span className="text-[10px] font-black uppercase text-slate-700 mt-1">
                            Á quân Sinh thái
                          </span>
                        </div>
                      </div>
                    ) : <div className="flex-1" />}

                    {/* Rank 1 */}
                    {top1 && (top1.ecoPoints > 0 || top1.trees > 0) ? (
                      <div className="flex-1 flex flex-col items-center max-w-[220px] text-center -mt-6">
                        <div className="relative mb-2 animate-bounce-subtle">
                          <Crown className="w-8 h-8 text-amber-500 fill-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 drop-shadow-md" />
                          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-amber-100 border-3 border-amber-400 flex items-center justify-center text-4xl sm:text-5xl shadow-lg ring-4 ring-amber-300/40">
                            {top1.avatar}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-emerald-950 font-black text-sm flex items-center justify-center border-2 border-white shadow-md">
                            1
                          </span>
                        </div>
                        <h4 className="font-black text-base text-emerald-950 truncate max-w-full font-display">
                          {top1.name}
                        </h4>
                        <span className="text-xs text-amber-900 font-black mb-1">
                          Lớp {top1.className ? top1.className.replace(/^Lớp\s+/i, '').replace(/^\$/, '').trim() : ''} • Khối {top1.grade}
                        </span>
                        <div className="w-full bg-gradient-to-t from-amber-300/90 via-amber-200 to-amber-100 rounded-2xl p-3 sm:p-4 border-t-3 border-amber-400 flex flex-col items-center justify-center h-36 sm:h-40 shadow-md">
                          <div className="flex items-center gap-1 text-amber-950 font-black text-base">
                            <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                            <span>{top1.ecoPoints} EP</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-950 font-black text-sm mt-0.5">
                            <span>{top1.trees} 🌲 cây</span>
                          </div>
                          <span className="text-[11px] font-black uppercase text-amber-900 bg-amber-400/60 px-2.5 py-0.5 rounded-full mt-1.5 shadow-2xs">
                            🏆 Quán quân Xanh
                          </span>
                        </div>
                      </div>
                    ) : <div className="flex-1" />}

                    {/* Rank 3 */}
                    {top3 && (top3.ecoPoints > 0 || top3.trees > 0) ? (
                      <div className="flex-1 flex flex-col items-center max-w-[200px] text-center">
                        <div className="relative mb-2">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-50 border-2 border-amber-600/50 flex items-center justify-center text-3xl shadow-md">
                            {top3.avatar}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                            3
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-emerald-950 truncate max-w-full">
                          {top3.name}
                        </h4>
                        <span className="text-[11px] text-emerald-700 font-bold mb-1">
                          Lớp {top3.className ? top3.className.replace(/^Lớp\s+/i, '').replace(/^\$/, '').trim() : ''}
                        </span>
                        <div className="w-full bg-gradient-to-t from-orange-200 to-amber-100 rounded-2xl p-2.5 sm:p-3 border-t-2 border-amber-600 flex flex-col items-center justify-center h-24 sm:h-28 shadow-xs">
                          <div className="flex items-center gap-1 text-amber-950 font-black text-sm">
                            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>{top3.ecoPoints} EP</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-900 font-bold text-xs mt-0.5">
                            <span>{top3.trees} 🌲 cây</span>
                          </div>
                          <span className="text-[10px] font-black uppercase text-amber-800 mt-1">
                            Ngôi sao Phát âm
                          </span>
                        </div>
                      </div>
                    ) : <div className="flex-1" />}
                  </div>
                )}
              </div>

              {/* Full Leaderboard Table */}
              <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm overflow-hidden">
                <div className="p-3.5 bg-emerald-50/80 border-b border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-emerald-700" />
                    <span className="font-black text-sm text-emerald-950">
                      Bảng xếp hạng chi tiết - {getScopeName()} ({honorTimeRange === 'week' ? 'Tuần này' : 'Tháng này'})
                    </span>
                  </div>
                  <span className="text-xs text-emerald-800 font-bold">
                    Tổng cộng: {honorStudents.length} học sinh
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f0faf4] text-emerald-950 font-black border-b border-emerald-200">
                      <tr>
                        <th className="py-2.5 px-3 text-center">Hạng</th>
                        <th className="py-2.5 px-3">Học sinh</th>
                        <th className="py-2.5 px-3 text-center">Lớp</th>
                        <th className="py-2.5 px-3 text-center">Khối</th>
                        <th className="py-2.5 px-3 text-center">Điểm phát âm</th>
                        <th className="py-2.5 px-3 text-center">Cây xanh 🌲</th>
                        <th className="py-2.5 px-3 text-center">Eco Points ⚡</th>
                        <th className="py-2.5 px-3">Danh hiệu thi đua</th>
                        <th className="py-2.5 px-3 text-right">Luyện tập gần nhất</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100 font-medium">
                      {honorStudents.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-10 text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="text-2xl">🌱</span>
                              <span className="font-extrabold text-xs sm:text-sm text-emerald-950 font-display">
                                No Ranking Data Recorded
                              </span>
                              <span className="text-[11px] italic font-medium text-emerald-800">
                                Chưa có học sinh nào đạt điểm tích lũy trong khoảng thời gian này
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        honorStudents.map((st) => {
                          const isTop1 = st.rank === 1;
                          const isTop2 = st.rank === 2;
                          const isTop3 = st.rank === 3;

                          return (
                            <tr
                              key={st.id}
                              className={`hover:bg-emerald-50/60 transition-colors ${
                                isTop1 ? 'bg-amber-50/40' : isTop2 ? 'bg-slate-50/40' : isTop3 ? 'bg-orange-50/30' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${
                                  isTop1 
                                    ? 'bg-amber-400 text-emerald-950 shadow-xs' 
                                    : isTop2 
                                    ? 'bg-slate-300 text-slate-900 shadow-xs' 
                                    : isTop3 
                                    ? 'bg-amber-600 text-white shadow-xs' 
                                    : 'bg-emerald-100 text-emerald-900'
                                }`}>
                                  {st.rank}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-extrabold text-emerald-950">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-xs shadow-2xs">
                                    {st.avatar}
                                  </span>
                                  <span>{st.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                                  {st.className}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-emerald-900">
                                Khối {st.grade}
                              </td>
                              <td className="py-2.5 px-3 text-center font-black text-emerald-950">
                                {st.score > 0 ? `${st.score}%` : '0%'}
                              </td>
                              <td className="py-2.5 px-3 text-center font-black text-emerald-950">
                                {st.trees} cây
                              </td>
                              <td className="py-2.5 px-3 text-center font-black text-amber-700">
                                <span className="inline-flex items-center gap-0.5">
                                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                  <span>{st.ecoPoints} EP</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-bold text-emerald-800">
                                {st.titleBadge}
                              </td>
                              <td className="py-2.5 px-3 text-right text-emerald-700 text-[11px]">
                                {st.lastPractice}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ============================================================== */}
        {/* TAB 4: ILLUSTRATIONS (BIÊN TẬP HÌNH ẢNH & NỘI DUNG)              */}
        {/* ============================================================== */}
        {activeTab === 'illustrations' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-emerald-950 font-display">
                  Quản lý & Biên tập Bài học (Lesson Management)
                </h2>
                <p className="text-xs text-emerald-800">
                  Thêm bài học/từ vựng mới, chỉnh sửa nội dung/hình ảnh, hoặc xóa bài học tùy chỉnh
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setAddLessonGrade(selectedGrade);
                    setAddLessonUnitKey(selectedUnitKey);
                    setShowAddLessonModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white text-xs font-black cursor-pointer transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Từ vựng / Câu mới</span>
                </button>

                {totalCustomizations > 0 && (
                  <button
                    onClick={handleResetAll}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục mặc định</span>
                  </button>
                )}
              </div>
            </div>

            {/* FILTER & SELECTOR CARD */}
            <section className="bg-white rounded-3xl p-4 sm:p-5 border-[2px] border-[#86c898] shadow-sm flex flex-col gap-4">
              
              {/* Row 1: Grade Selectors (3, 4, 5) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-emerald-950 tracking-wider">
                    Khối lớp:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(['3', '4', '5'] as const).map(g => (
                      <button
                        key={g}
                        onClick={() => {
                          setSelectedGrade(g);
                          if (playSoundEffect) playSoundEffect('click');
                        }}
                        className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm cursor-pointer transition-all ${
                          selectedGrade === g
                            ? 'bg-gradient-to-r from-[#0c4326] to-[#1cb55b] text-white shadow-xs scale-105'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        Grade {g} (Lớp {g})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{gradeData?.gradeTitle || 'Tiếng Anh Global Success'}</span>
                </div>
              </div>

              {/* Row 2: Unit Selector & Search & Filters */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                <div className="md:col-span-5 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chọn bài học (Unit):</span>
                  </label>
                  <select
                    value={selectedUnitKey}
                    onChange={(e) => {
                      setSelectedUnitKey(e.target.value);
                      if (playSoundEffect) playSoundEffect('click');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 border-2 border-[#86c898] text-xs font-extrabold text-emerald-950 focus:outline-none focus:border-[#10b981] transition-all cursor-pointer"
                  >
                    {unitsList.map(u => (
                      <option key={u.unitKey} value={u.unitKey}>
                        {u.unitFullName}: {u.theme || u.unitName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-4 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tìm kiếm từ hoặc câu:</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Gõ từ (orange, cat, eraser...)..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 placeholder:text-emerald-400 focus:outline-none focus:border-[#10b981]"
                    />
                    <Search className="w-3.5 h-3.5 text-emerald-500 absolute left-2.5 top-2.5 pointer-events-none" />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-2 p-0.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bộ lọc hiển thị:</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {(['all', 'vocab', 'sentence'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setFilterType(t)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                          filterType === t
                            ? 'bg-emerald-800 text-white shadow-2xs'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {t === 'all' ? 'Tất cả' : t === 'vocab' ? 'Từ vựng' : 'Mẫu câu'}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Quick toggle: Only customized items */}
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 pt-2 border-t border-emerald-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyCustomized}
                    onChange={(e) => setOnlyCustomized(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm border-emerald-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Chỉ hiển thị các mục đã tùy chỉnh hình ảnh</span>
                </label>
                <span className="text-[11px] text-emerald-700">
                  Đang hiển thị {filteredItems.length} mục trong {currentUnit?.unitFullName}
                </span>
              </div>

            </section>

            {/* ITEMS LIST GRID */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-emerald-300 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl">
                  🔍
                </div>
                <h3 className="text-base font-black text-emerald-950">
                  Không tìm thấy mục nào phù hợp
                </h3>
                <p className="text-xs text-emerald-800 max-w-md">
                  {onlyCustomized 
                    ? 'Chưa có từ vựng hoặc câu mẫu nào trong Unit này được tùy chỉnh hình ảnh.' 
                    : 'Thầy/Cô hãy thử đổi từ khóa tìm kiếm hoặc chọn Unit khác.'}
                </p>
                {onlyCustomized && (
                  <button
                    onClick={() => setOnlyCustomized(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 cursor-pointer transition-colors"
                  >
                    Hiển thị tất cả từ vựng & câu của Unit
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => {
                  const isCustomized = Boolean(item.customData);
                  const customImg = item.customData?.imageUrl;
                  const customIcon = item.customData?.customIcon;

                  return (
                    <div
                      key={`${item.type}_${item.id}`}
                      className={`bg-white rounded-3xl p-4 border-2 transition-all shadow-xs flex flex-col justify-between gap-3 relative overflow-hidden group ${
                        isCustomized 
                          ? 'border-[#10b981] ring-2 ring-emerald-200/60 bg-gradient-to-b from-emerald-50/40 to-white' 
                          : 'border-[#86c898]/80 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.type === 'vocab' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-sky-100 text-sky-800 border border-sky-300'
                          }`}>
                            {item.type === 'vocab' ? 'Vocabulary' : 'Sentence'}
                          </span>
                          {item.lesson && (
                            <span className="text-[10px] font-bold text-gray-500">
                              {item.lesson}
                            </span>
                          )}
                        </div>

                        {isCustomized ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                            <Check className="w-3 h-3" />
                            <span>Đã tùy chỉnh ảnh</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600">
                            Ảnh chuẩn GD
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3.5 my-1">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                          {customImg ? (
                            <img 
                              src={customImg} 
                              alt={item.wordOrSentence} 
                              className="w-full h-full object-contain p-1 rounded-xl"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-4xl sm:text-5xl select-none">
                              {customIcon || item.defaultIcon || '🌱'}
                            </span>
                          )}

                          {customImg && (
                            <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white p-0.5 rounded-md">
                              <ImageIcon className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-black text-emerald-950 leading-snug break-words">
                            {item.wordOrSentence}
                          </h3>
                          {item.phonetic && (
                            <span className="text-xs font-mono font-semibold text-emerald-700">
                              {item.phonetic}
                            </span>
                          )}
                          <p className="text-xs font-bold text-emerald-800 mt-1 line-clamp-2">
                            {item.meaning}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-emerald-100">
                        <button
                          onClick={() => {
                            setEditingItem({
                              id: item.id,
                              type: item.type,
                              wordOrSentence: item.wordOrSentence,
                              phonetic: item.phonetic,
                              meaning: item.meaning,
                              lesson: item.lesson,
                              unitKey: item.unitKey,
                              unitName: item.unitName,
                              defaultIcon: item.defaultIcon,
                              defaultColorHex: item.defaultColorHex
                            });
                            setInputImageUrl(item.customData?.imageUrl || '');
                            setInputCustomIcon(item.customData?.customIcon || '');
                            setPreviewError(false);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isCustomized ? 'Chỉnh sửa' : 'Chỉnh sửa ảnh'}</span>
                        </button>

                        {(isCustomized || (item as any).isCustomAdded) && (
                          <button
                            onClick={() => handleDeleteLessonItem(item.id, item.wordOrSentence, (item as any).isCustomAdded)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer transition-colors"
                            title={(item as any).isCustomAdded ? "Xóa bài học này" : "Khôi phục ảnh mặc định"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: UNIT ACCESS (PHÂN QUYỀN & KHÓA/MỞ BÀI HỌC)               */}
        {/* ============================================================== */}
        {activeTab === 'unit_access' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-emerald-950 font-display">
                  Phân quyền & Khóa / Mở bài học (Unit Access)
                </h2>
                <p className="text-xs text-emerald-800">
                  Điều phối tiến độ học tập: Mở các Unit theo tuần, quản lý Thêm/Sửa/Xóa Unit và tạm khóa Unit
                </p>
              </div>

              {/* Add Unit & Unlock All / Lock All */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const nextNum = unitsList.length + 1;
                    setEditingUnitObj(null);
                    setUnitFormNumber(nextNum);
                    setUnitFormName('');
                    setUnitFormFullName(`Unit ${nextNum}: `);
                    setUnitFormTheme('');
                    setUnitFormUnlocked(true);
                    setShowAddEditUnitModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white text-xs font-black cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Unit mới</span>
                </button>

                <button
                  onClick={() => handleSetAllUnits(true)}
                  className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 text-xs font-bold cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5 inline mr-1" />
                  <span>Mở tất cả Unit</span>
                </button>

                <button
                  onClick={() => handleSetAllUnits(false)}
                  className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 text-xs font-bold cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 inline mr-1" />
                  <span>Khóa toàn bộ</span>
                </button>
              </div>
            </div>

            {/* Grade Switcher */}
            <div className="bg-white rounded-3xl p-4 border-2 border-[#86c898] shadow-xs flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-emerald-950">Chọn khối lớp áp dụng phân quyền & quản lý Unit:</span>
              <div className="flex items-center gap-2">
                {(['3', '4', '5'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className={`px-4 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all ${
                      selectedGrade === g
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    Grade {g} (Lớp {g})
                  </button>
                ))}
              </div>
            </div>

            {/* Units Grid with Lock/Unlock Switches, Edit and Delete */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {unitsList.map(u => {
                const isUnitUnlocked = unitPermissions[`${selectedGrade}_${u.unitKey}`] !== undefined
                  ? unitPermissions[`${selectedGrade}_${u.unitKey}`]
                  : (u.unitNumber <= 8);

                return (
                  <div
                    key={u.unitKey}
                    className={`p-4 rounded-3xl border-2 transition-all shadow-xs flex flex-col justify-between gap-3 ${
                      isUnitUnlocked 
                        ? 'bg-white border-[#86c898]' 
                        : 'bg-gray-50/80 border-gray-300 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase text-emerald-700">
                            Unit {u.unitNumber}
                          </span>
                          {u.isCustomAdded && (
                            <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Mới tạo
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-emerald-950 leading-snug truncate">
                          {u.unitName}
                        </h4>
                        <p className="text-[11px] text-emerald-800 font-semibold line-clamp-1 mt-0.5">
                          {u.theme}
                        </p>
                      </div>

                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnitUnlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isUnitUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-100 gap-1">
                      <span className={`text-[11px] font-black shrink-0 ${
                        isUnitUnlocked ? 'text-emerald-700' : 'text-gray-500'
                      }`}>
                        {isUnitUnlocked ? 'Đang mở' : 'Tạm khóa'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleUnit(u.unitKey, isUnitUnlocked)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-black cursor-pointer transition-all ${
                            isUnitUnlocked
                              ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                              : 'bg-emerald-700 text-white hover:bg-emerald-800'
                          }`}
                        >
                          {isUnitUnlocked ? 'Khóa' : 'Mở khóa'}
                        </button>

                        <button
                          onClick={() => {
                            setEditingUnitObj(u);
                            setUnitFormNumber(u.unitNumber || 1);
                            setUnitFormName(u.unitName || '');
                            setUnitFormFullName(u.unitFullName || '');
                            setUnitFormTheme(u.theme || '');
                            setUnitFormUnlocked(isUnitUnlocked);
                            setShowAddEditUnitModal(true);
                          }}
                          className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer transition-colors"
                          title="Chỉnh sửa thông tin Unit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteUnit(u.unitKey, u.unitFullName || u.unitName)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer transition-colors"
                          title="Xóa Unit khỏi danh sách"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* MODAL: EDIT VISUAL (ILLUSTRATIONS TAB)                         */}
      {/* ============================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#f0faf4] rounded-3xl max-w-xl w-full p-5 sm:p-6 border-[3px] border-[#86c898] shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-3 border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center border border-emerald-300 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-emerald-950 font-display">
                    Tùy chỉnh hình ảnh minh họa
                  </h3>
                  <p className="text-xs text-emerald-800 font-semibold">
                    {editingItem.unitName} • {editingItem.lesson || 'Chung'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-emerald-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600">
                  {editingItem.type === 'vocab' ? 'Từ vựng tiếng Anh' : 'Mẫu câu thực hành'}
                </span>
                <h4 className="text-lg font-black text-emerald-950">
                  {editingItem.wordOrSentence}
                </h4>
                <p className="text-xs text-emerald-800 font-bold">
                  {editingItem.meaning}
                </p>
              </div>

              {PRESET_IMAGE_SUGGESTIONS[editingItem.wordOrSentence.toUpperCase()] && (
                <button
                  type="button"
                  onClick={() => {
                    setInputImageUrl(PRESET_IMAGE_SUGGESTIONS[editingItem.wordOrSentence.toUpperCase()]);
                    setPreviewError(false);
                    showToast('Đã áp dụng đường dẫn ảnh chuẩn chất lượng cao!', 'info');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 text-[11px] font-black flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ảnh chuẩn gợi ý</span>
                </button>
              )}
            </div>

            {/* Input URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-emerald-600" />
                <span>Cách 1: Nhập đường dẫn URL hình ảnh mới:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={inputImageUrl}
                  onChange={(e) => {
                    setInputImageUrl(e.target.value);
                    setPreviewError(false);
                  }}
                  placeholder="https://example.com/orange-fruit.jpg..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#86c898] text-xs font-bold text-emerald-950 placeholder:text-emerald-400 focus:outline-none focus:border-[#10b981]"
                />
                {inputImageUrl && (
                  <button
                    type="button"
                    onClick={() => setInputImageUrl('')}
                    className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>

            {/* Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Cách 2: Tải ảnh từ máy tính hoặc điện thoại:</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50 border-2 border-dashed border-emerald-400 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Bấm vào đây để chọn tệp ảnh từ thiết bị (PNG, JPG, WebP, SVG)</span>
              </button>
            </div>

            {/* Emoji */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <span>🎨 Cách 3: Hoặc đổi biểu tượng Emoji minh họa:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputCustomIcon}
                  onChange={(e) => setInputCustomIcon(e.target.value)}
                  placeholder="Nhập emoji (🍊, 🐅, 🤖, 🎨)..."
                  className="w-44 px-3 py-2 rounded-xl bg-white border border-[#86c898] text-sm font-bold text-emerald-950 placeholder:text-emerald-400 focus:outline-none focus:border-[#10b981]"
                />
                <div className="flex items-center gap-1.5">
                  {['🍊', '🐅', '🐘', '🐊', '🦓', '🤖', '🌸', '🌳'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setInputCustomIcon(emoji)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-emerald-100 border border-emerald-200 text-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-300 flex flex-col items-center gap-2">
              <span className="text-[11px] font-black uppercase text-emerald-900 tracking-wider">
                Xem trước giao diện học sinh:
              </span>

              <div className="w-36 h-36 rounded-2xl bg-white border-2 border-emerald-300 shadow-sm flex items-center justify-center overflow-hidden p-2 relative">
                {inputImageUrl ? (
                  <img
                    src={inputImageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-xl"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <span className="text-6xl select-none">
                    {inputCustomIcon || editingItem.defaultIcon || '🌱'}
                  </span>
                )}

                {previewError && (
                  <div className="absolute inset-0 bg-rose-50/90 flex flex-col items-center justify-center p-2 text-center text-rose-700 text-xs font-bold">
                    <AlertCircle className="w-5 h-5 mb-1" />
                    <span>Không tải được ảnh từ URL này.</span>
                  </div>
                )}
              </div>

              <span className="text-xs font-extrabold text-emerald-950 mt-1">
                {editingItem.wordOrSentence} ({editingItem.meaning})
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-emerald-900 border border-emerald-300 font-black text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi (LocalStorage)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE NEW ASSIGNMENT (TAB 3)                            */}
      {/* ============================================================== */}
      {showNewAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleCreateAssignment}
            className="bg-[#f0faf4] rounded-3xl max-w-lg w-full p-5 sm:p-6 border-[3px] border-[#86c898] shadow-2xl relative flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base sm:text-lg font-black text-emerald-950 font-display">
                  Giao bài tập luyện nói mới
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowNewAssignmentModal(false)}
                className="p-1 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-emerald-950">Tiêu đề nhiệm vụ:</label>
              <input
                type="text"
                required
                value={asgTitle}
                onChange={(e) => setAsgTitle(e.target.value)}
                placeholder="Ví dụ: Luyện phát âm 10 từ vựng Unit 9 Colours..."
                className="px-3.5 py-2.5 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">Khối lớp:</label>
                <select
                  value={asgGrade}
                  onChange={(e) => {
                    const nextG = e.target.value as '3' | '4' | '5';
                    setAsgGrade(nextG);
                    // Bắt buộc đồng bộ ô 'Lớp nhận bài' về mặc định khi chuyển khối
                    setAsgClass('Tất cả các lớp');
                    const units = getUnitsForGrade(nextG);
                    if (units.length > 0) {
                      setAsgUnitKey(units[0].unitKey);
                      if (!asgTitle || asgTitle.startsWith('Luyện tập ')) {
                        setAsgTitle(`Luyện tập ${units[0].unitFullName} - ${asgLesson}`);
                      }
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                >
                  <option value="3">Grade 3 (Lớp 3)</option>
                  <option value="4">Grade 4 (Lớp 4)</option>
                  <option value="5">Grade 5 (Lớp 5)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">Lớp nhận bài:</label>
                <select
                  value={asgClass}
                  onChange={(e) => setAsgClass(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                >
                  <option value="Tất cả các lớp">Tất cả các lớp trong khối</option>
                  {classesForSelectedGrade.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name.startsWith('Lớp ') ? c.name : `Lớp ${c.name}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* BỔ SUNG 2 Ô CHỌN THẢ XUỐNG: UNIT & LESSON (THEO YÊU CẦU NGƯỜI DÙNG) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="text-sm">📖</span>
                  <span>Chọn Unit:</span>
                </label>
                <select
                  value={asgUnitKey}
                  onChange={(e) => {
                    const selectedKey = e.target.value;
                    setAsgUnitKey(selectedKey);
                    const units = getUnitsForGrade(asgGrade);
                    const matched = units.find(u => u.unitKey === selectedKey);
                    if (matched && (!asgTitle || asgTitle.startsWith('Luyện tập '))) {
                      setAsgTitle(`Luyện tập ${matched.unitFullName} - ${asgLesson}`);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                >
                  {getUnitsForGrade(asgGrade).map((u) => (
                    <option key={u.unitKey} value={u.unitKey}>
                      {u.unitFullName || `Unit ${u.unitNumber}: ${u.unitName}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="text-sm">🎯</span>
                  <span>Chọn Bài học (Lesson):</span>
                </label>
                <select
                  value={asgLesson}
                  onChange={(e) => {
                    const selectedLesson = e.target.value;
                    setAsgLesson(selectedLesson);
                    const units = getUnitsForGrade(asgGrade);
                    const matched = units.find(u => u.unitKey === asgUnitKey);
                    if (matched && (!asgTitle || asgTitle.startsWith('Luyện tập '))) {
                      setAsgTitle(`Luyện tập ${matched.unitFullName} - ${selectedLesson}`);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                >
                  <option value="Lesson 1">Lesson 1</option>
                  <option value="Lesson 2">Lesson 2</option>
                  <option value="All lessons">All lessons</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">Loại bài tập:</label>
                <select
                  value={asgType}
                  onChange={(e) => setAsgType(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                >
                  {ASSIGNMENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">Hạn nộp bài:</label>
                <input
                  type="date"
                  value={asgDueDate}
                  onChange={(e) => setAsgDueDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-emerald-950">Điểm thưởng Eco Points khi hoàn thành:</label>
              <div className="flex items-center gap-3">
                {[20, 30, 50, 100].map(ep => (
                  <button
                    key={ep}
                    type="button"
                    onClick={() => setAsgRewardEP(ep)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                      asgRewardEP === ep 
                        ? 'bg-emerald-800 text-white' 
                        : 'bg-white text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    +{ep} EP
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewAssignmentModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white text-emerald-900 border border-emerald-300 font-bold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0c4326] to-[#1cb55b] text-white font-black text-xs shadow-md"
              >
                Giao bài tập
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD CLASS (TAB 2)                                       */}
      {/* ============================================================== */}
      {showNewClassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleCreateClass}
            className="bg-[#f0faf4] rounded-3xl max-w-md w-full p-5 sm:p-6 border-[3px] border-[#86c898] shadow-2xl relative flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base font-black text-emerald-950 font-display">
                  Thêm Lớp học mới
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowNewClassModal(false)}
                className="p-1 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-emerald-950">Tên lớp:</label>
              <input
                type="text"
                required
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Ví dụ: 3A3, 4A3, 5A3..."
                className="px-3.5 py-2.5 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">Khối lớp:</label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950"
                >
                  <option value="3">Khối 3</option>
                  <option value="4">Khối 4</option>
                  <option value="5">Khối 5</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">Sĩ số (học sinh):</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newClassCount}
                  onChange={(e) => setNewClassCount(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-emerald-950">Giáo viên bộ môn phụ trách:</label>
              <input
                type="text"
                value={newClassTeacher}
                onChange={(e) => setNewClassTeacher(e.target.value)}
                placeholder="Ví dụ: Cô Trần Thanh..."
                className="px-3.5 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewClassModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white text-emerald-900 border border-emerald-300 font-bold text-xs hover:bg-gray-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white font-black text-xs shadow-md cursor-pointer"
              >
                + Tạo lớp học
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT CLASS (TAB 2)                                      */}
      {/* ============================================================== */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleSaveEditClass}
            className="bg-[#f0faf4] rounded-3xl max-w-md w-full p-5 sm:p-6 border-[3px] border-[#86c898] shadow-2xl relative flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950 font-display">
                    Sửa thông tin Lớp {editingClass.name}
                  </h3>
                  <span className="text-[11px] text-emerald-700">Cập nhật tên lớp, khối lớp, sĩ số & giáo viên</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingClass(null)}
                className="p-1 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-emerald-950">Tên lớp:</label>
              <input
                type="text"
                required
                value={editClassName}
                onChange={(e) => setEditClassName(e.target.value)}
                placeholder="Ví dụ: 3A1, 4A2, 5A1..."
                className="px-3.5 py-2.5 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">Khối lớp:</label>
                <select
                  value={editClassGrade}
                  onChange={(e) => setEditClassGrade(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none cursor-pointer"
                >
                  <option value="3">Khối 3 (Grade 3)</option>
                  <option value="4">Khối 4 (Grade 4)</option>
                  <option value="5">Khối 5 (Grade 5)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">Sĩ số (học sinh):</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={editClassCount}
                  onChange={(e) => setEditClassCount(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-emerald-950">Giáo viên bộ môn phụ trách:</label>
              <input
                type="text"
                value={editClassTeacher}
                onChange={(e) => setEditClassTeacher(e.target.value)}
                placeholder="Ví dụ: Cô Nguyễn Mai..."
                className="px-3.5 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white text-emerald-900 border border-emerald-300 font-bold text-xs hover:bg-gray-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRM DELETE CLASS (TAB 2)                            */}
      {/* ============================================================== */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#fdf7f7] rounded-3xl max-w-sm w-full p-6 border-[3px] border-rose-300 shadow-2xl relative flex flex-col gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl shadow-inner border border-rose-200">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-base sm:text-lg font-black text-rose-950 font-display">
                  Confirm Delete Class
                </h3>
                <p className="text-xs italic text-rose-800 font-medium">
                  Xác nhận xóa lớp học
                </p>
              </div>
              <p className="text-xs text-rose-800 font-semibold mt-1">
                Bạn có chắc chắn muốn xóa lớp <strong className="text-rose-950 text-sm underline font-black">{deletingClass.name}</strong> không?
              </p>
            </div>

            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 text-[11px] text-rose-800 leading-relaxed text-left">
              ⚠️ Dữ liệu về sĩ số ({deletingClass.studentCount} em), giáo viên ({deletingClass.teacherName}) và tiến độ của lớp này sẽ bị xóa khỏi bộ nhớ trình duyệt (LocalStorage).
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingClass(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold text-xs cursor-pointer transition-colors flex flex-col items-center justify-center leading-tight"
              >
                <span className="font-bold text-xs text-gray-800">Cancel</span>
                <span className="text-[10px] italic font-medium text-gray-600">Hủy bỏ</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClass}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 active:scale-95 leading-tight"
              >
                <div className="flex items-center gap-1 font-black text-xs">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Class</span>
                </div>
                <span className="text-[10px] italic font-medium text-rose-100">Xác nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CLASS STUDENT ROSTER (TAB 2)                             */}
      {/* ============================================================== */}
      {selectedClassForRoster && (() => {
        const classStudents = studentsList.filter(
          st => st.className.toLowerCase() === selectedClassForRoster.name.toLowerCase()
        );
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-[#f0faf4] rounded-3xl max-w-xl w-full p-5 sm:p-6 border-[3px] border-[#86c898] shadow-2xl relative flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-emerald-950 font-display flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-700" />
                    <span>Danh sách học sinh Lớp {selectedClassForRoster.name}</span>
                  </h3>
                  <p className="text-xs text-emerald-800">
                    GV: {selectedClassForRoster.teacherName} • Hiện có: {classStudents.length} học sinh trong danh sách quản lý
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedClassForRoster(null);
                    setShowAddStudentForm(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action bar: Export accounts & Add student button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] font-bold text-emerald-800">
                  Tài khoản đăng nhập được quản lý trực tiếp dưới đây:
                </span>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    type="button"
                    onClick={handleExportStudentAccounts}
                    className="py-1.5 px-3 rounded-xl bg-white hover:bg-emerald-100/70 text-emerald-950 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer transition-all active:scale-95"
                    title="Tải về file Excel/CSV tổng hợp tài khoản và mật khẩu học sinh"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>📥 Tải danh sách tài khoản (Excel/CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddStudentForm(!showAddStudentForm)}
                    className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddStudentForm ? 'Đóng form' : 'Thêm học sinh'}</span>
                  </button>
                </div>
              </div>

              {/* Form Add Student inline */}
              {showAddStudentForm && (
                <form 
                  onSubmit={handleAddStudentToClass}
                  className="bg-white p-3.5 rounded-2xl border-2 border-emerald-300 shadow-sm flex flex-col gap-3 animate-in fade-in duration-150"
                >
                  <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                    <span>➕ Thêm học sinh mới vào Lớp {selectedClassForRoster.name}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-emerald-900 block mb-0.5">Tên học sinh:</label>
                      <input
                        type="text"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="Ví dụ: Bé Lan Anh..."
                        className="w-full px-3 py-1.5 text-xs bg-emerald-50 border border-emerald-300 rounded-lg font-bold text-emerald-950 outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-emerald-900 block mb-0.5">Mật khẩu đăng nhập:</label>
                      <input
                        type="text"
                        value={newStudentPassword}
                        onChange={(e) => setNewStudentPassword(e.target.value)}
                        placeholder="Mặc định: 123456"
                        className="w-full px-3 py-1.5 text-xs bg-emerald-50 border border-emerald-300 rounded-lg font-bold text-emerald-950 outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  {/* Bổ sung khu vực nút bấm Import danh sách từ file */}
                  <div className="pt-2.5 border-t border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-emerald-50/70 p-2.5 rounded-xl border border-dashed border-emerald-300">
                    <input
                      type="file"
                      ref={studentImportFileInputRef}
                      onChange={handleImportStudentFile}
                      accept=".xlsx,.xls,.csv,.txt"
                      className="hidden"
                      id="import-student-file-input"
                    />
                    <label
                      htmlFor="import-student-file-input"
                      className={`inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-xs cursor-pointer transition-all shadow-2xs hover:shadow active:scale-95 ${
                        isImporting ? 'opacity-60 pointer-events-none' : ''
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      <span>{isImporting ? 'Đang đọc file...' : '📁 Hoặc Import danh sách từ file (Excel/Word/TXT)'}</span>
                    </label>
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-emerald-300 shadow-2xs">
                      <label htmlFor="default-import-password" className="text-[11px] text-emerald-900 font-bold whitespace-nowrap">
                        Mật khẩu mặc định:
                      </label>
                      <input
                        id="default-import-password"
                        type="text"
                        value={defaultImportPassword}
                        onChange={(e) => setDefaultImportPassword(e.target.value)}
                        placeholder="123456"
                        className="w-20 px-2 py-0.5 text-xs font-mono font-bold bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-md outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                        title="Mật khẩu chung cho các học sinh khi import file"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddStudentForm(false)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95"
                    >
                      Lưu học sinh
                    </button>
                  </div>
                </form>
              )}

              {/* Students list */}
              <div className="space-y-2">
                {classStudents.length === 0 ? (
                  <div className="text-center py-6 bg-white rounded-2xl border border-emerald-200 text-xs text-emerald-800">
                    Lớp chưa có học sinh nào. Thầy/Cô hãy bấm <strong>+ Thêm học sinh</strong> ở trên!
                  </div>
                ) : (
                  classStudents.map((st, idx) => (
                    <div 
                      key={st.id}
                      className="bg-white p-3 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <span className="font-bold text-emerald-950 block">{st.name}</span>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                            <span>Luyện: {st.lastPractice}</span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-700">Lớp {st.className}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        {/* Student Password Pill with Edit / Customize action */}
                        {editingPasswordStudentId === st.id ? (
                          <div className="flex items-center gap-1 bg-amber-100/90 p-1 rounded-xl border-2 border-amber-400 shadow-xs animate-in zoom-in-95 duration-100">
                            <span className="text-[10px] font-bold text-amber-900 pl-1">MK:</span>
                            <input
                              type="text"
                              autoFocus
                              value={tempPasswordInput}
                              onChange={(e) => setTempPasswordInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveStudentPassword(st.id);
                                } else if (e.key === 'Escape') {
                                  setEditingPasswordStudentId(null);
                                }
                              }}
                              className="w-20 px-1.5 py-0.5 text-xs font-mono font-bold bg-white text-emerald-950 border border-amber-300 rounded outline-none focus:ring-1 focus:ring-amber-500"
                              placeholder="Nhập MK..."
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveStudentPassword(st.id)}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors shadow-2xs active:scale-95"
                              title="Lưu mật khẩu mới"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPasswordStudentId(null)}
                              className="p-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer transition-colors active:scale-95"
                              title="Hủy"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-xl border border-amber-200 transition-colors shadow-2xs"
                            title="Mật khẩu học sinh dùng để đăng nhập"
                          >
                            <div className="flex items-center gap-1 text-[11px]">
                              <Key className="w-3 h-3 text-amber-700" />
                              <span className="text-amber-800 font-semibold">MK:</span>
                              <span className="font-mono font-bold text-amber-950">{st.password}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPasswordStudentId(st.id);
                                setTempPasswordInput(st.password);
                              }}
                              className="p-1 rounded-md text-amber-800 hover:text-amber-950 hover:bg-amber-200/90 cursor-pointer transition-colors"
                              title={`Sửa / Đổi mật khẩu cho ${st.name}`}
                            >
                              <Pencil className="w-3 h-3 text-amber-800" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[11px]">
                          {st.lastPractice === 'Chưa luyện tập' || (st.score === 0 && st.trees === 0) ? (
                            <>
                              <span className="font-bold text-gray-400">0%</span>
                              <span className="font-bold text-gray-400">0 🌲</span>
                            </>
                          ) : (
                            <>
                              <span className="font-black text-emerald-700">{st.score}%</span>
                              <span className="font-bold text-emerald-950">{st.trees} 🌲</span>
                            </>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setStudentToDelete(st)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition-colors active:scale-90"
                          title={`Xóa học sinh ${st.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedClassForRoster(null);
                  setShowAddStudentForm(false);
                }}
                className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-emerald-900 transition-colors"
              >
                Đóng danh sách
              </button>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* MODAL: CONFIRM DELETE STUDENT                                  */}
      {/* ============================================================== */}
      {studentToDelete && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-2 border-rose-200 shadow-2xl flex flex-col gap-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-13 h-13 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs border border-rose-200">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-0.5">
                <h4 className="text-base sm:text-lg font-black text-rose-950 font-display">
                  Confirm Delete Student
                </h4>
                <p className="text-xs italic text-rose-800 font-medium">
                  Xác nhận xóa học sinh
                </p>
              </div>
              <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                Bạn có chắc chắn muốn xóa học sinh <strong>{studentToDelete.name}</strong> khỏi {selectedClassForRoster ? `Lớp ${selectedClassForRoster.name}` : `Lớp ${studentToDelete.className}`} không?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors flex flex-col items-center justify-center leading-tight"
              >
                <span className="font-bold text-xs text-gray-800">Cancel</span>
                <span className="text-[10px] italic font-medium text-gray-600">Hủy bỏ</span>
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer transition-colors active:scale-95 flex flex-col items-center justify-center leading-tight"
              >
                <div className="flex items-center gap-1.5 font-black text-xs">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Student</span>
                </div>
                <span className="text-[10px] italic font-medium text-rose-100">Xác nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ============================================================== */}
      {/* MODAL: CONFIRM DELETE ASSIGNMENT                               */}
      {/* ============================================================== */}
      {assignmentToDelete && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-2 border-rose-200 shadow-2xl flex flex-col gap-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-13 h-13 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs border border-rose-200">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-0.5">
                <h4 className="text-base sm:text-lg font-black text-rose-950 font-display">
                  Confirm Delete Assignment
                </h4>
                <p className="text-xs italic text-rose-800 font-medium">
                  Xác nhận xóa bài tập vĩnh viễn
                </p>
              </div>
              <div className="text-xs text-gray-700 mt-1 leading-relaxed">
                <span className="block font-semibold text-gray-900">Are you sure you want to delete this assignment?</span>
                <span className="text-[11px] italic text-gray-600">Bạn có chắc chắn muốn xóa bài tập này không?</span>
              </div>
              <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-800 text-left">
                <p className="line-clamp-2">{assignmentToDelete.title}</p>
                <p className="text-[10px] text-rose-600 font-semibold mt-1">
                  Khối {assignmentToDelete.grade} • {assignmentToDelete.targetClass}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAssignmentToDelete(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-gray-300 hover:bg-gray-100 cursor-pointer transition-colors flex flex-col items-center justify-center leading-tight"
              >
                <span className="font-bold text-xs text-gray-800">Cancel</span>
                <span className="text-[10px] italic font-medium text-gray-600">Hủy bỏ</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTeacherAssignment(assignmentToDelete.id);
                  setAssignmentsList(getTeacherAssignments());
                  setClassesList(getTeacherClasses());
                  const deletedTitle = assignmentToDelete.title;
                  setAssignmentToDelete(null);
                  showToast(`Đã xóa vĩnh viễn bài tập "${deletedTitle}".`, 'info');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer transition-colors active:scale-95 flex flex-col items-center justify-center leading-tight"
              >
                <div className="flex items-center gap-1.5 font-black text-xs">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </div>
                <span className="text-[10px] italic font-medium text-rose-100">Xác nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CHANGE TEACHER / ADMIN PASSWORD                         */}
      {/* ============================================================== */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <form 
            onSubmit={handleChangePasswordSubmit}
            className="bg-[#f0faf4] rounded-3xl max-w-md w-full p-5 sm:p-6 border-[3px] border-[#86c898] shadow-2xl relative flex flex-col gap-4 animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-2xs">
                  <Key className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-emerald-950 font-display">
                    Đổi mật khẩu Giáo viên / Admin
                  </h3>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Cập nhật mật khẩu truy cập hệ thống quản trị
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setChangePasswordError(null);
                }}
                className="p-1 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message if any */}
            {changePasswordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{changePasswordError}</span>
              </div>
            )}

            {/* Field 1: Mật khẩu hiện tại (Current Password) */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-950">
                  Mật khẩu hiện tại (Current Password):
                </label>
                <span className="text-[10px] text-emerald-700 font-medium">
                  (Mặc định: admin123)
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showOldPass ? "text" : "password"}
                  required
                  value={oldPasswordInput}
                  onChange={(e) => {
                    setOldPasswordInput(e.target.value);
                    if (changePasswordError) setChangePasswordError(null);
                  }}
                  placeholder="Nhập mật khẩu hiện tại..."
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  title={showOldPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 2: Mật khẩu mới (New Password) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-emerald-950">
                Mật khẩu mới (New Password):
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNewPass ? "text" : "password"}
                  required
                  value={newPasswordInput}
                  onChange={(e) => {
                    setNewPasswordInput(e.target.value);
                    if (changePasswordError) setChangePasswordError(null);
                  }}
                  placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)..."
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  title={showNewPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 3: Xác nhận mật khẩu mới (Confirm New Password) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-emerald-950">
                Xác nhận mật khẩu mới (Confirm New Password):
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => {
                    setConfirmPasswordInput(e.target.value);
                    if (changePasswordError) setChangePasswordError(null);
                  }}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  title={showConfirmPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-emerald-200">
              <button
                type="button"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setChangePasswordError(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white font-extrabold text-xs shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: THÊM BÀI HỌC / TỪ VỰNG / MẪU CÂU MỚI (ADD CUSTOM LESSON ITEM) */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-[#f2faf5] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative border-[3px] border-[#86c898] flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-2xs">
                  <Plus className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-emerald-950 font-display">
                    Thêm Bài học / Từ vựng / Mẫu câu mới
                  </h3>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Nội dung mới sẽ được lưu vào Firestore và hiển thị cho học sinh học tập
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddLessonModal(false)}
                className="p-1 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddLessonItem} className="flex flex-col gap-3.5">
              
              {/* Row 1: Loại nội dung & Khối lớp */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-emerald-950">
                    Phân loại nội dung:
                  </label>
                  <select
                    value={addLessonType}
                    onChange={(e) => setAddLessonType(e.target.value as 'vocab' | 'sentence')}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                  >
                    <option value="vocab">1. Từ vựng (Vocabulary)</option>
                    <option value="sentence">2. Mẫu câu (Sentence)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-emerald-950">
                    Khối lớp học tập:
                  </label>
                  <select
                    value={addLessonGrade}
                    onChange={(e) => {
                      const g = e.target.value as '3' | '4' | '5';
                      setAddLessonGrade(g);
                      const gUnits = getUnitsForGrade(g);
                      if (gUnits.length > 0) {
                        setAddLessonUnitKey(gUnits[0].unitKey);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                  >
                    <option value="3">Khối 3 (Grade 3)</option>
                    <option value="4">Khối 4 (Grade 4)</option>
                    <option value="5">Khối 5 (Grade 5)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Chọn Unit học tập & Bài học */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-emerald-950">
                    Chọn Unit học tập:
                  </label>
                  <select
                    value={addLessonUnitKey}
                    onChange={(e) => setAddLessonUnitKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                  >
                    {getUnitsForGrade(addLessonGrade).map(u => (
                      <option key={u.unitKey} value={u.unitKey}>
                        {u.unitFullName || `Unit ${u.unitNumber}: ${u.unitName}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-emerald-950">
                    Mục bài học (Section):
                  </label>
                  <input
                    type="text"
                    value={addLessonSection}
                    onChange={(e) => setAddLessonSection(e.target.value)}
                    placeholder="VD: Lesson 1, Lesson 2, Extra..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Row 3: Từ vựng / Câu tiếng Anh */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">
                  {addLessonType === 'vocab' ? 'Từ vựng tiếng Anh (English Word):' : 'Mẫu câu tiếng Anh (English Sentence):'} *
                </label>
                <input
                  type="text"
                  required
                  value={addLessonWordOrSentence}
                  onChange={(e) => setAddLessonWordOrSentence(e.target.value)}
                  placeholder={addLessonType === 'vocab' ? "VD: dragon fruit, solar power, turtle..." : "VD: What do you do in your free time?"}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                />
              </div>

              {/* Row 4: Phiên âm IPA & Nghĩa tiếng Việt */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-emerald-950">
                    Phiên âm (Phonetic IPA):
                  </label>
                  <input
                    type="text"
                    value={addLessonPhonetic}
                    onChange={(e) => setAddLessonPhonetic(e.target.value)}
                    placeholder="VD: /ˈdræɡ.ən ˌfruːt/"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-emerald-950">
                    Nghĩa tiếng Việt: *
                  </label>
                  <input
                    type="text"
                    required
                    value={addLessonMeaning}
                    onChange={(e) => setAddLessonMeaning(e.target.value)}
                    placeholder="VD: quả thanh long, năng lượng mặt trời..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Row 5: Ảnh minh họa URL & Emoji */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">
                  Đường dẫn URL Ảnh minh họa:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={addLessonImageUrl}
                    onChange={(e) => setAddLessonImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                  />
                  <input
                    type="text"
                    value={addLessonIcon}
                    onChange={(e) => setAddLessonIcon(e.target.value)}
                    placeholder="🌱"
                    className="w-14 text-center px-2 py-2 rounded-xl bg-white border border-[#86c898] text-sm font-bold"
                    title="Emoji đại diện"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-emerald-200">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white font-extrabold text-xs shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Thêm Bài học mới</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / CHỈNH SỬA UNIT (ADD / EDIT UNIT) */}
      {showAddEditUnitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-[#f2faf5] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative border-[3px] border-[#86c898] flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-2xs">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-emerald-950 font-display">
                    {editingUnitObj ? `Chỉnh sửa Unit (Khối ${selectedGrade})` : `Thêm Unit mới (Khối ${selectedGrade})`}
                  </h3>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    {editingUnitObj ? 'Cập nhật tên, tiêu đề và chủ đề của Unit' : 'Tạo Unit mới cho chương trình học và phân quyền mở khóa'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowAddEditUnitModal(false);
                  setEditingUnitObj(null);
                }}
                className="p-1 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnitForm} className="flex flex-col gap-3.5">
              
              {/* Row 1: Số thứ tự Unit & Tên tiếng Anh */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-xs font-bold text-emerald-950">
                    Số Unit (STT):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={unitFormNumber}
                    onChange={(e) => {
                      const num = Number(e.target.value) || 1;
                      setUnitFormNumber(num);
                      if (!editingUnitObj && unitFormName) {
                        setUnitFormFullName(`Unit ${num}: ${unitFormName}`);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-bold text-emerald-950">
                    Tên Unit tiếng Anh (Short Name): *
                  </label>
                  <input
                    type="text"
                    required
                    value={unitFormName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setUnitFormName(name);
                      if (!editingUnitObj) {
                        setUnitFormFullName(`Unit ${unitFormNumber}: ${name}`);
                      }
                    }}
                    placeholder="VD: My Eco Garden, Weather & Seasons..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Row 2: Tên đầy đủ Unit (Unit Full Name) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">
                  Tên đầy đủ Unit (Unit Full Name): *
                </label>
                <input
                  type="text"
                  required
                  value={unitFormFullName}
                  onChange={(e) => setUnitFormFullName(e.target.value)}
                  placeholder="VD: Unit 21: My Eco Garden"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                />
              </div>

              {/* Row 3: Chủ đề & Mô tả tiếng Việt (Theme / Description) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-emerald-950">
                  Chủ đề / Mô tả tiếng Việt (Theme & Description):
                </label>
                <input
                  type="text"
                  value={unitFormTheme}
                  onChange={(e) => setUnitFormTheme(e.target.value)}
                  placeholder="VD: Khu vườn sinh thái & Môi trường sống (Eco Garden & Habitat)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-950 focus:outline-none focus:border-[#10b981]"
                />
              </div>

              {/* Row 4: Trạng thái phân quyền Mở khóa */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div>
                  <span className="text-xs font-black text-emerald-950 block">Trạng thái phân quyền ban đầu:</span>
                  <span className="text-[11px] text-emerald-800 font-medium block">
                    {unitFormUnlocked ? 'Học sinh có thể truy cập bài học ngay' : 'Tạm khóa Unit này đối với học sinh'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUnitFormUnlocked(!unitFormUnlocked)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                    unitFormUnlocked
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {unitFormUnlocked ? 'Đang Mở khóa' : 'Đang Tạm khóa'}
                </button>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-emerald-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEditUnitModal(false);
                    setEditingUnitObj(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] text-white font-extrabold text-xs shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUnitObj ? 'Lưu thay đổi' : 'Tạo Unit mới'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
