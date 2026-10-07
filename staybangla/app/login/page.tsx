import Link from "next/link";import {login,register,reset} from "./actions";
export const metadata={title:"Log in"};
export default async function Login({searchParams}:{searchParams:Promise<Record<string,string>>}){const s=await searchParams;const m=s.mode??"login";
const i="w-full rounded-xl border border-slate-300 p-3";
return <main className="mx-auto max-w-sm p-6"><h1 className="mb-4 text-2xl">{m==="register"?"Create account":m==="reset"?"Reset password":"Log in"}</h1>
{s.error&&<p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{s.error}</p>}{s.ok&&<p className="mb-3 rounded-xl bg-soft p-3 text-sm font-medium text-brand-dark">{s.ok}</p>}
<form action={m==="register"?register:m==="reset"?reset:login} className="space-y-3">
{m==="register"&&<input name="name" required placeholder="Full name" className={i}/>}
<input name="email" type="email" required placeholder="Email" className={i}/>
{m!=="reset"&&<input name="password" type="password" required minLength={8} placeholder="Password (8+ characters)" className={i}/>}
<button className="w-full rounded-xl bg-brand p-3 font-semibold text-white hover:bg-brand-dark">{m==="register"?"Register":m==="reset"?"Send reset link":"Log in"}</button></form>
<p className="mt-4 flex justify-between text-sm font-medium text-brand">{m!=="login"&&<Link href="/login">Log in</Link>}{m!=="register"&&<Link href="/login?mode=register">Create account</Link>}{m!=="reset"&&<Link href="/login?mode=reset">Forgot password?</Link>}</p></main>}
