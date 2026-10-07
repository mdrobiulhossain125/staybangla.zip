"use server";
import {redirect} from "next/navigation";import {headers} from "next/headers";import {createClient} from "@/lib/supabase/server";
const go=(m:string,e:string)=>redirect(`/login?mode=${m}&error=${encodeURIComponent(e)}`);
export async function login(f:FormData){const sb=await createClient();const {error}=await sb.auth.signInWithPassword({email:String(f.get("email")),password:String(f.get("password"))});if(error)go("login","Email or password is incorrect.");redirect("/dashboard")}
export async function register(f:FormData){const p=String(f.get("password"));if(p.length<8)go("register","Password must be at least 8 characters.");
const sb=await createClient();const {error}=await sb.auth.signUp({email:String(f.get("email")),password:p,options:{data:{full_name:String(f.get("name")).slice(0,100)}}});if(error)go("register","Could not create the account. Try a different email.");redirect("/login?mode=login&ok=Account created. Check your email to confirm, then log in.")}
export async function reset(f:FormData){const o=(await headers()).get("origin");const sb=await createClient();await sb.auth.resetPasswordForEmail(String(f.get("email")),{redirectTo:`${o}/dashboard`});redirect("/login?mode=login&ok=If the email exists, a reset link has been sent.")}
export async function signOut(){const sb=await createClient();await sb.auth.signOut();redirect("/")}
