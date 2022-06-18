const inquirer = require('inquirer')
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // TODO: Add MySQL password
        password: '',
        database: 'company_db'
    },
    console.log(`Connected to the books_db database.`)
);


const start = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "choices",
            message: "Please select and option",
            choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role',
                'Add an employee', 'Update an employee role', 'Update employee manager', 'View employees by manager'
                , 'View employees by department', 'Delete departments', 'Delete roles', 'Delete employees', 'Exit']
        }
    ])
        .then(choice => {
            const { choices } = choice
            if (choices === "View all departments") {
                viewAllDepartments()
            }
            if (choices === "View all roles") {
                viewAllRoles()
            }
            if (choices === "View all employees") {
                viewAllEmployees()
            }
            if (choices === "View employees by manager") {
                viewAllEmployeesByManager()
            }
            if (choices === "View employees by department") {
                viewAllEmployeesByDepartment()
            }
            if (choices === "Add a department") {
                inquirer.prompt([
                    {
                        type: "input",
                        name: "name",
                        message: "Please enter the department's name"
                    }
                ])
                    .then(departmentDetails => {
                        const { name } = departmentDetails
                        db.connect(function (err) {
                            if (err) throw err;
                            const sql = "INSERT INTO department (name) VALUES ?";
                            const values = [[name]]
                            db.query(sql, [values], function (err, results) {
                                if (err) throw err;
                                else {console.log(`The ${name} department has been successfully added`)
                                return start()}
                            })
                        })

                    })

            }
            if (choices === "Add a role") {
                let employeelist = listDepartments()
                employeelist.then(function (result) {
                    inquirer.prompt([
                        {
                            type: "input",
                            name: "title",
                            message: "Please enter the role's title"
                        },
                        {
                            type: "input",
                            name: "salary",
                            message: "Please enter the role's salary"
                        },
                        {
                            type: "list",
                            name: "department",
                            message: "Select a department to add to the role", //list names, choose name, get equivalent id from chosen name and do SQLQuery with it
                            choices: result
                        }
                    ])
                        .then(roleDetails => {
                            const { title, salary, department } = roleDetails
                            let departmentId = getDepartmentIdByName(department)
                            departmentId.then(function (result) {
                                db.connect(function (err) {
                                    if (err) throw err;
                                    const sql = "INSERT INTO role (title, salary, department_id) VALUES ?";
                                    const values = [[title, salary, result]]
                                    db.query(sql, [values], function (err, results) {
                                        if (err) throw err;
                                        else console.log(`The ${title} role has been successfully added`)
                                        return start()
                                    })
                                })
                            })

                        })

                })
            }
            if (choices === "Add an employee") {
                AddAnEmployee()  
            }
            if (choices === "Update an employee role") {
                UpdateAnEmployeeByRole()
            }
            if (choices === "Delete employees") {
                deleteEmployee()
            }
            if (choices === "Delete departments") {
                deleteDepartment()
            }
            if (choices === "Delete roles") {
                deleteRole()
            }
            if (choices === "Update employee manager") {
                UpdateAnEmployeeByManager()
            }
            if (choices === "Exit") {
                process.exit(1)
            }
        })
}



