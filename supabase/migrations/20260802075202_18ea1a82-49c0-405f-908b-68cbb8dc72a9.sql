CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('NR-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  city text NOT NULL,
  postal_code text NOT NULL,
  address text NOT NULL,
  note text,
  items jsonb NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('online','card_transfer')),
  payment_status text NOT NULL CHECK (payment_status IN ('awaiting_payment','paid','failed','awaiting_verification')),
  gateway_authority text,
  gateway_ref_id text,
  card_tracking_number text,
  receipt_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_authority_idx ON public.orders (gateway_authority);

GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();