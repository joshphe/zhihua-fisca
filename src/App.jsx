import { useState, useEffect, useRef } from 'react';
import { useData } from './context/DataContext';
import { useUser } from './context/UserContext';
import { IconMoon, IconSun } from './components/Icons';
import LoginPage from './components/LoginPage';
import UserMenu from './components/UserMenu';
import FileUpload from './components/FileUpload';
import Overview from './components/Overview';
import MonthlyTrend from './components/MonthlyTrend';
import CategoryBreakdown from './components/CategoryBreakdown';
import EssentialAnalysis from './components/EssentialAnalysis';
import DailyDetail from './components/DailyDetail';
import AnomalyHighlight from './components/AnomalyHighlight';
import Recommendations from './components/Recommendations';
import TrapAnalysis from './components/TrapAnalysis';
import SaveModal from './components/SaveModal';
import LoadModal from './components/LoadModal';

export default function App() {
  const { user } = useUser();
  const { transactions, analysis, loading, error, allRecordsSummary, loadSavedResult, clearData } = useData();
  const prevUser = useRef(user);
  const hasData = transactions.length > 0;

  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [showSave, setShowSave] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Clear in-memory data when user changes (login/logout/switch)
  useEffect(() => {
    if (prevUser.current !== user) {
      clearData();
      prevUser.current = user;
    }
  }, [user, clearData]);

  // Capture the filename from FileUpload (parsing handled internally)
  const handleLoadFile = (file) => {
    setCsvFileName(file.name);
  };

  // Handle loading a saved result
  const handleLoadResult = (result) => {
    setCsvFileName(result.csvFileName);
    loadSavedResult(result);
  };

  // If not logged in, show login page
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--clay-bg)' }}>
      {/* Header */}
      <header className="gradient-header text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: '2.5px solid rgba(255,255,255,0.25)',
                    boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.2), 3px 3px 8px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold tracking-tight">知花 Fisca</h1>
              </div>
              <p className="text-white/60 text-xs ml-[44px]">
                上传支付宝账单，洞察每一笔消费
              </p>
            </div>

            {/* Right side: dark toggle + user menu */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDark((d) => !d)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                }}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
              </button>
              <UserMenu onSave={() => hasData && setShowSave(true)} onLoad={() => setShowLoad(true)} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Upload Section */}
        <section className="animate-fade-in-up">
          <FileUpload onFile={handleLoadFile} />
        </section>

        {/* Loading */}
        {loading && (
          <div className="clay-card p-8">
            <div className="space-y-4">
              <div className="skeleton h-7 w-52" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton h-28 rounded-2xl" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="skeleton h-80 rounded-2xl" />
                <div className="skeleton h-80 rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="clay-card animate-scale-in" style={{ borderColor: 'rgba(212, 114, 106, 0.4)', background: 'rgba(212, 114, 106, 0.04)' }}>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 shrink-0" style={{ color: 'var(--color-danger)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-danger)' }}>解析失败</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {hasData && analysis && (
          <>
            {/* Quick actions bar */}
            <div className="flex items-center justify-end gap-3 animate-fade-in-up">
              <button
                onClick={() => setShowSave(true)}
                className="clay-btn text-xs cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                保存分析结果
              </button>
            </div>

            <div className="space-y-6">
              <Overview analysis={analysis} allRecordsSummary={allRecordsSummary} />

              {/* Monthly trend: full width for better readability */}
              <MonthlyTrend data={analysis.trend} />

              {/* Category breakdown + Essential analysis side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 grid-cards-fixed">
                <CategoryBreakdown data={analysis.catBreakdown} />
                <EssentialAnalysis data={analysis.classification} />
              </div>

              {/* High frequency + Anomalies side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 grid-cards-fixed">
                <DailyDetail data={analysis.highFreq} />
                <AnomalyHighlight anomalies={analysis.anomalies} />
              </div>

              <TrapAnalysis trapData={analysis.trapData} />
              <Recommendations recs={analysis.recommendations} />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-4" style={{ color: 'var(--text-muted)' }}>
        <p className="text-xs mb-1">
          数据仅存储在浏览器本地（localStorage），不会上传到任何服务器
        </p>
        <p className="text-[10px]" style={{ opacity: 0.7 }}>
          存储位置：浏览器开发者工具 → Application → Local Storage → 当前域名
        </p>
      </footer>

      {/* Modals */}
      {showSave && (
        <SaveModal
          transactions={transactions}
          analysis={analysis}
          allRecordsSummary={allRecordsSummary}
          csvFileName={csvFileName}
          onClose={() => setShowSave(false)}
        />
      )}
      {showLoad && (
        <LoadModal
          onClose={() => setShowLoad(false)}
          onLoadResult={handleLoadResult}
        />
      )}
    </div>
  );
}
