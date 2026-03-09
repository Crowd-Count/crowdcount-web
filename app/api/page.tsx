import type { Metadata } from 'next';
import MenuLinks from '@/components/MenuLinks';
import TypewriterText from '@/components/TypewriterText';

export const metadata: Metadata = { title: 'API' };

export default function ApiPage() {
  return (
    <>
      <header className="d-flex flex-column" data-aos="fade-down">
        <div className="text-center">
          <div id="MediumHomeTitle" className="d-inline-block">
            <TypewriterText text="CrowdCount API" id="CrowdCountAPI" hideCursorAfter={3500} />
          </div>
        </div>
        <MenuLinks />
      </header>

      <h1 id="center" data-aos="fade-up">
        <div id="primary">CrowdCount API</div>
        <br />
        <div id="secondary">for </div><a href="https://api.crowdcount.tech" id="primary">api.crowdcount.tech</a>
      </h1>
      <h3 id="center" data-aos="fade-up">
        <div id="secondary">Integrate CrowdCount data into your own application using these public API endpoints.</div>
      </h3>

      {/* How It Works */}
      <div className="container mt-4" data-aos="fade-up">
        <h3 id="center">
          <div id="LargeHomeText"><div id="primary">How It Works</div></div>
          <br />
          <div id="secondary">CrowdCount uses a <div id="primary">location-based</div> architecture. Each <div id="primary">location</div> has a unique ID and contains one or more <div id="primary">devices</div> (Crowd Counters). Counts, entries, and history are all tracked at the location level.</div>
          <br /><br />
          <div id="secondary">To authenticate, provide <div id="primary">credentials</div> for <div id="primary">all</div> devices that belong to the location.</div>
          <br /><br />
          <div id="secondary">CrowdCount tracks two types of data:</div>
          <br />
          <div id="secondary"><div id="primary">Population</div> &mdash; how many people are currently present (goes up and down)</div>
          <br />
          <div id="secondary"><div id="primary">Entries</div> &mdash; how many people have entered (cumulative, only goes up)</div>
        </h3>
      </div>

      {/* General */}
      <div className="container mt-4" data-aos="fade-up">
        <div id="table-wrapper">
          <h2 className="mb-3" style={{ color: 'white', textAlign: 'center' }}>General</h2>
          <table className="table table-bordered">
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead className="thead-light">
              <tr>
                <th scope="col" className="center-text">Command</th>
                <th scope="col" className="center-text">Description</th>
                <th scope="col" className="center-text">Parameters</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>GET /ping</code></td>
                <td>Returns &quot;pong&quot;, indicating that the server is running.</td>
                <td><ul><li>None</li></ul></td>
              </tr>
              <tr>
                <td><code>GET /totalcount</code></td>
                <td>Returns the total count of people ever detected across all devices.</td>
                <td><ul><li>None</li></ul></td>
              </tr>
              <tr>
                <td><code>GET /total_entries</code></td>
                <td>Returns the total entries ever recorded across all devices.</td>
                <td><ul><li>None</li></ul></td>
              </tr>
              <tr>
                <td><code>GET /check_user</code></td>
                <td>Checks if a device exists and returns its online/offline status.</td>
                <td><ul><li><code>device_id</code> (required)</li></ul></td>
              </tr>
              <tr>
                <td><code>GET /connection_status</code></td>
                <td>Returns the connection status of a device.</td>
                <td><ul><li><code>device_id</code> (required)</li></ul></td>
              </tr>
              <tr>
                <td><code>GET /get_all_map_locations</code></td>
                <td>Returns all public map locations with current counts, overcrowding limits, devices, and comparison data. <div id="secondary">No authentication required.</div></td>
                <td><ul><li>None</li></ul></td>
              </tr>
              <tr>
                <td><code>GET /get_all_location_names</code></td>
                <td>Returns a list of names of all public map locations.</td>
                <td><ul><li>None</li></ul></td>
              </tr>
            </tbody>
          </table>

          {/* Location Lookup */}
          <h2 className="mt-5 mb-3" style={{ color: 'white', textAlign: 'center' }}>Location Lookup</h2>
          <p style={{ color: '#aaa', textAlign: 'center' }}>Find the location ID for a device. Use this to get the <code>location_id</code> needed for all history endpoints.</p>
          <table className="table table-bordered">
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead className="thead-light">
              <tr>
                <th scope="col" className="center-text">Command</th>
                <th scope="col" className="center-text">Description</th>
                <th scope="col" className="center-text">Parameters</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>POST /get_locations_for_device</code></td>
                <td>Returns all locations that a device belongs to, including each location&apos;s <code>location_id</code>, name, current count, overcrowding limit, and member devices.</td>
                <td><ul>
                  <li><code>device_id</code></li>
                  <li><code>password</code></li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location</code></td>
                <td>Returns details for a single location by ID.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                </ul></td>
              </tr>
            </tbody>
          </table>

          {/* Location History */}
          <h2 className="mt-5 mb-3" style={{ color: 'white', textAlign: 'center' }}>Location History</h2>
          <p style={{ color: '#aaa', textAlign: 'center' }}>Retrieve historical population and entry data for a location. All endpoints require <code>location_id</code> plus <code>credentials</code> for all member devices. <br />Each endpoint also has an <code>average</code> variant that returns the historical average for the same period.</p>
          <table className="table table-bordered">
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead className="thead-light">
              <tr>
                <th scope="col" className="center-text">Command</th>
                <th scope="col" className="center-text">Description</th>
                <th scope="col" className="center-text">Parameters</th>
              </tr>
            </thead>
            <tbody>
              {/* Population History */}
              <tr>
                <td><code>POST /get_location_day_data</code></td>
                <td>Hourly population data for a specific day.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_average_day_data</code></td>
                <td>Average hourly population for the same weekday. <div id="secondary">Calculated from historical data on matching weekdays.</div></td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_week_data</code></td>
                <td>Daily population data for a specific week. <div id="secondary">Input any day of the week to get Monday through Sunday. Supports timezone correction via <code>tz_offset_minutes</code>.</div></td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                  <li><code>tz_offset_minutes</code> (optional)</li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_average_week_data</code></td>
                <td>Average daily population for a week. <div id="secondary">Supports timezone correction via <code>tz_offset_minutes</code>.</div></td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                  <li><code>tz_offset_minutes</code> (optional)</li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_month_data</code></td>
                <td>Daily population data for a specific month.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_average_month_data</code></td>
                <td>Average daily population for a month.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_year_data</code></td>
                <td>Monthly population data for a specific year.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>year</code></li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_average_year_data</code></td>
                <td>Average monthly population for a year.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>year</code></li>
                </ul></td>
              </tr>
              {/* Entry History */}
              <tr>
                <td><code>POST /get_location_entry_day_data</code></td>
                <td>Hourly entry data for a specific day.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_average_entry_day_data</code></td>
                <td>Average hourly entry data for the same weekday.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_entry_week_data</code></td>
                <td>Daily entry data for a specific week. <div id="secondary">Supports timezone correction via <code>tz_offset_minutes</code>.</div></td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                  <li><code>tz_offset_minutes</code> (optional)</li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_average_entry_week_data</code></td>
                <td>Average daily entry data for a week. <div id="secondary">Supports timezone correction via <code>tz_offset_minutes</code>.</div></td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                  <li><code>tz_offset_minutes</code> (optional)</li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_entry_month_data</code></td>
                <td>Daily entry data for a specific month.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_average_entry_month_data</code></td>
                <td>Average daily entry data for a month.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_entry_year_data</code></td>
                <td>Monthly entry data for a specific year.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>year</code></li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_average_entry_year_data</code></td>
                <td>Average monthly entry data for a year.</td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>year</code></li>
                </ul></td>
              </tr>
              {/* Detailed 15-Min Data */}
              <tr>
                <td><code>POST /get_location_day_data_detailed</code></td>
                <td>15-minute interval data for a specific day, with averages. <div id="secondary">Returns data in local time using <code>tz_offset_minutes</code>. Useful for detailed CSV exports. Keys are time labels like <code>&quot;0:00&quot;</code>, <code>&quot;0:15&quot;</code>, ..., <code>&quot;23:45&quot;</code> (96 intervals). Response includes both <code>data</code> and <code>average</code> dicts.</div></td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code> (local date)</li>
                  <li><code>tz_offset_minutes</code></li>
                  <li><code>data_type</code> (<code>&quot;count&quot;</code> or <code>&quot;entries&quot;</code>)</li>
                </ul></td>
              </tr>
              {/* Bundle Endpoints */}
              <tr>
                <td><code>POST /get_location_insights_bundle</code></td>
                <td>Returns all chart data (day, week, year) for both population and entries in a single response. <div id="secondary">Replaces up to 16 individual API calls. Includes averages, entry data, and optional second-day data for timezone spanning. Supports timezone-aware week data via <code>tz_offset_minutes</code>.</div></td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                  <li><code>date2</code> (optional)</li>
                  <li><code>week_date</code></li>
                  <li><code>year</code></li>
                  <li><code>tz_offset_minutes</code> (optional)</li>
                </ul></td>
              </tr>
              <tr>
                <td><code>POST /get_location_history_bundle</code></td>
                <td>Returns chart data (day, week, year) for a single data type in one response. <div id="secondary">Replaces up to 8 individual API calls. Use <code>data_type</code> to choose population or entries.</div></td>
                <td><ul>
                  <li><code>location_id</code></li>
                  <li><code>credentials</code></li>
                  <li><code>date</code></li>
                  <li><code>date2</code> (optional)</li>
                  <li><code>week_date</code></li>
                  <li><code>year</code></li>
                  <li><code>data_type</code> (<code>&quot;count&quot;</code> or <code>&quot;entries&quot;</code>)</li>
                  <li><code>tz_offset_minutes</code> (optional)</li>
                </ul></td>
              </tr>
              {/* CSV Export */}
              <tr>
                <td><code>GET /export_csv</code></td>
                <td>Exports population CSV data for a device. <div id="secondary">If no date is provided, all data is exported as a zip file.</div></td>
                <td><ul>
                  <li><code>device_id</code> (required)</li>
                  <li><code>password</code> (required)</li>
                  <li><code>date</code> (optional)</li>
                </ul></td>
              </tr>
              <tr>
                <td><code>GET /export_entry_csv</code></td>
                <td>Exports entry CSV data for a device. <div id="secondary">If no date is provided, all data is exported as a zip file.</div></td>
                <td><ul>
                  <li><code>device_id</code> (required)</li>
                  <li><code>password</code> (required)</li>
                  <li><code>date</code> (optional)</li>
                </ul></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <br />
      <h3 id="center">
        <div id="LargeHomeText"><div id="primary">Important Notes</div></div>
        <br /><br />
        <div id="secondary">The <div id="primary">credentials</div> parameter is a JSON array of <code>{`{"device_id", "password"}`}</code> objects for all devices in the location:</div>
        <br />
        <code style={{ background: '#1a1a1a', padding: '8px 12px', borderRadius: '4px', display: 'inline-block' }}>&quot;credentials&quot;: [{`{"device_id": "T1234", "password": "pass1"}`}, {`{"device_id": "T5678", "password": "pass2"}`}]</code>
        <br /><br />
        <div id="secondary">For locations with a single device, the array will have one entry.</div>
        <br /><br />
        <div id="secondary">All parameters listed as <div id="primary">required</div> in history endpoints above. The date format is <div id="primary">yyyy-mm-dd</div>. For year-based endpoints use a 4-digit year like <div id="primary">2026</div>.</div>
        <br /><br />
        <div id="secondary">Server stores data in <div id="primary">UTC</div>. For hourly day data, convert to your local timezone in your application. For <div id="primary">week endpoints</div>, you can pass <code>tz_offset_minutes</code> to get timezone-corrected daily totals directly from the server. The value is your UTC offset in minutes, positive east &mdash; e.g. <code>-420</code> for US Mountain (UTC-7), <code>60</code> for CET (UTC+1). In JavaScript: <code>new Date().getTimezoneOffset() * -1</code>.</div>
        <br /><br />
        <div id="secondary">The <div id="primary">bundle endpoints</div> return all chart data in a single request (day, week, year, averages). Use these to minimize API calls. The <code>date2</code> parameter handles timezone day-boundary spanning for hourly data &mdash; pass the adjacent UTC date that overlaps your local day.</div>
        <br /><br />
        <div id="secondary">The <div id="primary">detailed day data</div> endpoint returns 15-minute interval data (96 data points per day) already shifted to your local timezone. Pass your local date and <code>tz_offset_minutes</code> &mdash; the server handles the UTC conversion.</div>
        <br /><br />
        <div id="secondary">The API endpoint is <a href="https://api.crowdcount.tech" id="primary">api.crowdcount.tech</a></div>
        <br />
        <br /><div id="secondary">Check our server status at <a id="primary" href="/status">crowdcount.tech/status</a></div>
      </h3>
      <br />
    </>
  );
}
