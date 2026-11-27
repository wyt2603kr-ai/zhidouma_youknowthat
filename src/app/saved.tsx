import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';
import { toggleSaved, useSaved } from '@/hooks/use-saved';
import { topicColor } from '@/lib/topics';

const WEB_TOP_BAR = Platform.OS === 'web' ? 72 : 0;

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const saved = useSaved();

  return (
    <View style={styles.container}>
      <FlatList
        data={saved}
        keyExtractor={(c) => c.id}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: insets.top + WEB_TOP_BAR + 16,
            paddingBottom: insets.bottom + BottomTabInset + 24,
          },
        ]}
        ListHeaderComponent={<Text style={styles.title}>我的收藏 · {saved.length}</Text>}
        ListEmptyComponent={
          <Text style={styles.empty}>还没有收藏。刷到有意思的知识，点 ☆ 收藏就会出现在这里。</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: topicColor(item.topic) }]}>
            <View style={styles.row}>
              <Text style={styles.topic}>
                {item.emoji} #{item.topic}
              </Text>
              <Pressable onPress={() => toggleSaved(item)} hitSlop={8}>
                <Text style={styles.remove}>取消收藏</Text>
              </Pressable>
            </View>
            <Text style={styles.hook}>{item.hook}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14161F',
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  empty: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#1E212D',
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topic: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  remove: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
  },
  hook: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  body: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    lineHeight: 24,
  },
});
