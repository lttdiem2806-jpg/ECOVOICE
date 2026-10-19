import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Home, 
  Mic, 
  Gamepad2, 
  Sprout, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  Volume2, 
  Target, 
  Info, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  X,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  Search,
  Download,
  Copy,
  Check,
  ShieldAlert,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  FileCheck,
  Play,
  LogIn,
  Trophy,
  Layers,
  ArrowRight
} from 'lucide-react';
import bgImage from './assets/images/eco_forest_background_1791867767218.jpg';
import { 
  bookmapDatabase, 
  VocabularyItem, 
  SentenceStructure, 
  UnitData 
} from './data/bookmapData';
import { 
  evaluateSmartPronunciation, 
  PronunciationEvaluationResult,
  calculatePronunciationScoreWithTolerances,
  isWordMatchWithTolerances
} from './services/pronunciationFeedbackService';
import { InteractivePronunciationFeedback } from './components/InteractivePronunciationFeedback';
import { EcoGamesView } from './components/EcoGamesView';
import { LessonsOverviewView } from './components/LessonsOverviewView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentAssignmentsView } from './components/StudentAssignmentsView';
import { HonorBoardWidget } from './components/HonorBoardWidget';
import { HonorBoardModal } from './components/HonorBoardModal';
import { StudentProgressDashboard } from './components/StudentProgressDashboard';
import { 
  recordStudentActivity, 
  getStudentPracticedWords, 
  recordPracticedWord, 
  recordPracticedSentence, 
  getGuestGradeEcoPoints,
  setGuestGradeEcoPoints,
  getGuestGradeVirtualTrees,
  setGuestGradeVirtualTrees,
  computeLogicalTrees,
  computeRemainingEPToNextTree,
  isGuestUser,
  resetGuestSession
} from './services/studentActivityService';
import { 
  getCustomVisuals, 
  CustomVisual, 
  getCurrentUserRole, 
  setCurrentUserRole, 
  AppUserRole, 
  isTeacherUnlocked, 
  setTeacherUnlocked, 
  verifyTeacherPassword,
  DEFAULT_TEACHER_PASSWORD,
  getTeacherClasses,
  TeacherClass,
  CLASSES_EVENT,
  verifyStudentCredentials,
  getStudentAccounts,
  saveStudentAccount,
  updateStudentProgress,
  getTeacherAssignments,
  ASSIGNMENTS_EVENT,
  TeacherAssignment,
  getAssignmentDisplayInfo,
  isAssignmentForStudent,
  recordStudentAssignmentCompletion,
  GUEST_DEMO_ASSIGNMENTS,
  getGuestCompletedAssignmentIds,
  recordGuestAssignmentCompletion,
  resetGuestAssignmentCompletions,
  isUnitUnlockedForGrade,
  isUnitFullyCompleted,
  getHighestUnlockedUnit,
  markUnitCompleted,
  getUnitsForGrade
} from './services/teacherContentService';
import { 
  signInWithGoogle, 
  logOutFirebase, 
  subscribeToAuthState,
  signInWithEmail 
} from './services/firebase';
import { 
  syncInitialDataToFirestore,
  subscribeToFirestoreStudents,
  subscribeToFirestoreAssignments,
  subscribeToFirestoreClasses,
  subscribeToFirestoreUnitPermissions,
  subscribeToFirestoreCustomVisuals,
  subscribeToFirestoreCustomUnits,
  syncGoogleUserToFirestore,
  syncUserToFirestore,
  ADMIN_EMAIL,
  isSystemAdminEmail,
  registerStudentWithFirebase,
  authenticateStudentOrAdmin
} from './services/firestoreSyncService';

