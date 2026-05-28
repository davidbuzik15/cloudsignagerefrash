import Head from 'next/head';
import { Dashboard } from '@/components/Dashboard/Dashboard';

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard - Presentv Player</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Digital Signage Management Dashboard" />
      </Head>
      <Dashboard />
    </>
  );
}
