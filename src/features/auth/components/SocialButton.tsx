import { Pressable, View, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  isLoading?: boolean;
  className?: string;
}

export function SocialButton({ provider, onPress, isLoading, className }: SocialButtonProps) {
  const { t } = useTranslation('auth.oauth');
  const label = provider === 'google' ? t('continueWithGoogle') : t('continueWithApple');

  return (
    <Pressable
      className={cn(
        'h-11 flex-row items-center justify-center gap-3 rounded-md border border-border bg-background active:bg-accent',
        className
      )}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <View className="flex-row items-center gap-3">
          <Text className="text-lg">{provider === 'google' ? 'G' : '\uF8FF'}</Text>
          <Text className="text-sm font-medium text-foreground">{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
