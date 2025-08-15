--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'MANAGER',
    'BARISTA'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Client" (
    id integer NOT NULL,
    client_number text NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    application_used text NOT NULL
);


ALTER TABLE public."Client" OWNER TO postgres;

--
-- Name: Client_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Client_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Client_id_seq" OWNER TO postgres;

--
-- Name: Client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Client_id_seq" OWNED BY public."Client".id;


--
-- Name: Ingredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Ingredient" (
    id integer NOT NULL,
    name text NOT NULL,
    unit text NOT NULL,
    "costPerUnit" double precision NOT NULL,
    "currentStock" double precision NOT NULL,
    "wastePercentage" double precision NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Ingredient" OWNER TO postgres;

--
-- Name: Ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Ingredient_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Ingredient_id_seq" OWNER TO postgres;

--
-- Name: Ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Ingredient_id_seq" OWNED BY public."Ingredient".id;


--
-- Name: InventoryLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InventoryLog" (
    id integer NOT NULL,
    "ingredientId" integer NOT NULL,
    change double precision NOT NULL,
    reason text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public."InventoryLog" OWNER TO postgres;

--
-- Name: InventoryLog_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."InventoryLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."InventoryLog_id_seq" OWNER TO postgres;

--
-- Name: InventoryLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."InventoryLog_id_seq" OWNED BY public."InventoryLog".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    "clientId" integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    application text NOT NULL,
    total double precision NOT NULL,
    "promoCode" text,
    notes text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderProduct; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderProduct" (
    "orderId" integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer NOT NULL,
    "packagingId" integer NOT NULL,
    "recipeId" integer,
    "unitPrice" double precision NOT NULL
);


ALTER TABLE public."OrderProduct" OWNER TO postgres;

--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Order_id_seq" OWNER TO postgres;

--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: Packaging; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Packaging" (
    id integer NOT NULL,
    type text NOT NULL,
    "costPerUnit" double precision NOT NULL,
    "currentStock" double precision NOT NULL
);


ALTER TABLE public."Packaging" OWNER TO postgres;

--
-- Name: Packaging_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Packaging_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Packaging_id_seq" OWNER TO postgres;

--
-- Name: Packaging_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Packaging_id_seq" OWNED BY public."Packaging".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id integer NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    "basePrice" double precision DEFAULT 0.0 NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Product_id_seq" OWNER TO postgres;

--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: Recipe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Recipe" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    variant text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "priceModifier" double precision DEFAULT 0.0 NOT NULL
);


ALTER TABLE public."Recipe" OWNER TO postgres;

--
-- Name: RecipeIngredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RecipeIngredient" (
    id integer NOT NULL,
    "recipeId" integer NOT NULL,
    "ingredientId" integer NOT NULL,
    quantity double precision NOT NULL
);


ALTER TABLE public."RecipeIngredient" OWNER TO postgres;

--
-- Name: RecipeIngredient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."RecipeIngredient_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."RecipeIngredient_id_seq" OWNER TO postgres;

--
-- Name: RecipeIngredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."RecipeIngredient_id_seq" OWNED BY public."RecipeIngredient".id;


--
-- Name: Recipe_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Recipe_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Recipe_id_seq" OWNER TO postgres;

--
-- Name: Recipe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Recipe_id_seq" OWNED BY public."Recipe".id;


--
-- Name: Sale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sale" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "packagingType" text NOT NULL,
    variant text NOT NULL,
    "salePrice" double precision NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public."Sale" OWNER TO postgres;

--
-- Name: Sale_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Sale_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Sale_id_seq" OWNER TO postgres;

--
-- Name: Sale_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Sale_id_seq" OWNED BY public."Sale".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'BARISTA'::public."UserRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Client id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client" ALTER COLUMN id SET DEFAULT nextval('public."Client_id_seq"'::regclass);


--
-- Name: Ingredient id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ingredient" ALTER COLUMN id SET DEFAULT nextval('public."Ingredient_id_seq"'::regclass);


--
-- Name: InventoryLog id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLog" ALTER COLUMN id SET DEFAULT nextval('public."InventoryLog_id_seq"'::regclass);


--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: Packaging id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Packaging" ALTER COLUMN id SET DEFAULT nextval('public."Packaging_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: Recipe id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recipe" ALTER COLUMN id SET DEFAULT nextval('public."Recipe_id_seq"'::regclass);


--
-- Name: RecipeIngredient id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecipeIngredient" ALTER COLUMN id SET DEFAULT nextval('public."RecipeIngredient_id_seq"'::regclass);


--
-- Name: Sale id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale" ALTER COLUMN id SET DEFAULT nextval('public."Sale_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Client" (id, client_number, name, address, application_used) FROM stdin;
1	010	hussam	1111	waiter
\.