export default function App() {
  // Navigation & filter states
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'sentences'>('vocabulary');
  const [activeSidebar, setActiveSidebar] = useState<string>('lessons');
  const [showTeacherDashboard, setShowTeacherDashboard] = useState<boolean>(false);
  const [customVisuals, setCustomVisuals] = useState<Record<string, CustomVisual>>(() => getCustomVisuals());
  const [userRole, setUserRole] = useState<AppUserRole>(() => getCurrentUserRole());
  const [classList, setClassList] = useState<TeacherClass[]>(() => getTeacherClasses());
  const [assignmentsList, setAssignmentsList] = useState<TeacherAssignment[]>(() => getTeacherAssignments());
  const [targetGameId, setTargetGameId] = useState<string | null>(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [guestCompletedAssignmentIds, setGuestCompletedAssignmentIds] = useState<string[]>(() => getGuestCompletedAssignmentIds());
  const [showHonorBoardModal, setShowHonorBoardModal] = useState<boolean>(false);
  const [lockedUnitNoticeModal, setLockedUnitNoticeModal] = useState<{ unitName: string; unitNumber: number } | null>(null);

  // Listen to LocalStorage custom visuals, classes, assignments & role updates
  useEffect(() => {
    const handleVisualsUpdated = () => {
      setCustomVisuals(getCustomVisuals());
    };
    const handleRoleChanged = () => {
      setUserRole(getCurrentUserRole());
      setGuestCompletedAssignmentIds(getGuestCompletedAssignmentIds());
    };
    const handleClassesUpdated = () => {
      setClassList(getTeacherClasses());
    };
    const handleAssignmentsUpdated = () => {
      setAssignmentsList(getTeacherAssignments());
      setGuestCompletedAssignmentIds(getGuestCompletedAssignmentIds());
    };
    window.addEventListener('ecovoice_custom_visuals_updated', handleVisualsUpdated);
    window.addEventListener('ecovoice_role_changed', handleRoleChanged);
    window.addEventListener(CLASSES_EVENT, handleClassesUpdated);
    window.addEventListener(ASSIGNMENTS_EVENT, handleAssignmentsUpdated);
    window.addEventListener('storage', handleVisualsUpdated);
    window.addEventListener('storage', handleRoleChanged);
    window.addEventListener('storage', handleClassesUpdated);
    window.addEventListener('storage', handleAssignmentsUpdated);
    return () => {
      window.removeEventListener('ecovoice_custom_visuals_updated', handleVisualsUpdated);
      window.removeEventListener('ecovoice_role_changed', handleRoleChanged);
      window.removeEventListener(CLASSES_EVENT, handleClassesUpdated);
      window.removeEventListener(ASSIGNMENTS_EVENT, handleAssignmentsUpdated);
      window.removeEventListener('storage', handleVisualsUpdated);
      window.removeEventListener('storage', handleRoleChanged);
      window.removeEventListener('storage', handleClassesUpdated);
      window.removeEventListener('storage', handleAssignmentsUpdated);
    };
  }, []);
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedGrade = localStorage.getItem('ecovoice_selected_grade');
      if (storedGrade === '3' || storedGrade === '4' || storedGrade === '5') {
        return storedGrade;
      }
      const storedClass = localStorage.getItem('ecovoice_student_class');
      if (storedClass) {
        const firstDigit = storedClass.replace(/^Lớp\s+/i, '').trim().charAt(0);
        if (firstDigit === '3' || firstDigit === '4' || firstDigit === '5') {
          return firstDigit;
        }
      }
    }
    return '3';
  });
  const [selectedUnitKey, setSelectedUnitKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('ecovoice_user_name') || '';
      const storedRole = localStorage.getItem('ecovoice_user_role');
      const isStudentChiVy = storedRole === 'student' && (storedName.toLowerCase().includes('chí vỹ') || storedName.toLowerCase().includes('chi vy'));
      if (isStudentChiVy) {
        return 'unit_2';
      }
    }
    return 'unit_1';
  });
  const [selectedVocabId, setSelectedVocabId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('ecovoice_user_name') || '';
      const storedRole = localStorage.getItem('ecovoice_user_role');
      const isStudentChiVy = storedRole === 'student' && (storedName.toLowerCase().includes('chí vỹ') || storedName.toLowerCase().includes('chi vy'));
      if (isStudentChiVy) {
        return 'g4_u2_1';
      }
    }
    return 'g3_u1_1';
  });
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number>(0);
  const [selectedLesson, setSelectedLesson] = useState<string>('Lesson 1');

  // Bookmap explorer modal states
  const [bookmapExplorerGrade, setBookmapExplorerGrade] = useState<string>('3');
  const [bookmapSearch, setBookmapSearch] = useState<string>('');
  const [showBookmapJson, setShowBookmapJson] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  
  // Color learning states
  const [isSpeakingActive, setIsSpeakingActive] = useState<boolean>(false);
  const [speechFeedback, setSpeechFeedback] = useState<string>('Nghe mẫu rồi nói nhé!');
  const [speechSuccess, setSpeechSuccess] = useState<boolean | null>(null);

  const [accent, setAccent] = useState<'US' | 'UK'>('US');
  const [customUnitsTrigger, setCustomUnitsTrigger] = useState<number>(0);

  useEffect(() => {
    const handleUpdate = () => setCustomUnitsTrigger(prev => prev + 1);
    window.addEventListener('ecovoice_custom_units_updated', handleUpdate);
    return () => window.removeEventListener('ecovoice_custom_units_updated', handleUpdate);
  }, []);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [recognizedTranscript, setRecognizedTranscript] = useState<string>('');
  const [pronunciationEvaluation, setPronunciationEvaluation] = useState<PronunciationEvaluationResult | null>(null);
  const [practiceAttemptCount, setPracticeAttemptCount] = useState<number>(1);

  // Microphone permission & iframe warning modal state
  const [micNoticeModal, setMicNoticeModal] = useState<{
    isOpen: boolean;
    type: 'iframe_blocked' | 'permission_denied' | 'not_found' | 'unsupported' | 'general';
    title: string;
    message: string;
    isIframeBlocked?: boolean;
  } | null>(null);

  // Gamification states (with strictly isolated storage for Guest Mode / Demo User)
  const [ecoPoints, setEcoPoints] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('ecovoice_user_role');
      if (storedRole === 'teacher') return 0;
      const storedName = localStorage.getItem('ecovoice_user_name') || '';
      const hasLoginFlag = localStorage.getItem('ecovoice_is_logged_in') === 'true';
      const isStudent = hasLoginFlag && storedRole === 'student' && !isGuestUser(storedName);
      if (!isStudent) {
        const storedGrade = localStorage.getItem('ecovoice_selected_grade') || '3';
        return getGuestGradeEcoPoints(storedGrade);
      }
      if (storedName) {
        const student = getStudentAccounts().find(
          s => s.name.trim().toLowerCase() === storedName.trim().toLowerCase()
        );
        if (student) {
          const hasPracticed = Boolean(
            (student.lastPractice && student.lastPractice !== 'Chưa luyện tập') ||
            (student.score || 0) > 0 ||
            (student.trees || 0) > 0 ||
            (student.ecoPoints || 0) > 0
          );
          if (!hasPracticed) return 0;
          return student.ecoPoints ?? ((student.trees || 0) * 30);
        }
      }
    }
    return 0;
  });

  const [virtualTrees, setVirtualTrees] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('ecovoice_user_role');
      if (storedRole === 'teacher') return 0;
      const storedName = localStorage.getItem('ecovoice_user_name') || '';
      const hasLoginFlag = localStorage.getItem('ecovoice_is_logged_in') === 'true';
      const isStudent = hasLoginFlag && storedRole === 'student' && !isGuestUser(storedName);
      if (!isStudent) {
        const storedGrade = localStorage.getItem('ecovoice_selected_grade') || '3';
        return getGuestGradeVirtualTrees(storedGrade);
      }
      if (storedName) {
        const student = getStudentAccounts().find(
          s => s.name.trim().toLowerCase() === storedName.trim().toLowerCase()
        );
        if (student) {
          const hasPracticed = Boolean(
            (student.lastPractice && student.lastPractice !== 'Chưa luyện tập') ||
            (student.score || 0) > 0 ||
            (student.trees || 0) > 0 ||
            (student.ecoPoints || 0) > 0
          );
          if (!hasPracticed) return 0;
          const isChiVy = Boolean(student.name && student.name.trim().toLowerCase() === 'chí vỹ');
          const ep = student.ecoPoints ?? ((student.trees || 0) * 30);
          return computeLogicalTrees(ep);
        }
      }
    }
    return 0;
  });
  const [practicedItems, setPracticedItems] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('ecovoice_user_role');
      const storedName = localStorage.getItem('ecovoice_user_name') || '';
      const hasLoginFlag = localStorage.getItem('ecovoice_is_logged_in') === 'true';
      const isStudent = hasLoginFlag && storedRole === 'student' && !isGuestUser(storedName);
      if (!isStudent) {
        const storedGrade = localStorage.getItem('ecovoice_selected_grade') || '3';
        return getStudentPracticedWords('Khách trải nghiệm', storedGrade);
      }
      if (storedName) {
        return getStudentPracticedWords(storedName);
      }
    }
    return new Set<string>();
  });
  const [mascotBubble, setMascotBubble] = useState<string>("Let's practise together!");
  
  // Modals & Mobile drawer
  const [activeModal, setActiveModal] = useState<'login' | 'teacher' | 'settings' | 'bookmap' | 'garden' | 'progress' | 'help' | 'honor' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('ecovoice_user_role');
      const hasLoginFlag = localStorage.getItem('ecovoice_is_logged_in') === 'true';
      const storedName = localStorage.getItem('ecovoice_user_name') || '';
      if (hasLoginFlag && storedRole === 'student' && !isGuestUser(storedName)) {
        const savedRemember = localStorage.getItem('ecovoice_remember_student') === 'true';
        if (savedRemember && localStorage.getItem('ecovoice_saved_student_name')) {
          return localStorage.getItem('ecovoice_saved_student_name')!;
        }
        return storedName || 'Học sinh';
      }
      if (hasLoginFlag && storedRole === 'teacher') {
        return 'Thầy/Cô';
      }
      return 'Khách trải nghiệm / Visitor';
    }
    return 'Khách trải nghiệm / Visitor';
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('ecovoice_user_role');
      const hasLoginFlag = localStorage.getItem('ecovoice_is_logged_in') === 'true';
      if ((storedRole === 'student' || storedRole === 'teacher' || storedRole === 'guest') && hasLoginFlag) {
        return true;
      }
      if (hasLoginFlag) return true;
    }
    return false;
  });
  const [loginPromptNotice, setLoginPromptNotice] = useState<{ en: string; vi: string } | null>(null);


  // Login modal internal states
  const [loginRoleTab, setLoginRoleTab] = useState<'student' | 'teacher'>('student');
  const [studentAuthMode, setStudentAuthMode] = useState<'login' | 'register'>('login');
  
  // Student Login Form States
  const [loginStudentName, setLoginStudentName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedRemember = localStorage.getItem('ecovoice_remember_student') === 'true';
      if (savedRemember) {
        return localStorage.getItem('ecovoice_saved_student_name') || '';
      }
    }
    return '';
  });
  const [loginStudentPassword, setLoginStudentPassword] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedRemember = localStorage.getItem('ecovoice_remember_student') === 'true';
      if (savedRemember) {
        return localStorage.getItem('ecovoice_saved_student_pass') || '';
      }
    }
    return '';
  });
  const [rememberStudent, setRememberStudent] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ecovoice_remember_student') === 'true';
    }
    return false;
  });
  const [studentLoginError, setStudentLoginError] = useState<string | null>(null);
  const [showStudentPassword, setShowStudentPassword] = useState<boolean>(false);
  const [isAuthenticatingStudent, setIsAuthenticatingStudent] = useState<boolean>(false);

  // Student Registration Form States
  const [regStudentName, setRegStudentName] = useState<string>('');
  const [regStudentClass, setRegStudentClass] = useState<string>('4A3');
  const [regStudentEmail, setRegStudentEmail] = useState<string>('');
  const [regStudentPassword, setRegStudentPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [isRegisteringStudent, setIsRegisteringStudent] = useState<boolean>(false);

  // Teacher Login Form States
  const [teacherLoginEmail, setTeacherLoginEmail] = useState<string>(ADMIN_EMAIL);
  const [teacherLoginPassword, setTeacherLoginPassword] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedRemember = localStorage.getItem('ecovoice_remember_teacher') === 'true';
      if (savedRemember) {
        return localStorage.getItem('ecovoice_saved_teacher_pass') || '';
      }
    }
    return '';
  });
  const [rememberTeacher, setRememberTeacher] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ecovoice_remember_teacher') === 'true';
    }
    return false;
  });
  const [teacherLoginError, setTeacherLoginError] = useState<string | null>(null);
  const [showTeacherLoginPassword, setShowTeacherLoginPassword] = useState<boolean>(false);
  const [isAuthenticatingTeacher, setIsAuthenticatingTeacher] = useState<boolean>(false);

  // Profile modal states
  const [profileModalTab, setProfileModalTab] = useState<'overview' | 'password'>('overview');
  const [changePassNew, setChangePassNew] = useState<string>('');
  const [changePassConfirm, setChangePassConfirm] = useState<string>('');
  const [changePassMsg, setChangePassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Synchronize / clear login fields whenever Login Modal opens
  useEffect(() => {
    if (activeModal === 'login') {
      const isStudentRemembered = localStorage.getItem('ecovoice_remember_student') === 'true';
      if (isStudentRemembered) {
        setLoginStudentName(localStorage.getItem('ecovoice_saved_student_name') || '');
        setLoginStudentPassword(localStorage.getItem('ecovoice_saved_student_pass') || '');
        setRememberStudent(true);
      } else {
        // 2. Xóa tự động điền khi KHÔNG ghi nhớ: để trống 100% các ô nhập liệu
        setLoginStudentName('');
        setLoginStudentPassword('');
        setRememberStudent(false);
      }

      const isTeacherRemembered = localStorage.getItem('ecovoice_remember_teacher') === 'true';
      if (isTeacherRemembered) {
        setTeacherLoginPassword(localStorage.getItem('ecovoice_saved_teacher_pass') || '');
        setRememberTeacher(true);
      } else {
        setTeacherLoginPassword('');
        setRememberTeacher(false);
      }

      setTeacherLoginEmail(ADMIN_EMAIL);
      setStudentLoginError(null);
      setTeacherLoginError(null);
      setStudentAuthMode('login');
    }
  }, [activeModal]);

  const [isSigningInGoogle, setIsSigningInGoogle] = useState<boolean>(false);

  // Real-time Firestore synchronization & Auth listener
  useEffect(() => {
    // 1. Initial Firestore database seeding if empty
    syncInitialDataToFirestore();

    // 2. Real-time Firestore students listener
    const unsubStudents = subscribeToFirestoreStudents((students) => {
      if (isLoggedIn && userRole === 'student' && userName) {
        const match = students.find(s => s.name.trim().toLowerCase() === userName.trim().toLowerCase());
        if (match) {
          if (match.ecoPoints !== undefined) setEcoPoints(match.ecoPoints);
          if (match.trees !== undefined) setVirtualTrees(match.trees);
        }
      }
    });

    // 3. Real-time Firestore assignments listener
    const unsubAssignments = subscribeToFirestoreAssignments((asgs) => {
      if (asgs && asgs.length > 0) {
        setAssignmentsList(asgs);
      }
    });

    // 4. Real-time Firestore classes listener
    const unsubClasses = subscribeToFirestoreClasses((classes) => {
      if (classes && classes.length > 0) {
        window.dispatchEvent(new CustomEvent('ecovoice_classes_updated', { detail: { classes } }));
      }
    });

    // 5. Real-time Firestore unit permissions listener
    const unsubPerms = subscribeToFirestoreUnitPermissions((perms) => {
      if (perms) {
        window.dispatchEvent(new CustomEvent('ecovoice_perms_updated', { detail: { perms } }));
      }
    });

    // 6. Real-time Firestore custom visuals (illustrations/lessons) listener
    const unsubVisuals = subscribeToFirestoreCustomVisuals((visuals) => {
      if (visuals) {
        window.dispatchEvent(new CustomEvent('ecovoice_custom_visuals_updated', { detail: { visuals } }));
      }
    });

    // 7. Real-time Firestore custom units listener
    const unsubUnits = subscribeToFirestoreCustomUnits((units) => {
      if (units) {
        window.dispatchEvent(new CustomEvent('ecovoice_custom_units_updated', { detail: { units } }));
      }
    });

    // 8. Firebase Auth listener
    const unsubAuth = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncGoogleUserToFirestore(firebaseUser);
          setIsLoggedIn(true);
          setUserRole(profile.role);
          setCurrentUserRole(profile.role);
          setUserName(profile.name);
          setIsGuestMode(false);
          setStudentClassInput(profile.className);
          if (profile.role === 'teacher') {
            setTeacherUnlocked(true);
          }
        } catch (e) {
          console.warn('Auth state sync error:', e);
        }
      }
    });

    return () => {
      unsubStudents();
      unsubAssignments();
      unsubClasses();
      unsubPerms();
      unsubVisuals();
      unsubUnits();
      unsubAuth();
    };
  }, [isLoggedIn, userRole, userName]);

  const unlockTeacherAdmin = (name: string, email: string) => {
    playSoundEffect('celebrate');
    if (rememberTeacher) {
      localStorage.setItem('ecovoice_remember_teacher', 'true');
      localStorage.setItem('ecovoice_saved_teacher_pass', teacherLoginPassword);
    } else {
      localStorage.removeItem('ecovoice_remember_teacher');
      localStorage.removeItem('ecovoice_saved_teacher_pass');
      setTeacherLoginPassword('');
    }

    localStorage.removeItem('ecovoice_is_guest_mode');
    localStorage.setItem('ecovoice_is_logged_in', 'true');
    localStorage.setItem('ecovoice_user_role', 'teacher');
    localStorage.setItem('ecovoice_user_name', name);
    const initialTeacherClass = localStorage.getItem('ecovoice_teacher_selected_class') || `${selectedGrade}A3`;
    localStorage.setItem('ecovoice_teacher_selected_class', initialTeacherClass);
    setTeacherSelectedClass(initialTeacherClass);
    setStudentClassInput(initialTeacherClass);
    setTeacherUnlocked(true);
    setCurrentUserRole('teacher');
    setUserRole('teacher');
    setUserName(name);
    setIsGuestMode(false);
    setIsLoggedIn(true);
    setLoginPromptNotice(null);
    setShowTeacherDashboard(true);
    setActiveModal(null);
    setTeacherLoginError(null);
    setMascotBubble(`Xin chào Quản trị viên (${email})! Chúc Thầy/Cô buổi làm việc hiệu quả tại Teacher Dashboard! 👩‍🏫🌿`);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    setStudentLoginError(null);
    setTeacherLoginError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        playSoundEffect('celebrate');
        const profile = await syncGoogleUserToFirestore(user);
        setIsLoggedIn(true);
        setUserRole(profile.role);
        setCurrentUserRole(profile.role);
        setUserName(profile.name);
        setIsGuestMode(false);
        setStudentClassInput(profile.className);
        setEcoPoints(profile.ecoPoints);
        setVirtualTrees(profile.trees);

        if (profile.role === 'teacher') {
          setTeacherUnlocked(true);
          setShowTeacherDashboard(true);
          localStorage.setItem('ecovoice_user_role', 'teacher');
          localStorage.setItem('ecovoice_is_logged_in', 'true');
          localStorage.setItem('ecovoice_user_name', profile.name);
          setMascotBubble(`Xin chào Quản trị viên (${user.email || profile.name})! Chúc Thầy/Cô một buổi dạy thật hứng khởi cùng các em học sinh! 👩‍🏫🌿`);
        } else {
          // STRICT ENFORCEMENT: All new login accounts are assigned strictly role 'student'
          setTeacherUnlocked(false);
          setShowTeacherDashboard(false);
          localStorage.setItem('ecovoice_user_role', 'student');
          localStorage.setItem('ecovoice_is_logged_in', 'true');
          localStorage.setItem('ecovoice_user_name', profile.name);
          localStorage.setItem('ecovoice_student_class', profile.className);

          const sGrade = profile.grade || profile.className?.replace(/^Lớp\s+/i, '').trim().charAt(0) || '4';
          if (sGrade === '3' || sGrade === '4' || sGrade === '5') {
            setSelectedGrade(sGrade);
            localStorage.setItem('ecovoice_selected_grade', sGrade);
          }

          setMascotBubble(`Chào mừng ${profile.name}! Cùng học tiếng Anh và vun trồng vườn cây sinh thái nhé! 🌟🌱`);
        }

        setLoginPromptNotice(null);
        setActiveModal(null);
      }
    } catch (error: any) {
      const isPopupClosed = 
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.message?.includes('popup-closed-by-user');

      if (isPopupClosed) {
        console.info('Google Sign-In popup closed by user.');
      } else {
        console.error('Google Sign-In Error:', error);
        const msg = 'Không thể đăng nhập bằng Google lúc này. Vui lòng thử lại hoặc đăng nhập bằng tài khoản lớp!';
        if (loginRoleTab === 'teacher') {
          setTeacherLoginError(msg);
        } else {
          setStudentLoginError(msg);
        }
      }
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleLogoutAction = () => {
    playSoundEffect('click');
    const wasRemembered = localStorage.getItem('ecovoice_remember_student') === 'true';
    localStorage.removeItem('ecovoice_is_logged_in');
    localStorage.removeItem('ecovoice_user_role');
    localStorage.removeItem('ecovoice_is_guest_mode');
    localStorage.removeItem('ecovoice_student_class');
    setTeacherUnlocked(false);

    if (!wasRemembered) {
      localStorage.removeItem('ecovoice_user_name');
      localStorage.removeItem('ecovoice_remember_student');
      localStorage.removeItem('ecovoice_saved_student_name');
      localStorage.removeItem('ecovoice_saved_student_pass');
      setUserName('');
      setLoginStudentName('');
      setLoginStudentPassword('');
      setRememberStudent(false);
    } else {
      setLoginStudentName(localStorage.getItem('ecovoice_saved_student_name') || '');
      setLoginStudentPassword(localStorage.getItem('ecovoice_saved_student_pass') || '');
      setRememberStudent(true);
    }

    sessionStorage.removeItem('ecovoice_is_logged_in');
    sessionStorage.removeItem('ecovoice_user_role');
    sessionStorage.removeItem('ecovoice_is_guest_mode');
    sessionStorage.removeItem('ecovoice_student_class');
    sessionStorage.removeItem('ecovoice_user_name');
    resetGuestSession();
    resetGuestAssignmentCompletions();
    setEcoPoints(0);
    setVirtualTrees(0);
    setGuestCompletedAssignmentIds([]);
    setPracticedItems(new Set());

    setIsGuestMode(true);
    setCurrentUserRole('guest');
    setUserRole('guest');
    setIsLoggedIn(false);
    logOutFirebase().catch(() => {});
    setMascotBubble('Đã đăng xuất tài khoản!');
    setActiveModal(null);
  };

  const handleGuestLoginAction = () => {
    playSoundEffect('celebrate');
    const guestName = 'Khách trải nghiệm / Visitor';
    sessionStorage.setItem('ecovoice_user_name', guestName);
    sessionStorage.setItem('ecovoice_is_logged_in', 'true');
    sessionStorage.setItem('ecovoice_user_role', 'guest');
    sessionStorage.setItem('ecovoice_is_guest_mode', 'true');
    sessionStorage.setItem('ecovoice_student_class', 'Trải nghiệm (Demo / Guest)');
    localStorage.removeItem('ecovoice_is_guest_mode');
    if (localStorage.getItem('ecovoice_user_role') === 'guest') {
      localStorage.removeItem('ecovoice_user_role');
      localStorage.removeItem('ecovoice_is_logged_in');
      localStorage.removeItem('ecovoice_user_name');
      localStorage.removeItem('ecovoice_student_class');
    }
    const guestEP = getGuestGradeEcoPoints(selectedGrade);
    const guestTrees = getGuestGradeVirtualTrees(selectedGrade);
    const guestCompleted = getGuestCompletedAssignmentIds();
    setEcoPoints(guestEP);
    setVirtualTrees(guestTrees);
    setGuestCompletedAssignmentIds(guestCompleted);
    setUserName(guestName);
    setIsGuestMode(true);
    setStudentClassInput('Trải nghiệm (Demo / Guest)');
    setCurrentUserRole('guest');
    setUserRole('guest');
    setTeacherUnlocked(false);
    setIsLoggedIn(true);
    setLoginPromptNotice(null);
    setActiveModal(null);
    setActiveSidebar('lessons');
    setMascotBubble('Welcome to Eco-Voice! Explore all 20 interactive Units & green features freely!');
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePassNew || changePassNew.length < 3) {
      setChangePassMsg({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 3 ký tự!' });
      return;
    }
    if (changePassNew !== changePassConfirm) {
      setChangePassMsg({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp!' });
      return;
    }
    const accounts = getStudentAccounts();
    const matchIndex = accounts.findIndex(s => s.name.trim().toLowerCase() === userName.trim().toLowerCase());
    if (matchIndex >= 0) {
      const updated = { ...accounts[matchIndex], password: changePassNew };
      saveStudentAccount(updated);
      if (rememberStudent) {
        localStorage.setItem('ecovoice_saved_student_pass', changePassNew);
      }
      setLoginStudentPassword(changePassNew);
      setChangePassMsg({ type: 'success', text: 'Đã đổi mật khẩu thành công!' });
      setChangePassNew('');
      setChangePassConfirm('');
      playSoundEffect('celebrate');
    } else {
      setChangePassMsg({ type: 'error', text: 'Không tìm thấy tài khoản để cập nhật mật khẩu.' });
    }
  };

  const handleStudentLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentLoginError(null);
    setIsAuthenticatingStudent(true);

    try {
      const authResult = await authenticateStudentOrAdmin(loginStudentName.trim(), loginStudentPassword);
      if (!authResult.success || !authResult.userProfile) {
        playSoundEffect('fail');
        setStudentLoginError(
          authResult.error || 
          'Tên đăng nhập / Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
        );
        return;
      }

      const matched = authResult.userProfile;
      playSoundEffect('celebrate');

      if (rememberStudent) {
        localStorage.setItem('ecovoice_remember_student', 'true');
        localStorage.setItem('ecovoice_saved_student_name', loginStudentName.trim());
        localStorage.setItem('ecovoice_saved_student_pass', loginStudentPassword);
      } else {
        localStorage.removeItem('ecovoice_remember_student');
        localStorage.removeItem('ecovoice_saved_student_name');
        localStorage.removeItem('ecovoice_saved_student_pass');
        setLoginStudentName('');
        setLoginStudentPassword('');
      }

      if (matched.role === 'teacher') {
        unlockTeacherAdmin(matched.name, matched.email || ADMIN_EMAIL);
        return;
      }

      // Strictly student role
      localStorage.setItem('ecovoice_user_name', matched.name);
      localStorage.setItem('ecovoice_is_logged_in', 'true');
      localStorage.setItem('ecovoice_user_role', 'student');
      localStorage.removeItem('ecovoice_is_guest_mode');
      localStorage.setItem('ecovoice_student_class', matched.className);
      setUserName(matched.name);
      setIsGuestMode(false);
      setStudentClassInput(matched.className);

      const sGrade = matched.grade || matched.className?.replace(/^Lớp\s+/i, '').trim().charAt(0) || '4';
      if (sGrade === '3' || sGrade === '4' || sGrade === '5') {
        setSelectedGrade(sGrade);
        localStorage.setItem('ecovoice_selected_grade', sGrade);
        const gradeData = bookmapDatabase.grades[sGrade];
        if (gradeData && gradeData.units && gradeData.units.length > 0) {
          const isStudentChiVy = matched.name.toLowerCase().includes('chí vỹ') || matched.name.toLowerCase().includes('chi vy');
          const targetUnit = (isStudentChiVy && sGrade === '4' && gradeData.units.length > 1)
            ? (gradeData.units.find(u => u.unitKey === 'unit_2') || gradeData.units[1])
            : gradeData.units[0];
          setSelectedUnitKey(targetUnit.unitKey);
          if (targetUnit.vocabulary && targetUnit.vocabulary.length > 0) {
            const initVocab = (targetUnit.lessons && targetUnit.lessons[0]?.vocabulary?.length > 0)
              ? targetUnit.lessons[0].vocabulary[0]
              : targetUnit.vocabulary[0];
            setSelectedVocabId(initVocab.id);
          }
        }
      }

      const studentEP = matched.ecoPoints || 0;
      const studentTrees = matched.trees || computeLogicalTrees(studentEP);
      setVirtualTrees(studentTrees);
      setEcoPoints(studentEP);
      setCurrentUserRole('student');
      setUserRole('student');
      setTeacherUnlocked(false);
      setShowTeacherDashboard(false);
      setIsLoggedIn(true);
      setLoginPromptNotice(null);
      setActiveModal(null);
      setActiveSidebar('lessons');
      setMascotBubble(`Chào mừng ${matched.name} (Lớp ${matched.className}) đến với lớp học Eco-Voice!`);
    } catch (err: any) {
      playSoundEffect('fail');
      setStudentLoginError(err?.message || 'Đăng nhập không thành công. Vui lòng thử lại!');
    } finally {
      setIsAuthenticatingStudent(false);
    }
  };

  const handleStudentRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentLoginError(null);
    setIsRegisteringStudent(true);

    try {
      const regResult = await registerStudentWithFirebase({
        name: regStudentName.trim(),
        className: regStudentClass.trim(),
        email: regStudentEmail.trim(),
        password: regStudentPassword.trim()
      });

      if (!regResult.success || !regResult.profile) {
        playSoundEffect('fail');
        setStudentLoginError(regResult.error || 'Đăng ký không thành công. Vui lòng thử lại!');
        return;
      }

      const profile = regResult.profile;
      playSoundEffect('celebrate');

      localStorage.setItem('ecovoice_user_name', profile.name);
      localStorage.setItem('ecovoice_is_logged_in', 'true');
      localStorage.setItem('ecovoice_user_role', 'student');
      localStorage.removeItem('ecovoice_is_guest_mode');
      localStorage.setItem('ecovoice_student_class', profile.className);

      setUserName(profile.name);
      setIsGuestMode(false);
      setStudentClassInput(profile.className);
      setEcoPoints(0);
      setVirtualTrees(0);
      setCurrentUserRole('student');
      setUserRole('student');
      setTeacherUnlocked(false);
      setShowTeacherDashboard(false);
      setIsLoggedIn(true);
      setLoginPromptNotice(null);
      setActiveModal(null);
      setActiveSidebar('lessons');

      const sGrade = profile.grade || profile.className?.replace(/^Lớp\s+/i, '').trim().charAt(0) || '4';
      if (sGrade === '3' || sGrade === '4' || sGrade === '5') {
        setSelectedGrade(sGrade);
        localStorage.setItem('ecovoice_selected_grade', sGrade);
      }

      setMascotBubble(`Chúc mừng học sinh ${profile.name}! Bạn đã tạo tài khoản thành công cho Lớp ${profile.className}. Hãy bắt đầu bài học đầu tiên nhé! 🌱🌟`);
    } catch (err: any) {
      playSoundEffect('fail');
      setStudentLoginError(err?.message || 'Đăng ký không thành công. Vui lòng thử lại!');
    } finally {
      setIsRegisteringStudent(false);
    }
  };

  const handleTeacherLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherLoginError(null);
    setIsAuthenticatingTeacher(true);

    try {
      const isPinCorrect = verifyTeacherPassword(teacherLoginPassword);
      const cleanEmail = teacherLoginEmail.trim().toLowerCase();

      // If entered admin email lttdiem2806@gmail.com
      if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
        if (isPinCorrect) {
          unlockTeacherAdmin('Cô Lê Hương (Admin)', cleanEmail);
          return;
        }

        try {
          const authRes = await authenticateStudentOrAdmin(cleanEmail, teacherLoginPassword);
          if (authRes.success && authRes.userProfile && authRes.userProfile.role === 'teacher') {
            unlockTeacherAdmin(authRes.userProfile.name, cleanEmail);
            return;
          }
        } catch {
          // continue to check pin
        }
      }

      if (isPinCorrect) {
        unlockTeacherAdmin('Cô Lê Hương (Admin)', ADMIN_EMAIL);
        return;
      }

      playSoundEffect('fail');
      setTeacherLoginError('Mật khẩu quản trị hoặc tài khoản không chính xác! Vui lòng kiểm tra lại.');
    } catch (err: any) {
      playSoundEffect('fail');
      setTeacherLoginError(err?.message || 'Đăng nhập quản trị thất bại.');
    } finally {
      setIsAuthenticatingTeacher(false);
    }
  };
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('ecovoice_user_role');
      if (storedRole === 'teacher') return false;
      const hasLoginFlag = localStorage.getItem('ecovoice_is_logged_in') === 'true';
      const storedName = localStorage.getItem('ecovoice_user_name') || '';
      if (hasLoginFlag && storedRole === 'student' && !isGuestUser(storedName)) {
        return false;
      }
      return true;
    }
    return true;
  });
  const [studentClassInput, setStudentClassInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('ecovoice_user_role');
      if (storedRole === 'teacher') {
        return localStorage.getItem('ecovoice_teacher_selected_class') || '5A3';
      }
      const hasLoginFlag = localStorage.getItem('ecovoice_is_logged_in') === 'true';
      const storedName = localStorage.getItem('ecovoice_user_name') || '';
      if (hasLoginFlag && storedRole === 'student' && !isGuestUser(storedName)) {
        return localStorage.getItem('ecovoice_student_class') || '4A3';
      }
      return 'Trải nghiệm (Demo / Guest)';
    }
    return 'Trải nghiệm (Demo / Guest)';
  });

  // Teacher selected class for assignment preview / management
  const [teacherSelectedClass, setTeacherSelectedClass] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ecovoice_teacher_selected_class') || '5A3';
    }
    return '5A3';
  });

  const handleTeacherClassChange = (newClass: string) => {
    const clean = (newClass || '').replace(/^Lớp\s+/i, '').trim();
    if (!clean) return;
    setTeacherSelectedClass(clean);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecovoice_teacher_selected_class', clean);
      window.dispatchEvent(new CustomEvent('ecovoice_class_changed', { detail: { className: clean } }));
    }
    // Also sync selectedGrade if class has a grade prefix (e.g. 4A3 -> 4)
    const classGrade = clean.charAt(0);
    if (classGrade === '3' || classGrade === '4' || classGrade === '5') {
      if (classGrade !== selectedGrade) {
        handleGradeChange(classGrade);
      }
    }
  };

  useEffect(() => {
    const handleClassChanged = (e: any) => {
      const cls = e?.detail?.className;
      if (cls) {
        const clean = String(cls).replace(/^Lớp\s+/i, '').trim();
        setTeacherSelectedClass(clean);
      }
    };
    window.addEventListener('ecovoice_class_changed', handleClassChanged);
    return () => {
      window.removeEventListener('ecovoice_class_changed', handleClassChanged);
    };
  }, []);

  // Clean student class & grade for synchronized assignment filtering
  const studentClassClean = (studentClassInput || '').replace(/^Lớp\s+/i, '').trim();

  // Active class for assignment filtering and badge counting:
  // - Teacher: uses teacherSelectedClass (e.g. '3A1', '4A3', etc.)
  // - Student: uses studentClassClean (e.g. '4A3')
  const activeAssignmentClass = userRole === 'teacher' ? teacherSelectedClass : studentClassClean;
  const activeAssignmentGrade = activeAssignmentClass.charAt(0) || selectedGrade || '3';

  // Synchronized student assignments list for Badge count and Home Banner
  const myStudentAssignments = useMemo(() => {
    if (!isLoggedIn) return [];
    if (isGuestMode) {
      return GUEST_DEMO_ASSIGNMENTS;
    }
    // Both Teacher (for the selected class) and Student (for their class) count strictly
    // the assignments matching the class being viewed!
    return assignmentsList.filter(a => 
      isAssignmentForStudent(a, activeAssignmentClass, activeAssignmentGrade)
    );
  }, [isLoggedIn, isGuestMode, assignmentsList, activeAssignmentClass, activeAssignmentGrade]);

  // Dynamic Badge Count: For Guest Mode, badge decrements as demo tasks are completed
  const studentAssignmentsBadgeCount = useMemo(() => {
    if (!isLoggedIn) return 0;
    if (userRole === 'teacher') {
      return myStudentAssignments.length;
    }
    if (isGuestMode) {
      // Total demo tasks minus tasks completed in this session
      const remainingTasks = GUEST_DEMO_ASSIGNMENTS.filter(
        asg => !guestCompletedAssignmentIds.includes(asg.id)
      );
      return remainingTasks.length;
    }
    return myStudentAssignments.length;
  }, [isLoggedIn, userRole, isGuestMode, myStudentAssignments, guestCompletedAssignmentIds]);

  // In-App browser detection (Zalo, Facebook, TikTok...)
  const [isInAppBrowser, setIsInAppBrowser] = useState<boolean>(false);
  const [showInAppBanner, setShowInAppBanner] = useState<boolean>(true);

  // Audio wave animation during speaking
  const [waveHeights, setWaveHeights] = useState<number[]>([14, 24, 38, 22, 32, 12]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechTimeoutRef = useRef<any>(null);

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

  const clearSpeechTimeout = () => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  };

  // Web Audio sound synthesizer for responsive feedback (Correct, Incorrect, Chime, Celebrate)
  const playSoundEffect = (type: 'chime' | 'success' | 'click' | 'celebrate' | 'fail' | 'incorrect' | 'boing') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      // Resume audio context if suspended by browser policy
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'chime') {
        // Bright two-tone bell chime
        const notes = [659.25, 880.0]; // E5 -> A5
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.connect(g);
          g.connect(ctx.destination);
          const startTime = now + idx * 0.1;
          o.frequency.setValueAtTime(freq, startTime);
          g.gain.setValueAtTime(0.001, startTime);
          g.gain.linearRampToValueAtTime(0.1, startTime + 0.015);
          g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
          o.start(startTime);
          o.stop(startTime + 0.35);
        });
      } else if (type === 'success') {
        // 1. Correct Answer Sound: Melodic, cheerful, sparkling crystal bell chime ("tinh tinh" reo vui)
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.connect(g);
          g.connect(ctx.destination);
          const startTime = now + idx * 0.065;
          o.frequency.setValueAtTime(freq, startTime);
          g.gain.setValueAtTime(0.001, startTime);
          g.gain.linearRampToValueAtTime(0.11, startTime + 0.015);
          g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
          o.start(startTime);
          o.stop(startTime + 0.35);
        });
      } else if (type === 'celebrate') {
        // Victory celebration fanfare
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = idx === notes.length - 1 ? 'triangle' : 'sine';
          o.connect(g);
          g.connect(ctx.destination);
          const startTime = now + idx * 0.08;
          o.frequency.setValueAtTime(freq, startTime);
          g.gain.setValueAtTime(0.001, startTime);
          g.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
          o.start(startTime);
          o.stop(startTime + 0.45);
        });
      } else if (type === 'fail' || (type as string) === 'incorrect' || (type as string) === 'boing') {
        // 2. Incorrect Answer Sound (NEW): Gentle, encouraging cartoon "boing / oops" spring (Never harsh, zero buzzer)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Friendly spring pitch envelope: starts sweet at 380Hz, dips to 270Hz, bounces to 340Hz, settles at 230Hz
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(270, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(340, now + 0.16);
        osc.frequency.exponentialRampToValueAtTime(230, now + 0.32);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.085, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

        osc.start(now);
        osc.stop(now + 0.34);

        // Subtle warm cartoon sub-harmonic for cheerful physical bounce feel
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);

        subOsc.frequency.setValueAtTime(190, now);
        subOsc.frequency.exponentialRampToValueAtTime(135, now + 0.08);
        subOsc.frequency.exponentialRampToValueAtTime(170, now + 0.16);
        subOsc.frequency.exponentialRampToValueAtTime(115, now + 0.32);

        subGain.gain.setValueAtTime(0.001, now);
        subGain.gain.linearRampToValueAtTime(0.04, now + 0.02);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

        subOsc.start(now);
        subOsc.stop(now + 0.34);
      }
    } catch {
      // AudioContext fallback
    }
  };

  // Dynamic curriculum resolution
  const availableUnits = useMemo(() => {
    return getUnitsForGrade(selectedGrade);
  }, [selectedGrade, customUnitsTrigger]);
  const currentUnit = availableUnits.find(u => u.unitKey === selectedUnitKey) || availableUnits[0] || { unitKey: selectedUnitKey, unitName: 'Unit', vocabulary: [], sentences: [] };
  const availableLessons = currentUnit.lessons || [];

  const rawVocabList = useMemo(() => {
    const list = [...(currentUnit.vocabulary || [])];
    Object.values(customVisuals).forEach(custom => {
      if (!custom.isCustomAdded) return;
      if (custom.type !== 'vocab') return;
      if (custom.grade && custom.grade !== selectedGrade) return;
      if (custom.unitKey && custom.unitKey !== (currentUnit?.unitKey || selectedUnitKey)) return;
      if (list.some(v => v.id === custom.id)) return;

      list.push({
        id: custom.id,
        word: custom.wordOrSentence,
        phonetic: custom.phonetic || '/.../',
        meaning: custom.meaning,
        icon: custom.customIcon || '🌱',
        colorHex: custom.customColorHex || '#10b981',
        lesson: custom.lesson || 'Lesson 1',
        sentence: `It's ${custom.wordOrSentence}.`,
        sentenceVi: `Đó là ${custom.meaning}.`
      } as any);
    });
    return list;
  }, [currentUnit, customVisuals, selectedGrade, selectedUnitKey]);

  const rawSentencesList = useMemo(() => {
    const list = [...(currentUnit.sentences || [])];
    Object.values(customVisuals).forEach(custom => {
      if (!custom.isCustomAdded) return;
      if (custom.type !== 'sentence') return;
      if (custom.grade && custom.grade !== selectedGrade) return;
      if (custom.unitKey && custom.unitKey !== (currentUnit?.unitKey || selectedUnitKey)) return;
      if (list.some(s => s.id === custom.id)) return;

      list.push({
        id: custom.id,
        structure: custom.wordOrSentence,
        meaning: custom.meaning,
        example: custom.wordOrSentence,
        exampleVi: custom.meaning,
        speechText: custom.wordOrSentence,
        lesson: custom.lesson || 'Lesson 2'
      } as any);
    });
    return list;
  }, [currentUnit, customVisuals, selectedGrade, selectedUnitKey]);

  const filteredVocab = selectedLesson === 'all'
    ? rawVocabList
    : rawVocabList.filter(v => v.lesson === selectedLesson || v.lesson?.startsWith(selectedLesson));
  const vocabularyList = filteredVocab.length > 0 ? filteredVocab : rawVocabList;

  const filteredSentences = selectedLesson === 'all'
    ? rawSentencesList
    : rawSentencesList.filter(s => s.lesson === selectedLesson || s.lesson?.startsWith(selectedLesson));
  const sentencesList = filteredSentences.length > 0 ? filteredSentences : rawSentencesList;

  const currentVocab = vocabularyList.find(v => v.id === selectedVocabId) || vocabularyList[0] || rawVocabList[0];
  const currentSentence = sentencesList[selectedSentenceIndex] || sentencesList[0] || {
    id: 's_default',
    structure: currentVocab?.sentence || '',
    meaning: currentVocab?.sentenceVi || '',
    example: currentVocab?.sentence || '',
    exampleVi: currentVocab?.sentenceVi || '',
    speechText: currentVocab?.sentence || '',
    lesson: currentVocab?.lesson
  };

  // Switch Grade Handler
  const handleGradeChange = (grade: string) => {
    playSoundEffect('click');
    setSelectedGrade(grade);
    localStorage.setItem('ecovoice_selected_grade', grade);
    if (userRole === 'teacher') {
      const existingInGrade = classList.find(c => c.grade === grade || c.name.startsWith(grade));
      const targetClass = existingInGrade ? existingInGrade.name : `${grade}A3`;
      setTeacherSelectedClass(targetClass);
      localStorage.setItem('ecovoice_teacher_selected_class', targetClass);
    }
    setSelectedLesson('Lesson 1');
    const newGradeData = bookmapDatabase.grades[grade] || bookmapDatabase.grades['3'];
    const isGuest = isGuestMode || userRole === 'guest' || !isLoggedIn;
    if (isGuest) {
      const gEP = getGuestGradeEcoPoints(grade);
      const gTrees = getGuestGradeVirtualTrees(grade);
      setEcoPoints(gEP);
      setVirtualTrees(gTrees);
      setPracticedItems(getStudentPracticedWords('Khách trải nghiệm', grade));
    }
    const highestUnitNum = getHighestUnlockedUnit(grade, userName);
    const defaultUnit = newGradeData.units.find(u => (u.unitNumber || 1) === highestUnitNum) || newGradeData.units[0];
    setSelectedUnitKey(defaultUnit.unitKey);
    const initialVocab = (defaultUnit.lessons && defaultUnit.lessons[0]?.vocabulary?.length > 0)
      ? defaultUnit.lessons[0].vocabulary[0]
      : (defaultUnit.vocabulary[0] || null);
    setSelectedVocabId(initialVocab?.id || defaultUnit.vocabulary[0]?.id || '');
    setSelectedSentenceIndex(0);
    setSpeechSuccess(null);
    setSpeechFeedback(isGuest ? `Bạn đã chọn ${newGradeData.gradeTitle} - ${defaultUnit.unitFullName}!` : `Bé đã chọn ${newGradeData.gradeTitle} - ${defaultUnit.unitFullName}!`);
    setMascotBubble(`Khám phá ${defaultUnit.unitFullName} nào!`);
  };

  // Switch Unit Handler (With Dynamic Sequential Lock Guard for Students across all 20 units)
  const handleUnitChange = (unitKey: string): boolean => {
    // Check permission: Teachers and Guest Mode always bypass lock; Regular students are strictly guarded
    const isGuest = Boolean(
      isGuestMode ||
      userRole === 'guest' ||
      !isLoggedIn ||
      (typeof window !== 'undefined' && (
        localStorage.getItem('ecovoice_is_guest_mode') === 'true' ||
        (localStorage.getItem('ecovoice_user_name') || '').includes('Guest') ||
        (localStorage.getItem('ecovoice_user_role') === 'guest')
      ))
    );
    const isTeacher = !isGuest && userRole === 'teacher';

    if (!isTeacher && !isGuest && !isUnitUnlockedForGrade(selectedGrade, unitKey, userName)) {
      playSoundEffect('fail');
      const unit = availableUnits.find(u => u.unitKey === unitKey);
      setLockedUnitNoticeModal({
        unitName: unit ? (unit.unitName || unit.unitFullName) : unitKey,
        unitNumber: unit ? unit.unitNumber : 0
      });
      return false;
    }

    playSoundEffect('click');
    setSelectedUnitKey(unitKey);
    setSelectedLesson('Lesson 1');
    const unit = availableUnits.find(u => u.unitKey === unitKey) || availableUnits[0];
    if (unit && unit.vocabulary.length > 0) {
      const initialVocab = (unit.lessons && unit.lessons[0]?.vocabulary?.length > 0)
        ? unit.lessons[0].vocabulary[0]
        : unit.vocabulary[0];
      setSelectedVocabId(initialVocab.id);
      setSelectedSentenceIndex(0);
      setSpeechSuccess(null);
      setPronunciationEvaluation(null);
      setPracticeAttemptCount(1);
      setSpeechFeedback(isGuest ? `Bạn đã chọn ${unit.unitFullName}. Cùng luyện phát âm nhé!` : `Bé đã chọn ${unit.unitFullName}. Cùng luyện phát âm nhé!`);
      setMascotBubble(`Học thật vui cùng ${unit.unitFullName}!`);
    }
    return true;
  };

  // Switch Lesson Handler (Lesson 1 & Lesson 2)
  const handleLessonChange = (lessonTitle: string) => {
    playSoundEffect('click');
    setSelectedLesson(lessonTitle);
    setPronunciationEvaluation(null);
    setPracticeAttemptCount(1);
    const targetVocabList = lessonTitle === 'all'
      ? rawVocabList
      : rawVocabList.filter(v => v.lesson === lessonTitle || v.lesson?.startsWith(lessonTitle));
    if (targetVocabList.length > 0) {
      setSelectedVocabId(targetVocabList[0].id);
    }
    setSelectedSentenceIndex(0);
    setSpeechSuccess(null);
    if (lessonTitle === 'all') {
      setSpeechFeedback(`Đang hiển thị cả Unit: ${currentUnit.unitFullName}.`);
    } else {
      setSpeechFeedback(`Bé đang học ${lessonTitle} - ${currentUnit.unitFullName}.`);
    }
  };

  // Navigation Route Guard & Sidebar Click Handler:
  // 1. Tự động chọn Khối theo tài khoản: Khi học sinh bấm vào mục Lessons trên menu Sidebar bên trái,
  // hệ thống tự động nhận diện Khối lớp của học sinh đang đăng nhập (Ví dụ: Học sinh Lớp 4A3 -> Tự động đặt ô chọn Khối là Grade 4).
  const handleSidebarItemClick = (targetSidebar: string, modalTarget?: string | null) => {
    if (!isLoggedIn) {
      playSoundEffect('fail');
      const notice = {
        en: 'Please Log In to Continue',
        vi: 'Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!'
      };
      setLoginPromptNotice(notice);
      setMascotBubble('Please log in to explore! / Vui lòng đăng nhập (Học sinh / GV / Guest) để trải nghiệm nhé!');
      setActiveModal('login');
      setMobileMenuOpen(false);
      return;
    }

    playSoundEffect('click');

    // Tự động nhận diện Khối lớp theo tài khoản học sinh khi bấm vào Lessons
    if (targetSidebar === 'lessons') {
      const userClass = userRole === 'teacher' ? teacherSelectedClass : studentClassClean;
      const gradeMatch = (userClass || '').match(/[3-5]/);
      if (gradeMatch && (gradeMatch[0] === '3' || gradeMatch[0] === '4' || gradeMatch[0] === '5')) {
        const autoGrade = gradeMatch[0];
        if (autoGrade !== selectedGrade) {
          handleGradeChange(autoGrade);
        }
      }
    }

    if (modalTarget === 'honorBoard') {
      setShowHonorBoardModal(true);
      setMobileMenuOpen(false);
      return;
    }
    if (targetSidebar === 'progress') {
      setActiveSidebar('progress');
      setActiveModal(null);
      setMobileMenuOpen(false);
      setMascotBubble('Khám phá Hành trình Xanh và thành tích học tập của bạn nào! 🌟');
      return;
    }
    if (modalTarget) {
      setActiveModal(modalTarget as any);
      setActiveSidebar(targetSidebar);
      setMobileMenuOpen(false);
      return;
    }

    setActiveSidebar(targetSidebar);
    setMobileMenuOpen(false);

    if (targetSidebar === 'lessons') {
      const userClass = userRole === 'teacher' ? teacherSelectedClass : studentClassClean;
      const gradeMatch = (userClass || '').match(/[3-5]/);
      const displayGrade = gradeMatch ? gradeMatch[0] : selectedGrade;
      setMascotBubble(`Tổng hợp toàn bộ 20 Unit Khối ${displayGrade} đã sẵn sàng cho bé khám phá! 📚`);
    } else if (targetSidebar === 'speaking') {
      setMascotBubble('Cùng luyện phát âm từ vựng và mẫu câu chuẩn bản xứ nhé!');
    } else if (targetSidebar === 'assignments') {
      setMascotBubble(isGuestMode ? 'Welcome! Explore demo tasks freely! / Mời bạn trải nghiệm các nhiệm vụ mẫu!' : 'Let\'s check your assigned homework! / Cùng xem bài tập cô giao nhé!');
    } else if (targetSidebar === 'games') {
      setMascotBubble('Let\'s play eco games & grow trees! / Cùng chơi mini-game để trồng cây xanh nhé!');
    } else if (targetSidebar === 'progress') {
      setMascotBubble('Khám phá Hành trình Xanh và thành tích học tập của bạn nào! 🌟');
    }
  };

  // Render Visual Illustration Swatch for Speaking Buddy
  const renderVisualSwatch = (item: VocabularyItem) => {
    // 0. Check teacher customized visual from LocalStorage
    const custom = customVisuals[item.id] || customVisuals[`WORD_${item.word?.toUpperCase()}`];
    if (custom?.imageUrl) {
      return (
        <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[340px] lg:max-w-[380px] h-[175px] sm:h-[200px] lg:h-[225px] rounded-3xl relative flex flex-col items-center justify-center p-3 overflow-hidden shadow-lg border-[3px] border-emerald-400 bg-white group-hover:scale-105 transition-transform duration-300 mx-auto">
          <img 
            src={custom.imageUrl} 
            alt={item.word} 
            className="w-full h-full object-contain rounded-2xl p-1"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="absolute bottom-2.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-black bg-emerald-950/80 text-white backdrop-blur-xs border border-white/20 shadow-xs">
            {item.meaning}
          </span>
        </div>
      );
    }

    if (item.word === 'RED') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md select-none pointer-events-none">
          <defs>
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff2a2a" />
              <stop offset="50%" stopColor="#e51313" />
              <stop offset="100%" stopColor="#b70505" />
            </linearGradient>
          </defs>
          <path d="M 45,75 C 90,45 280,30 365,65 C 385,80 375,130 350,150 C 310,185 120,205 50,180 C 25,160 20,110 45,75 Z" fill="url(#redGrad)" opacity="0.95" />
          <path d="M 60,95 C 130,70 270,55 350,85 C 370,105 340,155 300,168 C 220,195 100,185 55,150 C 35,130 40,105 60,95 Z" fill="#d90429" />
          <path d="M 80,105 C 150,85 240,75 320,100 C 335,120 310,145 270,152 C 180,170 120,160 75,135 Z" fill="#ef233c" opacity="0.75" />
          <path d="M 35,100 Q 55,90 85,95" stroke="#ff4d4d" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 330,75 Q 360,78 375,90" stroke="#ff4d4d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 40,140 Q 65,150 90,145" stroke="#b70505" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 310,165 Q 345,160 360,140" stroke="#b70505" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      );
    }
    if (item.word === 'BLUE') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md select-none pointer-events-none">
          <defs>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
          </defs>
          <path d="M 45,75 C 90,45 280,30 365,65 C 385,80 375,130 350,150 C 310,185 120,205 50,180 C 25,160 20,110 45,75 Z" fill="url(#blueGrad)" opacity="0.95" />
          <path d="M 60,95 C 130,70 270,55 350,85 C 370,105 340,155 300,168 C 220,195 100,185 55,150 C 35,130 40,105 60,95 Z" fill="#2563eb" />
          <path d="M 80,105 C 150,85 240,75 320,100 C 335,120 310,145 270,152 C 180,170 120,160 75,135 Z" fill="#60a5fa" opacity="0.75" />
        </svg>
      );
    }
    if (item.word === 'GREEN') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md select-none pointer-events-none">
          <defs>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
          </defs>
          <path d="M 45,75 C 90,45 280,30 365,65 C 385,80 375,130 350,150 C 310,185 120,205 50,180 C 25,160 20,110 45,75 Z" fill="url(#greenGrad)" opacity="0.95" />
          <path d="M 60,95 C 130,70 270,55 350,85 C 370,105 340,155 300,168 C 220,195 100,185 55,150 C 35,130 40,105 60,95 Z" fill="#10b981" />
          <path d="M 80,105 C 150,85 240,75 320,100 C 335,120 310,145 270,152 C 180,170 120,160 75,135 Z" fill="#6ee7b7" opacity="0.75" />
        </svg>
      );
    }
    if (item.word === 'YELLOW') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md select-none pointer-events-none">
          <defs>
            <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <path d="M 45,75 C 90,45 280,30 365,65 C 385,80 375,130 350,150 C 310,185 120,205 50,180 C 25,160 20,110 45,75 Z" fill="url(#yellowGrad)" opacity="0.95" />
          <path d="M 60,95 C 130,70 270,55 350,85 C 370,105 340,155 300,168 C 220,195 100,185 55,150 C 35,130 40,105 60,95 Z" fill="#f59e0b" />
          <path d="M 80,105 C 150,85 240,75 320,100 C 335,120 310,145 270,152 C 180,170 120,160 75,135 Z" fill="#fef08a" opacity="0.8" />
        </svg>
      );
    }
    if (item.word === 'ORANGE') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md select-none pointer-events-none">
          <defs>
            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <path d="M 45,75 C 90,45 280,30 365,65 C 385,80 375,130 350,150 C 310,185 120,205 50,180 C 25,160 20,110 45,75 Z" fill="url(#orangeGrad)" opacity="0.95" />
          <path d="M 60,95 C 130,70 270,55 350,85 C 370,105 340,155 300,168 C 220,195 100,185 55,150 C 35,130 40,105 60,95 Z" fill="#ea580c" />
          <path d="M 80,105 C 150,85 240,75 320,100 C 335,120 310,145 270,152 C 180,170 120,160 75,135 Z" fill="#fed7aa" opacity="0.85" />
          <path d="M 35,100 Q 55,90 85,95" stroke="#fdba74" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 330,75 Q 360,78 375,90" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 40,140 Q 65,150 90,145" stroke="#c2410c" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 310,165 Q 345,160 360,140" stroke="#c2410c" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      );
    }
    if (item.word === 'BROWN') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md select-none pointer-events-none">
          <defs>
            <linearGradient id="brownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a16207" />
              <stop offset="50%" stopColor="#854d0e" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
          </defs>
          <path d="M 45,75 C 90,45 280,30 365,65 C 385,80 375,130 350,150 C 310,185 120,205 50,180 C 25,160 20,110 45,75 Z" fill="url(#brownGrad)" opacity="0.95" />
          <path d="M 60,95 C 130,70 270,55 350,85 C 370,105 340,155 300,168 C 220,195 100,185 55,150 C 35,130 40,105 60,95 Z" fill="#78350f" />
          <path d="M 80,105 C 150,85 240,75 320,100 C 335,120 310,145 270,152 C 180,170 120,160 75,135 Z" fill="#fef08a" opacity="0.35" />
        </svg>
      );
    }
    if (item.word === 'PURPLE') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md select-none pointer-events-none">
          <defs>
            <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
          </defs>
          <path d="M 45,75 C 90,45 280,30 365,65 C 385,80 375,130 350,150 C 310,185 120,205 50,180 C 25,160 20,110 45,75 Z" fill="url(#purpleGrad)" opacity="0.95" />
          <path d="M 60,95 C 130,70 270,55 350,85 C 370,105 340,155 300,168 C 220,195 100,185 55,150 C 35,130 40,105 60,95 Z" fill="#7e22ce" />
          <path d="M 80,105 C 150,85 240,75 320,100 C 335,120 310,145 270,152 C 180,170 120,160 75,135 Z" fill="#e9d5ff" opacity="0.6" />
        </svg>
      );
    }
    if (item.word === 'PINK') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md select-none pointer-events-none">
          <defs>
            <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
          </defs>
          <path d="M 45,75 C 90,45 280,30 365,65 C 385,80 375,130 350,150 C 310,185 120,205 50,180 C 25,160 20,110 45,75 Z" fill="url(#pinkGrad)" opacity="0.95" />
          <path d="M 60,95 C 130,70 270,55 350,85 C 370,105 340,155 300,168 C 220,195 100,185 55,150 C 35,130 40,105 60,95 Z" fill="#db2777" />
          <path d="M 80,105 C 150,85 240,75 320,100 C 335,120 310,145 270,152 C 180,170 120,160 75,135 Z" fill="#fbcfe8" opacity="0.75" />
        </svg>
      );
    }
    if (item.word === 'BLACK') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md select-none pointer-events-none">
          <defs>
            <linearGradient id="blackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <path d="M 45,75 C 90,45 280,30 365,65 C 385,80 375,130 350,150 C 310,185 120,205 50,180 C 25,160 20,110 45,75 Z" fill="url(#blackGrad)" opacity="0.95" />
          <path d="M 60,95 C 130,70 270,55 350,85 C 370,105 340,155 300,168 C 220,195 100,185 55,150 C 35,130 40,105 60,95 Z" fill="#020617" />
          <path d="M 80,105 C 150,85 240,75 320,100 C 335,120 310,145 270,152 C 180,170 120,160 75,135 Z" fill="#94a3b8" opacity="0.3" />
        </svg>
      );
    }
    if (item.word === 'WHITE') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md select-none pointer-events-none">
          <defs>
            <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
          <path d="M 45,75 C 90,45 280,30 365,65 C 385,80 375,130 350,150 C 310,185 120,205 50,180 C 25,160 20,110 45,75 Z" fill="url(#whiteGrad)" stroke="#cbd5e1" strokeWidth="3" opacity="0.95" />
          <path d="M 60,95 C 130,70 270,55 350,85 C 370,105 340,155 300,168 C 220,195 100,185 55,150 C 35,130 40,105 60,95 Z" fill="#ffffff" />
          <path d="M 80,105 C 150,85 240,75 320,100 C 335,120 310,145 270,152 C 180,170 120,160 75,135 Z" fill="#e2e8f0" opacity="0.6" />
        </svg>
      );
    }

    // General rich visual card for all other vocabulary items
    const hex = custom?.customColorHex || item.colorHex || '#10b981';
    const displayIcon = custom?.customIcon || item.icon || '🌱';
    return (
      <div 
        className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[340px] lg:max-w-[380px] h-[175px] sm:h-[200px] lg:h-[225px] rounded-3xl relative flex flex-col items-center justify-center p-4 overflow-hidden shadow-lg border-[3px] border-white/80 transition-transform duration-300 group-hover:scale-105 mx-auto"
        style={{
          background: `linear-gradient(135deg, ${hex}dd, ${hex})`,
        }}
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xs rounded-3xl pointer-events-none" />
        <span className="text-6xl sm:text-7xl lg:text-8xl drop-shadow-md select-none transform transition-transform group-hover:scale-110 z-10 animate-float">
          {displayIcon}
        </span>
        <span className="mt-2.5 text-xs sm:text-sm font-black text-white/95 uppercase tracking-wider px-4 py-1.5 rounded-full bg-black/25 backdrop-blur-xs z-10 border border-white/20 shadow-xs">
          {item.meaning}
        </span>
      </div>
    );
  };

  // Render Mini Thumbnail for vocabulary selector cards
  const renderItemMiniThumb = (item: VocabularyItem) => {
    const custom = customVisuals[item.id] || customVisuals[`WORD_${item.word?.toUpperCase()}`];
    if (custom?.imageUrl) {
      return (
        <div className="w-24 h-12 flex items-center justify-center overflow-hidden p-0.5">
          <img src={custom.imageUrl} alt={item.word} className="w-full h-full object-contain rounded-lg" />
        </div>
      );
    }
    if (['RED', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'BROWN', 'PURPLE', 'PINK', 'BLACK', 'WHITE'].includes(item.word)) {
      const fill = item.colorHex || (item.word === 'ORANGE' ? '#f97316' : '#ef4444');
      return (
        <svg viewBox="0 0 160 80" className="w-24 h-12">
          <path d="M 15 40 C 30 15, 60 10, 95 18 C 130 25, 145 10, 150 35 C 155 60, 120 75, 80 70 C 40 65, 5 60, 15 40 Z" fill={fill} stroke={item.word === 'WHITE' ? '#cbd5e1' : 'none'} strokeWidth={item.word === 'WHITE' ? 2 : 0} opacity="0.95" />
        </svg>
      );
    }
    return (
      <div className="w-24 h-12 flex items-center justify-center text-3xl sm:text-4xl">
        <span>{custom?.customIcon || item.icon}</span>
      </div>
    );
  };

  // Intelligent 100% matched visual illustration for sentences
  const renderSentenceVisual = (sentence: SentenceStructure) => {
    // 0. Check teacher customized visual for this sentence
    const customSentence = customVisuals[sentence.id];
    if (customSentence?.imageUrl) {
      return (
        <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[340px] lg:max-w-[380px] h-[175px] sm:h-[200px] lg:h-[225px] rounded-3xl relative flex flex-col items-center justify-center p-3 overflow-hidden shadow-lg border-[3px] border-sky-400 bg-white group-hover:scale-105 transition-transform duration-300 mx-auto">
          <img 
            src={customSentence.imageUrl} 
            alt={sentence.example} 
            className="w-full h-full object-contain rounded-2xl p-1"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="absolute bottom-2.5 px-3 py-1 rounded-full text-xs font-black bg-sky-950/80 text-white backdrop-blur-xs border border-white/20 shadow-xs max-w-[90%] truncate">
            {sentence.exampleVi || sentence.meaning}
          </span>
        </div>
      );
    }

    const text = (sentence.example + ' ' + sentence.exampleVi + ' ' + (sentence.meaning || '')).toLowerCase();
    
    // 1. Color sentences (100% accurate match)
    if (text.includes('orange') || text.includes('da cam')) {
      return renderVisualSwatch({ word: 'ORANGE', colorHex: '#f97316', icon: '🟠', meaning: 'Màu cam', id: 's_orange', phonetic: '/ˈɒr.ɪndʒ/', speechText: 'Orange', sentence: sentence.example, sentenceVi: sentence.exampleVi });
    }
    if (text.includes('red') || text.includes('màu đỏ')) {
      return renderVisualSwatch({ word: 'RED', colorHex: '#ef4444', icon: '🔴', meaning: 'Màu đỏ', id: 's_red', phonetic: '/red/', speechText: 'Red', sentence: sentence.example, sentenceVi: sentence.exampleVi });
    }
    if (text.includes('blue') || text.includes('xanh dương')) {
      return renderVisualSwatch({ word: 'BLUE', colorHex: '#3b82f6', icon: '🔵', meaning: 'Màu xanh dương', id: 's_blue', phonetic: '/bluː/', speechText: 'Blue', sentence: sentence.example, sentenceVi: sentence.exampleVi });
    }
    if (text.includes('green') || text.includes('xanh lá')) {
      return renderVisualSwatch({ word: 'GREEN', colorHex: '#10b981', icon: '🟢', meaning: 'Màu xanh lá cây', id: 's_green', phonetic: '/ɡriːn/', speechText: 'Green', sentence: sentence.example, sentenceVi: sentence.exampleVi });
    }
    if (text.includes('yellow') || text.includes('màu vàng')) {
      return renderVisualSwatch({ word: 'YELLOW', colorHex: '#eab308', icon: '🟡', meaning: 'Màu vàng', id: 's_yellow', phonetic: '/ˈjel.əʊ/', speechText: 'Yellow', sentence: sentence.example, sentenceVi: sentence.exampleVi });
    }
    if (text.includes('brown') || text.includes('màu nâu')) {
      return renderVisualSwatch({ word: 'BROWN', colorHex: '#854d0e', icon: '🟤', meaning: 'Màu nâu', id: 's_brown', phonetic: '/braʊn/', speechText: 'Brown', sentence: sentence.example, sentenceVi: sentence.exampleVi });
    }
    if (text.includes('black') || text.includes('màu đen')) {
      return renderVisualSwatch({ word: 'BLACK', colorHex: '#1f2937', icon: '⚫', meaning: 'Màu đen', id: 's_black', phonetic: '/blæk/', speechText: 'Black', sentence: sentence.example, sentenceVi: sentence.exampleVi });
    }
    if (text.includes('white') || text.includes('màu trắng')) {
      return renderVisualSwatch({ word: 'WHITE', colorHex: '#64748b', icon: '⚪', meaning: 'Màu trắng', id: 's_white', phonetic: '/waɪt/', speechText: 'White', sentence: sentence.example, sentenceVi: sentence.exampleVi });
    }
    if (text.includes('pink') || text.includes('màu hồng')) {
      return renderVisualSwatch({ word: 'PINK', colorHex: '#ec4899', icon: '🌸', meaning: 'Màu hồng', id: 's_pink', phonetic: '/pɪŋk/', speechText: 'Pink', sentence: sentence.example, sentenceVi: sentence.exampleVi });
    }
    if (text.includes('purple') || text.includes('màu tím')) {
      return renderVisualSwatch({ word: 'PURPLE', colorHex: '#a855f7', icon: '🟣', meaning: 'Màu tím', id: 's_purple', phonetic: '/ˈpɜː.pəl/', speechText: 'Purple', sentence: sentence.example, sentenceVi: sentence.exampleVi });
    }

    // 2. Animals (100% matched)
    let matchedIcon = '';
    let matchedLabel = '';
    let matchedHex = '#10b981';

    if (text.includes('tiger') || text.includes('con hổ')) { matchedIcon = '🐅'; matchedLabel = 'Tiger (Con hổ)'; matchedHex = '#f97316'; }
    else if (text.includes('lion') || text.includes('sư tử')) { matchedIcon = '🦁'; matchedLabel = 'Lion (Sư tử)'; matchedHex = '#eab308'; }
    else if (text.includes('monkey') || text.includes('con khỉ')) { matchedIcon = '🐒'; matchedLabel = 'Monkey (Con khỉ)'; matchedHex = '#b45309'; }
    else if (text.includes('elephant') || text.includes('con voi')) { matchedIcon = '🐘'; matchedLabel = 'Elephant (Con voi)'; matchedHex = '#64748b'; }
    else if (text.includes('peacock') || text.includes('con công')) { matchedIcon = '🦚'; matchedLabel = 'Peacock (Con công)'; matchedHex = '#0284c7'; }
    else if (text.includes('giraffe') || text.includes('hươu cao cổ')) { matchedIcon = '🦒'; matchedLabel = 'Giraffe (Hươu cao cổ)'; matchedHex = '#f59e0b'; }
    else if (text.includes('zebra') || text.includes('ngựa vằn')) { matchedIcon = '🦓'; matchedLabel = 'Zebra (Ngựa vằn)'; matchedHex = '#334155'; }
    else if (text.includes('crocodile') || text.includes('cá sấu')) { matchedIcon = '🐊'; matchedLabel = 'Crocodile (Cá sấu)'; matchedHex = '#15803d'; }
    else if (text.includes('kangaroo') || text.includes('chuột túi')) { matchedIcon = '🦘'; matchedLabel = 'Kangaroo (Chuột túi)'; matchedHex = '#d97706'; }
    else if (text.includes('hippo') || text.includes('hà mã')) { matchedIcon = '🦛'; matchedLabel = 'Hippo (Hà mã)'; matchedHex = '#64748b'; }
    else if (text.includes('cat') || text.includes('con mèo')) { matchedIcon = '🐱'; matchedLabel = 'Cat (Con mèo)'; matchedHex = '#ec4899'; }
    else if (text.includes('dog') || text.includes('con chó')) { matchedIcon = '🐶'; matchedLabel = 'Dog (Con chó)'; matchedHex = '#f59e0b'; }
    else if (text.includes('bird') || text.includes('con chim')) { matchedIcon = '🐦'; matchedLabel = 'Bird (Con chim)'; matchedHex = '#3b82f6'; }
    else if (text.includes('rabbit') || text.includes('con thỏ')) { matchedIcon = '🐰'; matchedLabel = 'Rabbit (Con thỏ)'; matchedHex = '#10b981'; }
    else if (text.includes('parrot') || text.includes('con vẹt')) { matchedIcon = '🦜'; matchedLabel = 'Parrot (Con vẹt)'; matchedHex = '#10b981'; }
    else if (text.includes('hamster')) { matchedIcon = '🐹'; matchedLabel = 'Hamster'; matchedHex = '#f97316'; }
    else if (text.includes('goldfish') || text.includes('cá vàng')) { matchedIcon = '🐠'; matchedLabel = 'Goldfish (Cá vàng)'; matchedHex = '#f59e0b'; }
    else if (text.includes('fish') || text.includes('món cá') || text.includes('con cá')) { matchedIcon = '🐟'; matchedLabel = 'Fish (Cá)'; matchedHex = '#06b6d4'; }
    
    // 3. Food & Drinks
    else if (text.includes('orange juice') || text.includes('nước cam')) { matchedIcon = '🧃'; matchedLabel = 'Orange juice (Nước cam)'; matchedHex = '#f97316'; }
    else if (text.includes('juice') || text.includes('nước ép')) { matchedIcon = '🧃'; matchedLabel = 'Juice (Nước ép)'; matchedHex = '#f97316'; }
    else if (text.includes('milk') || text.includes('sữa')) { matchedIcon = '🥛'; matchedLabel = 'Milk (Sữa)'; matchedHex = '#64748b'; }
    else if (text.includes('water') || text.includes('nước')) { matchedIcon = '💧'; matchedLabel = 'Water (Nước)'; matchedHex = '#3b82f6'; }
    else if (text.includes('bread') || text.includes('bánh mì')) { matchedIcon = '🍞'; matchedLabel = 'Bread (Bánh mì)'; matchedHex = '#d97706'; }
    else if (text.includes('rice') || text.includes('cơm')) { matchedIcon = '🍚'; matchedLabel = 'Rice (Cơm)'; matchedHex = '#f59e0b'; }
    else if (text.includes('chicken') || text.includes('thịt gà')) { matchedIcon = '🍗'; matchedLabel = 'Chicken (Thịt gà)'; matchedHex = '#f97316'; }
    else if (text.includes('meat') || text.includes('thịt')) { matchedIcon = '🥩'; matchedLabel = 'Meat (Thịt)'; matchedHex = '#ef4444'; }
    else if (text.includes('egg') || text.includes('trứng')) { matchedIcon = '🥚'; matchedLabel = 'Eggs (Trứng)'; matchedHex = '#eab308'; }
    else if (text.includes('apple') || text.includes('quả táo')) { matchedIcon = '🍎'; matchedLabel = 'Apple (Táo)'; matchedHex = '#ef4444'; }

    // 4. School Items
    else if (text.includes('pencil case') || text.includes('hộp bút')) { matchedIcon = '👝'; matchedLabel = 'Pencil case (Hộp bút)'; matchedHex = '#f97316'; }
    else if (text.includes('pencil') || text.includes('bút chì')) { matchedIcon = '✏️'; matchedLabel = 'Pencil (Bút chì)'; matchedHex = '#f59e0b'; }
    else if (text.includes('pen') || text.includes('bút mực')) { matchedIcon = '🖊️'; matchedLabel = 'Pen (Bút mực)'; matchedHex = '#3b82f6'; }
    else if (text.includes('ruler') || text.includes('thước')) { matchedIcon = '📏'; matchedLabel = 'Ruler (Thước kẻ)'; matchedHex = '#10b981'; }
    else if (text.includes('eraser') || text.includes('tẩy')) { matchedIcon = '🧽'; matchedLabel = 'Eraser (Cục tẩy)'; matchedHex = '#ec4899'; }
    else if (text.includes('notebook') || text.includes('vở')) { matchedIcon = '📒'; matchedLabel = 'Notebook (Vở ghi)'; matchedHex = '#06b6d4'; }
    else if (text.includes('book') || text.includes('sách')) { matchedIcon = '📚'; matchedLabel = 'Book (Sách)'; matchedHex = '#3b82f6'; }
    else if (text.includes('school bag') || text.includes('cặp') || text.includes('ba lô')) { matchedIcon = '🎒'; matchedLabel = 'School bag (Cặp sách)'; matchedHex = '#8b5cf6'; }
    else if (text.includes('crayon') || text.includes('sáp màu')) { matchedIcon = '🖍️'; matchedLabel = 'Crayon (Sáp màu)'; matchedHex = '#eab308'; }

    // 5. Clothes
    else if (text.includes('t-shirt') || text.includes('áo thun') || text.includes('áo phông')) { matchedIcon = '👕'; matchedLabel = 'T-shirt (Áo phông)'; matchedHex = '#10b981'; }
    else if (text.includes('skirt') || text.includes('chân váy')) { matchedIcon = '👗'; matchedLabel = 'Skirt (Chân váy)'; matchedHex = '#ec4899'; }
    else if (text.includes('jacket') || text.includes('áo khoác')) { matchedIcon = '🧥'; matchedLabel = 'Jacket (Áo khoác)'; matchedHex = '#3b82f6'; }
    else if (text.includes('cap') || text.includes('mũ')) { matchedIcon = '🧢'; matchedLabel = 'Cap (Mũ lưỡi trai)'; matchedHex = '#f59e0b'; }
    else if (text.includes('trouser') || text.includes('quần tây')) { matchedIcon = '👖'; matchedLabel = 'Trousers (Quần dài)'; matchedHex = '#475569'; }
    else if (text.includes('jean') || text.includes('quần bò')) { matchedIcon = '👖'; matchedLabel = 'Jeans (Quần bò)'; matchedHex = '#2563eb'; }
    else if (text.includes('shoe') || text.includes('giày')) { matchedIcon = '👟'; matchedLabel = 'Shoes (Đôi giày)'; matchedHex = '#06b6d4'; }
    else if (text.includes('sock') || text.includes('tất') || text.includes('vớ')) { matchedIcon = '🧦'; matchedLabel = 'Socks (Đôi tất)'; matchedHex = '#f97316'; }

    // 6. Toys & Transport
    else if (text.includes('car') || text.includes('ô tô')) { matchedIcon = '🚗'; matchedLabel = 'Car (Ô tô)'; matchedHex = '#ef4444'; }
    else if (text.includes('robot') || text.includes('người máy')) { matchedIcon = '🤖'; matchedLabel = 'Robot (Người máy)'; matchedHex = '#3b82f6'; }
    else if (text.includes('doll') || text.includes('búp bê')) { matchedIcon = '🪆'; matchedLabel = 'Doll (Búp bê)'; matchedHex = '#ec4899'; }
    else if (text.includes('kite') || text.includes('diều')) { matchedIcon = '🪁'; matchedLabel = 'Kite (Cánh diều)'; matchedHex = '#10b981'; }
    else if (text.includes('teddy') || text.includes('gấu bông')) { matchedIcon = '🧸'; matchedLabel = 'Teddy bear (Gấu bông)'; matchedHex = '#92400e'; }
    else if (text.includes('plane') || text.includes('máy bay')) { matchedIcon = '✈️'; matchedLabel = 'Plane (Máy bay)'; matchedHex = '#06b6d4'; }
    else if (text.includes('train') || text.includes('tàu hỏa')) { matchedIcon = '🚆'; matchedLabel = 'Train (Tàu hỏa)'; matchedHex = '#10b981'; }
    else if (text.includes('ship') || text.includes('tàu thủy')) { matchedIcon = '🚢'; matchedLabel = 'Ship (Tàu thủy)'; matchedHex = '#3b82f6'; }
    else if (text.includes('bike') || text.includes('xe đạp')) { matchedIcon = '🚲'; matchedLabel = 'Bike (Xe đạp)'; matchedHex = '#10b981'; }
    else if (text.includes('football') || text.includes('bóng đá')) { matchedIcon = '⚽'; matchedLabel = 'Football (Bóng đá)'; matchedHex = '#10b981'; }

    // 7. Weather
    else if (text.includes('sunny') || text.includes('nắng')) { matchedIcon = '☀️'; matchedLabel = 'Sunny (Nắng)'; matchedHex = '#eab308'; }
    else if (text.includes('rainy') || text.includes('mưa')) { matchedIcon = '🌧️'; matchedLabel = 'Rainy (Mưa)'; matchedHex = '#3b82f6'; }
    else if (text.includes('windy') || text.includes('gió')) { matchedIcon = '💨'; matchedLabel = 'Windy (Gió)'; matchedHex = '#06b6d4'; }
    else if (text.includes('cloudy') || text.includes('mây')) { matchedIcon = '☁️'; matchedLabel = 'Cloudy (Nhiều mây)'; matchedHex = '#64748b'; }
    else if (text.includes('snowy') || text.includes('tuyết')) { matchedIcon = '❄️'; matchedLabel = 'Snowy (Tuyết)'; matchedHex = '#94a3b8'; }
    else if (text.includes('stormy') || text.includes('bão')) { matchedIcon = '⛈️'; matchedLabel = 'Stormy (Giông bão)'; matchedHex = '#475569'; }

    // 8. People & Greetings
    else if (text.includes('hello') || text.includes('hi') || text.includes('chào')) { matchedIcon = '👋'; matchedLabel = 'Hello (Chào bạn)'; matchedHex = '#10b981'; }
    else if (text.includes('bye') || text.includes('tạm biệt')) { matchedIcon = '👋'; matchedLabel = 'Goodbye (Tạm biệt)'; matchedHex = '#ef4444'; }
    else if (text.includes('meet') || text.includes('gặp')) { matchedIcon = '🤝'; matchedLabel = 'Nice to meet you'; matchedHex = '#3b82f6'; }
    else if (text.includes('fine') || text.includes('khỏe') || text.includes('thank')) { matchedIcon = '😊'; matchedLabel = 'I am fine, thank you'; matchedHex = '#10b981'; }
    else if (text.includes('teacher') || text.includes('thầy') || text.includes('cô')) { matchedIcon = '👩‍🏫'; matchedLabel = 'Teacher (Giáo viên)'; matchedHex = '#10b981'; }
    else if (text.includes('doctor') || text.includes('bác sĩ')) { matchedIcon = '👨‍⚕️'; matchedLabel = 'Doctor (Bác sĩ)'; matchedHex = '#ef4444'; }
    else if (text.includes('family') || text.includes('gia đình')) { matchedIcon = '👨‍👩‍👧‍👦'; matchedLabel = 'Family (Gia đình)'; matchedHex = '#10b981'; }

    // Default fallback to currentVocab
    if (!matchedIcon) {
      return renderVisualSwatch(currentVocab);
    }

    return (
      <div 
        className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[340px] lg:max-w-[380px] h-[175px] sm:h-[200px] lg:h-[225px] rounded-3xl relative flex flex-col items-center justify-center p-4 overflow-hidden shadow-lg border-[3px] border-white/80 transition-transform duration-300 group-hover:scale-105 mx-auto"
        style={{
          background: `linear-gradient(135deg, ${matchedHex}dd, ${matchedHex})`,
        }}
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xs rounded-3xl pointer-events-none" />
        <span className="text-6xl sm:text-7xl lg:text-8xl drop-shadow-md select-none transform transition-transform group-hover:scale-110 z-10 animate-float">
          {matchedIcon}
        </span>
        <span className="mt-2.5 text-xs sm:text-sm font-black text-white/95 uppercase tracking-wider px-4 py-1.5 rounded-full bg-black/25 backdrop-blur-xs z-10 border border-white/20 shadow-xs max-w-[90%] truncate text-center">
          {matchedLabel}
        </span>
      </div>
    );
  };

  // Load voices for US / UK accents
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setAvailableVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Levenshtein string distance algorithm
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  // Rigorous yet encouraging pronunciation matching algorithm with phonetic tolerances (e.g. for 'lane')
  const calculatePronunciationScore = (spoken: string, target: string): number => {
    return calculatePronunciationScoreWithTolerances(spoken, target);
  };

  // TTS Speech Synthesis with US / UK accent support
  const handleListen = (slow: boolean = false, overrideAccent?: 'US' | 'UK') => {
    playSoundEffect('click');
    const targetAccent = overrideAccent || accent;
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = activeTab === 'vocabulary' ? currentVocab.speechText : currentSentence.speechText;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      const targetLang = targetAccent === 'UK' ? 'en-GB' : 'en-US';
      utterance.lang = targetLang;
      utterance.rate = slow ? 0.6 : 0.95;
      utterance.pitch = targetAccent === 'UK' ? 1.05 : 1.1;

      // Find appropriate voice in the browser
      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.replace('_', '-') === targetLang) ||
                           voices.find(v => v.lang.toLowerCase().includes(targetAccent === 'UK' ? 'gb' : 'us')) ||
                           voices.find(v => v.lang.toLowerCase().startsWith('en'));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      
      utterance.onstart = () => {
        const accentTag = targetAccent === 'UK' ? 'UK 🇬🇧' : 'US 🇺🇸';
        setSpeechFeedback(slow ? `🐢 Đang nghe chậm (${accentTag}): "${textToSpeak}"` : `🔊 Đang nghe (${accentTag}): "${textToSpeak}"`);
      };

      utterance.onend = () => {
        setSpeechFeedback('Bé hãy bấm nút "Speak" để luyện nói nhé!');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setSpeechFeedback(`🔊 Đang phát âm: ${activeTab === 'vocabulary' ? currentVocab.word : currentSentence.example}`);
    }
  };

  // Waveform animation during speaking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeakingActive) {
      interval = setInterval(() => {
        setWaveHeights([
          Math.floor(Math.random() * 25) + 8,
          Math.floor(Math.random() * 35) + 12,
          Math.floor(Math.random() * 40) + 15,
          Math.floor(Math.random() * 35) + 12,
          Math.floor(Math.random() * 25) + 8,
          Math.floor(Math.random() * 18) + 6,
        ]);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSpeakingActive]);

  const recognitionRef = useRef<any>(null);

  // Evaluate recognition transcript with smart pedagogical grading & interactive loop
  const evaluatePronunciationResult = (transcript: string, target: string) => {
    setIsSpeakingActive(false);
    setRecognizedTranscript(transcript);
    const score = calculatePronunciationScore(transcript, target);
    const targetPhonetic = activeTab === 'vocabulary' ? currentVocab.phonetic : undefined;
    const evalResult = evaluateSmartPronunciation(
      transcript,
      target,
      score,
      targetPhonetic,
      practiceAttemptCount
    );
    setPronunciationEvaluation(evalResult);

    // Pass threshold: Must score >= 80% to be accepted
    if (evalResult.isPassed) {
      playSoundEffect('success');
      setSpeechSuccess(true);
      setPracticeAttemptCount(1);
      setSpeechFeedback(evalResult.feedbackVi);
      setMascotBubble(evalResult.mascotEncouragement);

      const activeStudentName = isGuestMode ? 'Khách trải nghiệm' : (userName || 'Học sinh');

      setPracticedItems(prev => {
        const next = new Set(prev);
        if (activeTab === 'sentences' && currentSentence?.id) {
          next.add(currentSentence.id);
          recordPracticedSentence(activeStudentName, currentSentence.id, selectedGrade);
        } else if (currentVocab?.id) {
          next.add(currentVocab.id);
          recordPracticedWord(activeStudentName, currentVocab.id, selectedGrade);
        }
        return next;
      });

      // Record to Student Activity Timeline (isolated per grade for Guest Mode)
      recordStudentActivity({
        type: activeTab === 'sentences' ? 'speaking_sentence' : 'speaking_vocab',
        titleEn: activeTab === 'sentences' ? `Sentence Practice · Grade ${selectedGrade}` : `Vocabulary · ${currentVocab?.word || target}`,
        titleVi: activeTab === 'sentences' ? `Luyện nói mẫu câu (Khối ${selectedGrade}): "${target}"` : `Luyện phát âm từ vựng (Khối ${selectedGrade}): ${currentVocab?.word || target}`,
        detailEn: `Spoke "${transcript}" with ${score}% AI accuracy in Grade ${selectedGrade} (+10 EP)`,
        detailVi: `Đã phát âm "${transcript}" đạt ${score}% độ chuẩn AI Khối ${selectedGrade} (+10 EP)`,
        score,
        epAwarded: 10,
        icon: activeTab === 'sentences' ? '💬' : '🎙️',
        badgeColor: 'emerald',
        grade: selectedGrade
      }, activeStudentName, selectedGrade);

      // Check if current unit is now 100% completed to dynamically unlock the next unit
      const curUnitNum = currentUnit.unitNumber || 1;
      const isNowCompleted = isUnitFullyCompleted(selectedGrade, curUnitNum, activeStudentName);
      if (isNowCompleted) {
        markUnitCompleted(selectedGrade, curUnitNum);
        const nextUnitNum = curUnitNum + 1;
        const nextUnit = availableUnits.find(u => (u.unitNumber || 1) === nextUnitNum);
        if (nextUnit) {
          recordStudentActivity({
            type: 'badge_unlocked',
            titleEn: `Unit ${nextUnitNum} Unlocked! · ${nextUnit.unitName || nextUnit.unitFullName}`,
            titleVi: `Mở khóa thành công Unit ${nextUnitNum}: ${nextUnit.unitName || nextUnit.unitFullName} 🔓`,
            detailEn: `Completed 100% of Unit ${curUnitNum}! Unit ${nextUnitNum} is now unlocked and ready!`,
            detailVi: `Hoàn thành xuất sắc 100% Unit ${curUnitNum} (từ vựng và mẫu câu). Hệ thống tự động mở khóa Unit ${nextUnitNum} để vào học!`,
            score: 100,
            epAwarded: 0,
            icon: '🔓',
            badgeColor: 'blue',
            grade: selectedGrade
          }, activeStudentName, selectedGrade);
        }
      }

      let nextTrees = virtualTrees;
      setEcoPoints(prev => {
        const newEP = prev + 10;
        if (isGuestMode) {
          setGuestGradeEcoPoints(selectedGrade, newEP);
        }
        const calcTrees = computeLogicalTrees(newEP);
        if (calcTrees > virtualTrees) {
          nextTrees = calcTrees;
          setVirtualTrees(nextTrees);
          if (isGuestMode) {
            setGuestGradeVirtualTrees(selectedGrade, nextTrees);
          }
          setMascotBubble('🌳 Wow! Bạn đã trồng được thêm 1 cây ảo xanh tươi!');
          playSoundEffect('celebrate');

          // Record tree milestone to timeline
          recordStudentActivity({
            type: 'tree_planted',
            titleEn: `Virtual Tree Planted! · Grade ${selectedGrade}`,
            titleVi: `Trồng thêm 1 cây xanh mới vào khu vườn (Khối ${selectedGrade})`,
            detailEn: `Milestone reached! You now have ${nextTrees} virtual trees in Grade ${selectedGrade}`,
            detailVi: `Đạt mốc điểm sinh thái! Bạn đã vun trồng thành công ${nextTrees} cây xanh ảo Khối ${selectedGrade}`,
            score: 100,
            epAwarded: 0,
            icon: '🌳',
            badgeColor: 'emerald',
            grade: selectedGrade
          }, activeStudentName, selectedGrade);
        }
        return newEP;
      });

      // Dynamically update student's score and trees in Teacher Dashboard (strictly isolated from Guest Mode)
      if (!isGuestMode) {
        updateStudentProgress(userName, score, nextTrees, 10);
        if (activeAssignmentId) {
          recordStudentAssignmentCompletion(userName, activeAssignmentId);
        } else {
          const asgs = getTeacherAssignments().filter(a => isAssignmentForStudent(a, studentClassInput, selectedGrade));
          if (asgs.length > 0) {
            recordStudentAssignmentCompletion(userName, asgs[0].id);
          }
        }
      } else {
        if (activeAssignmentId) {
          recordGuestAssignmentCompletion(activeAssignmentId);
        }
      }
    } else {
      // Pedagogical encouraging feedback: Gentle chime, positive message, practice loop
      playSoundEffect('chime');
      setSpeechSuccess(false);

      if (practiceAttemptCount >= 4) {
        // Max 4 attempts reached without passing: auto-skip and proceed smoothly without awarding EP
        const skipFeedbackVi = "Cố gắng lắm! Em đã rất nỗ lực thử thách 4 lần. Let's move to the next challenge! / Cùng chuyển sang thử thách tiếp theo nhé! 🌟";
        setSpeechFeedback(skipFeedbackVi);
        setMascotBubble("Cố gắng lắm! Em đã thử 4 lần rất kiên trì. Let's move to the next challenge! Cùng chuyển sang thử thách tiếp theo nhé! 🌟");

        // Auto-skip and advance to next challenge smoothly after 2.2s delay without awarding EP
        setTimeout(() => {
          setPracticeAttemptCount(1);
          setPronunciationEvaluation(null);
          setSpeechSuccess(null);
          if (activeTab === 'vocabulary') {
            if (currentVocabIndex < vocabularyList.length - 1) {
              const nextItem = vocabularyList[currentVocabIndex + 1];
              setSelectedVocabId(nextItem.id);
              setSpeechFeedback(`Bé đã chuyển sang: ${nextItem.word} (${nextItem.meaning}). Nghe mẫu rồi nói nhé!`);
            } else {
              setMascotBubble(`Bé đã hoàn thành lượt luyện tập từ vựng bài ${currentUnit.unitFullName}! 🌟`);
            }
          } else {
            if (selectedSentenceIndex < sentencesList.length - 1) {
              setSelectedSentenceIndex(prev => prev + 1);
              setSpeechFeedback('Bé đã chuyển sang mẫu câu tiếp theo. Nghe mẫu rồi nói nhé!');
            } else {
              setMascotBubble(`Bé đã hoàn thành lượt luyện tập mẫu câu bài ${currentUnit.unitFullName}! 🌟`);
            }
          }
        }, 2200);
      } else {
        setSpeechFeedback(evalResult.feedbackVi);
        setMascotBubble(evalResult.mascotEncouragement);
        setPracticeAttemptCount(prev => prev + 1);

        // Record practice attempt only for real students
        if (!isGuestMode) {
          updateStudentProgress(userName, score > 0 ? score : undefined);
        }
      }
    }
  };

  // Mobile-Optimized Web Speech Recognition with synchronous user gesture, timeout guard & proper error handling
  const handleStartSpeak = () => {
    // If already active, toggle off / cancel recognition cleanly
    if (isSpeakingActive) {
      clearSpeechTimeout();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      setIsSpeakingActive(false);
      setSpeechFeedback('Đã dừng nghe. Bé bấm nút khi sẵn sàng nói nhé!');
      return;
    }

    playSoundEffect('click');
    setSpeechSuccess(null);
    setRecognizedTranscript('');

    const target = activeTab === 'vocabulary' ? currentVocab.speechText : currentSentence.speechText;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setSpeechSuccess(false);
      setSpeechFeedback('⚠️ Trình duyệt chưa hỗ trợ Web Speech API. Bé hãy mở trên Google Chrome, Edge hoặc Safari nhé!');
      setMicNoticeModal({
        isOpen: true,
        type: 'unsupported',
        title: 'Trình duyệt chưa hỗ trợ Web Speech API',
        message: 'Tính năng nhận diện giọng nói cần trình duyệt Google Chrome, Microsoft Edge hoặc Safari hiện đại.',
        isIframeBlocked: false
      });
      return;
    }

    const isInsideIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    // Synchronously launch SpeechRecognition directly inside click/touch event
    // to preserve Mobile Safari / WebKit User Activation token
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      clearSpeechTimeout();

      const recognition = new SpeechRec();
      recognitionRef.current = recognition;

      // 1. Mobile-optimized standard SpeechRecognition configuration
      recognition.lang = accent === 'UK' ? 'en-GB' : 'en-US';
      recognition.continuous = false;      // Required false on mobile to prevent abrupt pipeline termination
      recognition.interimResults = false;   // Required false on mobile to prevent stream stall
      recognition.maxAlternatives = 1;     // Strict 1 alternative for fast, lightweight mobile performance

      recognition.onstart = () => {
        setIsSpeakingActive(true);
        setSpeechFeedback(`🎤 Đang lắng nghe giọng của bé (${accent === 'UK' ? 'Chuẩn UK 🇬🇧' : 'Chuẩn US 🇺🇸'})... Hãy đọc to và rõ ràng nhé!`);
        setMascotBubble('I am listening! Nói thật to và chuẩn nhé!');

        // 2. Mobile Timeout Guard: 8.5 seconds timeout if no speech or recognition hangs
        clearSpeechTimeout();
        speechTimeoutRef.current = setTimeout(() => {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.abort();
            }
          } catch {}
          clearSpeechTimeout();
          setIsSpeakingActive(false);
          setSpeechSuccess(false);
          playSoundEffect('chime');

          if (practiceAttemptCount >= 4) {
            const skipMsgVi = "Cố gắng lắm! Em đã rất nỗ lực thử thách 4 lần. Let's move to the next challenge! / Cùng chuyển sang thử thách tiếp theo nhé! 🌟";
            setSpeechFeedback(skipMsgVi);
            setMascotBubble("Cố gắng lắm! Em đã thử 4 lần rất kiên trì. Let's move to the next challenge! Cùng chuyển sang thử thách tiếp theo nhé! 🌟");
            setTimeout(() => {
              setPracticeAttemptCount(1);
              setPronunciationEvaluation(null);
              setSpeechSuccess(null);
              if (activeTab === 'vocabulary') {
                if (currentVocabIndex < vocabularyList.length - 1) {
                  const nextItem = vocabularyList[currentVocabIndex + 1];
                  setSelectedVocabId(nextItem.id);
                  setSpeechFeedback(`Bé đã chuyển sang: ${nextItem.word} (${nextItem.meaning}). Nghe mẫu rồi nói nhé!`);
                }
              } else {
                if (selectedSentenceIndex < sentencesList.length - 1) {
                  setSelectedSentenceIndex(prev => prev + 1);
                  setSpeechFeedback('Bé đã chuyển sang mẫu câu tiếp theo. Nghe mẫu rồi nói nhé!');
                }
              }
            }, 2200);
          } else {
            setSpeechFeedback(`Chưa nghe rõ giọng bé (Lần thử ${practiceAttemptCount}/4), bé bấm nút và nói lại nhé! 🎤`);
            setMascotBubble(`Chưa nghe rõ giọng bé (Lần thử ${practiceAttemptCount}/4), bé bấm nút và nói lại nhé! 🎤`);
            setPracticeAttemptCount(prev => prev + 1);
          }
        }, 8500);
      };

      recognition.onresult = (event: any) => {
        clearSpeechTimeout();
        setIsSpeakingActive(false);

        let bestTranscript = '';
        if (event.results && event.results[0] && event.results[0][0]) {
          bestTranscript = event.results[0][0].transcript;
        }

        evaluatePronunciationResult(bestTranscript, target);
      };

      recognition.onerror = (event: any) => {
        clearSpeechTimeout();
        setIsSpeakingActive(false);
        const errType = event.error;

        if (errType === 'no-speech') {
          playSoundEffect('chime');
          setSpeechSuccess(false);
          if (practiceAttemptCount >= 4) {
            const skipMsgVi = "Cố gắng lắm! Em đã rất nỗ lực thử thách 4 lần. Let's move to the next challenge! / Cùng chuyển sang thử thách tiếp theo nhé! 🌟";
            setSpeechFeedback(skipMsgVi);
            setMascotBubble("Cố gắng lắm! Em đã thử 4 lần rất kiên trì. Let's move to the next challenge! Cùng chuyển sang thử thách tiếp theo nhé! 🌟");
            setTimeout(() => {
              setPracticeAttemptCount(1);
              setPronunciationEvaluation(null);
              setSpeechSuccess(null);
              if (activeTab === 'vocabulary') {
                if (currentVocabIndex < vocabularyList.length - 1) {
                  const nextItem = vocabularyList[currentVocabIndex + 1];
                  setSelectedVocabId(nextItem.id);
                  setSpeechFeedback(`Bé đã chuyển sang: ${nextItem.word} (${nextItem.meaning}). Nghe mẫu rồi nói nhé!`);
                }
              } else {
                if (selectedSentenceIndex < sentencesList.length - 1) {
                  setSelectedSentenceIndex(prev => prev + 1);
                  setSpeechFeedback('Bé đã chuyển sang mẫu câu tiếp theo. Nghe mẫu rồi nói nhé!');
                }
              }
            }, 2200);
          } else {
            setSpeechFeedback(`Bé chưa nói gì nè (Lần thử ${practiceAttemptCount}/4), hãy thử lại nhé! 🎤`);
            setMascotBubble(`Bé chưa nói gì nè (Lần thử ${practiceAttemptCount}/4), hãy thử lại nhé! 🎤`);
            setPracticeAttemptCount(prev => prev + 1);
          }
        } else if (errType === 'not-allowed' || errType === 'service-not-allowed' || errType === 'permission-denied') {
          setSpeechSuccess(false);
          if (isInsideIframe) {
            setSpeechFeedback('⚠️ Microphone bị chặn trong khung nhúng (iframe). Bé hãy mở trang trên tab mới để nói nhé!');
            setMicNoticeModal({
              isOpen: true,
              type: 'iframe_blocked',
              title: 'Microphone bị chặn bởi khung nhúng (iframe)',
              message: 'Trình duyệt không cho phép quyền Micro chạy trong khung nhúng (iframe). Bé hãy bấm "Mở trong tab mới" để luyện nói ngay!',
              isIframeBlocked: true
            });
          } else {
            setSpeechFeedback('Vui lòng cấp quyền truy cập Micro trên trình duyệt điện thoại để tiếp tục!');
            setMascotBubble('Vui lòng cấp quyền truy cập Micro trên trình duyệt điện thoại để tiếp tục!');
            setMicNoticeModal({
              isOpen: true,
              type: 'permission_denied',
              title: 'Cần cấp quyền truy cập Microphone',
              message: 'Vui lòng cấp quyền truy cập Micro trên trình duyệt điện thoại để tiếp tục! Bé hãy bấm vào biểu tượng Ổ khóa hoặc Micro trên thanh địa chỉ URL và chọn "Cho phép" (Allow) rồi bấm Thử lại.',
              isIframeBlocked: false
            });
          }
        } else if (errType === 'audio-capture') {
          setSpeechSuccess(false);
          setSpeechFeedback('⚠️ Không thu được tín hiệu âm thanh từ Microphone. Bé hãy kiểm tra kết nối mic nhé!');
        } else if (errType === 'network') {
          setSpeechSuccess(false);
          setSpeechFeedback('⚠️ Lỗi kết nối mạng khi nhận diện giọng nói. Bé vui lòng kiểm tra kết nối Internet!');
        } else if (errType !== 'aborted') {
          setSpeechSuccess(false);
          setSpeechFeedback('Chưa nghe rõ giọng bé, bé bấm nút và nói lại nhé! 🎤');
          setMascotBubble('Chưa nghe rõ giọng bé, bé bấm nút và nói lại nhé! 🎤');
        }
      };

      recognition.onend = () => {
        clearSpeechTimeout();
        setIsSpeakingActive(false);
      };

      // Direct synchronous launch to satisfy mobile touch/click user activation policies
      recognition.start();
    } catch (err: any) {
      clearSpeechTimeout();
      console.warn('SpeechRecognition start error:', err);
      setIsSpeakingActive(false);
      setSpeechSuccess(false);
      if (isInsideIframe) {
        setSpeechFeedback('⚠️ Khung nhúng (iframe) hạn chế micro. Bé hãy mở trong tab mới nhé!');
        setMicNoticeModal({
          isOpen: true,
          type: 'iframe_blocked',
          title: 'Khung nhúng chặn Microphone',
          message: 'Khung nhúng (iframe) đang hạn chế tính năng Micro. Hãy mở trang web trên tab riêng của trình duyệt để học tập mượt mà nhất!',
          isIframeBlocked: true
        });
      } else {
        setSpeechFeedback('Vui lòng cấp quyền truy cập Micro trên trình duyệt điện thoại để tiếp tục!');
      }
    }
  };

  const remainingEPToNextTree = computeRemainingEPToNextTree(ecoPoints);
  const goalCount = practicedItems.size;

  const currentVocabIndex = vocabularyList.findIndex(v => v.id === currentVocab.id);

  const handlePreviousItem = () => {
    playSoundEffect('click');
    setPronunciationEvaluation(null);
    setPracticeAttemptCount(1);
    if (activeTab === 'vocabulary') {
      if (currentVocabIndex > 0) {
        const prevItem = vocabularyList[currentVocabIndex - 1];
        setSelectedVocabId(prevItem.id);
        setSpeechFeedback(`Bé đã chuyển sang: ${prevItem.word} (${prevItem.meaning}). Nghe mẫu rồi nói nhé!`);
        setSpeechSuccess(null);
      }
    } else {
      if (selectedSentenceIndex > 0) {
        setSelectedSentenceIndex(selectedSentenceIndex - 1);
        setSpeechFeedback('Bé đã chuyển sang mẫu câu trước.');
        setSpeechSuccess(null);
      }
    }
  };

  const handleNextItem = () => {
    playSoundEffect('click');
    setPronunciationEvaluation(null);
    setPracticeAttemptCount(1);
    if (activeTab === 'vocabulary') {
      if (currentVocabIndex < vocabularyList.length - 1) {
        const nextItem = vocabularyList[currentVocabIndex + 1];
        setSelectedVocabId(nextItem.id);
        setSpeechFeedback(`Bé đã chuyển sang: ${nextItem.word} (${nextItem.meaning}). Nghe mẫu rồi nói nhé!`);
        setSpeechSuccess(null);
      } else {
        playSoundEffect('celebrate');
        setMascotBubble(`Bé đã hoàn thành xuất sắc tất cả từ vựng bài ${currentUnit.unitFullName}! 🌟`);
      }
    } else {
      if (selectedSentenceIndex < sentencesList.length - 1) {
        setSelectedSentenceIndex(selectedSentenceIndex + 1);
        setSpeechFeedback('Bé đã chuyển sang mẫu câu tiếp theo.');
        setSpeechSuccess(null);
      } else {
        playSoundEffect('celebrate');
        setMascotBubble(`Bé đã hoàn thành tất cả mẫu câu bài ${currentUnit.unitFullName}! 🌟`);
      }
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat font-sans select-none flex flex-col justify-between overflow-x-hidden forest-app-bg"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundColor: '#7ec05b'
      }}
    >
      {/* Background soft ambient tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/10 via-transparent to-emerald-900/15 pointer-events-none" />

      {/* TOP FLOATING HEADER - Responsive for Mobile & Desktop */}
      <header className="relative z-20 px-2 sm:px-4 lg:px-6 pt-2.5 sm:pt-3 shrink-0">
        <div className="max-w-[1520px] mx-auto bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl sm:rounded-full px-3 sm:px-5 lg:px-7 py-2 sm:py-2.5 shadow-md border-[2px] border-[#86c898] flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
          
          {/* Logo Zone & Mobile Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                playSoundEffect('click');
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="lg:hidden p-1.5 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors border border-[#86c898] cursor-pointer"
              title="Menu danh mục"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer hover:opacity-90 transition-opacity shrink-0" 
              onClick={() => playSoundEffect('click')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-200/80 flex items-center justify-center text-emerald-800 shadow-inner shrink-0 border border-[#86c898]">
                <svg viewBox="0 0 36 36" className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600 fill-current">
                  <path d="M14 6 C8 12 8 22 18 26 C28 22 28 12 22 6 C19 12 17 12 14 6 Z" fill="#22c55e" />
                  <path d="M8 18 C4 22 4 28 10 30 C16 28 16 22 12 18 C10 22 9 22 8 18 Z" fill="#15803d" />
                </svg>
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight text-emerald-950 font-display whitespace-nowrap">
                  ECO<span className="text-emerald-700">-VOICE</span>
                </span>
                <span className="text-xs sm:text-sm md:text-base lg:text-[17px] font-extrabold text-emerald-800 font-sans whitespace-nowrap">
                  (AI Pronunciation and Eco-Learning Companion)
                </span>
              </div>
            </div>
          </div>

        {/* Right User Bar: Greetings, Eco Points, Trees, Login */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm font-semibold text-emerald-950 shrink-0">
            {/* User Greeting */}
            <div 
              onClick={() => {
                setLoginPromptNotice(null);
                setActiveModal('login');
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full hover:bg-emerald-100/60 transition-colors cursor-pointer shrink-0 border border-emerald-200/60"
              title="Thông tin tài khoản & Chuyển đổi vai trò"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-200 border border-white overflow-hidden flex items-center justify-center text-xs sm:text-base shadow-sm shrink-0">
                {userRole === 'teacher' ? '👩‍🏫' : (isGuestMode || userRole === 'guest' || !isLoggedIn ? '🌟' : '👧')}
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-emerald-950 text-xs sm:text-sm whitespace-nowrap">
                  {userRole === 'teacher' 
                    ? 'Thầy/Cô' 
                    : (isGuestMode || userRole === 'guest' || !isLoggedIn 
                        ? 'Khách trải nghiệm / Visitor' 
                        : (userName || 'Khách trải nghiệm / Visitor'))}
                </span>
                <span className="text-[9px] font-black uppercase text-emerald-700 tracking-wider">
                  {userRole === 'teacher' 
                    ? 'GV ADMIN' 
                    : (isGuestMode || userRole === 'guest' || !isLoggedIn 
                        ? 'DEMO USER' 
                        : 'HỌC SINH')}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-emerald-600 font-bold">▾</span>
            </div>

            <div className="hidden sm:block h-4 sm:h-5 w-[1.5px] bg-[#86c898]/70 shrink-0" />

            {/* Eco Points */}
            <div 
              onClick={() => setActiveModal('garden')}
              className="flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform shrink-0" 
              title="Eco Points"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-400 shrink-0" />
              <span className="font-extrabold text-emerald-950 tabular-nums whitespace-nowrap">{ecoPoints} EP</span>
            </div>

            {/* Virtual Trees */}
            <div 
              onClick={() => setActiveModal('garden')}
              className="flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform shrink-0" 
              title="Virtual trees planted"
            >
              <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 fill-emerald-600 shrink-0" />
              <span className="font-extrabold text-emerald-950 tabular-nums whitespace-nowrap">
                {virtualTrees} {virtualTrees === 1 ? 'tree' : 'trees'}
              </span>
            </div>

            {/* Login / Profile button */}
            <button
              onClick={() => {
                playSoundEffect('click');
                setLoginPromptNotice(null);
                setActiveModal('login');
              }}
              className="bg-gradient-to-r from-[#0d4a2b] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] active:scale-95 text-white px-3 sm:px-5 py-1 sm:py-1.5 rounded-full shadow-[0_2px_8px_rgba(13,74,43,0.3)] transition-all duration-150 flex flex-col items-center justify-center leading-tight cursor-pointer shrink-0 whitespace-nowrap border border-emerald-400/30"
            >
              <span className="font-black text-xs sm:text-sm leading-none drop-shadow-xs">
                {isLoggedIn ? (userRole === 'teacher' ? 'Giáo viên' : (isGuestMode ? 'Guest' : 'Học sinh')) : 'Log in'}
              </span>
              <span className="text-[9px] sm:text-[10px] text-emerald-100 font-medium leading-none mt-0.5">
                {isLoggedIn ? 'Tài khoản' : 'Đăng nhập'}
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* GUEST MODE JUDGE & VISITOR NOTIFICATION CALLOUT */}
      {isLoggedIn && isGuestMode && userRole !== 'teacher' && (
        <div className="relative z-20 max-w-[1560px] w-full mx-auto px-2 sm:px-4 pt-1">
          <div className="bg-gradient-to-r from-emerald-900/90 via-[#185332]/95 to-emerald-950/90 text-white px-3 sm:px-4 py-2 rounded-2xl shadow-sm border border-amber-300/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                ⚡
              </span>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-amber-300 text-xs sm:text-sm font-display tracking-wide">
                    CHẾ ĐỘ TRẢI NGHIỆM KHÁCH (GUEST MODE)
                  </span>
                  <span className="text-[10px] bg-emerald-700/80 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Vùng nhớ độc lập 🛡️
                  </span>
                </div>
                <span className="text-[11px] text-emerald-100/95 font-medium leading-snug">
                  Bạn đang trải nghiệm nhanh các tính năng cốt lõi (Luyện phát âm AI, Mẫu câu & 7 Trò chơi Eco Games). Điểm số và cây xanh được lưu vào vùng nhớ riêng biệt, tuyệt đối không ảnh hưởng đến lớp học thật.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                playSoundEffect('click');
                setActiveModal('login');
              }}
              className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-amber-200 hover:text-white text-xs font-bold shrink-0 cursor-pointer transition-all border border-amber-300/40 whitespace-nowrap self-end sm:self-auto"
            >
              Đổi vai trò ▾
            </button>
          </div>
        </div>
      )}

      {/* CENTER SLOGAN */}
      <div className="relative z-10 text-center py-1.5 sm:py-2 px-2 sm:px-4 shrink-0">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 justify-center">
          <span className="text-lg sm:text-2xl transform -scale-x-100 inline-block animate-soft-float">🍃</span>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-black text-emerald-900 tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] font-display whitespace-nowrap">
            Speak English, Grow green!
          </h1>
          <span className="text-lg sm:text-2xl inline-block animate-soft-float">🍃</span>
        </div>
        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-emerald-800 tracking-wide drop-shadow-xs">
          Cùng nói, cùng vun xanh!
        </p>
      </div>

      {/* MOBILE IN-APP BROWSER NOTICE BANNER (Zalo, Facebook, TikTok...) */}
      {isInAppBrowser && showInAppBanner && (
        <div className="relative z-20 max-w-[1560px] w-full mx-auto px-2 sm:px-4 mb-2">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-lg border border-amber-300 flex items-center justify-between gap-3 text-xs sm:text-sm animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0">📱</span>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs sm:text-sm leading-tight text-white drop-shadow-xs">
                  Mở bằng Chrome/Safari để sử dụng tính năng thu âm tốt nhất
                </span>
                <span className="text-[11px] text-amber-100 font-medium leading-snug">
                  Bé hãy chạm vào dấu ba chấm <strong className="text-white">(⋯ hoặc ⋮)</strong> ở góc trên và chọn <strong className="text-white">"Mở bằng trình duyệt"</strong> nhé!
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowInAppBanner(false)}
              className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer shrink-0 transition-colors"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3-COLUMN WORKSPACE: Flexible on Mobile, Balanced 3-Column on Desktop */}
      <div className="relative z-10 max-w-[1560px] w-full mx-auto px-2 sm:px-4 lg:px-5 pb-3 flex-1 flex flex-col lg:flex-row items-stretch gap-2.5 lg:gap-3.5">
        
        {/* ============================================================== */}
        {/* COLUMN 1: LEFT NAVIGATION MENU (Harmonious 200px - 210px, balanced icons & typography) */}
        {/* ============================================================== */}
        <aside className="hidden lg:flex w-[200px] xl:w-[210px] shrink-0 bg-gradient-to-b from-[#206740] via-[#26774a] to-[#1c5d39] backdrop-blur-md rounded-3xl p-3 xl:p-3.5 shadow-md border-[2px] border-[#2e8653] flex-col justify-between">
          
          <div className="flex flex-col gap-1.5 xl:gap-2 w-full">
            {/* Lessons */}
            <button
              onClick={() => handleSidebarItemClick('lessons')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Bài học"}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-all cursor-pointer ${
                isLoggedIn && activeSidebar === 'lessons'
                  ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                  : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isLoggedIn && activeSidebar === 'lessons'
                  ? 'bg-[#86efac] text-[#13492a]'
                  : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
              }`}>
                <Home className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-tight min-w-0 flex-1">
                <span className="font-bold text-sm">Lessons</span>
                <span className="text-[11px] text-emerald-200/90 font-medium">Bài học</span>
              </div>
            </button>

            {/* Speaking Practice */}
            <button
              onClick={() => handleSidebarItemClick('speaking')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Luyện nói"}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-all cursor-pointer ${
                isLoggedIn && activeSidebar === 'speaking'
                  ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                  : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isLoggedIn && activeSidebar === 'speaking'
                  ? 'bg-[#86efac] text-[#13492a]'
                  : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
              }`}>
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-tight min-w-0 flex-1">
                <span className="font-black text-sm text-white">Speaking Practice</span>
                <span className="text-[11px] text-emerald-100 font-medium">Luyện nói</span>
              </div>
            </button>

            {/* Assignments / Bài tập cô giao */}
            <button
              onClick={() => handleSidebarItemClick('assignments')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : (userRole === 'teacher' ? "Assignments / Bài tập cô giao (Quản lý bài tập)" : (isGuestMode ? "Demo Tasks" : "Bài tập cô giao"))}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-all cursor-pointer relative ${
                isLoggedIn && activeSidebar === 'assignments'
                  ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                  : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative ${
                isLoggedIn && activeSidebar === 'assignments'
                  ? 'bg-[#86efac] text-[#13492a]'
                  : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
              }`}>
                <FileCheck className="w-4 h-4" />
                {isLoggedIn && studentAssignmentsBadgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-emerald-950 font-black text-[9px] flex items-center justify-center shadow-xs">
                    {studentAssignmentsBadgeCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col leading-tight min-w-0 flex-1">
                <span className="font-bold text-sm">
                  {userRole !== 'teacher' && isLoggedIn && isGuestMode ? 'Demo Tasks' : 'Assignments'}
                </span>
                <span className="text-[11px] text-emerald-200/90 font-medium">
                  {userRole !== 'teacher' && isLoggedIn && isGuestMode 
                    ? 'Nhiệm vụ mẫu trải nghiệm (Demo Task)' 
                    : 'Bài tập cô giao'}
                </span>
              </div>
            </button>

            {/* Eco Games */}
            <button
              onClick={() => handleSidebarItemClick('games')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Trò chơi xanh"}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-all cursor-pointer ${
                isLoggedIn && activeSidebar === 'games'
                  ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                  : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isLoggedIn && activeSidebar === 'games'
                  ? 'bg-[#86efac] text-[#13492a]'
                  : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
              }`}>
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-tight min-w-0 flex-1">
                <span className="font-bold text-sm">Eco Games</span>
                <span className="text-[11px] text-emerald-200/90 font-medium">Trò chơi xanh</span>
              </div>
            </button>

            {/* My Garden */}
            <button
              onClick={() => handleSidebarItemClick('garden', 'garden')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Khu vườn của em"}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-all cursor-pointer ${
                isLoggedIn && activeSidebar === 'garden'
                  ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                  : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isLoggedIn && activeSidebar === 'garden'
                  ? 'bg-[#86efac] text-[#13492a]'
                  : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
              }`}>
                <Sprout className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-tight min-w-0 flex-1">
                <span className="font-bold text-sm">My Garden</span>
                <span className="text-[11px] text-emerald-200/90 font-medium">Khu vườn của em</span>
              </div>
            </button>

            {/* Honor Board / Bảng Vinh Danh */}
            <button
              onClick={() => handleSidebarItemClick('honor', 'honorBoard')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Bảng vinh danh"}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-all cursor-pointer text-emerald-50 hover:bg-[#287b4d] hover:text-white"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#185834] text-amber-300 border border-[#277a4b]">
                <Trophy className="w-4 h-4 fill-amber-300" />
              </div>
              <div className="flex flex-col leading-tight min-w-0 flex-1">
                <span className="font-bold text-sm">Honor Board</span>
                <span className="text-[11px] text-emerald-200/90 font-medium">Bảng vinh danh</span>
              </div>
            </button>

            {/* How to Use */}
            <button
              onClick={() => handleSidebarItemClick('help', 'help')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Hướng dẫn"}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-all cursor-pointer ${
                isLoggedIn && activeSidebar === 'help'
                  ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                  : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isLoggedIn && activeSidebar === 'help'
                  ? 'bg-[#86efac] text-[#13492a]'
                  : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
              }`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-tight min-w-0 flex-1">
                <span className="font-bold text-sm">How to Use</span>
                <span className="text-[11px] text-emerald-200/90 font-medium">Hướng dẫn</span>
              </div>
            </button>
          </div>

          {/* Bottom Controls: Settings */}
          <div className="flex flex-col gap-1 w-full border-t border-[#297a4d] pt-2.5 mt-2">
            <button
              onClick={() => {
                playSoundEffect('click');
                setActiveModal('settings');
              }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl w-full text-left hover:bg-[#287b4d] text-emerald-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#185834] text-emerald-200 flex items-center justify-center shrink-0 border border-[#277a4b]">
                <Settings className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-sm">Settings</span>
                <span className="text-[11px] text-emerald-200/90 font-medium">Cài đặt</span>
              </div>
            </button>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* COLUMN 2: CENTER LEARNING WORKSPACE (Mint Sage & Fresh Accent) */}
        {/* ============================================================== */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          
          {/* TABLET / MOBILE COMPACT NAVIGATION BAR (< 1024px) */}
          <div className="lg:hidden flex items-center justify-between gap-1 sm:gap-2 bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl p-1.5 sm:p-2 border-[2px] border-[#86c898] shadow-sm overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => handleSidebarItemClick('lessons')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Bài học"}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isLoggedIn && activeSidebar === 'lessons'
                  ? 'bg-gradient-to-r from-[#206740] to-[#2b8855] text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Lessons</span>
            </button>

            <button
              onClick={() => handleSidebarItemClick('speaking')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Luyện nói"}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isLoggedIn && activeSidebar === 'speaking'
                  ? 'bg-gradient-to-r from-[#206740] to-[#2b8855] text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Speaking</span>
            </button>

            <button
              onClick={() => handleSidebarItemClick('assignments')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Bài tập cô giao"}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer relative ${
                isLoggedIn && activeSidebar === 'assignments'
                  ? 'bg-gradient-to-r from-[#206740] to-[#2b8855] text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{userRole !== 'teacher' && isLoggedIn && isGuestMode ? 'Nhiệm vụ mẫu (Demo Task)' : 'Bài tập'}</span>
              {isLoggedIn && studentAssignmentsBadgeCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-emerald-950 font-black text-[9px] flex items-center justify-center">
                  {studentAssignmentsBadgeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSidebarItemClick('games')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Trò chơi xanh"}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isLoggedIn && activeSidebar === 'games'
                  ? 'bg-gradient-to-r from-[#206740] to-[#2b8855] text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Eco Games</span>
            </button>

            <button
              onClick={() => handleSidebarItemClick('garden', 'garden')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Khu vườn của em"}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isLoggedIn && activeSidebar === 'garden'
                  ? 'bg-gradient-to-r from-[#206740] to-[#2b8855] text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Garden</span>
            </button>

            <button
              onClick={() => handleSidebarItemClick('help', 'help')}
              title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Hướng dẫn"}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isLoggedIn && activeSidebar === 'help'
                  ? 'bg-gradient-to-r from-[#206740] to-[#2b8855] text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>How to Use</span>
            </button>
          </div>

          {activeSidebar === 'games' ? (
            <EcoGamesView
              selectedGrade={selectedGrade}
              onGradeChange={handleGradeChange}
              selectedUnitKey={selectedUnitKey}
              onUnitChange={handleUnitChange}
              availableUnits={availableUnits}
              selectedLesson={selectedLesson}
              onLessonChange={handleLessonChange}
              availableLessons={availableLessons}
              currentUnitData={currentUnit}
              playSoundEffect={playSoundEffect}
              totalUserTrees={virtualTrees}
              initialGameId={targetGameId}
              onClearInitialGame={() => setTargetGameId(null)}
              onAwardTree={() => {
                // Celebration & tree growth is automatically driven by onAwardEP (+30 EP milestone)
                playSoundEffect('celebrate');
                setMascotBubble('🌳 Chúc mừng! Bạn đã hoàn thành xuất sắc trò chơi sinh thái và vun trồng thêm 1 cây xanh tươi tốt!');
              }}
              onAwardEP={(ep) => {
                let nextTrees = virtualTrees;
                setEcoPoints(prev => {
                  const newEP = prev + ep;
                  if (isGuestMode) {
                    setGuestGradeEcoPoints(selectedGrade, newEP);
                  }
                  const calcTrees = computeLogicalTrees(newEP);
                  nextTrees = calcTrees;
                  setVirtualTrees(nextTrees);
                  if (isGuestMode) {
                    setGuestGradeVirtualTrees(selectedGrade, nextTrees);
                  }
                  if (calcTrees > virtualTrees) {
                    setMascotBubble('🌳 Wow! Bạn đã vun trồng thành công thêm 1 cây xanh tươi tốt!');
                    playSoundEffect('celebrate');
                  }
                  return newEP;
                });
                recordStudentActivity({
                  type: 'eco_game',
                  titleEn: `Eco Game Reward · Grade ${selectedGrade}`,
                  titleVi: `Nhận điểm thưởng từ trò chơi Eco Game (Khối ${selectedGrade})`,
                  detailEn: `Earned +${ep} Eco Points for green action in Grade ${selectedGrade}`,
                  detailVi: `Tích lũy thêm +${ep} Eco Points từ trò chơi bảo vệ môi trường Khối ${selectedGrade}`,
                  score: 100,
                  epAwarded: ep,
                  icon: '🎮',
                  badgeColor: 'amber',
                  grade: selectedGrade
                }, isGuestMode ? 'Khách trải nghiệm' : (userName || 'Học sinh'), selectedGrade);
                if (!isGuestMode) {
                  updateStudentProgress(userName, 90, nextTrees, ep);
                  if (activeAssignmentId) {
                    recordStudentAssignmentCompletion(userName, activeAssignmentId);
                  } else {
                    const asgs = getTeacherAssignments().filter(a => isAssignmentForStudent(a, studentClassInput, selectedGrade));
                    if (asgs.length > 0) {
                      recordStudentAssignmentCompletion(userName, asgs[0].id);
                    }
                  }
                } else {
                  if (activeAssignmentId) {
                    recordGuestAssignmentCompletion(activeAssignmentId);
                  }
                }
              }}
              onOpenGarden={() => {
                playSoundEffect('click');
                setActiveModal('garden');
              }}
              onBackToLessons={() => {
                playSoundEffect('click');
                setActiveSidebar('speaking');
              }}
            />
          ) : activeSidebar === 'assignments' ? (
            !isLoggedIn ? (
              <div className="w-full bg-[#f2faf5]/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border-[2.5px] border-[#86c898] shadow-sm flex flex-col items-center justify-center text-center gap-4 my-auto animate-fade-in">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white shadow-md border-2 border-emerald-400 flex items-center justify-center text-4xl sm:text-5xl">
                  📋
                </div>
                <div className="max-w-md flex flex-col gap-1">
                  <h3 className="text-lg sm:text-2xl font-black text-emerald-950 font-display">
                    Please Log In to View Assignments
                  </h3>
                  <p className="text-xs sm:text-sm italic text-emerald-800 font-medium leading-relaxed">
                    Đăng nhập tài khoản lớp học hoặc chọn Guest Mode để xem bài tập và tích lũy cây xanh.
                  </p>
                </div>
                <button
                  onClick={() => {
                    playSoundEffect('click');
                    setLoginPromptNotice(null);
                    setActiveModal('login');
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#0d4a2b] via-[#15803d] to-[#1cb55b] hover:from-[#115e37] hover:to-[#22c55e] active:scale-95 text-white font-extrabold text-sm flex flex-col items-center justify-center shadow-md cursor-pointer transition-all leading-tight"
                >
                  <div className="flex items-center gap-1.5 font-black text-sm">
                    <LogIn className="w-4 h-4 text-white" />
                    <span>Log In Now</span>
                  </div>
                  <span className="text-[10px] italic text-emerald-100 font-medium">Đăng nhập ngay</span>
                </button>
              </div>
            ) : (
              <StudentAssignmentsView
                selectedGrade={selectedGrade}
                studentClass={userRole === 'teacher' ? teacherSelectedClass : studentClassInput}
                isGuestMode={userRole !== 'teacher' && isGuestMode}
                userRole={userRole}
                availableClasses={classList}
                onSelectClass={handleTeacherClassChange}
                playSoundEffect={playSoundEffect}
                onStartGame={(gameId, gameName, asg) => {
                  setTargetGameId(gameId);
                  if (asg?.id) {
                    setActiveAssignmentId(asg.id);
                  }
                  setActiveSidebar('games');
                  setMascotBubble(userRole !== 'teacher' && isGuestMode ? `Mời bạn trải nghiệm ${gameName}!` : `Đang mở trò chơi "${gameName}" cho bé hoàn thành bài tập nhé!`);
                }}
                onStartSpeaking={(type, unitKey, asg) => {
                  if (asg?.id) {
                    setActiveAssignmentId(asg.id);
                  }
                  const asgGrade = asg?.grade || '3';
                  if (asgGrade !== selectedGrade) {
                    handleGradeChange(asgGrade);
                  }
                  if (unitKey) {
                    handleUnitChange(unitKey);
                  }
                  setActiveSidebar('speaking');
                  setActiveTab(type === 'sentence' ? 'sentences' : 'vocabulary');
                  setMascotBubble(type === 'sentence' ? 'Cùng luyện nói mẫu câu nhé!' : 'Cùng luyện phát âm từ vựng nhé!');
                }}
                onBackToLessons={() => {
                  playSoundEffect('click');
                  setActiveSidebar('speaking');
                }}
              />
            )
          ) : activeSidebar === 'lessons' ? (
            <LessonsOverviewView
              selectedGrade={selectedGrade}
              onGradeChange={handleGradeChange}
              studentClass={userRole === 'teacher' ? (teacherSelectedClass ? (teacherSelectedClass.startsWith(selectedGrade) ? teacherSelectedClass : `${selectedGrade}A3`) : `${selectedGrade}A3`) : studentClassInput}
              userRole={userRole}
              isGuestMode={userRole !== 'teacher' && isGuestMode}
              onSelectUnit={(unitKey, initialTab) => {
                const ok = handleUnitChange(unitKey);
                if (!ok) return;
                if (initialTab) {
                  setActiveTab(initialTab);
                }
                setActiveSidebar('speaking');
                setMascotBubble('Cùng luyện phát âm từ vựng và mẫu câu bài học nào!');
              }}
              onStartGameForUnit={(unitKey) => {
                const ok = handleUnitChange(unitKey);
                if (!ok) return;
                setActiveSidebar('games');
                setMascotBubble('Cùng chơi trò chơi xanh để tích lũy cây xanh nhé!');
              }}
              playSoundEffect={playSoundEffect}
            />
          ) : activeSidebar === 'progress' ? (
            <StudentProgressDashboard
              selectedGrade={selectedGrade}
              onGradeChange={handleGradeChange}
              activeUnitKey={selectedUnitKey}
              studentName={isGuestMode || userRole === 'guest' || !isLoggedIn ? 'Khách trải nghiệm / Visitor' : (userName || 'Học sinh')}
              studentClass={isGuestMode || userRole === 'guest' || !isLoggedIn ? 'Trải nghiệm (Demo / Guest)' : (userRole === 'teacher' ? (teacherSelectedClass ? (teacherSelectedClass.startsWith(selectedGrade) ? teacherSelectedClass : `${selectedGrade}A3`) : `${selectedGrade}A3`) : studentClassInput)}
              userRole={isGuestMode || !isLoggedIn ? 'guest' : userRole}
              isGuestMode={isGuestMode || userRole === 'guest' || !isLoggedIn}
              ecoPoints={ecoPoints}
              virtualTrees={virtualTrees}
              practicedItemsCount={practicedItems.size}
              onNavigateToUnit={(unitKey) => {
                const ok = handleUnitChange(unitKey);
                if (!ok) return;
                setActiveSidebar('speaking');
                setMascotBubble('Cùng luyện phát âm từ vựng bài học này nào!');
              }}
              onStartPractice={(targetUnitKey) => {
                const keyToUse = targetUnitKey || selectedUnitKey || 'unit_1';
                handleUnitChange(keyToUse);
                setActiveSidebar('speaking');
                setMascotBubble('Cùng luyện phát âm từ vựng và mẫu câu chuẩn bản xứ nhé!');
              }}
              onOpenEcoGames={(targetUnitKey) => {
                const keyToUse = targetUnitKey || selectedUnitKey || 'unit_1';
                handleUnitChange(keyToUse);
                setActiveSidebar('games');
                setMascotBubble('Cùng chơi trò chơi xanh để tích lũy cây xanh nhé!');
              }}
              playSoundEffect={playSoundEffect}
            />
          ) : (
            <>
              {/* ACTIVE ECO GAME ASSIGNMENT BANNER OR DEFAULT WELCOME BANNER */}
              {!isLoggedIn ? (
                <div className="w-full bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-2 border-emerald-400 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shrink-0">
                      🌱
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 shadow-2xs">
                          Chào mừng bạn!
                        </span>
                        <span className="text-xs sm:text-sm font-black text-amber-200 truncate font-display">
                          Đăng nhập để nhận nhiệm vụ và tham gia Eco Games!
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-100 font-medium truncate">
                        Đăng nhập tài khoản lớp học hoặc chọn Guest Mode để trải nghiệm bài tập và tích lũy cây xanh.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playSoundEffect('click');
                      setLoginPromptNotice(null);
                      setActiveModal('login');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-emerald-950 text-xs font-black flex flex-col items-center justify-center shadow-md cursor-pointer transition-all shrink-0 self-end sm:self-auto leading-tight"
                  >
                    <div className="flex items-center gap-1 font-black text-xs">
                      <LogIn className="w-3.5 h-3.5 text-emerald-950" />
                      <span>Log In Now</span>
                    </div>
                    <span className="text-[9px] italic font-semibold text-emerald-950/80">Đăng nhập ngay</span>
                  </button>
                </div>
              ) : (() => {
                // REQUIREMENT 2: Đồng bộ Banner 'Nhiệm vụ cô giao' trang chủ
                // Banner 'Nhiệm vụ cô giao' ngoài màn hình chính phải hiển thị đúng bài tập mới nhất thuộc Lớp của học sinh đó
                // (Ví dụ với Chí Vỹ - Lớp 4A3 là bài '5. Tìm nhà cho bạn thú', không phải bài 'Trồng cây').
                const sortedAssignments = [...myStudentAssignments].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                const activeAsg = sortedAssignments.find(a => a.status !== 'completed');
                const latestAsg = activeAsg || sortedAssignments[0];

                if (!latestAsg) {
                  return null;
                }

                const info = getAssignmentDisplayInfo(latestAsg);
                return (
                  <div className="w-full bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-2 border-emerald-400 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shrink-0">
                        {info.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 shadow-2xs">
                            {isGuestMode ? 'Nhiệm vụ mẫu trải nghiệm (Demo Task)' : 'Nhiệm vụ cô giao'}
                          </span>
                          <span className="text-xs sm:text-sm font-black text-amber-200 truncate font-display">
                            {info.isGame ? (info.gameName || latestAsg.gameName) : (latestAsg.unitName || latestAsg.title)}
                          </span>
                          {!isGuestMode && latestAsg.targetClass && (
                            <span className="text-[10px] font-extrabold text-emerald-950 bg-amber-300 px-1.5 py-0.2 rounded-md shadow-2xs">
                              {latestAsg.targetClass === 'Tất cả các lớp' ? `Khối ${latestAsg.grade}` : `Lớp ${latestAsg.targetClass}`}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-emerald-100 font-medium truncate">
                          {isGuestMode
                            ? `${latestAsg.title} • Bài tập mẫu sẵn sàng trải nghiệm (+${latestAsg.rewardEP} EP)`
                            : `${latestAsg.title} • Nhận +${latestAsg.rewardEP} EP khi hoàn thành`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        playSoundEffect('celebrate');
                        if (latestAsg?.id) {
                          setActiveAssignmentId(latestAsg.id);
                        }
                        if (info.isGame) {
                          setTargetGameId(info.gameId || 'animal-homes');
                          setActiveSidebar('games');
                          setMascotBubble(
                            isGuestMode 
                              ? `Mời bạn trải nghiệm ${info.gameName || latestAsg.gameName}!` 
                              : `Đang mở ${info.gameName || latestAsg.gameName} cho bé!`
                          );
                        } else {
                          const asgGrade = latestAsg.grade || activeAssignmentGrade || selectedGrade;
                          if (latestAsg.unitKey && bookmapDatabase.grades[asgGrade]?.units?.some(u => u.unitKey === latestAsg.unitKey)) {
                            if (asgGrade !== selectedGrade) {
                              handleGradeChange(asgGrade);
                            }
                            handleUnitChange(latestAsg.unitKey);
                          }
                          setActiveSidebar('speaking');
                          setActiveTab(latestAsg.type === 'sentence' ? 'sentences' : 'vocabulary');
                          setMascotBubble('Đang mở bài luyện nói cô giáo giao cho bé!');
                        }
                      }}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-emerald-950 text-xs font-black flex flex-col items-center justify-center shadow-md cursor-pointer transition-all shrink-0 self-end sm:self-auto leading-tight"
                    >
                      <div className="flex items-center gap-1 font-black text-xs">
                        {info.isGame ? (
                          <Play className="w-3.5 h-3.5 fill-emerald-950 text-emerald-950" />
                        ) : (
                          <Mic className="w-3.5 h-3.5 text-emerald-950" />
                        )}
                        <span>
                          {isGuestMode 
                            ? 'Try Now' 
                            : info.isGame 
                            ? 'Play Now' 
                            : 'Practise Now'}
                        </span>
                      </div>
                      <span className="text-[9px] italic font-semibold text-emerald-950/80">
                        {isGuestMode 
                          ? 'Trải nghiệm ngay' 
                          : info.isGame 
                          ? 'Vào chơi ngay' 
                          : 'Vào luyện ngay'}
                      </span>
                    </button>
                  </div>
                );
              })()}

              {/* TOP CONTROLS TOOLBAR (Grade, Unit, Vocabulary, Sentences, Book map) */}
          <div className="top-filter-bar w-full bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl px-2.5 sm:px-4 py-2 shadow-sm border-[2.5px] border-[#86c898] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 md:gap-4 shrink-0">
            
            {/* ROW 1 ON MOBILE / LEFT GROUP ON DESKTOP & TABLET: Grade & Unit */}
            <div className="filter-group-primary flex items-center gap-2 sm:gap-2.5 w-full md:flex-1 md:max-w-md lg:max-w-lg min-w-0">
              
              {/* Teacher Quick Class Selector */}
              {userRole === 'teacher' && (
                <div className="class-tag h-9 inline-flex items-center gap-1.5 sm:gap-2 pl-2.5 sm:pl-3 pr-1.5 py-1 bg-[#e2f4e8] rounded-xl border border-[#86c898] text-xs font-bold text-emerald-950 shrink-0 shadow-2xs">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs">🏫</span>
                    <span className="text-xs font-bold text-emerald-950">Lớp</span>
                  </div>
                  <div className="relative flex items-center">
                    <select
                      value={teacherSelectedClass}
                      onChange={(e) => handleTeacherClassChange(e.target.value)}
                      className="class-select h-7 bg-white border border-[#10b981] rounded-[12px] pl-2 sm:pl-2.5 pr-5 font-black text-emerald-950 text-xs sm:text-sm cursor-pointer outline-none focus:ring-1 focus:ring-emerald-400 appearance-none text-left"
                    >
                      {classList.map(cls => (
                        <option key={cls.id} value={cls.name}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-emerald-600 absolute right-1 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* 1. Grade Dropdown (Role-based: Fixed for students, Switcher for teachers/guest) */}
              <div className="grade-tag h-9 inline-flex items-center gap-1.5 sm:gap-2 pl-2.5 sm:pl-3 pr-1.5 py-1 bg-[#e2f4e8] rounded-xl border border-[#86c898] text-xs font-bold text-emerald-950 shrink-0 shadow-2xs">
                <div className="flex items-center gap-1.5 shrink-0">
                  <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-xs font-bold text-emerald-950">Grade</span>
                </div>
                {(userRole === 'teacher' || isGuestMode || userRole === 'guest') ? (
                  <div className="relative flex items-center">
                    <select
                      value={selectedGrade}
                      onChange={(e) => handleGradeChange(e.target.value)}
                      className="grade-select w-[54px] sm:w-[58px] h-7 bg-white border border-[#10b981] rounded-[12px] pl-2.5 sm:pl-3 pr-5 font-black text-emerald-950 text-xs sm:text-sm cursor-pointer outline-none focus:ring-1 focus:ring-emerald-400 appearance-none text-left"
                    >
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-emerald-600 absolute right-1.5 pointer-events-none" />
                  </div>
                ) : (
                  <div className="h-7 px-2.5 bg-white border border-[#10b981] rounded-[12px] flex items-center justify-center font-black text-emerald-950 text-xs sm:text-sm shadow-2xs">
                    <span>{selectedGrade}</span>
                  </div>
                )}
              </div>

              {/* 2. Unit Dropdown (Flexible with flex-1 to fill space evenly) */}
              <div className="unit-box flex-1 min-w-[140px] h-9 flex items-center gap-1.5 bg-[#e2f4e8] px-2.5 py-1 rounded-xl border border-[#86c898] text-xs font-bold text-emerald-950">
                <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-emerald-950 shrink-0">Unit</span>
                <select
                  value={selectedUnitKey}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="bg-white border border-[#86c898] rounded-lg px-2 py-0.5 font-bold text-emerald-950 text-xs cursor-pointer outline-none focus:ring-1 focus:ring-emerald-400 w-full min-w-0"
                >
                  {availableUnits.map(unit => (
                    <option key={unit.unitKey} value={unit.unitKey}>
                      {unit.unitFullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Jump to 20 Units Overview */}
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click');
                  setActiveSidebar('lessons');
                }}
                className="h-9 px-2.5 py-1 bg-[#e2f4e8] hover:bg-[#d8f0df] text-emerald-950 border border-[#86c898] rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                title="Tổng hợp 20 Unit Khối lớp / Units Overview"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">20 Units</span>
              </button>

            </div>

            {/* ROW 2 ON MOBILE / RIGHT GROUP ON DESKTOP & TABLET: 3 Action Tabs */}
            <div className="filter-group-secondary grid grid-cols-3 md:flex items-center gap-2 sm:gap-2.5 md:gap-3 w-full md:w-auto shrink-0 justify-end">
              
              {/* 3. Vocabulary Button */}
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click');
                  setActiveTab('vocabulary');
                }}
                className={`filter-btn h-9 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0 ${
                  activeTab === 'vocabulary'
                    ? 'bg-gradient-to-r from-[#0c4326] to-[#15803d] text-white shadow-xs border border-[#4ade80]'
                    : 'bg-[#e2f4e8] hover:bg-[#d8f0df] text-emerald-900 border border-[#86c898]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Vocabulary</span>
              </button>

              {/* 4. Sentences Button */}
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click');
                  setActiveTab('sentences');
                }}
                className={`filter-btn h-9 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0 ${
                  activeTab === 'sentences'
                    ? 'bg-gradient-to-r from-[#064e3b] to-[#0d9488] text-white shadow-xs border border-[#2dd4bf]'
                    : 'bg-[#e2f4e8] hover:bg-[#d8f0df] text-teal-900 border border-[#86c898]'
                }`}
              >
                <span className="text-xs">💬</span>
                <span className="truncate">Sentences</span>
              </button>

              {/* 5. Book Map Button */}
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click');
                  setActiveModal('bookmap');
                }}
                className="filter-btn h-9 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-[#e3f7eb] to-[#caf2dc] hover:from-[#d5f4e1] hover:to-[#bfeccf] text-[#0d4a2b] border border-[#86c898] text-xs font-bold cursor-pointer transition-colors whitespace-nowrap shadow-xs shrink-0 flex items-center justify-center gap-1.5"
                title="Curriculum Book Map"
              >
                <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">Book Map</span>
              </button>

            </div>

          </div>

          {/* LESSON BREAKDOWN TABS: Lesson 1 & Lesson 2 (No Lesson 3) */}
          {availableLessons.length > 0 && (
            <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 px-3 py-1.5 bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl border-[2px] border-[#86c898] shrink-0 shadow-2xs overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 shrink-0 text-emerald-950 font-bold text-xs">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Lesson:</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
                {availableLessons.map((l: any) => (
                  <button
                    key={l.lessonNumber}
                    type="button"
                    onClick={() => handleLessonChange(l.lessonTitle)}
                    className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      selectedLesson === l.lessonTitle
                        ? 'bg-gradient-to-r from-[#0c4326] to-[#15803d] text-white shadow-2xs border border-[#4ade80]'
                        : 'bg-[#e2f4e8] hover:bg-[#d8f0df] text-emerald-900 border border-[#86c898]'
                    }`}
                  >
                    <span>{l.lessonTitle}</span>
                    <span className="text-[10px] opacity-80">
                      ({activeTab === 'vocabulary' ? l.vocabulary.length : l.sentences.length})
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleLessonChange('all')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    selectedLesson === 'all'
                      ? 'bg-gradient-to-r from-[#0c4326] to-[#15803d] text-white shadow-2xs border border-[#4ade80]'
                      : 'bg-[#e2f4e8]/80 hover:bg-[#d8f0df] text-emerald-900 border border-[#86c898]/70'
                  }`}
                  title="View all vocabulary and sentences of the unit"
                >
                  <span>Whole Unit</span>
                </button>
              </div>
            </div>
          )}

          {/* SPEAKING BUDDY MAIN CARD - Mint Sage BG, 2.5px border, and Subtle Botanical Watermark */}
          <div className="bg-[#f2faf5]/95 backdrop-blur-md rounded-3xl p-5 shadow-lg border-[2.5px] border-[#86c898] flex-1 flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle nature leaves & sun decorative watermark in the background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.08] flex items-center justify-between p-4 overflow-hidden z-0">
              {/* Sun rays on left top */}
              <svg viewBox="0 0 200 200" className="w-64 h-64 -top-10 -left-10 absolute text-emerald-800 fill-current">
                <circle cx="100" cy="100" r="40" />
                <path d="M100 20 L100 0 M100 180 L100 200 M20 100 L0 100 M180 100 L200 100 M43 43 L29 29 M157 157 L171 171 M43 157 L29 171 M157 43 L171 29" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
              {/* Leaves watermark on bottom right */}
              <svg viewBox="0 0 200 200" className="w-72 h-72 -bottom-10 -right-10 absolute text-emerald-800 fill-current">
                <path d="M50 150 C30 110 50 60 110 40 C170 20 180 80 160 120 C140 160 90 180 50 150 Z" />
                <path d="M120 180 C90 140 100 90 150 70 C200 50 210 110 190 150 C170 190 140 200 120 180 Z" />
              </svg>
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between pb-2 border-b border-[#86c898]/40 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 border border-[#86c898]">
                  <Sprout className="w-4 h-4 fill-emerald-600 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-emerald-950 font-display">
                    Speaking Buddy
                  </h2>
                  <p className="text-[11px] text-emerald-800 font-medium">Bạn cùng luyện nói</p>
                </div>
              </div>

              {/* Step indicator badge */}
              <div className="hidden sm:flex bg-[#ddf3e5] border border-[#86c898] rounded-full px-3 py-1 text-xs font-semibold text-emerald-900 items-center gap-1.5 shadow-xs whitespace-nowrap">
                <span className="font-bold">1. Listen</span>
                <span className="text-emerald-500">→</span>
                <span className="font-bold">2. Speak</span>
                <span className="text-emerald-500">→</span>
                <span className="font-bold">3. Feedback</span>
              </div>
            </div>

            {/* Split: Left Paint Swatch & Right Word + Pronunciation + Speak */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-center py-2 sm:py-4 my-auto relative z-10 w-full min-w-0 max-w-full">
              
              {/* Left: Textured Paint Swatch or Visual Item */}
              <div className="flex items-center justify-center p-2 relative group w-full min-w-0 max-w-full">
                <div className="w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px] lg:max-w-[400px] mx-auto transform transition-transform duration-300 group-hover:scale-105">
                  {activeTab === 'vocabulary' ? renderVisualSwatch(currentVocab) : renderSentenceVisual(currentSentence)}
                </div>
              </div>

              {/* Right: Word details, Audio buttons, Primary Speak button */}
              <div className="flex flex-col items-center justify-center text-center space-y-3 w-full min-w-0 max-w-full px-2 sm:px-4 overflow-hidden vocab-card-containment">
                
                {/* Word / Sentence Display */}
                <div className="space-y-1.5 w-full min-w-0 max-w-full flex flex-col items-center justify-center text-center">
                  {activeTab === 'vocabulary' ? (
                    <div className="space-y-1.5 w-full min-w-0 max-w-full flex flex-col items-center justify-center text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5 flex-wrap max-w-full">
                        {currentVocab.lesson && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-[#e0f4e7] border border-[#86c898] px-2.5 py-0.5 rounded-full shadow-2xs shrink-0">
                            {currentVocab.lesson}
                          </span>
                        )}
                        <span className="text-[11px] text-emerald-700 font-semibold truncate max-w-[200px]">
                          {currentUnit.theme}
                        </span>
                      </div>
                      
                      {/* Dynamic & Responsive Word Display - Prevents overflow on long words */}
                      <h3 
                        className={`vocab-word-display font-black tracking-normal sm:tracking-wide font-display select-none transition-all duration-200 drop-shadow-xs ${
                          currentVocab.word.length > 9 ? 'is-long-word' : ''
                        }`}
                        style={{ 
                          color: currentVocab.colorHex || '#15803d',
                          fontSize: currentVocab.word.length > 10 ? 'clamp(1.75rem, 3.6vw, 2.35rem)' : 'clamp(2.1rem, 4.2vw, 2.8rem)',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          hyphens: 'auto'
                        }}
                      >
                        {currentVocab.word}
                      </h3>
                      
                      {/* Phonetic & Vietnamese translation */}
                      <div className="vocab-info-container gap-2 text-sm sm:text-base md:text-lg font-bold text-slate-700 px-1">
                        <span className="text-blue-700 font-mono tracking-tight break-all">{currentVocab.phonetic}</span>
                        <button 
                          onClick={() => handleListen(false)}
                          className="p-1 rounded-full text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
                          title={`Nghe phát âm chuẩn (${accent === 'UK' ? 'UK 🇬🇧' : 'US 🇺🇸'})`}
                        >
                          <Volume2 className="w-5 h-5 fill-emerald-600" />
                        </button>
                        <span className="text-emerald-800 font-bold break-words">{currentVocab.meaning}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 w-full min-w-0 max-w-full flex flex-col items-center justify-center text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-full px-1">
                        <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-900 shadow-xs max-w-full truncate">
                          Mẫu câu: {currentSentence.structure}
                        </div>
                        {currentSentence.lesson && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-[#ccfbf1] border border-teal-300 px-2.5 py-0.5 rounded-full shadow-2xs shrink-0">
                            {currentSentence.lesson}
                          </span>
                        )}
                      </div>
                      <h3 
                        className="w-full max-w-full text-center font-black text-emerald-950 font-display break-words px-2 leading-tight"
                        style={{
                          fontSize: 'clamp(1.25rem, 3.2vw, 1.85rem)',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {currentSentence.example}
                      </h3>
                      <p className="w-full max-w-full text-center text-xs sm:text-sm md:text-base font-semibold text-emerald-800 break-words px-2">
                        {currentSentence.exampleVi}
                      </p>
                      <div className="vocab-info-container gap-2 text-xs sm:text-sm font-bold text-emerald-700 pt-0.5 px-1">
                        <button 
                          onClick={() => handleListen(false)}
                          className="p-1 rounded-full text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
                          title="Nghe câu mẫu"
                        >
                          <Volume2 className="w-4 h-4 fill-emerald-600" />
                        </button>
                        <span className="break-words">Ý nghĩa: {currentSentence.meaning}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Voice Accent Switcher: US / UK */}
                <div className="flex items-center justify-between gap-1 p-1 bg-[#e2f4e8] rounded-2xl border border-[#86c898] w-full max-w-sm shadow-inner">
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-800 pl-2">Giọng đọc:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        playSoundEffect('click');
                        setAccent('US');
                        setSpeechFeedback('Đã chọn giọng Anh - Mỹ (US English 🇺🇸)');
                      }}
                      className={`py-1 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        accent === 'US'
                          ? 'bg-[#0c4326] text-white shadow-xs border-2 border-[#4ade80]'
                          : 'text-emerald-900 hover:text-emerald-950'
                      }`}
                      title="Giọng phát âm chuẩn Anh - Mỹ"
                    >
                      <span>🇺🇸</span>
                      <span>US (Mỹ)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSoundEffect('click');
                        setAccent('UK');
                        setSpeechFeedback('Đã chọn giọng Anh - Anh (UK English 🇬🇧)');
                      }}
                      className={`py-1 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        accent === 'UK'
                          ? 'bg-[#0c4326] text-white shadow-xs border-2 border-[#4ade80]'
                          : 'text-emerald-900 hover:text-emerald-950'
                      }`}
                      title="Giọng phát âm chuẩn Anh - Anh"
                    >
                      <span>🇬🇧</span>
                      <span>UK (Anh)</span>
                    </button>
                  </div>
                </div>

                {/* Audio Buttons: Listen & Listen Slowly - Gradient green accents */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full max-w-sm">
                  <button
                    onClick={() => handleListen(false)}
                    className="bg-gradient-to-r from-[#e0f4e7] to-[#c7eed6] hover:from-[#cfeedb] hover:to-[#b6e8c7] active:scale-95 text-emerald-950 rounded-2xl py-2 px-3 flex items-center justify-center gap-2 border-[2px] border-[#86c898] shadow-xs transition-all duration-150 cursor-pointer"
                    title={`Nghe phát âm chuẩn ${accent === 'UK' ? 'UK 🇬🇧' : 'US 🇺🇸'}`}
                  >
                    <Volume2 className="w-5 h-5 text-emerald-800 fill-emerald-600" />
                    <div className="flex flex-col text-left leading-tight">
                      <span className="font-extrabold text-xs sm:text-sm text-emerald-950">Listen ({accent})</span>
                      <span className="text-[10px] text-emerald-800 font-medium">Nghe mẫu</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleListen(true)}
                    className="bg-gradient-to-r from-[#e0f4e7] to-[#c7eed6] hover:from-[#cfeedb] hover:to-[#b6e8c7] active:scale-95 text-emerald-950 rounded-2xl py-2 px-3 flex items-center justify-center gap-2 border-[2px] border-[#86c898] shadow-xs transition-all duration-150 cursor-pointer"
                    title={`Nghe phát âm chậm ${accent === 'UK' ? 'UK 🇬🇧' : 'US 🇺🇸'}`}
                  >
                    <span className="text-xl">🐢</span>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="font-extrabold text-xs sm:text-sm text-emerald-950">Listen Slowly</span>
                      <span className="text-[10px] text-emerald-800 font-medium">Nghe chậm</span>
                    </div>
                  </button>
                </div>

                {/* Big Primary Speak CTA Button - Gradient from dark forest to fresh bright green */}
                <div className="w-full max-w-sm pt-1">
                  <button
                    onClick={handleStartSpeak}
                    disabled={isSpeakingActive}
                    className={`w-full py-3.5 px-5 rounded-2xl text-white shadow-[0_4px_16px_rgba(13,74,43,0.35)] flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer border border-emerald-400/40 ${
                      isSpeakingActive
                        ? 'bg-amber-600 ring-4 ring-amber-300 animate-pulse'
                        : 'bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] hover:from-[#0f5430] hover:to-[#22c55e] hover:shadow-[0_6px_20px_rgba(22,163,74,0.4)] active:scale-98'
                    }`}
                  >
                    <div className="p-1 rounded-full bg-white/20">
                      <Mic className={`w-6 h-6 ${isSpeakingActive ? 'animate-bounce text-white' : 'text-white'}`} />
                    </div>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="font-black text-lg tracking-wide drop-shadow-xs">
                        {isSpeakingActive ? 'Listening...' : 'Speak'}
                      </span>
                      <span className="text-[11px] text-emerald-100 font-normal">
                        {isSpeakingActive ? 'Bé đang nói...' : 'Bấm để nói'}
                      </span>
                    </div>
                  </button>

                  {/* Soundwave animation */}
                  {isSpeakingActive && (
                    <div className="flex items-center justify-center gap-1.5 mt-2 h-7">
                      {waveHeights.map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-emerald-600 rounded-full transition-all duration-100"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Previous & Next buttons appear when student has practiced */}
                  {(speechSuccess === true || practicedItems.has(currentVocab.id)) && (
                    <div className="flex items-center justify-between gap-2.5 w-full mt-2.5 pt-0.5 animate-fadeIn">
                      <button
                        onClick={handlePreviousItem}
                        disabled={currentVocabIndex === 0}
                        className={`flex-1 py-2 px-3 rounded-xl border-2 flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-xs ${
                          currentVocabIndex === 0
                            ? 'bg-[#e2f4e8]/60 text-emerald-700/50 border-[#86c898]/40 cursor-not-allowed opacity-60'
                            : 'bg-[#e0f4e7] hover:bg-[#cfeedb] text-emerald-950 border-[#86c898] cursor-pointer active:scale-95'
                        }`}
                        title="Quay lại mục trước"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous (Trước)</span>
                      </button>

                      <button
                        onClick={handleNextItem}
                        disabled={currentVocabIndex === vocabularyList.length - 1}
                        className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm border border-emerald-400/40 ${
                          currentVocabIndex === vocabularyList.length - 1
                            ? 'bg-[#e2f4e8]/60 text-emerald-700/50 border-[#86c898]/40 cursor-not-allowed opacity-60'
                            : 'bg-gradient-to-r from-[#0c4326] to-[#16a34a] hover:from-[#0f5430] hover:to-[#22c55e] text-white cursor-pointer active:scale-95'
                        }`}
                        title="Chuyển sang mục tiếp theo"
                      >
                        <span>Next (Tiếp)</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Bottom Card Guidance Banner / Interactive Pronunciation Feedback */}
            <div className="pt-2 relative z-10 w-full">
              {pronunciationEvaluation ? (
                <InteractivePronunciationFeedback
                  evaluation={pronunciationEvaluation}
                  transcript={recognizedTranscript}
                  targetText={activeTab === 'vocabulary' ? currentVocab.word : currentSentence.example}
                  attemptCount={practiceAttemptCount}
                  onListen={handleListen}
                  onPracticeAgain={handleStartSpeak}
                  isSpeakingActive={isSpeakingActive}
                />
              ) : (
                <div className={`rounded-full px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all flex-wrap ${
                  speechSuccess === true
                    ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400'
                    : speechSuccess === false
                    ? 'bg-amber-100 text-amber-900 border-2 border-amber-300'
                    : 'bg-[#ddf3e5] text-emerald-950 border border-[#86c898]'
                }`}>
                  <Sprout className="w-4 h-4 text-emerald-700 fill-emerald-600 shrink-0" />
                  <span className="text-center">{speechFeedback}</span>
                  {speechSuccess === false && (
                    <button
                      onClick={() => {
                        if (window.self !== window.top) {
                          window.open(window.location.href, '_blank');
                        } else {
                          handleStartSpeak();
                        }
                      }}
                      className="ml-1 px-2.5 py-0.5 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-950 font-extrabold text-xs border border-amber-400 cursor-pointer transition-colors shrink-0 flex items-center gap-1 shadow-xs"
                      title={window.self !== window.top ? 'Mở trong tab mới để dùng Micro không bị chặn' : 'Thử lại kết nối Micro'}
                    >
                      <span>{window.self !== window.top ? 'Mở tab mới ↗' : 'Thử lại 🔄'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* DYNAMIC ITEMS SELECTOR ROW: Vocab cards OR Sentence cards */}
          {activeTab === 'vocabulary' ? (
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-3 tablet-color-cards-row w-full">
              {vocabularyList.map((item) => {
                const isSelected = currentVocab.id === item.id;
                const isPracticed = practicedItems.has(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playSoundEffect('click');
                      setSelectedVocabId(item.id);
                      setSpeechFeedback(`Bé đã chọn ${item.word} (${item.meaning}). Nghe mẫu rồi nói nhé!`);
                      setSpeechSuccess(null);
                      setPronunciationEvaluation(null);
                      setPracticeAttemptCount(1);
                    }}
                    className={`bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl p-1.5 sm:p-2 md:p-2.5 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative shadow-sm hover:shadow-md hover:-translate-y-0.5 min-w-0 ${
                      isSelected
                        ? 'border-[3px] border-[#15803d] ring-4 ring-[#86c898]/50 shadow-md'
                        : 'border-[2.5px] border-[#86c898] hover:border-emerald-600'
                    }`}
                  >
                    {isPracticed && (
                      <div className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                    )}

                    <div className="w-full max-w-[96px] h-9 sm:h-11 md:h-12 flex items-center justify-center overflow-hidden">
                      {renderItemMiniThumb(item)}
                    </div>

                    <span className="font-black text-xs sm:text-sm md:text-base text-emerald-950 tracking-normal font-display mt-0.5 sm:mt-1 truncate max-w-full text-center px-0.5">
                      {item.word}
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-0.5 max-w-full px-0.5">
                      {item.lesson && (
                        <span className="text-[8px] font-black text-emerald-800 bg-[#e0f4e7] border border-[#86c898]/70 px-1 py-0.2 rounded shrink-0">
                          {item.lesson.replace('Lesson ', 'L')}
                        </span>
                      )}
                      <span className="text-[9px] sm:text-[10px] md:text-xs text-emerald-700 font-semibold truncate max-w-full text-center">
                        {item.meaning}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-3 tablet-color-cards-row w-full">
              {sentencesList.map((sentence, idx) => {
                const isSelected = selectedSentenceIndex === idx;
                const isPracticed = practicedItems.has(sentence.id);

                return (
                  <button
                    key={sentence.id}
                    onClick={() => {
                      playSoundEffect('click');
                      setSelectedSentenceIndex(idx);
                      setSpeechFeedback(`Bé đã chọn mẫu câu: ${sentence.example}. Nghe mẫu rồi luyện nói nhé!`);
                      setSpeechSuccess(null);
                      setPronunciationEvaluation(null);
                      setPracticeAttemptCount(1);
                    }}
                    className={`bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-200 cursor-pointer relative shadow-sm hover:shadow-md hover:-translate-y-0.5 min-w-0 text-left ${
                      isSelected
                        ? 'border-[3px] border-[#0d9488] ring-4 ring-teal-400/40 shadow-md bg-teal-50/95'
                        : 'border-[2.5px] border-[#86c898] hover:border-teal-600'
                    }`}
                  >
                    {isPracticed && (
                      <div className="absolute top-1.5 right-1.5 bg-teal-600 text-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                    )}
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs">💬</span>
                      {sentence.lesson && (
                        <span className="text-[8px] font-black text-teal-800 bg-teal-100 border border-teal-300 px-1 rounded">
                          {sentence.lesson.replace('Lesson ', 'L')}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-emerald-950 line-clamp-2">
                      {sentence.example}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium truncate mt-1">
                      {sentence.exampleVi}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
            </>
          )}

        </div>

        {/* ============================================================== */}
        {/* COLUMN 3: WIDGETS & MASCOT (Desktop: Right 188px-198px | Tablet: Bottom-Left Widgets + Bottom-Right Mascot) */}
        {/* ============================================================== */}
        <div className="w-full lg:w-[188px] xl:w-[198px] shrink-0 flex flex-col md:flex-row lg:flex-col items-center md:items-end lg:items-stretch justify-between gap-3 lg:gap-3.5 tablet-bottom-widgets-container">
          
          {/* Bottom-Left Widgets Container on Tablet / Column 3 on Desktop */}
          <div className="w-full md:max-w-[560px] lg:max-w-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3 flex-1 tablet-widgets-left">
            
            {/* Widget 1: Today's Goal */}
            <div className="bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-sm border-[2.5px] border-[#86c898] shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="relative shrink-0">
                <Target className="w-5 h-5 text-rose-500 fill-rose-100" />
                <Sparkles className="w-2.5 h-2.5 text-amber-500 absolute -top-1 -right-1" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-emerald-950 text-xs sm:text-sm font-display truncate">
                  Today's Goal
                </h3>
                <p className="text-[9px] sm:text-[10px] text-emerald-800 font-medium leading-none">Mục tiêu hôm nay</p>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-emerald-900 mb-1">
                <span>Đã luyện <strong className="text-emerald-950 text-xs">{goalCount}/4</strong> mục</span>
                <span className="text-emerald-800 text-[11px]">{Math.round((goalCount / 4) * 100)}%</span>
              </div>
              
              <div className="w-full h-2 bg-[#e2f4e8] rounded-full overflow-hidden p-0.5 border border-[#86c898]">
                <div 
                  className="h-full bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb55b] rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${(goalCount / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Widget 2: My Garden Progress (Decorated with Watering Can & Garden Shelf, Extended Height, Centered Sprout) */}
          <div 
            onClick={() => {
              playSoundEffect('click');
              setActiveModal('garden');
            }}
            className="relative overflow-hidden bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-sm hover:shadow-md border-[2.5px] border-[#86c898] flex flex-col justify-between items-center text-center flex-1 min-h-[205px] lg:min-h-0 group cursor-pointer transition-all"
            title="Xem chi tiết Khu vườn xanh / View Green Garden details"
          >
            
            {/* Header: Title */}
            <div className="flex items-center gap-1.5 self-start w-full mb-1 relative z-20">
              <Sprout className="w-4 h-4 text-emerald-700 fill-emerald-600 shrink-0" />
              <div className="text-left min-w-0">
                <h3 className="font-extrabold text-emerald-950 text-xs sm:text-sm font-display truncate">
                  My Garden
                </h3>
                <p className="text-[9px] sm:text-[10px] text-emerald-800 font-medium leading-none">Khu vườn của em</p>
              </div>
            </div>

            {/* DECORATION 1: Cute Watering Can (Positioned clearly below the title, enlarged for clarity) */}
            <div 
              className="absolute top-[50px] sm:top-[54px] left-1.5 sm:left-2 z-[5] pointer-events-none select-none opacity-90 group-hover:opacity-100 transition-all duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.07)] hover:scale-105"
              title="Bình tưới nước"
            >
              <svg viewBox="0 0 66 54" className="w-[44px] sm:w-[50px] xl:w-[54px] h-auto">
                <defs>
                  <linearGradient id="canBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="70%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>
                  <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7dd3fc" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>

                {/* Back handle */}
                <path d="M 12 18 C 3 18 2 31 10 34" fill="none" stroke="#0369a1" strokeWidth="2.8" strokeLinecap="round" />
                {/* Top arched handle */}
                <path d="M 16 16 C 17 6 32 6 34 16" fill="none" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Main Can body */}
                <path d="M 14 18 L 36 18 L 33 38 C 33 40 31 41 28 41 L 17 41 C 14 41 13 40 13 38 Z" fill="url(#canBodyGrad)" stroke="#0369a1" strokeWidth="1.2" />
                {/* Body soft highlight */}
                <path d="M 16 20 L 22 20 L 21 38 L 16 38 Z" fill="#bae6fd" opacity="0.65" />
                
                {/* Spout */}
                <path d="M 33 28 L 47 19" fill="none" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
                {/* Spout rose / sprinkle head */}
                <ellipse cx="48.5" cy="18" rx="3" ry="5" transform="rotate(32 48.5 18)" fill="#0369a1" />
                <ellipse cx="48.5" cy="18" rx="2" ry="3.8" transform="rotate(32 48.5 18)" fill="#7dd3fc" />
                
                {/* Water droplets (giọt nước nhẹ tưới mềm mại) */}
                <path d="M 54 23 C 54 21.5 56 22 56 24 C 56 25.5 54 25.5 54 23 Z" fill="url(#dropGrad)" />
                <circle cx="58.5" cy="30" r="1.8" fill="#0284c7" opacity="0.85" />
                <path d="M 58.5 28.2 Q 60 30 58.5 31.8 Q 57 30 58.5 28.2 Z" fill="#38bdf8" />
                <circle cx="53" cy="34" r="1.4" fill="#38bdf8" opacity="0.9" />

                {/* Cute Eco Sprout decal on can body */}
                <circle cx="25" cy="29" r="4.2" fill="#ffffff" opacity="0.92" />
                <path d="M 25 26.5 C 27.5 26.5 28 29.5 25 31 C 22.5 29.5 23 26.5 25 26.5 Z" fill="#16a34a" />
                <path d="M 25 29 C 23.5 28.5 23.5 27 25 27 Z" fill="#4ade80" />
              </svg>
            </div>

            {/* DECORATION 2: Mini Wooden Shelf with Mini Potted Plant, Trowel & Pebbles (Enlarged by 55%, Well-Padded at Bottom-Right) */}
            <div 
              className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 z-[5] pointer-events-none select-none opacity-95 group-hover:opacity-100 transition-all duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.09)]"
              title="Kệ làm vườn & dụng cụ"
            >
              <svg viewBox="0 0 92 56" className="w-[76px] sm:w-[84px] xl:w-[90px] h-auto">
                <defs>
                  <linearGradient id="woodShelfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#92400e" />
                    <stop offset="50%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                </defs>

                {/* Wooden shelf plank with bevel edge */}
                <rect x="8" y="32" width="76" height="6.5" rx="2" fill="url(#woodShelfGrad)" stroke="#5c2606" strokeWidth="1" />
                <rect x="9.5" y="32" width="73" height="2" rx="0.8" fill="#f59e0b" opacity="0.75" />
                
                {/* Sturdy Shelf legs */}
                <rect x="18" y="38.5" width="4.5" height="13" rx="1" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
                <rect x="67" y="38.5" width="4.5" height="13" rx="1" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
                {/* Cross support beam */}
                <line x1="22.5" y1="43.5" x2="67" y2="43.5" stroke="#5c2606" strokeWidth="1.6" />

                {/* --- Mini Pot 1: Terracotta succulent on shelf (left) --- */}
                <path d="M 16 23 L 30 23 L 28 32 L 18 32 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="0.9" />
                <rect x="15" y="21" width="16" height="2.8" rx="0.8" fill="#c2410c" stroke="#9a3412" strokeWidth="0.8" />
                {/* Succulent fleshy leaves */}
                <ellipse cx="23" cy="18.5" rx="4.8" ry="3" fill="#15803d" />
                <circle cx="19.5" cy="19.2" r="2.8" fill="#22c55e" />
                <circle cx="26.5" cy="19.2" r="2.8" fill="#4ade80" />
                <circle cx="23" cy="16.2" r="2" fill="#86efac" />
                <circle cx="23" cy="15" r="1" fill="#bbf7d0" />

                {/* --- Mini Pot 2: Mint ceramic cactus with pink bloom (middle) --- */}
                <path d="M 37 25 L 48 25 L 46.5 32 L 38.5 32 Z" fill="#ecfdf5" stroke="#059669" strokeWidth="0.8" />
                <rect x="36" y="23.2" width="13" height="2.2" rx="0.6" fill="#6ee7b7" stroke="#059669" strokeWidth="0.7" />
                {/* Cactus body */}
                <path d="M 42.5 14 C 40 14 39.5 17 39.5 23.2 L 45.5 23.2 C 45.5 17 45 14 42.5 14 Z" fill="#16a34a" stroke="#15803d" strokeWidth="0.7" />
                {/* Cactus ridges */}
                <line x1="42.5" y1="14.5" x2="42.5" y2="23.2" stroke="#4ade80" strokeWidth="0.9" />
                {/* Tiny blooming flower on top */}
                <circle cx="42.5" cy="13" r="1.8" fill="#f43f5e" />
                <circle cx="42.5" cy="13" r="0.8" fill="#fef08a" />

                {/* --- Garden Hand Trowel (Xẻng nhỏ làm vườn) leaning right --- */}
                {/* Turned wooden handle */}
                <path d="M 62 13 L 67 21" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
                <circle cx="61.5" cy="12.5" r="1.6" fill="#b45309" />
                {/* Metal ferrule collar */}
                <line x1="66.5" y1="20.5" x2="68" y2="23" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round" />
                {/* Stainless steel scoop blade with metallic highlight */}
                <path d="M 67 22.5 C 70 22 75.5 27 74.5 30.5 C 72.5 32 67.5 28.5 67 25 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
                <path d="M 68 23.5 Q 72 26 71.5 29" stroke="#f8fafc" strokeWidth="1" fill="none" />

                {/* --- Smooth River Pebbles (Đá cuội làm vườn dưới chân kệ) --- */}
                {/* Pebble 1 */}
                <ellipse cx="32" cy="49" rx="6" ry="3.4" fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
                <ellipse cx="31" cy="48" rx="3.5" ry="1.6" fill="#e2e8f0" opacity="0.8" />

                {/* Pebble 2 */}
                <ellipse cx="43" cy="49.5" rx="7" ry="4" fill="#64748b" stroke="#475569" strokeWidth="0.8" />
                <ellipse cx="42" cy="48.5" rx="4" ry="1.8" fill="#94a3b8" opacity="0.75" />

                {/* Pebble 3 */}
                <ellipse cx="54" cy="50" rx="5.2" ry="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
                <ellipse cx="53" cy="49.2" rx="2.8" ry="1.4" fill="#f8fafc" opacity="0.9" />
              </svg>
            </div>

            {/* Centered Area: Soil Mound + Growing Sprout illustration + EP Progress (Harmonious & Perfectly Centered) */}
            <div className="flex-1 w-full flex flex-col items-center justify-center my-auto py-1 sm:py-2 relative z-10">
              <div className="relative my-0.5 w-full flex items-center justify-center">
                <svg viewBox="0 0 200 130" className="w-[128px] sm:w-[138px] xl:w-[145px] max-w-full h-auto drop-shadow-sm transition-transform hover:scale-105 duration-300">
                  <defs>
                    <radialGradient id="sunGlowR" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="55" r="48" fill="url(#sunGlowR)" />
                  <line x1="58" y1="33" x2="66" y2="41" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="142" y1="33" x2="134" y2="41" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="100" y1="16" x2="100" y2="26" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  
                  <ellipse cx="100" cy="105" rx="78" ry="19" fill="#a7f3d0" opacity="0.6" />
                  <ellipse cx="100" cy="100" rx="64" ry="16" fill="#78350f" />
                  <ellipse cx="100" cy="98" rx="58" ry="13" fill="#92400e" />
                  <path d="M 58,102 Q 75,93 95,97 Q 115,92 138,99 Q 120,106 100,105 Z" fill="#b45309" opacity="0.8" />
                  
                  <path d="M 100,95 Q 100,64 100,53" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                  <path d="M 100,64 C 72,59 62,43 78,43 C 94,43 100,59 100,64 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
                  <path d="M 100,64 C 128,59 138,43 122,43 C 106,43 100,59 100,64 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
                </svg>
              </div>

              {/* Progress Text with clear contrast & padding */}
              <div className="text-center text-[10.5px] sm:text-[11.5px] font-semibold text-emerald-900 leading-tight mt-1 px-1.5 py-0.5 rounded-full bg-[#f2faf5]/80 backdrop-blur-[1px] border border-[#86c898]/40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                Còn <strong className="text-emerald-950 font-black text-xs sm:text-sm tabular-nums">{remainingEPToNextTree} EP</strong> để thêm một cây
              </div>
            </div>
          </div>

          {/* Widget 3: Honor Board Top 3 (Bảng Vinh Danh) */}
          <HonorBoardWidget
            isLoggedIn={isLoggedIn && !isGuestMode && userRole === 'student'}
            currentStudentName={isLoggedIn && userRole === 'student' && !isGuestMode ? userName : ''}
            currentStudentClass={isLoggedIn && userRole === 'student' && !isGuestMode ? studentClassInput : ''}
            selectedGrade={selectedGrade}
            currentEP={ecoPoints}
            currentTrees={virtualTrees}
            onOpenFullBoard={() => setShowHonorBoardModal(true)}
            onOpenLoginModal={() => {
              playSoundEffect('click');
              setActiveModal('login');
            }}
            playSoundEffect={playSoundEffect}
            userRole={isGuestMode || userRole === 'guest' || !isLoggedIn ? 'guest' : userRole}
            isGuestMode={isGuestMode || userRole === 'guest' || !isLoggedIn}
          />

          </div>

          {/* Mascot Section: Bottom-Right on Tablet / Column 3 bottom on Desktop */}
          <div className="tablet-mascot-right relative flex flex-col items-center justify-end pt-0.5 pb-0.5 shrink-0 self-center md:self-end lg:self-auto w-auto lg:w-full">
            
            {/* Speech bubble: Centered above tree with down arrow */}
            <div 
              onClick={() => {
                playSoundEffect('chime');
                setMascotBubble('Practice makes perfect! Hãy nói thêm 1 từ nữa nhé!');
              }}
              className="relative mb-2 bg-[#f2faf5]/95 backdrop-blur-md rounded-2xl px-2.5 py-1.5 shadow-sm border-[2px] border-[#86c898] text-[10px] sm:text-[11px] font-extrabold text-emerald-950 cursor-pointer hover:scale-105 active:scale-95 transition-transform text-center max-w-[170px] z-10 leading-tight"
            >
              <span>{mascotBubble}</span>
              {/* Downward triangle pointer pointing to mascot */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#86c898]" />
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#f2faf5]" />
            </div>

            {/* Cute Oak Tree Mascot (SVG) */}
            <div 
              onClick={() => {
                playSoundEffect('celebrate');
                setMascotBubble('I love learning with you! 🌱');
              }}
              className="cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200 select-none animate-soft-float"
              title="Bấm vào mình để nghe cổ vũ nhé!"
            >
              <svg viewBox="0 0 160 180" className="w-16 sm:w-20 h-auto drop-shadow-md">
                <path d="M 72,120 Q 65,155 55,170 L 105,170 Q 95,155 88,120 Z" fill="#854d0e" />
                <path d="M 60,165 Q 40,172 35,172" stroke="#854d0e" strokeWidth="6" strokeLinecap="round" />
                <path d="M 100,165 Q 120,172 125,172" stroke="#854d0e" strokeWidth="6" strokeLinecap="round" />
                <path d="M 68,130 Q 45,120 40,110" stroke="#854d0e" strokeWidth="5" strokeLinecap="round" />
                <path d="M 92,130 Q 115,120 120,110" stroke="#854d0e" strokeWidth="5" strokeLinecap="round" />
                
                <g fill="#22c55e" stroke="#16a34a" strokeWidth="2">
                  <circle cx="80" cy="70" r="45" />
                  <circle cx="50" cy="75" r="30" />
                  <circle cx="110" cy="75" r="30" />
                  <circle cx="55" cy="50" r="28" fill="#4ade80" />
                  <circle cx="105" cy="50" r="28" fill="#4ade80" />
                  <circle cx="80" cy="40" r="30" fill="#86efac" />
                </g>
                
                {/* Eyes */}
                <ellipse cx="68" cy="72" rx="4.5" ry="6.5" fill="#0f172a" />
                <circle cx="66" cy="69" r="2" fill="#ffffff" />
                
                <ellipse cx="92" cy="72" rx="4.5" ry="6.5" fill="#0f172a" />
                <circle cx="90" cy="69" r="2" fill="#ffffff" />
                
                {/* Cheeks */}
                <ellipse cx="58" cy="80" rx="5" ry="3.5" fill="#f87171" opacity="0.7" />
                <ellipse cx="102" cy="80" rx="5" ry="3.5" fill="#f87171" opacity="0.7" />
                
                {/* Smile */}
                <path d="M 74,80 Q 80,88 86,80" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>

          </div>

        </div>

      </div>

      {/* FOOTER - Fixed and Clean at the bottom */}
      <footer className="relative z-20 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-extrabold text-emerald-950 bg-[#f2faf5]/95 backdrop-blur-md shrink-0 border-t border-[#86c898]/50 gap-1 text-center sm:text-left mt-auto shadow-sm">
        <span>ECO-VOICE © 2026 · Lê Thị Thúy Diễm · Trường TH Nguyễn Hiền, Phường Vĩnh Tế, tỉnh An Giang</span>
        <span className="text-emerald-800">Global Success Curriculum</span>
      </footer>

      {/* MOBILE DRAWER NAVIGATION (Offcanvas Menu for < lg) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-[280px] max-w-[85vw] h-full bg-gradient-to-b from-[#206740] via-[#26774a] to-[#1c5d39] text-white p-4 shadow-2xl flex flex-col justify-between z-10 border-r-2 border-[#86efac] overflow-y-auto">
            <div className="flex flex-col gap-1.5 w-full">
              {/* Header with Close */}
              <div className="flex items-center justify-between pb-3 border-b border-[#2d8552] mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 border border-[#86efac] shrink-0">
                    <svg viewBox="0 0 36 36" className="w-5 h-5 text-emerald-600 fill-current">
                      <path d="M14 6 C8 12 8 22 18 26 C28 22 28 12 22 6 Z" fill="#22c55e" />
                      <path d="M8 18 C4 22 4 28 10 30 C16 28 16 22 12 18 C10 22 9 22 8 18 Z" fill="#15803d" />
                    </svg>
                  </div>
                  <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                    <span className="font-black text-lg text-emerald-50 font-display">ECO-VOICE</span>
                    <span className="text-xs sm:text-sm text-emerald-200 font-extrabold tracking-tight">
                      (AI Pronunciation and Eco-Learning Companion)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-[#185834] text-emerald-200 hover:text-white hover:bg-[#206740] cursor-pointer"
                  title="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lessons */}
              <button
                onClick={() => handleSidebarItemClick('lessons')}
                title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Bài học"}
                className={`flex items-center gap-2.5 p-2 rounded-2xl w-full text-left transition-all cursor-pointer ${
                  isLoggedIn && activeSidebar === 'lessons'
                    ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                    : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isLoggedIn && activeSidebar === 'lessons' ? 'bg-[#86efac] text-[#13492a]' : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
                }`}>
                  <Home className="w-4 h-4" />
                </div>
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                  <span className="font-bold text-sm">Lessons</span>
                  <span className="text-[10px] text-emerald-200/90">Bài học</span>
                </div>
              </button>

              {/* Speaking Practice */}
              <button
                onClick={() => handleSidebarItemClick('speaking')}
                title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Luyện nói"}
                className={`flex items-center gap-2.5 p-2 rounded-2xl w-full text-left transition-all cursor-pointer ${
                  isLoggedIn && activeSidebar === 'speaking'
                    ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                    : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isLoggedIn && activeSidebar === 'speaking' ? 'bg-[#86efac] text-[#13492a]' : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
                }`}>
                  <Mic className="w-4 h-4" />
                </div>
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                  <span className="font-black text-sm text-white">Speaking Practice</span>
                  <span className="text-[10px] text-emerald-100 font-medium">Luyện nói</span>
                </div>
              </button>

              {/* Assignments */}
              <button
                onClick={() => handleSidebarItemClick('assignments')}
                title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Bài tập cô giao"}
                className={`flex items-center gap-2.5 p-2 rounded-2xl w-full text-left transition-all cursor-pointer relative ${
                  isLoggedIn && activeSidebar === 'assignments'
                    ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                    : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative ${
                  isLoggedIn && activeSidebar === 'assignments' ? 'bg-[#86efac] text-[#13492a]' : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
                }`}>
                  <FileCheck className="w-4 h-4" />
                  {isLoggedIn && studentAssignmentsBadgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-emerald-950 font-black text-[9px] flex items-center justify-center">
                      {studentAssignmentsBadgeCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                  <span className="font-bold text-sm">{userRole !== 'teacher' && isLoggedIn && isGuestMode ? 'Demo Tasks' : 'Assignments'}</span>
                  <span className="text-[10px] text-emerald-200/90">{userRole !== 'teacher' && isLoggedIn && isGuestMode ? 'Nhiệm vụ mẫu trải nghiệm (Demo Task)' : 'Bài tập cô giao'}</span>
                </div>
              </button>

              {/* Eco Games */}
              <button
                onClick={() => handleSidebarItemClick('games')}
                title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Trò chơi xanh"}
                className={`flex items-center gap-2.5 p-2 rounded-2xl w-full text-left transition-all cursor-pointer ${
                  isLoggedIn && activeSidebar === 'games'
                    ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                    : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isLoggedIn && activeSidebar === 'games' ? 'bg-[#86efac] text-[#13492a]' : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
                }`}>
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                  <span className="font-bold text-sm">Eco Games</span>
                  <span className="text-[10px] text-emerald-200/90">Trò chơi xanh</span>
                </div>
              </button>

              {/* My Garden */}
              <button
                onClick={() => handleSidebarItemClick('garden', 'garden')}
                title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Vườn của em"}
                className={`flex items-center gap-2.5 p-2 rounded-2xl w-full text-left transition-all cursor-pointer ${
                  isLoggedIn && activeSidebar === 'garden'
                    ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                    : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isLoggedIn && activeSidebar === 'garden' ? 'bg-[#86efac] text-[#13492a]' : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
                }`}>
                  <Sprout className="w-4 h-4" />
                </div>
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                  <span className="font-bold text-sm">My Garden</span>
                  <span className="text-[10px] text-emerald-200/90">Vườn của em</span>
                </div>
              </button>

              {/* Honor Board */}
              <button
                onClick={() => handleSidebarItemClick('honor', 'honorBoard')}
                title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Bảng vinh danh"}
                className="flex items-center gap-2.5 p-2 rounded-2xl w-full text-left transition-all cursor-pointer text-emerald-50 hover:bg-[#287b4d] hover:text-white"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[#185834] text-amber-300 border border-[#277a4b]">
                  <Trophy className="w-4 h-4 fill-amber-300" />
                </div>
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                  <span className="font-bold text-sm">Honor Board</span>
                  <span className="text-[10px] text-emerald-200/90">Bảng vinh danh</span>
                </div>
              </button>

              {/* How to Use */}
              <button
                onClick={() => handleSidebarItemClick('help', 'help')}
                title={!isLoggedIn ? "Vui lòng đăng nhập (Học sinh / Giáo viên / Guest Mode) để trải nghiệm tính năng này!" : "Hướng dẫn"}
                className={`flex items-center gap-2.5 p-2 rounded-2xl w-full text-left transition-all cursor-pointer ${
                  isLoggedIn && activeSidebar === 'help'
                    ? 'bg-[#2b8855] text-white font-black border-2 border-[#86efac] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                    : 'text-emerald-50 hover:bg-[#287b4d] hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isLoggedIn && activeSidebar === 'help' ? 'bg-[#86efac] text-[#13492a]' : 'bg-[#185834] text-emerald-200 border border-[#277a4b]'
                }`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                  <span className="font-bold text-sm">How to Use</span>
                  <span className="text-[10px] text-emerald-200/90">Hướng dẫn</span>
                </div>
              </button>
            </div>

            {/* Bottom Controls: Settings */}
            <div className="flex flex-col gap-1 w-full border-t border-[#297a4d] pt-2 mt-2">
              <button
                onClick={() => {
                  playSoundEffect('click');
                  setActiveModal('settings');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 p-2 rounded-2xl w-full text-left hover:bg-[#287b4d] text-emerald-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#185834] text-emerald-200 flex items-center justify-center shrink-0 border border-[#277a4b]">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-sm">Settings</span>
                  <span className="text-[10px] text-emerald-200/90">Cài đặt</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOGIN & USER ACCOUNT */}
      {activeModal === 'login' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#f0faf4] rounded-3xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl relative border-[3px] border-[#86c898] flex flex-col gap-3.5 max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button 
              type="button"
              onClick={() => {
                setActiveModal(null);
                setLoginPromptNotice(null);
                setStudentLoginError(null);
                setTeacherLoginError(null);
                setChangePassMsg(null);
              }}
              className="absolute top-3.5 right-3.5 p-2 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer transition-colors z-10"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {/* CASE 1: USER IS ALREADY LOGGED IN -> SHOW ACCOUNT PROFILE CARD ONLY */}
            {isLoggedIn ? (
              <div className="flex flex-col gap-3.5 pt-1">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-emerald-200 pb-3 pr-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-200 text-emerald-900 border-2 border-emerald-400 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    {userRole === 'teacher' ? '👩‍🏫' : (isGuestMode ? '🌟' : '👧')}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">TÀI KHOẢN CÁ NHÂN</span>
                    <h3 className="text-base sm:text-lg font-black text-emerald-950 truncate leading-snug">
                      {userName}
                    </h3>
                    <span className="text-xs font-bold text-emerald-800 truncate">
                      {userRole === 'teacher' 
                        ? 'Giáo viên / Quản trị viên' 
                        : (isGuestMode ? 'Khách trải nghiệm' : `Học sinh • Lớp ${studentClassInput}`)}
                    </span>
                  </div>
                </div>

                {/* Sub-tab Switcher: Thông tin vs Đổi mật khẩu */}
                <div className="flex items-center justify-center p-1 bg-emerald-100/70 rounded-xl border border-emerald-200 gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileModalTab('overview');
                      setChangePassMsg(null);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all text-center cursor-pointer ${
                      profileModalTab === 'overview'
                        ? 'bg-emerald-800 text-white shadow-2xs'
                        : 'text-emerald-900 hover:text-emerald-950 font-medium'
                    }`}
                  >
                    Thông tin cá nhân
                  </button>
                  {!isGuestMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileModalTab('password');
                        setChangePassMsg(null);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all text-center cursor-pointer ${
                        profileModalTab === 'password'
                          ? 'bg-emerald-800 text-white shadow-2xs'
                          : 'text-emerald-900 hover:text-emerald-950 font-medium'
                      }`}
                    >
                      Đổi mật khẩu
                    </button>
                  )}
                </div>

                {/* TAB 1: OVERVIEW */}
                {profileModalTab === 'overview' && (
                  <div className="flex flex-col gap-3">
                    <div className="bg-white rounded-2xl p-3.5 border border-emerald-200 flex flex-col gap-2 text-xs text-emerald-950 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <span className="text-emerald-700 font-medium">Họ và tên:</span>
                        <span className="font-bold text-emerald-950">{userName}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <span className="text-emerald-700 font-medium">Lớp / Đơn vị:</span>
                        <span className="font-bold text-emerald-950">{studentClassInput}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <span className="text-emerald-700 font-medium">Vai trò:</span>
                        <span className="font-bold text-emerald-950">
                          {userRole === 'teacher' ? 'Giáo viên / Admin' : (isGuestMode ? 'Khách trải nghiệm' : 'Học sinh')}
                        </span>
                      </div>
                      {!isGuestMode && userRole === 'student' && (
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-emerald-700 font-medium">Thành tích:</span>
                          <div className="flex items-center gap-2 font-black">
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                              ⚡ {ecoPoints} EP
                            </span>
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                              🌳 {virtualTrees} cây
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Log Out Button */}
                    <button
                      type="button"
                      onClick={handleLogoutAction}
                      className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-700 font-extrabold border-2 border-rose-200 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out / Đăng xuất tài khoản</span>
                    </button>
                  </div>
                )}

                {/* TAB 2: CHANGE PASSWORD */}
                {profileModalTab === 'password' && (
                  <form onSubmit={handleChangePasswordSubmit} className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-bold text-emerald-950 block mb-1">
                        Mật khẩu mới / New Password:
                      </label>
                      <input
                        type="password"
                        required
                        minLength={3}
                        value={changePassNew}
                        onChange={(e) => setChangePassNew(e.target.value)}
                        placeholder="Nhập mật khẩu mới..."
                        className="w-full px-3.5 py-2 bg-white border-2 border-[#86c898] rounded-xl font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-emerald-950 block mb-1">
                        Xác nhận mật khẩu mới:
                      </label>
                      <input
                        type="password"
                        required
                        minLength={3}
                        value={changePassConfirm}
                        onChange={(e) => setChangePassConfirm(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới..."
                        className="w-full px-3.5 py-2 bg-white border-2 border-[#86c898] rounded-xl font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none text-xs sm:text-sm"
                      />
                    </div>

                    {changePassMsg && (
                      <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        changePassMsg.type === 'success' 
                          ? 'bg-emerald-100 border border-emerald-300 text-emerald-900' 
                          : 'bg-rose-50 border border-rose-300 text-rose-700'
                      }`}>
                        <span>{changePassMsg.type === 'success' ? '✅' : '⚠️'}</span>
                        <span>{changePassMsg.text}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] hover:from-[#0f5430] hover:to-[#22c55e] active:scale-95 text-white font-extrabold rounded-xl shadow cursor-pointer transition-all text-xs sm:text-sm mt-1"
                    >
                      Cập nhật mật khẩu mới
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* CASE 2: USER IS NOT LOGGED IN -> SHOW REDESIGNED COMPACT LOGIN MODAL */
              <div className="flex flex-col gap-3">
                {/* Notification when triggered by route guard */}
                {loginPromptNotice && (
                  <div className="bg-amber-50 border-2 border-amber-400 text-emerald-950 p-2.5 rounded-2xl flex items-center gap-2.5 text-xs shadow-xs shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 font-black shadow-2xs">
                      <Lock className="w-4 h-4 text-emerald-950" />
                    </div>
                    <div className="flex flex-col leading-snug min-w-0">
                      <span className="font-black text-xs sm:text-sm text-amber-950 font-display truncate">{loginPromptNotice.en}</span>
                      <span className="text-[10px] italic font-medium text-amber-900 truncate">{loginPromptNotice.vi}</span>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="text-center space-y-0.5">
                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 font-display">Sign In to Eco-Voice</h3>
                  <p className="text-xs text-emerald-800 font-medium">Đăng nhập tài khoản để học & tích lũy cây xanh 🌿</p>
                </div>

                {/* METHOD 1: Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningInGoogle}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-extrabold border-2 border-slate-200 hover:border-emerald-500 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 disabled:opacity-60 text-xs sm:text-sm"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>
                    {isSigningInGoogle ? 'Đang kết nối Google...' : 'Đăng nhập bằng tài khoản Google'}
                  </span>
                </button>

                {/* Sub-mode switcher: Sign In vs Register */}
                <div className="flex items-center justify-center p-1 bg-emerald-100/70 rounded-xl border border-emerald-200 gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentAuthMode('login');
                      setStudentLoginError(null);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all text-center cursor-pointer ${
                      studentAuthMode === 'login'
                        ? 'bg-emerald-800 text-white shadow-2xs'
                        : 'text-emerald-900 hover:text-emerald-950 font-medium'
                    }`}
                  >
                    Đăng nhập (Sign In)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentAuthMode('register');
                      setStudentLoginError(null);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all text-center cursor-pointer ${
                      studentAuthMode === 'register'
                        ? 'bg-emerald-800 text-white shadow-2xs'
                        : 'text-emerald-900 hover:text-emerald-950 font-medium'
                    }`}
                  >
                    Đăng ký tài khoản mới
                  </button>
                </div>

                {/* METHOD 2: Traditional Login Input Fields */}
                {studentAuthMode === 'login' ? (
                  <form onSubmit={handleStudentLoginSubmit} className="flex flex-col gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-emerald-950 block mb-1">
                        Username or Email / Tên đăng nhập:
                      </label>
                      <input 
                        type="text" 
                        value={loginStudentName} 
                        onChange={(e) => {
                          setLoginStudentName(e.target.value);
                          if (studentLoginError) setStudentLoginError(null);
                        }}
                        className="w-full px-3.5 py-2 bg-white border-2 border-[#86c898] rounded-xl font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none text-xs sm:text-sm"
                        placeholder="Nhập tên học sinh (VD: Chí Vỹ) hoặc email..."
                        required
                        autoComplete={rememberStudent ? "username" : "off"}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-emerald-950 block mb-1">Password / Mật khẩu:</label>
                      <div className="relative">
                        <input
                          type={showStudentPassword ? "text" : "password"}
                          value={loginStudentPassword}
                          onChange={(e) => {
                            setLoginStudentPassword(e.target.value);
                            if (studentLoginError) setStudentLoginError(null);
                          }}
                          className="w-full px-3.5 py-2 bg-white border-2 border-[#86c898] rounded-xl font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none text-xs sm:text-sm tracking-wider pr-10"
                          placeholder="Nhập mật khẩu (ví dụ: 123)..."
                          required
                          autoComplete={rememberStudent ? "current-password" : "new-password"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentPassword(!showStudentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                          title={showStudentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between py-0.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={rememberStudent} 
                          onChange={(e) => setRememberStudent(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300 accent-[#15803d] cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-emerald-950">Ghi nhớ mật khẩu</span>
                      </label>
                    </div>

                    {/* Error Notification */}
                    {studentLoginError && (
                      <div className="p-2.5 bg-red-50 border border-red-300 rounded-xl text-red-700 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-200">
                        <span className="text-base leading-none shrink-0">⚠️</span>
                        <span className="leading-snug">{studentLoginError}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isAuthenticatingStudent}
                      className="w-full py-2.5 bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] hover:from-[#0f5430] hover:to-[#22c55e] active:scale-95 text-white font-extrabold rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-60 mt-0.5"
                    >
                      <span>{isAuthenticatingStudent ? 'Đang xác thực...' : 'Vào học ngay (Start Learning)'}</span>
                    </button>

                    {/* Guest Mode Option */}
                    <button
                      type="button"
                      onClick={handleGuestLoginAction}
                      className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border-2 border-dashed border-[#86c898] rounded-xl shadow-2xs cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95 text-xs font-bold"
                    >
                      <span>⚡</span>
                      <span>Chế độ trải nghiệm (Guest Mode)</span>
                    </button>
                  </form>
                ) : (
                  /* REGISTRATION FORM */
                  <form onSubmit={handleStudentRegisterSubmit} className="flex flex-col gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-emerald-950 block mb-1">
                        Họ và tên học sinh / Full Name:
                      </label>
                      <input 
                        type="text" 
                        value={regStudentName} 
                        onChange={(e) => setRegStudentName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-[#86c898] rounded-xl font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none text-xs sm:text-sm"
                        placeholder="Ví dụ: Nguyễn Văn An"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-emerald-950 block mb-1">Lớp / Class:</label>
                        <select
                          value={regStudentClass}
                          onChange={(e) => setRegStudentClass(e.target.value)}
                          className="w-full px-3 py-2 bg-white border-2 border-[#86c898] rounded-xl font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none text-xs sm:text-sm"
                        >
                          <option value="3A1">Lớp 3A1 (Khối 3)</option>
                          <option value="3A2">Lớp 3A2 (Khối 3)</option>
                          <option value="4A1">Lớp 4A1 (Khối 4)</option>
                          <option value="4A2">Lớp 4A2 (Khối 4)</option>
                          <option value="4A3">Lớp 4A3 (Khối 4)</option>
                          <option value="5A1">Lớp 5A1 (Khối 5)</option>
                          <option value="5A2">Lớp 5A2 (Khối 5)</option>
                          <option value="5A3">Lớp 5A3 (Khối 5)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-emerald-950 block mb-1">Email:</label>
                        <input 
                          type="email" 
                          value={regStudentEmail} 
                          onChange={(e) => setRegStudentEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border-2 border-[#86c898] rounded-xl font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none text-xs sm:text-sm"
                          placeholder="hocsinh@gmail.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-emerald-950 block mb-1">
                        Mật khẩu / Password (tối thiểu 6 ký tự):
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? "text" : "password"}
                          value={regStudentPassword}
                          onChange={(e) => setRegStudentPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-white border-2 border-[#86c898] rounded-xl font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400 outline-none text-xs sm:text-sm tracking-wider pr-10"
                          placeholder="Tối thiểu 6 ký tự..."
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                          title={showRegPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {studentLoginError && (
                      <div className="p-2.5 bg-red-50 border border-red-300 rounded-xl text-red-700 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-200">
                        <span className="text-base leading-none shrink-0">⚠️</span>
                        <span className="leading-snug">{studentLoginError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isRegisteringStudent}
                      className="w-full py-2.5 bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] hover:from-[#0f5430] hover:to-[#22c55e] active:scale-95 text-white font-extrabold rounded-xl shadow cursor-pointer transition-all text-xs sm:text-sm disabled:opacity-60 mt-1"
                    >
                      {isRegisteringStudent ? 'Đang tạo tài khoản...' : 'Tạo tài khoản Học sinh & Vào học'}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL: MY GARDEN (GREEN GARDEN / KHU VƯỜN XANH CỦA EM) */}
      {activeModal === 'garden' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#f2faf5] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative border-[3px] border-[#86c898]">
            <button 
              onClick={() => {
                playSoundEffect('click');
                setActiveModal(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer"
              title="Đóng / Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tree Icon & Bilingual Title */}
            <div className="text-center space-y-1.5 mb-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100/90 border-2 border-emerald-300 flex items-center justify-center text-3xl shadow-xs ring-4 ring-emerald-50">
                🌳
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-lg sm:text-xl font-black text-emerald-950 font-display tracking-tight leading-snug">
                  Green Garden <span className="text-emerald-700 font-extrabold text-base sm:text-lg">/ Khu vườn xanh của em</span>
                </h3>
              </div>
              {/* Dòng chú thích quy đổi: Song ngữ Anh - Việt */}
              <div className="flex flex-col items-center gap-0.5 text-center px-1 pt-0.5">
                <p className="text-xs sm:text-sm font-bold text-emerald-900 leading-snug">
                  Every 30 Eco Points (EP) grows 1 new green tree!
                </p>
                <p className="text-[11px] sm:text-xs text-emerald-700 font-medium leading-snug">
                  Mỗi 30 Eco Points (EP) sẽ vun trồng thành 1 cây xanh mới!
                </p>
              </div>
            </div>

            {/* Các chỉ số thống kê (3 cột) - Song ngữ Anh - Việt */}
            <div className="bg-[#e2f4e8] rounded-2xl p-3.5 sm:p-4 border-2 border-[#86c898] mb-4 flex items-center justify-between text-center shadow-xs divide-x-2 divide-[#86c898]/50">
              {/* Cột 1: EP / Điểm EP */}
              <div className="flex-1 flex flex-col items-center px-1">
                <span className="text-lg sm:text-2xl font-black text-emerald-950 tabular-nums">
                  {ecoPoints} EP
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-800 font-bold leading-tight mt-0.5">
                  {ecoPoints} Điểm EP
                </span>
              </div>

              {/* Cột 2: Trees / Cây đã trồng */}
              <div className="flex-1 flex flex-col items-center px-1">
                <span className="text-lg sm:text-2xl font-black text-emerald-950 tabular-nums">
                  {virtualTrees} {virtualTrees === 1 ? 'Tree' : 'Trees'}
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-800 font-bold leading-tight mt-0.5">
                  {virtualTrees} Cây đã trồng
                </span>
              </div>

              {/* Cột 3: EP Needed / EP còn thiếu */}
              <div className="flex-1 flex flex-col items-center px-1">
                <span className="text-lg sm:text-2xl font-black text-amber-700 tabular-nums">
                  {remainingEPToNextTree} EP Needed
                </span>
                <span className="text-[10px] sm:text-xs text-amber-800 font-bold leading-tight mt-0.5">
                  {remainingEPToNextTree} EP còn thiếu
                </span>
              </div>
            </div>

            {/* Nút bấm ở đáy popup: Song ngữ Anh - Việt */}
            <button
              onClick={() => {
                playSoundEffect('click');
                setActiveModal(null);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] hover:from-[#0f5430] hover:to-[#22c55e] active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-wrap"
            >
              <span className="text-sm sm:text-base font-black">Continue Practicing</span>
              <span className="text-xs sm:text-sm font-semibold text-emerald-100">/ Tiếp tục luyện tập</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: MY PROGRESS (IF TRIGGERED AS MODAL) */}
      {activeModal === 'progress' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#f2faf5] rounded-3xl max-w-6xl w-full p-3 sm:p-6 shadow-2xl relative border-[3.5px] border-[#86c898] max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                playSoundEffect('click');
                setActiveModal(null);
              }}
              className="sticky top-2 float-right z-20 p-2 rounded-full bg-white/90 hover:bg-emerald-100 text-emerald-800 cursor-pointer shadow-sm transition-colors border border-emerald-200"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <StudentProgressDashboard
              selectedGrade={selectedGrade}
              onGradeChange={handleGradeChange}
              activeUnitKey={selectedUnitKey}
              studentName={isGuestMode || userRole === 'guest' || !isLoggedIn ? 'Khách trải nghiệm / Visitor' : (userName || 'Học sinh')}
              studentClass={isGuestMode || userRole === 'guest' || !isLoggedIn ? 'Trải nghiệm (Demo / Guest)' : (userRole === 'teacher' ? (teacherSelectedClass ? (teacherSelectedClass.startsWith(selectedGrade) ? teacherSelectedClass : `${selectedGrade}A3`) : `${selectedGrade}A3`) : studentClassInput)}
              userRole={isGuestMode || !isLoggedIn ? 'guest' : userRole}
              isGuestMode={isGuestMode || userRole === 'guest' || !isLoggedIn}
              ecoPoints={ecoPoints}
              virtualTrees={virtualTrees}
              practicedItemsCount={practicedItems.size}
              onNavigateToUnit={(unitKey) => {
                setActiveModal(null);
                const ok = handleUnitChange(unitKey);
                if (!ok) return;
                setActiveSidebar('speaking');
                setMascotBubble('Cùng luyện phát âm từ vựng bài học này nào!');
              }}
              onStartPractice={(targetUnitKey) => {
                setActiveModal(null);
                const keyToUse = targetUnitKey || selectedUnitKey || 'unit_1';
                handleUnitChange(keyToUse);
                setActiveSidebar('speaking');
                setMascotBubble('Cùng luyện phát âm từ vựng và mẫu câu chuẩn bản xứ nhé!');
              }}
              onOpenEcoGames={(targetUnitKey) => {
                setActiveModal(null);
                const keyToUse = targetUnitKey || selectedUnitKey || 'unit_1';
                handleUnitChange(keyToUse);
                setActiveSidebar('games');
                setMascotBubble('Cùng chơi trò chơi xanh để tích lũy cây xanh nhé!');
              }}
              playSoundEffect={playSoundEffect}
              isOpenAsModal={true}
              onClose={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {/* MODAL / VIEW: TEACHER DASHBOARD CONTENT EDITOR */}
      {(activeModal === 'teacher' || showTeacherDashboard) && (
        <TeacherDashboard 
          onClose={() => {
            setShowTeacherDashboard(false);
            setActiveModal(null);
          }} 
          playSoundEffect={playSoundEffect}
        />
      )}

      {/* MODAL: HONOR BOARD (BẢNG VINH DANH) */}
      <HonorBoardModal
        isOpen={showHonorBoardModal || activeModal === 'honor'}
        onClose={() => {
          setShowHonorBoardModal(false);
          if (activeModal === 'honor') setActiveModal(null);
        }}
        isLoggedIn={isLoggedIn && !isGuestMode && userRole === 'student'}
        currentStudentName={!isGuestMode && isLoggedIn && userRole === 'student' ? userName : ''}
        currentStudentClass={!isGuestMode && isLoggedIn && userRole === 'student' ? studentClassInput : ''}
        selectedGrade={selectedGrade}
        currentEP={ecoPoints}
        currentTrees={virtualTrees}
        onOpenLoginModal={() => {
          playSoundEffect('click');
          setActiveModal('login');
        }}
        playSoundEffect={playSoundEffect}
        userRole={isGuestMode || userRole === 'guest' || !isLoggedIn ? 'guest' : userRole}
        isGuestMode={isGuestMode || userRole === 'guest' || !isLoggedIn}
      />

      {/* MODAL: SETTINGS */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#f2faf5] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border-[3px] border-[#86c898]">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-6 h-6 text-emerald-800" />
              <h3 className="text-lg font-black text-emerald-950 font-display">Cài đặt ứng dụng</h3>
            </div>
            <div className="space-y-3 my-4 text-xs font-semibold text-emerald-950">
              <div className="p-3 bg-[#e2f4e8] rounded-2xl border border-[#86c898] space-y-2">
                <span className="font-bold text-emerald-950 block">Giọng phát âm mặc định:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAccent('US')}
                    className={`py-2 px-3 rounded-xl border-2 flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all ${
                      accent === 'US'
                        ? 'bg-[#0c4326] text-white border-[#4ade80] shadow-xs'
                        : 'bg-white text-emerald-950 border-[#86c898] hover:bg-[#d8f0df]'
                    }`}
                  >
                    <span>🇺🇸</span>
                    <span>US English (Mỹ)</span>
                  </button>
                  <button
                    onClick={() => setAccent('UK')}
                    className={`py-2 px-3 rounded-xl border-2 flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all ${
                      accent === 'UK'
                        ? 'bg-[#0c4326] text-white border-[#4ade80] shadow-xs'
                        : 'bg-white text-emerald-950 border-[#86c898] hover:bg-[#d8f0df]'
                    }`}
                  >
                    <span>🇬🇧</span>
                    <span>UK English (Anh)</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#ddf3e5] rounded-2xl border border-[#86c898] text-emerald-950 leading-relaxed">
                <p className="font-bold">🎤 Chấm phát âm thông minh:</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Hệ thống sử dụng công nghệ Web Speech Recognition so khớp chuẩn từ vựng và câu. Đọc sai hoặc đọc từ khác sẽ được báo không đạt để bé rèn luyện chuẩn phát âm.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] hover:from-[#0f5430] hover:to-[#22c55e] text-white font-bold rounded-xl cursor-pointer shadow"
            >
              Lưu & Đóng
            </button>
          </div>
        </div>
      )}

      {/* MODAL: BOOK MAP */}
      {/* MODAL: BOOK MAP EXPLORER */}
      {activeModal === 'bookmap' && (() => {
        const explorerGradeData = bookmapDatabase.grades[bookmapExplorerGrade] || bookmapDatabase.grades['3'];
        const filteredUnits = explorerGradeData.units.filter(u => 
          u.unitFullName.toLowerCase().includes(bookmapSearch.toLowerCase()) ||
          u.theme.toLowerCase().includes(bookmapSearch.toLowerCase()) ||
          u.vocabulary.some(v => v.word.toLowerCase().includes(bookmapSearch.toLowerCase()) || v.meaning.toLowerCase().includes(bookmapSearch.toLowerCase()))
        );

        const handleDownloadJson = () => {
          playSoundEffect('click');
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmapDatabase, null, 2));
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", "bookmap_globalsuccess_grades_3_4_5.json");
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
        };

        const handleCopyJson = () => {
          playSoundEffect('click');
          navigator.clipboard.writeText(JSON.stringify(bookmapDatabase, null, 2));
          setCopiedJson(true);
          setTimeout(() => setCopiedJson(false), 2000);
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-[#f2faf5] rounded-3xl max-w-4xl w-full max-h-[90vh] p-4 sm:p-6 shadow-2xl relative border-[3px] border-[#86c898] flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#86c898]/40 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center border border-[#86c898]">
                    <BookOpen className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-emerald-950 font-display">
                      Danh Mục Book Map - Global Success (Khối 3, 4, 5)
                    </h3>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Chương trình GDPT 2018 · Toàn bộ 60 Units chuẩn kiến thức & kỹ năng
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Controls bar: Grade Switcher + Actions */}
              <div className="py-3 flex flex-wrap items-center justify-between gap-2 shrink-0 border-b border-[#86c898]/30">
                {/* Grade Switcher Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-[#e2f4e8] rounded-2xl border border-[#86c898]">
                  {(['3', '4', '5'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => {
                        playSoundEffect('click');
                        setBookmapExplorerGrade(g);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        bookmapExplorerGrade === g
                          ? 'bg-[#0c4326] text-white shadow-xs border border-[#4ade80]'
                          : 'text-emerald-900 hover:bg-emerald-200/60'
                      }`}
                    >
                      Grade {g} (20 Units)
                    </button>
                  ))}
                </div>

                {/* Search & JSON Buttons */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-emerald-700 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm bài học, từ vựng..."
                      value={bookmapSearch}
                      onChange={(e) => setBookmapSearch(e.target.value)}
                      className="pl-8 pr-3 py-1 bg-white border border-[#86c898] rounded-xl text-xs font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-400 w-36 sm:w-48"
                    />
                  </div>

                  <button
                    onClick={() => setShowBookmapJson(!showBookmapJson)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-900 hover:bg-[#d8f0df] transition-colors cursor-pointer"
                  >
                    {showBookmapJson ? 'Xem Danh Mục' : 'Xem JSON'}
                  </button>

                  <button
                    onClick={handleCopyJson}
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-[#86c898] text-xs font-bold text-emerald-900 hover:bg-[#d8f0df] transition-colors cursor-pointer flex items-center gap-1"
                    title="Sao chép toàn bộ JSON"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copiedJson ? 'Đã chép!' : 'Chép JSON'}</span>
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#0c4326] to-[#16a34a] text-white text-xs font-bold shadow-xs hover:from-[#0f5430] hover:to-[#22c55e] transition-colors cursor-pointer flex items-center gap-1"
                    title="Tải về tệp bookmap_globalsuccess.json"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tải JSON</span>
                  </button>
                </div>
              </div>

              {/* Main Explorer Content Area */}
              <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-3">
                {showBookmapJson ? (
                  <div className="bg-[#1e293b] text-emerald-300 p-4 rounded-2xl text-xs font-mono overflow-x-auto select-text leading-relaxed">
                    <pre>{JSON.stringify(bookmapDatabase.grades[bookmapExplorerGrade], null, 2)}</pre>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 bg-[#e2f4e8] px-3 py-1.5 rounded-xl border border-[#86c898]">
                      <span>{explorerGradeData.gradeTitle} · 20 Units</span>
                      <span>Tìm thấy: {filteredUnits.length} bài</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredUnits.map((u) => {
                        const isCurrentlyStudying = selectedGrade === bookmapExplorerGrade && selectedUnitKey === u.unitKey;

                        return (
                          <div 
                            key={u.unitKey}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              isCurrentlyStudying 
                                ? 'bg-[#ddf3e5] border-2 border-emerald-600 shadow-sm'
                                : 'bg-white border-[#86c898] hover:border-emerald-500 hover:shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-lg bg-[#0c4326] text-white text-xs font-black">
                                  Unit {u.unitNumber}
                                </span>
                                <h4 className="font-extrabold text-sm text-emerald-950 font-display">
                                  {u.unitName}
                                </h4>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                {u.theme}
                              </span>
                            </div>

                            {/* Lesson structure or flat preview */}
                            {u.lessons && u.lessons.length > 0 ? (
                              <div className="space-y-1.5 mb-2.5">
                                {u.lessons.map(l => (
                                  <div key={l.lessonNumber} className="bg-[#f2faf5] rounded-xl p-2 border border-[#86c898]/50">
                                    <div className="flex items-center justify-between text-[11px] mb-1 font-bold text-emerald-950">
                                      <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                        {l.lessonTitle}
                                      </span>
                                      <span className="text-[10px] text-emerald-700 font-medium">
                                        {l.vocabulary.length} từ · {l.sentences.length} câu
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-1">
                                      {l.vocabulary.map(v => (
                                        <span key={v.id} className="text-[10px] font-bold bg-white border border-[#86c898]/60 text-emerald-950 px-1.5 py-0.5 rounded shadow-2xs">
                                          {v.icon} {v.word} <span className="text-emerald-700 font-normal">({v.meaning})</span>
                                        </span>
                                      ))}
                                    </div>
                                    {l.sentences.slice(0, 1).map(s => (
                                      <p key={s.id} className="text-[10px] text-emerald-900 truncate">
                                        • <strong>{s.example}</strong> <span className="text-emerald-700 font-normal">({s.exampleVi})</span>
                                      </p>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                {/* Vocabulary list preview */}
                                <div className="mb-2">
                                  <span className="text-[10px] font-bold text-emerald-900 block mb-1">Từ vựng ({u.vocabulary.length}):</span>
                                  <div className="flex flex-wrap gap-1">
                                    {u.vocabulary.map(v => (
                                      <span 
                                        key={v.id} 
                                        className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#f2faf5] border border-[#86c898] text-emerald-950 px-2 py-0.5 rounded-lg"
                                      >
                                        <span>{v.icon}</span>
                                        <span>{v.word}</span>
                                        <span className="text-emerald-700 font-normal">({v.meaning})</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Sentences list preview */}
                                <div className="mb-3 text-[11px] text-slate-700 bg-[#e2f4e8]/60 p-2 rounded-xl border border-[#86c898]/40">
                                  <span className="font-bold text-emerald-950 block text-[10px]">Mẫu câu trọng tâm:</span>
                                  {u.sentences.slice(0, 1).map(s => (
                                    <p key={s.id} className="truncate">
                                      • <strong className="text-emerald-900">{s.example}</strong> - <span className="text-emerald-800">{s.exampleVi}</span>
                                    </p>
                                  ))}
                                </div>
                              </>
                            )}

                            {/* Select CTA */}
                            <button
                              onClick={() => {
                                handleGradeChange(bookmapExplorerGrade);
                                const ok = handleUnitChange(u.unitKey);
                                if (!ok) return;
                                setActiveModal(null);
                              }}
                              className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isCurrentlyStudying
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-[#e0f4e7] hover:bg-[#cfeedb] text-emerald-950 border border-[#86c898]'
                              }`}
                            >
                              <span>{isCurrentlyStudying ? '✓ Đang học bài này' : '🌱 Chọn học Unit này'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#86c898]/40 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-emerald-800 font-medium">
                  ECO-VOICE · Global Success Curriculum Book map 2026
                </span>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-1.5 bg-gradient-to-r from-[#0c4326] to-[#15803d] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:opacity-90"
                >
                  Đóng
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL: HELP / USER GUIDE */}
      {/* MODAL: HELP / USER GUIDE (ENLARGED & OPTIMIZED FOR CLASSROOM/PRESENTATION) */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-[#f2faf5] rounded-3xl max-w-4xl w-full p-6 sm:p-8 md:p-10 shadow-2xl relative border-[3.5px] border-[#86c898] max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => {
                playSoundEffect('click');
                setActiveModal(null);
              }}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer transition-colors"
              title="Đóng"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 sm:gap-4 mb-6 sm:mb-8 pr-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#0c4326] via-[#15803d] to-[#1cb75e] text-white flex items-center justify-center shadow-md shrink-0 border-2 border-emerald-300">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 font-display tracking-tight">
                  User Guide <span className="text-emerald-700 font-extrabold text-lg sm:text-xl md:text-2xl">/ Hướng dẫn sử dụng ECO-VOICE</span>
                </h3>
                <span className="text-xs sm:text-sm md:text-base text-emerald-700 font-bold mt-1">
                  4 simple steps to master English and grow green trees! / 4 bước đơn giản để chinh phục tiếng Anh và vun trồng cây xanh
                </span>
              </div>
            </div>

            {/* 4 Steps Guide (Enlarged cards, generous spacing & high readability) */}
            <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8 text-emerald-950">
              {/* Bước 1 */}
              <div className="p-4 sm:p-5 md:p-6 bg-white/95 rounded-2xl sm:rounded-3xl border-2 border-emerald-200/90 shadow-xs flex items-start gap-3.5 sm:gap-5 hover:border-emerald-400 transition-colors">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-sm sm:text-base md:text-lg flex items-center justify-center shrink-0 border-2 border-emerald-300 shadow-2xs">
                  1
                </div>
                <div className="flex flex-col leading-snug">
                  <span className="font-extrabold text-emerald-950 text-base sm:text-lg md:text-xl font-display">
                    Step 1: Select Lesson or Assignment <span className="text-emerald-800 font-bold text-sm sm:text-base md:text-lg">/ Bước 1: Chọn bài học hoặc Nhận nhiệm vụ</span>
                  </span>
                  <span className="text-emerald-900 mt-1.5 leading-relaxed text-sm sm:text-base md:text-[17px] font-medium">
                    Vào mục <strong>Lessons</strong> để tự do chọn Khối/Unit muốn học, hoặc kiểm tra mục <strong>Assignments</strong> để hoàn thành các nhiệm vụ học tập do giáo viên giao.
                  </span>
                </div>
              </div>

              {/* Bước 2 */}
              <div className="p-4 sm:p-5 md:p-6 bg-white/95 rounded-2xl sm:rounded-3xl border-2 border-teal-200/90 shadow-xs flex items-start gap-3.5 sm:gap-5 hover:border-teal-400 transition-colors">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-teal-100 text-teal-900 font-black text-sm sm:text-base md:text-lg flex items-center justify-center shrink-0 border-2 border-teal-300 shadow-2xs">
                  2
                </div>
                <div className="flex flex-col leading-snug">
                  <span className="font-extrabold text-teal-950 text-base sm:text-lg md:text-xl font-display">
                    Step 2: Listen <span className="text-teal-800 font-bold text-sm sm:text-base md:text-lg">/ Bước 2: Luyện nghe</span>
                  </span>
                  <span className="text-emerald-900 mt-1.5 leading-relaxed text-sm sm:text-base md:text-[17px] font-medium">
                    Bấm nút <strong>Listen</strong> để nghe phát âm chuẩn (US/UK) hoặc chọn <strong>Listen Slowly</strong> để nghe chậm từng âm tiết.
                  </span>
                </div>
              </div>

              {/* Bước 3 */}
              <div className="p-4 sm:p-5 md:p-6 bg-white/95 rounded-2xl sm:rounded-3xl border-2 border-amber-200/90 shadow-xs flex items-start gap-3.5 sm:gap-5 hover:border-amber-400 transition-colors">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-100 text-amber-950 font-black text-sm sm:text-base md:text-lg flex items-center justify-center shrink-0 border-2 border-amber-300 shadow-2xs">
                  3
                </div>
                <div className="flex flex-col leading-snug">
                  <span className="font-extrabold text-amber-950 text-base sm:text-lg md:text-xl font-display">
                    Step 3: Speak Practice <span className="text-amber-800 font-bold text-sm sm:text-base md:text-lg">/ Bước 3: Luyện nói AI</span>
                  </span>
                  <span className="text-emerald-900 mt-1.5 leading-relaxed text-sm sm:text-base md:text-[17px] font-medium">
                    Bấm nút <strong>Speak</strong>, đọc to từ hoặc câu tiếng Anh để công nghệ AI chấm điểm độ chuẩn xác qua Web Speech.
                  </span>
                </div>
              </div>

              {/* Bước 4 */}
              <div className="p-4 sm:p-5 md:p-6 bg-white/95 rounded-2xl sm:rounded-3xl border-2 border-green-200/90 shadow-xs flex items-start gap-3.5 sm:gap-5 hover:border-green-400 transition-colors">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-green-100 text-green-950 font-black text-sm sm:text-base md:text-lg flex items-center justify-center shrink-0 border-2 border-green-300 shadow-2xs">
                  4
                </div>
                <div className="flex flex-col leading-snug">
                  <span className="font-extrabold text-green-950 text-base sm:text-lg md:text-xl font-display">
                    Step 4: Play Eco-Games & Grow Green <span className="text-green-800 font-bold text-sm sm:text-base md:text-lg">/ Bước 4: Chơi Eco-Games & Trồng cây</span>
                  </span>
                  <span className="text-emerald-900 mt-1.5 leading-relaxed text-sm sm:text-base md:text-[17px] font-medium">
                    Tham gia <strong>7 Eco Games</strong> với các mục đích rèn luyện rõ ràng (từ vựng, nghe hiểu, mẫu câu, phản xạ...) để nhận <strong>Eco Points (EP)</strong>, tích lũy điểm thưởng giúp trồng thêm cây xanh cho khu vườn của em!
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button: Đóng popup + Chuyển hướng ngay đến Lessons + Đổi active state trên menu */}
            <button
              onClick={() => {
                playSoundEffect('click');
                setActiveModal(null);

                // Nếu người dùng chưa đăng nhập, tự động kích hoạt Guest Mode để trải nghiệm ngay Lessons mà không bị chặn
                if (!isLoggedIn) {
                  const guestName = 'Khách trải nghiệm / Visitor';
                  sessionStorage.setItem('ecovoice_user_name', guestName);
                  sessionStorage.setItem('ecovoice_is_logged_in', 'true');
                  sessionStorage.setItem('ecovoice_user_role', 'guest');
                  sessionStorage.setItem('ecovoice_is_guest_mode', 'true');
                  sessionStorage.setItem('ecovoice_student_class', 'Trải nghiệm (Demo / Guest)');
                  // Clean up any guest items from localStorage
                  localStorage.removeItem('ecovoice_is_guest_mode');
                  if (localStorage.getItem('ecovoice_user_role') === 'guest') {
                    localStorage.removeItem('ecovoice_user_role');
                    localStorage.removeItem('ecovoice_is_logged_in');
                    localStorage.removeItem('ecovoice_user_name');
                    localStorage.removeItem('ecovoice_student_class');
                  }
                  const guestEP = getGuestGradeEcoPoints(selectedGrade);
                  const guestTrees = getGuestGradeVirtualTrees(selectedGrade);
                  const guestCompleted = getGuestCompletedAssignmentIds();
                  setEcoPoints(guestEP);
                  setVirtualTrees(guestTrees);
                  setGuestCompletedAssignmentIds(guestCompleted);
                  setUserName(guestName);
                  setIsGuestMode(true);
                  setStudentClassInput('Trải nghiệm (Demo / Guest)');
                  setCurrentUserRole('guest');
                  setUserRole('guest');
                  setTeacherUnlocked(false);
                  setIsLoggedIn(true);
                  setLoginPromptNotice(null);
                }

                // Chuyển hướng ngay đến giao diện Lessons và kích hoạt mục menu tương ứng
                setActiveSidebar('lessons');
                setMobileMenuOpen(false);

                const userClass = userRole === 'teacher' ? teacherSelectedClass : studentClassClean;
                const gradeMatch = (userClass || '').match(/[3-5]/);
                const displayGrade = gradeMatch ? gradeMatch[0] : selectedGrade;
                setMascotBubble(`Tổng hợp toàn bộ 20 Unit Khối ${displayGrade} đã sẵn sàng cho bé khám phá! 📚`);
              }}
              className="w-full py-4 sm:py-4.5 bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] hover:from-[#0f5430] hover:to-[#22c55e] active:scale-98 text-white font-black text-base sm:text-lg md:text-xl rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl cursor-pointer transition-all flex items-center justify-center gap-3"
            >
              <span>Start Learning Now / Bắt đầu học ngay</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-200" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL: MICROPHONE PERMISSION & IFRAME NOTICE */}
      {micNoticeModal && micNoticeModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#f2faf5] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative border-[3px] border-[#86c898] text-center">
            <button 
              onClick={() => setMicNoticeModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
              {micNoticeModal.isIframeBlocked ? (
                <ShieldAlert className="w-8 h-8 text-amber-600" />
              ) : (
                <Mic className="w-8 h-8 text-amber-600" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-emerald-950 font-display mb-1.5">
              {micNoticeModal.title}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed mb-4 px-1">
              {micNoticeModal.message}
            </p>

            {/* Helpful Step-by-Step Instruction Card */}
            <div className="bg-white/90 rounded-2xl p-3.5 border border-[#86c898]/70 text-left mb-4 space-y-2 shadow-xs text-xs font-medium text-emerald-950">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5 pb-1 border-b border-emerald-100">
                <span>💡</span>
                <span>Cách khắc phục nhanh nhất:</span>
              </div>
              {micNoticeModal.isIframeBlocked ? (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                    <span>Bấm nút <strong>"Mở trong Tab mới"</strong> bên dưới để truy cập trực tiếp trang web ngoài khung nhúng.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                    <span>Trên tab mới, bấm nút <strong>Speak</strong> rồi chọn <strong>"Cho phép" (Allow)</strong> khi trình duyệt hỏi quyền Micro.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                    <span>Nhìn lên thanh địa chỉ (URL) trên cùng của trình duyệt.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                    <span>Bấm vào biểu tượng <strong>Ổ khóa 🔒</strong> hoặc <strong>Microphone 🎙️</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center shrink-0">3</span>
                    <span>Chuyển quyền Micro sang <strong>"Cho phép" (Allow)</strong> và bấm nút Thử lại bên dưới.</span>
                  </div>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  window.open(window.location.href, '_blank');
                  setMicNoticeModal(null);
                }}
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#0c4326] via-[#15803d] to-[#1cb75e] hover:from-[#0f5430] hover:to-[#22c55e] text-white font-extrabold rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở trong Tab mới</span>
              </button>

              <button
                onClick={() => {
                  setMicNoticeModal(null);
                  setTimeout(() => {
                    handleStartSpeak();
                  }, 300);
                }}
                className="py-2.5 px-4 bg-[#e0f4e7] hover:bg-[#cfeedb] text-emerald-950 font-bold rounded-xl border border-[#86c898] cursor-pointer text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử lại Micro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOCKED UNIT NOTICE FOR STUDENTS */}
      {lockedUnitNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#f2faf5] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border-[3.5px] border-amber-300 text-center animate-scaleUp">
            <button
              onClick={() => {
                playSoundEffect('click');
                setLockedUnitNoticeModal(null);
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
              {lockedUnitNoticeModal.unitNumber ? `Unit ${lockedUnitNoticeModal.unitNumber}: ` : ''}{lockedUnitNoticeModal.unitName}
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
                <span>Quy tắc mở khóa tuần tự · Sequential Unlocking</span>
              </p>
              <p className="text-emerald-900 pl-5">
                Để tránh học nhảy cóc, bé cần hoàn thành 100% từ vựng và bài tập của Unit trước đó để mở khóa bài học này. Hãy hoàn thành Unit trước nhé! 🌱
              </p>
            </div>

            {/* Got it CTA */}
            <button
              onClick={() => {
                playSoundEffect('click');
                setLockedUnitNoticeModal(null);
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
}
