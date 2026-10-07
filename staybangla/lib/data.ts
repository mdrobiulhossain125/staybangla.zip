import {createClient} from "@/lib/supabase/server";
export type Hotel={id:string;slug:string;name:string;category:keyof typeof import("./geo").CATEGORIES;district:string;area:string;address:string;phone:string;description:string;priceNight?:number;priceMonth?:number;facilities:string[];images:string[];hostelType?:string;rules?:string;ownerName?:string};
const SEL="*,property_photos(url,sort),property_facilities(facilities(name_en))";
const map=(r:any):Hotel=>({id:r.id,slug:r.slug,name:r.name,category:r.category,district:r.district_slug,area:r.area_slug,address:r.address??"",phone:r.phone,description:r.description??"",priceNight:r.price_night??undefined,priceMonth:r.price_month??undefined,hostelType:r.hostel_type??undefined,rules:r.rules??undefined,ownerName:r.owner_name??undefined,
 facilities:(r.property_facilities??[]).map((x:any)=>x.facilities.name_en),images:(r.property_photos??[]).sort((a:any,b:any)=>a.sort-b.sort).map((x:any)=>x.url)});
export async function getHotels(f:{district?:string;category?:string;q?:string;max?:number;type?:string;area?:string}={}):Promise<Hotel[]>{
 const sb=await createClient();let q=sb.from("properties").select(SEL).eq("status","approved").order("created_at",{ascending:false});
 if(f.district)q=q.eq("district_slug",f.district);if(f.area)q=q.ilike("area",`%${f.area}%`);if(f.category)q=q.eq("category",f.category);if(f.type)q=q.eq("hostel_type",f.type);
 if(f.q)q=q.ilike("name",`%${f.q.replace(/[%,]/g,"")}%`);if(f.max)q=q.or(`price_month.lte.${f.max},price_night.lte.${Math.round(f.max/30)}`);
 const {data,error}=await q;if(error){console.error(error.message);return[]}return(data??[]).map(map)}
export async function getHotel(slug:string){const sb=await createClient();const {data}=await sb.from("properties").select(SEL).eq("status","approved").eq("slug",slug).maybeSingle();return data?map(data):null}
