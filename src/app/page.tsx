// import Image from "next/image";
// import styles from "./page.module.css";

// export default function Home() {
//   return (
//     <div className={styles.page}>
   
//     </div>
//   );
// }

import Web3 from 'web3';
import { useEffect, useState } from 'react';

export default function Home() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => setAccount(accounts[0]));
    }
  }, []);

  return (
    <div>
      <h1>Welcome {account ? account : 'Connect your wallet'}</h1>
    </div>
  );
}
