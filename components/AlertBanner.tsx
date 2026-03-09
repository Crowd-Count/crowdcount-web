'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constants';

interface AlertInfo {
  alert_id: string;
  title: string;
  body: string;
  alert_type: string;
}

function getAlertColors(type: string) {
  switch (type) {
    case 'warning':
    case 'celebration':
      return { bg: '#ffcc00', color: 'black' };
    case 'info':
    case 'privacy':
      return { bg: '#007bff', color: 'white' };
    case 'terms-of-use':
      return { bg: '#ff9500', color: 'black' };
    case 'leaf':
      return { bg: '#34c759', color: 'black' };
    default:
      return { bg: '#333', color: 'white' };
  }
}

export default function AlertBanner() {
  const [alert, setAlert] = useState<AlertInfo | null>(null);
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  const isSecondary = pathname !== '/';
  const dismissedRef = useRef<Set<string>>(new Set());

  const hideAlert = useCallback((dismiss: boolean) => {
    if (dismiss && alert) {
      dismissedRef.current.add(alert.alert_id);
      try {
        sessionStorage.setItem('crowdcount_alert_seen_' + alert.alert_id, 'true');
      } catch {}
    }
    setShow(false);
    if (isSecondary) {
      document.body.style.paddingTop = '';
    }
  }, [alert, isSecondary]);

  useEffect(() => {
    let scrollHandler: (() => void) | null = null;

    async function checkAlert() {
      try {
        const checkRes = await fetch(`${API_BASE_URL}/check_if_alert`, {
          headers: { 'X-Client-Type': 'web' },
        });
        const checkData = await checkRes.json();
        if (!checkData.is_alert) return;

        const detailRes = await fetch(`${API_BASE_URL}/get_active_alert`, {
          headers: { 'X-Client-Type': 'web' },
        });
        const detailData = await detailRes.json();
        const alerts = detailData.alert_info;
        if (!alerts || alerts.length === 0) return;

        const a = alerts[0];
        // Check session storage
        try {
          if (sessionStorage.getItem('crowdcount_alert_seen_' + a.alert_id) === 'true') return;
        } catch {}
        if (dismissedRef.current.has(a.alert_id)) return;

        setAlert(a);
        setTimeout(() => {
          setShow(true);
          if (isSecondary) {
            document.body.style.transition = 'padding-top 0.5s ease-in-out';
            document.body.style.paddingTop = '44px';
          }
        }, 10);

        scrollHandler = () => {
          if (window.scrollY > 50) {
            setShow(false);
            if (isSecondary) document.body.style.paddingTop = '';
            if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
          }
        };
        window.addEventListener('scroll', scrollHandler);
      } catch (err) {
        console.error('Error checking alert:', err);
      }
    }

    checkAlert();
    return () => {
      if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
    };
  }, [pathname, isSecondary]);

  if (!alert) return null;

  const colors = getAlertColors(alert.alert_type);

  return (
    <div
      className={`alert${show ? ' show' : ''}`}
      style={{ backgroundColor: colors.bg, color: colors.color }}
      data-alert-id={alert.alert_id}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <div>
          <strong>{alert.title}</strong> <span>{alert.body}</span>
        </div>
        <button
          onClick={() => hideAlert(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px 8px',
            opacity: 0.7,
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
