'use client'

import { useEffect, useState } from 'react';
import Web3 from 'web3';
import styled from 'styled-components';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import { sha256 } from 'js-sha256';

const Container = styled.div`
  max-width: 800px;
  margin: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #333;
`;

const WalletInfo = styled.div`
  margin-bottom: 2rem;
  font-size: 1rem;
  color: #555;
`;

const ConnectButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: #0056c1;
  }
`;


export default function Home() {
  const [account, setAccount] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [notes, setNotes] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('notes') || '[]');
    }
    return [];
  });

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
        if (accounts.length) {
          setAccount(accounts[0]);
          await generateEncryptionKey(accounts[0], web3);
        }
      });
    }
  }, []);

  // Connect wallet and generate encryption key
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        await generateEncryptionKey(accounts[0], web3);
      } catch (err) {
        console.error('User denied wallet connection');
      }
    } else {
      alert('Please install MetaMask to continue.');
    }
  };

  // Ask user to sign message and derive encryption key (hashed signature)
  const generateEncryptionKey = async (walletAddress, web3) => {
    const message = `Unlock notes for ${walletAddress}`;
    try {
      const signature = await web3.eth.personal.sign(message, walletAddress, '');
      const key = sha256(signature); // hex string password
      setEncryptionKey(key);
    } catch (err) {
      console.error('Failed to sign message for encryption key:', err);
      setEncryptionKey(null);
    }
  };

  const handleNoteCreated = (cid) => {
    const newNotes = [...notes, { cid }];
    setNotes(newNotes);
    localStorage.setItem('notes', JSON.stringify(newNotes));
  };

  return (
    <Container>
      <Title>📝 Encrypted Notes on IPFS</Title>
      {account ? (
        <>
          <WalletInfo>Connected as: {account}</WalletInfo>
          <NoteForm onNoteCreated={handleNoteCreated} encryptionKey={encryptionKey} />
          {/* Only show notes if encryptionKey is ready */}
          {encryptionKey ? (
            <NoteList notes={notes} setNotes={setNotes} encryptionKey={encryptionKey} />
          ) : (
            <p>Please sign message to unlock your notes</p>
          )}
        </>
      ) : (
        <ConnectButton onClick={connectWallet}>Connect Wallet</ConnectButton>
      )}
    </Container>
  );
}
