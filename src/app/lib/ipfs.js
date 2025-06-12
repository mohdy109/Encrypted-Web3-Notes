// const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

// export async function uploadToIPFS(content) {
//   const formData = new FormData();
//   const blob = new Blob([content], { type: 'application/json' });
//   formData.append('file', blob);

//   const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${PINATA_JWT}`,
//     },
//     body: formData,
//   });

//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(`Upload failed: ${err}`);
//   }

//   const data = await res.json();
//   return data.IpfsHash; // This is the CID
// }

// export async function getFromIPFS(cid) {
//   const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
//   if (!res.ok) throw new Error('Failed to fetch from IPFS');
//   return await res.text();
// }
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

/**
 * @param {string} content 
 * @returns {Promise<string>} 
 */
export async function uploadToIPFS(content) {
  const formData = new FormData();
  const blob = new Blob([content], { type: "application/json" });
  formData.append("file", blob);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
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

/**
 * @param {string} cid 
 * @returns {Promise<string>} 
 */
export async function getFromIPFS(cid) {
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
  ];

  for (const url of gateways) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Gateway failed (${url}): ${res.status}`);
        continue;
      }
      return await res.text();
    } catch (err) {
      console.warn(`Fetch error on ${url}:`, err.message);
    }
  }

  throw new Error(`All IPFS gateways failed for CID: ${cid}`);
}
