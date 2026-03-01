import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState<string[]>([]);

  const totalChars = useMemo(
    () => notes.reduce((sum, note) => sum + note.length, 0),
    [notes]
  );

  const addNote = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    setNotes((prev) => [text, ...prev]);
    setDraft('');
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedView style={styles.section}>
        <ThemedText type="title">CoreNote</ThemedText>
        <ThemedText>Tabs removed. This is now a single simple home screen.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Counter</ThemedText>
        <ThemedText style={styles.counterValue}>{count}</ThemedText>
        <View style={styles.row}>
          <Pressable style={styles.button} onPress={() => setCount((value) => value - 1)}>
            <ThemedText type="defaultSemiBold">-1</ThemedText>
          </Pressable>
          <Pressable style={styles.button} onPress={() => setCount((value) => value + 1)}>
            <ThemedText type="defaultSemiBold">+1</ThemedText>
          </Pressable>
          <Pressable style={styles.button} onPress={() => setCount(0)}>
            <ThemedText type="defaultSemiBold">Reset</ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Quick Notes</ThemedText>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a short note..."
          style={styles.input}
        />
        <Pressable style={styles.addButton} onPress={addNote}>
          <ThemedText type="defaultSemiBold">Add Note</ThemedText>
        </Pressable>
        <ThemedText>
          {notes.length} notes • {totalChars} total characters
        </ThemedText>

        {notes.map((note, index) => (
          <ThemedView key={`${note}-${index}`} style={styles.noteCard}>
            <ThemedText type="defaultSemiBold">Note {notes.length - index}</ThemedText>
            <ThemedText>{note}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 12,
    gap: 10,
    padding: 14,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    borderColor: '#999',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    borderColor: '#999',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButton: {
    alignItems: 'center',
    borderColor: '#999',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
  },
  noteCard: {
    borderColor: '#777',
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 10,
  },
});
