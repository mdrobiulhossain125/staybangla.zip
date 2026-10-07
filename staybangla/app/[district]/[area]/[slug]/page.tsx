import {notFound} from "next/navigation";import {getHotel} from "@/lib/data";import type {Metadata} from "next";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const h=await getHotel((await params).slug);return h?{title:`${h.name} – ${h.area}, ${h.district}`,description:h.description}:{}}
export default async function D({params}:{params:Promise<{slug:string}>}){const h=await getHotel((await params).slug);if(!h)notFound();
return <main className="mx-auto max-w-4xl space-y-6 p-4"><div className="grid gap-2 md:grid-cols-3">{h.images.map((u,i)=><img key={i} src={u} alt={h.name} className={`rounded-2xl object-cover ${i==0?"md:col-span-2 md:row-span-2":""}`}/>)}</div>
<h1 className="text-3xl font-bold">{h.name}</h1><p className="text-slate-700">{h.address}</p>
<p>{h.description}</p><section><h2 className="font-semibold">Facilities</h2><div className="mt-2 flex flex-wrap gap-2">{h.facilities.map(f=><span key={f} className="rounded-full bg-soft px-3 py-1 text-sm">{f}</span>)}</div></section>
<section><h2 className="font-semibold">Rent</h2><p>{h.priceMonth?`৳${h.priceMonth}/month`:`৳${h.priceNight}/night`}</p></section>
{h.rules&&<section><h2 className="font-semibold">Rules</h2><p>{h.rules}</p></section>}
<section className="rounded-2xl border p-4"><h2 className="font-semibold">Contact · {h.ownerName}</h2><a href={`tel:${h.phone}`} className="mt-2 inline-block rounded-full bg-brand px-6 py-3 text-white">Call {h.phone}</a></section>
<iframe title="map" className="h-64 w-full rounded-2xl border" src={`https://maps.google.com/maps?q=${encodeURIComponent(h.address)}&output=embed`}/></main>}
