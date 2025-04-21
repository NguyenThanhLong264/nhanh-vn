'use client';
import ConditionForm from "./components/ConditionForm";
import styles from "./styles.module.css";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <button
          className={styles.button}
          onClick={() => router.push('/config')}
        >
          Go to Configuration
        </button>
        <ConditionForm />
      </main>
    </div>
  );
}