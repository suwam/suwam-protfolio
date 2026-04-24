
-- Roles enum and table (security best practice: roles separate from profiles)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- PROJECTS
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  tech TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  github_url TEXT,
  live_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  achievement TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BLOG POSTS
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL DEFAULT 'Development',
  tags TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  read_time_minutes INT NOT NULL DEFAULT 5,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ACHIEVEMENTS
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date_text TEXT,
  icon TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER achievements_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CERTIFICATIONS
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT,
  date_text TEXT,
  credential_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CONTACT SUBMISSIONS
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can see/update their own
CREATE POLICY "own_profile_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_profile_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles: only admins can read/write; user can read own
CREATE POLICY "read_own_roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_manage_roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public read for portfolio content
CREATE POLICY "public_read_projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "admin_write_projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "public_read_published_blogs" ON public.blog_posts FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_write_blogs" ON public.blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "public_read_achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "admin_write_achievements" ON public.achievements FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "public_read_certs" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "admin_write_certs" ON public.certifications FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Contact submissions: anyone can insert; only admin can read
CREATE POLICY "anyone_insert_contact" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_contact" ON public.contact_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_contact" ON public.contact_submissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_contact" ON public.contact_submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Seed projects
INSERT INTO public.projects (title, slug, description, long_description, tech, github_url, featured, achievement, display_order) VALUES
('Itinerary Voyager','itinerary-voyager','Travel planner with scenic route optimization using A* algorithm.','A cross-platform travel planning app that optimizes scenic routes using the A* search algorithm, integrating Firebase for realtime sync and Google Maps for visualization.','{Flutter,Firebase,Maps,A*}','https://github.com/suwam/Itenary-Voyager',true,'Best Project Award',1),
('Maze Generator','maze-generator','Interactive maze generator and solver using MERN and D3.js.','A fully interactive maze generation and solving platform built with the MERN stack, featuring D3.js visualizations of multiple algorithms.','{MongoDB,Express,React,Node.js,D3.js}',NULL,true,'Best Project Award',2),
('File Compressor','file-compressor','Lossless file compression tool using Huffman Encoding.','A C++ command-line tool that performs lossless file compression and decompression using a custom Huffman Encoding implementation.','{C++,Algorithms,Huffman}',NULL,false,NULL,3),
('Café Craft OMS','cafe-craft-oms','QR-based order management system with real-time updates.','A complete order management system for cafés with QR-based ordering and realtime kitchen dashboards using React and Firebase.','{React,Firebase,Realtime}',NULL,false,NULL,4),
('PixelNest UI Kit','pixelnest-ui-kit','Reusable component-based design system.','A TypeScript component library and design system with Storybook documentation for rapid product development.','{TypeScript,React,Storybook}',NULL,false,NULL,5),
('IPPR Lab Toolkit','ippr-lab-toolkit','Image processing and pattern recognition toolkit.','A Python-based toolkit using OpenCV for performing image processing and pattern recognition lab experiments.','{Python,OpenCV,NumPy}',NULL,false,NULL,6);

-- Seed achievements
INSERT INTO public.achievements (title, description, date_text, display_order) VALUES
('Best Project Award — Maze Generator','Awarded for outstanding interactive visualization and algorithmic implementation.','2024',1),
('Best Project Award — Itinerary Voyager','Recognized for innovative use of A* algorithm in travel route optimization.','2024',2),
('Coding Competition Winner','Won inter-college coding competition with strong algorithmic problem-solving.','2023',3),
('Internship Selection — Saiket Systems','Selected as a Frontend Intern through a competitive selection process.','2024',4);

-- Seed certifications
INSERT INTO public.certifications (title, issuer, date_text, display_order) VALUES
('Ethical Hacking Workshop','Cybersecurity Society','2024',1),
('Postman API Fundamentals','Postman','2024',2),
('JavaScript Certification','HackerRank','2023',3),
('Flutter Bootcamp','Google Developer Group','2024',4);

-- Seed initial blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, tags, featured, read_time_minutes) VALUES
('Building Itinerary Voyager: A* in the Real World','building-itinerary-voyager','How I applied the A* algorithm to optimize scenic travel routes in a Flutter app.','# Building Itinerary Voyager\n\nWhen I started building Itinerary Voyager, I wanted to do more than just plot points on a map. I wanted to find the *most scenic* route between two destinations.\n\n## Why A*?\n\nA* is the perfect balance between Dijkstra and a pure greedy search. By weighting edges with both distance and a "scenic score", I could push the algorithm toward beautiful routes.\n\n## Tech stack\n\n- Flutter for the cross-platform UI\n- Firebase for realtime sync\n- Google Maps for visualization\n\nThe result was an app that earned a Best Project Award at college.','College Projects','{Flutter,Algorithms,A*}',true,6),
('Designing a UI Kit Engineers Actually Use','designing-ui-kit','Lessons learned from building PixelNest, my reusable component design system.','# Designing a UI Kit Engineers Actually Use\n\nA design system is only as good as its adoption. Here are the principles I followed when building **PixelNest**.\n\n## 1. Tokens before components\n\nDefine colors, spacing, and typography as tokens first. Components consume tokens — never hardcode.\n\n## 2. Documentation is the product\n\nStorybook is not optional. If a component is not documented, it does not exist.\n\n## 3. Versioning matters\n\nBreaking changes need clear migration paths.','UI/UX','{TypeScript,Storybook,Design Systems}',true,5),
('My First Internship: 4 Lessons in 4 Weeks','first-internship-lessons','Reflections on my Frontend Intern experience at Saiket Systems.','# My First Internship: 4 Lessons in 4 Weeks\n\nStarting my first internship at **Saiket Systems** taught me more than any course could.\n\n1. **Read the codebase before writing code.**\n2. **Ask questions early — silence is expensive.**\n3. **Small PRs ship faster than big ones.**\n4. **Document as you go.**\n\nThese four habits changed how I approach every project now.','Personal Learnings','{Internship,Career}',false,4);
