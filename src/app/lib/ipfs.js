const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export async function uploadToIPFS(content) {
  const formData = new FormData();
  const blob = new Blob([content], { type: 'application/json' });
  formData.append('file', blob);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${err}`);
  }

  const data = await res.json();
  return data.IpfsHash; // This is the CID
}

export async function getFromIPFS(cid) {
  const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
  if (!res.ok) throw new Error('Failed to fetch from IPFS');
  return await res.text();
}
