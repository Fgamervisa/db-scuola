-- Database scolastico
-- Esercitazione di informatica

CREATE DATABASE scuola;
USE scuola;

CREATE TABLE classi (
  id_classe INT AUTO_INCREMENT PRIMARY KEY,
  anno      INT     NOT NULL CHECK (anno BETWEEN 1 AND 5),
  sezione   CHAR(1) NOT NULL,
  UNIQUE (anno, sezione)
);

CREATE TABLE materie (
  id_materia  INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(50) NOT NULL UNIQUE,
  descrizione TEXT
);

CREATE TABLE studenti (
  id_studente  INT AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(50)  NOT NULL,
  cognome      VARCHAR(50)  NOT NULL,
  data_nascita DATE         NOT NULL,
  email        VARCHAR(100) UNIQUE,
  id_classe    INT          NOT NULL,
  FOREIGN KEY (id_classe) REFERENCES classi(id_classe)
);

CREATE TABLE classi_materie (
  id_classe  INT NOT NULL,
  id_materia INT NOT NULL,
  PRIMARY KEY (id_classe, id_materia),
  FOREIGN KEY (id_classe)  REFERENCES classi(id_classe),
  FOREIGN KEY (id_materia) REFERENCES materie(id_materia)
);

CREATE TABLE voti (
  id_voto     INT AUTO_INCREMENT PRIMARY KEY,
  id_studente INT          NOT NULL,
  id_materia  INT          NOT NULL,
  valore      DECIMAL(3,1) NOT NULL CHECK (valore BETWEEN 1 AND 10),
  data        DATE         NOT NULL,
  descrizione VARCHAR(100),
  FOREIGN KEY (id_studente) REFERENCES studenti(id_studente),
  FOREIGN KEY (id_materia)  REFERENCES materie(id_materia)
);

INSERT INTO classi (anno, sezione) VALUES
 (3,'A'),  -- id 1
 (4,'A'),  -- id 2
 (5,'A');  -- id 3

INSERT INTO materie (nome, descrizione) VALUES
 ('Informatica', 'Programmazione e basi di dati'),  -- id 1
 ('Matematica', NULL),                              -- id 2
 ('Italiano', 'Lingua e letteratura'),              -- id 3
 ('Inglese', NULL),                                 -- id 4
 ('Sistemi e reti', 'Reti di computer');            -- id 5

INSERT INTO studenti (nome, cognome, data_nascita, email, id_classe) VALUES
 ('Luca',   'Rossi',   '2008-03-12', 'luca.rossi@scuola.it',    3),
 ('Giulia', 'Bianchi', '2008-07-25', 'giulia.bianchi@scuola.it', 3),
 ('Marco',  'Verdi',   '2009-01-30', 'marco.verdi@scuola.it',   2),
 ('Sara',   'Neri',    '2009-11-04', NULL,                     2),
 ('Andrea', 'Russo',   '2010-05-18', 'andrea.russo@scuola.it',  1),
 ('Elena',  'Gallo',   '2010-09-09', 'elena.gallo@scuola.it',   1);

INSERT INTO classi_materie (id_classe, id_materia) VALUES
 (1,1),(1,2),(1,3),(1,4),        -- 3A
 (2,1),(2,2),(2,3),(2,5),        -- 4A
 (3,1),(3,2),(3,3),(3,4),(3,5);  -- 5A

INSERT INTO voti (id_studente, id_materia, valore, data, descrizione) VALUES
 (1,1, 8.0, '2026-09-20', 'verifica scritta'),
 (1,1, 9.0, '2026-10-05', 'interrogazione'),
 (1,2, 6.5, '2026-09-28', 'verifica scritta'),
 (1,5, 7.0, '2026-10-02', 'interrogazione'),
 (2,1, 7.5, '2026-09-20', 'verifica scritta'),
 (2,3, 8.0, '2026-09-25', 'tema'),
 (2,4, 9.0, '2026-10-01', 'interrogazione'),
 (3,1, 5.0, '2026-09-22', 'verifica scritta'),
 (3,1, 6.5, '2026-10-06', 'recupero'),
 (3,5, 7.0, '2026-09-30', 'interrogazione'),
 (4,2, 8.0, '2026-09-29', 'verifica scritta'),
 (4,3, 7.0, '2026-10-03', 'interrogazione'),
 (5,4, 6.0, '2026-09-24', 'verifica scritta'),
 (5,2, 4.5, '2026-10-07', 'verifica scritta'),
 (6,1, 8.0, '2026-09-26', 'interrogazione'),
 (6,3, 9.0, '2026-10-08', 'tema');
