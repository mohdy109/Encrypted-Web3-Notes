// NoteList.js
import React, { useEffect, useState } from 'react';
import { decryptNote } from '../utils/crypto';
import { getFromIPFS } from '../utils/ipfs';
import styled from 'styled-components';

const NoteContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
`;

const Button = styled.button`
  margin-left: 8px;
  background: #ff5252;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
`;

export default function NoteList({ notes, setNotes, encryptionKey }) {
  const [decryptedNotes, setDecryptedNotes] = useState([]);

  useEffect(() => {
    async function fetchNotes() {
      const resolved = await Promise.all(
        notes.map(async (note) => {
          const encrypted = await getFromIPFS(note.cid);
          const decrypted = await decryptNote(encrypted, encryptionKey);
          return { ...note, content: decrypted };
        })
      );
      setDecryptedNotes(resolved);
    }
    fetchNotes();
  }, [notes, encryptionKey]);

  function handleDelete(cid) {
    const updated = notes.filter((note) => note.cid !== cid);
    setNotes(updated);
    localStorage.setItem('notes', JSON.stringify(updated));
  }

  return (
    <div>
      {decryptedNotes.map((note) => (
        <NoteContainer key={note.cid}>
          <div>{note.content}</div>
          <Button onClick={() => handleDelete(note.cid)}>Delete</Button>
        </NoteContainer>
      ))}
    </div>
  );
}
