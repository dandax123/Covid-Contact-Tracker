SET check_function_bodies = false;
CREATE SCHEMA hdb_catalog;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';
CREATE FUNCTION hdb_catalog.gen_hasura_uuid() RETURNS uuid
    LANGUAGE sql
    AS $$select gen_random_uuid()$$;
CREATE FUNCTION hdb_catalog.insert_event_log(schema_name text, table_name text, trigger_name text, op text, row_data json) RETURNS text
    LANGUAGE plpgsql
    AS $$
  DECLARE
    id text;
    payload json;
    session_variables json;
    server_version_num int;
    trace_context json;
  BEGIN
    id := gen_random_uuid();
    server_version_num := current_setting('server_version_num');
    IF server_version_num >= 90600 THEN
      session_variables := current_setting('hasura.user', 't');
      trace_context := current_setting('hasura.tracecontext', 't');
    ELSE
      BEGIN
        session_variables := current_setting('hasura.user');
      EXCEPTION WHEN OTHERS THEN
                  session_variables := NULL;
      END;
      BEGIN
        trace_context := current_setting('hasura.tracecontext');
      EXCEPTION WHEN OTHERS THEN
        trace_context := NULL;
      END;
    END IF;
    payload := json_build_object(
      'op', op,
      'data', row_data,
      'session_variables', session_variables,
      'trace_context', trace_context
    );
    INSERT INTO hdb_catalog.event_log
                (id, schema_name, table_name, trigger_name, payload)
    VALUES
    (id, schema_name, table_name, trigger_name, payload);
    RETURN id;
  END;
