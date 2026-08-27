--
-- PostgreSQL database dump
--

\restrict 3EgqE5BYw48MmKZSkkRk6r5w4z3i62E02j0OnSaq76xKYFkRbOKa63Azc8eQai7

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
-- Name: assets; Type: TABLE; Schema: public; Owner: ninja
--

CREATE TABLE public.assets (
    id integer NOT NULL,
    token_id character varying(255) NOT NULL,
    owner_address character varying(255) NOT NULL,
    metadata_uri text,
    created_at timestamp without time zone DEFAULT now()
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
    created_at timestamp without time zone DEFAULT now()
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
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.assets (id, token_id, owner_address, metadata_uri, created_at) FROM stdin;
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

COPY public.listings (id, token_id, seller_address, price_wei, is_active, created_at) FROM stdin;
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
\.


--
-- Data for Name: outbox_events; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.outbox_events (id, event_type, payload, status, created_at) FROM stdin;
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
18	admin@ninjaera.com	$2b$10$ufWKngw4UQ/Mo/.TAtDkqejmmUxhVCNyf4SKUkMI7SJrJB7C9XK/.	2026-08-25 12:47:29.203058	SUPER_ADMIN	1	\N
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.wallets (id, user_address, usdc_balance, created_at, user_id, tenant_id) FROM stdin;
5	0x742d35Cc6634C0532925a3b844Bc3Ae6C47D9B1a	1000.00	2026-08-25 15:05:24.517456	18	1
6	0xCrossTenant111	999.00	2026-08-25 15:10:46.918746	18	1
10	0xCorrectTenant001	300.00	2026-08-25 15:16:21.842803	18	1
\.


--
-- Data for Name: webhook_deliveries; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.webhook_deliveries (id, webhook_id, payload, status, attempts, next_attempt_at, created_at) FROM stdin;
\.


--
-- Data for Name: webhooks; Type: TABLE DATA; Schema: public; Owner: ninja
--

COPY public.webhooks (id, url, event_type, created_at) FROM stdin;
\.


--
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.assets_id_seq', 2, true);


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

SELECT pg_catalog.setval('public.ledger_id_seq', 6, true);


--
-- Name: ledger_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.ledger_transactions_id_seq', 5, true);


--
-- Name: listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.listings_id_seq', 1, false);


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

SELECT pg_catalog.setval('public.organizations_id_seq', 16, true);


--
-- Name: outbox_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.outbox_events_id_seq', 1, false);


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

SELECT pg_catalog.setval('public.users_id_seq', 24, true);


--
-- Name: wallets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.wallets_id_seq', 10, true);


--
-- Name: webhook_deliveries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.webhook_deliveries_id_seq', 1, false);


--
-- Name: webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninja
--

SELECT pg_catalog.setval('public.webhooks_id_seq', 6, true);


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
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: ninja
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_tenant; Type: INDEX; Schema: public; Owner: ninja
--

CREATE INDEX idx_audit_logs_tenant ON public.audit_logs USING btree (tenant_id);


--
-- Name: wallets enforce_wallet_tenant; Type: TRIGGER; Schema: public; Owner: ninja
--

CREATE TRIGGER enforce_wallet_tenant BEFORE INSERT OR UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.check_wallet_tenant();


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

\unrestrict 3EgqE5BYw48MmKZSkkRk6r5w4z3i62E02j0OnSaq76xKYFkRbOKa63Azc8eQai7

