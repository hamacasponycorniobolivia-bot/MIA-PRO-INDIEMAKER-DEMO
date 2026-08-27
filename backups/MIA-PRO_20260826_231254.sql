--
-- PostgreSQL database dump
--

\restrict cQl6xka1JVJzFZ18FZQ9ddSHLbjKVsTxZevWpmKZHE9Rn3lIZF9c7YEevRMrzAv

-- Dumped from database version 15.19
-- Dumped by pg_dump version 15.19

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
-- Name: check_wallet_tenant(); Type: FUNCTION; Schema: public; Owner: ninja
--

CREATE FUNCTION public.check_wallet_tenant() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN IF NEW.tenant_id != (SELECT tenant_id FROM users WHERE id = NEW.user_id) THEN RAISE EXCEPTION 'Wallet tenant_id must match user''s tenant_id'; END IF; RETURN NEW; END; $$;


ALTER FUNCTION public.check_wallet_tenant() OWNER TO ninja;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: ninja
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


ALTER TABLE public._prisma_migrations OWNER TO ninja;

--
-- Name: assets; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.assets (
    id integer NOT NULL,
    token_id character varying(255) NOT NULL,
    owner_address character varying(255) NOT NULL,
    metadata_uri text,
    created_at timestamp without time zone DEFAULT now(),
    tenant_id integer
);


ALTER TABLE public.assets OWNER TO ninja;

--
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.assets_id_seq OWNER TO ninja;

--
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    actor_email character varying(255) NOT NULL,
    action character varying(255) NOT NULL,
    target character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    tenant_id integer,
    user_id integer,
    ip_address character varying(50),
    user_agent text,
    old_values jsonb,
    new_values jsonb,
    table_name character varying(100),
    record_id integer
);


