'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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

const ANIM_MS = 450;

export default function AlertBanner() {
  const [alert, setAlert] = useState<AlertInfo | null>(null);
  const [leaving, setLeaving] = useState(false);
  const collapseRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const openTarget = !!alert && !leaving;

  // Fetch the active alert once. The component lives in the root layout, which
  // persists across client-side navigations, so there's no need to re-fetch or
  // re-animate on every route change.
  useEffect(() => {
    let cancelled = false;

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
        const a: AlertInfo | undefined = detailData.alert_info?.[0];
        if (!a) return;

        try {
          if (sessionStorage.getItem('crowdcount_alert_seen_' + a.alert_id) === 'true') return;
        } catch {}

        if (!cancelled) setAlert(a);
      } catch (err) {
        console.error('Error checking alert:', err);
      }
    }

    checkAlert();
    return () => {
      cancelled = true;
    };
  }, []);

  // Animate the in-flow height between 0 and the banner's natural height so the
  // page content is pushed down/back up smoothly and never overlapped. Using an
  // explicit measured height (rather than a hardcoded value) keeps the reserved
  // space exactly correct no matter how many lines the message wraps to.
  useEffect(() => {
    const el = collapseRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout>;

    if (openTarget) {
      const target = innerRef.current?.offsetHeight ?? 0;
      // Start from the current (or fully collapsed) height, then transition up.
      el.style.height = el.style.height && el.style.height !== 'auto'
        ? `${el.offsetHeight}px`
        : '0px';
      void el.offsetHeight; // force reflow so the change below animates
      el.style.height = `${target}px`;
      // Once expanded, release to auto so a viewport resize that re-wraps the
      // text can never clip the banner or leave a stale gap.
      timer = setTimeout(() => {
        if (collapseRef.current) collapseRef.current.style.height = 'auto';
      }, ANIM_MS);
    } else {
      el.style.height = `${el.offsetHeight}px`;
      void el.offsetHeight; // force reflow
      el.style.height = '0px';
      if (leaving) {
        timer = setTimeout(() => {
          setAlert(null);
          setLeaving(false);
        }, ANIM_MS);
      }
    }

    return () => clearTimeout(timer);
  }, [openTarget, leaving]);

  const dismiss = useCallback(() => {
    if (alert) {
      try {
        sessionStorage.setItem('crowdcount_alert_seen_' + alert.alert_id, 'true');
      } catch {}
    }
    setLeaving(true);
  }, [alert]);

  if (!alert) return null;

  const colors = getAlertColors(alert.alert_type);

  return (
    <div ref={collapseRef} className="cc-alert-collapse" aria-hidden={!openTarget}>
      <div
        ref={innerRef}
        className="cc-alert"
        style={{ backgroundColor: colors.bg, color: colors.color }}
        data-alert-id={alert.alert_id}
        role="status"
        aria-live="polite"
      >
        <div className="cc-alert-inner">
          <p className="cc-alert-text">
            <strong>{alert.title}</strong> <span>{alert.body}</span>
          </p>
          <button
            type="button"
            className="cc-alert-close"
            aria-label="Dismiss alert"
            onClick={dismiss}
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}
