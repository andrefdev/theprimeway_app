import { View, Pressable } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { IconCircle } from '@/shared/components/ui/icon-circle';
import { Header } from '@/shared/components/layout/Header';
import { useUiStore } from '@/shared/stores/uiStore';
import { formatSeconds } from '@/shared/utils/format';
import { Play, Pause, RotateCcw, SkipForward, Timer, Flame, CheckSquare } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import { cn } from '@/shared/utils/cn';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';

const SESSION_LABEL_KEYS = {
  focus: 'modes.work',
  short_break: 'modes.shortBreak',
  long_break: 'modes.longBreak',
} as const;

const DURATIONS = { focus: 25 * 60, short_break: 5 * 60, long_break: 15 * 60 };

function TimerRing({ progress, size = 240 }: { progress: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <Svg width={size} height={size}>
      <SvgCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="hsl(210, 15%, 18%)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <SvgCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="hsl(246, 97%, 52%)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

export default function PomodoroScreen() {
  const { t } = useTranslation('features.pomodoro');
  const {
    pomodoro,
    setPomodoroStatus,
    setPomodoroRemaining,
    setPomodoroSessionType,
    resetPomodoro,
  } = useUiStore();

  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (pomodoro.status === 'running') {
      intervalRef.current = setInterval(() => {
        setPomodoroRemaining(pomodoro.remainingSeconds - 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pomodoro.status, pomodoro.remainingSeconds, setPomodoroRemaining]);

  useEffect(() => {
    if (pomodoro.remainingSeconds <= 0 && pomodoro.status === 'running') {
      setPomodoroStatus('idle');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [pomodoro.remainingSeconds, pomodoro.status, setPomodoroStatus]);

  const toggleTimer = () => {
    setPomodoroStatus(pomodoro.status === 'running' ? 'paused' : 'running');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const total = DURATIONS[pomodoro.sessionType];
  const progress = (total - pomodoro.remainingSeconds) / total;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Header title={t('title')} showBack />

      <View className="flex-1 items-center justify-center px-4">
        {/* Session Type Pills */}
        <View className="mb-10 flex-row gap-2">
          {(Object.keys(SESSION_LABEL_KEYS) as Array<keyof typeof SESSION_LABEL_KEYS>).map((type) => (
            <Pressable
              key={type}
              className={cn(
                'rounded-full px-4 py-2',
                pomodoro.sessionType === type ? 'bg-primary' : 'bg-muted'
              )}
              onPress={() => setPomodoroSessionType(type)}
            >
              <Text
                className={cn(
                  'text-xs font-medium',
                  pomodoro.sessionType === type ? 'text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                {t(SESSION_LABEL_KEYS[type])}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Timer Ring */}
        <View className="relative mb-10 items-center justify-center" style={{ width: 240, height: 240 }}>
          <TimerRing progress={progress} />
          <View className="absolute items-center">
            <Text className="text-5xl font-bold tracking-tight text-foreground">
              {formatSeconds(pomodoro.remainingSeconds)}
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              {t(SESSION_LABEL_KEYS[pomodoro.sessionType])}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row items-center gap-6">
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-full bg-muted active:bg-border"
            onPress={resetPomodoro}
          >
            <Icon as={RotateCcw} size={20} className="text-foreground" />
          </Pressable>

          <Pressable
            className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 active:bg-primary-hover"
            onPress={toggleTimer}
          >
            <Icon
              as={pomodoro.status === 'running' ? Pause : Play}
              size={28}
              className="text-primary-foreground"
            />
          </Pressable>

          <Pressable
            className="h-12 w-12 items-center justify-center rounded-full bg-muted active:bg-border"
            onPress={() => {
              setPomodoroSessionType(
                pomodoro.sessionType === 'focus' ? 'short_break' : 'focus'
              );
            }}
          >
            <Icon as={SkipForward} size={20} className="text-foreground" />
          </Pressable>
        </View>

        {/* Stats Preview */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)} className="mt-12 flex-row gap-3">
          <View className="flex-1 items-center rounded-xl border border-border bg-card py-3">
            <IconCircle icon={Timer} color="primary" size="sm" />
            <Text className="mt-2 text-lg font-bold text-foreground">0h</Text>
            <Text className="text-2xs text-muted-foreground">Today</Text>
          </View>
          <View className="flex-1 items-center rounded-xl border border-border bg-card py-3">
            <IconCircle icon={CheckSquare} color="success" size="sm" />
            <Text className="mt-2 text-lg font-bold text-foreground">0</Text>
            <Text className="text-2xs text-muted-foreground">Sessions</Text>
          </View>
          <View className="flex-1 items-center rounded-xl border border-border bg-card py-3">
            <IconCircle icon={Flame} color="warning" size="sm" />
            <Text className="mt-2 text-lg font-bold text-foreground">0d</Text>
            <Text className="text-2xs text-muted-foreground">Streak</Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
