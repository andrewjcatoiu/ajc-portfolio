CREATE DATABASE landing_page;

CREATE TYPE ROLE AS ENUM('visitor', 'admin');
CREATE TABLE admin (
    id BIGSERIAL NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255),
    role ROLE
);

CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    focus VARCHAR(50),
    title VARCHAR(50),
    link VARCHAR(255),
    description VARCHAR(34),
    image_path VARCHAR(255)
);

CREATE TABLE about (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(500),
    image_path VARCHAR(255)
);

CREATE TABLE qualification (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    location VARCHAR(255),
    time_span VARCHAR(255),
    category VARCHAR(255)
);

INSERT INTO admin (username, password, role) VALUES ('andrew', '$2b$13$RW6ndIhRnAIsy9xdvpRD6u5L1KefKx1yoejBX0hX1jUH50ylLS.py', 'admin');

INSERT INTO about (description, image_path) VALUES ('Freelance frontend developer, I am passionate about creating and developing web interfaces. With years of experience in web design and development.', '/img/about.jpg'); 