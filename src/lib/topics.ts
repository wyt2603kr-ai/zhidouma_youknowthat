export type Topic = {
  name: string;
  emoji: string;
  /** 卡片背景色 */
  color: string;
};

export const TOPICS: Topic[] = [
  { name: '历史', emoji: '🏛️', color: '#7A4B2A' },
  { name: '地理', emoji: '🌏', color: '#1F6F5C' },
  { name: '物理', emoji: '⚛️', color: '#2B3A8C' },
  { name: '生物', emoji: '🧬', color: '#3E7A2E' },
  { name: '人体', emoji: '🫀', color: '#9C3D4A' },
  { name: '天文', emoji: '🪐', color: '#2A1E5C' },
  { name: '化学', emoji: '🧪', color: '#1E6A8C' },
  { name: '经济', emoji: '💰', color: '#8C6A1E' },
  { name: '心理', emoji: '🧠', color: '#6B3E8C' },
  { name: '语言文字', emoji: '🔤', color: '#4A5568' },
  { name: '艺术', emoji: '🎨', color: '#A0446B' },
  { name: '美食', emoji: '🍜', color: '#B5562A' },
  { name: '科技', emoji: '💡', color: '#2D5F7A' },
  { name: '动物', emoji: '🐙', color: '#2E7A6B' },
  { name: '生活常识', emoji: '🏠', color: '#5C6B2E' },
];

const FALLBACK_COLOR = '#33384A';

export function topicColor(name: string): string {
  return TOPICS.find((t) => t.name === name)?.color ?? FALLBACK_COLOR;
}
