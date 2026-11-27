import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TOPICS } from '@/lib/topics';

type Props = {
  initial: string[];
  onDone: (topics: string[]) => void;
};

/** 首次打开时选择感兴趣的领域 */
export function InterestPicker({ initial, onDone }: Props) {
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.logo}>知豆 🫘</Text>
        <Text style={styles.title}>你对什么好奇？</Text>
        <Text style={styles.subtitle}>选几个领域，之后随时能改。不确定就多选点。</Text>

        <View style={styles.grid}>
          {TOPICS.map((t) => {
            const on = selected.includes(t.name);
            return (
              <Pressable
                key={t.name}
                onPress={() => toggle(t.name)}
                style={[styles.chip, on && { backgroundColor: t.color, borderColor: t.color }]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {t.emoji} {t.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          disabled={selected.length === 0}
          onPress={() => onDone(selected)}
          style={({ pressed }) => [
            styles.start,
            selected.length === 0 && styles.startDisabled,
            pressed && { opacity: 0.8 },
          ]}>
          <Text style={styles.startText}>
            {selected.length === 0 ? '至少选一个' : `开始刷知识（${selected.length}）`}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14161F',
  },
  scroll: {
    padding: 24,
    paddingTop: 80,
    gap: 12,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  logo: {
    color: '#F5C26B',
    fontSize: 20,
    fontWeight: '800',
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  chipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },
  chipTextOn: {
    color: '#fff',
    fontWeight: '700',
  },
  start: {
    marginTop: 24,
    backgroundColor: '#F5C26B',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startDisabled: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  startText: {
    color: '#14161F',
    fontSize: 17,
    fontWeight: '800',
  },
});
