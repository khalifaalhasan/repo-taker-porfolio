-- Supabase Schema for Dynamic Web Portfolio & CV Generator

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    job_title TEXT,
    bio TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    avatar_url TEXT,
    website_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile."
ON public.profiles FOR DELETE
USING (auth.uid() = id);


-- 2. Experiences Table
CREATE TABLE public.experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Experiences Policies
CREATE POLICY "Experiences are viewable by everyone."
ON public.experiences FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own experiences."
ON public.experiences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiences."
ON public.experiences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiences."
ON public.experiences FOR DELETE
USING (auth.uid() = user_id);


-- 3. Projects Table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    live_url TEXT,
    github_url TEXT,
    tech_stack TEXT[],
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects Policies
CREATE POLICY "Projects are viewable by everyone."
ON public.projects FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own projects."
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects."
ON public.projects FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects."
ON public.projects FOR DELETE
USING (auth.uid() = user_id);


-- 4. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio_assets', 'portfolio_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Avatar and thumbnails are publicly accessible."
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio_assets');

CREATE POLICY "Authenticated users can upload assets."
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio_assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their assets."
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio_assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their assets."
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio_assets' AND auth.role() = 'authenticated');


-- 5. Trigger to create a profile automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_experiences_updated
    BEFORE UPDATE ON public.experiences
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_projects_updated
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
