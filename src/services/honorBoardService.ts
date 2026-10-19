import * as XLSX from 'xlsx';
import { StudentAccount, getStudentAccounts, getTeacherClasses } from './teacherContentService';

export interface HonorStudent {
  id: string;
  rank: number;
  name: string;
  className: string;
  grade: string;
  score: number;
  trees: number;
  ecoPoints: number;
  titleBadge: string;
  avatar: string;
  lastPractice: string;
}

const AVATAR_LIST = ['👧', '👦', '🧒', '👧🏻', '👦🏻', '🧒🏻', '👧🏽', '👦🏽', '🧑‍🎓', '👧🏼', '👦🏼'];

export function getStudentAvatar(name: string): string {
  if (!name) return '👧';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }
  return AVATAR_LIST[Math.abs(hash) % AVATAR_LIST.length];
}

export function getHonorBadge(rank: number, ecoPoints: number = 0, trees: number = 0): string {
  if (ecoPoints === 0 && trees === 0) {
    return '🌱 Chưa có điểm tích luỹ';
  }
  switch (rank) {
    case 1:
      return '🏆 Quán quân Xanh';
    case 2:
      return '🥈 Á quân Sinh thái';
    case 3:
      return '🥉 Ngôi sao Phát âm';
    case 4:
    case 5:
      return '⭐ Kiện tướng Eco';
    default:
      if (rank <= 10) return '🌿 Dũng sĩ Rừng xanh';
      return '🌱 Mầm non Tích cực';
  }
}

export interface AvailableHonorClass {
  id: string;
  name: string;
  displayName: string;
}

/**
 * Returns the dynamic list of actual classes created in Teacher Dashboard / Admin
 */
export function getAvailableClassesForHonor(): AvailableHonorClass[] {
  const teacherClasses = getTeacherClasses();
  const studentAccounts = getStudentAccounts();

  const classMap = new Map<string, string>(); // lowercase key -> display name

  teacherClasses.forEach(c => {
    if (c.name && c.name.trim()) {
      const cleanName = c.name.replace(/^Lớp\s+/i, '').trim();
      if (cleanName && !classMap.has(cleanName.toLowerCase())) {
        classMap.set(cleanName.toLowerCase(), cleanName);
      }
    }
  });

  studentAccounts.forEach(s => {
    if (s.className && s.className.trim() && !s.className.includes('Guest') && !s.className.includes('Demo')) {
      const cleanName = s.className.replace(/^Lớp\s+/i, '').trim();
      if (cleanName && !classMap.has(cleanName.toLowerCase())) {
        classMap.set(cleanName.toLowerCase(), cleanName);
      }
    }
  });

  // Sort classes naturally: 3A1, 3A2, 4A1, 5A1
  const sorted = Array.from(classMap.entries()).sort((a, b) => a[1].localeCompare(b[1], undefined, { numeric: true }));

  return sorted.map(([id, name]) => ({
    id,
    name,
    displayName: name.startsWith('Lớp') ? name : `Lớp ${name}`
  }));
}

export interface HonorBoardFilterOptions {
  scope: 'all' | string; // 'all', or specific className e.g. '3A1', 'Lớp 3A1', or 'grade_3'
  timeRange: 'week' | 'month';
  currentStudent?: {
    name: string;
    ecoPoints: number;
    trees: number;
    className?: string;
    grade?: string;
  };
}

