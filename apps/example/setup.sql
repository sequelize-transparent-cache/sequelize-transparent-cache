use sequelize_transparent_cache;
CREATE TABLE author (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL
);
CREATE TABLE book (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  release_date DATE,
  author_id INT NOT NULL,
  FOREIGN KEY (author_id) REFERENCES author(id) ON DELETE CASCADE
);
insert into author(first_name, last_name)
values('J.K', 'Rowling'),
  ('J. R. R.', 'Tolkien');
insert into book(title, release_date, author_id)
values('The Fellowship of the Ring', '1954-07-29', 2),
  ('The Two Towers', '1954-11-11', 2),
  ('The Return of the King', '1955-11-20', 2),
  (
    "Harry Potter and the Sorcerer's Stone",
    '1997-06-26',
    1
  ),
  (
    "Harry Potter and the Chamber of Secrets",
    '1998-07-02',
    1
  ),
  (
    "Harry Potter and the Prizoner of Azkaban",
    '1999-07-08',
    1
  ),
  (
    "Harry Potter and the Goblet of Fire",
    '2000-07-08',
    1
  ),
  (
    "Harry Potter and the Order of the Phoenix",
    '2003-06-21',
    1
  ),
  (
    "Harry Potter and the Half-Blood Prince",
    '2005-07-16',
    1
  ),
  (
    "Harry Potter and the Deathly Hallows",
    '2007-07-21',
    1
  );
