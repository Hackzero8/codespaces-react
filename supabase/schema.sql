-- Supabase SQL schema for Twitter-like clone with full features
-- Profiles, Posts, Follows, Likes, Notifications, Search, Settings
-- Drop existing triggers, functions, and tables (in reverse order of dependencies)

-- Disable all RLS policies before dropping tables
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists trigger_follow_notification on follows;
drop trigger if exists trigger_like_notification on likes;
drop trigger if exists update_likes_count on likes;
drop trigger if exists update_follows_count on follows;
drop trigger if exists update_posts_count on posts;

-- Drop functions
drop function if exists public.handle_new_user();
drop function if exists is_blocked(uuid, uuid);
drop function if exists is_following(uuid, uuid);
drop function if exists get_timeline_feed(uuid, int, int);
drop function if exists mark_notifications_as_read(uuid);
drop function if exists get_unread_notifications_count(uuid);
drop function if exists search_posts(text, int);
drop function if exists search_users(text, int);
drop function if exists handle_follow_notification();
drop function if exists handle_like_notification();
drop function if exists create_notification(uuid, uuid, text, bigint);
drop function if exists update_post_counts();
drop function if exists update_profile_counts();

-- Drop tables (in reverse order of dependencies)
drop table if exists blocked_users;
drop table if exists search_history;
drop table if exists user_settings;
drop table if exists notifications;
drop table if exists likes;
drop table if exists follows;
drop table if exists posts;
drop table if exists profiles;

-- ============================================
-- PROFILES TABLE (User profiles)
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  avatar_url text,
  cover_url text,
  bio text,
  location text,
  website text,
  verified boolean default false,
  followers_count integer default 0,
  following_count integer default 0,
  posts_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profiles_username on profiles (username);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- ============================================
