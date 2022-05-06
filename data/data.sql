create table if not exists users (
  id varchar(40) not null,
  username varchar(120),
  email varchar(120),
  phone varchar(45),
  date_of_birth date,
  primary key (id)
);

insert into users (id, username, email, phone, date_of_birth) values ('ironman', 'tony.stark', 'tony.stark@gmail.com', '0987654321', '1963-03-25');
insert into users (id, username, email, phone, date_of_birth) values ('spiderman', 'peter.parker', 'peter.parker@gmail.com', '0987654321', '1962-08-25');
insert into users (id, username, email, phone, date_of_birth) values ('wolverine', 'james.howlett', 'james.howlett@gmail.com', '0987654321', '1974-11-16');

create table skills(
	skill varchar(120) not null,
  primary key (skill)
);
--drop table skills
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
