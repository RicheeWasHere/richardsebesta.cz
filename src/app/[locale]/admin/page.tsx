import { getMessages } from '@/lib/actions';
import { cookies } from 'next/headers';
import { login, logout } from './actions';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const pwd = cookieStore.get('admin_pwd')?.value || '';

  const { success, data } = await getMessages(pwd);

  if (!success) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <h1 className="text-3xl font-bold text-white">Admin Login</h1>
        <form action={login} className="flex flex-col gap-4 w-full max-w-sm">
          <input 
            type="password" 
            name="pwd" 
            placeholder="Password" 
            className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl">
            Login
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Messages Admin</h1>
        <form action={logout}>
          <button type="submit" className="text-sm font-semibold text-zinc-400 hover:text-white">
            Logout
          </button>
        </form>
      </div>
      
      <div className="flex flex-col gap-4">
        {data?.length === 0 ? (
          <p className="text-zinc-500">No messages yet.</p>
        ) : (
          data?.map((msg: any) => (
            <div key={msg.id} className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{msg.name}</span>
                  <a href={`mailto:${msg.email}`} className="text-sm text-blue-400">{msg.email}</a>
                </div>
                <span className="text-xs text-zinc-500">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
