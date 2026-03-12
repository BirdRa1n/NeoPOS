
  create table "catalog"."store_theme" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "store_id" uuid not null,
    "primary_color" character varying(7) not null default '#6366F1'::character varying,
    "secondary_color" character varying(7) not null default '#8B5CF6'::character varying,
    "accent_color" character varying(7) not null default '#10B981'::character varying,
    "background_color" character varying(7) not null default '#FFFFFF'::character varying,
    "surface_color" character varying(7) not null default '#F9FAFB'::character varying,
    "text_color" character varying(7) not null default '#111827'::character varying,
    "font_family" character varying(80) not null default 'Inter'::character varying,
    "border_radius" character varying(20) not null default 'rounded'::character varying,
    "card_style" character varying(20) not null default 'shadow'::character varying,
    "header_style" character varying(20) not null default 'cover'::character varying,
    "show_cover" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "catalog"."store_theme" enable row level security;


  create table "core"."store_hours" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "store_id" uuid not null,
    "day_of_week" smallint not null,
    "open_time" time without time zone not null,
    "close_time" time without time zone not null,
    "active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "core"."store_hours" enable row level security;

alter table "core"."stores" add column "cover_url" text;

alter table "core"."stores" add column "is_open" boolean not null default false;

alter table "core"."stores" add column "nickname" character varying(60);

alter table "core"."stores" add column "open_manually" boolean not null default false;

alter table "orders"."orders" add column "table_number" character varying(20);

CREATE UNIQUE INDEX store_theme_pkey ON catalog.store_theme USING btree (id);

CREATE UNIQUE INDEX store_theme_store_id_key ON catalog.store_theme USING btree (store_id);

CREATE UNIQUE INDEX store_hours_pkey ON core.store_hours USING btree (id);

CREATE UNIQUE INDEX store_hours_store_id_day_of_week_key ON core.store_hours USING btree (store_id, day_of_week);

CREATE UNIQUE INDEX stores_nickname_key ON core.stores USING btree (nickname);

alter table "catalog"."store_theme" add constraint "store_theme_pkey" PRIMARY KEY using index "store_theme_pkey";

alter table "core"."store_hours" add constraint "store_hours_pkey" PRIMARY KEY using index "store_hours_pkey";

alter table "catalog"."store_theme" add constraint "store_theme_store_id_fkey" FOREIGN KEY (store_id) REFERENCES core.stores(id) ON DELETE CASCADE not valid;

alter table "catalog"."store_theme" validate constraint "store_theme_store_id_fkey";

alter table "catalog"."store_theme" add constraint "store_theme_store_id_key" UNIQUE using index "store_theme_store_id_key";

alter table "core"."store_hours" add constraint "store_hours_day_of_week_check" CHECK (((day_of_week >= 0) AND (day_of_week <= 6))) not valid;

alter table "core"."store_hours" validate constraint "store_hours_day_of_week_check";

alter table "core"."store_hours" add constraint "store_hours_store_id_day_of_week_key" UNIQUE using index "store_hours_store_id_day_of_week_key";

alter table "core"."store_hours" add constraint "store_hours_store_id_fkey" FOREIGN KEY (store_id) REFERENCES core.stores(id) ON DELETE CASCADE not valid;

alter table "core"."store_hours" validate constraint "store_hours_store_id_fkey";

alter table "core"."stores" add constraint "stores_nickname_format" CHECK (((nickname)::text ~ '^[a-z0-9\-]+$'::text)) not valid;

alter table "core"."stores" validate constraint "stores_nickname_format";

alter table "core"."stores" add constraint "stores_nickname_key" UNIQUE using index "stores_nickname_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION core.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$
;

grant select on table "catalog"."addon_groups" to "anon";

grant delete on table "catalog"."addon_groups" to "authenticated";

grant insert on table "catalog"."addon_groups" to "authenticated";

grant select on table "catalog"."addon_groups" to "authenticated";

grant update on table "catalog"."addon_groups" to "authenticated";

grant select on table "catalog"."addons" to "anon";

grant delete on table "catalog"."addons" to "authenticated";

grant insert on table "catalog"."addons" to "authenticated";

grant select on table "catalog"."addons" to "authenticated";

grant update on table "catalog"."addons" to "authenticated";

grant select on table "catalog"."categories" to "anon";

grant delete on table "catalog"."categories" to "authenticated";

grant insert on table "catalog"."categories" to "authenticated";

grant select on table "catalog"."categories" to "authenticated";

grant update on table "catalog"."categories" to "authenticated";

grant select on table "catalog"."product_images" to "anon";

grant delete on table "catalog"."product_images" to "authenticated";

grant insert on table "catalog"."product_images" to "authenticated";

grant select on table "catalog"."product_images" to "authenticated";

grant update on table "catalog"."product_images" to "authenticated";