--
-- Data for Name: Ingredient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Ingredient" (id, name, unit, "costPerUnit", "currentStock", "wastePercentage", "isDeleted") FROM stdin;
1	Oat Milk	ml	0.004	2000	0.03	f
2	Chocolate Powder	g	0.02	1000	0.02	f
3	Whole Milk	ml	0.0015	10000	0.02	f
4	Cinnamon Powder	g	0.15	100	0.05	f
5	Vanilla Syrup	ml	0.08	500	0.01	f
6	Almond Milk	ml	0.0035	2000	0.03	f
7	Caramel Syrup	ml	0.08	500	0.01	f
8	Sugar	g	0.002	2000	0.05	f
9	Coffee Beans (Espresso)	g	0.045	5000	0.03	f
10	Water	ml	0.0005	50000	0.01	f
\.


--
-- Data for Name: InventoryLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InventoryLog" (id, "ingredientId", change, reason, "timestamp", "userId") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "clientId", "userId", "createdAt", application, total, "promoCode", notes, status, "updatedAt") FROM stdin;
\.


--
-- Data for Name: OrderProduct; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderProduct" ("orderId", "productId", quantity, "packagingId", "recipeId", "unitPrice") FROM stdin;
\.


--
-- Data for Name: Packaging; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Packaging" (id, type, "costPerUnit", "currentStock") FROM stdin;
1	Large Cup (16oz)	0.25	500
2	Small Cup (8oz)	0.15	500
3	Takeaway Bag	0.1	200
4	Gift Box	2.5	50
5	Medium Cup (12oz)	0.2	500
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, category, "basePrice", description, "isActive") FROM stdin;
1	Espresso	Espresso	0	Pure, concentrated coffee shot	t
2	Mocha	Espresso	0	Espresso with chocolate, steamed milk and foam	t
3	Flat White	Espresso	0	Double espresso with microfoam steamed milk	t
4	Cappuccino	Espresso	0	Rich espresso with steamed milk and thick foam	t
5	Americano	Coffee	0	Rich espresso with hot water	t
6	Ethiopian Coffee Beans	Beans	15.99	Premium Ethiopian single-origin beans	t
7	Latte	Espresso	0	Smooth espresso with steamed milk and light foam	t
8	Colombian Coffee Beans	Beans	14.99	Smooth Colombian coffee beans	t
9	Coffee Grinder	Equipment	89.99	Professional burr coffee grinder	t
10	French Press	Equipment	29.99	Classic French press coffee maker	t
\.


--
-- Data for Name: Recipe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Recipe" (id, "productId", variant, "isActive", "priceModifier") FROM stdin;
1	4	Regular	t	0
2	4	Decaf	t	0
3	4	Extra Shot	t	0.5
4	4	Oat Milk	t	0.6
5	7	Regular	t	0
6	7	Vanilla	t	0.75
7	7	Caramel	t	0.75
8	7	Almond Milk	t	0.6
9	5	Regular	t	0
10	5	Long Shot	t	0.25
11	5	Extra Strong	t	0.5
12	1	Single Shot	t	0
13	1	Double Shot	t	0.75
14	1	Lungo	t	0.25
15	2	Regular	t	0
16	2	Dark Chocolate	t	0.5
17	3	Regular	t	0
18	3	Oat Milk	t	0.6
\.


--
-- Data for Name: RecipeIngredient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RecipeIngredient" (id, "recipeId", "ingredientId", quantity) FROM stdin;
1	1	9	18
2	1	10	60
3	1	3	150
4	2	9	18
5	2	10	60
6	2	3	150
7	3	9	27
8	3	10	90
9	3	3	150
10	4	9	18
11	4	10	60
12	4	1	150
13	5	9	18
14	5	10	60
15	5	3	180
16	6	9	18
17	6	10	60
18	6	3	180
19	6	5	15
20	7	9	18
21	7	10	60
22	7	3	180
23	7	7	15
24	8	9	18
25	8	10	60
26	8	6	180
27	9	9	18
28	9	10	180
29	10	9	18
30	10	10	240
31	11	9	27
32	11	10	150
33	12	9	9
34	12	10	30
35	13	9	18
36	13	10	60
37	14	9	18
38	14	10	90
39	15	9	18
40	15	10	60
41	15	3	150
42	15	2	15
43	16	9	18
44	16	10	60
45	16	3	150
46	16	2	20
47	17	9	18
48	17	10	60
49	17	3	120
50	18	9	18
51	18	10	60
52	18	1	120
\.


