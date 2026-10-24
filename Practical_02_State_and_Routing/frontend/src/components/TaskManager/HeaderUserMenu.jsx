import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HeaderUserMenu({ onOpenAuthModal }) {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <button
        onClick={onOpenAuthModal}
        style={{
          padding: '8px 18px',
          borderRadius: '8px',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          fontWeight: '600',
          fontSize: '0.9rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        }}
      >
        <UserIcon size={16} />
        Sign In / Register
      </button>
    );
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)',
          }}
        >
          {initial}
        </div>
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f8fafc' }}>
            {user.name}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {user.email}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        title="Log Out"
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          fontSize: '0.85rem',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <LogOut size={15} />
        Logout
      </button>
    </div>
  );
}
