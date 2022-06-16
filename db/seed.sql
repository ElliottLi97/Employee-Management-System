INSERT INTO department (name)
VALUES ("Accounting"),
       ("Human Resources"),
       ("Maintenance"),
       ("Research"),
       ("Marketing");

INSERT INTO role (title, salary, department_id)
VALUES ("Accountant",10000,1),
       ("HR Coordinator",11000,2),
       ("Janitor",5000,3),
       ("Researcher",12000,4),
       ("Marketer", 100000, 5)
       ("Mechanic", 10000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Rupert","Clayton",1,1),
       ("Cem","Burton",2,2),
       ("Cohen","Dennis",3,3),
       ("Kenya","Frey",4,4);