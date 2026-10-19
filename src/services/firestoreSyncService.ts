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
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from './firebase';
import { 
  DEFAULT_STUDENTS, 
  DEFAULT_ASSIGNMENTS, 
  DEFAULT_CLASSES, 
  StudentAccount, 
  TeacherAssignment, 
  TeacherClass,
  CustomVisual
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

/**
 * 9. Sync Google Auth User to Firestore Profile
 */
export async function syncGoogleUserToFirestore(firebaseUser: any): Promise<{
  role: 'student' | 'teacher';
  name: string;
  email: string;
  className: string;
  grade: string;
  ecoPoints: number;
  trees: number;
}> {
  const email = (firebaseUser.email || '').toLowerCase();
  const isTeacher = email === 'lttdiem2806@gmail.com' || email.includes('teacher') || email.includes('admin');
  const role: 'student' | 'teacher' = isTeacher ? 'teacher' : 'student';
  const name = firebaseUser.displayName || (isTeacher ? 'Cô Lê Hương' : 'Học sinh');
  const userRef = doc(db, USERS_COL, firebaseUser.uid);

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        role: data.role || role,
        name: data.name || name,
        email: data.email || email,
        className: data.className || (role === 'teacher' ? '5A3' : '4A3'),
        grade: data.grade || '4',
        ecoPoints: data.ecoPoints || 0,
        trees: data.trees || 0
      };
    } else {
      const newProfile = {
        id: firebaseUser.uid,
        name,
        email,
        role,
        className: role === 'teacher' ? '5A3' : '4A3',
        grade: '4',
        ecoPoints: role === 'teacher' ? 999 : 0,
        trees: role === 'teacher' ? 30 : 0,
        score: 100,
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
    console.warn('Error syncing Google user to Firestore:', error);
    return {
      role,
      name,
      email,
      className: role === 'teacher' ? '5A3' : '4A3',
      grade: '4',
      ecoPoints: role === 'teacher' ? 999 : 0,
      trees: role === 'teacher' ? 30 : 0
    };
  }
}
