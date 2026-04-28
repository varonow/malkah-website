# Malkah Website

Plain HTML + CSS + JavaScript + Supabase.
No build tools. No Node.js. Edit files directly in VS Code.

## File Structure

```
malkah-website/
├── index.html      ← Home / About / Mission
├── products.html   ← Products (Coming Soon)
├── contact.html    ← Contact Form
├── style.css       ← All styles (colors, fonts, layout)
├── main.js         ← Shared JS (nav, mobile menu)
├── supabase.js     ← Database interactions
├── logo.png        ← Malkah logo
└── README.md
```

## Making Changes

Just open any file in VS Code and edit it directly.
No terminal needed for day-to-day updates.

## Supabase Setup (for contact form)

1. Go to supabase.com and create a free account
2. Create a new project
3. Go to SQL Editor and run this to create the tables:

```sql
-- Contact form submissions
create table contact_submissions (
  id         bigint generated always as identity primary key,
  name       text not null,
  email      text not null,
  org        text,
  role       text,
  message    text not null,
  created_at timestamptz default now()
);

-- Product launch notify list
create table notify_emails (
  id         bigint generated always as identity primary key,
  email      text not null unique,
  created_at timestamptz default now()
);

-- Allow public inserts (for the contact form)
alter table contact_submissions enable row level security;
alter table notify_emails enable row level security;

create policy "Allow public inserts" on contact_submissions
  for insert with check (true);

create policy "Allow public inserts" on notify_emails
  for insert with check (true);
```

4. Go to Project Settings → API
5. Copy your Project URL and anon public key
6. Open supabase.js and replace:
   - YOUR_SUPABASE_URL → your project URL
   - YOUR_SUPABASE_ANON_KEY → your anon key

## GitHub Pages Deployment

1. Push all files to your GitHub repo (main branch)
2. Go to repo Settings → Pages → Source → Deploy from branch → main
3. Site will be live at https://YOUR-USERNAME.github.io/malkah-website

## Custom Domain (malkah.org)

In your Squarespace DNS add:
| Type  | Host | Value                   |
|-------|------|-------------------------|
| A     | @    | 185.199.108.153         |
| A     | @    | 185.199.109.153         |
| A     | @    | 185.199.110.153         |
| A     | @    | 185.199.111.153         |
| CNAME | www  | YOUR-USERNAME.github.io |

Then in your GitHub repo add a file called `CNAME` containing just:
```
malkah.org
```

## Adding a New Page Later

1. Copy any existing .html file
2. Update the content
3. Add a link to it in the nav section of all pages
   (just search for "nav-links" in any file)
