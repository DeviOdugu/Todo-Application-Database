const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error : ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API 1:
app.get("/todos/", async (request, response) => {
  const {
    todo = "",
    status = "",
    priority = "",
    search_q = "",
  } = request.query;

  let getTodoQuery;

  //Returns a list of all todos whose status is 'TO DO'
  if (status === "TO DO") {
    getTodoQuery = `
           select * from todo 
           where status='${status}';
        `;
  }

  //Reurns a list of all todos whose priority is 'HIGH' and status is 'IN PROGRESS'
  else if (priority === "HIGH" && status === "IN PROGRESS") {
    getTodoQuery = `
          select * from todo 
          where priority='${priority}' AND status='${status}';
      `;
  }

  //Returns a list of all todos whose priority is 'HIGH'
  else if (priority === "HIGH") {
    getTodoQuery = `
          select * from todo 
          where priority='${priority}';
      `;
  }

  //Returns a list of all todos whose todo contains 'Play' text
  else if (search_q === "Play") {
    getTodoQuery = `
          select * from todo 
          where todo like '%${search_q}%';
      `;
  }

  const todoArray = await db.all(getTodoQuery);
  response.send(todoArray);
});

//API 2: Returns a specific todo based on the todo ID
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getSpecificTodoQuery = `
         select * from todo
         where id=${todoId};
    `;
  const specificTodo = await db.get(getSpecificTodoQuery);
  response.send(specificTodo);
});

//API 3: Create a todo in the todo table
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const createTodoQuery = `
          insert into todo(id, todo, priority, status)
          values(${id}, '${todo}', '${priority}', '${status}');
    `;
  await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4: Updates the details of a specific todo based on the todo ID
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const { id = "", todo = "", priority = "", status = "" } = todoDetails;

  let updateTodoQuery;
  if (status !== "") {
    updateTodoQuery = `
         update todo set
         status='${status}'
         where id=${todoId};
    `;
    await db.run(updateTodoQuery);
    response.send("Status Updated");
  } else if (priority !== "") {
    updateTodoQuery = `
         update todo set
         priority='${priority}'
         where id=${todoId};
    `;
    await db.run(updateTodoQuery);
    response.send("Priority Updated");
  } else if (todo !== "") {
    updateTodoQuery = `
         update todo set
         todo='${todo}'
         where id=${todoId};
    `;
    await db.run(updateTodoQuery);
    response.send("Todo Updated");
  }
});

//API 5: Deletes a todo from the todo table based on the todo ID
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
        delete from todo 
        where id=${todoId};
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
