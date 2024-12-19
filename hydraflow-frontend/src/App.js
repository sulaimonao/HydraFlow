import React, { useEffect, useState } from "react";

function App() {
  const [feedback, setFeedback] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const apiBase = "https://hydra-flow.vercel.app/api/feedback";

  useEffect(() => {
    // Fetch all feedback
    fetch(`${apiBase}/all`)
      .then((res) => res.json())
      .then((data) => setFeedback(data.data))
      .catch((err) => setError(err.message));

    // Fetch feedback summary
    fetch(`${apiBase}/summary`)
      .then((res) => res.json())
      .then((data) => setSummary(data.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>HydraFlow Feedback Dashboard</h1>

      <h2>Summary</h2>
      {summary ? (
        <div>
          <p><strong>Total Feedback:</strong> {summary.totalFeedback}</p>
          <p><strong>Average Rating:</strong> {summary.averageRating}</p>
        </div>
      ) : (
        <p>Loading summary...</p>
      )}

      <h2>Feedback Entries</h2>
      {feedback.length > 0 ? (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Feedback</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((entry, index) => (
              <tr key={index}>
                <td>{new Date(entry.timestamp).toLocaleString()}</td>
                <td>{entry.userFeedback}</td>
                <td>{entry.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading feedback...</p>
      )}
    </div>
  );
}

export default App;
