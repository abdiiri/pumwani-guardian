
-- Allow admins to update and delete user_roles
create policy "Admins can update roles" on public.user_roles for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete roles" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all profiles (for user management)
create policy "Admins can read all profiles for management" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
