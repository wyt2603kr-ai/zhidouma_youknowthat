import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InterestPicker } from '@/components/interest-picker';
import { type Feedback, KnowledgeCardView } from '@/components/knowledge-card';
import { BottomTabInset } from '@/constants/theme';
import { toggleSaved, useSaved } from '@/hooks/use-saved';
import { fetchCards, pickTopics } from '@/lib/api';
import {
  addSeen,
  getInterests,
  getSeen,
  getWeights,
  setInterests as saveInterests,
  setWeights,
} from '@/lib/storage';
import type { KnowledgeCard } from '@/lib/types';

const BATCH_SIZE = 5;
/** 网页版顶部有一条悬浮导航栏 */
const WEB_TOP_BAR = Platform.OS === 'web' ? 72 : 0;

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const saved = useSaved();

  const [interests, setInterests] = useState<string[] | null>(null);
  const [editingInterests, setEditingInterests] = useState(false);
  const [cards, setCards] = useState<KnowledgeCard[]>([]);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [height, setHeight] = useState(0);
  const [index, setIndex] = useState(0);

  const listRef = useRef<FlatList<KnowledgeCard>>(null);
  const loadingRef = useRef(false);

  /** 拉一批新卡片。focus 有值时围绕该话题深挖 */
  const load = useCallback(
    async (opts: { focus?: string; topics?: string[] } = {}) => {
      if (loadingRef.current) return [];
      const list = opts.topics ?? interests;
      if (!list || list.length === 0) return [];
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const [weights, seen] = await Promise.all([getWeights(), getSeen()]);
        const res = await fetchCards({
          topics: opts.focus ? list : pickTopics(list, weights),
          focus: opts.focus,
          exclude: seen.slice(0, 40),
          count: opts.focus ? 3 : BATCH_SIZE,
        });
        setDemo(!!res.demo);
        void addSeen(res.cards.map((c) => c.hook));
        return res.cards;
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败');
        return [];
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [interests],
  );

  const appendMore = useCallback(
    async (topics?: string[]) => {
      const more = await load({ topics });
      if (more.length) setCards((c) => [...c, ...more]);
    },
    [load],
  );

  // 启动时读取兴趣，已选过就直接拉第一批
  useEffect(() => {
    getInterests().then((list) => {
      setInterests(list);
      if (list.length > 0) void appendMore(list);
    });
    // 只在首次挂载时执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLayout = (e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!height) return;
    const i = Math.round(e.nativeEvent.contentOffset.y / height);
    if (i !== index) setIndex(i);
    // 快滑到底时提前加载下一批，做到"无限滑"
    if (i >= cards.length - 2) void appendMore();
  };

  const onFeedback = async (card: KnowledgeCard, f: Feedback) => {
    const prev = feedback[card.id];
    const next = prev === f ? undefined : f;
    setFeedback((m) => {
      const copy = { ...m };
      if (next) copy[card.id] = next;
      else delete copy[card.id];
      return copy;
    });
    const delta = (v?: Feedback) => (v === 'like' ? 0.5 : v === 'dislike' ? -0.5 : 0);
    const weights = await getWeights();
    weights[card.topic] = (weights[card.topic] ?? 0) - delta(prev) + delta(next);
    await setWeights(weights);
  };

  const onRelated = async (card: KnowledgeCard, topic: string) => {
    const at = cards.findIndex((c) => c.id === card.id);
    const extra = await load({ focus: topic, topics: [card.topic, ...(interests ?? [])] });
    if (!extra.length) return;
    setCards((c) => [...c.slice(0, at + 1), ...extra, ...c.slice(at + 1)]);
    requestAnimationFrame(() => listRef.current?.scrollToIndex({ index: at + 1, animated: true }));
  };

  const onPickInterests = async (topics: string[]) => {
    await saveInterests(topics);
    setInterests(topics);
    setEditingInterests(false);
    setCards([]);
    setIndex(0);
    void appendMore(topics);
  };

  if (interests === null) return <View style={styles.fill} />;
  if (interests.length === 0 || editingInterests) {
    return <InterestPicker initial={interests} onDone={onPickInterests} />;
  }

  const topInset = insets.top + WEB_TOP_BAR;
  const bottomInset = insets.bottom + BottomTabInset;

  return (
    <View style={styles.fill} onLayout={onLayout}>
      {height > 0 && (
        <FlatList
          ref={listRef}
          data={cards}
          keyExtractor={(c) => c.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={100}
          getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })}
          windowSize={5}
          renderItem={({ item }) => (
            <KnowledgeCardView
              card={item}
              height={height}
              topInset={topInset}
              bottomInset={bottomInset}
              saved={saved.some((s) => s.id === item.id)}
              feedback={feedback[item.id]}
              onToggleSave={() => toggleSaved(item)}
              onFeedback={(f) => onFeedback(item, f)}
              onRelated={(t) => onRelated(item, t)}
            />
          )}
          ListEmptyComponent={
            <View style={[styles.center, { height }]}>
              {error ? (
                <>
                  <Text style={styles.msg}>{error}</Text>
                  <Pressable onPress={() => appendMore()} style={styles.retry}>
                    <Text style={styles.retryText}>重试</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <ActivityIndicator color="#F5C26B" />
                  <Text style={styles.msg}>AI 正在挑选好玩的知识…</Text>
                </>
              )}
            </View>
          }
        />
      )}

      <View style={[styles.topBar, { top: topInset + 8 }]} pointerEvents="box-none">
        {demo && <Text style={styles.badge}>示例内容 · 未配置 AI</Text>}
        {loading && cards.length > 0 && <ActivityIndicator color="#fff" size="small" />}
        <Pressable onPress={() => setEditingInterests(true)} style={styles.badgeBtn}>
          <Text style={styles.badgeBtnText}>⚙️ 兴趣</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: '#14161F',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  msg: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    textAlign: 'center',
  },
  retry: {
    backgroundColor: '#F5C26B',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryText: {
    color: '#14161F',
    fontWeight: '700',
  },
  topBar: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  badgeBtn: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  badgeBtnText: {
    color: '#fff',
    fontSize: 13,
  },
});
