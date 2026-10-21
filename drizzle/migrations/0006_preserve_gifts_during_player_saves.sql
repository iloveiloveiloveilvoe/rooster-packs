CREATE OR REPLACE FUNCTION public.save_player_progress(inventory_delta jsonb, saved_opened integer, saved_coins integer, saved_buffs jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE inventory jsonb; item record; next_count integer;
BEGIN
  IF NOT public.player_is_active() THEN RAISE EXCEPTION 'Active player required'; END IF;
  SELECT owned INTO inventory FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Player not found'; END IF;
  FOR item IN SELECT key, value FROM jsonb_each_text(inventory_delta) LOOP
    next_count := greatest(0, coalesce((inventory ->> item.key)::integer, 0) + item.value::integer);
    IF next_count = 0 THEN inventory := inventory - item.key;
    ELSE inventory := jsonb_set(inventory, ARRAY[item.key], to_jsonb(next_count)); END IF;
  END LOOP;
  UPDATE public.profiles SET owned = inventory, opened = saved_opened, coins = saved_coins, buffs = saved_buffs, updated_at = clock_timestamp() WHERE id = auth.uid();
  RETURN inventory;
END;
$$;
REVOKE ALL ON FUNCTION public.save_player_progress(jsonb, integer, integer, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_player_progress(jsonb, integer, integer, jsonb) TO authenticated;