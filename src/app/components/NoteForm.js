import { useState } from 'react';
import { encryptNote } from '../lib/crypto';
import { uploadToIPFS } from '../lib/ipfs';

export default function NoteForm({ onNoteCreated }) {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');

  const handleSave = async () => {
    const { encrypted, iv } = await encryptNote(text, password);
    const cid = await uploadToIPFS(JSON.stringify({ encrypted, iv }));
    onNoteCreated(cid);
    setText('');
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSave}>Save Note</button>
    </div>
  );
}