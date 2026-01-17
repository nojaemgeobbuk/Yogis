/**
 * DatePicker Native Component
 * React Native용 날짜 선택기
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
} from 'react-native';

interface DatePickerNativeProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  visible: boolean;
  onClose: () => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const DatePickerNative: React.FC<DatePickerNativeProps> = ({
  selectedDate,
  onSelectDate,
  visible,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [displayDate, setDisplayDate] = useState(new Date(selectedDate));

  // 해당 월의 날짜들 계산
  const daysInMonth = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // 월 시작 전 빈 칸
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      days.push(null);
    }

    // 월의 날짜들
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [displayDate]);

  // 이전/다음 달로 이동
  const changeMonth = (delta: number) => {
    setDisplayDate(
      new Date(displayDate.getFullYear(), displayDate.getMonth() + delta, 1)
    );
  };

  // 날짜 비교
  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const today = new Date();

  const handleSelectDate = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.container, isDark && styles.containerDark]}>
            {/* 헤더 - 월/연도 선택 */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => changeMonth(-1)}
                style={styles.navButton}
              >
                <Text style={[styles.navButtonText, isDark && styles.textLight]}>
                  ◀
                </Text>
              </TouchableOpacity>

              <Text style={[styles.headerTitle, isDark && styles.textLight]}>
                {displayDate.getFullYear()}년 {displayDate.getMonth() + 1}월
              </Text>

              <TouchableOpacity
                onPress={() => changeMonth(1)}
                style={styles.navButton}
              >
                <Text style={[styles.navButtonText, isDark && styles.textLight]}>
                  ▶
                </Text>
              </TouchableOpacity>
            </View>

            {/* 요일 헤더 */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((day, index) => (
                <View key={index} style={styles.weekdayCell}>
                  <Text
                    style={[
                      styles.weekdayText,
                      isDark && styles.textMuted,
                      index === 0 && styles.sundayText,
                      index === 6 && styles.saturdayText,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* 날짜 그리드 */}
            <View style={styles.daysGrid}>
              {daysInMonth.map((day, index) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);

                return (
                  <View key={index} style={styles.dayCell}>
                    {day ? (
                      <TouchableOpacity
                        onPress={() => handleSelectDate(day)}
                        style={[
                          styles.dayButton,
                          isSelected && styles.dayButtonSelected,
                          isToday && !isSelected && styles.dayButtonToday,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isDark && styles.textLight,
                            isSelected && styles.dayTextSelected,
                            !isSelected && day.getDay() === 0 && styles.sundayText,
                            !isSelected && day.getDay() === 6 && styles.saturdayText,
                          ]}
                        >
                          {day.getDate()}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.emptyCell} />
                    )}
                  </View>
                );
              })}
            </View>

            {/* 닫기 버튼 */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: 340,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  containerDark: {
    backgroundColor: '#1e293b',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 18,
    color: '#0d9488',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#292524',
  },

  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716c',
  },
  sundayText: {
    color: '#ef4444',
  },
  saturdayText: {
    color: '#3b82f6',
  },

  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 7일 = 100% / 7
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  emptyCell: {
    width: '100%',
    height: '100%',
  },
  dayButton: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#0d9488',
  },
  dayButtonToday: {
    borderWidth: 2,
    borderColor: '#14b8a6',
  },
  dayText: {
    fontSize: 14,
    color: '#292524',
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },

  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#e7e5e4',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#57534e',
  },

  textLight: {
    color: '#e2e8f0',
  },
  textMuted: {
    color: '#64748b',
  },
});

export default DatePickerNative;
