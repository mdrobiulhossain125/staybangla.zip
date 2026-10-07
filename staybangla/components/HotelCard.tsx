import Link from "next/link";import {CATEGORIES} from "@/lib/geo";import type {Hotel} from "@/lib/data";
export default function HotelCard({h,en}:{h:Hotel;en:boolean}){return <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
<Link href={`/${h.district}/${h.area}/${h.slug}`}><img src={h.images[0]??"/placeholder.svg"} alt={h.name} className="h-44 w-full object-cover"/></Link>
<div className="space-y-2 p-4"><span className="rounded-full bg-soft px-2 py-0.5 text-xs text-brand">{CATEGORIES[h.category][en?1:0]}</span>
<h3 className="font-semibold">{h.name}</h3><p className="text-sm text-slate-700"><span className="capitalize">{h.area}, {h.district}</span></p>
<p className="text-sm">{h.facilities.slice(0,4).join(" · ")}</p>
<div className="flex items-end justify-between pt-2"><p className="text-lg font-bold">{h.priceMonth?`৳${h.priceMonth}/${en?"month":"মাস"}`:`৳${h.priceNight}/${en?"night":"রাত"}`}</p>
<a href={`tel:${h.phone}`} className="rounded-full bg-brand px-4 py-2 text-sm text-white">{en?"Call now":"কল করুন"}</a></div></div></article>}
