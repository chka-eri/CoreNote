import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function App() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  const hasDraft = useMemo(
    () => title.trim().length > 0 && body.trim().length > 0,
    [title, body]
  );

  const addNote = () => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle || !trimmedBody) {
      return;
    }

    const note = {
      id: Date.now().toString(),
      title: trimmedTitle,
      body: trimmedBody,
    };

    setNotes((prev) => [note, ...prev]);
    setTitle('');
    setBody('');
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));

    if (selectedNote?.id === id) {
      closeModal();
    }
  };

  const openNote = (note) => {
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

    if (!selectedNote || !trimmedTitle || !trimmedBody) {
      return;
    }

    setNotes((prev) =>
      prev.map((note) =>
        note.id === selectedNote.id
          ? { ...note, title: trimmedTitle, body: trimmedBody }
          : note
      )
    );

    closeModal();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>CoreNote</Text>

      <View style={styles.form}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Note title"
          placeholderTextColor="#8f95a3"
          style={styles.titleInput}
          maxLength={80}
        />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Write your note..."
          placeholderTextColor="#8f95a3"
          style={styles.bodyInput}
          multiline
          textAlignVertical="top"
        />
        <Pressable
          onPress={addNote}
          style={({ pressed }) => [
            styles.addButton,
            !hasDraft && styles.addButtonDisabled,
            pressed && hasDraft && styles.buttonPressed,
          ]}>
          <Text style={styles.addButtonText}>Add Note</Text>
        </Pressable>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notes yet. Add your first one above.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openNote(item)}
            style={({ pressed }) => [styles.noteCard, pressed && styles.cardPressed]}>
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.notePreview} numberOfLines={2} ellipsizeMode="tail">
                {item.body}
              </Text>
            </View>
            <Pressable
              onPress={() => deleteNote(item.id)}
              style={({ pressed }) => [styles.deleteButtonSmall, pressed && styles.buttonPressed]}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </Pressable>
        )}
      />

      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>Edit Note</Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Note title"
              placeholderTextColor="#8f95a3"
              style={styles.titleInput}
            />
            <TextInput
              value={editBody}
              onChangeText={setEditBody}
              placeholder="Note details"
              placeholderTextColor="#8f95a3"
              style={[styles.bodyInput, styles.modalBodyInput]}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={saveEdit}
                style={({ pressed }) => [styles.modalButtonPrimary, pressed && styles.buttonPressed]}>
                <Text style={styles.modalButtonPrimaryText}>Save</Text>
              </Pressable>
              <Pressable
                onPress={closeModal}
                style={({ pressed }) => [styles.modalButtonSecondary, pressed && styles.buttonPressed]}>
                <Text style={styles.modalButtonSecondaryText}>Close</Text>
              </Pressable>
            </View>

            {selectedNote ? (
              <Pressable
                onPress={() => deleteNote(selectedNote.id)}
                style={({ pressed }) => [styles.modalDeleteButton, pressed && styles.buttonPressed]}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f5f9',
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  header: {
    fontSize: 30,
    fontWeight: '700',
    color: '#151927',
    marginBottom: 16,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#d7dbe3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#151927',
    backgroundColor: '#fbfcff',
  },
  bodyInput: {
    borderWidth: 1,
    borderColor: '#d7dbe3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 90,
    marginTop: 10,
    color: '#151927',
    backgroundColor: '#fbfcff',
  },
  addButton: {
    marginTop: 12,
    backgroundColor: '#3b63ff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#aebaf5',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#75809a',
    marginTop: 24,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  noteContent: {
    flex: 1,
    marginRight: 10,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#151927',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#55607a',
    lineHeight: 20,
  },
  deleteButtonSmall: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  deleteButtonText: {
    color: '#bf1e2e',
    fontWeight: '600',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: '#151927',
    marginBottom: 12,
  },
  modalBodyInput: {
    minHeight: 130,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#3b63ff',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#e8edf8',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    color: '#27314a',
    fontWeight: '600',
    fontSize: 15,
  },
  modalDeleteButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
});
