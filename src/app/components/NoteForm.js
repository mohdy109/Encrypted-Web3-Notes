import { useState } from "react";
import { encryptNote } from "../lib/crypto";
import { uploadToIPFS } from "../lib/ipfs";
import { sha256 } from "js-sha256";
import Web3 from "web3";
import styled from "styled-components";

const FormContainer = styled.div`
  margin: 2rem 0;
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  background: #fffbe6;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.1);
  resize: vertical;
  outline: none;
`;

const SaveButton = styled.button`
  margin-top: 1rem;
  background: ${({ disabled }) => (disabled ? "#ccc" : "#00b894")};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: background 0.3s;

  &:hover {
    background: ${({ disabled }) => (disabled ? "#ccc" : "#019174")};
  }
`;
export default function NoteForm({ onNoteCreated, encryptionKey }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!encryptionKey) {
      alert("Please unlock your notes by signing the message first.");
      return;
    }
    try {
      setLoading(true);
      const { encrypted, iv } = await encryptNote(text, encryptionKey);
      const cid = await uploadToIPFS(JSON.stringify({ encrypted, iv }));
      onNoteCreated(cid);
      setText("");
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Failed to save note. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your note..."
        disabled={loading}
      />
      <SaveButton onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "➕ Save Note"}</SaveButton>
    </FormContainer>
  );
}
