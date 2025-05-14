'use client';
import styles from "./styles.module.css";
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
          <Button
            variant="contained"
            onClick={() => router.push('/ggsheet')}
            sx={{ width: '200px' }}
          >
            Go to Google Sheet
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/nhanhvn')}
            sx={{ width: '200px' }}
          >
            Go to NhanhVN
          </Button>
        </div>
      </main>
    </div>
  );
}