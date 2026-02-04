export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col">
      <header className="flex items-center justify-between p-4">
        <h1>CRM Cluster</h1>
        <nav>
          <ul className="flex gap-4">
            <li>
              <a href="/Dashboard">Dashboard</a>
            </li>
            <li>
              <a href="/customers">Customers</a>
            </li>
            <li>
              <a href="/reports">Reports</a>
            </li>
          </ul>
        </nav>
      </header>
    </main>
  );
}