export function getHonorBoardStudents(options: HonorBoardFilterOptions): HonorStudent[] {
  const { scope, timeRange, currentStudent } = options;
  const accounts = getStudentAccounts();

  // Filter out guests/judges
  const validAccounts = accounts.filter(
    s => s.name && !s.name.includes('Guest') && !s.name.includes('Ban Giám Khảo')
  );

  // If current student exists and is logged in, sync their latest live points
  const mergedAccounts: StudentAccount[] = validAccounts.map(s => {
    if (
      currentStudent &&
      currentStudent.name &&
      s.name.trim().toLowerCase() === currentStudent.name.trim().toLowerCase()
    ) {
      return {
        ...s,
        ecoPoints: currentStudent.ecoPoints !== undefined ? currentStudent.ecoPoints : (s.ecoPoints || 0),
        trees: currentStudent.trees !== undefined ? currentStudent.trees : (s.trees || 0)
      };
    }
    return s;
  });

  if (
    currentStudent &&
    currentStudent.name &&
    (currentStudent.ecoPoints || 0) > 0 &&
    !mergedAccounts.some(s => s.name && s.name.trim().toLowerCase() === currentStudent.name.trim().toLowerCase())
  ) {
    mergedAccounts.push({
      id: 'st_current_session',
      name: currentStudent.name,
      className: currentStudent.className || '3A1',
      grade: currentStudent.grade || currentStudent.className?.charAt(0) || '3',
      password: '',
      status: 'active',
      ecoPoints: currentStudent.ecoPoints || 0,
      trees: currentStudent.trees || 0,
      score: Math.min(100, Math.round((currentStudent.ecoPoints || 0) * 1.5)),
      lastPractice: 'Hôm nay'
    });
  }

  // Filter by scope (all, specific class, or grade legacy fallback)
  const scopedAccounts = mergedAccounts.filter(s => {
    if (!scope || scope === 'all') return true;
    if (scope === 'grade_3') return s.grade === '3' || s.className?.startsWith('3');
    if (scope === 'grade_4') return s.grade === '4' || s.className?.startsWith('4');
    if (scope === 'grade_5') return s.grade === '5' || s.className?.startsWith('5');
    
    // Normalize class names: strip "Lớp " prefix, trim, lowercase
    const target = scope.replace(/^Lớp\s+/i, '').trim().toLowerCase();
    const studentClass = (s.className || '').replace(/^Lớp\s+/i, '').trim().toLowerCase();
    return studentClass === target;
  });

  // Map to HonorStudent with strictly realistic practice tracking
  const honorList = scopedAccounts.map((s, idx) => {
    const rawTrees = s.trees ?? 0;
    const rawScore = s.score ?? 0;
    const rawEP = s.ecoPoints ?? 0;

    // Determine if this student has actually practiced speaking and accumulated points
    const hasPracticed = Boolean(
      (s.lastPractice && s.lastPractice !== 'Chưa luyện tập') &&
      rawEP > 0
    );

    let computedEP = 0;
    let computedTrees = 0;
    let computedScore = 0;

    if (hasPracticed && rawEP > 0) {
      computedEP = rawEP;
      computedTrees = Math.floor(computedEP / 30);
      computedScore = rawScore;

      if (timeRange === 'week') {
        const isRecent = !s.lastPractice || s.lastPractice === 'Hôm nay' || s.lastPractice === 'Hôm qua' || s.lastPractice.includes('ngày trước');
        if (!isRecent) {
          computedEP = 0;
          computedTrees = 0;
        }
      }
    }

    return {
      id: s.id || `st_honor_${idx}`,
      rank: 0, // Assigned after sorting
      name: s.name,
      className: s.className || '3A1',
      grade: s.grade || s.className?.charAt(0) || '3',
      score: computedScore,
      trees: computedTrees,
      ecoPoints: computedEP,
      titleBadge: '',
      avatar: getStudentAvatar(s.name),
      lastPractice: hasPracticed ? (s.lastPractice || 'Hôm nay') : 'Chưa luyện tập'
    };
  });

  // REQUIREMENT 1:
  // - Chỉ hiển thị học sinh có điểm tích lũy EP > 0 trên Bảng vinh danh và Bảng xếp hạng đầy đủ.
  // - Nếu học sinh có 0 EP (chưa luyện tập), tuyệt đối KHÔNG đưa tên vào danh sách xếp hạng.
  const qualifiedStudents = honorList.filter(s => (s.ecoPoints ?? 0) > 0);

  // Sort descending: by ecoPoints first, then trees, then score
  qualifiedStudents.sort((a, b) => {
    if (b.ecoPoints !== a.ecoPoints) return b.ecoPoints - a.ecoPoints;
    if (b.trees !== a.trees) return b.trees - a.trees;
    return b.score - a.score;
  });

  // Assign ranks & badges (only to qualified students with EP > 0)
  return qualifiedStudents.map((item, index) => {
    const rank = index + 1;
    return {
      ...item,
      rank,
      titleBadge: getHonorBadge(rank, item.ecoPoints, item.trees)
    };
  });
}

