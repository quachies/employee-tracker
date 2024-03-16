const inquirer = require('inquirer');
const mysql = require('mysql2');

require('dotenv').config();

const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect();

function displayTable(data, headers) {
  console.table(data, headers);
}

function viewAllDepartments() {
    connection.query('SELECT id, dept_name, dept_manager FROM departments', (error, results) => {
      if (error) throw error;
  
      const formattedResults = results.map((result) => {
        return {
          'Department ID': result.id,
          'Department Name': result.dept_name,
          'Department Manager': result.dept_manager
        };
      });
  
      displayTable(formattedResults, ['Department ID', 'Department Name', 'Department Manager']);
      startApp();
    });
}


function viewAllEmployees() {
    connection.query('SELECT roles.id, roles.title, roles.salary, departments.dept_name AS department, employees.first_name, employees.last_name, departments.dept_manager AS `Department Manager` FROM roles INNER JOIN departments ON roles.department_id = departments.id INNER JOIN employees ON roles.id = employees.role_id;',
    (error, results) => {
      if (error) throw error;
  
      const formattedResults = results.map((result) => {
        return {
          'First Name': result.first_name,
          'Last Name': result.last_name,
          'Role ID': result.id,
          'Title': result.title,
          'Salary': result.salary,
          'Department': result.department,
          'Department Manager': result['Department Manager'],
        };
      });
  
      displayTable(formattedResults, ['First Name', 'Last Name', 'Role ID', 'Department', 'Title', 'Salary', 'Department Manager']);
      startApp();
    });
  }
  
  function viewAllRoles() {
    connection.query('SELECT roles.id, roles.title, roles.salary, departments.dept_name AS department FROM roles INNER JOIN departments ON roles.department_id = departments.id;',
    (error, results) => {
      if (error) throw error;
  
      const formattedResults = results.map((result) => {
        return {
          'Role ID': result.id,
          'Title': result.title,
          'Salary': result.salary,
          'Department': result.department,
        };
      });
  
      displayTable(formattedResults, ['Role ID', 'Department', 'Title', 'Salary']);
      startApp();
    });
}
  
function addDepartment() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'dept_name',
                message: 'Enter the name of the department:',
            },
            {
                type: 'input',
                name: 'dept_manager',
                message: 'Enter the name of the department manager:',
            },
        ])
        .then((deptAnswer) => {
            connection.query(
                'INSERT INTO departments (dept_name, dept_manager) VALUES (?, ?)',
                [deptAnswer.dept_name, deptAnswer.dept_manager],
                (error, results) => {
                    if (error) throw error;
                    console.log('Successfully added department.');
                    startApp();
                }
            );
        });
}


function addEmployee() {
    connection.query('SELECT id, title FROM roles', (error, results) => {
        if (error) throw error;

        const roleChoices = results.map((result) => result.title);

        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: 'Enter the first name of the employee:',
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: 'Enter the last name of the employee:',
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'Select the role for this employee:',
                    choices: roleChoices,
                },
            ])
            .then((employeeAnswer) => {
                const selectedRole = results.find((result) => result.title === employeeAnswer.role);

                if (!selectedRole) {
                    console.log('Error: Could not find role.');
                    startApp();
                    return;
                }

                const roleId = selectedRole.id;

                connection.query(
                    'INSERT INTO employees (first_name, last_name, role_id) VALUES (?, ?, ?)',
                    [
                        employeeAnswer.first_name,
                        employeeAnswer.last_name,
                        roleId,
                    ],
                    (error, results) => {
                        if (error) throw error;
                        console.log('Successfully added employee.');
                        startApp();
                    }
                );
            });
    });
}

function addRole() {
    connection.query('SELECT dept_name FROM departments', (error, results) => {
        if (error) throw error;

        const departmentChoices = results.map((result) => result.dept_name);

        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'Enter the name of the role:',
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'Enter the salary for this role:',
                },
                {
                    type: 'list',
                    name: 'department',
                    message: 'Select the department for this role:',
                    choices: departmentChoices,
                },
            ])
            .then((roleAnswer) => {
                connection.query(
                    'SELECT id FROM departments WHERE dept_name = ?',
                    [roleAnswer.department],
                    (error, departmentResult) => {
                        if (error) throw error;

                        const departmentId = departmentResult[0].id;

                        connection.query(
                            'INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)',
                            [roleAnswer.title, roleAnswer.salary, departmentId],
                            (error, results) => {
                                if (error) throw error;
                                console.log('Successfully added role.');
                                startApp();
                            }
                        );
                    }
                );
            });
    });
}

function updateEmployeeRole() {
    connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employees', (error, employeeResults) => {
        if (error) throw error;

        connection.query('SELECT id, title FROM roles', (error, roleResults) => {
            if (error) throw error;

            const employeeChoices = employeeResults.map((employee) => ({
                name: employee.full_name,
                value: employee.id,
            }));

            const roleChoices = roleResults.map((role) => ({
                name: role.title,
                value: role.id,
            }));

            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'employeeId',
                        message: 'Select the employee to update:',
                        choices: employeeChoices,
                    },
                    {
                        type: 'list',
                        name: 'newRoleId',
                        message: 'Select the new role for the employee:',
                        choices: roleChoices,
                    },
                ])
                .then((answers) => {
                    connection.query(
                        'UPDATE employees SET role_id = ? WHERE id = ?',
                        [answers.newRoleId, answers.employeeId],
                        (error, results) => {
                            if (error) throw error;
                            console.log('Successfully added employee role.');
                            startApp();
                        }
                    );
                });
        });
    });
}


function startApp() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'View All departments',
          'Add Department',
          'View All Roles',
          'Add Role',
          'View All Employees',
          'Add Employee',
          'Update Employee Role',
          'Exit',
        ],
      },
    ])
    .then((answer) => {
      switch (answer.action) {
        case 'View All departments':
          viewAllDepartments();
          break;
        case 'Add Department':
          addDepartment();
          break;      
        case 'View All Roles':
          viewAllRoles();
          break;
        case 'Add Role':
          addRole();
          break;
        case 'View All Employees':
          viewAllEmployees();
          break;
        case 'Add Employee':
          addEmployee();
          break;
        case 'Update Employee Role':
          updateEmployeeRole();
          break;
        case 'Exit':
          connection.end();
          console.log('End');
          break;
        default:
          console.log('Error: Try again please.');
          startApp();
      }
    });
}

startApp();