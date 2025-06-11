// NoteList.js
import React, { useEffect, useState } from 'react';
import { decryptNote } from '../lib/crypto';
import { getFromIPFS } from '../lib/ipfs';
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
          try {
            const raw = await getFromIPFS(note.cid);
            const { encrypted, iv } = JSON.parse(raw);

            // Strictly require iv to be an array, else throw
            if (!Array.isArray(iv)) {
              throw new Error('Invalid IV format in IPFS note');
            }

            const ivArray = new Uint8Array(iv);
            
            // Make sure encryptionKey is a string!
            if (typeof encryptionKey !== 'string') {
              throw new Error('Encryption key must be a string');
            }

            const decrypted = await decryptNote(encrypted, ivArray, encryptionKey);

            return { ...note, content: decrypted };
          } catch (err) {
            console.error(`Failed to decrypt note ${note.cid}:`, err);
            return { ...note, content: '[Error decrypting note]' };
          }
        })
      );
      setDecryptedNotes(resolved);
    }
    if (notes.length && encryptionKey) fetchNotes();
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
