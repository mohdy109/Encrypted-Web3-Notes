import { create } from 'ipfs-http-client';

const client = create({ url: 'https://ipfs.io' });

export async function uploadToIPFS(content) {
  const { path } = await client.add(content);
  return path; // CID
}

export async function getFromIPFS(cid) {
  const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
  return await response.text();
}