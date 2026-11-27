import { Pressable, StyleSheet, Text, View } from 'react-native';

import { topicColor } from '@/lib/topics';
import type { KnowledgeCard } from '@/lib/types';

export type Feedback = 'like' | 'dislike';

type Props = {
  card: KnowledgeCard;
  height: number;
  saved: boolean;
  feedback?: Feedback;
  topInset: number;
  bottomInset: number;
  onToggleSave: () => void;
  onFeedback: (f: Feedback) => void;
  onRelated: (topic: string) => void;
};

/** 一屏一张的全屏知识卡片 */
export function KnowledgeCardView({
  card,
  height,
  saved,
  feedback,
  topInset,
  bottomInset,
  onToggleSave,
  onFeedback,
  onRelated,
}: Props) {
  return (
    <View
      style={[
        styles.page,
        {
          height,
          backgroundColor: topicColor(card.topic),
          paddingTop: topInset + 24,
          paddingBottom: bottomInset + 24,
        },
      ]}>
      <View style={styles.content}>
        <Text style={styles.topic}>#{card.topic}</Text>
        <Text style={styles.emoji}>{card.emoji}</Text>
        <Text style={styles.hook}>{card.hook}</Text>
        <Text style={styles.body}>{card.body}</Text>

        {card.related.length > 0 && (
          <View style={styles.relatedBox}>
            <Text style={styles.relatedLabel}>顺藤摸瓜 👇</Text>
            <View style={styles.relatedRow}>
              {card.related.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => onRelated(r)}
                  style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
                  <Text style={styles.chipText}>{r} →</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <ActionButton
          icon="😐"
          label="没兴趣"
          active={feedback === 'dislike'}
          onPress={() => onFeedback('dislike')}
        />
        <ActionButton
          icon="🤩"
          label="有意思"
          active={feedback === 'like'}
          onPress={() => onFeedback('like')}
        />
        <ActionButton
          icon={saved ? '⭐' : '☆'}
          label={saved ? '已收藏' : '收藏'}
          active={saved}
          onPress={onToggleSave}
        />
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.action, active && styles.actionActive, pressed && styles.pressed]}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    justifyContent: 'center',
    gap: 16,
  },
  topic: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  emoji: {
    fontSize: 56,
  },
  hook: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '800',
  },
  body: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 17,
    lineHeight: 28,
  },
  relatedBox: {
    marginTop: 8,
    gap: 8,
  },
  relatedLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  relatedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipText: {
    color: '#fff',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 560,
    justifyContent: 'center',
  },
  action: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.18)',
    gap: 2,
  },
  actionActive: {
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
  },
  pressed: {
    opacity: 0.6,
  },
});
