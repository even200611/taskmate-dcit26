
import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useParams,
  useNavigate,
} from "react-router-dom";

const defaultGroups = [
  { id: "school", name: "School Activities" },
  { id: "personal", name: "Personal Tasks" },
  { id: "daily", name: "Daily Tasks" },
];

function App() {
  const [groups, setGroups] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("taskmate-groups")) || defaultGroups;
    } catch {
      return defaultGroups;
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("taskmate-tasks")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("taskmate-groups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem("taskmate-tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addGroup(name) {
    setGroups((old) => [
      ...old,
      { id: String(Date.now()), name },
    ]);
  }

  function deleteGroup(groupId) {
    setGroups((old) => old.filter((group) => group.id !== groupId));
    setTasks((old) => old.filter((task) => task.groupId !== groupId));
  }

  function renameGroup(groupId, newName) {
    setGroups((old) =>
      old.map((group) =>
        group.id === groupId ? { ...group, name: newName } : group
      )
    );
  }

  function addTask(groupId, title) {
    setTasks((old) => [
      ...old,
      {
        id: `${Date.now()}-${Math.random()}`,
        groupId,
        title,
        done: false,
      },
    ]);
  }

  function toggleTask(id) {
    setTasks((old) =>
      old.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((old) => old.filter((task) => task.id !== id));
  }

  const completed = tasks.filter((task) => task.done).length;
  const pending = tasks.length - completed;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            ✓ TaskMate
          </Link>

          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            {[
              ["/", "Dashboard"],
              ["/groups", "Task Groups"],
              ["/guide", "User Guide"],
              ["/developers", "Developers"],
            ].map(([path, label]) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-indigo-50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <section>
                <p className="font-semibold text-indigo-600">
                  YOUR WORKSPACE
                </p>
                <h1 className="mt-2 text-3xl font-bold">
                  Welcome to TaskMate!
                </h1>
                <p className="mt-2 text-slate-500">
                  Organize your school activities and daily tasks.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  {[
                    ["Total Tasks", tasks.length],
                    ["Completed", completed],
                    ["Pending", pending],
                  ].map(([label, number]) => (
                    <div
                      key={label}
                      className="rounded-2xl border bg-white p-6"
                    >
                      <p className="text-slate-500">{label}</p>
                      <p className="mt-3 text-4xl font-bold">{number}</p>
                    </div>
                  ))}
                </div>

                <h2 className="mt-9 text-xl font-bold">
                  Your Task Groups
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {groups.map((group) => (
                    <Link
                      key={group.id}
                      to={`/groups/${group.id}`}
                      className="rounded-2xl border bg-white p-5 hover:border-indigo-400"
                    >
                      <h3 className="font-bold">{group.name}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {
                          tasks.filter(
                            (task) => task.groupId === group.id
                          ).length
                        }{" "}
                        task(s)
                      </p>
                      <span className="mt-4 inline-block font-semibold text-indigo-600">
                        Open Tasks →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            }
          />

          <Route
            path="/groups"
            element={
              <GroupsPage
                groups={groups}
                addGroup={addGroup}
                renameGroup={renameGroup}
                deleteGroup={deleteGroup}
              />
            }
          />

          <Route
            path="/groups/:groupId"
            element={
              <TaskPage
                groups={groups}
                tasks={tasks}
                addTask={addTask}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                deleteGroup={deleteGroup}
              />
            }
          />

          <Route path="/guide" element={<GuidePage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="border-t bg-white p-5 text-center text-sm text-slate-500">
        TaskMate · DCIT 26 Laboratory 3
      </footer>
    </div>
  );
}

function GroupsPage({ groups, addGroup, renameGroup, deleteGroup }) {
  const [name, setName] = useState("");

  function submit(event) {
    event.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) return;

    if (
      groups.some(
        (group) => group.name.toLowerCase() === cleanName.toLowerCase()
      )
    ) {
      window.alert("Group name already exists.");
      return;
    }

    addGroup(cleanName);
    setName("");
  }

  function handleRename(group) {
    const newName = window.prompt("Enter the new group name:", group.name);

    if (newName === null) return;

    const cleanName = newName.trim();

    if (!cleanName) {
      window.alert("Group name cannot be empty.");
      return;
    }

    if (
      groups.some(
        (item) =>
          item.id !== group.id &&
          item.name.toLowerCase() === cleanName.toLowerCase()
      )
    ) {
      window.alert("Group name already exists.");
      return;
    }

    renameGroup(group.id, cleanName);
  }

  function handleDelete(group) {
    const confirmed = window.confirm(
      `Delete "${group.name}" and all its tasks? This cannot be undone.`
    );

    if (confirmed) {
      deleteGroup(group.id);
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-bold">Task Groups</h1>
      <p className="mt-2 text-slate-500">
        Create, rename, and manage your task categories.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 flex flex-wrap gap-3 rounded-2xl border bg-white p-5"
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter a group name"
          maxLength={50}
          required
          className="min-w-0 flex-1 rounded-lg border px-4 py-3"
        />

        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          + Create Group
        </button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.id}
            className="rounded-2xl border bg-white p-5 hover:border-indigo-400"
          >
            <Link to={`/groups/${group.id}`} className="block">
              <h2 className="break-words font-bold">{group.name}</h2>
              <p className="mt-3 font-semibold text-indigo-600">
                Open Tasks →
              </p>
            </Link>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleRename(group)}
                className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-800"
              >
                Rename
              </button>

              <button
                type="button"
                onClick={() => handleDelete(group)}
                className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                Delete Group
              </button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-slate-400 p-6 text-center">
          No task groups yet. Create a new group above.
        </p>
      )}
    </section>
  );
}

function TaskPage({
  groups,
  tasks,
  addTask,
  toggleTask,
  deleteTask,
  deleteGroup,
}) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");

  const group = groups.find((item) => item.id === groupId);
  const groupTasks = tasks.filter((task) => task.groupId === groupId);

  if (!group) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Group not found</h1>
        <Link
          to="/groups"
          className="mt-4 inline-block text-indigo-600"
        >
          Back to Task Groups
        </Link>
      </section>
    );
  }

  function submit(event) {
    event.preventDefault();

    if (!title.trim()) return;

    addTask(groupId, title.trim());
    setTitle("");
  }

  return (
    <section>
      <Link
        to="/groups"
        className="text-sm font-semibold text-indigo-600"
      >
        ← Back to Task Groups
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{group.name}</h1>

        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                `Delete "${group.name}" and all its tasks? This cannot be undone.`
              )
            ) {
              deleteGroup(groupId);
              navigate("/groups");
            }
          }}
          className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Delete Group
        </button>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 flex flex-wrap gap-3 rounded-2xl border bg-white p-5"
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What do you need to do?"
          maxLength={150}
          required
          className="min-w-0 flex-1 rounded-lg border px-4 py-3"
        />

        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          + Add Task
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {groupTasks.length === 0 && (
          <p className="rounded-xl border bg-white p-6 text-slate-500">
            No tasks yet. Add your first task above.
          </p>
        )}

        {groupTasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4"
          >
            <button
              type="button"
              onClick={() => toggleTask(task.id)}
              className="rounded-lg border px-3 py-2"
            >
              {task.done ? "✓" : "○"}
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={
                  task.done
                    ? "break-words text-slate-400 line-through"
                    : "break-words font-medium"
                }
              >
                {task.title}
              </p>

              <p
                className={`mt-1 text-xs font-semibold ${
                  task.done ? "text-green-600" : "text-amber-600"
                }`}
              >
                {task.done ? "Done" : "Not Done"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggleTask(task.id)}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm"
            >
              {task.done ? "Undo" : "Mark Done"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete task "${task.title}"?`)) {
                  deleteTask(task.id);
                }
              }}
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function GuidePage() {
  const steps = [
    "Open Task Groups and create a category.",
    "Use Rename to change a group name, or Delete Group to remove a group.",
    "Open your chosen category and type a task.",
    "Click Add Task to save it in that category.",
    "Click the checkmark or Mark Done to finish a task.",
    "Click Undo to change a task back to Not Done.",
    "Click Delete to remove a task.",
    "Click Delete Group to remove a category and its tasks.",
    "Use the navigation menu to move between pages.",
  ];

  return (
    <section>
      <h1 className="text-3xl font-bold">Instructions / User Guide</h1>
      <p className="mt-2 text-slate-500">How to use TaskMate.</p>

      <div className="mt-6 space-y-3">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex gap-4 rounded-xl border bg-white p-5"
          >
            <span className="font-bold text-indigo-600">
              {index + 1}.
            </span>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DevelopersPage() {
  return (
    <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 px-6 py-10 sm:px-10">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-cyan-300 sm:text-sm">
            TASKMATE · DCIT 26
          </p>
          <h1 className="mt-3 text-3xl font-black !text-white sm:text-4xl">
            Meet the Developers
          </h1>
          <p className="mt-2 max-w-xl text-sm !text-blue-100 sm:text-base">
            The people behind the idea, development, and testing of TaskMate.
          </p>
          <div className="mt-6 h-1.5 w-24 rounded-full bg-gradient-to-r from-cyan-300 to-blue-500" />
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
        <article className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-200/40 blur-2xl transition group-hover:bg-indigo-300/50" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-indigo-200 bg-white/90 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] !text-indigo-700">
                Student Developer
              </span>
              <span className="text-2xl" aria-hidden="true">✦</span>
            </div>
            <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-xl font-black text-white shadow-lg shadow-indigo-500/20">
              SJ
            </div>
            <h2 className="mt-5 break-words text-2xl font-black leading-tight !text-slate-950 sm:text-3xl">
              Steven Pepino Jimenez
            </h2>
            <p className="mt-3 text-sm leading-7 !text-slate-700">
              I developed TaskMate to help users organize school activities,
              personal tasks, and daily responsibilities in one simple and
              user-friendly website.
            </p>
            <div className="mt-5">
              <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] !text-indigo-700">
                My Contributions
              </h3>
              <ul className="mt-3 space-y-2 text-sm !text-slate-700">
                <li>✓ Interface and website design</li>
                <li>✓ React components development</li>
                <li>✓ Task management features</li>
                <li>✓ Page navigation</li>
                <li>✓ System testing with AI assistance</li>
              </ul>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold !text-indigo-800">React</span>
              <span className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold !text-blue-800">JavaScript</span>
              <span className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-bold !text-cyan-800">Tailwind CSS</span>
            </div>
          </div>
        </article>

        <article className="group relative overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-200/40 blur-2xl transition group-hover:bg-cyan-300/50" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-cyan-200 bg-white/90 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] !text-cyan-800">
                System Tester
              </span>
              <span className="text-2xl" aria-hidden="true">✓</span>
            </div>
            <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-500 text-xl font-black text-white shadow-lg shadow-cyan-500/20">
              LE
            </div>
            <h2 className="mt-5 break-words text-2xl font-black leading-tight !text-slate-950 sm:text-3xl">
              Lorelie Escudero
            </h2>
            <p className="mt-3 text-sm leading-7 !text-slate-700">
              She helped evaluate TaskMate by trying its features and checking
              whether the website works properly and is easy to use.
            </p>
            <div className="mt-5">
              <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] !text-cyan-800">
                Her Contributions
              </h3>
              <ul className="mt-3 space-y-2 text-sm !text-slate-700">
                <li>✓ Tested the website's pages and features</li>
                <li>✓ Checked buttons and page navigation</li>
                <li>✓ Looked for errors and unexpected behavior</li>
                <li>✓ Checked if task actions work as expected</li>
                <li>✓ Shared feedback to improve usability</li>
              </ul>
            </div>
            <div className="mt-6 inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-bold !text-cyan-800">
              Testing & Quality Checking
            </div>
          </div>
        </article>
      </div>

      <div className="px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-center shadow-inner sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-300">
            One Team · One Goal
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200 sm:text-base">
            Building a simple, useful, and user-friendly way to stay organized.
          </p>
        </div>
      </div>
    </section>
  );
}

function NotFound() {
  return (
    <section className="rounded-2xl border bg-white p-8">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link to="/" className="mt-4 inline-block text-indigo-600">
        Return to Dashboard
      </Link>
    </section>
  );
}

export default App;
