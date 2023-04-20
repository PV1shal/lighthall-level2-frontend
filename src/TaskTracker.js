import React, { useState, useEffect } from "react";
import tasksServices from "./Services/tasksServices";

function TaskTracker() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [userName, setUserName] = useState("");
  const [taskDescription, setDescription] = useState('');
  const [taskStatus, setStatus] = useState('');
  const [taskDueDay, setDueDay] = useState('');
  const [showEditTask, setShowEditTask] = useState(false)
  const [clickedTask, setClickedTask] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("loggedInUser");
    if (storedName) {
      setUserName(storedName);
    }

    // Gets Tasks from the DB
    tasksServices.getTaskByUserID(storedName).then((res) => {
      res.data.Tasks.forEach((task) => {
        setTasks(
          [...tasks, {
            name: task.title, user: task.taskOwner,
            description: task.description, status: task.status,
            dueDay: task.due, id: task._id
          }]
        )
      });
    });
  }, []);

  useEffect(() => {
    if (userName) {
      localStorage.setItem("loggedInUser", userName);
    }
  }, [userName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim() === "") return;

    //Commenting out ID as db returns unique ID for each newly inserted task.
    // const id = Math.floor(Math.random() * 10000) + (Math.random() * 99);

    // Creates Task in the DB
    var data = {
      "task": {
        "taskOwner": userName,
        "title": taskName,
        "description": taskDescription,
        "status": taskStatus,
        "due": taskDueDay
      }
    }

    // Adds Task to DB and to the UI.

    tasksServices.addTask(data)
      .then((res) => {
        setTasks([...tasks, {
          title: taskName, user: userName,
          description: taskDescription, status: taskStatus,
          dueDay: taskDueDay, id: res.data._id
        }]);


        setTaskName("");
        setDescription("");
        setStatus("");
        setDueDay("");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDelete = (taskToDelete) => {
    setTasks(tasks.filter((task) => task !== taskToDelete));

    // Deletes Task from the DB.
    tasksServices.deleteTask(taskToDelete.id)
  };

  const handleEdit = (id) => {
    const thisTask = tasks.find((task) => task.id === id);
    setClickedTask(thisTask);
    setShowEditTask(!showEditTask);
  };

  const filteredTasks = tasks.filter((task) => task.user === userName);

  return (
    <div className="container">
      <h1>Task Tracker {userName}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter task description"
          value={taskDescription}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter task status"
          value={taskStatus}
          onChange={(e) => setStatus(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter task due day"
          value={taskDueDay}
          onChange={(e) => setDueDay(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>
      <form>
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </form>
      <ul>
        {filteredTasks.map((task, index) => (
          <li key={index}>
            <div>
              <p>{task.name}</p>
              <p>Description: {task.description}</p>
              <p>Status: {task.status}</p>
              <p>Due Day: {task.dueDay}</p>
            </div>
            <button onClick={() => handleDelete(task)}>Delete</button>
            <button onClick={() => handleEdit(task.id)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskTracker;
