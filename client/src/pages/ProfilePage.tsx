import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold">Profile</h1>
      <section className="mt-6 max-w-2xl rounded-lg border border-zinc-200 bg-white p-6">
        <dl className="grid gap-4 text-sm">
          <Row label="Name" value={user?.name || ""} />
          <Row label="Email" value={user?.email || ""} />
          <Row label="Account Created" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""} />
          <Row label="Total Analyzed Repositories" value={String(user?.totalAnalyzedRepositories || 0)} />
        </dl>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 border-b border-zinc-100 pb-3"><dt className="text-zinc-500">{label}</dt><dd className="font-medium">{value}</dd></div>;
}

