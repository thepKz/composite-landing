-- CMS access is authorized by the server. Never expose admin, session or inquiry
-- tables through Supabase's automatically generated public API.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'schema_migrations', 'users', 'sessions', 'media_assets', 'posts',
    'post_revisions', 'post_media', 'products', 'product_media',
    'inquiries', 'site_settings', 'redirects', 'rate_limits'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM anon', table_name);
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM authenticated', table_name);
    END IF;
  END LOOP;
END $$;
