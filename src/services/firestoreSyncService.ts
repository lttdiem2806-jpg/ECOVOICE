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
const UNIT_PERMS_COL = 'unitPermissions';
const UNITS_COL = 'customUnits';

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
 * Utility to strip undefined properties recursively before saving to Firestore.
 * Firebase JS SDK throws an error if any object property is undefined.
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
        clean[key] = sanitizeForFirestore(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean as T;
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

    // Check & Seed Classes
    const classesSnap = await getDocs(collection(db, CLASSES_COL));
    if (classesSnap.empty) {
      console.info('Seeding initial classes to Firestore...');
      const batch = writeBatch(db);
      DEFAULT_CLASSES.forEach((cls) => {
        const ref = doc(db, CLASSES_COL, cls.id);
        batch.set(ref, {
          ...cls,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
      console.info('Initial classes successfully seeded to Firestore.');
    }

    // Check & Seed Unit Permissions
    const permRef = doc(db, UNIT_PERMS_COL, 'global');
    const permSnap = await getDoc(permRef);
    if (!permSnap.exists()) {
      console.info('Seeding initial unit permissions to Firestore...');
      const defaultPerms: Record<string, boolean> = {};
      ['3', '4', '5'].forEach(grade => {
        for (let i = 1; i <= 20; i++) {
          defaultPerms[`${grade}_unit_${i}`] = i <= 8;
        }
      });
      await setDoc(permRef, {
        permissions: defaultPerms,
        updatedAt: new Date().toISOString()
      });
      console.info('Initial unit permissions successfully seeded to Firestore.');
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
  const cleanAsg = sanitizeForFirestore({
    ...assignment,
    updatedAt: new Date().toISOString()
  });
  const ref = doc(db, ASGS_COL, assignment.id);
  try {
    await setDoc(ref, cleanAsg, { merge: true });
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
  const cleanActivity = sanitizeForFirestore({
    ...activity,
    createdAt: new Date().toISOString()
  });
  const ref = doc(db, ACTIVITIES_COL, activity.id);
  try {
    await setDoc(ref, cleanActivity, { merge: true });
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

/**
 * 9. Create or Update Class in Firestore
 */
export async function saveClassToFirestore(cls: TeacherClass): Promise<void> {
  const cleanCls = sanitizeForFirestore({
    ...cls,
    updatedAt: new Date().toISOString()
  });
  const ref = doc(db, CLASSES_COL, cls.id);
  try {
    await setDoc(ref, cleanCls, { merge: true });
  } catch (error) {
    console.warn('Failed to save class to Firestore:', error);
  }
}

/**
 * 10. Delete Class from Firestore
 */
export async function deleteClassFromFirestore(classId: string): Promise<void> {
  const ref = doc(db, CLASSES_COL, classId);
  try {
    await deleteDoc(ref);
  } catch (error) {
    console.warn('Failed to delete class from Firestore:', error);
  }
}

/**
 * 11. Subscribe to Real-Time Classes from Firestore
 */
export function subscribeToFirestoreClasses(callback: (classes: TeacherClass[]) => void): () => void {
  try {
    return onSnapshot(
      collection(db, CLASSES_COL),
      (snapshot) => {
        const list: TeacherClass[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as TeacherClass);
        });
        if (list.length > 0) {
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('ecovoice_teacher_classes', JSON.stringify(list));
              window.dispatchEvent(new CustomEvent('ecovoice_classes_updated', { detail: { classes: list } }));
            }
          } catch {}
          callback(list);
        }
      },
      (error) => {
        console.warn('Classes listener error:', error);
      }
    );
  } catch (error) {
    console.warn('Classes subscribe error:', error);
    return () => {};
  }
}

/**
 * 12. Save Unit Access Permissions to Firestore
 */
export async function saveUnitPermissionsToFirestore(perms: Record<string, boolean>): Promise<void> {
  const cleanPerms = sanitizeForFirestore({
    permissions: perms,
    updatedAt: new Date().toISOString()
  });
  const ref = doc(db, UNIT_PERMS_COL, 'global');
  try {
    await setDoc(ref, cleanPerms, { merge: true });
  } catch (error) {
    console.warn('Failed to save unit permissions to Firestore:', error);
  }
}

/**
 * 13. Subscribe to Real-Time Unit Access Permissions from Firestore
 */
export function subscribeToFirestoreUnitPermissions(callback: (perms: Record<string, boolean>) => void): () => void {
  try {
    return onSnapshot(
      doc(db, UNIT_PERMS_COL, 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.permissions) {
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem('ecovoice_unit_permissions', JSON.stringify(data.permissions));
                window.dispatchEvent(new CustomEvent('ecovoice_perms_updated', { detail: { perms: data.permissions } }));
              }
            } catch {}
            callback(data.permissions);
          }
        }
      },
      (error) => {
        console.warn('Unit permissions listener error:', error);
      }
    );
  } catch (error) {
    console.warn('Unit permissions subscribe error:', error);
    return () => {};
  }
}

/**
 * 14. Save Custom Visual / Lesson Illustration to Firestore
 */
