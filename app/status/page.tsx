'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import MenuLinks from '@/components/MenuLinks';
import TypewriterText from '@/components/TypewriterText';
import { API_BASE_URL } from '@/lib/constants';

interface HistoryCheck {
  timestamp: string;
  status: string;
  latency_ms: number;
}

export default function StatusPage() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [responseTime, setResponseTime] = useState<string>('-- ms');
  const [totalCount, setTotalCount] = useState<string>('--');
  const [alertStatus, setAlertStatus] = useState<string>('Checking...');
  const [alertColor, setAlertColor] = useState<string>('var(--light-color)');
  const [awsOnline, setAwsOnline] = useState<boolean | null>(null);
  const [uptimePercent, setUptimePercent] = useState<string>('--');
  const [uptimeColor, setUptimeColor] = useState<string>('var(--light-color)');
  const [lastChecked, setLastChecked] = useState<string>('--');
  const [checkCount, setCheckCount] = useState<string>('--');
  const [historyBars, setHistoryBars] = useState<HistoryCheck[]>([]);
  const [historyStart, setHistoryStart] = useState('');
  const [historyEnd, setHistoryEnd] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshAll = useCallback(async () => {
    // API Health
    const startTime = Date.now();
    try {
      const res = await fetch(`${API_BASE_URL}/healthcheck`);
      const endTime = Date.now();
      if (res.ok) {
        setApiOnline(true);
        setResponseTime(`${endTime - startTime} ms`);
      } else {
        setApiOnline(false);
        setResponseTime('-- ms');
      }
    } catch {
      setApiOnline(false);
      setResponseTime('-- ms');
    }

    // Total count
    try {
      const res = await fetch(`${API_BASE_URL}/totalcount`);
      const data = await res.json();
      setTotalCount(data.total_count.toLocaleString());
    } catch {
      setTotalCount('Error');
    }

    // Alerts
    try {
      const res = await fetch(`${API_BASE_URL}/check_if_alert`);
      const data = await res.json();
      if (data.is_alert) {
        setAlertStatus('Active');
        setAlertColor('var(--accent-color)');
      } else {
        setAlertStatus('None');
        setAlertColor('var(--light-color)');
      }
    } catch {
      setAlertStatus('Error');
    }

    // AWS
    try {
      const res = await fetch(`${API_BASE_URL}/healthcheck`);
      setAwsOnline(res.ok);
    } catch {
      setAwsOnline(false);
    }

    // Status history
    try {
      const res = await fetch(`${API_BASE_URL}/status_history?hours=720`);
      const data = await res.json();
      const checks: HistoryCheck[] = data.checks || [];

      if (data.uptime_percent != null) {
        setUptimePercent(data.uptime_percent + '%');
        setUptimeColor(
          data.uptime_percent >= 99 ? '#4CAF50' : data.uptime_percent >= 95 ? '#FF9800' : '#f44336'
        );
      }

      setCheckCount(checks.length.toString());

      if (checks.length > 0) {
        const last = checks[checks.length - 1];
        const ago = Math.floor((Date.now() - new Date(last.timestamp).getTime()) / 60000);
        setLastChecked(ago < 1 ? 'Just now' : ago + 'm ago');
      }

      const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
      const visible = checks.filter(c => new Date(c.timestamp).getTime() >= twelveHoursAgo);
      setHistoryBars(visible);

      if (visible.length > 0) {
        setHistoryStart(new Date(visible[0].timestamp).toLocaleTimeString());
        setHistoryEnd(new Date(visible[visible.length - 1].timestamp).toLocaleTimeString());
      }
    } catch {
      setUptimePercent('Error');
    }
  }, []);

  useEffect(() => {
    refreshAll();
    intervalRef.current = setInterval(refreshAll, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshAll]);

  return (
    <>
      <header className="d-flex flex-column" data-aos="fade-down">
        <div className="text-center">
          <div id="MediumHomeTitle" className="d-inline-block">
            <TypewriterText text="CrowdCount Server Status" id="CrowdCountSTATUS" hideCursorAfter={4000} />
          </div>
        </div>
        <MenuLinks />
      </header>
      <br />

      <h3 id="center" data-aos="fade-up">
        <div id="secondary">Real-time <div id="primary">server</div> status</div>
      </h3>
      <br />

      {/* Server Health */}
      <div id="center" data-aos="fade-up">
        <div className="text-box-legal">
          <div id="primaryTitleBold">Server Health</div>
          <br /><br />
          <div className="status-grid">
            <div className="status-item">
              <div id="secondary">API Status</div><br />
              <div className="status-indicator status-value">
                <span className={`status-dot${apiOnline === true ? ' online' : apiOnline === false ? ' offline' : ''}`} />
                <span>{apiOnline === true ? 'Online' : apiOnline === false ? 'Offline' : 'Checking...'}</span>
              </div>
            </div>
            <div className="status-item">
              <div id="secondary">Response Time</div><br />
              <div className="status-value">{responseTime}</div>
            </div>
            <div className="status-item">
              <div id="secondary">Total Count</div><br />
              <div className="status-value">{totalCount}</div>
            </div>
            <div className="status-item">
              <div id="secondary">Alerts</div><br />
              <div className="status-value" style={{ color: alertColor }}>{alertStatus}</div>
            </div>
            <div className="status-item">
              <div id="secondary">AWS us-east-2</div><br />
              <div className="status-indicator status-value">
                <span className={`status-dot${awsOnline === true ? ' online' : awsOnline === false ? ' offline' : ''}`} />
                <span>{awsOnline === true ? 'Operational' : awsOnline === false ? 'Down' : 'Checking...'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status History */}
      <div id="center" data-aos="fade-up">
        <div className="text-box-legal">
          <div id="primaryTitleBold">Status History</div>
          <br /><br />
          <div className="status-history-summary">
            <div className="status-item">
              <div id="secondary">Uptime (30d)</div><br />
              <div className="status-value" style={{ color: uptimeColor }}>{uptimePercent}</div>
            </div>
            <div className="status-item">
              <div id="secondary">Last Checked</div><br />
              <div className="status-value">{lastChecked}</div>
            </div>
            <div className="status-item">
              <div id="secondary">Checks (24h)</div><br />
              <div className="status-value">{checkCount}</div>
            </div>
          </div>
          <br />
          <div id="secondary" style={{ textAlign: 'center', marginBottom: '10px' }}>Recent checks (12h)</div>
          <div className="history-bar">
            {historyBars.map((check, i) => (
              <div
                key={i}
                className={`bar-segment ${check.status}`}
                title={`${new Date(check.timestamp).toLocaleString()} — ${check.status.toUpperCase()} (${check.latency_ms}ms)`}
              />
            ))}
          </div>
          <div className="history-bar-labels">
            <span>{historyStart}</span>
            <span>{historyEnd}</span>
          </div>
        </div>
      </div>

      {/* iOS App Notice */}
      <div id="center" data-aos="fade-up">
        <div className="text-box-legal">
          <div id="primaryTitleBold">iOS App Notice - Please Update</div>
          <br /><br />
          <div id="secondary" style={{ textAlign: 'center' }}>
            iOS app versions below <strong>5.0.0</strong> have been fully deprecated and are no longer supported. Please update to the latest version from the App Store and re-add your counters.
          </div>
        </div>
      </div>

      <div className="auto-refresh">
        <div id="secondary">Auto-refreshing every 10 seconds</div>
      </div>
    </>
  );
}
