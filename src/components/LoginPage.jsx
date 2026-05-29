import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function LoginPage() {
  const { login, getUsers } = useUser();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [showExisting, setShowExisting] = useState(false);

  const existingUsers = getUsers();

  const handleLogin = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError('请输入用户名');
      return;
    }
    if (trimmed.length < 2) {
      setError('用户名至少 2 个字符');
      return;
    }
    if (trimmed.length > 20) {
      setError('用户名最多 20 个字符');
      return;
    }
    if (!/^[\w一-鿿]+$/.test(trimmed)) {
      setError('用户名只能包含中文、字母、数字和下划线');
      return;
    }
    login(trimmed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--clay-bg)' }}>
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div
            className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--clay-surface)',
              border: '3px solid var(--clay-border-strong)',
              boxShadow: 'var(--shadow-clay-lg)',
            }}
          >
            <svg className="w-9 h-9" style={{ color: 'var(--accent-terracotta)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>知花 Fisca</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>知道每一分钱去了哪</p>
        </div>

        {/* Login card */}
        <div className="clay-card p-6 animate-scale-in">
          <h2 className="text-base font-semibold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
            欢迎回来
          </h2>

          {/* Input */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="输入用户名开始使用"
              autoFocus
              className="w-full px-4 py-3 text-sm outline-none transition-all duration-200"
              style={{
                background: 'var(--clay-surface)',
                border: '2.5px solid var(--clay-border)',
                borderRadius: '14px',
                color: 'var(--text-primary)',
                boxShadow: 'inset 2px 2px 6px rgba(180,160,140,0.12)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-terracotta)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--clay-border)'}
            />
            {error && (
              <p className="text-xs mt-1.5" style={{ color: 'var(--color-danger)' }}>{error}</p>
            )}
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={!username.trim()}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer"
            style={{
              background: username.trim()
                ? 'linear-gradient(135deg, var(--accent-terracotta), #D4956B)'
                : 'var(--clay-border)',
              border: '2.5px solid ' + (username.trim() ? 'rgba(198, 123, 92, 0.4)' : 'var(--clay-border)'),
              boxShadow: username.trim() ? 'var(--shadow-clay-md)' : 'none',
              opacity: username.trim() ? 1 : 0.5,
            }}
          >
            进入
          </button>

          {/* Existing users */}
          {existingUsers.length > 0 && (
            <div className="mt-5 pt-4" style={{ borderTop: '2px solid var(--clay-border)' }}>
              <button
                onClick={() => setShowExisting(!showExisting)}
                className="text-xs font-medium cursor-pointer w-full text-center transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
              >
                {showExisting ? '收起已有用户' : `已有 ${existingUsers.length} 个用户，点击切换`}
              </button>

              {showExisting && (
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {existingUsers.map((u) => (
                    <button
                      key={u}
                      onClick={() => { setUsername(u); setError(''); }}
                      className="clay-btn text-xs cursor-pointer"
                      style={username === u ? {
                        borderColor: 'var(--accent-terracotta)',
                        background: 'var(--accent-terracotta-soft)',
                        color: 'var(--accent-terracotta)',
                      } : {}}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] mt-6" style={{ color: 'var(--text-muted)' }}>
          数据仅在浏览器本地存储，不会上传到任何服务器
        </p>
      </div>
    </div>
  );
}
