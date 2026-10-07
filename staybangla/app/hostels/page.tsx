import {cookies} from "next/headers";import {getHotels} from "@/lib/data";import HotelCard from "@/components/HotelCard";
export const metadata={title:"Hostels in Bangladesh – হোস্টেল"};
export default async function P({searchParams}:{searchParams:Promise<Record<string,string>>}){const s=await searchParams;const en=(await cookies()).get("lang")?.value==="en";
const hs=await getHotels({district:s.district,q:s.q,area:s.area,type:s.type,max:s.max?+s.max:undefined});
return <main className="mx-auto max-w-6xl p-4"><h1 className="my-6 text-2xl font-bold">{en?"Hostels & hotels":"হোস্টেল ও হোটেল"}</h1>
<div className="mb-4 flex flex-wrap gap-2 text-sm">{["male","female","student","professional"].map(t=><a key={t} className="rounded-full border px-3 py-1" href={`?type=${t}`}>{t}</a>)}</div>
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{hs.map(h=><HotelCard key={h.id} h={h} en={en}/>)}</div></main>}
