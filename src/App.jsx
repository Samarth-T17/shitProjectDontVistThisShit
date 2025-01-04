import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [keyword, setKeyword] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [extraPrompt, setExtraPrompt] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        keyword,
        minSalary,
        experienceLevel,
        ageRange,
        extraPrompt,
      }).toString();

      const response = await fetch(`/api/jobs?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const jobsData = await response.json();
      setJobs(jobsData);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Women Job Portal</h1>
        <p>Empowering Women</p>
      </header>
      <main className="container">
        <div className="filter">
          <div className="filter-grid">
            <div>
              <label htmlFor="keyword">Job Title or Keywords</label>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div>
              <label htmlFor="minSalary">Minimum Salary (Annual)</label>
              <input
                type="number"
                id="minSalary"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="e.g., 100000"
              />
            </div>
            <div>
              <label htmlFor="experienceLevel">Experience Level</label>
              <select
                id="experienceLevel"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="">Any Level</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (6+ years)</option>
              </select>
            </div>
            <div>
              <label htmlFor="ageRange">Preferred Age Range</label>
              <input
                type="text"
                id="ageRange"
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                placeholder="e.g., 25-35"
              />
            </div>
            <div>
              <label htmlFor="extraPrompt">Additional Requirements</label>
              <textarea
                id="extraPrompt"
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
                placeholder="Specify any additional requirements"
              />
            </div>
          </div>
          <button onClick={fetchJobs}>Search Opportunities</button>
        </div>
        <div id="jobs">
          {loading && <div className="loading">Searching for opportunities...</div>}
          {error && <div className="error-message">{error}</div>}
          {!loading && !error && jobs.length === 0 && (
            <div className="error-message">No opportunities found.</div>
          )}
          {!loading &&
            !error &&
            jobs.map((job, index) => (
              <div key={index} className="job-card">
                <h3>{job.position || 'Position Not Specified'}</h3>
                <p><strong>Company:</strong> {job.company || 'Not Specified'}</p>
                <p><strong>Salary:</strong> {job.salary || 'Not Specified'}</p>
                <a href={job.jobUrl || '#'} target="_blank" rel="noopener noreferrer">
                  View Details →
                </a>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}

export default App;
