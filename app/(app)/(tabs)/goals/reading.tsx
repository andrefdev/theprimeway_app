import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { Card, CardContent } from '@/shared/components/ui/card';
import { PillTabs } from '@/shared/components/ui/pill-tabs';
import { Header } from '@/shared/components/layout/Header';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { BookOpen, Search, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

const TABS = [
  { key: 'library', label: 'Library' },
  { key: 'explore', label: 'Explore' },
  { key: 'plan', label: 'Plan' },
  { key: 'goals', label: 'Goals' },
];

export default function ReadingScreen() {
  const [activeTab, setActiveTab] = useState('library');
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Header title="Reading" showBack />

      <View className="px-4 py-2">
        <PillTabs tabs={TABS} activeKey={activeTab} onTabPress={setActiveTab} />
      </View>

      {/* Search */}
      <View className="mx-4 mb-3 flex-row items-center rounded-xl border border-border bg-card px-3">
        <Icon as={Search} size={16} className="text-muted-foreground" />
        <TextInput
          className="ml-2 h-10 flex-1 text-sm text-foreground"
          placeholder="Search books..."
          placeholderTextColor="hsl(210, 10%, 55%)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-20"
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <Animated.View entering={FadeInDown.duration(300)} className="flex-row gap-3">
          <StatBadge emoji="📚" value="0" label="To Read" />
          <StatBadge emoji="📖" value="0" label="Reading" />
          <StatBadge emoji="✅" value="0" label="Done" />
          <StatBadge emoji="⭐" value="0" label="Favorites" />
        </Animated.View>

        {/* Empty State */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)} className="mt-8">
          <EmptyState
            icon={BookOpen}
            title="Your library is empty"
            description="Search for books to add to your reading list"
            actionLabel="Search Books"
            onAction={() => setActiveTab('explore')}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBadge({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View className="flex-1 items-center rounded-xl border border-border bg-card py-2.5">
      <Text className="text-sm">{emoji}</Text>
      <Text className="text-sm font-bold text-foreground">{value}</Text>
      <Text className="text-2xs text-muted-foreground">{label}</Text>
    </View>
  );
}
