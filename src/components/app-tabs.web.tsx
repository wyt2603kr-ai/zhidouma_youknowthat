import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>刷知识</TabButton>
          </TabTrigger>
          <TabTrigger name="saved" href="/saved" asChild>
            <TabButton>收藏</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View style={[styles.tabButton, isFocused && styles.tabButtonActive]}>
        <Text style={[styles.tabText, isFocused && styles.tabTextActive]}>{children}</Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.brand}>知豆 🫘</Text>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    padding: 12,
    alignItems: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 560,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(20,22,31,0.75)',
  },
  brand: {
    color: '#F5C26B',
    fontWeight: '800',
    fontSize: 16,
    marginRight: 'auto',
  },
  tabButton: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
