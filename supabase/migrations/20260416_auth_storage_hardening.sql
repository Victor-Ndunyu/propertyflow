create or replace function public.handle_new_user_bootstrap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_full_name text;
  default_agency text;
begin
  default_full_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(new.email, '@', 1),
    'Agent'
  );

  default_agency := coalesce(
    nullif(new.raw_user_meta_data ->> 'agency', ''),
    'Independent'
  );

  insert into public.profiles (user_id, role)
  values (new.id, 'agent')
  on conflict (user_id) do nothing;

  insert into public.agent_profiles (agent_id, full_name, agency_name)
  values (new.id, default_full_name, default_agency)
  on conflict (agent_id) do update
    set
      full_name = coalesce(public.agent_profiles.full_name, excluded.full_name),
      agency_name = coalesce(public.agent_profiles.agency_name, excluded.agency_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_propertyflow on auth.users;
create trigger on_auth_user_created_propertyflow
after insert on auth.users
for each row
execute function public.handle_new_user_bootstrap();

insert into public.profiles (user_id, role)
select u.id, 'agent'
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;

insert into public.agent_profiles (agent_id, full_name, agency_name)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1), 'Agent'),
  coalesce(nullif(u.raw_user_meta_data ->> 'agency', ''), 'Independent')
from auth.users u
left join public.agent_profiles ap on ap.agent_id = u.id
where ap.agent_id is null;

drop policy if exists "profiles managed by owner or admin" on public.profiles;
drop policy if exists "profiles are readable" on public.profiles;

create policy "profiles readable by owner or admin"
  on public.profiles
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "profiles inserted by owner as agent or admin"
  on public.profiles
  for insert
  with check (
    (auth.uid() = user_id and role = 'agent')
    or public.is_admin()
  );

create policy "profiles updated by owner as agent or admin"
  on public.profiles
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (
    (auth.uid() = user_id and role = 'agent')
    or public.is_admin()
  );

create policy "profiles deleted by admin"
  on public.profiles
  for delete
  using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update
  set public = true;

drop policy if exists "property images are publicly readable" on storage.objects;
create policy "property images are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'property-images');

drop policy if exists "property images inserted by owner folder" on storage.objects;
create policy "property images inserted by owner folder"
  on storage.objects
  for insert
  with check (
    bucket_id = 'property-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "property images updated by owner folder" on storage.objects;
create policy "property images updated by owner folder"
  on storage.objects
  for update
  using (
    bucket_id = 'property-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'property-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "property images deleted by owner folder" on storage.objects;
create policy "property images deleted by owner folder"
  on storage.objects
  for delete
  using (
    bucket_id = 'property-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
