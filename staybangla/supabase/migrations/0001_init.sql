create type user_role as enum ('user','owner','admin','super_admin');
create type property_status as enum ('draft','pending','approved','rejected','suspended');
create function set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;

create table profiles(id uuid primary key references auth.users on delete cascade, full_name text, phone text, role user_role not null default 'user', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create function is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from profiles where id=auth.uid() and role in ('admin','super_admin')) $$;
create function is_super() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from profiles where id=auth.uid() and role='super_admin') $$;
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into profiles(id,full_name) values(new.id,new.raw_user_meta_data->>'full_name'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
create function protect_role() returns trigger language plpgsql as $$ begin
 if new.role<>old.role and auth.uid() is not null and pg_trigger_depth()<2 and not is_super() then raise exception 'role change not allowed'; end if; return new; end $$;
create trigger profiles_protect before update on profiles for each row execute function protect_role();

create table properties(
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references profiles on delete cascade,
 slug text unique not null, name text not null check (char_length(name) between 3 and 120),
 category text not null check (category in ('hotel','hostel','bachelor','female','family','guest_house')),
 hostel_type text check (hostel_type in ('male','female','student','professional')),
 description text, phone text not null, owner_name text,
 division text, district text not null, area text, district_slug text not null, area_slug text not null default 'area', address text, map_url text,
 price_night int check (price_night>=0), price_month int check (price_month>=0), price_min int check (price_min>=0), price_max int check (price_max>=0), pricing_notes text, rules text,
 status property_status not null default 'draft', rejection_reason text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index on properties(status); create index on properties(district_slug); create index on properties(owner_id);
create trigger properties_updated before update on properties for each row execute function set_updated_at();
create trigger profiles_updated before update on profiles for each row execute function set_updated_at();
create function promote_owner() returns trigger language plpgsql security definer set search_path=public as $$ begin update profiles set role='owner' where id=new.owner_id and role='user'; return new; end $$;
create trigger properties_promote after insert on properties for each row execute function promote_owner();

create table facilities(id serial primary key, slug text unique not null, name_en text not null, name_bn text);
insert into facilities(slug,name_en,name_bn) values ('wifi','WiFi','ওয়াইফাই'),('ac','AC','এসি'),('attached-bath','Attached Bathroom','অ্যাটাচড বাথরুম'),('parking','Parking','পার্কিং'),('generator','Generator','জেনারেটর'),('hot-water','Hot Water','গরম পানি'),('restaurant','Restaurant','রেস্টুরেন্ট'),('security','Security','নিরাপত্তা'),('family-room','Family Room','ফ্যামিলি রুম'),('food','Food','খাবার');
create table property_facilities(property_id uuid references properties on delete cascade, facility_id int references facilities, primary key(property_id,facility_id));
create table property_photos(id uuid primary key default gen_random_uuid(), property_id uuid not null references properties on delete cascade, path text not null, url text not null, sort int not null default 0, created_at timestamptz default now());
create index on property_photos(property_id);
create table inquiries(id uuid primary key default gen_random_uuid(), property_id uuid not null references properties on delete cascade, name text not null, phone text not null, message text, created_at timestamptz default now());
create table booking_requests(id uuid primary key default gen_random_uuid(), property_id uuid not null references properties on delete cascade, user_id uuid references profiles, name text, phone text, check_in date, check_out date, note text, status text not null default 'new', created_at timestamptz default now());
create table reviews(id uuid primary key default gen_random_uuid(), property_id uuid not null references properties on delete cascade, user_id uuid not null references profiles, rating int not null check (rating between 1 and 5), body text, created_at timestamptz default now(), unique(property_id,user_id));
create table notifications(id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles on delete cascade, title text not null, body text, read boolean not null default false, created_at timestamptz default now());
create table audit_logs(id bigserial primary key, actor_id uuid, action text not null, entity text, entity_id text, meta jsonb, created_at timestamptz default now());

create function owns_property(pid uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from properties where id=pid and owner_id=auth.uid()) $$;
create function can_view_property(pid uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from properties where id=pid and (status='approved' or owner_id=auth.uid())) or is_admin() $$;

alter table profiles enable row level security; alter table properties enable row level security; alter table facilities enable row level security; alter table property_facilities enable row level security; alter table property_photos enable row level security; alter table inquiries enable row level security; alter table booking_requests enable row level security; alter table reviews enable row level security; alter table notifications enable row level security; alter table audit_logs enable row level security;

create policy profiles_read on profiles for select using (id=auth.uid() or is_admin());
create policy profiles_update on profiles for update using (id=auth.uid() or is_super()) with check (id=auth.uid() or is_super());
create policy prop_public on properties for select using (status='approved');
create policy prop_own on properties for select using (owner_id=auth.uid());
create policy prop_admin_read on properties for select using (is_admin());
create policy prop_insert on properties for insert with check (owner_id=auth.uid() and status in ('draft','pending'));
create policy prop_update on properties for update using (owner_id=auth.uid() and status in ('draft','pending','rejected')) with check (owner_id=auth.uid() and status in ('draft','pending'));
create policy prop_admin_update on properties for update using (is_admin()) with check (is_admin());
create policy prop_delete on properties for delete using ((owner_id=auth.uid() and status='draft') or is_admin());
create policy fac_read on facilities for select using (true);
create policy fac_admin on facilities for all using (is_admin()) with check (is_admin());
create policy pf_read on property_facilities for select using (can_view_property(property_id));
create policy pf_write on property_facilities for all using (owns_property(property_id) or is_admin()) with check (owns_property(property_id) or is_admin());
create policy ph_read on property_photos for select using (can_view_property(property_id));
create policy ph_write on property_photos for all using (owns_property(property_id) or is_admin()) with check (owns_property(property_id) or is_admin());
create policy inq_insert on inquiries for insert with check (exists(select 1 from properties where id=property_id and status='approved'));
create policy inq_read on inquiries for select using (owns_property(property_id) or is_admin());
create policy bk_insert on booking_requests for insert with check (exists(select 1 from properties where id=property_id and status='approved') and (user_id is null or user_id=auth.uid()));
create policy bk_read on booking_requests for select using (user_id=auth.uid() or owns_property(property_id) or is_admin());
create policy bk_update on booking_requests for update using (owns_property(property_id) or is_admin());
create policy rev_read on reviews for select using (can_view_property(property_id));
create policy rev_insert on reviews for insert with check (user_id=auth.uid() and exists(select 1 from properties where id=property_id and status='approved'));
create policy rev_own on reviews for update using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy rev_del on reviews for delete using (user_id=auth.uid() or is_admin());
create policy note_own on notifications for select using (user_id=auth.uid());
create policy note_upd on notifications for update using (user_id=auth.uid());
create policy note_admin on notifications for insert with check (is_admin());
create policy audit_admin on audit_logs for select using (is_admin());
create policy audit_ins on audit_logs for insert with check (is_admin() and actor_id=auth.uid());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('property-photos','property-photos',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict (id) do nothing;
create policy "photos read" on storage.objects for select using (bucket_id='property-photos');
create policy "photos write" on storage.objects for insert with check (bucket_id='property-photos' and (owns_property(((storage.foldername(name))[2])::uuid) or is_admin()));
create policy "photos update" on storage.objects for update using (bucket_id='property-photos' and (owns_property(((storage.foldername(name))[2])::uuid) or is_admin()));
create policy "photos delete" on storage.objects for delete using (bucket_id='property-photos' and (owns_property(((storage.foldername(name))[2])::uuid) or is_admin()));
