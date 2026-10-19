const fs = require('fs');
const path = require('path');

// Complete Grade 4 Global Success dataset definition
const grade4Data = {
  grade: 4,
  gradeNumber: 4,
  gradeTitle: "Tiếng Anh 4 - Global Success",
  curriculum: "Chương trình Giáo dục phổ thông 2018 (Bộ GD&ĐT)",
  publisher: "Nhà xuất bản Giáo dục Việt Nam",
  description: "Bộ cơ sở dữ liệu chuẩn 20 Units Tiếng Anh 4 Global Success phân chia chi tiết theo Lesson 1, Lesson 2, Lesson 3",
  totalUnits: 20,
  units: [
    // UNIT 1: MY FRIENDS
    {
      unitNumber: 1,
      unitKey: "unit_1",
      unitName: "My friends",
      unitFullName: "Unit 1: My friends",
      theme: "Countries & Nationalities (Quốc gia & Nơi xuất xứ)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và giới thiệu quốc gia/quê hương (Where are you from?)",
          vocabulary: [
            {
              id: "g4_u1_1",
              word: "VIETNAM",
              phonetic: "/ˌvjetˈnɑːm/",
              meaning: "Nước Việt Nam",
              speechText: "Vietnam",
              colorHex: "#ef4444",
              icon: "🇻🇳",
              sentence: "I am from Vietnam.",
              sentenceVi: "Mình đến từ Việt Nam.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u1_2",
              word: "AMERICA",
              phonetic: "/əˈmer.ɪ.kə/",
              meaning: "Nước Mỹ (Hoa Kỳ)",
              speechText: "America",
              colorHex: "#3b82f6",
              icon: "🇺🇸",
              sentence: "He is from America.",
              sentenceVi: "Bạn ấy đến từ nước Mỹ.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u1_3",
              word: "BRITAIN",
              phonetic: "/ˈbrɪt.ən/",
              meaning: "Nước Anh (Vương quốc Anh)",
              speechText: "Britain",
              colorHex: "#8b5cf6",
              icon: "🇬🇧",
              sentence: "Lucy is from Britain.",
              sentenceVi: "Lucy đến từ nước Anh.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u1_4",
              word: "AUSTRALIA",
              phonetic: "/ɒsˈtreɪ.li.ə/",
              meaning: "Nước Úc (Ô-xtrây-li-a)",
              speechText: "Australia",
              colorHex: "#10b981",
              icon: "🇦🇺",
              sentence: "Ben lives in Australia.",
              sentenceVi: "Ben sống ở nước Úc.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u1_s1",
              structure: "Where are you from? - I'm from [Country].",
              meaning: "Hỏi và trả lời về quê hương / quốc gia xuất xứ",
              example: "Where are you from? - I'm from Vietnam.",
              exampleVi: "Bạn đến từ đâu? - Mình đến từ Việt Nam.",
              speechText: "Where are you from? I'm from Vietnam.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u1_s2",
              structure: "Where is he/she from? - He/She is from [Country].",
              meaning: "Hỏi và trả lời quê hương của người khác",
              example: "Where is she from? - She's from Britain.",
              exampleVi: "Cô ấy đến từ đâu? - Cô ấy đến từ nước Anh.",
              speechText: "Where is she from? She's from Britain.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Mở rộng các nước Châu Á & Quốc tịch bạn bè",
          vocabulary: [
            {
              id: "g4_u1_5",
              word: "SINGAPORE",
              phonetic: "/ˌsɪŋ.əˈpɔːr/",
              meaning: "Nước Xin-ga-po",
              speechText: "Singapore",
              colorHex: "#ec4899",
              icon: "🇸🇬",
              sentence: "They are from Singapore.",
              sentenceVi: "Họ đến từ nước Xin-ga-po.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u1_6",
              word: "MALAYSIA",
              phonetic: "/məˈleɪ.ʒə/",
              meaning: "Nước Ma-lay-si-a",
              speechText: "Malaysia",
              colorHex: "#f59e0b",
              icon: "🇲🇾",
              sentence: "My new friend is from Malaysia.",
              sentenceVi: "Người bạn mới của mình đến từ Ma-lay-si-a.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u1_7",
              word: "JAPAN",
              phonetic: "/dʒəˈpæn/",
              meaning: "Nước Nhật Bản",
              speechText: "Japan",
              colorHex: "#f97316",
              icon: "🇯🇵",
              sentence: "Akiko comes from Japan.",
              sentenceVi: "Akiko đến từ đất nước Nhật Bản.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u1_8",
              word: "THAILAND",
              phonetic: "/ˈtaɪ.lænd/",
              meaning: "Nước Thái Lan",
              speechText: "Thailand",
              colorHex: "#06b6d4",
              icon: "🇹🇭",
              sentence: "We visit Thailand in summer.",
              sentenceVi: "Chúng mình đi thăm Thái Lan vào mùa hè.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u1_s3",
              structure: "Is he / she from [Country]? - Yes, he/she is.",
              meaning: "Hỏi xác nhận quê hương của một người",
              example: "Is he from Japan? - Yes, he is.",
              exampleVi: "Cậu ấy có phải đến từ Nhật Bản không? - Đúng vậy.",
              speechText: "Is he from Japan? Yes, he is.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u1_s4",
              structure: "Is she from Malaysia? - No, she isn't. She's from Singapore.",
              meaning: "Hỏi và đính chính quốc gia của bạn",
              example: "Is she from Malaysia? - No, she isn't. She's from Singapore.",
              exampleVi: "Bạn ấy đến từ Ma-lay-si-a à? - Không, bạn ấy đến từ Xin-ga-po.",
              speechText: "Is she from Malaysia? No, she isn't. She's from Singapore.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Phonics)",
          theme: "Luyện âm /br/, /st/ & Tình bạn năm châu",
          vocabulary: [
            {
              id: "g4_u1_9",
              word: "FRIEND",
              phonetic: "/frend/",
              meaning: "Người bạn, bạn bè",
              speechText: "Friend",
              colorHex: "#10b981",
              icon: "🤝",
              sentence: "We are good friends.",
              sentenceVi: "Chúng mình là những người bạn tốt.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u1_10",
              word: "COUNTRY",
              phonetic: "/ˈkʌn.tri/",
              meaning: "Đất nước, quốc gia",
              speechText: "Country",
              colorHex: "#3b82f6",
              icon: "🌏",
              sentence: "Vietnam is a beautiful green country.",
              sentenceVi: "Việt Nam là một đất nước xanh tươi xinh đẹp.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u1_s5",
              structure: "We are good friends from different countries.",
              meaning: "Giao lưu và kết nối bạn bè khắp năm châu",
              example: "We are good friends from different green countries.",
              exampleVi: "Chúng mình là những người bạn tốt đến từ nhiều quốc gia xanh tươi.",
              speechText: "We are good friends from different green countries.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 2: TIME AND DAILY ROUTINES
    {
      unitNumber: 2,
      unitKey: "unit_2",
      unitName: "Time and daily routines",
      unitFullName: "Unit 2: Time and daily routines",
      theme: "Telling Time & Routines (Hỏi giờ & Lịch sinh hoạt hàng ngày)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và trả lời giờ giấc trong ngày (What time is it?)",
          vocabulary: [
            {
              id: "g4_u2_1",
              word: "TIME",
              phonetic: "/taɪm/",
              meaning: "Thời gian, giờ giấc",
              speechText: "Time",
              colorHex: "#8b5cf6",
              icon: "⏳",
              sentence: "What time is it now?",
              sentenceVi: "Bây giờ là mấy giờ rồi?",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u2_2",
              word: "O'CLOCK",
              phonetic: "/əˈklɒk/",
              meaning: "Giờ đúng (chính xác)",
              speechText: "O'clock",
              colorHex: "#3b82f6",
              icon: "⏰",
              sentence: "It is seven o'clock.",
              sentenceVi: "Bây giờ là bảy giờ đúng.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u2_3",
              word: "FIFTEEN",
              phonetic: "/ˌfɪfˈtiːn/",
              meaning: "Số 15 / Mười lăm phút",
              speechText: "Fifteen",
              colorHex: "#f59e0b",
              icon: "🕒",
              sentence: "It is six fifteen.",
              sentenceVi: "Bây giờ là sáu giờ mười lăm phút.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u2_4",
              word: "THIRTY",
              phonetic: "/ˈθɜː.ti/",
              meaning: "Số 30 / Ba mươi phút (rưỡi)",
              speechText: "Thirty",
              colorHex: "#10b981",
              icon: "🕢",
              sentence: "It is seven thirty in the morning.",
              sentenceVi: "Bây giờ là bảy giờ ba mươi phút sáng.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u2_s1",
              structure: "What time is it? - It's [time] o'clock.",
              meaning: "Hỏi và trả lời giờ đúng",
              example: "What time is it? - It's seven o'clock.",
              exampleVi: "Mấy giờ rồi bạn? - Bảy giờ đúng rồi.",
              speechText: "What time is it? It's seven o'clock.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u2_s2",
              structure: "What time is it? - It's [hour] [minutes].",
              meaning: "Hỏi và trả lời giờ kèm số phút",
              example: "What time is it? - It's eight thirty.",
              exampleVi: "Mấy giờ rồi? - Tám giờ ba mươi phút.",
              speechText: "What time is it? It's eight thirty.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Hỏi giờ thực hiện hoạt động thường ngày (What time do you...?)",
          vocabulary: [
            {
              id: "g4_u2_5",
              word: "GET UP",
              phonetic: "/ɡet ʌp/",
              meaning: "Thức dậy",
              speechText: "Get up",
              colorHex: "#f97316",
              icon: "🌅",
              sentence: "I get up at six o'clock.",
              sentenceVi: "Mình thức dậy lúc sáu giờ sáng.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u2_6",
              word: "HAVE BREAKFAST",
              phonetic: "/hæv ˈbrek.fəst/",
              meaning: "Ăn bữa sáng",
              speechText: "Have breakfast",
              colorHex: "#ef4444",
              icon: "🍳",
              sentence: "I have breakfast at six thirty.",
              sentenceVi: "Mình ăn sáng lúc sáu giờ ba mươi.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u2_7",
              word: "GO TO SCHOOL",
              phonetic: "/ɡəʊ tuː skuːl/",
              meaning: "Đi học đến trường",
              speechText: "Go to school",
              colorHex: "#10b981",
              icon: "🎒",
              sentence: "We go to school together.",
              sentenceVi: "Chúng mình cùng nhau đi học.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u2_8",
              word: "GO TO BED",
              phonetic: "/ɡəʊ tuː bed/",
              meaning: "Đi ngủ",
              speechText: "Go to bed",
              colorHex: "#6366f1",
              icon: "🛌",
              sentence: "I go to bed at nine thirty.",
              sentenceVi: "Mình đi ngủ lúc chín giờ ba mươi tối.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u2_s3",
              structure: "What time do you [routine]? - I [routine] at [time].",
              meaning: "Hỏi giờ bạn thực hiện hoạt động sinh hoạt",
              example: "What time do you get up? - I get up at six o'clock.",
              exampleVi: "Bạn thức dậy lúc mấy giờ? - Mình thức dậy lúc sáu giờ.",
              speechText: "What time do you get up? I get up at six o'clock.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u2_s4",
              structure: "What time do you go to bed? - I go to bed at nine thirty.",
              meaning: "Hỏi giờ đi ngủ ban đêm",
              example: "What time do you go to bed? - I go to bed at nine thirty.",
              exampleVi: "Bạn đi ngủ lúc mấy giờ? - Mình đi ngủ lúc chín giờ ba mươi.",
              speechText: "What time do you go to bed? I go to bed at nine thirty.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Habits)",
          theme: "Luyện âm /t/, /d/ & Nề nếp sinh hoạt lành mạnh",
          vocabulary: [
            {
              id: "g4_u2_9",
              word: "MORNING",
              phonetic: "/ˈmɔː.nɪŋ/",
              meaning: "Buổi sáng sớm",
              speechText: "Morning",
              colorHex: "#eab308",
              icon: "☀️",
              sentence: "Good morning, everyone.",
              sentenceVi: "Chào buổi sáng tất cả mọi người.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u2_10",
              word: "EVENING",
              phonetic: "/ˈiːv.nɪŋ/",
              meaning: "Buổi tối",
              speechText: "Evening",
              colorHex: "#475569",
              icon: "🌙",
              sentence: "I read books in the evening.",
              sentenceVi: "Mình đọc sách vào buổi tối.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u2_s5",
              structure: "I have healthy daily routines to stay strong and energetic.",
              meaning: "Xây dựng thói quen sinh hoạt đúng giờ khoa học",
              example: "I have healthy daily routines to stay strong and energetic.",
              exampleVi: "Em duy trì thói quen sinh hoạt đúng giờ để luôn khỏe mạnh và tràn đầy năng lượng.",
              speechText: "I have healthy daily routines to stay strong and energetic.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 3: MY WEEK
    {
      unitNumber: 3,
      unitKey: "unit_3",
      unitName: "My week",
      unitFullName: "Unit 3: My week",
      theme: "Days of the Week & Weekly Activities (Các ngày trong tuần & Hoạt động)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và đáp hôm nay là thứ mấy (What day is it today?)",
          vocabulary: [
            {
              id: "g4_u3_1",
              word: "MONDAY",
              phonetic: "/ˈmʌn.deɪ/",
              meaning: "Thứ Hai",
              speechText: "Monday",
              colorHex: "#ef4444",
              icon: "📅",
              sentence: "Today is Monday.",
              sentenceVi: "Hôm nay là Thứ Hai.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u3_2",
              word: "TUESDAY",
              phonetic: "/ˈtʃuːz.deɪ/",
              meaning: "Thứ Ba",
              speechText: "Tuesday",
              colorHex: "#f59e0b",
              icon: "🗓️",
              sentence: "I have English on Tuesday.",
              sentenceVi: "Mình có môn Tiếng Anh vào Thứ Ba.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u3_3",
              word: "WEDNESDAY",
              phonetic: "/ˈwenz.deɪ/",
              meaning: "Thứ Tư",
              speechText: "Wednesday",
              colorHex: "#3b82f6",
              icon: "📆",
              sentence: "We study Maths on Wednesday.",
              sentenceVi: "Chúng mình học Toán vào Thứ Tư.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u3_4",
              word: "THURSDAY",
              phonetic: "/ˈθɜːz.deɪ/",
              meaning: "Thứ Năm",
              speechText: "Thursday",
              colorHex: "#8b5cf6",
              icon: "📋",
              sentence: "Thursday is a sunny day.",
              sentenceVi: "Thứ Năm là một ngày ngập tràn nắng ấm.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u3_s1",
              structure: "What day is it today? - It's [Day].",
              meaning: "Hỏi và trả lời hôm nay là thứ mấy",
              example: "What day is it today? - It's Monday.",
              exampleVi: "Hôm nay là thứ mấy? - Hôm nay là Thứ Hai.",
              speechText: "What day is it today? It's Monday.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u3_s2",
              structure: "What day is it today? - It's Wednesday.",
              meaning: "Hỏi và đáp ngày giữa tuần",
              example: "What day is it today? - It's Wednesday.",
              exampleVi: "Hôm nay là thứ mấy? - Hôm nay là Thứ Tư.",
              speechText: "What day is it today? It's Wednesday.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Các ngày cuối tuần & Hỏi hoạt động theo ngày trong tuần",
          vocabulary: [
            {
              id: "g4_u3_5",
              word: "FRIDAY",
              phonetic: "/ˈfraɪ.deɪ/",
              meaning: "Thứ Sáu",
              speechText: "Friday",
              colorHex: "#10b981",
              icon: "🎉",
              sentence: "Friday is my favourite day.",
              sentenceVi: "Thứ Sáu là ngày mình yêu thích nhất.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u3_6",
              word: "SATURDAY",
              phonetic: "/ˈsæt.ə.deɪ/",
              meaning: "Thứ Bảy",
              speechText: "Saturday",
              colorHex: "#ec4899",
              icon: "⚽",
              sentence: "I play football on Saturday.",
              sentenceVi: "Mình chơi bóng đá vào Thứ Bảy.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u3_7",
              word: "SUNDAY",
              phonetic: "/ˈsʌn.deɪ/",
              meaning: "Chủ Nhật",
              speechText: "Sunday",
              colorHex: "#06b6d4",
              icon: "☀️",
              sentence: "On Sunday, I water the garden.",
              sentenceVi: "Vào Chủ Nhật, mình tưới cây trong vườn.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u3_8",
              word: "WEEKEND",
              phonetic: "/ˌwiːkˈend/",
              meaning: "Dịp cuối tuần (Thứ Bảy & Chủ Nhật)",
              speechText: "Weekend",
              colorHex: "#f97316",
              icon: "🏕️",
              sentence: "What do you do at the weekend?",
              sentenceVi: "Bạn làm gì vào dịp cuối tuần?",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u3_s3",
              structure: "What do you do on [Days]? - I [activity].",
              meaning: "Hỏi và đáp hoạt động thường làm vào ngày trong tuần",
              example: "What do you do on Saturdays? - I play sports with my friends.",
              exampleVi: "Bạn làm gì vào các ngày Thứ Bảy? - Mình chơi thể thao cùng bạn bè.",
              speechText: "What do you do on Saturdays? I play sports with my friends.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u3_s4",
              structure: "What do you do on Sundays? - I help my parents at home.",
              meaning: "Hỏi việc làm vào ngày Chủ Nhật",
              example: "What do you do on Sundays? - I help my parents at home.",
              exampleVi: "Bạn làm gì vào các ngày Chủ Nhật? - Mình giúp đỡ bố mẹ ở nhà.",
              speechText: "What do you do on Sundays? I help my parents at home.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Phonics)",
          theme: "Luyện âm /deɪ/, /s/ & Lập thời gian biểu tuần hiệu quả",
          vocabulary: [
            {
              id: "g4_u3_9",
              word: "STUDY",
              phonetic: "/ˈstʌd.i/",
              meaning: "Học tập, nghiên cứu bài vở",
              speechText: "Study",
              colorHex: "#3b82f6",
              icon: "📖",
              sentence: "We study hard at school.",
              sentenceVi: "Chúng mình chăm chỉ học tập ở trường.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u3_10",
              word: "RELAX",
              phonetic: "/rɪˈlæks/",
              meaning: "Thư giãn, nghỉ ngơi lấy lại sức",
              speechText: "Relax",
              colorHex: "#10b981",
              icon: "🍃",
              sentence: "I relax in the green park.",
              sentenceVi: "Mình thư giãn trong công viên xanh mát.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u3_s5",
              structure: "I study well on weekdays and relax at the weekend.",
              meaning: "Cân bằng học tập và nghỉ ngơi hợp lý",
              example: "I study well on weekdays and relax at the weekend.",
              exampleVi: "Em học tập tốt trong tuần và nghỉ ngơi vui vẻ vào dịp cuối tuần.",
              speechText: "I study well on weekdays and relax at the weekend.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 4: MY BIRTHDAY PARTY
    {
      unitNumber: 4,
      unitKey: "unit_4",
      unitName: "My birthday party",
      unitFullName: "Unit 4: My birthday party",
      theme: "Months of the Year & Birthday Celebrations (Các tháng & Tiệc sinh nhật)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và đáp về tháng sinh nhật (When's your birthday?)",
          vocabulary: [
            {
              id: "g4_u4_1",
              word: "JANUARY",
              phonetic: "/ˈdʒæn.ju.ə.ri/",
              meaning: "Tháng Một",
              speechText: "January",
              colorHex: "#06b6d4",
              icon: "❄️",
              sentence: "My birthday is in January.",
              sentenceVi: "Sinh nhật của mình vào Tháng Một.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u4_2",
              word: "MARCH",
              phonetic: "/mɑːtʃ/",
              meaning: "Tháng Ba",
              speechText: "March",
              colorHex: "#10b981",
              icon: "🌱",
              sentence: "Her birthday is in March.",
              sentenceVi: "Sinh nhật của bạn ấy vào Tháng Ba.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u4_3",
              word: "MAY",
              phonetic: "/meɪ/",
              meaning: "Tháng Năm",
              speechText: "May",
              colorHex: "#ec4899",
              icon: "🌸",
              sentence: "His birthday is in May.",
              sentenceVi: "Sinh nhật của bạn ấy vào Tháng Năm.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u4_4",
              word: "SEPTEMBER",
              phonetic: "/sepˈtem.bər/",
              meaning: "Tháng Chín (mùa tựu trường)",
              speechText: "September",
              colorHex: "#f59e0b",
              icon: "🍂",
              sentence: "We start school in September.",
              sentenceVi: "Chúng mình tựu trường vào Tháng Chín.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u4_s1",
              structure: "When's your birthday? - It's in [Month].",
              meaning: "Hỏi và trả lời sinh nhật rơi vào tháng nào",
              example: "When's your birthday? - It's in May.",
              exampleVi: "Sinh nhật của bạn vào khi nào? - Vào Tháng Năm.",
              speechText: "When's your birthday? It's in May.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u4_s2",
              structure: "When's his/her birthday? - It's in [Month].",
              meaning: "Hỏi tháng sinh của người khác",
              example: "When's his birthday? - It's in March.",
              exampleVi: "Sinh nhật của cậu ấy vào khi nào? - Vào Tháng Ba.",
              speechText: "When's his birthday? It's in March.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Thức ăn & đồ uống tiệc sinh nhật (What do you want to eat/drink?)",
          vocabulary: [
            {
              id: "g4_u4_5",
              word: "PARTY",
              phonetic: "/ˈpɑː.ti/",
              meaning: "Bữa tiệc liên hoan",
              speechText: "Party",
              colorHex: "#f59e0b",
              icon: "🎂",
              sentence: "Welcome to my birthday party.",
              sentenceVi: "Chào mừng bạn đến với bữa tiệc sinh nhật của mình.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u4_6",
              word: "CHIPS",
              phonetic: "/tʃɪps/",
              meaning: "Khoai tây chiên giòn",
              speechText: "Chips",
              colorHex: "#eab308",
              icon: "🍟",
              sentence: "Would you like some chips?",
              sentenceVi: "Bạn có muốn ăn một ít khoai tây chiên không?",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u4_7",
              word: "SWEETS",
              phonetic: "/swiːts/",
              meaning: "Kẹo ngọt nhiều màu",
              speechText: "Sweets",
              colorHex: "#ec4899",
              icon: "🍬",
              sentence: "There are colourful sweets on the table.",
              sentenceVi: "Có những viên kẹo ngọt sặc sỡ trên bàn.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u4_8",
              word: "JUICE",
              phonetic: "/dʒuːs/",
              meaning: "Nước ép hoa quả tươi",
              speechText: "Juice",
              colorHex: "#f97316",
              icon: "🧃",
              sentence: "I would like some orange juice.",
              sentenceVi: "Cho mình xin một ly nước cam ép.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u4_s3",
              structure: "What do you want to eat? - I want some [food].",
              meaning: "Hỏi và trả lời muốn ăn món gì trong bữa tiệc",
              example: "What do you want to eat? - I want some chips.",
              exampleVi: "Bạn muốn ăn món gì? - Mình muốn ăn khoai tây chiên.",
              speechText: "What do you want to eat? I want some chips.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u4_s4",
              structure: "What do you want to drink? - I want some [drink].",
              meaning: "Hỏi muốn uống loại nước nào",
              example: "What do you want to drink? - I want some juice.",
              exampleVi: "Bạn muốn uống gì? - Cho mình xin nước ép trái cây.",
              speechText: "What do you want to drink? I want some juice.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Phonics)",
          theme: "Luyện âm /dʒ/, /m/ & Niềm vui bữa tiệc sinh nhật",
          vocabulary: [
            {
              id: "g4_u4_9",
              word: "PRESENT",
              phonetic: "/ˈprez.ənt/",
              meaning: "Món quà sinh nhật",
              speechText: "Present",
              colorHex: "#10b981",
              icon: "🎁",
              sentence: "This lovely present is for you.",
              sentenceVi: "Món quà xinh xắn này dành tặng bạn.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u4_10",
              word: "BIRTHDAY",
              phonetic: "/ˈbɜːθ.deɪ/",
              meaning: "Ngày sinh nhật kỷ niệm",
              speechText: "Birthday",
              colorHex: "#8b5cf6",
              icon: "🎉",
              sentence: "Happy birthday to my dear friend!",
              sentenceVi: "Chúc mừng sinh nhật người bạn thân yêu!",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u4_s5",
              structure: "Happy birthday! We enjoy delicious food and healthy drinks.",
              meaning: "Gửi lời chúc mừng sinh nhật ấm áp",
              example: "Happy birthday! We enjoy delicious food and healthy drinks.",
              exampleVi: "Chúc mừng sinh nhật! Chúng mình cùng thưởng thức đồ ăn ngon và nước ép lành mạnh.",
              speechText: "Happy birthday! We enjoy delicious food and healthy drinks.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 5: THINGS WE CAN DO
    {
      unitNumber: 5,
      unitKey: "unit_5",
      unitName: "Things we can do",
      unitFullName: "Unit 5: Things we can do",
      theme: "Abilities & Talents (Khả năng & Năng khiếu cá nhân)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và đáp về khả năng vận động (Can you...?)",
          vocabulary: [
            {
              id: "g4_u5_1",
              word: "SWIM",
              phonetic: "/swɪm/",
              meaning: "Bơi lội dưới nước",
              speechText: "Swim",
              colorHex: "#06b6d4",
              icon: "🏊",
              sentence: "I can swim very well.",
              sentenceVi: "Mình có thể bơi rất giỏi.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u5_2",
              word: "RIDE A BIKE",
              phonetic: "/raɪd ə baɪk/",
              meaning: "Đạp xe đạp",
              speechText: "Ride a bike",
              colorHex: "#10b981",
              icon: "🚲",
              sentence: "He can ride a bike to school.",
              sentenceVi: "Bạn ấy có thể tự đạp xe đến trường.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u5_3",
              word: "ROLLER-SKATE",
              phonetic: "/ˈrəʊ.lə skeɪt/",
              meaning: "Trượt pa-tanh (giày trượt)",
              speechText: "Roller-skate",
              colorHex: "#3b82f6",
              icon: "🛼",
              sentence: "She can roller-skate fast.",
              sentenceVi: "Bạn ấy trượt pa-tanh rất nhanh.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u5_4",
              word: "COOK",
              phonetic: "/kʊk/",
              meaning: "Nấu ăn, làm bếp",
              speechText: "Cook",
              colorHex: "#ef4444",
              icon: "🍳",
              sentence: "My brother can cook delicious rice.",
              sentenceVi: "Anh trai mình biết nấu cơm rất ngon.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u5_s1",
              structure: "Can you [action]? - Yes, I can. / No, I can't.",
              meaning: "Hỏi bạn có khả năng làm được việc gì không",
              example: "Can you swim? - Yes, I can.",
              exampleVi: "Bạn có biết bơi không? - Có, mình biết bơi.",
              speechText: "Can you swim? Yes, I can.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u5_s2",
              structure: "Can he / she [action]? - Yes, he/she can. / No, he/she can't.",
              meaning: "Hỏi khả năng của người khác",
              example: "Can she roller-skate? - No, she can't.",
              exampleVi: "Cô ấy có biết trượt pa-tanh không? - Không, bạn ấy chưa biết.",
              speechText: "Can she roller-skate? No, she can't.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Nhạc cụ nghệ thuật & Hỏi khả năng đặc biệt (What can you do?)",
          vocabulary: [
            {
              id: "g4_u5_5",
              word: "PLAY THE GUITAR",
              phonetic: "/pleɪ ðə ɡɪˈtɑːr/",
              meaning: "Chơi đàn ghi-ta",
              speechText: "Play the guitar",
              colorHex: "#f59e0b",
              icon: "🎸",
              sentence: "He plays the guitar melodiously.",
              sentenceVi: "Cậu ấy gảy đàn ghi-ta rất êm tai.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u5_6",
              word: "PLAY THE PIANO",
              phonetic: "/pleɪ ðə piˈæn.əʊ/",
              meaning: "Chơi đàn dương cầm (pi-a-nô)",
              speechText: "Play the piano",
              colorHex: "#8b5cf6",
              icon: "🎹",
              sentence: "Lucy can play the piano.",
              sentenceVi: "Lucy biết chơi đàn dương cầm.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u5_7",
              word: "DRAW",
              phonetic: "/drɔː/",
              meaning: "Vẽ tranh nghệ thuật",
              speechText: "Draw",
              colorHex: "#ec4899",
              icon: "🎨",
              sentence: "I can draw green trees.",
              sentenceVi: "Mình có thể vẽ những tán cây xanh tươi.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u5_8",
              word: "SING",
              phonetic: "/sɪŋ/",
              meaning: "Ca hát vang",
              speechText: "Sing",
              colorHex: "#10b981",
              icon: "🎤",
              sentence: "We can sing English songs cheerfully.",
              sentenceVi: "Chúng mình có thể ca hát các bài hát tiếng Anh thật vui tươi.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u5_s3",
              structure: "What can you do? - I can [action].",
              meaning: "Hỏi và trả lời bản thân có thể làm được điều gì",
              example: "What can you do? - I can play the guitar.",
              exampleVi: "Bạn có thể làm được gì? - Mình có thể chơi đàn ghi-ta.",
              speechText: "What can you do? I can play the guitar.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u5_s4",
              structure: "What can he / she do? - He / She can [action].",
              meaning: "Hỏi năng khiếu của người khác",
              example: "What can she do? - She can play the piano very well.",
              exampleVi: "Bạn ấy làm được gì? - Bạn ấy chơi đàn pi-a-nô rất giỏi.",
              speechText: "What can she do? She can play the piano very well.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Talents)",
          theme: "Luyện âm /kæn/, /kɑːnt/ & Khám phá phát triển năng khiếu",
          vocabulary: [
            {
              id: "g4_u5_9",
              word: "TALENT",
              phonetic: "/ˈtæl.ənt/",
              meaning: "Tài năng, năng khiếu",
              speechText: "Talent",
              colorHex: "#eab308",
              icon: "🌟",
              sentence: "Everyone has a wonderful talent.",
              sentenceVi: "Mỗi bạn đều có một tài năng tuyệt vời.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u5_10",
              word: "PRACTICE",
              phonetic: "/ˈpræk.tɪs/",
              meaning: "Luyện tập thường xuyên",
              speechText: "Practice",
              colorHex: "#3b82f6",
              icon: "🎯",
              sentence: "Practice speaking English every day.",
              sentenceVi: "Hãy luyện nói tiếng Anh mỗi ngày.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u5_s5",
              structure: "Practice every day to develop your special talents.",
              meaning: "Động viên học sinh chăm chỉ rèn luyện kỹ năng",
              example: "Practice every day to develop your special talents.",
              exampleVi: "Hãy chăm chỉ luyện tập mỗi ngày để phát huy tài năng đặc biệt của mình.",
              speechText: "Practice every day to develop your special talents.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 6: OUR SCHOOL FACILITIES
    {
      unitNumber: 6,
      unitKey: "unit_6",
      unitName: "Our school facilities",
      unitFullName: "Unit 6: Our school facilities",
      theme: "School Campus & Special Rooms (Khuôn viên & Các phòng bộ môn)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Các phòng học chức năng trong trường (Where's the...?)",
          vocabulary: [
            {
              id: "g4_u6_1",
              word: "COMPUTER ROOM",
              phonetic: "/kəmˈpjuː.tər ruːm/",
              meaning: "Phòng máy vi tính",
              speechText: "Computer room",
              colorHex: "#3b82f6",
              icon: "💻",
              sentence: "Our computer room is very modern.",
              sentenceVi: "Phòng máy tính của trường mình rất hiện đại.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u6_2",
              word: "ART ROOM",
              phonetic: "/ɑːt ruːm/",
              meaning: "Phòng học mỹ thuật",
              speechText: "Art room",
              colorHex: "#ec4899",
              icon: "🎨",
              sentence: "We draw pictures in the art room.",
              sentenceVi: "Chúng mình vẽ tranh trong phòng mỹ thuật.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u6_3",
              word: "MUSIC ROOM",
              phonetic: "/ˈmjuː.zɪk ruːm/",
              meaning: "Phòng học âm nhạc",
              speechText: "Music room",
              colorHex: "#f59e0b",
              icon: "🎵",
              sentence: "We sing songs in the music room.",
              sentenceVi: "Chúng mình hát ca trong phòng âm nhạc.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u6_4",
              word: "GYM",
              phonetic: "/dʒɪm/",
              meaning: "Nhà thể chất / Phòng tập thể dục",
              speechText: "Gym",
              colorHex: "#10b981",
              icon: "🏀",
              sentence: "Students play games in the gym.",
              sentenceVi: "Học sinh chơi thể thao trong nhà thể chất.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u6_s1",
              structure: "Where's your school? - It's in [Location].",
              meaning: "Hỏi và giới thiệu vị trí của trường học",
              example: "Where's your school? - It's in the town.",
              exampleVi: "Trường của bạn ở đâu? - Trường mình ở trong thị trấn.",
              speechText: "Where's your school? It's in the town.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u6_s2",
              structure: "Where's the [facility]? - It's on the [floor].",
              meaning: "Chỉ vị trí phòng học chức năng trong trường",
              example: "Where's the art room? - It's on the second floor.",
              exampleVi: "Phòng mỹ thuật ở đâu? - Phòng ở tầng hai.",
              speechText: "Where's the art room? It's on the second floor.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Khuôn viên trường & Hỏi số lượng (How many... are there?)",
          vocabulary: [
            {
              id: "g4_u6_5",
              word: "PLAYGROUND",
              phonetic: "/ˈpleɪ.ɡraʊnd/",
              meaning: "Sân trường / Sân chơi rộng",
              speechText: "Playground",
              colorHex: "#10b981",
              icon: "⚽",
              sentence: "The school playground is spacious.",
              sentenceVi: "Sân trường rất rộng rãi và thoáng mát.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u6_6",
              word: "GARDEN",
              phonetic: "/ˈɡɑː.dən/",
              meaning: "Khu vườn sinh học trường em",
              speechText: "Garden",
              colorHex: "#16a34a",
              icon: "🌿",
              sentence: "Our school garden has many flowers and trees.",
              sentenceVi: "Vườn trường em có rất nhiều hoa thơm và cây xanh.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u6_7",
              word: "BUILDING",
              phonetic: "/ˈbɪl.dɪŋ/",
              meaning: "Tòa nhà dãy lớp học",
              speechText: "Building",
              colorHex: "#64748b",
              icon: "🏫",
              sentence: "There are two big buildings at my school.",
              sentenceVi: "Trường mình có hai tòa nhà lớn.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u6_8",
              word: "CLASSROOM",
              phonetic: "/ˈklɑːs.ruːm/",
              meaning: "Phòng học của lớp",
              speechText: "Classroom",
              colorHex: "#3b82f6",
              icon: "🚪",
              sentence: "Our classroom is bright and clean.",
              sentenceVi: "Lớp học của chúng mình sáng sủa và sạch đẹp.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u6_s3",
              structure: "How many [rooms] are there at your school? - There is/are [number].",
              meaning: "Hỏi và trả lời số lượng phòng học chức năng ở trường",
              example: "How many computer rooms are there at your school? - There is one.",
              exampleVi: "Trường bạn có bao nhiêu phòng máy tính? - Có một phòng.",
              speechText: "How many computer rooms are there at your school? There is one.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u6_s4",
              structure: "How many buildings are there? - There are three buildings.",
              meaning: "Hỏi số lượng tòa nhà trường học",
              example: "How many buildings are there? - There are three buildings.",
              exampleVi: "Có bao nhiêu tòa nhà trong trường? - Có ba dãy nhà.",
              speechText: "How many buildings are there? There are three buildings.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Green Campus)",
          theme: "Luyện âm /sk/, /gr/ & Giữ gìn trường học xanh sạch đẹp",
          vocabulary: [
            {
              id: "g4_u6_9",
              word: "FACILITY",
              phonetic: "/fəˈsɪl.ə.ti/",
              meaning: "Cơ sở vật chất trường học",
              speechText: "Facility",
              colorHex: "#0d9488",
              icon: "🏢",
              sentence: "The school has modern facilities.",
              sentenceVi: "Ngôi trường có cơ sở vật chất khang trang.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u6_10",
              word: "BEAUTIFUL",
              phonetic: "/ˈbjuː.tɪ.fəl/",
              meaning: "Xinh đẹp, rực rỡ",
              speechText: "Beautiful",
              colorHex: "#ec4899",
              icon: "✨",
              sentence: "Our green school is very beautiful.",
              sentenceVi: "Ngôi trường xanh của chúng em rất xinh đẹp.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u6_s5",
              structure: "Our school is large, modern, and surrounded by green trees.",
              meaning: "Tự hào giới thiệu về ngôi trường xanh",
              example: "Our school is large, modern, and surrounded by green trees.",
              exampleVi: "Trường của chúng em rộng rãi, hiện đại và rợp bóng cây xanh mát.",
              speechText: "Our school is large, modern, and surrounded by green trees.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 7: OUR TIMETABLES
    {
      unitNumber: 7,
      unitKey: "unit_7",
      unitName: "Our timetables",
      unitFullName: "Unit 7: Our timetables",
      theme: "School Subjects & Timetable Schedule (Các môn học & Lịch học)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Các môn học cơ bản (What subjects do you have today?)",
          vocabulary: [
            {
              id: "g4_u7_1",
              word: "MATHS",
              phonetic: "/mæθs/",
              meaning: "Môn Toán học",
              speechText: "Maths",
              colorHex: "#3b82f6",
              icon: "📐",
              sentence: "I have Maths on Monday.",
              sentenceVi: "Mình có môn Toán vào Thứ Hai.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u7_2",
              word: "SCIENCE",
              phonetic: "/ˈsaɪ.əns/",
              meaning: "Môn Khoa học",
              speechText: "Science",
              colorHex: "#10b981",
              icon: "🔬",
              sentence: "We learn about plants in Science.",
              sentenceVi: "Chúng mình tìm hiểu về cây cỏ trong môn Khoa học.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u7_3",
              word: "ENGLISH",
              phonetic: "/ˈɪŋ.ɡlɪʃ/",
              meaning: "Môn Tiếng Anh",
              speechText: "English",
              colorHex: "#ef4444",
              icon: "🗣️",
              sentence: "English is very exciting.",
              sentenceVi: "Môn Tiếng Anh rất hào hứng và bổ ích.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u7_4",
              word: "VIETNAMESE",
              phonetic: "/ˌvjet.nəˈmiːz/",
              meaning: "Môn Tiếng Việt",
              speechText: "Vietnamese",
              colorHex: "#f59e0b",
              icon: "📚",
              sentence: "We study Vietnamese literature.",
              sentenceVi: "Chúng mình học các bài đọc môn Tiếng Việt.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u7_s1",
              structure: "What subjects do you have today? - I have [Subjects].",
              meaning: "Hỏi và đáp hôm nay có những môn học nào",
              example: "What subjects do you have today? - I have Maths and English.",
              exampleVi: "Hôm nay bạn có những môn học nào? - Mình có môn Toán và Tiếng Anh.",
              speechText: "What subjects do you have today? I have Maths and English.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u7_s2",
              structure: "What subjects do you have on Wednesday? - I have Science and Vietnamese.",
              meaning: "Hỏi các môn học vào một ngày cụ thể",
              example: "What subjects do you have on Wednesday? - I have Science and Vietnamese.",
              exampleVi: "Thứ Tư bạn có những môn gì? - Mình có môn Khoa học và Tiếng Việt.",
              speechText: "What subjects do you have on Wednesday? I have Science and Vietnamese.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Các môn năng khiếu & Hỏi lịch học (When do you have...?)",
          vocabulary: [
            {
              id: "g4_u7_5",
              word: "ART",
              phonetic: "/ɑːt/",
              meaning: "Môn Mỹ thuật",
              speechText: "Art",
              colorHex: "#ec4899",
              icon: "🎨",
              sentence: "I love drawing in Art class.",
              sentenceVi: "Mình thích vẽ tranh trong giờ Mỹ thuật.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u7_6",
              word: "MUSIC",
              phonetic: "/ˈmjuː.zɪk/",
              meaning: "Môn Âm nhạc",
              speechText: "Music",
              colorHex: "#8b5cf6",
              icon: "🎶",
              sentence: "We sing cheerfully in Music.",
              sentenceVi: "Chúng mình hát vui vẻ trong giờ Âm nhạc.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u7_7",
              word: "HISTORY AND GEOGRAPHY",
              phonetic: "/ˈhɪs.tər.i ənd dʒiˈɒɡ.rə.fi/",
              meaning: "Môn Lịch sử và Địa lí",
              speechText: "History and Geography",
              colorHex: "#d97706",
              icon: "🗺️",
              sentence: "We discover our homeland in History and Geography.",
              sentenceVi: "Chúng mình khám phá đất nước trong môn Lịch sử và Địa lí.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u7_8",
              word: "PE",
              phonetic: "/ˌpiːˈiː/",
              meaning: "Môn Thể dục (Giáo dục thể chất)",
              speechText: "PE",
              colorHex: "#10b981",
              icon: "🏃",
              sentence: "We do exercise in PE.",
              sentenceVi: "Chúng mình tập thể dục rèn luyện trong môn Thể dục.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u7_s3",
              structure: "When do you have [Subject]? - I have it on [Days].",
              meaning: "Hỏi và trả lời lịch học của môn vào thứ mấy",
              example: "When do you have Art? - I have it on Friday.",
              exampleVi: "Khi nào bạn có môn Mỹ thuật? - Mình có vào Thứ Sáu.",
              speechText: "When do you have Art? I have it on Friday.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u7_s4",
              structure: "When do you have PE? - I have it on Tuesday and Thursday.",
              meaning: "Hỏi môn học có 2 buổi một tuần",
              example: "When do you have PE? - I have it on Tuesday and Thursday.",
              exampleVi: "Khi nào bạn học Thể dục? - Mình học vào Thứ Ba và Thứ Năm.",
              speechText: "When do you have PE? I have it on Tuesday and Thursday.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Schedule)",
          theme: "Luyện âm /θ/, /v/ & Tự giác chuẩn bị sách vở theo thời khóa biểu",
          vocabulary: [
            {
              id: "g4_u7_9",
              word: "TIMETABLE",
              phonetic: "/ˈtaɪmˌteɪ.bəl/",
              meaning: "Thời khóa biểu tuần",
              speechText: "Timetable",
              colorHex: "#0284c7",
              icon: "📅",
              sentence: "Look at the weekly timetable.",
              sentenceVi: "Hãy xem thời khóa biểu trong tuần.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u7_10",
              word: "LESSON",
              phonetic: "/ˈles.ən/",
              meaning: "Tiết học, bài học bổ ích",
              speechText: "Lesson",
              colorHex: "#16a34a",
              icon: "💡",
              sentence: "Each lesson brings useful knowledge.",
              sentenceVi: "Mỗi tiết học mang đến nhiều kiến thức bổ ích.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u7_s5",
              structure: "I prepare my books carefully according to my school timetable.",
              meaning: "Rèn luyện tính tự giác, ngăn nắp trong học tập",
              example: "I prepare my books carefully according to my school timetable.",
              exampleVi: "Em chuẩn bị sách vở cẩn thận theo đúng thời khóa biểu nhà trường.",
              speechText: "I prepare my books carefully according to my school timetable.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 8: MY FAVOURITE SUBJECTS
    {
      unitNumber: 8,
      unitKey: "unit_8",
      unitName: "My favourite subjects",
      unitFullName: "Unit 8: My favourite subjects",
      theme: "Favourite Subjects & Reasons (Môn học yêu thích & Lý do)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và đáp về môn học yêu thích nhất (What's your favourite subject?)",
          vocabulary: [
            {
              id: "g4_u8_1",
              word: "FAVOURITE",
              phonetic: "/ˈfeɪ.vər.ɪt/",
              meaning: "Được yêu thích nhất",
              speechText: "Favourite",
              colorHex: "#ec4899",
              icon: "❤️",
              sentence: "English is my favourite subject.",
              sentenceVi: "Tiếng Anh là môn học yêu thích nhất của mình.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u8_2",
              word: "SUBJECT",
              phonetic: "/ˈsʌb.dʒɪkt/",
              meaning: "Môn học trong trường",
              speechText: "Subject",
              colorHex: "#3b82f6",
              icon: "📖",
              sentence: "We learn many interesting subjects.",
              sentenceVi: "Chúng mình học nhiều môn học rất thú vị.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u8_3",
              word: "TEACHER",
              phonetic: "/ˈtiː.tʃər/",
              meaning: "Thầy giáo, cô giáo",
              speechText: "Teacher",
              colorHex: "#10b981",
              icon: "👩‍🏫",
              sentence: "Our English teacher is dedicated.",
              sentenceVi: "Cô giáo tiếng Anh của chúng mình rất tận tụy.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u8_4",
              word: "LEARN",
              phonetic: "/lɜːn/",
              meaning: "Học tập, tiếp thu tri thức",
              speechText: "Learn",
              colorHex: "#f59e0b",
              icon: "🧠",
              sentence: "We learn useful things every day.",
              sentenceVi: "Chúng mình học được nhiều điều bổ ích mỗi ngày.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u8_s1",
              structure: "What's your favourite subject? - It's [Subject].",
              meaning: "Hỏi và trả lời về môn học yêu thích của bạn",
              example: "What's your favourite subject? - It's English.",
              exampleVi: "Môn học yêu thích của bạn là gì? - Là môn Tiếng Anh.",
              speechText: "What's your favourite subject? It's English.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u8_s2",
              structure: "What's his / her favourite subject? - It's Science.",
              meaning: "Hỏi môn học bạn khác yêu thích",
              example: "What's her favourite subject? - It's Science.",
              exampleVi: "Môn học yêu thích của bạn ấy là gì? - Là môn Khoa học.",
              speechText: "What's her favourite subject? It's Science.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Giải thích lý do yêu thích môn học (Why do you like...?)",
          vocabulary: [
            {
              id: "g4_u8_5",
              word: "BECAUSE",
              phonetic: "/bɪˈkɒz/",
              meaning: "Bởi vì, do vì",
              speechText: "Because",
              colorHex: "#8b5cf6",
              icon: "💬",
              sentence: "I love Art because it inspires me.",
              sentenceVi: "Mình yêu Mỹ thuật bởi vì môn học truyền cảm hứng cho mình.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u8_6",
              word: "SING SONGS",
              phonetic: "/sɪŋ sɒŋz/",
              meaning: "Hát các khúc ca vui nhộn",
              speechText: "Sing songs",
              colorHex: "#10b981",
              icon: "🎤",
              sentence: "I want to sing English songs.",
              sentenceVi: "Mình muốn hát những bài hát tiếng Anh vui tươi.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u8_7",
              word: "DRAW PICTURES",
              phonetic: "/drɔː ˈpɪk.tʃəz/",
              meaning: "Vẽ những bức tranh đẹp",
              speechText: "Draw pictures",
              colorHex: "#f97316",
              icon: "🖼️",
              sentence: "I like to draw nature pictures.",
              sentenceVi: "Mình thích vẽ tranh thiên nhiên cây cỏ.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u8_8",
              word: "READ STORIES",
              phonetic: "/riːd ˈstɔː.riz/",
              meaning: "Đọc những mẩu chuyện hay",
              speechText: "Read stories",
              colorHex: "#06b6d4",
              icon: "📚",
              sentence: "I love to read fairy stories.",
              sentenceVi: "Mình thích đọc những câu chuyện cổ tích.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u8_s3",
              structure: "Why do you like [Subject]? - Because I want to [activity].",
              meaning: "Hỏi và đáp lý do yêu thích môn học",
              example: "Why do you like English? - Because I want to sing English songs.",
              exampleVi: "Tại sao bạn thích môn Tiếng Anh? - Vì mình muốn hát các bài hát tiếng Anh.",
              speechText: "Why do you like English? Because I want to sing English songs.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u8_s4",
              structure: "Why do you like Art? - Because I want to draw pictures.",
              meaning: "Nêu lý do đam mê hội họa",
              example: "Why do you like Art? - Because I want to draw pictures.",
              exampleVi: "Tại sao bạn thích môn Mỹ thuật? - Vì mình muốn vẽ tranh.",
              speechText: "Why do you like Art? Because I want to draw pictures.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Interests)",
          theme: "Luyện âm /f/, /w/ & Ươm mầm ước mơ qua từng môn học",
          vocabulary: [
            {
              id: "g4_u8_9",
              word: "DISCOVER",
              phonetic: "/dɪˈskʌv.ər/",
              meaning: "Khám phá thế giới diệu kỳ",
              speechText: "Discover",
              colorHex: "#0284c7",
              icon: "🔭",
              sentence: "We discover mysteries of nature in Science.",
              sentenceVi: "Chúng mình khám phá bí ẩn thiên nhiên trong môn Khoa học.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u8_10",
              word: "FUTURE",
              phonetic: "/ˈfjuː.tʃər/",
              meaning: "Tương lai tươi sáng",
              speechText: "Future",
              colorHex: "#16a34a",
              icon: "🌱",
              sentence: "Study well for a bright green future.",
              sentenceVi: "Học tập tốt cho một tương lai xanh tươi sáng.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u8_s5",
              structure: "I study my favourite subjects to explore the wonderful world.",
              meaning: "Định hướng niềm vui học tập tích cực",
              example: "I study my favourite subjects to explore the wonderful world.",
              exampleVi: "Em học các môn học yêu thích để khám phá thế giới tuyệt vời xung quanh.",
              speechText: "I study my favourite subjects to explore the wonderful world.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 9: OUR SPORTS DAY
    {
      unitNumber: 9,
      unitKey: "unit_9",
      unitName: "Our sports day",
      unitFullName: "Unit 9: Our sports day",
      theme: "Sports Day, Events & Months (Ngày hội thể thao & Sự kiện trong năm)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi thời gian diễn ra ngày hội thể thao (When is sports day?)",
          vocabulary: [
            {
              id: "g4_u9_1",
              word: "SPORTS DAY",
              phonetic: "/spɔːts deɪ/",
              meaning: "Ngày hội thể thao trường em",
              speechText: "Sports day",
              colorHex: "#ef4444",
              icon: "🏆",
              sentence: "Our school sports day is coming soon.",
              sentenceVi: "Ngày hội thể thao trường mình sắp diễn ra.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u9_2",
              word: "TEACHERS' DAY",
              phonetic: "/ˈtiː.tʃəz deɪ/",
              meaning: "Ngày Nhà giáo Việt Nam (20/11)",
              speechText: "Teachers' Day",
              colorHex: "#f59e0b",
              icon: "💐",
              sentence: "Teachers' Day is in November.",
              sentenceVi: "Ngày Nhà giáo Việt Nam vào Tháng Mười Một.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u9_3",
              word: "CHILDREN'S DAY",
              phonetic: "/ˈtʃɪl.drənz deɪ/",
              meaning: "Ngày Quốc tế Thiếu nhi (1/6)",
              speechText: "Children's Day",
              colorHex: "#10b981",
              icon: "🎈",
              sentence: "Children's Day is on June first.",
              sentenceVi: "Ngày Quốc tế Thiếu nhi vào ngày mùng một Tháng Sáu.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u9_4",
              word: "OCTOBER",
              phonetic: "/ɒkˈtəʊ.bər/",
              meaning: "Tháng Mười",
              speechText: "October",
              colorHex: "#3b82f6",
              icon: "🍁",
              sentence: "Sports day is in October.",
              sentenceVi: "Ngày hội thể thao diễn ra vào Tháng Mười.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u9_s1",
              structure: "When is sports day? - It's in [Month].",
              meaning: "Hỏi và đáp thời gian tổ chức ngày hội thể thao",
              example: "When is sports day? - It's in October.",
              exampleVi: "Khi nào diễn ra ngày hội thể thao? - Vào Tháng Mười.",
              speechText: "When is sports day? It's in October.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u9_s2",
              structure: "When is Teachers' Day? - It's in November.",
              meaning: "Hỏi ngày kỷ niệm tri ân thầy cô",
              example: "When is Teachers' Day? - It's in November.",
              exampleVi: "Khi nào là ngày Nhà giáo? - Vào Tháng Mười Một.",
              speechText: "When is Teachers' Day? It's in November.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Dự định tham gia các môn thể thao (What are you going to play?)",
          vocabulary: [
            {
              id: "g4_u9_5",
              word: "TABLE TENNIS",
              phonetic: "/ˈteɪ.bəl ˌten.ɪs/",
              meaning: "Môn bóng bàn",
              speechText: "Table tennis",
              colorHex: "#10b981",
              icon: "🏓",
              sentence: "I play table tennis with Phong.",
              sentenceVi: "Mình chơi bóng bàn cùng với Phong.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u9_6",
              word: "BASKETBALL",
              phonetic: "/ˈbɑː.skɪt.bɔːl/",
              meaning: "Môn bóng rổ",
              speechText: "Basketball",
              colorHex: "#f97316",
              icon: "🏀",
              sentence: "He shoots hoops in basketball.",
              sentenceVi: "Cậu ấy ném bóng vào rổ môn bóng rổ.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u9_7",
              word: "FOOTBALL",
              phonetic: "/ˈfʊt.bɔːl/",
              meaning: "Môn bóng đá vua",
              speechText: "Football",
              colorHex: "#16a34a",
              icon: "⚽",
              sentence: "We participate in the football match.",
              sentenceVi: "Chúng mình tham gia trận đấu bóng đá.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u9_8",
              word: "BADMINTON",
              phonetic: "/ˈbæd.mɪn.tən/",
              meaning: "Môn cầu lông",
              speechText: "Badminton",
              colorHex: "#06b6d4",
              icon: "🏸",
              sentence: "They practice badminton enthusiastically.",
              sentenceVi: "Họ hào hứng tập luyện cầu lông.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u9_s3",
              structure: "What are you going to play on sports day? - I'm going to play [Sport].",
              meaning: "Hỏi và đáp dự định môn thể thao sẽ thi đấu",
              example: "What are you going to play on sports day? - I'm going to play football.",
              exampleVi: "Bạn dự định chơi môn gì vào ngày hội thể thao? - Mình dự định chơi bóng đá.",
              speechText: "What are you going to play on sports day? I'm going to play football.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u9_s4",
              structure: "What is she going to play? - She's going to play table tennis.",
              meaning: "Hỏi dự định thi đấu thể thao của bạn",
              example: "What is she going to play? - She's going to play table tennis.",
              exampleVi: "Bạn ấy sẽ chơi môn gì? - Bạn ấy sẽ chơi bóng bàn.",
              speechText: "What is she going to play? She's going to play table tennis.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Spirit)",
          theme: "Luyện âm /sp/, /st/ & Tinh thần thể thao rèn luyện sức khỏe",
          vocabulary: [
            {
              id: "g4_u9_9",
              word: "MEDAL",
              phonetic: "/ˈmed.əl/",
              meaning: "Huy chương thi đấu",
              speechText: "Medal",
              colorHex: "#eab308",
              icon: "🥇",
              sentence: "The champions receive gold medals.",
              sentenceVi: "Những nhà vô địch nhận huy chương vàng rạng rỡ.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u9_10",
              word: "CHEER",
              phonetic: "/tʃɪər/",
              meaning: "Cổ vũ nồng nhiệt",
              speechText: "Cheer",
              colorHex: "#ec4899",
              icon: "📣",
              sentence: "We cheer loudly for our classmates.",
              sentenceVi: "Chúng mình reo hò cổ vũ nhiệt tình cho các bạn.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u9_s5",
              structure: "Sports day fosters physical health and sportsmanship.",
              meaning: "Tinh thần thể thao đoàn kết và rèn luyện thể chất",
              example: "Sports day fosters physical health and sportsmanship.",
              exampleVi: "Ngày hội thể thao nâng cao sức khỏe và tinh thần đồng đội cao thượng.",
              speechText: "Sports day fosters physical health and sportsmanship.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 10: WHERE WERE YOU YESTERDAY?
    {
      unitNumber: 10,
      unitKey: "unit_10",
      unitName: "Where were you yesterday?",
      unitFullName: "Unit 10: Where were you yesterday?",
      theme: "Past Locations & Memories (Địa điểm trong quá khứ - Thì quá khứ đơn)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và đáp bạn ở đâu ngày hôm qua (Where were you yesterday?)",
          vocabulary: [
            {
              id: "g4_u10_1",
              word: "YESTERDAY",
              phonetic: "/ˈjes.tə.deɪ/",
              meaning: "Ngày hôm qua",
              speechText: "Yesterday",
              colorHex: "#f59e0b",
              icon: "⏮️",
              sentence: "Where were you yesterday morning?",
              sentenceVi: "Hôm qua bạn ở đâu thế?",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u10_2",
              word: "AT HOME",
              phonetic: "/æt həʊm/",
              meaning: "Ở tại nhà",
              speechText: "At home",
              colorHex: "#3b82f6",
              icon: "🏡",
              sentence: "I was at home with my grandmother.",
              sentenceVi: "Mình ở nhà cùng với bà.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u10_3",
              word: "AT SCHOOL",
              phonetic: "/æt skuːl/",
              meaning: "Ở trường học",
              speechText: "At school",
              colorHex: "#10b981",
              icon: "🏫",
              sentence: "We were at school yesterday.",
              sentenceVi: "Hôm qua chúng mình ở trường học tập.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u10_4",
              word: "AT THE ZOO",
              phonetic: "/æt ðə zuː/",
              meaning: "Ở vườn bách thú (sở thú)",
              speechText: "At the zoo",
              colorHex: "#f97316",
              icon: "🦁",
              sentence: "He was at the zoo looking at animals.",
              sentenceVi: "Hôm qua bạn ấy ở sở thú ngắm muông thú.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u10_s1",
              structure: "Where were you yesterday? - I was [at location].",
              meaning: "Hỏi và trả lời nơi bạn đã ở vào ngày hôm qua",
              example: "Where were you yesterday? - I was at home.",
              exampleVi: "Hôm qua bạn đã ở đâu? - Hôm qua mình ở nhà.",
              speechText: "Where were you yesterday? I was at home.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u10_s2",
              structure: "Where were you yesterday morning? - I was at school.",
              meaning: "Hỏi cụ thể buổi sáng hôm qua ở đâu",
              example: "Where were you yesterday morning? - I was at school.",
              exampleVi: "Sáng hôm qua bạn ở đâu? - Mình ở trường học.",
              speechText: "Where were you yesterday morning? I was at school.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Hỏi địa điểm người khác đã ở hôm qua (Where was he/she...?)",
          vocabulary: [
            {
              id: "g4_u10_5",
              word: "ON THE BEACH",
              phonetic: "/ɒn ðə biːtʃ/",
              meaning: "Ở trên bãi biển",
              speechText: "On the beach",
              colorHex: "#06b6d4",
              icon: "🏖️",
              sentence: "They were on the sunny beach.",
              sentenceVi: "Họ đã ở trên bãi biển đầy nắng vàng.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u10_6",
              word: "IN THE COUNTRYSIDE",
              phonetic: "/ɪn ðə ˈkʌn.tri.saɪd/",
              meaning: "Ở vùng nông thôn, vùng quê",
              speechText: "In the countryside",
              colorHex: "#16a34a",
              icon: "🌾",
              sentence: "She was in the green countryside.",
              sentenceVi: "Bạn ấy đã về vùng quê thanh bình xanh tươi.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u10_7",
              word: "IN THE PARK",
              phonetic: "/ɪn ðə pɑːk/",
              meaning: "Ở trong công viên",
              speechText: "In the park",
              colorHex: "#10b981",
              icon: "🌳",
              sentence: "We were in the park cycling.",
              sentenceVi: "Chúng mình đã ở công viên đạp xe ngắm cảnh.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u10_8",
              word: "IN THE GARDEN",
              phonetic: "/ɪn ðə ˈɡɑː.dən/",
              meaning: "Ở trong vườn cây",
              speechText: "In the garden",
              colorHex: "#84cc16",
              icon: "🌻",
              sentence: "Grandfather was in the vegetable garden.",
              sentenceVi: "Ông đã ở trong vườn rau chăm sóc luống cà chua.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u10_s3",
              structure: "Where was he / she yesterday? - He / She was [location].",
              meaning: "Hỏi và đáp vị trí của người khác trong ngày hôm qua",
              example: "Where was he yesterday? - He was on the beach.",
              exampleVi: "Hôm qua cậu ấy ở đâu? - Cậu ấy ở bãi biển.",
              speechText: "Where was he yesterday? He was on the beach.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u10_s4",
              structure: "Where was she yesterday? - She was in the countryside.",
              meaning: "Hỏi bạn nữ hôm qua đã ở đâu",
              example: "Where was she yesterday? - She was in the countryside.",
              exampleVi: "Hôm qua bạn ấy ở đâu? - Bạn ấy ở vùng quê.",
              speechText: "Where was she yesterday? She was in the countryside.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Memories)",
          theme: "Luyện âm /wɜːr/, /wɒz/ & Kỷ niệm đẹp bên gia đình",
          vocabulary: [
            {
              id: "g4_u10_9",
              word: "MEMORY",
              phonetic: "/ˈmem.ər.i/",
              meaning: "Kỷ niệm êm đềm",
              speechText: "Memory",
              colorHex: "#ec4899",
              icon: "💭",
              sentence: "We had wonderful memories yesterday.",
              sentenceVi: "Chúng mình đã có những kỷ niệm tuyệt vời vào hôm qua.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u10_10",
              word: "RELAX",
              phonetic: "/rɪˈlæks/",
              meaning: "Nghỉ ngơi, thư thái",
              speechText: "Relax",
              colorHex: "#10b981",
              icon: "🍃",
              sentence: "I was relaxing under fresh trees.",
              sentenceVi: "Mình đã thư giãn dưới bóng mát cây xanh.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u10_s5",
              structure: "Yesterday was peaceful and I was happy with my family.",
              meaning: "Ghi nhớ khoảnh khắc đầm ấm bên người thân",
              example: "Yesterday was peaceful and I was happy with my family.",
              exampleVi: "Hôm qua thật thanh bình và em rất vui vẻ bên gia đình.",
              speechText: "Yesterday was peaceful and I was happy with my family.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 11: MY HOME
    {
      unitNumber: 11,
      unitKey: "unit_11",
      unitName: "My home",
      unitFullName: "Unit 11: My home",
      theme: "Addresses, Homes & Living Environments (Địa chỉ, nhà ở & Môi trường sống)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và đáp về nơi ở & địa chỉ (Where do you live? / What's your address?)",
          vocabulary: [
            {
              id: "g4_u11_1",
              word: "ADDRESS",
              phonetic: "/əˈdres/",
              meaning: "Địa chỉ nơi cư trú",
              speechText: "Address",
              colorHex: "#3b82f6",
              icon: "📍",
              sentence: "What is your home address?",
              sentenceVi: "Địa chỉ nhà của bạn là gì?",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u11_2",
              word: "STREET",
              phonetic: "/striːt/",
              meaning: "Đường phố",
              speechText: "Street",
              colorHex: "#10b981",
              icon: "🛣️",
              sentence: "I live on Hoa Binh Street.",
              sentenceVi: "Mình sống trên phố Hòa Bình.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u11_3",
              word: "ROAD",
              phonetic: "/rəʊd/",
              meaning: "Con đường rợp bóng cây",
              speechText: "Road",
              colorHex: "#f59e0b",
              icon: "🛤️",
              sentence: "The road is lined with green trees.",
              sentenceVi: "Con đường rợp bóng cây xanh mát.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u11_4",
              word: "LANE",
              phonetic: "/leɪn/",
              meaning: "Ngõ nhỏ, con hẻm yên tĩnh",
              speechText: "Lane",
              colorHex: "#8b5cf6",
              icon: "🏡",
              sentence: "She lives in a quiet lane.",
              sentenceVi: "Bạn ấy sống trong một con ngõ yên tĩnh.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u11_s1",
              structure: "Where do you live? - I live in/at [Place].",
              meaning: "Hỏi và trả lời bạn đang sinh sống ở đâu",
              example: "Where do you live? - I live in Hanoi.",
              exampleVi: "Bạn sống ở đâu? - Mình sống ở Hà Nội.",
              speechText: "Where do you live? I live in Hanoi.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u11_s2",
              structure: "What's your address? - It's [Number, Street].",
              meaning: "Hỏi cụ thể địa chỉ số nhà và tên đường",
              example: "What's your address? - It's 54 Green Street.",
              exampleVi: "Địa chỉ của bạn là gì? - Số 54 phố Cây Xanh.",
              speechText: "What's your address? It's 54 Green Street.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Các kiểu nhà ở & Miêu tả ngôi nhà (What's your house like?)",
          vocabulary: [
            {
              id: "g4_u11_5",
              word: "FLAT",
              phonetic: "/flæt/",
              meaning: "Căn hộ chung cư",
              speechText: "Flat",
              colorHex: "#06b6d4",
              icon: "🏢",
              sentence: "We live in a modern flat.",
              sentenceVi: "Gia đình mình sống trong một căn hộ hiện đại.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u11_6",
              word: "TOWER",
              phonetic: "/ˈtaʊ.ər/",
              meaning: "Tòa tháp cao ốc",
              speechText: "Tower",
              colorHex: "#64748b",
              icon: "🏙️",
              sentence: "He lives in Green Tower.",
              sentenceVi: "Bạn ấy sống ở tòa tháp Green Tower.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u11_7",
              word: "CITY",
              phonetic: "/ˈsɪt.i/",
              meaning: "Thành phố nhộn nhịp",
              speechText: "City",
              colorHex: "#ec4899",
              icon: "🌆",
              sentence: "Da Nang is a green coastal city.",
              sentenceVi: "Đà Nẵng là một thành phố biển xanh sạch đẹp.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u11_8",
              word: "VILLAGE",
              phonetic: "/ˈvɪl.ɪdʒ/",
              meaning: "Ngôi làng, thôn xóm yên ả",
              speechText: "Village",
              colorHex: "#16a34a",
              icon: "🛖",
              sentence: "My grandparents live in a peaceful village.",
              sentenceVi: "Ông bà mình sống ở một ngôi làng yên bình.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u11_s3",
              structure: "What's your house like? - It's [adjectives].",
              meaning: "Hỏi và miêu tả đặc điểm ngôi nhà",
              example: "What's your house like? - It's small and cozy.",
              exampleVi: "Ngôi nhà của bạn trông như thế nào? - Nhà nhỏ nhắn và ấm cúng.",
              speechText: "What's your house like? It's small and cozy.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u11_s4",
              structure: "What's your flat like? - It's big and bright.",
              meaning: "Miêu tả căn hộ chung cư",
              example: "What's your flat like? - It's big and bright.",
              exampleVi: "Căn hộ của bạn như thế nào? - Nó rộng rãi và tràn ngập ánh sáng.",
              speechText: "What's your flat like? It's big and bright.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Community)",
          theme: "Luyện âm /str/, /fl/ & Tình yêu quê hương chòm xóm",
          vocabulary: [
            {
              id: "g4_u11_9",
              word: "HOMETOWN",
              phonetic: "/ˈhəʊm.taʊn/",
              meaning: "Quê hương nguồn cội",
              speechText: "Hometown",
              colorHex: "#10b981",
              icon: "🌾",
              sentence: "My hometown has green paddy fields.",
              sentenceVi: "Quê hương mình có những cánh đồng lúa xanh ngát.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u11_10",
              word: "PEACEFUL",
              phonetic: "/ˈpiːs.fəl/",
              meaning: "Thanh bình, êm ả",
              speechText: "Peaceful",
              colorHex: "#0284c7",
              icon: "🕊️",
              sentence: "The countryside village is very peaceful.",
              sentenceVi: "Ngôi làng quê rất đỗi thanh bình.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u11_s5",
              structure: "I love my home and my green friendly neighbourhood.",
              meaning: "Tình cảm gắn bó với quê hương nơi sinh sống",
              example: "I love my home and my green friendly neighbourhood.",
              exampleVi: "Em yêu ngôi nhà và khu xóm xanh tươi, thân thiện của em.",
              speechText: "I love my home and my green friendly neighbourhood.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 12: JOBS
    {
      unitNumber: 12,
      unitKey: "unit_12",
      unitName: "Jobs",
      unitFullName: "Unit 12: Jobs",
      theme: "Professions & Workplaces (Nghề nghiệp & Nơi làm việc)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và đáp nghề nghiệp của người thân (What does your father/mother do?)",
          vocabulary: [
            {
              id: "g4_u12_1",
              word: "PILOT",
              phonetic: "/ˈpaɪ.lət/",
              meaning: "Phi công lái máy bay",
              speechText: "Pilot",
              colorHex: "#3b82f6",
              icon: "👨‍✈️",
              sentence: "His uncle is a talented pilot.",
              sentenceVi: "Chú của bạn ấy là một phi công tài ba.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u12_2",
              word: "ENGINEER",
              phonetic: "/ˌen.dʒɪˈnɪər/",
              meaning: "Kỹ sư",
              speechText: "Engineer",
              colorHex: "#f59e0b",
              icon: "👷",
              sentence: "My father is a civil engineer.",
              sentenceVi: "Bố mình là một kỹ sư xây dựng.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u12_3",
              word: "POLICE OFFICER",
              phonetic: "/pəˈliːs ˌɒf.ɪ.sər/",
              meaning: "Sĩ quan công an, cảnh sát",
              speechText: "Police officer",
              colorHex: "#10b981",
              icon: "👮",
              sentence: "The police officer helps keep people safe.",
              sentenceVi: "Chú cảnh sát giữ gìn trật tự và an toàn cho người dân.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u12_4",
              word: "FIREFIGHTER",
              phonetic: "/ˈfaɪəˌfaɪ.tər/",
              meaning: "Chiến sĩ cảnh sát cứu hỏa",
              speechText: "Firefighter",
              colorHex: "#ef4444",
              icon: "🧑‍🚒",
              sentence: "The brave firefighter puts out fires.",
              sentenceVi: "Người lính cứu hỏa dũng cảm dập tắt đám cháy.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u12_s1",
              structure: "What does your father/mother do? - He's/She's a/an [Job].",
              meaning: "Hỏi nghề nghiệp của cha mẹ",
              example: "What does your father do? - He's an engineer.",
              exampleVi: "Bố của bạn làm nghề gì? - Bác ấy là kỹ sư.",
              speechText: "What does your father do? He's an engineer.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u12_s2",
              structure: "What does your mother do? - She's a pilot.",
              meaning: "Hỏi nghề nghiệp của mẹ",
              example: "What does your mother do? - She's a pilot.",
              exampleVi: "Mẹ của bạn làm nghề gì? - Cô ấy là phi công.",
              speechText: "What does your mother do? She's a pilot.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Nơi làm việc của các ngành nghề (Where does he/she work?)",
          vocabulary: [
            {
              id: "g4_u12_5",
              word: "HOSPITAL",
              phonetic: "/ˈhɒs.pɪ.təl/",
              meaning: "Bệnh viện đa khoa",
              speechText: "Hospital",
              colorHex: "#ef4444",
              icon: "🏥",
              sentence: "Doctors and nurses work in a hospital.",
              sentenceVi: "Bác sĩ và y tá làm việc trong bệnh viện.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u12_6",
              word: "AIRPORT",
              phonetic: "/ˈeə.pɔːt/",
              meaning: "Sân bay hàng không",
              speechText: "Airport",
              colorHex: "#06b6d4",
              icon: "🛫",
              sentence: "Pilots work at the international airport.",
              sentenceVi: "Các phi công làm việc tại sân bay quốc tế.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u12_7",
              word: "POLICE STATION",
              phonetic: "/pəˈliːs ˌsteɪ.ʃən/",
              meaning: "Đồn công an, trạm cảnh sát",
              speechText: "Police station",
              colorHex: "#3b82f6",
              icon: "🏢",
              sentence: "He works at the central police station.",
              sentenceVi: "Chú ấy làm việc tại đồn cảnh sát trung tâm.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u12_8",
              word: "FACTORY",
              phonetic: "/ˈfæk.tər.i/",
              meaning: "Nhà máy, xí nghiệp sản xuất",
              speechText: "Factory",
              colorHex: "#64748b",
              icon: "🏭",
              sentence: "Workers produce goods in a factory.",
              sentenceVi: "Công nhân sản xuất hàng hóa trong nhà máy.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u12_s3",
              structure: "Where does he / she work? - He / She works in / at a [Place].",
              meaning: "Hỏi và đáp nơi làm việc của một người",
              example: "Where does he work? - He works in a hospital.",
              exampleVi: "Chú ấy làm việc ở đâu? - Chú ấy làm việc ở bệnh viện.",
              speechText: "Where does he work? He works in a hospital.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u12_s4",
              structure: "Where does she work? - She works at an airport.",
              meaning: "Hỏi nơi công tác của nữ phi công",
              example: "Where does she work? - She works at an airport.",
              exampleVi: "Cô ấy làm việc ở đâu? - Cô ấy làm việc ở sân bay.",
              speechText: "Where does she work? She works at an airport.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Dreams)",
          theme: "Luyện âm /dʒ/, /ʃ/ & Ước mơ nghề nghiệp tương lai",
          vocabulary: [
            {
              id: "g4_u12_9",
              word: "WORK",
              phonetic: "/wɜːk/",
              meaning: "Lao động, làm việc cống hiến",
              speechText: "Work",
              colorHex: "#10b981",
              icon: "💼",
              sentence: "Everyone works hard for our society.",
              sentenceVi: "Mọi người đều lao động chăm chỉ vì xã hội.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u12_10",
              word: "DREAM",
              phonetic: "/driːm/",
              meaning: "Ước mơ, hoài bão",
              speechText: "Dream",
              colorHex: "#8b5cf6",
              icon: "✨",
              sentence: "I dream of becoming a green doctor in the future.",
              sentenceVi: "Em mơ ước tương lai trở thành một bác sĩ giỏi.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u12_s5",
              structure: "Every job is important and contributes to our green community.",
              meaning: "Tôn trọng mọi ngành nghề lao động chân chính",
              example: "Every job is important and contributes to our green community.",
              exampleVi: "Mỗi công việc đều quan trọng và đóng góp cho cộng đồng xanh của chúng ta.",
              speechText: "Every job is important and contributes to our green community.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 13: APPEARANCE
    {
      unitNumber: 13,
      unitKey: "unit_13",
      unitName: "Appearance",
      unitFullName: "Unit 13: Appearance",
      theme: "Physical Descriptions & Comparisons (Miêu tả ngoại hình & So sánh)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Miêu tả vóc dáng ngoại hình (What does he/she look like?)",
          vocabulary: [
            {
              id: "g4_u13_1",
              word: "TALL",
              phonetic: "/tɔːl/",
              meaning: "Cao ráo",
              speechText: "Tall",
              colorHex: "#3b82f6",
              icon: "🦒",
              sentence: "He is tall and athletic.",
              sentenceVi: "Cậu ấy cao ráo và khỏe khoắn.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u13_2",
              word: "SHORT",
              phonetic: "/ʃɔːt/",
              meaning: "Thấp bé, nhỏ nhắn",
              speechText: "Short",
              colorHex: "#f59e0b",
              icon: "🐧",
              sentence: "The puppy is short and cute.",
              sentenceVi: "Chú cún con thấp bé và đáng yêu.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u13_3",
              word: "SLIM",
              phonetic: "/slɪm/",
              meaning: "Thon thả, mảnh khảnh",
              speechText: "Slim",
              colorHex: "#10b981",
              icon: "🩰",
              sentence: "My sister is slim and graceful.",
              sentenceVi: "Chị gái mình thon thả và duyên dáng.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u13_4",
              word: "STRONG",
              phonetic: "/strɒŋ/",
              meaning: "Khỏe khoắn, mạnh mẽ",
              speechText: "Strong",
              colorHex: "#ef4444",
              icon: "💪",
              sentence: "Athletes are very strong.",
              sentenceVi: "Các vận động viên thể thao rất khỏe mạnh.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u13_s1",
              structure: "What does he / she look like? - He / She is [adjective].",
              meaning: "Hỏi và miêu tả diện mạo của một người",
              example: "What does he look like? - He's tall and slim.",
              exampleVi: "Cậu ấy trông như thế nào? - Cậu ấy cao ráo và thon thả.",
              speechText: "What does he look like? He's tall and slim.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u13_s2",
              structure: "What does she look like? - She's short and cute.",
              meaning: "Miêu tả bạn nữ thấp bé dễ thương",
              example: "What does she look like? - She's short and cute.",
              exampleVi: "Cô ấy trông như thế nào? - Cô ấy nhỏ nhắn và dễ thương.",
              speechText: "What does she look like? She's short and cute.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "So sánh hơn về ngoại hình (Who is taller/stronger...?)",
          vocabulary: [
            {
              id: "g4_u13_5",
              word: "PLUMP",
              phonetic: "/plʌmp/",
              meaning: "Mũm mĩm, bầu bĩnh",
              speechText: "Plump",
              colorHex: "#ec4899",
              icon: "🐼",
              sentence: "The baby has plump cheeks.",
              sentenceVi: "Em bé có đôi má bầu bĩnh đáng yêu.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u13_6",
              word: "BIGGER",
              phonetic: "/ˈbɪɡ.ər/",
              meaning: "To lớn hơn",
              speechText: "Bigger",
              colorHex: "#64748b",
              icon: "🐘",
              sentence: "The elephant is bigger than the horse.",
              sentenceVi: "Con voi to lớn hơn con ngựa.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u13_7",
              word: "SHORTER",
              phonetic: "/ˈʃɔː.tər/",
              meaning: "Thấp hơn",
              speechText: "Shorter",
              colorHex: "#f97316",
              icon: "📐",
              sentence: "Nam is shorter than Ba.",
              sentenceVi: "Nam thấp hơn Ba.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u13_8",
              word: "OLDER",
              phonetic: "/ˈəʊl.dər/",
              meaning: "Lớn tuổi hơn",
              speechText: "Older",
              colorHex: "#8b5cf6",
              icon: "👴",
              sentence: "My brother is two years older than me.",
              sentenceVi: "Anh trai mình lớn hơn mình hai tuổi.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u13_s3",
              structure: "Who is [comparative]? - [Person] is [comparative] than [Person].",
              meaning: "Hỏi và so sánh ai cao hơn hoặc khỏe hơn",
              example: "Who is taller? - Ba is taller than Nam.",
              exampleVi: "Ai cao hơn? - Ba cao hơn Nam.",
              speechText: "Who is taller? Ba is taller than Nam.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u13_s4",
              structure: "Who is stronger? - My father is stronger than my brother.",
              meaning: "So sánh ai khỏe hơn",
              example: "Who is stronger? - My father is stronger than my brother.",
              exampleVi: "Ai khỏe hơn? - Bố khỏe hơn anh trai mình.",
              speechText: "Who is stronger? My father is stronger than my brother.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Respect)",
          theme: "Luyện âm /sl/, /str/ & Tôn trọng vẻ đẹp riêng biệt của mỗi người",
          vocabulary: [
            {
              id: "g4_u13_9",
              word: "SMILE",
              phonetic: "/smaɪl/",
              meaning: "Nụ cười rạng rỡ",
              speechText: "Smile",
              colorHex: "#eab308",
              icon: "😊",
              sentence: "A friendly smile makes everyone happy.",
              sentenceVi: "Một nụ cười thân thiện mang lại niềm vui cho mọi người.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u13_10",
              word: "APPEARANCE",
              phonetic: "/əˈpɪə.rəns/",
              meaning: "Ngoại hình, diện mạo",
              speechText: "Appearance",
              colorHex: "#10b981",
              icon: "✨",
              sentence: "Respect everyone regardless of appearance.",
              sentenceVi: "Tôn trọng mọi người bất kể ngoại hình.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u13_s5",
              structure: "We appreciate everyone's unique and friendly appearance.",
              meaning: "Giáo dục lòng nhân ái và tôn trọng sự khác biệt",
              example: "We appreciate everyone's unique and friendly appearance.",
              exampleVi: "Chúng em trân trọng vẻ ngoài độc đáo và tính cách thân thiện của mỗi người.",
              speechText: "We appreciate everyone's unique and friendly appearance.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 14: DAILY ACTIVITIES
    {
      unitNumber: 14,
      unitKey: "unit_14",
      unitName: "Daily activities",
      unitFullName: "Unit 14: Daily activities",
      theme: "Present Continuous & Household Chores (Hiện tại tiếp diễn & Việc nhà)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và đáp về việc nhà đang làm (What are you doing?)",
          vocabulary: [
            {
              id: "g4_u14_1",
              word: "WASHING THE DISHES",
              phonetic: "/ˈwɒʃ.ɪŋ ðə dɪʃ.ɪz/",
              meaning: "Đang rửa chén bát",
              speechText: "Washing the dishes",
              colorHex: "#06b6d4",
              icon: "🍽️",
              sentence: "I am washing the dishes after dinner.",
              sentenceVi: "Mình đang rửa bát đĩa sau bữa tối.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u14_2",
              word: "CLEANING THE FLOOR",
              phonetic: "/ˈkliːn.ɪŋ ðə flɔːr/",
              meaning: "Đang lau dọn sàn nhà",
              speechText: "Cleaning the floor",
              colorHex: "#3b82f6",
              icon: "🧹",
              sentence: "He is cleaning the floor cleanly.",
              sentenceVi: "Cậu ấy đang lau sàn nhà sạch bóng.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u14_3",
              word: "COOKING",
              phonetic: "/ˈkʊk.ɪŋ/",
              meaning: "Đang nấu nướng món ăn",
              speechText: "Cooking",
              colorHex: "#f97316",
              icon: "🍲",
              sentence: "Mother is cooking soup in the kitchen.",
              sentenceVi: "Mẹ đang nấu canh thơm ngon trong bếp.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u14_4",
              word: "WATERING PLANTS",
              phonetic: "/ˈwɔː.tər.ɪŋ plɑːnts/",
              meaning: "Đang tưới cây cảnh xanh tươi",
              speechText: "Watering plants",
              colorHex: "#10b981",
              icon: "🪴",
              sentence: "I am watering green plants on the balcony.",
              sentenceVi: "Mình đang tưới cây xanh ngoài ban công.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u14_s1",
              structure: "What are you doing? - I'm [action-ing].",
              meaning: "Hỏi và trả lời bản thân đang làm gì ở hiện tại",
              example: "What are you doing? - I'm washing the dishes.",
              exampleVi: "Bạn đang làm gì thế? - Mình đang rửa bát đĩa.",
              speechText: "What are you doing? I'm washing the dishes.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u14_s2",
              structure: "What are you doing? - I'm watering the green plants.",
              meaning: "Nói về việc đang tưới cây chăm sóc thiên nhiên",
              example: "What are you doing? - I'm watering the green plants.",
              exampleVi: "Bạn đang làm gì thế? - Mình đang tưới cây xanh trong vườn.",
              speechText: "What are you doing? I'm watering the green plants.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Hỏi người khác đang làm gì (What is he/she doing?)",
          vocabulary: [
            {
              id: "g4_u14_5",
              word: "WATCHING TV",
              phonetic: "/ˈwɒtʃ.ɪŋ ˌtiːˈviː/",
              meaning: "Đang xem chương trình truyền hình",
              speechText: "Watching TV",
              colorHex: "#8b5cf6",
              icon: "📺",
              sentence: "They are watching TV in the living room.",
              sentenceVi: "Họ đang xem truyền hình ở phòng khách.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u14_6",
              word: "LISTENING TO MUSIC",
              phonetic: "/ˈlɪs.ən.ɪŋ tuː ˈmjuː.zɪk/",
              meaning: "Đang nghe nhạc thư giãn",
              speechText: "Listening to music",
              colorHex: "#ec4899",
              icon: "🎧",
              sentence: "She is listening to cheerful music.",
              sentenceVi: "Cô ấy đang nghe giai điệu nhạc vui tươi.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u14_7",
              word: "READING A BOOK",
              phonetic: "/ˈriːd.ɪŋ ə bʊk/",
              meaning: "Đang đọc sách",
              speechText: "Reading a book",
              colorHex: "#10b981",
              icon: "📖",
              sentence: "Nam is reading a science book.",
              sentenceVi: "Nam đang đọc một cuốn sách khoa học.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u14_8",
              word: "WRITING",
              phonetic: "/ˈraɪ.tɪŋ/",
              meaning: "Đang viết bài, ghi nhật ký",
              speechText: "Writing",
              colorHex: "#f59e0b",
              icon: "✍️",
              sentence: "Ba is writing an English diary.",
              sentenceVi: "Ba đang viết nhật ký tiếng Anh.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u14_s3",
              structure: "What is he / she doing? - He / She is [action-ing].",
              meaning: "Hỏi và đáp về hành động người khác đang làm",
              example: "What is he doing? - He's listening to music.",
              exampleVi: "Cậu ấy đang làm gì? - Cậu ấy đang nghe nhạc.",
              speechText: "What is he doing? He's listening to music.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u14_s4",
              structure: "What is she doing? - She's reading a book.",
              meaning: "Hỏi hoạt động bạn nữ đang thực hiện",
              example: "What is she doing? - She's reading a book.",
              exampleVi: "Cô ấy đang làm gì? - Cô ấy đang đọc sách.",
              speechText: "What is she doing? She's reading a book.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Helping)",
          theme: "Luyện âm /ɪŋ/, /w/ & Ý thức giúp đỡ cha mẹ việc nhà",
          vocabulary: [
            {
              id: "g4_u14_9",
              word: "HELP",
              phonetic: "/help/",
              meaning: "Giúp đỡ, đỡ đần việc nhà",
              speechText: "Help",
              colorHex: "#10b981",
              icon: "🤝",
              sentence: "I love to help my family every day.",
              sentenceVi: "Em thích giúp đỡ gia đình mình mỗi ngày.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u14_10",
              word: "CHORE",
              phonetic: "/tʃɔːr/",
              meaning: "Việc vặt trong nhà",
              speechText: "Chore",
              colorHex: "#f59e0b",
              icon: "🧽",
              sentence: "Doing chores together is fun and responsible.",
              sentenceVi: "Cùng làm việc nhà thật vui và nâng cao trách nhiệm.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u14_s5",
              structure: "I help my parents with daily household chores to keep our home neat.",
              meaning: "Thông điệp hiếu thảo, tự giác làm việc nhà",
              example: "I help my parents with daily household chores to keep our home neat.",
              exampleVi: "Em giúp bố mẹ làm việc nhà để giữ tổ ấm luôn sạch sẽ và ngăn nắp.",
              speechText: "I help my parents with daily household chores to keep our home neat.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 15: MY FAMILY'S WEEKENDS
    {
      unitNumber: 15,
      unitKey: "unit_15",
      unitName: "My family's weekends",
      unitFullName: "Unit 15: My family's weekends",
      theme: "Family Weekend Activities (Hoạt động cuối tuần của gia đình)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và đáp về hoạt động cuối tuần của cả gia đình",
          vocabulary: [
            {
              id: "g4_u15_1",
              word: "VISIT GRANDPARENTS",
              phonetic: "/ˈvɪz.ɪt ˈɡrænˌpeə.rənts/",
              meaning: "Về quê thăm ông bà",
              speechText: "Visit grandparents",
              colorHex: "#10b981",
              icon: "👵👴",
              sentence: "We visit grandparents every weekend.",
              sentenceVi: "Cuối tuần nào chúng mình cũng về thăm ông bà.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u15_2",
              word: "GO TO THE CINEMA",
              phonetic: "/ɡəʊ tuː ðə ˈsɪn.ə.mɑː/",
              meaning: "Đi đến rạp chiếu phim",
              speechText: "Go to the cinema",
              colorHex: "#3b82f6",
              icon: "🎬",
              sentence: "They go to the cinema on Saturday evening.",
              sentenceVi: "Họ đi xem phim vào tối Thứ Bảy.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u15_3",
              word: "GO SHOPPING",
              phonetic: "/ɡəʊ ˈʃɒp.ɪŋ/",
              meaning: "Đi mua sắm đồ dùng",
              speechText: "Go shopping",
              colorHex: "#ec4899",
              icon: "🛍️",
              sentence: "Mother and I go shopping for fresh vegetables.",
              sentenceVi: "Mẹ và mình đi chợ mua rau củ tươi.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u15_4",
              word: "STAY AT HOME",
              phonetic: "/steɪ æt həʊm/",
              meaning: "Ở nhà nghỉ ngơi",
              speechText: "Stay at home",
              colorHex: "#f59e0b",
              icon: "🏡",
              sentence: "We stay at home and cook together.",
              sentenceVi: "Chúng mình ở nhà và cùng nhau nấu ăn.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u15_s1",
              structure: "What does your family do at weekends? - We [activity].",
              meaning: "Hỏi và trả lời hoạt động cuối tuần của gia đình",
              example: "What does your family do at weekends? - We visit our grandparents.",
              exampleVi: "Gia đình bạn làm gì vào cuối tuần? - Nhà mình về thăm ông bà.",
              speechText: "What does your family do at weekends? We visit our grandparents.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u15_s2",
              structure: "What does your family do at weekends? - We go to the cinema.",
              meaning: "Nói về hoạt động giải trí gia đình cuối tuần",
              example: "What does your family do at weekends? - We go to the cinema.",
              exampleVi: "Gia đình bạn làm gì vào dịp cuối tuần? - Nhà mình đi xem phim rạp.",
              speechText: "What does your family do at weekends? We go to the cinema.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Hoạt động riêng của từng thành viên (What does your father/mother do on...?)",
          vocabulary: [
            {
              id: "g4_u15_5",
              word: "WATER FLOWERS",
              phonetic: "/ˈwɔː.tər ˈflaʊ.əz/",
              meaning: "Tưới những luống hoa tươi",
              speechText: "Water flowers",
              colorHex: "#ec4899",
              icon: "🌸",
              sentence: "Father waters colorful flowers in the morning.",
              sentenceVi: "Bố tưới những bông hoa rực rỡ vào buổi sáng.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u15_6",
              word: "CLEAN THE HOUSE",
              phonetic: "/kliːn ðə haʊs/",
              meaning: "Dọn dẹp quét tước nhà cửa",
              speechText: "Clean the house",
              colorHex: "#06b6d4",
              icon: "🧼",
              sentence: "We clean the house thoroughly.",
              sentenceVi: "Chúng mình cùng dọn dẹp nhà cửa sạch tinh tươm.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u15_7",
              word: "COOK MEALS",
              phonetic: "/kʊk miːlz/",
              meaning: "Nấu những bữa ăn ngon",
              speechText: "Cook meals",
              colorHex: "#f97316",
              icon: "🍲",
              sentence: "Mother cooks delicious weekend meals.",
              sentenceVi: "Mẹ nấu những bữa ăn cuối tuần ngon lành.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u15_8",
              word: "PLAY SPORTS",
              phonetic: "/pleɪ spɔːts/",
              meaning: "Chơi các môn thể thao",
              speechText: "Play sports",
              colorHex: "#10b981",
              icon: "⚽",
              sentence: "My brother and I play sports in the park.",
              sentenceVi: "Anh trai và mình chơi thể thao ở công viên.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u15_s3",
              structure: "What does your father do on Sundays? - He [activity].",
              meaning: "Hỏi và đáp hoạt động của bố vào Chủ Nhật",
              example: "What does your father do on Sundays? - He waters the flowers.",
              exampleVi: "Bố bạn làm gì vào ngày Chủ Nhật? - Bác ấy tưới hoa trong vườn.",
              speechText: "What does your father do on Sundays? He waters the flowers.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u15_s4",
              structure: "What does your mother do on Saturdays? - She cooks delicious meals.",
              meaning: "Hỏi hoạt động của mẹ vào ngày Thứ Bảy",
              example: "What does your mother do on Saturdays? - She cooks delicious meals.",
              exampleVi: "Mẹ bạn làm gì vào Thứ Bảy? - Cô ấy nấu những bữa cơm ngon.",
              speechText: "What does your mother do on Saturdays? She cooks delicious meals.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Family Bond)",
          theme: "Luyện âm /v/, /k/ & Gắn kết yêu thương gia đình",
          vocabulary: [
            {
              id: "g4_u15_9",
              word: "TOGETHER",
              phonetic: "/təˈɡeð.ər/",
              meaning: "Cùng nhau, quây quần",
              speechText: "Together",
              colorHex: "#8b5cf6",
              icon: "👨‍👩‍👧‍👦",
              sentence: "Family members share joyful moments together.",
              sentenceVi: "Các thành viên trong nhà cùng nhau sẻ chia khoảnh khắc vui tươi.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u15_10",
              word: "HAPPINESS",
              phonetic: "/ˈhæp.i.nəs/",
              meaning: "Niềm hạnh phúc ấm êm",
              speechText: "Happiness",
              colorHex: "#eab308",
              icon: "💖",
              sentence: "Family weekends bring endless happiness.",
              sentenceVi: "Những ngày cuối tuần gia đình đem lại niềm hạnh phúc vô tận.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u15_s5",
              structure: "Family weekends bring warmth, love, and green togetherness.",
              meaning: "Tôn vinh giá trị yêu thương trong mái ấm gia đình",
              example: "Family weekends bring warmth, love, and green togetherness.",
              exampleVi: "Cuối tuần ấm áp gắn kết tình yêu thương giữa các thành viên trong gia đình.",
              speechText: "Family weekends bring warmth, love, and green togetherness.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 16: WEATHER
    {
      unitNumber: 16,
      unitKey: "unit_16",
      unitName: "Weather",
      unitFullName: "Unit 16: Weather",
      theme: "Weather Conditions & Forecast (Thời tiết & Khí hậu các vùng miền)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Hỏi và đáp về thời tiết hôm nay (What's the weather like today?)",
          vocabulary: [
            {
              id: "g4_u16_1",
              word: "SUNNY",
              phonetic: "/ˈsʌn.i/",
              meaning: "Có nắng, trời nắng ráo",
              speechText: "Sunny",
              colorHex: "#eab308",
              icon: "☀️",
              sentence: "It is bright and sunny today.",
              sentenceVi: "Hôm nay trời sáng rực và ngập tràn ánh nắng.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u16_2",
              word: "RAINY",
              phonetic: "/ˈreɪ.ni/",
              meaning: "Có mưa, trời đổ mưa",
              speechText: "Rainy",
              colorHex: "#3b82f6",
              icon: "🌧️",
              sentence: "Take an umbrella on rainy days.",
              sentenceVi: "Hãy mang theo ô dù vào những ngày trời mưa.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u16_3",
              word: "WINDY",
              phonetic: "/ˈwɪn.di/",
              meaning: "Nhiều gió, gió lộng mát",
              speechText: "Windy",
              colorHex: "#06b6d4",
              icon: "💨",
              sentence: "The kite flies high on windy days.",
              sentenceVi: "Cánh diều bay cao trong những ngày lộng gió.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u16_4",
              word: "CLOUDY",
              phonetic: "/ˈklaʊ.di/",
              meaning: "Nhiều mây, râm mát",
              speechText: "Cloudy",
              colorHex: "#64748b",
              icon: "☁️",
              sentence: "The sky is cool and cloudy.",
              sentenceVi: "Bầu trời râm mát và nhiều mây che bóng.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u16_s1",
              structure: "What's the weather like today? - It's [weather].",
              meaning: "Hỏi và trả lời tình hình thời tiết trong ngày",
              example: "What's the weather like today? - It's sunny.",
              exampleVi: "Thời tiết hôm nay thế nào? - Hôm nay trời nắng ráo.",
              speechText: "What's the weather like today? It's sunny.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u16_s2",
              structure: "What's the weather like today? - It's windy and cool.",
              meaning: "Miêu tả ngày trời nhiều gió mát mẻ",
              example: "What's the weather like today? - It's windy and cool.",
              exampleVi: "Hôm nay thời tiết ra sao? - Trời nhiều gió và mát mẻ.",
              speechText: "What's the weather like today? It's windy and cool.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Thời tiết ở các tỉnh thành khác (What's the weather like in...?)",
          vocabulary: [
            {
              id: "g4_u16_5",
              word: "SNOWY",
              phonetic: "/ˈsnəʊ.i/",
              meaning: "Có tuyết rơi trắng xóa",
              speechText: "Snowy",
              colorHex: "#94a3b8",
              icon: "❄️",
              sentence: "In winter, Sapa is sometimes snowy.",
              sentenceVi: "Vào mùa đông, Sa Pa đôi khi có tuyết rơi.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u16_6",
              word: "STORMY",
              phonetic: "/ˈstɔː.mi/",
              meaning: "Có bão giông sấm chớp",
              speechText: "Stormy",
              colorHex: "#475569",
              icon: "⛈️",
              sentence: "Stay indoors during stormy weather.",
              sentenceVi: "Hãy ở trong nhà an toàn khi trời mưa bão.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u16_7",
              word: "HOT",
              phonetic: "/hɒt/",
              meaning: "Nóng bức, oi ả",
              speechText: "Hot",
              colorHex: "#ef4444",
              icon: "🥵",
              sentence: "Summer days in Hue are sunny and hot.",
              sentenceVi: "Những ngày hè ở Huế ngập nắng và khá nóng.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u16_8",
              word: "COLD",
              phonetic: "/kəʊld/",
              meaning: "Lạnh giá buốt giá",
              speechText: "Cold",
              colorHex: "#0284c7",
              icon: "🥶",
              sentence: "Wear a warm coat when it is cold.",
              sentenceVi: "Mặc áo khoác ấm khi trời trở lạnh.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u16_s3",
              structure: "What's the weather like in [City]? - It's [weather].",
              meaning: "Hỏi và đáp thời tiết ở các địa phương",
              example: "What's the weather like in Hanoi? - It's cloudy and warm.",
              exampleVi: "Thời tiết ở Hà Nội thế nào? - Trời nhiều mây và ấm áp.",
              speechText: "What's the weather like in Hanoi? It's cloudy and warm.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u16_s4",
              structure: "What's the weather like in Da Nang? - It's sunny and hot.",
              meaning: "Hỏi thời tiết thành phố biển Đà Nẵng",
              example: "What's the weather like in Da Nang? - It's sunny and hot.",
              exampleVi: "Thời tiết ở Đà Nẵng thế nào? - Trời nắng và nóng.",
              speechText: "What's the weather like in Da Nang? It's sunny and hot.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Nature)",
          theme: "Luyện âm /w/, /kl/ & Thời tiết và bảo vệ môi trường sinh thái",
          vocabulary: [
            {
              id: "g4_u16_9",
              word: "WEATHER",
              phonetic: "/ˈweð.ər/",
              meaning: "Thời tiết khí hậu",
              speechText: "Weather",
              colorHex: "#10b981",
              icon: "🌡️",
              sentence: "Check the weather before going on a trip.",
              sentenceVi: "Xem dự báo thời tiết trước khi đi dã ngoại.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u16_10",
              word: "FORECAST",
              phonetic: "/ˈfɔː.kɑːst/",
              meaning: "Bản tin dự báo thời tiết",
              speechText: "Forecast",
              colorHex: "#3b82f6",
              icon: "📺",
              sentence: "The weather forecast predicts a pleasant week.",
              sentenceVi: "Bản tin dự báo một tuần thời tiết dễ chịu.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u16_s5",
              structure: "Understanding weather helps us adapt and protect our green nature.",
              meaning: "Thích ứng thời tiết và bảo vệ môi trường sống",
              example: "Understanding weather helps us adapt and protect our green nature.",
              exampleVi: "Hiểu biết thời tiết giúp chúng ta thích nghi tốt và bảo vệ thiên nhiên xanh.",
              speechText: "Understanding weather helps us adapt and protect our green nature.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 17: IN THE CITY
    {
      unitNumber: 17,
      unitKey: "unit_17",
      unitName: "In the city",
      unitFullName: "Unit 17: In the city",
      theme: "City Places & Directions (Địa điểm thành phố & Hỏi chỉ đường)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Các địa điểm trong thành phố & Vị trí (Where is the...?)",
          vocabulary: [
            {
              id: "g4_u17_1",
              word: "CINEMA",
              phonetic: "/ˈsɪn.ə.mɑː/",
              meaning: "Rạp chiếu phim thành phố",
              speechText: "Cinema",
              colorHex: "#8b5cf6",
              icon: "🎬",
              sentence: "The cinema is on Nguyen Hue Street.",
              sentenceVi: "Rạp chiếu phim nằm trên đường Nguyễn Huệ.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u17_2",
              word: "BAKERY",
              phonetic: "/ˈbeɪ.kər.i/",
              meaning: "Tiệm bánh ngọt, tiệm bánh mì",
              speechText: "Bakery",
              colorHex: "#f59e0b",
              icon: "🥖",
              sentence: "Fresh bread smells good from the bakery.",
              sentenceVi: "Mùi bánh mì mới nướng thơm nức từ tiệm bánh.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u17_3",
              word: "PHARMACY",
              phonetic: "/ˈfɑː.mə.si/",
              meaning: "Hiệu thuốc tây y",
              speechText: "Pharmacy",
              colorHex: "#10b981",
              icon: "💊",
              sentence: "Buy medical supplies at the pharmacy.",
              sentenceVi: "Mua thuốc và vật dụng y tế tại hiệu thuốc.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u17_4",
              word: "SUPERMARKET",
              phonetic: "/ˈsuː.pəˌmɑː.kɪt/",
              meaning: "Siêu thị tiện ích",
              speechText: "Supermarket",
              colorHex: "#ef4444",
              icon: "🛒",
              sentence: "We buy groceries at the green supermarket.",
              sentenceVi: "Chúng mình mua thực phẩm ở siêu thị xanh.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u17_s1",
              structure: "Where is the [place]? - It's [preposition] the [place].",
              meaning: "Hỏi và chỉ vị trí của địa điểm trong thành phố",
              example: "Where is the bakery? - It's next to the pharmacy.",
              exampleVi: "Tiệm bánh ở đâu thế? - Nó ở ngay cạnh hiệu thuốc.",
              speechText: "Where is the bakery? It's next to the pharmacy.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u17_s2",
              structure: "Where is the cinema? - It's opposite the supermarket.",
              meaning: "Chỉ vị trí đối diện nhau",
              example: "Where is the cinema? - It's opposite the supermarket.",
              exampleVi: "Rạp chiếu phim ở đâu? - Nằm đối diện siêu thị.",
              speechText: "Where is the cinema? It's opposite the supermarket.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Chỉ đường đi đến địa điểm (How can I get to...?)",
          vocabulary: [
            {
              id: "g4_u17_5",
              word: "BOOKSHOP",
              phonetic: "/ˈbʊk.ʃɒp/",
              meaning: "Nhà sách, hiệu sách",
              speechText: "Bookshop",
              colorHex: "#06b6d4",
              icon: "📚",
              sentence: "I buy notebooks at the city bookshop.",
              sentenceVi: "Mình mua vở viết ở nhà sách thành phố.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u17_6",
              word: "BUS STOP",
              phonetic: "/ˈbʌs stɒp/",
              meaning: "Trạm dừng xe buýt",
              speechText: "Bus stop",
              colorHex: "#f97316",
              icon: "🚏",
              sentence: "We wait at the bus stop for bus number 9.",
              sentenceVi: "Chúng mình đứng đợi xe buýt số 9 ở trạm dừng.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u17_7",
              word: "TURN LEFT",
              phonetic: "/tɜːn left/",
              meaning: "Rẽ về phía tay trái",
              speechText: "Turn left",
              colorHex: "#3b82f6",
              icon: "⬅️",
              sentence: "Turn left at the traffic lights.",
              sentenceVi: "Hãy rẽ trái ở cột đèn giao thông.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u17_8",
              word: "TURN RIGHT",
              phonetic: "/tɜːn raɪt/",
              meaning: "Rẽ về phía tay phải",
              speechText: "Turn right",
              colorHex: "#10b981",
              icon: "➡️",
              sentence: "Turn right and walk straight ahead.",
              sentenceVi: "Hãy rẽ phải rồi đi thẳng về phía trước.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u17_s3",
              structure: "How can I get to the [place]? - You can [directions].",
              meaning: "Hỏi và hướng dẫn đường đi đến nơi mong muốn",
              example: "How can I get to the bookshop? - Turn left, it's on your right.",
              exampleVi: "Làm sao để mình đến được hiệu sách? - Rẽ trái, hiệu sách nằm bên tay phải bạn.",
              speechText: "How can I get to the bookshop? Turn left, it's on your right.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u17_s4",
              structure: "How can I get to the supermarket? - Walk straight and turn right.",
              meaning: "Chỉ đường đi thẳng rồi rẽ phải",
              example: "How can I get to the supermarket? - Walk straight and turn right.",
              exampleVi: "Làm sao để đến siêu thị? - Hãy đi thẳng rồi rẽ phải.",
              speechText: "How can I get to the supermarket? Walk straight and turn right.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Safety)",
          theme: "Luyện âm /s/, /ʃ/ & An toàn giao thông trong đô thị xanh",
          vocabulary: [
            {
              id: "g4_u17_9",
              word: "OPPOSITE",
              phonetic: "/ˈɒp.ə.zɪt/",
              meaning: "Ở phía đối diện bên kia đường",
              speechText: "Opposite",
              colorHex: "#d97706",
              icon: "↔️",
              sentence: "The park is opposite the museum.",
              sentenceVi: "Công viên nằm đối diện viện bảo tàng.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u17_10",
              word: "BETWEEN",
              phonetic: "/bɪˈtwiːn/",
              meaning: "Nằm ở giữa hai địa điểm",
              speechText: "Between",
              colorHex: "#16a34a",
              icon: "↕️",
              sentence: "The library is between the bakery and the bank.",
              sentenceVi: "Thư viện nằm ở giữa tiệm bánh và ngân hàng.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u17_s5",
              structure: "Follow traffic signs and walk safely in the clean green city.",
              meaning: "Giáo dục ý thức tham gia giao thông an toàn văn minh",
              example: "Follow traffic signs and walk safely in the clean green city.",
              exampleVi: "Tuân thủ biển báo giao thông và đi bộ an toàn trong thành phố xanh sạch đẹp.",
              speechText: "Follow traffic signs and walk safely in the clean green city.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 18: AT THE SHOPPING CENTRE
    {
      unitNumber: 18,
      unitKey: "unit_18",
      unitName: "At the shopping centre",
      unitFullName: "Unit 18: At the shopping centre",
      theme: "Clothes & Prices (Trang phục quần áo & Hỏi giá tiền)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Trang phục số ít & Hỏi giá tiền (How much is the...?)",
          vocabulary: [
            {
              id: "g4_u18_1",
              word: "T-SHIRT",
              phonetic: "/ˈtiː.ʃɜːt/",
              meaning: "Áo thun, áo phông",
              speechText: "T-shirt",
              colorHex: "#10b981",
              icon: "👕",
              sentence: "This green T-shirt is made of cotton.",
              sentenceVi: "Chiếc áo phông xanh này dệt từ sợi bông cotton.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u18_2",
              word: "SKIRT",
              phonetic: "/skɜːt/",
              meaning: "Chân váy",
              speechText: "Skirt",
              colorHex: "#ec4899",
              icon: "👗",
              sentence: "She wears a pretty floral skirt.",
              sentenceVi: "Bạn ấy mặc một chiếc chân váy hoa rất xinh xắn.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u18_3",
              word: "JACKET",
              phonetic: "/ˈdʒæk.ɪt/",
              meaning: "Áo khoác giữ ấm",
              speechText: "Jacket",
              colorHex: "#3b82f6",
              icon: "🧥",
              sentence: "The warm jacket keeps me comfortable.",
              sentenceVi: "Chiếc áo khoác ấm giữ ấm cho mình.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u18_4",
              word: "CAP",
              phonetic: "/kæp/",
              meaning: "Mũ lưỡi trai thể thao",
              speechText: "Cap",
              colorHex: "#f59e0b",
              icon: "🧢",
              sentence: "He wears a sports cap in the sun.",
              sentenceVi: "Cậu ấy đội chiếc mũ lưỡi trai thể thao che nắng.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u18_s1",
              structure: "How much is the [clothing]? - It's [number] thousand dong.",
              meaning: "Hỏi và đáp giá tiền món đồ số ít",
              example: "How much is the T-shirt? - It's eighty thousand dong.",
              exampleVi: "Chiếc áo phông này giá bao nhiêu? - Tám mươi nghìn đồng.",
              speechText: "How much is the T-shirt? It's eighty thousand dong.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u18_s2",
              structure: "How much is the jacket? - It's one hundred and fifty thousand dong.",
              meaning: "Hỏi giá tiền áo khoác",
              example: "How much is the jacket? - It's one hundred and fifty thousand dong.",
              exampleVi: "Chiếc áo khoác này giá bao nhiêu? - Một trăm năm mươi nghìn đồng.",
              speechText: "How much is the jacket? It's one hundred and fifty thousand dong.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Trang phục số nhiều & Hỏi giá tiền (How much are the...?)",
          vocabulary: [
            {
              id: "g4_u18_5",
              word: "JEANS",
              phonetic: "/dʒiːnz/",
              meaning: "Quần bò, quần vải bò",
              speechText: "Jeans",
              colorHex: "#2563eb",
              icon: "👖",
              sentence: "These blue jeans fit me well.",
              sentenceVi: "Chiếc quần bò xanh này vừa vặn với mình.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u18_6",
              word: "SHOES",
              phonetic: "/ʃuːz/",
              meaning: "Đôi giày thể thao, giày da",
              speechText: "Shoes",
              colorHex: "#06b6d4",
              icon: "👟",
              sentence: "My sports shoes are lightweight and soft.",
              sentenceVi: "Đôi giày thể thao của mình rất nhẹ và êm chân.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u18_7",
              word: "SOCKS",
              phonetic: "/sɒks/",
              meaning: "Đôi tất, đôi vớ chân",
              speechText: "Socks",
              colorHex: "#f97316",
              icon: "🧦",
              sentence: "Wear warm socks on chilly days.",
              sentenceVi: "Hãy đi tất ấm vào những ngày se lạnh.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u18_8",
              word: "TROUSERS",
              phonetic: "/ˈtraʊ.zəz/",
              meaning: "Quần tây dài lịch sự",
              speechText: "Trousers",
              colorHex: "#475569",
              icon: "👔",
              sentence: "School uniform trousers are dark blue.",
              sentenceVi: "Quần đồng phục đi học có màu xanh đen.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u18_s3",
              structure: "How much are the [clothes]? - They're [number] thousand dong.",
              meaning: "Hỏi và đáp giá tiền món đồ số nhiều",
              example: "How much are the shoes? - They're ninety thousand dong.",
              exampleVi: "Đôi giày này giá bao nhiêu? - Chín mươi nghìn đồng.",
              speechText: "How much are the shoes? They're ninety thousand dong.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u18_s4",
              structure: "How much are the jeans? - They're one hundred and twenty thousand dong.",
              meaning: "Hỏi giá quần bò",
              example: "How much are the jeans? - They're one hundred and twenty thousand dong.",
              exampleVi: "Chiếc quần bò này giá bao nhiêu? - Một trăm hai mươi nghìn đồng.",
              speechText: "How much are the jeans? They're one hundred and twenty thousand dong.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Smart Shopping)",
          theme: "Luyện âm /ʃ/, /tʃ/ & Lựa chọn trang phục thân thiện và tiết kiệm",
          vocabulary: [
            {
              id: "g4_u18_9",
              word: "PRICE",
              phonetic: "/praɪs/",
              meaning: "Giá cả niêm yết",
              speechText: "Price",
              colorHex: "#eab308",
              icon: "🏷️",
              sentence: "Check the price tag before purchasing.",
              sentenceVi: "Kiểm tra thẻ giá trước khi mua sắm.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u18_10",
              word: "THOUSAND",
              phonetic: "/ˈθaʊ.zənd/",
              meaning: "Nghìn, ngàn (đơn vị tiền tệ)",
              speechText: "Thousand",
              colorHex: "#10b981",
              icon: "💵",
              sentence: "One hundred thousand dong.",
              sentenceVi: "Một trăm nghìn đồng.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u18_s5",
              structure: "Choose quality eco-friendly clothes and spend money wisely.",
              meaning: "Giáo dục tiêu dùng thông minh và bảo vệ môi trường",
              example: "Choose quality eco-friendly clothes and spend money wisely.",
              exampleVi: "Lựa chọn quần áo thân thiện môi trường và chi tiêu tiền bạc một cách thông minh.",
              speechText: "Choose quality eco-friendly clothes and spend money wisely.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 19: ANIMAL WORLD
    {
      unitNumber: 19,
      unitKey: "unit_19",
      unitName: "Animal world",
      unitFullName: "Unit 19: Animal world",
      theme: "Wild Animals & Characteristics (Động vật hoang dã & Hành vi đặc điểm)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Lý do muốn ngắm các loài động vật hoang dã (Why do you want to see...?)",
          vocabulary: [
            {
              id: "g4_u19_1",
              word: "CROCODILE",
              phonetic: "/ˈkrɒk.ə.daɪl/",
              meaning: "Con cá sấu",
              speechText: "Crocodile",
              colorHex: "#15803d",
              icon: "🐊",
              sentence: "The crocodile swims quietly in the river.",
              sentenceVi: "Con cá sấu bơi êm ả dưới làn nước sông.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u19_2",
              word: "KANGAROO",
              phonetic: "/ˌkæŋ.ɡərˈuː/",
              meaning: "Con chuột túi (chuột túi Úc)",
              speechText: "Kangaroo",
              colorHex: "#f59e0b",
              icon: "🦘",
              sentence: "The kangaroo carries its baby in a pouch.",
              sentenceVi: "Con chuột túi mang con nhỏ trong chiếc túi trước bụng.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u19_3",
              word: "ZEBRA",
              phonetic: "/ˈzeb.rə/",
              meaning: "Con ngựa vằn",
              speechText: "Zebra",
              colorHex: "#334155",
              icon: "🦓",
              sentence: "The zebra has black and white stripes.",
              sentenceVi: "Ngựa vằn có những sọc vằn đen trắng nổi bật.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u19_4",
              word: "HIPPOPOTAMUS",
              phonetic: "/ˌhɪp.əˈpɒt.ə.məs/",
              meaning: "Con hà mã",
              speechText: "Hippopotamus",
              colorHex: "#64748b",
              icon: "🦛",
              sentence: "The hippopotamus stays cool in muddy water.",
              sentenceVi: "Con hà mã ngâm mình dưới nước bùn mát rượi.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u19_s1",
              structure: "Why do you want to see [animals]? - Because they are [adjective].",
              meaning: "Hỏi và giải thích lý do muốn ngắm loài vật",
              example: "Why do you want to see kangaroos? - Because they jump high.",
              exampleVi: "Tại sao bạn muốn xem chuột túi? - Vì chúng nhảy rất cao.",
              speechText: "Why do you want to see kangaroos? Because they jump high.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u19_s2",
              structure: "Why do you want to see zebras? - Because they are fast and beautiful.",
              meaning: "Giải thích vẻ đẹp ngựa vằn",
              example: "Why do you want to see zebras? - Because they are fast and beautiful.",
              exampleVi: "Tại sao bạn muốn xem ngựa vằn? - Vì chúng chạy nhanh và rất đẹp.",
              speechText: "Why do you want to see zebras? Because they are fast and beautiful.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Đặc điểm và hành động của loài vật (What is the animal doing?)",
          vocabulary: [
            {
              id: "g4_u19_5",
              word: "SCARY",
              phonetic: "/ˈskeə.ri/",
              meaning: "Đáng sợ, hung dữ",
              speechText: "Scary",
              colorHex: "#ef4444",
              icon: "😱",
              sentence: "The big crocodile looks scary.",
              sentenceVi: "Con cá sấu to lớn trông khá đáng sợ.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u19_6",
              word: "FUNNY",
              phonetic: "/ˈfʌn.i/",
              meaning: "Vui nhộn, ngộ nghĩnh",
              speechText: "Funny",
              colorHex: "#eab308",
              icon: "🐒",
              sentence: "Monkeys are very funny and energetic.",
              sentenceVi: "Những chú khỉ rất vui nhộn và hiếu động.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u19_7",
              word: "FAST",
              phonetic: "/fɑːst/",
              meaning: "Nhanh nhẹn, tốc độ cao",
              speechText: "Fast",
              colorHex: "#06b6d4",
              icon: "🐆",
              sentence: "Tigers run extremely fast.",
              sentenceVi: "Loài hổ phi nước đại cực kỳ nhanh.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u19_8",
              word: "SWINGING",
              phonetic: "/ˈswɪŋ.ɪŋ/",
              meaning: "Đang đu chuyền cành",
              speechText: "Swinging",
              colorHex: "#10b981",
              icon: "🌴",
              sentence: "The monkey is swinging from branch to branch.",
              sentenceVi: "Chú khỉ đang thoăn thoắt đu từ cành này sang cành khác.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u19_s3",
              structure: "What is the [animal] doing? - It's [action-ing].",
              meaning: "Hỏi và đáp con vật đang làm gì",
              example: "What is the monkey doing? - It's swinging in the tree.",
              exampleVi: "Con khỉ đang làm gì thế? - Nó đang chuyền cành trên cây.",
              speechText: "What is the monkey doing? It's swinging in the tree.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u19_s4",
              structure: "What is the tiger doing? - It's roaring loudly.",
              meaning: "Miêu tả tiếng gầm của hổ",
              example: "What is the tiger doing? - It's roaring loudly.",
              exampleVi: "Con hổ đang làm gì? - Nó đang gầm vang dũng mãnh.",
              speechText: "What is the tiger doing? It's roaring loudly.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Conservation)",
          theme: "Luyện âm /k/, /z/ & Bảo vệ động vật hoang dã và môi trường sống",
          vocabulary: [
            {
              id: "g4_u19_9",
              word: "WILDLIFE",
              phonetic: "/ˈwaɪld.laɪf/",
              meaning: "Động vật hoang dã thiên nhiên",
              speechText: "Wildlife",
              colorHex: "#16a34a",
              icon: "🐾",
              sentence: "Protecting wildlife preserves biodiversity.",
              sentenceVi: "Bảo vệ muông thú hoang dã gìn giữ sự đa dạng sinh học.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u19_10",
              word: "PROTECT",
              phonetic: "/prəˈtekt/",
              meaning: "Bảo vệ, gìn giữ chở che",
              speechText: "Protect",
              colorHex: "#0284c7",
              icon: "🛡️",
              sentence: "We protect animals and their natural forests.",
              sentenceVi: "Chúng em cùng bảo vệ động vật và những cánh rừng tự nhiên.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u19_s5",
              structure: "All animals deserve our love, protection, and a green habitat.",
              meaning: "Thông điệp bảo tồn sinh thái nhân văn",
              example: "All animals deserve our love, protection, and a green habitat.",
              exampleVi: "Muông thú đều xứng đáng được chở che và sống bình yên trong môi trường xanh.",
              speechText: "All animals deserve our love, protection, and a green habitat.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    },

    // UNIT 20: AT SUMMER CAMP
    {
      unitNumber: 20,
      unitKey: "unit_20",
      unitName: "At summer camp",
      unitFullName: "Unit 20: At summer camp",
      theme: "Summer Camp Activities & Intentions (Hoạt động trại hè & Dự định tương lai)",
      lessons: [
        {
          lessonNumber: 1,
          lessonTitle: "Lesson 1",
          theme: "Dự định hoạt động tại trại hè (What are you going to do...?)",
          vocabulary: [
            {
              id: "g4_u20_1",
              word: "SUMMER CAMP",
              phonetic: "/ˈsʌm.ər kæmp/",
              meaning: "Trại hè dã ngoại thiếu nhi",
              speechText: "Summer camp",
              colorHex: "#f59e0b",
              icon: "🏕️",
              sentence: "Summer camp is an unforgettable adventure.",
              sentenceVi: "Trại hè là một chuyến phiêu lưu khó quên.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u20_2",
              word: "BUILD A CAMPFIRE",
              phonetic: "/bɪld ə ˈkæmpˌfaɪər/",
              meaning: "Đốt lửa trại bập bùng",
              speechText: "Build a campfire",
              colorHex: "#ef4444",
              icon: "🔥",
              sentence: "Campers build a campfire at dusk.",
              sentenceVi: "Các trại sinh quây quần đốt lửa trại vào lúc hoàng hôn.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u20_3",
              word: "PUT UP A TENT",
              phonetic: "/pʊt ʌp ə tent/",
              meaning: "Dựng lều bạt cắm trại",
              speechText: "Put up a tent",
              colorHex: "#10b981",
              icon: "⛺",
              sentence: "We put up a tent under pine trees.",
              sentenceVi: "Chúng mình cùng nhau dựng lều trại dưới tán thông mát rượi.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u20_4",
              word: "TAKE PHOTOS",
              phonetic: "/teɪk ˈfəʊ.təʊz/",
              meaning: "Chụp ảnh lưu niệm",
              speechText: "Take photos",
              colorHex: "#3b82f6",
              icon: "📸",
              sentence: "I take photos of the scenic campsite.",
              sentenceVi: "Mình chụp những bức ảnh kỷ niệm tuyệt đẹp tại khu cắm trại.",
              lesson: "Lesson 1"
            }
          ],
          sentences: [
            {
              id: "g4_u20_s1",
              structure: "What are you going to do at summer camp? - I'm going to [action].",
              meaning: "Hỏi và trả lời dự định của bản thân tại trại hè",
              example: "What are you going to do at summer camp? - I'm going to put up a tent.",
              exampleVi: "Bạn dự định làm gì ở trại hè? - Mình dự định dựng lều trại.",
              speechText: "What are you going to do at summer camp? I'm going to put up a tent.",
              lesson: "Lesson 1"
            },
            {
              id: "g4_u20_s2",
              structure: "What are you going to do? - I'm going to take beautiful photos.",
              meaning: "Nói về việc chụp ảnh kỷ niệm",
              example: "What are you going to do? - I'm going to take beautiful photos.",
              exampleVi: "Bạn dự định làm gì? - Mình dự định chụp những bức ảnh thật đẹp.",
              speechText: "What are you going to do? I'm going to take beautiful photos.",
              lesson: "Lesson 1"
            }
          ]
        },
        {
          lessonNumber: 2,
          lessonTitle: "Lesson 2",
          theme: "Các trò chơi tập thể trại hè (What are they going to do?)",
          vocabulary: [
            {
              id: "g4_u20_5",
              word: "PLAY TUG OF WAR",
              phonetic: "/pleɪ tʌɡ əv wɔːr/",
              meaning: "Chơi trò kéo co đồng đội",
              speechText: "Play tug of war",
              colorHex: "#d97706",
              icon: "🪢",
              sentence: "Teams play tug of war enthusiastically.",
              sentenceVi: "Các đội hào hứng tham gia trò chơi kéo co.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u20_6",
              word: "TELL STORIES",
              phonetic: "/tel ˈstɔː.riz/",
              meaning: "Kể những câu chuyện cổ tích / chuyện vui",
              speechText: "Tell stories",
              colorHex: "#8b5cf6",
              icon: "📖",
              sentence: "We tell stories around the warm campfire.",
              sentenceVi: "Chúng mình kể những câu chuyện vui bên đống lửa trại ấm áp.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u20_7",
              word: "GO CAMPING",
              phonetic: "/ɡəʊ ˈkæm.pɪŋ/",
              meaning: "Đi cắm trại ngoài trời",
              speechText: "Go camping",
              colorHex: "#16a34a",
              icon: "🌲",
              sentence: "Our class goes camping in the national park.",
              sentenceVi: "Lớp mình đi cắm trại ở vườn quốc gia.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u20_8",
              word: "SING SONGS",
              phonetic: "/sɪŋ sɒŋz/",
              meaning: "Ca hát quanh ánh lửa trại",
              speechText: "Sing songs",
              colorHex: "#ec4899",
              icon: "🎶",
              sentence: "Campers sing songs together happily.",
              sentenceVi: "Các bạn nhỏ cùng nhau ca vang những bài hát vui tươi.",
              lesson: "Lesson 2"
            }
          ],
          sentences: [
            {
              id: "g4_u20_s3",
              structure: "What are they going to do? - They're going to [action].",
              meaning: "Hỏi và đáp dự định của các bạn khác",
              example: "What are they going to do? - They're going to play tug of war.",
              exampleVi: "Họ dự định làm gì? - Họ dự định chơi trò kéo co.",
              speechText: "What are they going to do? They're going to play tug of war.",
              lesson: "Lesson 2"
            },
            {
              id: "g4_u20_s4",
              structure: "What are we going to do tonight? - We're going to tell stories around the campfire.",
              meaning: "Dự định buổi sinh hoạt lửa trại buổi tối",
              example: "What are we going to do tonight? - We're going to tell stories around the campfire.",
              exampleVi: "Tối nay chúng mình sẽ làm gì? - Chúng mình sẽ kể chuyện quanh đống lửa trại.",
              speechText: "What are we going to do tonight? We're going to tell stories around the campfire.",
              lesson: "Lesson 2"
            }
          ]
        },
        {
          lessonNumber: 3,
          lessonTitle: "Lesson 3 (Review & Adventure)",
          theme: "Luyện âm /k/, /t/ & Mùa hè xanh, tinh thần tự lập và tình bạn",
          vocabulary: [
            {
              id: "g4_u20_9",
              word: "ADVENTURE",
              phonetic: "/ədˈven.tʃər/",
              meaning: "Chuyến phiêu lưu kỳ thú",
              speechText: "Adventure",
              colorHex: "#0284c7",
              icon: "🧭",
              sentence: "Summer brings exciting outdoor adventures.",
              sentenceVi: "Mùa hè mang đến những chuyến phiêu lưu kỳ thú ngoài trời.",
              lesson: "Lesson 3"
            },
            {
              id: "g4_u20_10",
              word: "FRIENDSHIP",
              phonetic: "/ˈfrend.ʃɪp/",
              meaning: "Tình bạn bè trong sáng cao quý",
              speechText: "Friendship",
              colorHex: "#ec4899",
              icon: "🤝",
              sentence: "Summer camp strengthens our lasting friendship.",
              sentenceVi: "Kỳ trại hè thắt chặt tình bạn trong sáng bền lâu.",
              lesson: "Lesson 3"
            }
          ],
          sentences: [
            {
              id: "g4_u20_s5",
              structure: "Summer camp fosters independence, team spirit, and love for green nature.",
              meaning: "Thông điệp rèn luyện kỹ năng sống và tình yêu thiên nhiên mùa hè",
              example: "Summer camp fosters independence, team spirit, and love for green nature.",
              exampleVi: "Trại hè rèn luyện tính tự lập, tinh thần đồng đội và tình yêu thiên nhiên xanh.",
              speechText: "Summer camp fosters independence, team spirit, and love for green nature.",
              lesson: "Lesson 3"
            }
          ]
        }
      ],
      vocabulary: [],
      sentences: []
    }
  ]
};

// Auto-populate flattened vocabulary and sentences
grade4Data.units.forEach(unit => {
  if (unit.lessons && unit.lessons.length > 0) {
    unit.vocabulary = unit.lessons.flatMap(l => l.vocabulary);
    unit.sentences = unit.lessons.flatMap(l => l.sentences);
  }
});

// Generate TypeScript source code for src/data/grade4Data.ts
const tsContent = `import { GradeData } from './bookmapData';

export const grade4Data: GradeData = ${JSON.stringify(grade4Data, null, 2)};

// Auto-populate flattened vocabulary and sentences for each unit to ensure 100% backward compatibility
grade4Data.units.forEach(unit => {
  if (unit.lessons && unit.lessons.length > 0) {
    unit.vocabulary = unit.lessons.flatMap(l => l.vocabulary);
    unit.sentences = unit.lessons.flatMap(l => l.sentences);
  }
});
`;

fs.writeFileSync(path.join(__dirname, '../src/data/grade4Data.ts'), tsContent, 'utf8');
console.log('Successfully generated src/data/grade4Data.ts!');

// Update src/data/bookmap_globalsuccess.json
const jsonPath = path.join(__dirname, '../src/data/bookmap_globalsuccess.json');
const fullJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
fullJson.grades['4'] = grade4Data;
fs.writeFileSync(jsonPath, JSON.stringify(fullJson, null, 2), 'utf8');
console.log('Successfully updated src/data/bookmap_globalsuccess.json with Grade 4 data!');

// Update eco_voice_standalone.html
const htmlPath = path.join(__dirname, '../eco_voice_standalone.html');
const lines = fs.readFileSync(htmlPath, 'utf8').split('\n');
let targetLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('    const bookmapDatabase = ')) {
    targetLine = i;
    break;
  }
}
if (targetLine !== -1) {
  lines[targetLine] = '    const bookmapDatabase = ' + JSON.stringify(fullJson) + ';';
  fs.writeFileSync(htmlPath, lines.join('\n'), 'utf8');
  console.log('Successfully updated eco_voice_standalone.html with Grade 4 data!');
}

console.log('All updates complete!');
