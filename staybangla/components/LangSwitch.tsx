"use client";import {useRouter} from "next/navigation";
export default function LangSwitch({en}:{en:boolean}){const r=useRouter();return <button className="rounded-full border px-3 py-1" onClick={()=>{document.cookie=`lang=${en?"bn":"en"};path=/;max-age=31536000`;r.refresh()}}>{en?"বাংলা":"EN"}</button>}
