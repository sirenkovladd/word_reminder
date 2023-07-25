create table users (
  id serial primary key,
  name text,
  email text,
  password text,
  telegram_id int,
  created_at timestamp,
  photo text,
  username text,
  is_admin boolean,
  unique (email),
  unique (telegram_id),
  unique (username)
);

CREATE TABLE public.words (
	id serial4 NOT NULL,
	word text NOT NULL,
	"translation" text NOT NULL,
	photo text NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	group_id int4 NULL,
	CONSTRAINT words_pkey PRIMARY KEY (id)
);

alter table words add constraint words_group_id_fkey foreign key (group_id) references group_words(id);

CREATE TABLE public.user_words (
	id serial4 NOT NULL,
	user_id int4 NOT NULL,
	word_id int4 NOT NULL,
	quiz bool NOT NULL DEFAULT true,
	writing bool NOT NULL DEFAULT false,
	score float8 NOT NULL DEFAULT 0,
	created_at timestamp NOT NULL DEFAULT now(),
	"enable" bool NOT NULL DEFAULT true,
	edited_at timestamp NOT NULL DEFAULT now(),
	count_quiz int4 NOT NULL DEFAULT 0,
	CONSTRAINT user_words_pkey PRIMARY KEY (id),
	CONSTRAINT user_words_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
	CONSTRAINT user_words_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(id)
);

CREATE TABLE public.group_words (
	id serial4 NOT NULL,
	name text NOT NULL,
	create_by int4 NOT NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	CONSTRAINT group_words_pkey PRIMARY KEY (id),
	CONSTRAINT group_words_create_by_fkey FOREIGN KEY (create_by) REFERENCES public.users(id)
);
