CREATE OR REPLACE FUNCTION public.admin_gift_chicken(target uuid, chicken_id integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.player_is_active() OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF chicken_id IS NULL OR chicken_id NOT BETWEEN 1 AND 35 THEN
    RAISE EXCEPTION 'Unknown chicken';
  END IF;
  UPDATE public.profiles
  SET owned = jsonb_set(owned, ARRAY[chicken_id::text], to_jsonb(coalesce((owned ->> chicken_id::text)::integer, 0) + 1)), updated_at = clock_timestamp()
  WHERE id = target;
  IF NOT FOUND THEN RAISE EXCEPTION 'Player not found'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_gift_chicken(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_gift_chicken(uuid, integer) TO authenticated;