import { View, Pressable, TextInput } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { useNotes } from '@features/notes/hooks/useNotes';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { Plus, FileText, Search, Pin, AlertTriangle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { Note } from '@shared/types/models';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NotesScreen() {
  const { t } = useTranslation('features.notes');
  const [search, setSearch] = useState('');
  const { data: notes, isLoading, isError, refetch } = useNotes({ search: search || undefined });

  const pinnedNotes = notes?.filter((n) => n.isPinned) ?? [];
  const otherNotes = notes?.filter((n) => !n.isPinned) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-1 pt-3">
        <Text className="text-2xl font-bold text-foreground">{t('title')}</Text>
        <Pressable
          onPress={() => router.push('/(app)/notes/new' as never)}
          className="h-9 w-9 items-center justify-center rounded-full bg-primary active:bg-primary-hover"
          hitSlop={8}
        >
          <Icon as={Plus} size={18} className="text-primary-foreground" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View className="mx-4 mb-3 mt-2 flex-row items-center rounded-xl border border-border bg-card px-3">
        <Icon as={Search} size={16} className="text-muted-foreground" />
        <TextInput
          className="ml-2 h-10 flex-1 text-sm text-foreground"
          placeholder={t('search')}
          placeholderTextColor="hsl(210, 10%, 55%)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <LoadingOverlay />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Could not load notes"
          description="Check your connection and try again"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : !notes?.length ? (
        <EmptyState
          icon={FileText}
          title={t('noNotes')}
          description={t('noNotesDescription')}
          actionLabel={t('newNote')}
          onAction={() => router.push('/(app)/notes/new' as never)}
        />
      ) : (
        <FlatList
          data={[...pinnedNotes, ...otherNotes]}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item, index }) => (
            <NoteCard note={item} index={index} />
          )}
          onRefresh={refetch}
          refreshing={false}
          contentContainerClassName="px-2 pb-20"
        />
      )}
    </SafeAreaView>
  );
}

function NoteCard({ note, index }: { note: Note; index: number }) {
  const contentPreview = note.content
    ? note.content.replace(/<[^>]*>/g, '').slice(0, 120)
    : '';

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(250)} className="w-1/2 p-1.5">
      <Pressable
        className={cn(
          'rounded-xl border bg-card p-3 active:bg-muted',
          note.isPinned ? 'border-primary/30' : 'border-border'
        )}
        onPress={() => router.push(`/(app)/notes/${note.id}` as never)}
      >
        {/* Pin indicator */}
        {note.isPinned && (
          <View className="mb-2 flex-row items-center gap-1">
            <Icon as={Pin} size={10} className="text-primary" />
            <Text className="text-2xs font-medium text-primary">Pinned</Text>
          </View>
        )}

        {/* Title */}
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {note.title}
        </Text>

        {/* Preview */}
        {contentPreview && (
          <Text className="mt-1 text-xs leading-4 text-muted-foreground" numberOfLines={3}>
            {contentPreview}
          </Text>
        )}

        {/* Category + Date */}
        <View className="mt-2 flex-row items-center gap-2">
          {note.category && (
            <View
              className="rounded-full px-1.5 py-0.5"
              style={{ backgroundColor: note.category.color + '25' }}
            >
              <Text className="text-2xs font-medium" style={{ color: note.category.color }}>
                {note.category.name}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
