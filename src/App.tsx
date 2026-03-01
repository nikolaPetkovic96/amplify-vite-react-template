import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';


const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();
  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    var note = window.prompt("Todo content") || "";
    if (note === "") {
      window.alert("neispravan unos ! Ponisteno dodavanje ");
    } else {
      client.models.Todo.create({ content: note, isDone: false });
      //client.models.Todo.create({ content: note});
    }
  }
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }
  async function toggleDone(id: string) {

    try {
      const upd = {
        id: id,
        isDone: true,
      };
      const { data, errors } = await client.models.Todo.update(upd);
      if (errors) {
        console.error('Update errors:', errors);
      }
      if (data) {
        alert('Todo updated successfully!');
      }
    }
    catch (err) {
      console.error('Update failed:', err);
    } finally {
      console.log("Succesfully done task");
    }
  }
  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <div >
              <input style={{ float: "left" }} type="checkbox"
                checked={todo.isDone}
                disabled={todo.isDone}
                onChange={() => toggleDone(todo.id)}
              />
              <div style={{ float: "left" }}>{todo.content}</div>
              <button style={{ float: "right", padding: "2px 10px", background: "darkred" }} onClick={() => deleteTodo(todo.id)} >X</button>
            </div>

          </li>
        ))}
      </ul>
      {/* <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div> */}
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
