SET check_function_bodies = false;
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
ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_primary_user_fkey" FOREIGN KEY (primary_user) REFERENCES public."User"(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_secondary_user_fkey" FOREIGN KEY (secondary_user) REFERENCES public."User"(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CovidTest"
    ADD CONSTRAINT "CovidTest_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Device"
    ADD CONSTRAINT "Device_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
