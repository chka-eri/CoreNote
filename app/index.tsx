import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STORAGE_KEY = '@CoreNote:notes';

type Note = {
  id: string;
  title: string;
  body: string;
};

const lightColors = {
  bg: '#F0EFF8',
  surface: 'rgba(255,255,255,0.72)',
  surfaceBorder: 'rgba(255,255,255,0.9)',
  text: '#1A1A2E',
  textSecondary: '#6B6B8D',
  primary: '#6C63FF',
  primaryLight: '#8B83FF',
  primaryGlow: 'rgba(108,99,255,0.15)',
  danger: '#FF6B6B',
  dangerBg: 'rgba(255,107,107,0.12)',
  cardShadow: '#6C63FF',
  inputBg: 'rgba(108,99,255,0.06)',
  headerBg: '#6C63FF',
  modalOverlay: 'rgba(26,26,46,0.5)',
  white: '#FFFFFF',
  labelBg: 'rgba(255,255,255,0.5)',
} as const;

const darkColors = {
  bg: '#0D0D1A',
  surface: 'rgba(255,255,255,0.07)',
  surfaceBorder: 'rgba(255,255,255,0.1)',
  text: '#F0EFF8',
  textSecondary: '#8B8BAD',
  primary: '#8B83FF',
  primaryLight: '#AEA8FF',
  primaryGlow: 'rgba(139,131,255,0.15)',
  danger: '#FF6B6B',
  dangerBg: 'rgba(255,107,107,0.2)',
  cardShadow: '#000000',
  inputBg: 'rgba(255,255,255,0.06)',
  headerBg: '#4A42D4',
  modalOverlay: 'rgba(0,0,0,0.7)',
  white: '#FFFFFF',
  labelBg: 'rgba(255,255,255,0.05)',
} as const;