--
-- Data for Name: Sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sale" (id, "productId", quantity, date, "packagingType", variant, "salePrice", "userId") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, role, "createdAt", "updatedAt") FROM stdin;
1	Admin User	admin@coffeeshop.com	$2b$10$RxzCCKaNac0Z9hTi3NhG7.YzRGb8YT0vgxHkjkP/gCtJ130HQkIJm	ADMIN	2025-08-03 15:48:15.523	2025-08-08 08:37:30.749
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1d6e0114-67c0-4a2a-becf-3a58a66fe61e	a4f2ee49676d2e81b5ab0e2277b3a86fbc28fd1302eb0c6ebcdff4696ec7f5bc	2025-08-03 15:48:10.48907+00	20250611192918_init	\N	\N	2025-08-03 15:48:10.25718+00	1
1eaea834-86dc-419e-90d1-1e48a9fc4bb0	2a562e2e6b537803e31cdfe33cb01e514cb616fabcef20bea7603b3b703feef4	2025-08-03 15:48:10.54762+00	20250719174128_added_client_table	\N	\N	2025-08-03 15:48:10.495534+00	1
1bb4d1f4-a4ba-44d9-8c03-7aa7b901da5e	ac49ee072f01f3745bfead8f6060f6985427fe178c8a8222741a1d79437c8443	2025-08-03 15:48:10.612428+00	20250719175648_added_order_table	\N	\N	2025-08-03 15:48:10.553348+00	1
6f45aa59-7cc0-47b2-9bb0-6cfae3a92ad7	ae7b5883c17d77ea1c9d7bc07e9ac7b0cdffa30c973bdda6a7c4fc3e06e801e2	2025-08-03 15:48:10.657856+00	20250721094213_	\N	\N	2025-08-03 15:48:10.61706+00	1
e10c7a60-f1c7-48ef-85d1-0533beffb034	ed16b94dc4339b244cacfed2902c5d8305b13c74e771c9b1ff9dbfa06e99b32f	2025-08-03 15:48:10.67846+00	20250725112514_added_isdeleted_to_ingredient	\N	\N	2025-08-03 15:48:10.66229+00	1
d792a1bc-74b3-44e5-bae1-7cae222d423d	7ded63b2cec7dda4cd6c981b328aaaa62adef71109e4af5beb2add988dfd1856	2025-08-03 15:48:10.703146+00	20250728121400_add_pricing_and_order_status	\N	\N	2025-08-03 15:48:10.683073+00	1
\.


--
-- Name: Client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Client_id_seq"', 1, true);


--
-- Name: Ingredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Ingredient_id_seq"', 10, true);


--
-- Name: InventoryLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."InventoryLog_id_seq"', 1, false);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Order_id_seq"', 1, true);


--
-- Name: Packaging_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Packaging_id_seq"', 5, true);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Product_id_seq"', 10, true);


--
-- Name: RecipeIngredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."RecipeIngredient_id_seq"', 52, true);


--
-- Name: Recipe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Recipe_id_seq"', 18, true);


--
-- Name: Sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Sale_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 6, true);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: Ingredient Ingredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ingredient"
    ADD CONSTRAINT "Ingredient_pkey" PRIMARY KEY (id);


--
-- Name: InventoryLog InventoryLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLog"
    ADD CONSTRAINT "InventoryLog_pkey" PRIMARY KEY (id);


--
-- Name: OrderProduct OrderProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderProduct"
    ADD CONSTRAINT "OrderProduct_pkey" PRIMARY KEY ("orderId", "productId", "packagingId");


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Packaging Packaging_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Packaging"
    ADD CONSTRAINT "Packaging_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: RecipeIngredient RecipeIngredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY (id);


--
-- Name: Recipe Recipe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recipe"
    ADD CONSTRAINT "Recipe_pkey" PRIMARY KEY (id);


--
-- Name: Sale Sale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Client_client_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Client_client_number_key" ON public."Client" USING btree (client_number);


--
-- Name: Packaging_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Packaging_type_key" ON public."Packaging" USING btree (type);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: InventoryLog InventoryLog_ingredientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLog"
    ADD CONSTRAINT "InventoryLog_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES public."Ingredient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventoryLog InventoryLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLog"
    ADD CONSTRAINT "InventoryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderProduct OrderProduct_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderProduct"
    ADD CONSTRAINT "OrderProduct_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderProduct OrderProduct_packagingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderProduct"
    ADD CONSTRAINT "OrderProduct_packagingId_fkey" FOREIGN KEY ("packagingId") REFERENCES public."Packaging"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderProduct OrderProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderProduct"
    ADD CONSTRAINT "OrderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderProduct OrderProduct_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderProduct"
    ADD CONSTRAINT "OrderProduct_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public."Recipe"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RecipeIngredient RecipeIngredient_ingredientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES public."Ingredient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RecipeIngredient RecipeIngredient_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public."Recipe"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Recipe Recipe_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recipe"
    ADD CONSTRAINT "Recipe_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Sale Sale_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Sale Sale_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