ALTER TABLE public.audit_logs OWNER TO ninja;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audit_logs_id_seq OWNER TO ninja;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: blockchain_transactions; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.blockchain_transactions (
    id integer NOT NULL,
    tx_hash character varying(255),
    status character varying(50) DEFAULT 'PENDING'::character varying,
    block_number bigint,
    confirmations integer DEFAULT 0,
    operation_type character varying(100),
    operation_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.blockchain_transactions OWNER TO ninja;

--
-- Name: blockchain_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.blockchain_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.blockchain_transactions_id_seq OWNER TO ninja;

--
-- Name: blockchain_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.blockchain_transactions_id_seq OWNED BY public.blockchain_transactions.id;


--
-- Name: ledger; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.ledger (
    id integer NOT NULL,
    tx_hash character varying(255) NOT NULL,
    user_address character varying(255) NOT NULL,
    amount character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ledger OWNER TO ninja;

--
-- Name: ledger_accounts; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.ledger_accounts (
    id integer NOT NULL,
    tenant_id integer,
    user_id integer,
    balance numeric(38,18) DEFAULT 0,
    currency character varying(10) DEFAULT 'USDC'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ledger_accounts OWNER TO ninja;

--
-- Name: ledger_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.ledger_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ledger_accounts_id_seq OWNER TO ninja;

--
-- Name: ledger_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.ledger_accounts_id_seq OWNED BY public.ledger_accounts.id;


--
-- Name: ledger_entries; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.ledger_entries (
    id integer NOT NULL,
    transaction_id integer,
    account_id integer,
    debit numeric(38,18),
    credit numeric(38,18),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ledger_entries OWNER TO ninja;

--
-- Name: ledger_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.ledger_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ledger_entries_id_seq OWNER TO ninja;

--
-- Name: ledger_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.ledger_entries_id_seq OWNED BY public.ledger_entries.id;


--
-- Name: ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.ledger_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ledger_id_seq OWNER TO ninja;

--
-- Name: ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.ledger_id_seq OWNED BY public.ledger.id;


--
-- Name: ledger_transactions; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.ledger_transactions (
    id integer NOT NULL,
    tenant_id integer,
    operation_type character varying(100) NOT NULL,
    idempotency_key character varying(255),
    status character varying(50) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ledger_transactions OWNER TO ninja;

--
-- Name: ledger_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.ledger_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ledger_transactions_id_seq OWNER TO ninja;

--
-- Name: ledger_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.ledger_transactions_id_seq OWNED BY public.ledger_transactions.id;


--
-- Name: listings; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    token_id character varying(255) NOT NULL,
    seller_address character varying(255) NOT NULL,
    price_wei character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    tenant_id integer
);


ALTER TABLE public.listings OWNER TO ninja;

--
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.listings_id_seq OWNER TO ninja;

--
-- Name: listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.listings_id_seq OWNED BY public.listings.id;


--
-- Name: nfts; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.nfts (
    id integer NOT NULL,
    tenant_id integer,
    token_id character varying(255) NOT NULL,
    owner_id integer,
    metadata_uri text,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp without time zone
);


ALTER TABLE public.nfts OWNER TO ninja;

--
-- Name: nfts_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.nfts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.nfts_id_seq OWNER TO ninja;

--
-- Name: nfts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.nfts_id_seq OWNED BY public.nfts.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    tenant_id integer,
    buyer_id integer,
    seller_id integer,
    nft_id integer,
    price character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO ninja;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO ninja;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: organization_members; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.organization_members (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    user_id integer NOT NULL,
    role character varying(50) DEFAULT 'member'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    role_id integer
);


ALTER TABLE public.organization_members OWNER TO ninja;

--
-- Name: organization_members_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.organization_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.organization_members_id_seq OWNER TO ninja;

--
-- Name: organization_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.organization_members_id_seq OWNED BY public.organization_members.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    tenant_id integer
);


ALTER TABLE public.organizations OWNER TO ninja;

--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.organizations_id_seq OWNER TO ninja;

--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: outbox_events; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.outbox_events (
    id integer NOT NULL,
    event_type character varying(100) NOT NULL,
    payload jsonb,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.outbox_events OWNER TO ninja;

--
-- Name: outbox_events_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.outbox_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.outbox_events_id_seq OWNER TO ninja;

--
-- Name: outbox_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.outbox_events_id_seq OWNED BY public.outbox_events.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.roles OWNER TO ninja;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO ninja;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.tenants (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tenants OWNER TO ninja;

--
-- Name: tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.tenants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tenants_id_seq OWNER TO ninja;

--
-- Name: tenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.tenants_id_seq OWNED BY public.tenants.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    tx_hash character varying(255) NOT NULL,
    event_type character varying(100) NOT NULL,
    from_address character varying(255),
    to_address character varying(255),
    token_id character varying(255),
    amount character varying(255),
    block_number bigint,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.transactions OWNER TO ninja;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO ninja;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    role character varying(50) DEFAULT 'USER'::character varying,
    tenant_id integer,
    deleted_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO ninja;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO ninja;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.wallets (
    id integer NOT NULL,
    user_address character varying(255) NOT NULL,
    usdc_balance character varying(255) DEFAULT '0'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    user_id integer,
    tenant_id integer
);


ALTER TABLE public.wallets OWNER TO ninja;

--
-- Name: wallets_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.wallets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.wallets_id_seq OWNER TO ninja;

--
-- Name: wallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.wallets_id_seq OWNED BY public.wallets.id;


--
-- Name: webhook_deliveries; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.webhook_deliveries (
    id integer NOT NULL,
    webhook_id integer,
    payload jsonb,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    attempts integer DEFAULT 0,
    next_attempt_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.webhook_deliveries OWNER TO ninja;

--
-- Name: webhook_deliveries_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.webhook_deliveries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.webhook_deliveries_id_seq OWNER TO ninja;

--
-- Name: webhook_deliveries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.webhook_deliveries_id_seq OWNED BY public.webhook_deliveries.id;


--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.webhooks (
    id integer NOT NULL,
    url character varying(500) NOT NULL,
    event_type character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.webhooks OWNER TO ninja;

--
-- Name: webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: ninja
--

CREATE SEQUENCE public.webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.webhooks_id_seq OWNER TO ninja;

--
-- Name: webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninja
--

ALTER SEQUENCE public.webhooks_id_seq OWNED BY public.webhooks.id;


--
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: blockchain_transactions id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.blockchain_transactions ALTER COLUMN id SET DEFAULT nextval('public.blockchain_transactions_id_seq'::regclass);


--
-- Name: ledger id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger ALTER COLUMN id SET DEFAULT nextval('public.ledger_id_seq'::regclass);


--
-- Name: ledger_accounts id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_accounts ALTER COLUMN id SET DEFAULT nextval('public.ledger_accounts_id_seq'::regclass);


--
-- Name: ledger_entries id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_entries ALTER COLUMN id SET DEFAULT nextval('public.ledger_entries_id_seq'::regclass);


--
-- Name: ledger_transactions id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_transactions ALTER COLUMN id SET DEFAULT nextval('public.ledger_transactions_id_seq'::regclass);


--
-- Name: listings id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.listings ALTER COLUMN id SET DEFAULT nextval('public.listings_id_seq'::regclass);


--
-- Name: nfts id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.nfts ALTER COLUMN id SET DEFAULT nextval('public.nfts_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: organization_members id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.organization_members ALTER COLUMN id SET DEFAULT nextval('public.organization_members_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: outbox_events id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.outbox_events ALTER COLUMN id SET DEFAULT nextval('public.outbox_events_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: tenants id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.tenants ALTER COLUMN id SET DEFAULT nextval('public.tenants_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wallets id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.wallets ALTER COLUMN id SET DEFAULT nextval('public.wallets_id_seq'::regclass);


--
-- Name: webhook_deliveries id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.webhook_deliveries ALTER COLUMN id SET DEFAULT nextval('public.webhook_deliveries_id_seq'::regclass);


--
-- Name: webhooks id; Type: DEFAULT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.webhooks ALTER COLUMN id SET DEFAULT nextval('public.webhooks_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5d6b7203-e220-4b17-af1f-b642d6c15b42	361399b2a9d53179f3ea02f415cd2942689a8d01e7133cac26935c4362a86ee9	2026-08-25 16:48:54.565742+00	00000000000000_baseline		\N	2026-08-25 16:48:54.565742+00	0
eeaf8611-a8a5-4489-be35-611c0fd68d10	92ec83935580081cd28dc629305fe61b4cfa1b10cfe44a9badb04544967b472b	2026-08-25 16:49:12.698786+00	20260825164912_add_tenant_isolation_assets_listings	\N	\N	2026-08-25 16:49:12.574809+00	1
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.assets (id, token_id, owner_address, metadata_uri, created_at, tenant_id) FROM stdin;
3	1	0x1111111111111111111111111111111111111127	\N	2026-08-25 18:06:08.642421	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.audit_logs (id, actor_email, action, target, created_at, tenant_id, user_id, ip_address, user_agent, old_values, new_values, table_name, record_id) FROM stdin;
107	unknown	USER_CREATED	User test@test.com	2026-08-25 12:50:32.637499	\N	19	127.0.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	\N	{"role": "USER", "email": "test@test.com"}	users	19
108	unknown	USER_DELETED	User test@test.com	2026-08-25 12:50:48.503755	\N	19	127.0.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	{"role": "USER", "email": "test@test.com"}	\N	users	19
109	unknown	USER_DELETED	User test@test.com	2026-08-25 12:50:51.304169	\N	19	127.0.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	{"role": "USER", "email": "test@test.com"}	\N	users	19
110	unknown	USER_DELETED	User test@test.com	2026-08-25 12:52:19.544823	\N	19	127.0.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	{"role": "USER", "email": "test@test.com"}	\N	users	19
111	unknown	USER_DELETED	User test@test.com	2026-08-25 13:25:35.764184	\N	19	127.0.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	{"role": "USER", "email": "test@test.com"}	\N	users	19
112	unknown	USER_DELETED	User test@test.com	2026-08-25 13:26:09.004487	\N	19	127.0.0.1	curl/8.18.0	{"role": "USER", "email": "test@test.com"}	\N	users	19
113	unknown	USER_DELETED	User test@test.com	2026-08-25 13:28:34.489343	\N	19	127.0.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	{"role": "USER", "email": "test@test.com"}	\N	users	19
114	unknown	USER_DELETED	User test@test.com	2026-08-25 13:30:15.857915	\N	19	127.0.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	{"role": "USER", "email": "test@test.com"}	\N	users	19
115	unknown	USER_DELETED	User test@test.com	2026-08-25 13:35:26.146015	\N	19	127.0.0.1	curl/8.18.0	{"role": "USER", "email": "test@test.com"}	\N	users	19
116	unknown	USER_DELETED	User test@test.com	2026-08-25 13:37:29.819993	\N	19	127.0.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	{"role": "USER", "email": "test@test.com"}	\N	users	19
\.


--
-- Data for Name: blockchain_transactions; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.blockchain_transactions (id, tx_hash, status, block_number, confirmations, operation_type, operation_id, created_at) FROM stdin;
\.


--
-- Data for Name: ledger; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.ledger (id, tx_hash, user_address, amount, type, created_at) FROM stdin;
1	sim_1787510897929	0xc3bB09D6453970fc8e093e8E7860c79dFae0e6B8	100	deposit	2026-08-23 18:48:17.9308
2	sim_1787510939871	0xc3bB09D6453970fc8e093e8E7860c79dFae0e6B8	50	withdraw	2026-08-23 18:48:59.872368
3	sim_1787511043270	0xc3bB09D6453970fc8e093e8E7860c79dFae0e6B8	10	purchase	2026-08-23 18:50:43.271312
4	sim_1787511456592	0xc3bB09D6453970fc8e093e8E7860c79dFae0e6B8	50	deposit	2026-08-23 18:57:36.594932
5	sim_1787641735811	0xc3bB09D6453970fc8e093e8E7860c79dFae0e6B8	50	deposit	2026-08-25 07:08:55.813145
6	sim_1787649332977	0xc3bB09D6453970fc8e093e8E7860c79dFae0e6B8	40	withdraw	2026-08-25 09:15:32.978181
7	sim_1787675525883	0x742d35Cc6634C0532925a3b844Bc3Ae6C47D9B1a	1	withdraw	2026-08-25 16:32:05.885134
8	sim_1787681673745	0x1111111111111111111111111111111111111127	100	purchase	2026-08-25 18:14:33.718877
9	sim_1787682513053	0x742d35Cc6634C0532925a3b844Bc3Ae6C47D9B1a	150	purchase	2026-08-25 18:28:33.021605
10	sim_1787794199262	0x1111111111111111111111111111111111111127	200	purchase	2026-08-27 01:29:59.105068
\.


--
-- Data for Name: ledger_accounts; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.ledger_accounts (id, tenant_id, user_id, balance, currency, created_at) FROM stdin;
3	1	18	1000.000000000000000000	USDC	2026-08-25 15:06:07.239996
\.


--
-- Data for Name: ledger_entries; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.ledger_entries (id, transaction_id, account_id, debit, credit, created_at) FROM stdin;
4	3	3	500.000000000000000000	0.000000000000000000	2026-08-25 15:07:18.099415
5	3	3	0.000000000000000000	500.000000000000000000	2026-08-25 15:07:18.099415
\.


--
-- Data for Name: ledger_transactions; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.ledger_transactions (id, tenant_id, operation_type, idempotency_key, status, created_at) FROM stdin;
3	1	DEPOSIT	\N	COMPLETED	2026-08-25 15:06:42.828344
4	1	DEPOSIT	unique-key-001	COMPLETED	2026-08-25 15:08:12.013773
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.listings (id, token_id, seller_address, price_wei, is_active, created_at, tenant_id) FROM stdin;
2	1	0x1111111111111111111111111111111111111127	150	f	2026-08-25 18:27:34.320692	1
1	1	0x742d35Cc6634C0532925a3b844Bc3Ae6C47D9B1a	100	f	2026-08-25 18:06:41.849349	1
3	1	0x742d35Cc6634C0532925a3b844Bc3Ae6C47D9B1a	200	f	2026-08-26 23:23:23.400502	1
\.


--
-- Data for Name: nfts; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.nfts (id, tenant_id, token_id, owner_id, metadata_uri, status, created_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.orders (id, tenant_id, buyer_id, seller_id, nft_id, price, status, created_at) FROM stdin;
\.


--
-- Data for Name: organization_members; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.organization_members (id, organization_id, user_id, role, created_at, role_id) FROM stdin;
2	16	18	member	2026-08-25 15:03:05.36967	\N
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.organizations (id, name, slug, created_at, tenant_id) FROM stdin;
16	Ninja Org Principal	ninja-org-principal	2026-08-25 15:02:24.299769	1
17	Test Org E2E	test-org-e2e-1787671606240	2026-08-25 15:26:46.2569	\N
18	Test Org E2E	test-org-e2e-1787671690320	2026-08-25 15:28:10.340033	\N
19	Test Org E2E	test-org-e2e-1787672000118	2026-08-25 15:33:20.137306	\N
20	Test Org E2E	test-org-e2e-1787672001867	2026-08-25 15:33:21.868126	\N
21	Test Org E2E	test-org-e2e-1787672441689	2026-08-25 15:40:41.707054	\N
22	Test Org E2E	test-org-e2e-1787672748298	2026-08-25 15:45:48.31555	\N
23	Test Org E2E	test-org-e2e-1787672776455	2026-08-25 15:46:16.473457	\N
24	Test Org E2E	test-org-e2e-1787672897480	2026-08-25 15:48:17.498386	\N
25	Test Org E2E	test-org-e2e-1787672913399	2026-08-25 15:48:33.416322	\N
26	Test Org E2E	test-org-e2e-1787672996148	2026-08-25 15:49:56.166047	\N
27	Test Org E2E	test-org-e2e-1787673123879	2026-08-25 15:52:03.898584	\N
28	Test Org E2E	test-org-e2e-1787673353448	2026-08-25 15:55:53.467772	\N
29	Test Org E2E	test-org-e2e-1787674676757	2026-08-25 16:17:56.77389	\N
30	Test Org E2E	test-org-e2e-1787674709888	2026-08-25 16:18:29.904804	\N
31	Test Org E2E	test-org-e2e-1787674743931	2026-08-25 16:19:03.947356	\N
32	Test Org E2E	test-org-e2e-1787675004013	2026-08-25 16:23:24.029658	\N
33	Test Org E2E	test-org-e2e-1787675105206	2026-08-25 16:25:05.227382	\N
34	Test Org E2E	test-org-e2e-1787675788417	2026-08-25 16:36:28.436241	\N
35	Test Org E2E	test-org-e2e-1787676892571	2026-08-25 16:54:52.593358	\N
36	Test Org E2E	test-org-e2e-1787678677490	2026-08-25 17:24:37.506621	\N
37	Test Org E2E	test-org-e2e-1787679630974	2026-08-25 17:40:30.995753	\N
38	Test Org E2E	test-org-e2e-1787680475865	2026-08-25 17:54:35.882613	\N
39	Test Org E2E	test-org-e2e-1787682594269	2026-08-25 18:29:54.289034	\N
40	Test Org E2E	test-org-e2e-1787689245147	2026-08-25 20:20:45.166721	\N
41	Test Org E2E	test-org-e2e-1787689297187	2026-08-25 20:21:37.205741	\N
42	Test Org E2E	test-org-e2e-1787689658919	2026-08-25 20:27:38.937764	\N
43	Test Org E2E	test-org-e2e-1787689735349	2026-08-25 20:28:55.367651	\N
44	Test Org E2E	test-org-e2e-1787689969903	2026-08-25 20:32:49.920845	\N
45	Test Org E2E	test-org-e2e-1787690172963	2026-08-25 20:36:12.980396	\N
46	Test Org E2E	test-org-e2e-1787694629629	2026-08-25 21:50:29.645385	\N
47	Test Org E2E	test-org-e2e-1787694845939	2026-08-25 21:54:05.959558	\N
48	Test Org E2E	test-org-e2e-1787695156098	2026-08-25 21:59:16.115331	\N
49	Test Org E2E	test-org-e2e-1787695502590	2026-08-25 22:05:02.608159	\N
50	Test Org E2E	test-org-e2e-1787703399588	2026-08-26 00:16:39.607539	\N
51	Test Org E2E	test-org-e2e-1787705920605	2026-08-26 00:58:40.623924	\N
52	Test Org E2E	test-org-e2e-1787771199203	2026-08-26 19:06:39.220749	\N
53	Test Org E2E	test-org-e2e-1787771738524	2026-08-26 19:15:38.542098	\N
54	Test Org E2E	test-org-e2e-1787798812324	2026-08-27 02:46:52.344788	\N
\.


--
-- Data for Name: outbox_events; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.outbox_events (id, event_type, payload, status, created_at) FROM stdin;
3	LISTING_CREATED	{"token_id": "1", "price_wei": "200", "tenant_id": 1, "listing_id": 3, "seller_address": "0x742d35Cc6634C0532925a3b844Bc3Ae6C47D9B1a"}	PROCESSED	2026-08-26 23:23:23.400502
4	LISTING_CREATED	{"test": true, "listing_id": 3}	PROCESSED	2026-08-26 23:44:14.863495
5	LISTING_CREATED	{"test": true, "listing_id": 999}	PROCESSED	2026-08-27 00:05:34.089594
6	LISTING_CREATED	{"test": true, "listing_id": 1000}	PROCESSED	2026-08-27 00:14:53.279794
7	LISTING_CREATED	{"test": true, "listing_id": 2000}	PROCESSED	2026-08-27 00:21:15.653646
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.roles (id, name, permissions) FROM stdin;
1	SUPER_ADMIN	["*"]
2	TENANT_OWNER	["manage_tenant", "manage_users", "manage_orders"]
3	ADMIN	["manage_users", "manage_orders"]
4	MANAGER	["manage_orders"]
5	OPERATOR	["create_orders", "view_orders"]
6	USER	["view_products", "buy"]
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.tenants (id, name, slug, status, created_at) FROM stdin;
1	Ninja Era	ninja-era	active	2026-08-25 07:37:19.38081
2	Ninja Demo Studio	ninja-demo-v2	ACTIVE	2026-08-25 08:52:19.951495
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.transactions (id, tx_hash, event_type, from_address, to_address, token_id, amount, block_number, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.users (id, email, password_hash, created_at, role, tenant_id, deleted_at) FROM stdin;
67	nuevo_test_1787771738203250892@ninjaera.com	$2b$10$QzedhtYcyb6gfRlzSqkvxOUH.ldFrW93MdPbGprVXvg0lGgbUW1k2	2026-08-26 19:15:38.373885	USER	\N	\N
25	test4@ninjaera.com	$2b$10$y9eUhAY8VrsPbifvNm3KtedUbxth2RwkvnTJKCkvuS/UfplywPybe	2026-08-25 15:23:10.403718	USER	\N	\N
27	testuser@ninjaera.com	$2b$10$lriZkDmaDjh.1bWSVtSAn.1m7VWiLMk3cWKl1KWCN0yyiXPcelzwm	2026-08-25 15:25:55.733595	USER	1	\N
18	admin@ninjaera.com	$2b$10$gVrRon2hvXsQ7X1GJRx3r.2bswDLr4RslIfMzWZn9OLaDMefsemee	2026-08-25 12:47:29.203058	SUPER_ADMIN	1	\N
30	nuevo@ninjaera.com	$2b$10$L7yIySWi4.a2zqvFoLhznuo6BSU/2lcIPVlSmnhIn0BSdsHwAd1dq	2026-08-25 15:28:08.519849	USER	\N	\N
31	nuevo_test_1787671688@ninjaera.com	$2b$10$1RevEHZVYnkTE0BLUGrr7uaH55yQc28WkJaANg.Btab/77thegL2u	2026-08-25 15:28:09.340674	USER	\N	\N
37	debug_1787672821@ninjaera.com	$2b$10$crrY.7uHpGOhAcmelRabcORNyt9n0g2ZSsrG2rb490Rcvp6QUfKsG	2026-08-25 15:47:02.051673	USER	\N	\N
38	fix_1787672912094206109@ninjaera.com	$2b$10$NAqj2ZlqSgS98EyXVJ/VzOQYHdzjKOLL5rnwlZPfn6MxtufU2D3ey	2026-08-25 15:48:32.260285	USER	\N	\N
39	nuevo_test_1787672985400843537@ninjaera.com	$2b$10$mJt83NJr/P4kQO2alVnliug94ZZbrxhmGz9JX70HEX7uifkJWfb5a	2026-08-25 15:49:45.570491	USER	\N	\N
40	nuevo_test_1787672995827089262@ninjaera.com	$2b$10$Mbb9bXtiqR8oxQJuT7uJv.Wh5jvnVDqbhRKNPzX8VfbLoR3cGSCu6	2026-08-25 15:49:55.975611	USER	\N	\N
41	nuevo_test_1787673122968143560@ninjaera.com	$2b$10$3RJLQKeOGmnvHexcD/mXNeYP8oOJkGIjzACsrVaS3Np.nYGIbIiny	2026-08-25 15:52:03.107644	USER	\N	\N
42	nuevo_test_1787673353131872709@ninjaera.com	$2b$10$DXXG4rt2jqegSuCVsqFUs.n73n/pcG8EzaMR.r/L/4ccehXUpBuF6	2026-08-25 15:55:53.272778	USER	\N	\N
43	nuevo_test_1787674676438882037@ninjaera.com	$2b$10$qBev0tnnFAhze2KJD/ZPZObU.DUNgwIzStQBNgw9iv.b6RBdEgXgC	2026-08-25 16:17:56.582956	USER	\N	\N
44	nuevo_test_1787674709561024888@ninjaera.com	$2b$10$1kseeF26bJelJ4RJ6fMYNuaS55O6zPrewyN3tozBwmIjm5IcCC.Nq	2026-08-25 16:18:29.714257	USER	\N	\N
45	nuevo_test_1787674743605773071@ninjaera.com	$2b$10$kBmli/ZS8xAww0KKXbbbVeD6R.zqCggy6ks6VM0gU11vP/m1Hp5le	2026-08-25 16:19:03.759599	USER	\N	\N
46	nuevo_test_1787675003690816171@ninjaera.com	$2b$10$2.Sx0MdkGMMx5h2Kfsv3VeXhw7g4n6uZ9K5U4jz5QeheZD8zTRCJi	2026-08-25 16:23:23.838642	USER	\N	\N
47	nuevo_test_1787675104879707794@ninjaera.com	$2b$10$oRR5kL/QSTD60htN6Ns7b.mgczlwc6wSl5H.mc6lRiYJAknK9l5MG	2026-08-25 16:25:05.024776	USER	\N	\N
48	nuevo_test_1787675788081624792@ninjaera.com	$2b$10$Gv965/QvNHGxPcu9XFRhwOvVOX5mWCxxcXly1Lrm6JMVB.gymy2g.	2026-08-25 16:36:28.238081	USER	\N	\N
49	nuevo_test_1787676892219737174@ninjaera.com	$2b$10$RRcs9Uqe7aE7cKu80nOxtOCvMnoKJNwZyYNBTQHnHye5yfZ4KODbi	2026-08-25 16:54:52.379408	USER	\N	\N
50	nuevo_test_1787678677161425837@ninjaera.com	$2b$10$mEwgArcH6tTIrZAdYkIeH.VnbF.k9p4jhDKLcOBjiJbPQa1b1cWYK	2026-08-25 17:24:37.308669	USER	\N	\N
51	nuevo_test_1787679630641792424@ninjaera.com	$2b$10$DpoiP/174aOW8Dx3Z5l47OJAHPID8GCMff2/WVQu9mSumIat2upP2	2026-08-25 17:40:30.794091	USER	\N	\N
52	nuevo_test_1787680475548636540@ninjaera.com	$2b$10$dLPlmaUpjeDF6rwbEXgPtuLZd2rD0ZtxR57.wBhAl5jnZS55n1XN2	2026-08-25 17:54:35.696586	USER	\N	\N
53	nuevo_test_1787682593934548433@ninjaera.com	$2b$10$RnuwTM3XpDJsZTT7qKL.8uD1X0zzMu6ptF.JPHY93ptuvSps1kEky	2026-08-25 18:29:54.090669	USER	\N	\N
54	nuevo_test_1787689244827290323@ninjaera.com	$2b$10$mAP58kJycqGQR8NawG4Y9e0ygdzmIksP120l/1xS0P40fO./gAqe.	2026-08-25 20:20:44.974046	USER	\N	\N
55	nuevo_test_1787689296861689116@ninjaera.com	$2b$10$7KP3giyaAspBpKOrXJ.Q.e8HyyWMSjAjRrw6ZkcJHxd1Vto.32kFC	2026-08-25 20:21:37.016585	USER	\N	\N
56	nuevo_test_1787689658610637774@ninjaera.com	$2b$10$NFbp6wST8JJoRNwMdFlHk.CiMLHDDHJeUBpVhRtO9WeIaVJ6HsO.i	2026-08-25 20:27:38.755148	USER	\N	\N
57	nuevo_test_1787689734836015173@ninjaera.com	$2b$10$8yTlmHMPbDsu4sMXbruthep.w.zVLvrkcGMA/CO6WTHHNDGu7v5wC	2026-08-25 20:28:54.986427	USER	\N	\N
58	nuevo_test_1787689969470487965@ninjaera.com	$2b$10$20w93HjnCS8EWca7xLVxS.vUQyW1fEKP9fRFlGiR9rMm42WIo5ImW	2026-08-25 20:32:49.675542	USER	\N	\N
59	nuevo_test_1787690172655736166@ninjaera.com	$2b$10$ZDBuQpeHQMC.QCfuQRDZyuhioCAg56ecg3Qi0mzCVfQGJArcSSziG	2026-08-25 20:36:12.793002	USER	\N	\N
60	nuevo_test_1787694629117091973@ninjaera.com	$2b$10$E4sqosul98X/2YGfOlCCpO9wrNPbhCT2asyO3zUFseCcE2Nhq25VS	2026-08-25 21:50:29.268857	USER	\N	\N
61	nuevo_test_1787694845672756284@ninjaera.com	$2b$10$fZFNS9qNxJarcdee4xvOpe8vGespIEmbn8PiN6m5S9vr7Mzmd7rLy	2026-08-25 21:54:05.786605	USER	\N	\N
62	nuevo_test_1787695155828313054@ninjaera.com	$2b$10$2hGa5RxJGSjmOsu4uv5ZSekmWb46.uTjd6NrXLjCYDmfODbOpjpry	2026-08-25 21:59:15.951821	USER	\N	\N
63	nuevo_test_1787695502299434453@ninjaera.com	$2b$10$CfTMsn30hpadGJJ9ga8Tg.nAiweR5699J/kngVDVKN/TPXaK/chxK	2026-08-25 22:05:02.431147	USER	\N	\N
64	nuevo_test_1787703399199338473@ninjaera.com	$2b$10$X.wxiIvlsP6VqAhtOmffPOQ8Dg39KXMjI31d8Hv1NGI0Z7cJmPVPO	2026-08-26 00:16:39.355026	USER	\N	\N
65	nuevo_test_1787705920161979184@ninjaera.com	$2b$10$zB2c2fMUZD9Jg7486Ds.SeHpLppiDSe.K3Vpj40gbbL0CaB2O7RMm	2026-08-26 00:58:40.316843	USER	\N	\N
66	nuevo_test_1787771198823339419@ninjaera.com	$2b$10$5EIAbE.sEICq7985iZDRL.sR38KDWKip7UJU56RDb1itk2lKjasMG	2026-08-26 19:06:38.970278	USER	\N	\N
70	nuevo_test_1787671688@mia.com	$2b$10$qcPCn8DXtSQsmkPPrTS5du4Tc8WoaGA6VgyXJiXCtrQ44.a8J6ace	2026-08-27 02:46:52.280666	USER	\N	\N
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.wallets (id, user_address, usdc_balance, created_at, user_id, tenant_id) FROM stdin;
11	0x1111111111111111111111111111111111111127	50	2026-08-25 18:08:12.557837	27	1
5	0x742d35Cc6634C0532925a3b844Bc3Ae6C47D9B1a	1149.00	2026-08-25 15:05:24.517456	18	1
\.


--
-- Data for Name: webhook_deliveries; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.webhook_deliveries (id, webhook_id, payload, status, attempts, next_attempt_at, created_at) FROM stdin;
1	44	{"test": true, "listing_id": 3}	FAILED	1	\N	2026-08-26 23:44:37.056634
2	44	{"test": true, "listing_id": 999}	FAILED	1	\N	2026-08-27 00:05:52.413428
3	44	{"test": true, "listing_id": 1000}	SENT	1	\N	2026-08-27 00:15:20.533175
4	44	{"test": true, "listing_id": 2000}	SENT	1	\N	2026-08-27 00:21:47.214523
5	45	{"test": true, "retry_test": true}	FAILED	5	\N	2026-08-27 00:51:19.368147
\.


--
-- Data for Name: webhooks; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.webhooks (id, url, event_type, created_at) FROM stdin;
7	https://test.com/hook	order.completed	2026-08-25 15:26:46.361995
8	https://test.com/hook	order.completed	2026-08-25 15:28:10.442373
9	https://test.com/hook	order.completed	2026-08-25 15:33:20.992777
10	https://test.com/hook	order.completed	2026-08-25 15:33:22.666558
11	https://test.com/hook	order.completed	2026-08-25 15:40:41.825363
12	https://test.com/hook	order.completed	2026-08-25 15:45:48.426058
13	https://test.com/hook	order.completed	2026-08-25 15:46:16.727469
14	https://test.com/hook	order.completed	2026-08-25 15:48:17.624369
15	https://test.com/hook	order.completed	2026-08-25 15:48:33.522073
16	https://test.com/hook	order.completed	2026-08-25 15:49:56.273654
17	https://test.com/hook	order.completed	2026-08-25 15:52:04.003285
18	https://test.com/hook	order.completed	2026-08-25 15:55:53.573308
19	https://test.com/hook	order.completed	2026-08-25 16:17:56.876147
20	https://test.com/hook	order.completed	2026-08-25 16:18:30.016321
21	https://test.com/hook	order.completed	2026-08-25 16:19:04.060542
22	https://test.com/hook	order.completed	2026-08-25 16:23:24.114329
23	https://test.com/hook	order.completed	2026-08-25 16:25:05.339426
24	https://test.com/hook	order.completed	2026-08-25 16:36:28.559386
25	https://test.com/hook	order.completed	2026-08-25 16:54:52.725113
26	https://test.com/hook	order.completed	2026-08-25 17:24:37.780983
27	https://test.com/hook	order.completed	2026-08-25 17:40:31.111839
28	https://test.com/hook	order.completed	2026-08-25 17:54:35.992985
29	https://test.com/hook	order.completed	2026-08-25 18:29:54.412222
30	https://test.com/hook	order.completed	2026-08-25 20:20:45.277931
31	https://test.com/hook	order.completed	2026-08-25 20:21:37.31818
32	https://test.com/hook	order.completed	2026-08-25 20:27:39.054403
33	https://test.com/hook	order.completed	2026-08-25 20:28:55.609395
34	https://test.com/hook	order.completed	2026-08-25 20:32:50.081112
35	https://test.com/hook	order.completed	2026-08-25 20:36:13.092636
36	https://test.com/hook	order.completed	2026-08-25 21:50:29.888929
37	https://test.com/hook	order.completed	2026-08-25 21:54:06.077534
38	https://test.com/hook	order.completed	2026-08-25 21:59:16.248739
39	https://test.com/hook	order.completed	2026-08-25 22:05:02.727325
40	https://test.com/hook	order.completed	2026-08-26 00:16:39.71444
41	https://test.com/hook	order.completed	2026-08-26 00:58:40.835047
42	https://test.com/hook	order.completed	2026-08-26 19:06:39.353405
43	https://test.com/hook	order.completed	2026-08-26 19:15:38.669352
44	http://127.0.0.1:8080	LISTING_CREATED	2026-08-26 23:43:50.116049
45	http://127.0.0.1:59999	retry_test	2026-08-27 00:51:00.013753
46	https://test.com/hook	order.completed	2026-08-27 02:46:52.506981
\.


--
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.assets_id_seq', 3, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 116, true);


--
-- Name: blockchain_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.blockchain_transactions_id_seq', 1, false);


--
-- Name: ledger_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.ledger_accounts_id_seq', 3, true);


--
-- Name: ledger_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.ledger_entries_id_seq', 5, true);


--
-- Name: ledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.ledger_id_seq', 10, true);


--
-- Name: ledger_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.ledger_transactions_id_seq', 5, true);


--
-- Name: listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.listings_id_seq', 3, true);


--
-- Name: nfts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.nfts_id_seq', 1, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: organization_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.organization_members_id_seq', 2, true);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.organizations_id_seq', 54, true);


--
-- Name: outbox_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.outbox_events_id_seq', 7, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: tenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.tenants_id_seq', 2, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.transactions_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.users_id_seq', 70, true);


--
-- Name: wallets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.wallets_id_seq', 12, true);


--
-- Name: webhook_deliveries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.webhook_deliveries_id_seq', 5, true);


--
-- Name: webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.webhooks_id_seq', 46, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: assets assets_token_id_key; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_token_id_key UNIQUE (token_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: blockchain_transactions blockchain_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.blockchain_transactions
    ADD CONSTRAINT blockchain_transactions_pkey PRIMARY KEY (id);


--
-- Name: blockchain_transactions blockchain_transactions_tx_hash_key; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.blockchain_transactions
    ADD CONSTRAINT blockchain_transactions_tx_hash_key UNIQUE (tx_hash);


--
-- Name: ledger_accounts ledger_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_accounts
    ADD CONSTRAINT ledger_accounts_pkey PRIMARY KEY (id);


--
-- Name: ledger_entries ledger_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_pkey PRIMARY KEY (id);


--
-- Name: ledger ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger
    ADD CONSTRAINT ledger_pkey PRIMARY KEY (id);


--
-- Name: ledger_transactions ledger_transactions_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_transactions
    ADD CONSTRAINT ledger_transactions_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: ledger_transactions ledger_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_transactions
    ADD CONSTRAINT ledger_transactions_pkey PRIMARY KEY (id);


--
-- Name: ledger ledger_tx_hash_key; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger
    ADD CONSTRAINT ledger_tx_hash_key UNIQUE (tx_hash);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: nfts nfts_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.nfts
    ADD CONSTRAINT nfts_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: organization_members organization_members_organization_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_organization_id_user_id_key UNIQUE (organization_id, user_id);


--
-- Name: organization_members organization_members_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_slug_key; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_slug_key UNIQUE (slug);


--
-- Name: outbox_events outbox_events_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.outbox_events
    ADD CONSTRAINT outbox_events_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_key; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_key UNIQUE (slug);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_tx_hash_key; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_tx_hash_key UNIQUE (tx_hash);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_user_address_key; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_address_key UNIQUE (user_address);


--
-- Name: webhook_deliveries webhook_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_pkey PRIMARY KEY (id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: idx_assets_tenant; Type: INDEX; Schema: public; Owner: ninja
--

CREATE INDEX idx_assets_tenant ON public.assets USING btree (tenant_id);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: ninja
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_tenant; Type: INDEX; Schema: public; Owner: ninja
--

CREATE INDEX idx_audit_logs_tenant ON public.audit_logs USING btree (tenant_id);


--
-- Name: idx_listings_tenant; Type: INDEX; Schema: public; Owner: ninja
--

CREATE INDEX idx_listings_tenant ON public.listings USING btree (tenant_id);


--
-- Name: wallets_user_id_key; Type: INDEX; Schema: public; Owner: ninja
--

CREATE UNIQUE INDEX wallets_user_id_key ON public.wallets USING btree (user_id) WHERE (user_id IS NOT NULL);


--
-- Name: wallets enforce_wallet_tenant; Type: TRIGGER; Schema: public; Owner: ninja
--

CREATE TRIGGER enforce_wallet_tenant BEFORE INSERT OR UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.check_wallet_tenant();


--
-- Name: assets assets_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: ledger_accounts ledger_accounts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_accounts
    ADD CONSTRAINT ledger_accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: ledger_accounts ledger_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_accounts
    ADD CONSTRAINT ledger_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ledger_entries ledger_entries_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.ledger_accounts(id);


--
-- Name: ledger_entries ledger_entries_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.ledger_transactions(id);


--
-- Name: ledger_transactions ledger_transactions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.ledger_transactions
    ADD CONSTRAINT ledger_transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: listings listings_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: listings listings_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.assets(token_id);


--
-- Name: nfts nfts_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.nfts
    ADD CONSTRAINT nfts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: nfts nfts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.nfts
    ADD CONSTRAINT nfts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: orders orders_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- Name: orders orders_nft_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_nft_id_fkey FOREIGN KEY (nft_id) REFERENCES public.nfts(id);


--
-- Name: orders orders_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: orders orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: organization_members organization_members_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: organization_members organization_members_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: organization_members organization_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: organizations organizations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: wallets wallets_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: webhook_deliveries webhook_deliveries_webhook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninja
--

ALTER TABLE ONLY public.webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_webhook_id_fkey FOREIGN KEY (webhook_id) REFERENCES public.webhooks(id);


--
-- PostgreSQL database dump complete
--

\unrestrict cQl6xka1JVJzFZ18FZQ9ddSHLbjKVsTxZevWpmKZHE9Rn3lIZF9c7YEevRMrzAv

