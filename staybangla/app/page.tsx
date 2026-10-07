import {cookies} from "next/headers";import {DIVISIONS} from "@/lib/geo";import {getHotels} from "@/lib/data";import HotelCard from "@/components/HotelCard";
export default async function Home(){const en=(await cookies()).get("lang")?.value==="en";const hotels=await getHotels();
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z]+/g,"-");
return <main><section className="bg-gradient-to-b from-soft to-white px-4 py-20"><div className="mx-auto max-w-3xl text-center">
<h1 className="text-3xl font-bold leading-snug md:text-5xl">{en?"Find low-cost hotels and hostels in any district of Bangladesh":"বাংলাদেশের যেকোনো জেলায় কম খরচে হোটেল ও হোস্টেল খুঁজুন"}</h1>
<p className="mt-4 text-slate-700">{en?"Safe, affordable places that fit your budget":"আপনার বাজেট অনুযায়ী নিরাপদ ও সাশ্রয়ী থাকার জায়গা খুঁজে নিন"}</p>
<form action="/hostels" className="mt-8 grid gap-2 rounded-2xl bg-white p-3 shadow-md md:grid-cols-5">
<select name="district" className="rounded-xl border p-3"><option value="">{en?"District":"জেলা"}</option>{Object.values(DIVISIONS).flat().map(d=><option key={d} value={slug(d)}>{d}</option>)}</select>
<input name="area" placeholder={en?"Area":"এলাকা"} className="rounded-xl border p-3"/><input name="q" placeholder={en?"Hotel name":"হোটেলের নাম"} className="rounded-xl border p-3"/>
<select name="max" className="rounded-xl border p-3"><option value="">{en?"Budget":"বাজেট"}</option>{[2000,3000,5000,8000].map(n=><option key={n} value={n}>≤ ৳{n}</option>)}</select>
<button className="rounded-xl bg-brand p-3 text-white">{en?"Search":"খুঁজুন"}</button></form></div></section>
<section className="mx-auto max-w-6xl p-4"><h2 className="my-6 text-2xl font-semibold">{en?"Recently added":"নতুন যুক্ত হয়েছে"}</h2>
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{hotels.map(h=><HotelCard key={h.id} h={h} en={en}/>)}</div>
<h2 className="my-6 text-2xl font-semibold">{en?"Popular districts":"জনপ্রিয় জেলা"}</h2>
<div className="flex flex-wrap gap-2">{["Dhaka","Chattogram","Sylhet","Rajshahi","Khulna","Cox's Bazar"].map(d=><a key={d} href={`/hostels?district=${slug(d)}`} className="rounded-full border px-4 py-2">{d}</a>)}</div></section></main>}