function ScaleButton({
  onPress,
  style,
  children,
  haptic,
  ...props
}: {
  onPress?: () => void;
  style?: any;
  children: React.ReactNode;
  haptic?: boolean;
  [key: string]: any;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 14, stiffness: 250 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 250 });
  };

  const handlePress = () => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function SwipeDeleteAction({
  onDelete,
  colors,
}: {
  onDelete: () => void;
  colors: Record<string, string>;
}) {
  return (
    <View style={[swipeStyles.action, { backgroundColor: colors.danger }]}>
      <Pressable
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onDelete();
        }}
        style={swipeStyles.actionButton}
      >
        <MaterialCommunityIcons name="delete-outline" size={22} color={colors.white} />
        <Text style={swipeStyles.actionText}>Delete</Text>
      </Pressable>
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  action: {
    marginLeft: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored: string | null) => {
      if (stored) setNotes(JSON.parse(stored));
    });
  }, []);

  const persist = useCallback(async (updated: Note[]) => {
    setNotes(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addNote = () => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const note = { id: Date.now().toString(), title: trimmedTitle, body: trimmedBody };
    persist([note, ...notes]);
    setTitle('');
    setBody('');
  };

  const deleteNote = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    persist(notes.filter((n) => n.id !== id));
    if (selectedNote?.id === id) closeModal();
  };

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditBody(note.body);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedNote(null);
    setEditTitle('');
    setEditBody('');
  };

  const saveEdit = () => {
    const trimmedTitle = editTitle.trim();
    const trimmedBody = editBody.trim();
    if (!selectedNote || !trimmedTitle || !trimmedBody) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    persist(
      notes.map((n) =>
        n.id === selectedNote.id ? { ...n, title: trimmedTitle, body: trimmedBody } : n
      )
    );
    closeModal();
  };

  const hasDraft = title.trim().length > 0 && body.trim().length > 0;

  const s = useMemo(
    () => ({
      container: { flex: 1, backgroundColor: colors.bg },
      headerSection: {
        backgroundColor: colors.headerBg,
        paddingTop: 20,
        paddingBottom: 28,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        ...Platform.select({
          ios: {
            shadowColor: colors.headerBg,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.35,
            shadowRadius: 28,
          },
          android: { elevation: 12 },
        }),
      },
      headerTitle: { fontSize: 32, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
      headerSub: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '500' },
      form: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        borderRadius: 20,
        padding: 18,
        marginTop: -14,
        marginHorizontal: 16,
        ...Platform.select({
          ios: {
            shadowColor: colors.cardShadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 24,
          },
          android: { elevation: 8 },
        }),
      },
      inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 6,
        letterSpacing: 0.3,
      },
      titleInput: {
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,99,255,0.15)',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.text,
        backgroundColor: colors.inputBg,
      },
      bodyInput: {
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,99,255,0.15)',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        minHeight: 100,
        marginTop: 12,
        color: colors.text,
        backgroundColor: colors.inputBg,
        textAlignVertical: 'top',
      },
      addButton: {
        marginTop: 14,
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
      },
      addButtonDisabled: { opacity: 0.45 },
      addButtonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
      noteCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        borderRadius: 18,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        ...Platform.select({
          ios: {
            shadowColor: colors.cardShadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.25 : 0.08,
            shadowRadius: 16,
          },
          android: { elevation: 4 },
        }),
      },
      noteContent: { flex: 1, marginRight: 12 },
      noteTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
      notePreview: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
      },
      deleteButtonSmall: {
        backgroundColor: colors.dangerBg,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
      deleteButtonText: { color: colors.danger, fontWeight: '700', fontSize: 13 },
      modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: colors.modalOverlay,
      },
      modalCard: {
        backgroundColor: isDark ? 'rgba(20,20,40,0.95)' : 'rgba(255,255,255,0.95)',
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.15,
            shadowRadius: 32,
          },
          android: { elevation: 16 },
        }),
      },
      modalHeader: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 20 },
      modalBodyInput: { minHeight: 140 },
      modalActions: { flexDirection: 'row', marginTop: 16, gap: 10 },
      modalButtonPrimary: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
      },
      modalButtonPrimaryText: { color: colors.white, fontWeight: '700', fontSize: 15 },
      modalButtonSecondary: {
        flex: 1,
        backgroundColor: colors.inputBg,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
      },
      modalButtonSecondaryText: { color: colors.text, fontWeight: '600', fontSize: 15 },
      modalDeleteButton: {
        marginTop: 14,
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: colors.dangerBg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      },
      emptyIcon: { color: colors.textSecondary, marginBottom: 16 },
      emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        opacity: 0.6,
        marginBottom: 6,
      },
      emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
      headerCircle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.08)',
      },
      labelBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primaryGlow,
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 20,
        marginBottom: 8,
      },
      labelBadgeText: { color: colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    }) as const,
    [colors, isDark]
  );

  const renderItem = ({ item, index }: { item: Note; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(16).stiffness(120)}>
      <Swipeable
        renderRightActions={() => (
          <SwipeDeleteAction onDelete={() => deleteNote(item.id)} colors={colors} />
        )}
        onSwipeableWillOpen={() =>
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }
      >
        <Pressable onPress={() => openNote(item)} style={s.noteCard}>
          <View style={s.noteContent}>
            <Text style={s.noteTitle}>{item.title}</Text>
            <Text style={s.notePreview} numberOfLines={2} ellipsizeMode="tail">
              {item.body}
            </Text>
          </View>
          <ScaleButton
            onPress={() => deleteNote(item.id)}
            style={s.deleteButtonSmall}
            haptic
          >
            <MaterialCommunityIcons name="delete-outline" size={16} color={colors.danger} />
            <Text style={s.deleteButtonText}>Delete</Text>
          </ScaleButton>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <View style={s.headerSection}>
          <View style={[s.headerCircle, { top: -30, right: -20, width: 140, height: 140 }]} />
          <View style={[s.headerCircle, { bottom: -40, left: -30, width: 180, height: 180 }]} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <MaterialCommunityIcons name="note-text-outline" size={28} color={colors.white} />
            <View>
              <Text style={s.headerTitle}>CoreNote</Text>
              <Text style={s.headerSub}>Capture your thoughts</Text>
            </View>
          </View>
        </View>

        <View style={s.form}>
          <View style={s.labelBadge}>
            <Text style={s.labelBadgeText}>NEW NOTE</Text>
          </View>
          <Text style={s.inputLabel}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Give your note a title"
            placeholderTextColor={colors.textSecondary}
            style={s.titleInput}
            maxLength={80}
          />
          <Text style={[s.inputLabel, { marginTop: 12 }]}>Body</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Write your thoughts..."
            placeholderTextColor={colors.textSecondary}
            style={s.bodyInput}
            multiline
            textAlignVertical="top"
          />
          <ScaleButton
            onPress={addNote}
            style={[s.addButton, !hasDraft && s.addButtonDisabled]}
            haptic
          >
            <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
            <Text style={s.addButtonText}>Add Note</Text>
          </ScaleButton>
        </View>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 48 }}>
              <MaterialCommunityIcons
                name="note-text-outline"
                size={64}
                color={colors.textSecondary}
                style={s.emptyIcon}
              />
              <Text style={s.emptyTitle}>No notes yet</Text>
              <Text style={s.emptySub}>Tap the form above to create your first note</Text>
            </View>
          }
          renderItem={renderItem}
        />

        <Modal
          animationType="slide"
          transparent
          visible={isModalVisible}
          onRequestClose={closeModal}
        >
          <View style={s.modalOverlay}>
            <Pressable style={{ flex: 1 }} onPress={closeModal} />
            <Animated.View
              entering={FadeInDown.springify().damping(20).stiffness(150)}
              style={s.modalCard}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.primary} />
                <Text style={s.modalHeader}>Edit Note</Text>
              </View>
              <Text style={s.inputLabel}>Title</Text>
              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Note title"
                placeholderTextColor={colors.textSecondary}
                style={s.titleInput}
              />
              <Text style={[s.inputLabel, { marginTop: 12 }]}>Body</Text>
              <TextInput
                value={editBody}
                onChangeText={setEditBody}
                placeholder="Note details"
                placeholderTextColor={colors.textSecondary}
                style={[s.bodyInput, s.modalBodyInput]}
                multiline
                textAlignVertical="top"
              />
              <View style={s.modalActions}>
                <ScaleButton onPress={saveEdit} style={s.modalButtonPrimary} haptic>
                  <MaterialCommunityIcons name="check" size={18} color={colors.white} />
                  <Text style={s.modalButtonPrimaryText}>Save</Text>
                </ScaleButton>
                <ScaleButton onPress={closeModal} style={s.modalButtonSecondary}>
                  <MaterialCommunityIcons name="close" size={18} color={colors.text} />
                  <Text style={s.modalButtonSecondaryText}>Cancel</Text>
                </ScaleButton>
              </View>
              {selectedNote && (
                <ScaleButton
                  onPress={() => deleteNote(selectedNote.id)}
                  style={s.modalDeleteButton}
                  haptic
                >
                  <MaterialCommunityIcons name="delete-outline" size={18} color={colors.danger} />
                  <Text style={s.deleteButtonText}>Delete Note</Text>
                </ScaleButton>
              )}
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
