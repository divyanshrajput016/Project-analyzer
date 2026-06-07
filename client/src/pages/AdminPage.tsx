import { useEffect, useState } from "react";
import { api } from "../services/api";

export function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});

  useEffect(() => {
    api.get("/admin/users").then((res) => setUsers(res.data.users));
    api.get("/admin/analytics").then((res) => setAnalytics(res.data.analytics));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Object.entries(analytics).map(([key, value]) => <div key={key} className="rounded-lg border border-zinc-200 bg-white p-5"><p className="text-sm text-zinc-500">{key}</p><p className="mt-2 text-3xl font-bold">{String(value)}</p></div>)}
      </div>
      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold">Users</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full text-left text-sm">
            <tbody>
              {users.map((user) => <tr key={user._id} className="border-t border-zinc-100"><td className="py-3">{user.name}</td><td>{user.email}</td><td>{user.role}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

