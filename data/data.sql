create table users
(
	id character varying(40) not null primary key,
	username character varying(120),
	email character varying(120),
	phone character varying(45),
	gender char(1),
	displayname character varying(500),
	givenName character varying(100),
	familyName character varying(100),
	middleName character varying(100),

	alternativeemail character varying(255),
	alternativephone character varying(45),
	imageurl character varying(255),
	coverurl character varying(255),
	title character varying(255),
	nationality character varying(255),
	address character varying(255),
	bio character varying(255),
	website character varying(255),
	occupation character varying(255),
	company character varying(255),
	location character varying(255),

	maxpasswordage integer,
	dateofbirth timestamp with time zone,
	settings jsonb,
	links jsonb,
	gallery jsonb[],
	skills jsonb[],
	achievements jsonb[],
	interests character varying[],
	lookingfor character varying[],
	status char(1),
	createdby character varying(40) not null,
	createdat timestamp with time zone,
	updatedby character varying(40) not null,
	updatedat timestamp with time zone,
	version integer
);

create table passwords (
	id character varying(40) not null primary key,
	password character varying(255),
	successtime timestamp with time zone,
	failtime timestamp with time zone,
	failcount integer,
	lockeduntiltime timestamp with time zone,
	history character varying[]
);
create table history (
	id character varying(40) not null primary key,
	history character varying[]
);

create table signupcodes (
	id character varying(40) not null primary key,
	code character varying(500) not null,
	expiredat timestamp with time zone not null
);
create table authencodes (
	id character varying(40) not null primary key,
	code character varying(500) not null,
	expiredat timestamp with time zone not null
);
create table passwordcodes (
	id character varying(40) not null primary key,
	code character varying(500) not null,
	expiredat timestamp with time zone not null
);

create table skills(
	skill varchar(120) not null,
  primary key (skill)
);

create table interests(
	interest varchar(120) not null,
	primary key (interest)
);
create table searchs (
	item varchar(120) not null,
	primary key (item)
);

insert into skills(skill) values('java');
insert into skills(skill) values('javascripts');
insert into skills(skill) values('c++');
insert into skills(skill) values('c#');
insert into skills(skill) values('c');
insert into skills(skill) values('python');
insert into skills(skill) values('ruby');
insert into skills(skill) values('rust');
insert into skills(skill) values('reactjs');
insert into skills(skill) values('angular');
insert into skills(skill) values('vue');
insert into skills(skill) values('express');
insert into skills(skill) values('codeigniter');
insert into skills(skill) values('react native');
insert into skills(skill) values('flutter');

insert into interests(interest) values('game');
insert into interests(interest) values('movie');
insert into interests(interest) values('coding');
insert into interests(interest) values('football');
insert into interests(interest) values('basketball');
insert into interests(interest) values('books');
insert into interests(interest) values('money');
insert into interests(interest) values('manga');
insert into interests(interest) values('badminton');
insert into interests(interest) values('esport');
insert into interests(interest) values('food');

insert into searchs(item) values('friend');
insert into searchs(item) values('room mate');
insert into searchs(item) values('basketball team');
-- insert into skills(skill) values ('java') on conflict(skill) do nothing

create table articles (
  id varchar(40) not null,
  name varchar(120),
  type varchar(40),
  description varchar(120),
  content varchar(120),
  tags varchar(40),
  status varchar(120),
  authorId varchar(40)
);

insert into articles(id, name, type, description, content, tags, status, authorId) values ('w1', 'John Cena', 'wrestler', 'wwe-superstar', 'world heavyweight chapm', 'team1', 'winner','01');
insert into articles(id, name, type, description, content, tags, status, authorId) values ('w2', 'Randy Orton', 'wrestler', 'wwe-superstar', 'wwe chapm', 'team2', 'winner','02');
insert into articles(id, name, type, description, content, tags, status, authorId) values ('w3', 'Mark Henry', 'wrestler', 'wwe-superstar', 'tagteam chapm', 'team2', 'winner','03');
insert into articles(id, name, type, description, content, tags, status, authorId) values ('w4', 'Under Taker', 'wrestler', 'wwe-superstar', 'tagteam chapm', 'team2', 'winner','04');

create table AppreciationItemReply (
  id varchar(20) not null,
  authorId varchar(40),
  itemId varchar(40),
  title varchar(120),
  description varchar(120),
  createdAt  date
);

insert into AppreciationItemReply(id, authorId, itemId, title, description) values ("01", "01", "w1","good!!!","interest wrestler");


create table if not exists appreciation (
  id varchar(40) not null,
  authorid varchar(40),
  title varchar(120),
  description varchar(120),
  usefulcount integer,
  replycount integer,
  createdat date,
  userid varchar(40),
  primary key (id)
);

create table if not exists appreciationreply (
  id varchar(40) not null,
  appreciationid varchar(40),
  title varchar(120),
  description varchar(120),
  createdat varchar(120),
  updateat varchar(120),
  authorid varchar(40),
  usefulcount integer,
  replycount integer,
  userid varchar(40),
  primary key (id)
);

create table if not exists usefulappreciation (
  id varchar(40) not null,
  appreciationid varchar(40),
  userid varchar(40),
  createdat date,
  updateat date,
  primary key (id)
);

create table if not exists comments (
  id varchar(255) not null,
  author varchar(255),
  comment text,
  createdat date
)

create table categories(
  categoryid character varying(40) primary key,
  categoryname character varying(300) not null,
  status char(1) not null,
  createdby character varying(40),
  createdat timestamp,
  updatedby character varying(40),
  updatedat timestamp
);

INSERT INTO categories (categoryid,categoryname,status) VALUES('adventure','adventure','A');
INSERT INTO categories (categoryid,categoryname,status) VALUES ('animated','animated','A');
INSERT INTO categories (categoryid,categoryname,status) VALUES ('comedy','comedy','A');
INSERT INTO categories (categoryid,categoryname,status) VALUES ('drama','drama','A');
INSERT INTO categories (categoryid,categoryname,status) VALUES ('horror','horror','A');
INSERT INTO categories (categoryid,categoryname,status) VALUES ('crime','crime','A');
INSERT INTO categories (categoryid,categoryname,status) VALUES ('fantasy','fantasy','A');
INSERT INTO categories (categoryid,categoryname,status) VALUES ('family','family','A');

create table items
(
    id character varying(40) primary key,
    title character varying(120) not null,
    status char(1) not null,
    description character varying(120),
    categories character varying[],
);

insert into users (id, title, status, description, categories) values ('01', 'vexemphim', 'A', 'vexemphimsieuhay', '{horror,drama}');
insert into users (id, title, status, description, categories) values ('02', 'phimhay', 'A', 'phimsieuhay', '{horror,crime}');

select * from users where categories && '{"horror"}';
