import { View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { IconCircle } from '@/shared/components/ui/icon-circle';
import { Header } from '@/shared/components/layout/Header';
import { Send, Sparkles, BarChart3, Target, CheckSquare, Lightbulb, TrendingUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  { icon: BarChart3, label: 'Analyze my finances' },
  { icon: Target, label: 'Review my goals' },
  { icon: CheckSquare, label: 'Plan my week' },
  { icon: Lightbulb, label: 'Productivity tips' },
  { icon: TrendingUp, label: 'Monthly report' },
];

export default function AiChatScreen() {
  const { t } = useTranslation('features.ai');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // TODO: Implement SSE streaming with the backend
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'AI chat coming soon! Connect your backend to enable this feature.',
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Header title="" showBack />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerClassName="py-4 gap-3"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Empty State */}
          {messages.length === 0 && (
            <Animated.View entering={FadeIn.duration(400)} className="items-center pb-4 pt-12">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/15">
                <Icon as={Sparkles} size={28} className="text-primary" />
              </View>
              <Text className="mt-4 text-xl font-bold text-foreground">
                {t('chat.emptyTitle')}
              </Text>
              <Text className="mt-1 text-center text-sm text-muted-foreground">
                {t('chat.emptyDescription')}
              </Text>

              {/* Quick Suggestions */}
              <View className="mt-6 w-full gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <Animated.View key={s.label} entering={FadeInDown.delay(100 + i * 50).duration(300)}>
                    <Pressable
                      onPress={() => handleSend(s.label)}
                      className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 active:bg-muted"
                    >
                      <Icon as={s.icon} size={16} className="text-accent" />
                      <Text className="text-sm text-foreground">{s.label}</Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <Animated.View
              key={msg.id}
              entering={FadeIn.duration(200)}
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3',
                msg.role === 'user'
                  ? 'self-end rounded-tr-md bg-primary'
                  : 'self-start rounded-tl-md border border-border bg-card'
              )}
            >
              {msg.role === 'assistant' && (
                <View className="mb-1 flex-row items-center gap-1.5">
                  <Icon as={Sparkles} size={10} className="text-accent" />
                  <Text className="text-2xs font-medium text-accent">Prime AI</Text>
                </View>
              )}
              <Text
                className={cn(
                  'text-sm leading-5',
                  msg.role === 'user' ? 'text-primary-foreground' : 'text-card-foreground'
                )}
              >
                {msg.content}
              </Text>
            </Animated.View>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <Animated.View
              entering={FadeIn.duration(200)}
              className="self-start rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3"
            >
              <View className="flex-row gap-1">
                <View className="h-2 w-2 animate-pulse-soft rounded-full bg-accent" />
                <View className="h-2 w-2 animate-pulse-soft rounded-full bg-accent/70" />
                <View className="h-2 w-2 animate-pulse-soft rounded-full bg-accent/40" />
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View className="border-t border-border px-4 py-3">
          <View className="flex-row items-end gap-2">
            <View className="min-h-[44px] flex-1 flex-row items-center rounded-2xl border border-border bg-card px-4">
              <TextInput
                className="max-h-24 flex-1 py-2.5 text-sm text-foreground"
                placeholder="Ask anything..."
                placeholderTextColor="hsl(210, 10%, 55%)"
                value={input}
                onChangeText={setInput}
                multiline
                onSubmitEditing={() => handleSend()}
              />
            </View>
            <Pressable
              className={cn(
                'h-11 w-11 items-center justify-center rounded-full',
                input.trim() ? 'bg-primary active:bg-primary-hover' : 'bg-muted'
              )}
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Icon
                as={Send}
                size={16}
                className={input.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