grant select on table "catalog"."products" to "anon";

grant delete on table "catalog"."products" to "authenticated";

grant insert on table "catalog"."products" to "authenticated";

grant select on table "catalog"."products" to "authenticated";

grant update on table "catalog"."products" to "authenticated";

grant delete on table "catalog"."store_theme" to "authenticated";

grant insert on table "catalog"."store_theme" to "authenticated";

grant select on table "catalog"."store_theme" to "authenticated";

grant update on table "catalog"."store_theme" to "authenticated";

grant delete on table "core"."customers" to "authenticated";

grant insert on table "core"."customers" to "authenticated";

grant select on table "core"."customers" to "authenticated";

grant update on table "core"."customers" to "authenticated";

grant delete on table "core"."delivery_drivers" to "authenticated";

grant insert on table "core"."delivery_drivers" to "authenticated";

grant select on table "core"."delivery_drivers" to "authenticated";

grant update on table "core"."delivery_drivers" to "authenticated";

grant select on table "core"."delivery_zones" to "anon";

grant delete on table "core"."delivery_zones" to "authenticated";

grant insert on table "core"."delivery_zones" to "authenticated";

grant select on table "core"."delivery_zones" to "authenticated";

grant update on table "core"."delivery_zones" to "authenticated";

grant delete on table "core"."store_hours" to "authenticated";

grant insert on table "core"."store_hours" to "authenticated";

grant select on table "core"."store_hours" to "authenticated";

grant update on table "core"."store_hours" to "authenticated";

grant delete on table "core"."stores" to "authenticated";

grant insert on table "core"."stores" to "authenticated";

grant select on table "core"."stores" to "authenticated";

grant update on table "core"."stores" to "authenticated";

grant delete on table "finance"."daily_summaries" to "authenticated";

grant insert on table "finance"."daily_summaries" to "authenticated";

grant select on table "finance"."daily_summaries" to "authenticated";

grant update on table "finance"."daily_summaries" to "authenticated";

grant delete on table "inventory"."product_supplies" to "authenticated";

grant insert on table "inventory"."product_supplies" to "authenticated";

grant select on table "inventory"."product_supplies" to "authenticated";

grant update on table "inventory"."product_supplies" to "authenticated";

grant delete on table "inventory"."stock_movements" to "authenticated";

grant insert on table "inventory"."stock_movements" to "authenticated";

grant select on table "inventory"."stock_movements" to "authenticated";

grant update on table "inventory"."stock_movements" to "authenticated";

grant delete on table "inventory"."supplies" to "authenticated";

grant insert on table "inventory"."supplies" to "authenticated";

grant select on table "inventory"."supplies" to "authenticated";

grant update on table "inventory"."supplies" to "authenticated";

grant delete on table "orders"."order_item_addons" to "authenticated";

grant insert on table "orders"."order_item_addons" to "authenticated";

grant select on table "orders"."order_item_addons" to "authenticated";

grant update on table "orders"."order_item_addons" to "authenticated";

grant delete on table "orders"."order_items" to "authenticated";

grant insert on table "orders"."order_items" to "authenticated";

grant select on table "orders"."order_items" to "authenticated";

grant update on table "orders"."order_items" to "authenticated";

grant delete on table "orders"."orders" to "authenticated";

grant insert on table "orders"."orders" to "authenticated";

grant select on table "orders"."orders" to "authenticated";

grant update on table "orders"."orders" to "authenticated";


  create policy "owner_all_store_theme"
  on "catalog"."store_theme"
  as permissive
  for all
  to public
using ((store_id IN ( SELECT stores.id
   FROM core.stores
  WHERE (stores.user_id = auth.uid()))));



  create policy "public_read_store_theme"
  on "catalog"."store_theme"
  as permissive
  for select
  to public
using (true);



  create policy "owner_all_store_hours"
  on "core"."store_hours"
  as permissive
  for all
  to public
using ((store_id IN ( SELECT stores.id
   FROM core.stores
  WHERE (stores.user_id = auth.uid()))));



  create policy "public_read_store_hours"
  on "core"."store_hours"
  as permissive
  for select
  to public
using (true);



  create policy "public_read_stores"
  on "core"."stores"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER trg_store_theme_updated_at BEFORE UPDATE ON catalog.store_theme FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();

CREATE TRIGGER trg_store_hours_updated_at BEFORE UPDATE ON core.store_hours FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();


  create policy "public select  1q9l3ac_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'store-images'::text));



  create policy "upload para admins 1q9l3ac_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'store-images'::text) AND ((storage.foldername(name))[1] = 'stores'::text) AND ((storage.foldername(name))[2] = ( SELECT (stores.id)::text AS id
   FROM core.stores
  WHERE (stores.user_id = auth.uid())
 LIMIT 1))));



