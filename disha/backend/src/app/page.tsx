export default function BackendRootPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Disha Backend REST API</h1>
      <p>This service powers the Disha career navigation platform.</p>
      <ul>
        <li><a href="/api/health">/api/health</a> - Service health probe</li>
        <li><a href="/api/careers">/api/careers</a> - Career catalog</li>
        <li><a href="/api/quiz">/api/quiz</a> - RIASEC assessment engine</li>
      </ul>
    </main>
  );
}
