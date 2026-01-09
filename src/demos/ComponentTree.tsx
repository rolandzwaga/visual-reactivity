import { For } from "solid-js";
import { createTrackedEffect, createTrackedSignal } from "../instrumentation";

interface Todo {
	id: number;
	text: string;
}

function TodoItem(props: { todo: Todo; theme: () => string }) {
	createTrackedEffect(
		() => {
			props.theme();
		},
		{ name: `todo-${props.todo.id}-effect` },
	);

	return (
		<div
			style={{
				padding: "8px",
				"background-color": props.theme() === "light" ? "#f3f4f6" : "#374151",
				color: props.theme() === "light" ? "#1f2937" : "#f9fafb",
				"border-radius": "4px",
				"margin-bottom": "4px",
			}}
		>
			{props.todo.text}
		</div>
	);
}

function TodoList(props: { todos: () => Todo[]; theme: () => string }) {
	createTrackedEffect(
		() => {
			props.todos();
		},
		{ name: "todoList-effect" },
	);

	return (
		<div style={{ "margin-bottom": "16px" }}>
			<For each={props.todos()}>
				{(todo) => <TodoItem todo={todo} theme={props.theme} />}
			</For>
		</div>
	);
}

function Header(props: { theme: () => string }) {
	createTrackedEffect(
		() => {
			props.theme();
		},
		{ name: "header-effect" },
	);

	return (
		<div
			style={{
				"font-size": "24px",
				"font-weight": "700",
				"margin-bottom": "16px",
				color: props.theme() === "light" ? "#1f2937" : "#f9fafb",
			}}
		>
			Todo List
		</div>
	);
}

export function ComponentTree() {
	const [theme, setTheme] = createTrackedSignal("light", { name: "theme" });
	const [todos, setTodos] = createTrackedSignal<Todo[]>(
		[
			{ id: 1, text: "Learn SolidJS" },
			{ id: 2, text: "Build reactive app" },
		],
		{ name: "todos" },
	);

	let nextId = 3;

	const addTodo = () => {
		setTodos([...todos(), { id: nextId++, text: `Task ${nextId - 1}` }]);
	};

	const deleteTodo = () => {
		const current = todos();
		if (current.length > 0) {
			setTodos(current.slice(0, -1));
		}
	};

	return (
		<div style={{ padding: "20px" }}>
			<Header theme={theme} />
			<TodoList todos={todos} theme={theme} />
			<div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
				<button
					type="button"
					onClick={() => setTheme(theme() === "light" ? "dark" : "light")}
					style={{
						padding: "8px 16px",
						background: "#3b82f6",
						color: "white",
						border: "none",
						"border-radius": "6px",
						cursor: "pointer",
						"font-weight": "500",
					}}
				>
					Toggle Theme
				</button>
				<button
					type="button"
					onClick={addTodo}
					style={{
						padding: "8px 16px",
						background: "#10b981",
						color: "white",
						border: "none",
						"border-radius": "6px",
						cursor: "pointer",
						"font-weight": "500",
					}}
				>
					Add Todo
				</button>
				<button
					type="button"
					onClick={deleteTodo}
					style={{
						padding: "8px 16px",
						background: "#ef4444",
						color: "white",
						border: "none",
						"border-radius": "6px",
						cursor: "pointer",
						"font-weight": "500",
					}}
				>
					Delete Last
				</button>
			</div>
		</div>
	);
}
