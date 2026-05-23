import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="auth-screen">
    <section className="auth-card">
      <span className="eyebrow">404</span>
      <h1>Lost in the reverb.</h1>
      <p>This route is not on the setlist.</p>
      <Link className="primary-button" to="/">Back home</Link>
    </section>
  </main>
);

export default NotFound;
