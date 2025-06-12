import React, { useEffect, useState } from "react";
import { decryptNote } from "../lib/crypto";
import { getFromIPFS } from "../lib/ipfs";
import styled from "styled-components";

const stickyColors = ["#FFF176", "#AED581", "#81D4FA", "#FFAB91", "#CE93D8"];

const NotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  width: 100%;
`;
const NoteContainer = styled.div`
  background-color: ${({ color }) => color};
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.15);
  font-family: "Comic Sans MS", cursive, sans-serif;
  word-wrap: break-word;
  position: relative;
  transform: rotate(${({ rotation }) => rotation}deg);
  animation: fadeIn 0.4s ease-in;
  min-height: 120px;
  transition: transform 0.2s ease-in-out;
  white-space: pre-wrap;

  &:hover {
    transform: scale(1.03);
    z-index: 10;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// const NoteContainer = styled.div`
//   background-color: ${({ color }) => color};
//   padding: 1rem;
//   border-radius: 12px;
//   box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.15);
//   font-family: "Comic Sans MS", cursive, sans-serif;
//   word-wrap: break-word;
//   position: relative;
//   transform: rotate(${() => Math.random() * 4 - 2}deg);
//   animation: fadeIn 0.4s ease-in;
//   min-height: 120px;
//   transition: transform 0.2s ease-in-out;
//   white-space: pre-wrap;

//   &:hover {
//     transform: scale(1.03);
//     z-index: 10;
//   }

//   @keyframes fadeIn {
//     from {
//       opacity: 0;
//       transform: scale(0.95);
//     }
//     to {
//       opacity: 1;
//       transform: scale(1);
//     }
//   }
// `;

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef5350;
  color: white;
  border: none;
  padding: 0.4rem 0.6rem;
  border-radius: 50%;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
  transition: background 0.2s ease;

  &:hover {
    background: #c62828;
  }
`;

const NoteText = styled.div`
  font-size: 1rem;
  color: #333;
  white-space: pre-wrap;
`;

export default function NoteList({ notes, setNotes, encryptionKey }) {
  const [decryptedNotes, setDecryptedNotes] = useState([]);

  //   useEffect(() => {
  //     async function fetchNotes() {

  //         if (!notes.length) {
  //             setDecryptedNotes([]);
  //             return;
  //           }
  //       const resolved = await Promise.all(
  //         notes.map(async (note) => {
  //           try {
  //             const raw = await getFromIPFS(note.cid);
  //             const { encrypted, iv } = JSON.parse(raw);

  //             if (!Array.isArray(iv)) {
  //               throw new Error("Invalid IV format in IPFS note");
  //             }

  //             const ivArray = new Uint8Array(iv);

  //             if (typeof encryptionKey !== "string") {
  //               throw new Error("Encryption key must be a string");
  //             }

  //             const decrypted = await decryptNote(
  //               encrypted,
  //               ivArray,
  //               encryptionKey
  //             );
  //             const rotation = Math.random() * 4 - 2;

  //             return { ...note, content: decrypted,rotation };
  //           } catch (err) {
  //             console.error(`Failed to decrypt note ${note.cid}:`, err);
  //             return { ...note, content: "[Error decrypting note]" };
  //           }
  //         })
  //       );
  //       setDecryptedNotes(resolved);
  //     }
  //     if (notes.length && encryptionKey) fetchNotes();
  //   }, [notes, encryptionKey]);

  useEffect(() => {
    async function fetchNotes() {
      if (!notes.length) {
        setDecryptedNotes([]);
        return;
      }

      const resolved = await Promise.all(
        notes.map(async (note) => {
          try {
            const raw = await getFromIPFS(note.cid);
            const { encrypted, iv } = JSON.parse(raw);

            if (!Array.isArray(iv)) {
              throw new Error("Invalid IV format in IPFS note");
            }

            const ivArray = new Uint8Array(iv);

            if (typeof encryptionKey !== "string") {
              throw new Error("Encryption key must be a string");
            }

            const decrypted = await decryptNote(
              encrypted,
              ivArray,
              encryptionKey
            );
            const rotation = Math.random() * 4 - 2;

            // Don't mutate original note object
            return { cid: note.cid, content: decrypted, rotation };
          } catch (err) {
            console.error(`Failed to decrypt note ${note.cid}:`, err);
            return {
              cid: note.cid,
              content: "[Error decrypting note]",
              rotation: 0,
            };
          }
        })
      );

      setDecryptedNotes(resolved);
    }

    if (notes.length && encryptionKey) {
      fetchNotes();
    }
  }, [notes, encryptionKey]);

  function handleDelete(cidToDelete) {
    const updated = notes.filter((note) => note.cid !== cidToDelete);
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
  }

  return (
    <NotesGrid>
      {decryptedNotes.map((note, i) => (
        <NoteContainer
          key={note.cid}
          color={stickyColors[i % stickyColors.length]}
          rotation={note.rotation}
        >
          <DeleteButton
            title="Delete Note"
            onClick={() => handleDelete(note.cid)}
          >
            ×
          </DeleteButton>
          <NoteText>{note.content}</NoteText>
        </NoteContainer>
      ))}
    </NotesGrid>
  );
}
