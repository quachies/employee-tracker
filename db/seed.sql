INSERT INTO departments (dept_name, dept_manager)
VALUES ('Marketing', 'Elon Whiff'),
       ('Finanace', 'Neil Tyson'),
       ('Human Resource', 'Ariana Venti'),
       ('Production', 'Pascal Ibaka');

INSERT INTO roles (title, salary, department_id)
VALUES ('Marketing Lead', 90000, 1),
       ('Content creator', 65000, 1),
       ('Banker', 55000, 2),
       ('Auditor', 70000, 2),
       ('HR Manager', 60000, 3),
       ('HR coordinator', 50000, 3),
       ('Director', 130000, 4),
       ('Camera Operator', 45000, 4);

INSERT INTO employees (first_name, last_name, role_id)
VALUES ('Matthew', 'Smith', 1),
       ('William', 'Baker', 2),
       ('Mariah', 'Jordan', 3),
       ('Kevin', 'Quach', 4),
       ('Andy', 'Thor', 5),
       ('Saitama', 'Nakamura', 6),
       ('Ahmed', 'Arasteh', 7),
       ('Ashley', 'Kim', 8);