function spacing(length) {
    space = ""
    for (let i = 0; i < length; i++) {
        space += " "
    }
    return space
}
function listEmployeeNames() {
    return new Promise((resolve, reject) => {
        db.query('Select * FROM employee', function (err, results) {
            if (err) return reject(err)
            else {
                const employeeArray = []
                results.forEach(employee => {
                    const person = employee.first_name + " " + employee.last_name
                    employeeArray.push(person.toString())
                });
                return resolve(employeeArray)
            }
        })
    })
}
function listDepartments() {
    return new Promise((resolve, reject) => {
        db.query('Select * FROM department', function (err, results) {
            if (err) return reject(err)
            else {
                const departmentArray = []
                results.forEach(department => {
                    departmentArray.push(department.name.toString())
                });
                return resolve(departmentArray)
            }
        })
    })
}
function listRoles() {
    return new Promise((resolve, reject) => {
        db.query('Select * FROM role', function (err, results) {
            if (err) return reject(err)
            else {
                const roleArray = []
                results.forEach(role => {
                    roleArray.push(role.title.toString())
                });
                return resolve(roleArray)
            }
        })
    })
}
function getDepartmentIdByName(department) {
    return new Promise((resolve, reject) => {
        db.query(`Select id FROM department WHERE name = ?`, department, (err, result) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(result[0].id)
            };
        });
    })
}
async function createEmployee(first_name, last_name, roleTitle, managerName) {
    const roleId = await getRoleIdByTitle(roleTitle)
    const managerId = await getEmployeeIdByName(managerName)
    db.connect(function (err) {
        if (err) throw err;
        const sql = "INSERT INTO employee ( first_name, last_name, role_id, manager_id) VALUES ?";
        const values = [[first_name, last_name, roleId, managerId]]
        db.query(sql, [values], function (err, results) {
            if (err) throw err;
            else {
                console.log(`${first_name} ${last_name} has been successfully added`)
                return start()
            }
        })
    })

}
function getRoleIdByTitle(title) {
    return new Promise((resolve, reject) => {
        db.query(`Select id FROM role WHERE title = ?`, title, (err, result) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(result[0].id)
            };
        });
    })
}
function getEmployeeIdByName(employeeName) {
    return new Promise((resolve, reject) => {
        splitName = employeeName.split(' ')
        db.query(`Select id FROM employee WHERE first_name = ?`, splitName[0], (err, result) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(result[0].id)
            };
        });
    })
}
async function AddAnEmployee() {
    const roles = await listRoles();
    const managers = await listEmployeeNames();
    inquirer.prompt([
        {
            type: "input",
            name: "firstName",
            message: "Please enter the employee's first name"
        },

        {
            type: "input",
            name: "lastName",
            message: "Please enter the employee's last name"
        },
        {
            type: "list",
            name: "roleTitle",
            message: "Please choose the employee's role",
            choices: roles
        },
        {
            type: "list",
            name: "managerName",
            message: "Please choose the employee's manager",
            choices: managers
        },

    ])
        .then(employeeDetails => {
            const { firstName, lastName, roleTitle, managerName } = employeeDetails
            createEmployee(firstName, lastName, roleTitle, managerName)
            
        })
}
async function UpdateAnEmployeeByManager() {
    const managers = await listEmployeeNames();
    inquirer.prompt([
        {
            type: "list",
            name: "employeeName",
            message: "Please choose the employee",
            choices: managers
        },
        {
            type: "list",
            name: "managerName",
            message: "Please choose the employee's manager",
            choices: managers
        },

    ])
        .then(employeeDetails => {
            const { employeeName, managerName } = employeeDetails
            updateEmployeeManager(employeeName, managerName)
        })

}
async function updateEmployeeManager(employeeName, managerName) {
    const employeeId = await getEmployeeIdByName(employeeName)
    const managerId = await getEmployeeIdByName(managerName)
    db.connect(function (err) {
        if (err) throw err;
        db.query(`UPDATE employee SET manager_id = ${managerId} WHERE id = ${employeeId} `, function (err, results) {
            if (err) throw err;
            else {
                console.log(`${employeeName} has been successfully updated`)
                return start()
        }
        })
    })

}
async function UpdateAnEmployeeByRole() {
    const roles = await listRoles()
    const managers = await listEmployeeNames();
    inquirer.prompt([
        {
            type: "list",
            name: "employeeName",
            message: "Please choose the employee",
            choices: managers
        },
        {
            type: "list",
            name: "roleTitle",
            message: "Please choose the employee's role",
            choices: roles
        },

    ])
        .then(employeeDetails => {
            const { employeeName, roleTitle } = employeeDetails
            updateEmployeeRole(employeeName, roleTitle)
        })

}
async function updateEmployeeRole(employeeName, roleTitle) {
    const employeeId = await getEmployeeIdByName(employeeName)
    const roleId = await getRoleIdByTitle(roleTitle)
    db.connect(function (err) {
        if (err) throw err;
        db.query(`UPDATE employee SET role_id = ${roleId} WHERE id = ${employeeId} `, function (err, results) {
            if (err) throw err;
            else {
                console.log(`${employeeName} has been successfully updated`)
                return start()
            }
        })
    })

}
function viewAllDepartments(){
    db.query('SELECT * FROM department', function (err, results) {
        if (err) throw err
        else {

            consoleTable(results)
        }
        return start()
    });
}
function viewAllRoles(){
    db.query('SELECT role.id as id, role.title as title, role.salary as salary, department.name as department From role JOIN department ON role.department_id = department.id;', function (err, results) {
        if (err) throw err
        else {
            consoleTable(results)
        }
        return start()
    });
}
function viewAllEmployees(){
    db.query('SELECT employee.id as id, employee.first_name as first_name, employee.last_name as last_name, role.title as title, department.name as department, role.salary as salary, employee.id as manager From employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id=department.id', function (err, results) {
        if (err) throw err
        else {
            consoleTable(results)
        }
        return start()
    });
}
function viewAllEmployeesByManager(){
    db.query('SELECT employee.id as id, employee.first_name as first_name, employee.last_name as last_name, role.title as title, department.name as department, role.salary as salary, employee.id as manager From employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id=department.id ORDER BY department DESC', function (err, results) {
        if (err) throw err
        else {
            consoleTable(results)
        }
        return start()
    });
}
function viewAllEmployeesByDepartment(){                
    db.query('SELECT employee.id as id, employee.first_name as first_name, employee.last_name as last_name, role.title as title, employee.id as manager, role.salary as salary, department.name as department From employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id=department.id ORDER BY department DESC', function (err, results) {
    if (err) throw err
    else {
        consoleTable(results)
    }
    return start()
});}
async function deleteEmployee(){
    let employeelist = await listEmployeeNames()
        inquirer.prompt([
            {
                type: "list",
                name: "employeeName",
                message: "Select an employee to delete",
                choices: employeelist
            }
        ])
            .then(choice => {
                const { employeeName } = choice
                splitName = employeeName.split(' ')
                db.query(`DELETE FROM employee WHERE first_name = ?`, splitName[0], (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else console.log(`${employeeName} has been removed`);
                    return start()
                });

            })


}
async function deleteDepartment(){
    let employeelist = await listDepartments()
    
        inquirer.prompt([
            {
                type: "list",
                name: "department",
                message: "Select department to delete",
                choices: employeelist
            }
        ])
            .then(choice => {
                const { department } = choice
                db.query(`DELETE FROM department WHERE name = ?`, department, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else console.log(`The ${department} department has been removed`);
                    return start()
                });

            })
}
async function deleteRole(){
    let employeelist = await listRoles()
        inquirer.prompt([
            {
                type: "list",
                name: "role",
                message: "Select a role to delete",
                choices: employeelist
            }
        ])
            .then(choice => {
                const { role } = choice
                db.query(`DELETE FROM role WHERE title = ?`, role, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else console.log(`The ${role} role has been removed`);
                    return start()
                });

            })
}
function consoleTable(object){
    const table = cTable.getTable(
        object
    );
    console.log(table);
}


start()