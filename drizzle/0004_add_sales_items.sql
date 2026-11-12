CREATE TABLE "sales_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sales_order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sales_order_product_unique" UNIQUE("sales_order_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "sales_items" ADD CONSTRAINT "sales_items_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_items" ADD CONSTRAINT "sales_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;