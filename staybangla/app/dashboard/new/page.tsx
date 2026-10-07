import {redirect} from "next/navigation";import {createClient} from "@/lib/supabase/server";import Wizard from "@/components/PropertyWizard";
export const metadata={title:"Add property"};
export default async function New({searchParams}:{searchParams:Promise<{id?:string}>}){const {id}=await searchParams;const sb=await createClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/login");
const {data:fac}=await sb.from("facilities").select("id,name_en").order("id");let initial=null;
if(id){const {data}=await sb.from("properties").select("*,property_facilities(facility_id)").eq("id",id).eq("owner_id",user.id).maybeSingle();initial=data}
return <Wizard facilities={fac??[]} initial={initial}/>}
