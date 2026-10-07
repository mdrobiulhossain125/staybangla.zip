import {createServerClient} from "@supabase/ssr";import {NextResponse,type NextRequest} from "next/server";
export async function middleware(req:NextRequest){let res=NextResponse.next({request:req});
const sb=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll:()=>req.cookies.getAll(),setAll:c=>{c.forEach(({name,value})=>req.cookies.set(name,value));res=NextResponse.next({request:req});c.forEach(({name,value,options})=>res.cookies.set(name,value,options))}}});
const {data:{user}}=await sb.auth.getUser();const p=req.nextUrl.pathname;
if(!user&&(p.startsWith("/dashboard")||p.startsWith("/admin")))return NextResponse.redirect(new URL("/login",req.url));
if(user&&p.startsWith("/admin")){const {data}=await sb.from("profiles").select("role").eq("id",user.id).single();if(!data||!["admin","super_admin"].includes(data.role))return NextResponse.redirect(new URL("/dashboard",req.url))}
return res}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
