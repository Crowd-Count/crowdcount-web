'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import MenuLinks from '@/components/MenuLinks';
import TypewriterText from '@/components/TypewriterText';
import { API_BASE_URL } from '@/lib/constants';

export default function ReportPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [reportType, setReportType] = useState('');
  const [otherContent, setOtherContent] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/get_all_location_names`)
      .then(res => res.json())
      .then(data => setLocations(data.location_names || []))
      .catch(err => console.error('Error fetching locations:', err));
  }, []);

  const isFormValid = name && email && location && reportType && (reportType !== 'Other' || otherContent);

  const clearForm = useCallback(() => {
    setName('');
    setEmail('');
    setLocation('');
    setReportType('');
    setOtherContent('');
  }, []);

  const submitReport = async () => {
    const content = reportType === 'Other' ? otherContent : reportType;
    try {
      const res = await fetch(`${API_BASE_URL}/submit_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, location, content }),
      });
      if (res.ok) {
        clearForm();
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 5000);
      } else {
        const text = await res.text();
        throw new Error(text);
      }
    } catch (err) {
      clearForm();
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg('Failed to submit report: ' + message);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const reportOptions = [
    { id: 'falsifying', value: 'This location is falsifying its count data' },
    { id: 'malfunctioning', value: "This location's counter is malfunctioning" },
    { id: 'moved', value: 'This location has moved or no longer exists' },
    { id: 'other', value: 'Other' },
  ];

  return (
    <>
      <header className="d-flex flex-column" data-aos="fade-down">
        <div className="text-center">
          <div id="MediumHomeTitle" className="d-inline-block">
            <TypewriterText text="CrowdCount Report" id="CrowdCountREPORT" hideCursorAfter={2700} />
          </div>
        </div>
        <MenuLinks />
      </header>
      <br />
      <h3 id="center" data-aos="fade-up">
        <div id="secondary"><div id="primary">We apologize if something is wrong</div>, feel free to tell us what&apos;s the problem.</div>
      </h3>
      <br />
      <h3 id="center">
        <div className="text-box-legal" data-aos="fade-up">
          <img src="/assets/Icons/comment-dots-solid.png" alt="Bubble with dots" className="scaled-image-hand-legal" /><br />
          <h1 id="primaryTitleBold">Submit a Report</h1>
          <br />
          <h2 id="secondary">Every category must be filled out</h2>
          <br /><br />

          <div className="form-section">
            <h2 id="primaryBold">Your Information</h2><br /><br />
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <br />

          <div className="form-section">
            <h2 id="primaryBold">Select a Location</h2><br /><br />
            <select value={location} onChange={e => setLocation(e.target.value)} required>
              <option value="">Click to select a location</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <br />

          <div className="form-section">
            <h2 id="primaryBold">What is wrong?</h2><br />
            <h2 id="secondary">Select the corresponding option</h2>
            <br /><br />
            <div>
              {reportOptions.map(opt => (
                <span key={opt.id}>
                  <input
                    type="radio"
                    id={opt.id}
                    name="report"
                    value={opt.value}
                    checked={reportType === opt.value}
                    onChange={e => setReportType(e.target.value)}
                  />
                  <label htmlFor={opt.id}>{opt.value}</label><br />
                </span>
              ))}
              {reportType === 'Other' && (
                <textarea
                  placeholder="Please specify"
                  value={otherContent}
                  onChange={e => setOtherContent(e.target.value)}
                />
              )}
            </div>
          </div>

          <button id="big-red-button" className="ripple" disabled={!isFormValid} onClick={submitReport}>
            Submit Report
          </button>
          {successMsg && (
            <div className="success-message">Report Submitted! Thank you, we&apos;ll go take a look at it.</div>
          )}
          {errorMsg && (
            <div className="error-message">{errorMsg}</div>
          )}
        </div>
      </h3>
      <h3 id="center" data-aos="fade-up">
        <div className="text-box">
          <div id="secondary"><div id="primary">Want to know how we manage reports?</div> Visit <Link href="/report/info">crowdcount.tech/report/info</Link></div>
        </div>
      </h3>
    </>
  );
}
