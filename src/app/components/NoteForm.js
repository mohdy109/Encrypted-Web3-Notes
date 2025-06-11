import { useState } from 'react';
import { encryptNote } from '../lib/crypto';
import { uploadToIPFS } from '../lib/ipfs';
import { sha256 } from 'js-sha256'; 
import Web3 from 'web3';

export default function NoteForm({ onNoteCreated ,encryptionKey }) {
  const [text, setText] = useState('');


  const handleSave = async () => {
    if (!encryptionKey) {
      alert('Please unlock your notes by signing the message first.');
      return;
    }

    const { encrypted, iv } = await encryptNote(text, encryptionKey);
    const cid = await uploadToIPFS(JSON.stringify({ encrypted, iv }));
    onNoteCreated(cid);
    setText('');
  };

  
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleSave}>Save Note</button>
    </div>
  );
}