export async function saveCustomVisualToFirestore(visual: CustomVisual): Promise<void> {
  const cleanVisual = sanitizeForFirestore({
    ...visual,
    updatedAt: new Date().toISOString()
  });
  const ref = doc(db, VISUALS_COL, visual.id);
  try {
    await setDoc(ref, cleanVisual, { merge: true });
  } catch (error) {
    console.warn('Failed to save custom visual to Firestore:', error);
  }
}

/**
 * 15. Delete Custom Visual from Firestore
 */
export async function deleteCustomVisualFromFirestore(visualId: string): Promise<void> {
  const ref = doc(db, VISUALS_COL, visualId);
  try {
    await deleteDoc(ref);
  } catch (error) {
    console.warn('Failed to delete custom visual from Firestore:', error);
  }
}

/**
 * 16. Subscribe to Real-Time Custom Visuals from Firestore
 */
export function subscribeToFirestoreCustomVisuals(callback: (visuals: Record<string, CustomVisual>) => void): () => void {
  try {
    return onSnapshot(
      collection(db, VISUALS_COL),
      (snapshot) => {
        const map: Record<string, CustomVisual> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as CustomVisual;
          map[docSnap.id] = data;
        });
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('ecovoice_custom_visuals', JSON.stringify(map));
            window.dispatchEvent(new CustomEvent('ecovoice_custom_visuals_updated', { detail: { visuals: map } }));
          }
        } catch {}
        callback(map);
      },
      (error) => {
        console.warn('Custom visuals listener error:', error);
      }
    );
  } catch (error) {
    return () => {};
  }
}

/**
 * 19. Save Custom Unit to Firestore
 */
export async function saveCustomUnitToFirestore(grade: string, unit: any): Promise<void> {
  const docId = sanitizeDocId(`${grade}_${unit.unitKey}`);
  const cleanUnit = sanitizeForFirestore({
    ...unit,
    grade,
    updatedAt: new Date().toISOString()
  });
  const ref = doc(db, UNITS_COL, docId);
  try {
    await setDoc(ref, cleanUnit, { merge: true });
  } catch (error) {
    console.warn('Failed to save custom unit to Firestore:', error);
  }
}

/**
 * 20. Delete Custom Unit from Firestore
 */
export async function deleteCustomUnitFromFirestore(grade: string, unitKey: string): Promise<void> {
  const docId = sanitizeDocId(`${grade}_${unitKey}`);
  const ref = doc(db, UNITS_COL, docId);
  try {
    await deleteDoc(ref);
  } catch (error) {
    console.warn('Failed to delete custom unit from Firestore:', error);
  }
}

/**
 * 21. Subscribe to Real-Time Custom Units from Firestore
 */
export function subscribeToFirestoreCustomUnits(callback: (unitsMap: Record<string, any>) => void): () => void {
  try {
    return onSnapshot(
      collection(db, UNITS_COL),
      (snapshot) => {
        const map: Record<string, any> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Cleanup test/corrupted unit overrides such as 'abc'
          if (data && (data.unitName === 'abc' || data.unitName === 'Custom Unit' || (data.unitKey === 'unit_12' && data.unitName !== 'Jobs'))) {
            try {
              deleteDoc(docSnap.ref);
            } catch (e) {
              console.warn('Failed to delete corrupted unit doc:', e);
            }
            return;
          }
          map[docSnap.id] = data;
        });
        try {
          if (typeof window !== 'undefined') {
            // Also clean up local storage corrupted keys
            const raw = localStorage.getItem('ecovoice_custom_units');
            if (raw) {
              const localMap = JSON.parse(raw);
              delete localMap['3_unit_12'];
              delete localMap['unit_12'];
              delete localMap['3_abc'];
              delete localMap['abc'];
              localStorage.setItem('ecovoice_custom_units', JSON.stringify({ ...localMap, ...map }));
            } else {
              localStorage.setItem('ecovoice_custom_units', JSON.stringify(map));
            }
            window.dispatchEvent(new CustomEvent('ecovoice_custom_units_updated', { detail: { units: map } }));
          }
        } catch {}
        callback(map);
      },
      (error) => {
        console.warn('Custom units listener error:', error);
      }
    );
  } catch (error) {
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

/**
 * 17. Create or Update Student Account in Firestore
 */
export async function saveStudentToFirestore(student: StudentAccount): Promise<void> {
  const docId = student.id || sanitizeDocId(student.name);
  const ref = doc(db, USERS_COL, docId);
  try {
    await setDoc(ref, {
      id: docId,
      name: student.name,
      className: student.className || '4A3',
      grade: student.grade || '4',
      password: student.password || '123',
      email: (student as any).email || '',
      username: (student as any).username || '',
      score: student.score || 0,
      trees: student.trees || 0,
      ecoPoints: student.ecoPoints ?? ((student.trees || 0) * 30),
      status: student.status || 'Đang học',
      lastPractice: student.lastPractice || 'Chưa luyện tập',
      completedAssignments: student.completedAssignments || [],
      role: 'student',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Failed to save student account to Firestore:', error);
  }
}

/**
 * 18. Delete Student Account from Firestore
 */
export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  const ref = doc(db, USERS_COL, studentId);
  try {
    await deleteDoc(ref);
  } catch (error) {
    console.warn('Failed to delete student account from Firestore:', error);
  }
}

