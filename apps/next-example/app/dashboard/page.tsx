export default function Dashboard() {
  return (
    <main>
      <h1>Dashboard (Protected)</h1>
      <p>If the auth cookie is missing, middleware will send you to /login.</p>
    </main>
  );
}