$$;
CREATE FUNCTION hdb_catalog."notify_hasura_new_contacty_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."primary_user" , OLD."contact_id" , OLD."secondary_user" , OLD."contact_time"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."primary_user" , NEW."contact_id" , NEW."secondary_user" , NEW."contact_time"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json((SELECT  "e"  FROM  (SELECT  NEW."primary_user" , NEW."contact_id" , NEW."secondary_user" , NEW."contact_time"        ) AS "e"      ) )
    );
    BEGIN
    /* NOTE: formerly we used TG_TABLE_NAME in place of tableName here. However in the case of
    partitioned tables this will give the name of the partitioned table and since we use the table name to
    get the event trigger configuration from the schema, this fails because the event trigger is only created
    on the original table.  */
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST('public' AS text), CAST('Contact' AS text), CAST('new_contacty' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST('public' AS text), CAST('Contact' AS text), CAST('new_contacty' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE TABLE hdb_catalog.event_invocation_logs (
    id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
    event_id text,
    status integer,
    request json,
    response json,
    created_at timestamp without time zone DEFAULT now()
);
CREATE TABLE hdb_catalog.event_log (
    id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    trigger_name text NOT NULL,
    payload jsonb NOT NULL,
    delivered boolean DEFAULT false NOT NULL,
    error boolean DEFAULT false NOT NULL,
    tries integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    locked timestamp with time zone,
    next_retry_at timestamp without time zone,
    archived boolean DEFAULT false NOT NULL
);
CREATE TABLE hdb_catalog.hdb_action_log (
    id uuid DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
    action_name text,
    input_payload jsonb NOT NULL,
    request_headers jsonb NOT NULL,
    session_variables jsonb NOT NULL,
    response_payload jsonb,
    errors jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    response_received_at timestamp with time zone,
    status text NOT NULL,
    CONSTRAINT hdb_action_log_status_check CHECK ((status = ANY (ARRAY['created'::text, 'processing'::text, 'completed'::text, 'error'::text])))
);
CREATE TABLE hdb_catalog.hdb_cron_event_invocation_logs (
    id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
    event_id text,
    status integer,
    request json,
    response json,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE hdb_catalog.hdb_cron_events (
    id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
    trigger_name text NOT NULL,
    scheduled_time timestamp with time zone NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    tries integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    next_retry_at timestamp with time zone,
    CONSTRAINT valid_status CHECK ((status = ANY (ARRAY['scheduled'::text, 'locked'::text, 'delivered'::text, 'error'::text, 'dead'::text])))
);
CREATE TABLE hdb_catalog.hdb_metadata (
    id integer NOT NULL,
    metadata json NOT NULL,
    resource_version integer DEFAULT 1 NOT NULL
);
CREATE TABLE hdb_catalog.hdb_scheduled_event_invocation_logs (
    id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
    event_id text,
    status integer,
    request json,
    response json,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE hdb_catalog.hdb_scheduled_events (
    id text DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
    webhook_conf json NOT NULL,
    scheduled_time timestamp with time zone NOT NULL,
    retry_conf json,
    payload json,
    header_conf json,
    status text DEFAULT 'scheduled'::text NOT NULL,
    tries integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    next_retry_at timestamp with time zone,
    comment text,
    CONSTRAINT valid_status CHECK ((status = ANY (ARRAY['scheduled'::text, 'locked'::text, 'delivered'::text, 'error'::text, 'dead'::text])))
);
CREATE TABLE hdb_catalog.hdb_schema_notifications (
    id integer NOT NULL,
    notification json NOT NULL,
    resource_version integer DEFAULT 1 NOT NULL,
    instance_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT hdb_schema_notifications_id_check CHECK ((id = 1))
);
CREATE TABLE hdb_catalog.hdb_source_catalog_version (
    version text NOT NULL,
    upgraded_on timestamp with time zone NOT NULL
);
CREATE TABLE hdb_catalog.hdb_version (
    hasura_uuid uuid DEFAULT hdb_catalog.gen_hasura_uuid() NOT NULL,
    version text NOT NULL,
    upgraded_on timestamp with time zone NOT NULL,
    cli_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    console_state jsonb DEFAULT '{}'::jsonb NOT NULL
);
CREATE TABLE public."Contact" (
    contact_time timestamp with time zone DEFAULT now() NOT NULL,
    primary_user uuid NOT NULL,
    secondary_user uuid NOT NULL,
    contact_id uuid DEFAULT public.gen_random_uuid() NOT NULL
);
CREATE TABLE public."CovidTest" (
    user_id uuid NOT NULL,
    test_id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    test_time timestamp with time zone DEFAULT now() NOT NULL,
    test_status boolean NOT NULL
);
CREATE TABLE public."Device" (
    device_id uuid NOT NULL,
    user_id uuid NOT NULL,
    bluetooth_status boolean NOT NULL,
    notification_status boolean NOT NULL
);
CREATE TABLE public."User" (
    user_id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    covid_status boolean NOT NULL,
    notification_key text NOT NULL
);
ALTER TABLE ONLY hdb_catalog.event_invocation_logs
    ADD CONSTRAINT event_invocation_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.event_log
    ADD CONSTRAINT event_log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_action_log
    ADD CONSTRAINT hdb_action_log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_cron_event_invocation_logs
    ADD CONSTRAINT hdb_cron_event_invocation_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_cron_events
    ADD CONSTRAINT hdb_cron_events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_metadata
    ADD CONSTRAINT hdb_metadata_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_metadata
    ADD CONSTRAINT hdb_metadata_resource_version_key UNIQUE (resource_version);
ALTER TABLE ONLY hdb_catalog.hdb_scheduled_event_invocation_logs
    ADD CONSTRAINT hdb_scheduled_event_invocation_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_scheduled_events
    ADD CONSTRAINT hdb_scheduled_events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_schema_notifications
    ADD CONSTRAINT hdb_schema_notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_version
    ADD CONSTRAINT hdb_version_pkey PRIMARY KEY (hasura_uuid);
ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_pkey" PRIMARY KEY (contact_id);
ALTER TABLE ONLY public."CovidTest"
    ADD CONSTRAINT "CovidTest_pkey" PRIMARY KEY (test_id);
ALTER TABLE ONLY public."Device"
    ADD CONSTRAINT "Device_device_id_key" UNIQUE (device_id);
ALTER TABLE ONLY public."Device"
    ADD CONSTRAINT "Device_pkey" PRIMARY KEY (device_id, user_id);
ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_notification_id_key" UNIQUE (notification_key);
ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (user_id);
CREATE INDEX event_invocation_logs_event_id_idx ON hdb_catalog.event_invocation_logs USING btree (event_id);
CREATE INDEX event_log_fetch_events ON hdb_catalog.event_log USING btree (locked NULLS FIRST, next_retry_at NULLS FIRST, created_at) WHERE ((delivered = false) AND (error = false) AND (archived = false));
CREATE INDEX event_log_trigger_name_idx ON hdb_catalog.event_log USING btree (trigger_name);
CREATE INDEX hdb_cron_event_invocation_event_id ON hdb_catalog.hdb_cron_event_invocation_logs USING btree (event_id);
CREATE INDEX hdb_cron_event_status ON hdb_catalog.hdb_cron_events USING btree (status);
CREATE UNIQUE INDEX hdb_cron_events_unique_scheduled ON hdb_catalog.hdb_cron_events USING btree (trigger_name, scheduled_time) WHERE (status = 'scheduled'::text);
CREATE INDEX hdb_scheduled_event_status ON hdb_catalog.hdb_scheduled_events USING btree (status);
CREATE UNIQUE INDEX hdb_source_catalog_version_one_row ON hdb_catalog.hdb_source_catalog_version USING btree (((version IS NOT NULL)));
CREATE UNIQUE INDEX hdb_version_one_row ON hdb_catalog.hdb_version USING btree (((version IS NOT NULL)));
ALTER TABLE ONLY hdb_catalog.event_invocation_logs
    ADD CONSTRAINT event_invocation_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES hdb_catalog.event_log(id);
ALTER TABLE ONLY hdb_catalog.hdb_cron_event_invocation_logs
    ADD CONSTRAINT hdb_cron_event_invocation_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES hdb_catalog.hdb_cron_events(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY hdb_catalog.hdb_scheduled_event_invocation_logs
    ADD CONSTRAINT hdb_scheduled_event_invocation_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES hdb_catalog.hdb_scheduled_events(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_primary_user_fkey" FOREIGN KEY (primary_user) REFERENCES public."User"(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_secondary_user_fkey" FOREIGN KEY (secondary_user) REFERENCES public."User"(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CovidTest"
    ADD CONSTRAINT "CovidTest_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Device"
    ADD CONSTRAINT "Device_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
