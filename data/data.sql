create table if not exists users (
  id varchar(40) not null,
  username varchar(120),
  email varchar(120),
  phone varchar(45),
  date_of_birth date,
  primary key (id)
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
insert into users (id, username, email, phone, date_of_birth) values ('ironman', 'tony.stark', 'tony.stark@gmail.com', '0987654321', '1963-03-25');
insert into users (id, username, email, phone, date_of_birth) values ('spiderman', 'peter.parker', 'peter.parker@gmail.com', '0987654321', '1962-08-25');
insert into users (id, username, email, phone, date_of_birth) values ('wolverine', 'james.howlett', 'james.howlett@gmail.com', '0987654321', '1974-11-16');


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


