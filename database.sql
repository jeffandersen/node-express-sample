CREATE TABLE album (
  id serial primary key,
  description varchar(255)
);

CREATE TABLE photo (
  id serial primary key,
  album_id integer,
  description varchar(255),
  filepath varchar(255)
);
