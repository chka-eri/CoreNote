import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type NoteItem = {
  id: number;
  text: string;
  done: boolean;
  pinned: boolean;
};

const MAX_NOTE_LENGTH = 180;

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const totalChars = useMemo(
    () => notes.reduce((sum, note) => sum + note.text.length, 0),
    [notes]
  );

  const remainingChars = MAX_NOTE_LENGTH - draft.length;

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? notes.filter((note) => note.text.toLowerCase().includes(query))
      : notes;

    return [...filtered].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notes, search]);

  const completedCount = useMemo(() => notes.filter((note) => note.done).length, [notes]);

  const addNote = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }

    setNotes((prev) => [
      {
        id: Date.now(),
        text,
        done: false,
        pinned: false,
      },
      ...prev,
    ]);
    setDraft('');
  };

  const toggleDone = (id: number) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, done: !note.done } : note))
    );
  };

  const togglePinned = (id: number) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note))
    );
  };

  const deleteNote = (id: number) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingText('');
    }
  };

  const startEditing = (note: NoteItem) => {
    setEditingId(note.id);
    setEditingText(note.text);
  };

  const saveEdit = (id: number) => {
    const text = editingText.trim();
    if (!text) {
      return;
    }

    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, text } : note)));
    setEditingId(null);
    setEditingText('');
  };

  const clearAllNotes = () => {
    setNotes([]);
    setEditingId(null);
    setEditingText('');
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedView style={styles.section}>
        <ThemedText type="title">CoreNote</ThemedText>
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
          onChangeText={(text) => setDraft(text.slice(0, MAX_NOTE_LENGTH))}
          placeholder="Write a short note..."
          style={styles.input}
        />
        <ThemedText style={styles.helperText}>{remainingChars} characters left</ThemedText>

        <Pressable style={styles.addButton} onPress={addNote}>
          <ThemedText type="defaultSemiBold">Add Note</ThemedText>
        </Pressable>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search notes"
          style={styles.input}
        />

        <ThemedText>
          {notes.length} notes • {totalChars} total characters • {completedCount} completed
        </ThemedText>

        {!!notes.length && (
          <Pressable style={styles.clearButton} onPress={clearAllNotes}>
            <ThemedText type="defaultSemiBold">Clear All</ThemedText>
          </Pressable>
        )}

        {visibleNotes.map((note) => (
          <ThemedView key={note.id} style={[styles.noteCard, note.pinned && styles.notePinned]}>
            <View style={styles.noteHeader}>
              <ThemedText type="defaultSemiBold">{note.pinned ? '📌 Pinned' : 'Note'}</ThemedText>
              <View style={styles.row}>
                <Pressable style={styles.smallButton} onPress={() => togglePinned(note.id)}>
                  <ThemedText>{note.pinned ? 'Unpin' : 'Pin'}</ThemedText>
                </Pressable>
                <Pressable style={styles.smallButton} onPress={() => toggleDone(note.id)}>
                  <ThemedText>{note.done ? 'Undo' : 'Done'}</ThemedText>
                </Pressable>
              </View>
            </View>

            {editingId === note.id ? (
              <>
                <TextInput
                  value={editingText}
                  onChangeText={setEditingText}
                  style={styles.input}
                  multiline
                />
                <View style={styles.row}>
                  <Pressable style={styles.smallButton} onPress={() => saveEdit(note.id)}>
                    <ThemedText>Save</ThemedText>
                  </Pressable>
                  <Pressable
                    style={styles.smallButton}
                    onPress={() => {
                      setEditingId(null);
                      setEditingText('');
                    }}>
                    <ThemedText>Cancel</ThemedText>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <ThemedText style={note.done ? styles.completedText : undefined}>{note.text}</ThemedText>
                <View style={styles.row}>
                  <Pressable style={styles.smallButton} onPress={() => startEditing(note)}>
                    <ThemedText>Edit</ThemedText>
                  </Pressable>
                  <Pressable style={styles.smallButton} onPress={() => deleteNote(note.id)}>
                    <ThemedText>Delete</ThemedText>
                  </Pressable>
                </View>
              </>
            )}
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
  helperText: {
    opacity: 0.7,
  },
  addButton: {
    alignItems: 'center',
    borderColor: '#999',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
  },
  clearButton: {
    alignItems: 'center',
    borderColor: '#999',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
  },
  noteCard: {
    borderColor: '#777',
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 10,
  },
  notePinned: {
    borderColor: '#d7a100',
  },
  noteHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallButton: {
    borderColor: '#999',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  completedText: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
});