export function exportHonorBoardToExcel(
  students: HonorStudent[], 
  scopeLabel: string, 
  timeRangeLabel: string
): void {
  if (typeof window === 'undefined') return;

  const fileName = `Bang_Vinh_Danh_EcoVoice_${scopeLabel.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  try {
    const rows: (string | number)[][] = [
      ['BẢNG VINH DANH & THI ĐUA HỌC SINH - ECO-VOICE'],
      [`Phạm vi: ${scopeLabel}`, `Thời gian: ${timeRangeLabel}`, `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
      [],
      ['Hạng', 'Họ và tên học sinh', 'Lớp', 'Khối', 'Điểm Eco Points (EP)', 'Số cây xanh 🌲', 'Điểm phát âm (%)', 'Danh hiệu thi đua', 'Lần luyện tập gần nhất']
    ];

    if (students.length === 0) {
      rows.push(['-', 'Chưa có học sinh nào đạt điểm tích lũy trong khoảng thời gian này', '-', '-', 0, '0 cây', '-', 'Chưa xếp hạng', '-']);
    } else {
      students.forEach((st) => {
        let rankText = `#${st.rank}`;
        if (st.rank === 1) rankText = 'Hạng 1 🥇';
        else if (st.rank === 2) rankText = 'Hạng 2 🥈';
        else if (st.rank === 3) rankText = 'Hạng 3 🥉';

        rows.push([
          rankText,
          st.name,
          st.className,
          `Khối ${st.grade}`,
          st.ecoPoints,
          `${st.trees} cây`,
          st.score > 0 ? `${st.score}%` : 'Chưa có điểm',
          st.titleBadge,
          st.lastPractice
        ]);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Nicely formatted column widths
    ws['!cols'] = [
      { wch: 12 }, // Hạng
      { wch: 28 }, // Họ và tên
      { wch: 10 }, // Lớp
      { wch: 10 }, // Khối
      { wch: 22 }, // Eco Points
      { wch: 16 }, // Số cây xanh
      { wch: 18 }, // Điểm phát âm
      { wch: 24 }, // Danh hiệu
      { wch: 22 }  // Lần luyện tập
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bảng Vinh Danh');
    XLSX.writeFile(wb, fileName);
  } catch (err) {
    console.error('XLSX export failed, falling back to CSV:', err);
    // CSV fallback
    const headers = ['Hạng', 'Họ và tên học sinh', 'Lớp', 'Khối', 'Điểm Eco Points (EP)', 'Số cây xanh', 'Điểm phát âm', 'Danh hiệu thi đua', 'Lần luyện tập'];
    const csvRows = [
      `"BẢNG VINH DANH & THI ĐUA HỌC SINH - ECO-VOICE"`,
      `"Phạm vi: ${scopeLabel} - Thời gian: ${timeRangeLabel} - Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}"`,
      '',
      headers.join(',')
    ];

    students.forEach(st => {
      csvRows.push([
        st.rank,
        `"${st.name}"`,
        `"${st.className}"`,
        `"Khối ${st.grade}"`,
        st.ecoPoints,
        st.trees,
        `"${st.score}%"`,
        `"${st.titleBadge}"`,
        `"${st.lastPractice}"`
      ].join(','));
    });

    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName.replace('.xlsx', '.csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
