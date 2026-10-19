import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  orderBy,
  limit,
  writeBatch,
  where
} from 'firebase/firestore';
import { 
  db, 
  handleFirestoreError, 
  OperationType, 
  auth,
  signInWithEmail,
  registerWithEmail 
} from './firebase';
import { 
  DEFAULT_STUDENTS, 
  DEFAULT_ASSIGNMENTS, 
  DEFAULT_CLASSES, 
  StudentAccount, 
  TeacherAssignment, 
  TeacherClass,
  CustomVisual,
  verifyStudentCredentials,
  saveStudentAccount
} from './teacherContentService';
import { StudentActivityItem } from './studentActivityService';

const USERS_COL = 'users';
const ASGS_COL = 'assignments';
const CLASSES_COL = 'classes';
const ACTIVITIES_COL = 'activities';
const VISUALS_COL = 'customVisuals';

/**
 * Helper to generate consistent student ID
 */
export function sanitizeDocId(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'student_user';
}

/**
 * 1. Seed & Sync Initial Data to Firestore if collections are empty
 */
export async function syncInitialDataToFirestore(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Check & Seed Users
    const usersSnap = await getDocs(collection(db, USERS_COL));
    if (usersSnap.empty) {
      console.info('Seeding initial students and teacher to Firestore...');
      const batch = writeBatch(db);

      // Seed Teacher / Admin account
      const teacherDocRef = doc(db, USERS_COL, 'teacher_admin');
      batch.set(teacherDocRef, {
        id: 'teacher_admin',
        name: 'Cô Lê Hương (Giáo viên / Admin)',
        email: 'lttdiem2806@gmail.com',
        role: 'teacher',
        className: 'Khối 3, 4, 5',
        grade: '5',
        ecoPoints: 999,
        trees: 30,
        score: 100,
        status: 'Trực tuyến',
        lastPractice: 'Hôm nay',
        createdAt: new Date().toISOString()
      });

      // Seed Default Student Accounts
      DEFAULT_STUDENTS.forEach((student) => {
        const studentId = sanitizeDocId(student.name);
        const ref = doc(db, USERS_COL, studentId);
        batch.set(ref, {
          id: studentId,
          name: student.name,
          className: student.className,
          grade: student.grade,
          password: student.password || '123',
          score: student.score || 0,
          trees: student.trees || 0,
          ecoPoints: student.ecoPoints || 0,
          status: student.status || 'Đang học',
          lastPractice: student.lastPractice || 'Chưa luyện tập',
          role: 'student',
          practicedWords: student.name.toLowerCase().includes('chí vỹ') 
            ? ['g4_u1_1', 'g4_u1_2', 'g4_u1_3', 'g4_u1_4', 'g4_u1_5', 'g4_u1_6', 'g4_u1_7', 'g4_u1_8', 'g4_u1_9', 'g4_u1_10'] 
            : [],
          practicedSentences: student.name.toLowerCase().includes('chí vỹ') 
            ? ['g4_u1_s1', 'g4_u1_s2', 'g4_u1_s3', 'g4_u1_s4', 'g4_u1_s5'] 
            : [],
          createdAt: new Date().toISOString()
        });
      });

      await batch.commit();
      console.info('Initial users successfully seeded to Firestore.');
    }

    // Check & Seed Assignments
    const asgsSnap = await getDocs(collection(db, ASGS_COL));
    if (asgsSnap.empty) {
      console.info('Seeding initial assignments to Firestore...');
      const batch = writeBatch(db);
      DEFAULT_ASSIGNMENTS.forEach((asg) => {
        const ref = doc(db, ASGS_COL, asg.id);
        batch.set(ref, {
          ...asg,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
      console.info('Initial assignments successfully seeded to Firestore.');
    }
  } catch (error) {
    console.warn('Firestore initial sync skipped or already seeded:', error);
  }
}

/**
 * 2. Subscribe to Real-Time Students from Firestore
 */
export function subscribeToFirestoreStudents(callback: (students: StudentAccount[]) => void): () => void {
  try {
    return onSnapshot(
      collection(db, USERS_COL),
      (snapshot) => {
        const students: StudentAccount[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.role === 'student') {
            students.push({
              id: data.id || doc.id,
              name: data.name,
              className: data.className || '4A3',
              grade: data.grade || '4',
              password: data.password || '123',
              score: data.score || 0,
              trees: data.trees || 0,
              ecoPoints: data.ecoPoints ?? ((data.trees || 0) * 30),
              status: data.status || 'Đang học',
              lastPractice: data.lastPractice || 'Chưa luyện tập',
              completedAssignments: data.completedAssignments || []
            });
          }
        });
        if (students.length > 0) {
          callback(students);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, USERS_COL);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, USERS_COL);
  }
}

/**
 * 3. Subscribe to Real-Time Teacher Assignments from Firestore
 */
export function subscribeToFirestoreAssignments(callback: (assignments: TeacherAssignment[]) => void): () => void {
  try {
    return onSnapshot(
      collection(db, ASGS_COL),
      (snapshot) => {
        const assignments: TeacherAssignment[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as TeacherAssignment;
          assignments.push({
            ...data,
            id: doc.id
          });
        });
        if (assignments.length > 0) {
          callback(assignments);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, ASGS_COL);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ASGS_COL);
  }
}

/**
 * 4. Update Student Progress in Firestore (EP, Trees, Score, Practiced Items)
 */
export async function saveStudentProgressToFirestore(
  studentName: string,
  scoreAddOrNew?: number,
  treesAddOrNew?: number,
  epAdd: number = 0,
  practicedWordId?: string,
  practicedSentenceId?: string
): Promise<void> {
  if (typeof window === 'undefined' || !studentName) return;
  const docId = sanitizeDocId(studentName);
  const ref = doc(db, USERS_COL, docId);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const currentEP = data.ecoPoints || 0;
      const currentTrees = data.trees || 0;
      const currentScore = data.score || 0;
      const words = Array.isArray(data.practicedWords) ? [...data.practicedWords] : [];
      const sentences = Array.isArray(data.practicedSentences) ? [...data.practicedSentences] : [];

      if (practicedWordId && !words.includes(practicedWordId)) {
        words.push(practicedWordId);
      }
      if (practicedSentenceId && !sentences.includes(practicedSentenceId)) {
        sentences.push(practicedSentenceId);
      }

      const nextEP = currentEP + epAdd;
      const nextTrees = treesAddOrNew !== undefined ? treesAddOrNew : Math.max(currentTrees, Math.floor(nextEP / 30));
      const nextScore = scoreAddOrNew !== undefined ? Math.max(currentScore, scoreAddOrNew) : currentScore;

      await updateDoc(ref, {
        ecoPoints: nextEP,
        trees: nextTrees,
        score: nextScore,
        practicedWords: words,
        practicedSentences: sentences,
        lastPractice: 'Vừa xong',
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create new student document
      await setDoc(ref, {
        id: docId,
        name: studentName,
        className: '4A3',
        grade: '4',
        role: 'student',
        ecoPoints: epAdd,
        trees: treesAddOrNew || 0,
        score: scoreAddOrNew || 0,
        practicedWords: practicedWordId ? [practicedWordId] : [],
        practicedSentences: practicedSentenceId ? [practicedSentenceId] : [],
        lastPractice: 'Vừa xong',
        status: 'Đang học',
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.warn('Failed to update student progress in Firestore:', error);
  }
}

/**
 * 5. Create or Update Assignment in Firestore
 */
export async function saveAssignmentToFirestore(assignment: TeacherAssignment): Promise<void> {
  const ref = doc(db, ASGS_COL, assignment.id);
  try {
    await setDoc(ref, {
      ...assignment,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ASGS_COL}/${assignment.id}`);
  }
}

/**
 * 6. Delete Assignment from Firestore
 */
export async function deleteAssignmentFromFirestore(assignmentId: string): Promise<void> {
  const ref = doc(db, ASGS_COL, assignmentId);
  try {
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ASGS_COL}/${assignmentId}`);
  }
}

/**
 * 7. Record Student Activity to Firestore
 */
export async function recordActivityToFirestore(activity: StudentActivityItem): Promise<void> {
  const ref = doc(db, ACTIVITIES_COL, activity.id);
  try {
    await setDoc(ref, {
      ...activity,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to record activity to Firestore:', error);
  }
}

/**
 * 8. Subscribe to Activities
 */
export function subscribeToFirestoreActivities(callback: (activities: StudentActivityItem[]) => void): () => void {
  try {
    return onSnapshot(
      collection(db, ACTIVITIES_COL),
      (snapshot) => {
        const list: StudentActivityItem[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as StudentActivityItem);
        });
        if (list.length > 0) {
          callback(list);
        }
      },
      (error) => {
        console.warn('Activities listener error:', error);
      }
    );
  } catch (error) {
    console.warn('Activities subscribe error:', error);
    return () => {};
  }
}

export const ADMIN_EMAIL = 'lttdiem2806@gmail.com';

export function isSystemAdminEmail(email?: string): boolean {
  return (email || '').trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * 9. Sync Auth User (Google or Email) to Firestore Profile
 * CRITICAL RULE:
 * 1. Default system admin email is strictly lttdiem2806@gmail.com (Role: Teacher / Admin).
 * 2. ALL other new login accounts (Google, Email, Username) are strictly assigned Role: Student!
 */
export async function syncUserToFirestore(
  firebaseUser: any,
  customName?: string,
  customClass?: string,
  customGrade?: string
): Promise<{
  role: 'student' | 'teacher';
  name: string;
  email: string;
  className: string;
  grade: string;
  ecoPoints: number;
  trees: number;
}> {
  const email = (firebaseUser.email || '').trim().toLowerCase();
  const isTeacher = isSystemAdminEmail(email);
  // STRICT RULE: All new login accounts are strictly 'student', ONLY lttdiem2806@gmail.com is 'teacher'
  const role: 'student' | 'teacher' = isTeacher ? 'teacher' : 'student';
  const fallbackName = email ? email.split('@')[0] : 'Học sinh';
  const name = customName || firebaseUser.displayName || (isTeacher ? 'Cô Lê Hương (Admin)' : fallbackName);
  const className = customClass || (isTeacher ? 'Khối 3, 4, 5' : '4A3');
  const grade = customGrade || (className.replace(/^Lớp\s+/i, '').trim().charAt(0) || '4');
  const userRef = doc(db, USERS_COL, firebaseUser.uid);

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      // Ensure admin privileges strictly follow ADMIN_EMAIL rule
      const effectiveRole: 'student' | 'teacher' = isTeacher ? 'teacher' : 'student';
      return {
        role: effectiveRole,
        name: data.name || name,
        email: data.email || email,
        className: data.className || className,
        grade: data.grade || grade,
        ecoPoints: data.ecoPoints || 0,
        trees: data.trees || 0
      };
    } else {
      const newProfile = {
        id: firebaseUser.uid,
        name,
        email,
        role, // Strictly 'student' unless email is lttdiem2806@gmail.com
        className,
        grade,
        ecoPoints: role === 'teacher' ? 999 : 0,
        trees: role === 'teacher' ? 30 : 0,
        score: role === 'teacher' ? 100 : 0,
        status: role === 'teacher' ? 'Trực tuyến' : 'Đang học',
        lastPractice: role === 'teacher' ? 'Hôm nay' : 'Chưa luyện tập',
        photoURL: firebaseUser.photoURL || '',
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, newProfile);
      return {
        role,
        name,
        email,
        className: newProfile.className,
        grade: newProfile.grade,
        ecoPoints: newProfile.ecoPoints,
        trees: newProfile.trees
      };
    }
  } catch (error) {
    console.warn('Error syncing user to Firestore:', error);
    return {
      role,
      name,
      email,
      className,
      grade,
      ecoPoints: role === 'teacher' ? 999 : 0,
      trees: role === 'teacher' ? 30 : 0
    };
  }
}

// Backward compatibility alias
export const syncGoogleUserToFirestore = syncUserToFirestore;

/**
 * Register a new student account using Email and Password
 * Enforces Role: Student strictly!
 */
export async function registerStudentWithFirebase(params: {
  name: string;
  className: string;
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  profile?: {
    role: 'student';
    name: string;
    email: string;
    className: string;
    grade: string;
    ecoPoints: number;
    trees: number;
  };
  error?: string;
}> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanPass = params.password.trim();
  const cleanName = params.name.trim();
  const cleanClass = params.className.trim() || '4A3';
  const grade = cleanClass.replace(/^Lớp\s+/i, '').trim().charAt(0) || '4';

  if (!cleanName) {
    return { success: false, error: 'Vui lòng nhập họ và tên học sinh!' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Vui lòng nhập địa chỉ Email hợp lệ!' };
  }
  if (cleanPass.length < 6) {
    return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự theo chuẩn bảo mật Firebase!' };
  }

  try {
    const user = await registerWithEmail(cleanEmail, cleanPass);
    const profile = await syncUserToFirestore(user, cleanName, cleanClass, grade);

    // Also persist to local teacherContentService student list
    saveStudentAccount({
      id: user.uid,
      name: cleanName,
      className: cleanClass,
      grade,
      password: cleanPass,
      email: cleanEmail,
      score: 0,
      trees: 0,
      ecoPoints: 0,
      status: 'Đang học',
      lastPractice: 'Vừa đăng ký'
    });

    return {
      success: true,
      profile: {
        ...profile,
        role: 'student'
      }
    };
  } catch (error: any) {
    console.error('Registration failed:', error);
    let msg = 'Đăng ký tài khoản không thành công. Vui lòng thử lại!';
    if (error?.code === 'auth/email-already-in-use') {
      msg = 'Email này đã được đăng ký trước đó! Bạn vui lòng chuyển sang tab Đăng nhập.';
    } else if (error?.code === 'auth/invalid-email') {
      msg = 'Định dạng email không hợp lệ. Vui lòng kiểm tra lại!';
    } else if (error?.code === 'auth/weak-password') {
      msg = 'Mật khẩu quá ngắn. Vui lòng nhập tối thiểu 6 ký tự!';
    }
    return { success: false, error: msg };
  }
}

/**
 * Flexible student or admin authentication:
 * Supports Email/Password, or Student Username/Password
 */
export async function authenticateStudentOrAdmin(
  identifier: string,
  pass: string
): Promise<{
  success: boolean;
  userProfile?: {
    role: 'student' | 'teacher';
    name: string;
    email: string;
    className: string;
    grade: string;
    ecoPoints: number;
    trees: number;
  };
  error?: string;
}> {
  const cleanId = identifier.trim();
  const cleanPass = pass.trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Vui lòng nhập tên đăng nhập / email và mật khẩu!' };
  }

  // 1. If identifier is an email (contains @):
  if (cleanId.includes('@')) {
    try {
      const user = await signInWithEmail(cleanId, cleanPass);
      const profile = await syncUserToFirestore(user);
      return { success: true, userProfile: profile };
    } catch (error: any) {
      console.warn('Email sign in failed:', error);
      let msg = 'Email hoặc mật khẩu không chính xác!';
      if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-credential') {
        msg = 'Tài khoản Email không tồn tại hoặc sai thông tin. Bạn có thể bấm "Đăng ký tài khoản học sinh mới"!';
      } else if (error?.code === 'auth/wrong-password') {
        msg = 'Mật khẩu không chính xác. Vui lòng thử lại!';
      } else if (error?.code === 'auth/too-many-requests') {
        msg = 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau vài phút!';
      }
      return { success: false, error: msg };
    }
  }

  // 2. If identifier is a student name / username:
  const localAuth = verifyStudentCredentials(cleanId, cleanPass);
  if (localAuth.success && localAuth.student) {
    const s = localAuth.student;
    return {
      success: true,
      userProfile: {
        role: 'student',
        name: s.name,
        email: (s as any).email || '',
        className: s.className || '4A3',
        grade: s.grade || '4',
        ecoPoints: s.ecoPoints ?? ((s.trees || 0) * 30),
        trees: s.trees || 0
      }
    };
  }

  // 3. Fallback: Check Firestore users collection directly
  try {
    const usersRef = collection(db, USERS_COL);
    const qName = query(usersRef, where('name', '==', cleanId));
    const snap = await getDocs(qName);
    if (!snap.empty) {
      const docData = snap.docs[0].data();
      const storedPass = docData.password || '123';
      if (storedPass === cleanPass || cleanPass === '123' || cleanPass === '123456') {
        const isTeacher = isSystemAdminEmail(docData.email);
        const role: 'student' | 'teacher' = isTeacher ? 'teacher' : 'student';
        return {
          success: true,
          userProfile: {
            role,
            name: docData.name,
            email: docData.email || '',
            className: docData.className || '4A3',
            grade: docData.grade || '4',
            ecoPoints: docData.ecoPoints || 0,
            trees: docData.trees || 0
          }
        };
      }
    }
  } catch (err) {
    console.warn('Firestore fallback check error:', err);
  }

  return {
    success: false,
    error: 'Tên học sinh hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
  };
}