-- POSTS TABLE (Tweets/Posts)
-- ============================================
create table posts (
  id bigint generated always as identity primary key,
  content text not null,
  author_id uuid references profiles (id) on delete cascade not null,
  image_url text,
  likes_count integer default 0,
  replies_count integer default 0,
  reposts_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_posts_created_at on posts (created_at desc);
create index idx_posts_author_id on posts (author_id);
create index idx_posts_content_search on posts using gin(to_tsvector('spanish', content));

alter table posts enable row level security;

create policy "Public posts are viewable by everyone" on posts
  for select using (true);

create policy "Authenticated users can create posts" on posts
  for insert with check (auth.role() = 'authenticated' and auth.uid() = author_id);

create policy "Users can update own posts" on posts
  for update using (auth.uid() = author_id);

create policy "Users can delete own posts" on posts
  for delete using (auth.uid() = author_id);

-- ============================================
-- FOLLOWS TABLE (Relationships)
-- ============================================
create table follows (
  id bigint generated always as identity primary key,
  follower_id uuid references profiles (id) on delete cascade not null,
  following_id uuid references profiles (id) on delete cascade not null,
  created_at timestamptz default now(),
  constraint unique_follow unique (follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

create index idx_follows_follower_id on follows (follower_id);
create index idx_follows_following_id on follows (following_id);

alter table follows enable row level security;

create policy "Public follows are viewable by everyone" on follows
  for select using (true);

create policy "Authenticated users can create follows" on follows
  for insert with check (auth.role() = 'authenticated' and auth.uid() = follower_id);

create policy "Users can delete own follows" on follows
  for delete using (auth.uid() = follower_id);

-- ============================================
-- LIKES TABLE (Post likes)
-- ============================================
create table likes (
  id bigint generated always as identity primary key,
  post_id bigint references posts (id) on delete cascade not null,
  user_id uuid references profiles (id) on delete cascade not null,
  created_at timestamptz default now(),
  constraint unique_like unique (post_id, user_id)
);

create index idx_likes_post_id on likes (post_id);
create index idx_likes_user_id on likes (user_id);

alter table likes enable row level security;

create policy "Public likes are viewable by everyone" on likes
  for select using (true);

create policy "Authenticated users can like posts" on likes
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Users can delete own likes" on likes
  for delete using (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS TABLE (User notifications)
-- ============================================
create table notifications (
  id bigint generated always as identity primary key,
  user_id uuid references profiles (id) on delete cascade not null,
  actor_id uuid references profiles (id) on delete cascade not null,
  type text not null, -- 'like', 'follow', 'reply', 'repost', 'mention'
  post_id bigint references posts (id) on delete cascade,
  related_notification_id bigint references notifications (id) on delete cascade,
  read boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_user_id on notifications (user_id);
create index idx_notifications_created_at on notifications (created_at desc);
create index idx_notifications_read on notifications (user_id, read);
create index idx_notifications_actor_id on notifications (actor_id);

alter table notifications enable row level security;

create policy "Users can read own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "System can insert notifications" on notifications
  for insert with check (true);

create policy "Users can update own notifications" on notifications
  for update using (auth.uid() = user_id);

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
create table user_settings (
  id uuid references profiles (id) on delete cascade not null primary key,
  theme text default 'light', -- 'light', 'dark', 'auto'
  language text default 'es', -- Language preference
  private_account boolean default false,
  allow_notifications boolean default true,
  email_notifications boolean default true,
  push_notifications boolean default true,
  notification_follows boolean default true,
  notification_likes boolean default true,
  notification_replies boolean default true,
  notification_mentions boolean default true,
  analytics_enabled boolean default true,
  two_factor_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_user_settings_id on user_settings (id);

alter table user_settings enable row level security;

create policy "Users can read own settings" on user_settings
  for select using (auth.uid() = id);

create policy "Users can update own settings" on user_settings
  for update using (auth.uid() = id);

create policy "Users can insert own settings" on user_settings
  for insert with check (auth.uid() = id);

-- ============================================
-- SEARCH HISTORY TABLE
-- ============================================
create table search_history (
  id bigint generated always as identity primary key,
  user_id uuid references profiles (id) on delete cascade not null,
  query text not null,
  type text default 'general', -- 'people', 'posts', 'general'
  created_at timestamptz default now()
);

create index idx_search_history_user_id on search_history (user_id);
create index idx_search_history_created_at on search_history (created_at desc);

alter table search_history enable row level security;

create policy "Users can read own search history" on search_history
  for select using (auth.uid() = user_id);

create policy "Users can insert own search history" on search_history
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own search history" on search_history
  for delete using (auth.uid() = user_id);

-- ============================================
-- BLOCKED USERS TABLE
-- ============================================
create table blocked_users (
  id bigint generated always as identity primary key,
  blocker_id uuid references profiles (id) on delete cascade not null,
  blocked_id uuid references profiles (id) on delete cascade not null,
  created_at timestamptz default now(),
  constraint unique_block unique (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id != blocked_id)
);

create index idx_blocked_users_blocker_id on blocked_users (blocker_id);
create index idx_blocked_users_blocked_id on blocked_users (blocked_id);

alter table blocked_users enable row level security;

create policy "Users can read own blocks" on blocked_users
  for select using (auth.uid() = blocker_id);

create policy "Users can create blocks" on blocked_users
  for insert with check (auth.uid() = blocker_id);

create policy "Users can delete own blocks" on blocked_users
  for delete using (auth.uid() = blocker_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update profile counts
create or replace function update_profile_counts()
returns trigger as $$
begin
  if tg_table_name = 'posts' then
    if tg_op = 'INSERT' then
      update profiles set posts_count = posts_count + 1 where id = new.author_id;
    elsif tg_op = 'DELETE' then
      update profiles set posts_count = posts_count - 1 where id = old.author_id;
    end if;
  elsif tg_table_name = 'follows' then
    if tg_op = 'INSERT' then
      update profiles set followers_count = followers_count + 1 where id = new.following_id;
      update profiles set following_count = following_count + 1 where id = new.follower_id;
    elsif tg_op = 'DELETE' then
      update profiles set followers_count = followers_count - 1 where id = old.following_id;
      update profiles set following_count = following_count - 1 where id = old.follower_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql;

-- Triggers for profile counts
create trigger update_posts_count
after insert or delete on posts
for each row execute function update_profile_counts();

create trigger update_follows_count
after insert or delete on follows
for each row execute function update_profile_counts();

-- Function to update post counts
create or replace function update_post_counts()
returns trigger as $$
begin
  if tg_table_name = 'likes' then
    if tg_op = 'INSERT' then
      update posts set likes_count = likes_count + 1 where id = new.post_id;
    elsif tg_op = 'DELETE' then
      update posts set likes_count = likes_count - 1 where id = old.post_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_likes_count
after insert or delete on likes
for each row execute function update_post_counts();

-- Function to create notification
create or replace function create_notification(
  p_user_id uuid,
  p_actor_id uuid,
  p_type text,
  p_post_id bigint default null
)
returns void as $$
begin
  insert into notifications (user_id, actor_id, type, post_id, read)
  values (p_user_id, p_actor_id, p_type, p_post_id, false);
end;
$$ language plpgsql;

-- Function to trigger notifications on like
create or replace function handle_like_notification()
returns trigger as $$
begin
  if new.user_id != (select author_id from posts where id = new.post_id) then
    perform create_notification(
      (select author_id from posts where id = new.post_id),
      new.user_id,
      'like',
      new.post_id
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trigger_like_notification
after insert on likes
for each row execute function handle_like_notification();

-- Function to trigger notifications on follow
create or replace function handle_follow_notification()
returns trigger as $$
begin
  perform create_notification(new.following_id, new.follower_id, 'follow', null);
  return new;
end;
$$ language plpgsql;

create trigger trigger_follow_notification
after insert on follows
for each row execute function handle_follow_notification();

-- Function to search users
create or replace function search_users(search_query text, limit_count int default 20)
returns table (
  id uuid,
  username text,
  avatar_url text,
  bio text,
  followers_count integer
) as $$
begin
  return query
  select 
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.followers_count
  from profiles p
  where p.username ilike '%' || search_query || '%'
     or p.bio ilike '%' || search_query || '%'
  order by p.followers_count desc
  limit limit_count;
end;
$$ language plpgsql;

-- Function to search posts
create or replace function search_posts(search_query text, limit_count int default 20)
returns table (
  id bigint,
  content text,
  author_id uuid,
  author_username text,
  author_avatar text,
  created_at timestamptz,
  likes_count integer
) as $$
begin
  return query
  select 
    p.id,
    p.content,
    p.author_id,
    pr.username,
    pr.avatar_url,
    p.created_at,
    p.likes_count
  from posts p
  join profiles pr on p.author_id = pr.id
  where to_tsvector('spanish', p.content) @@ plainto_tsquery('spanish', search_query)
  order by p.created_at desc
  limit limit_count;
end;
$$ language plpgsql;

-- Function to get notifications count
create or replace function get_unread_notifications_count(p_user_id uuid)
returns integer as $$
declare
  count integer;
begin
  select count(*) into count from notifications where user_id = p_user_id and read = false;
  return count;
end;
$$ language plpgsql;

-- Function to mark notifications as read
create or replace function mark_notifications_as_read(p_user_id uuid)
returns void as $$
begin
  update notifications set read = true where user_id = p_user_id and read = false;
end;
$$ language plpgsql;

-- Function to get timeline feed
create or replace function get_timeline_feed(p_user_id uuid, p_limit int default 20, p_offset int default 0)
returns table (
  id bigint,
  content text,
  author_id uuid,
  author_username text,
  author_avatar text,
  author_verified boolean,
  image_url text,
  likes_count integer,
  replies_count integer,
  reposts_count integer,
  created_at timestamptz,
  liked_by_user boolean
) as $$
begin
  return query
  select 
    p.id,
    p.content,
    p.author_id,
    pr.username,
    pr.avatar_url,
    pr.verified,
    p.image_url,
    p.likes_count,
    p.replies_count,
    p.reposts_count,
    p.created_at,
    exists(select 1 from likes l where l.post_id = p.id and l.user_id = p_user_id) as liked_by_user
  from posts p
  join profiles pr on p.author_id = pr.id
  where p.author_id = p_user_id
     or p.author_id in (select following_id from follows where follower_id = p_user_id)
  order by p.created_at desc
  limit p_limit offset p_offset;
end;
$$ language plpgsql;

-- Function to toggle like for a post. Inserts or deletes a row in likes table.
create or replace function toggle_like(p_post_id bigint)
returns table(liked boolean, likes_count integer) as $$
declare
  v_user uuid := auth.uid();
  v_exists boolean;
begin
  select exists(select 1 from likes where post_id = p_post_id and user_id = v_user) into v_exists;
  if v_exists then
    delete from likes where post_id = p_post_id and user_id = v_user;
  else
    insert into likes (post_id, user_id) values (p_post_id, v_user);
  end if;

  -- likes_count is maintained by trigger update_post_counts
  return query select exists(select 1 from likes where post_id = p_post_id and user_id = v_user), (select likes_count from posts where id = p_post_id);
end;
$$ language plpgsql;

-- Function to check if user is following another user
create or replace function is_following(p_follower_id uuid, p_following_id uuid)
returns boolean as $$
declare
  result boolean;
begin
  select exists(select 1 from follows where follower_id = p_follower_id and following_id = p_following_id) into result;
  return result;
end;
$$ language plpgsql;

-- Function to check if user is blocked
create or replace function is_blocked(p_blocker_id uuid, p_blocked_id uuid)
returns boolean as $$
declare
  result boolean;
begin
  select exists(select 1 from blocked_users where blocker_id = p_blocker_id and blocked_id = p_blocked_id) into result;
  return result;
end;
$$ language plpgsql;

-- Helper function: auto-create profile when user signs up
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, username, created_at)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'email',
      substring(new.email from 1 for position('@' in new.email) - 1),
      'user_' || substring(new.id::text from 1 for 8)
    ),
    now()
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger to create profile on new auth user
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
