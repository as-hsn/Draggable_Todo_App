import { useState, useEffect } from "react";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useSensors,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import ShowToast from "./ShowToast";
import BeautifulModal from "./TodoModal";
import { auth, database, db } from "./firebase";
import {
  ref,
  onValue,
  push,
  remove,
  update,
  set,
  get,
} from "firebase/database";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import ResponsiveHeader from "./Header";

const TodoApp = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("");
  const [newListName, setNewListName] = useState("");
  const [selectedTodoId, setSelectedTodoId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // get user name and email from another firebase database

  const fetchUserName = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserName(docSnap.data().name || "load..");
      }
    });
  };
  useEffect(() => {
    fetchUserName();
  }, []);

  // Firebase initialization
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch user data
        console.log(user);
        // setUserName(user.displayName || "load..");
        setUserEmail(user.email || "");

        // Setup realtime listeners
        const columnsRef = ref(database, `users/${user.uid}/columns`);
        const tasksRef = ref(database, `users/${user.uid}/tasks`);

        // Check for new user and create default columns
        const snapshot = await get(columnsRef);
        if (!snapshot.exists()) {
          const defaultColumns = [
            { title: "Todo", isDefault: true },
            { title: "Doing", isDefault: true },
            { title: "Done", isDefault: true },
          ];

          const updates: { [key: string]: any } = {};
          defaultColumns.forEach((col, index) => {
            const newKey = push(columnsRef).key;
            if (newKey) {
              updates[newKey] = {
                id: newKey,
                title: col.title,
                order: index,
                isDefault: col.isDefault,
              };
            }
          });

          await update(columnsRef, updates);
        }

        onValue(columnsRef, (snapshot) => {
          const data = snapshot.val();
          setColumns(data ? Object.values(data) : []);
        });

        onValue(tasksRef, (snapshot) => {
          const data = snapshot.val();
          setTasks(data ? Object.values(data) : []);
        });
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );

  // Column operations
  const createNewColumn = async (title: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const titleExists = columns.some((col) => col.title === title);
    if (titleExists) {
      ShowToast({
        message: "Todo with same name already exists",
        type: "warning",
      });
      return;
    }

    const columnsRef = ref(database, `users/${user.uid}/columns`);
    const newColumnRef = push(columnsRef);
    await set(newColumnRef, {
      id: newColumnRef.key,
      title,
      order: columns.length,
    });
    setIsModalOpen(false);
  };

  const deleteColumn = async (column: Column) => {
    if (column.isDefault) {
      ShowToast({
        message: "Default columns cannot be deleted",
        type: "warning",
      });
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    // Delete column
    const columnRef = ref(database, `users/${user.uid}/columns/${column.id}`);
    await remove(columnRef);

    // Delete associated tasks
    const tasksSnapshot = await get(ref(database, `users/${user.uid}/tasks`));
    const tasks = tasksSnapshot.val() || {};
    Object.keys(tasks).forEach(async (taskId) => {
      if (tasks[taskId].columnId === column.id) {
        await remove(ref(database, `users/${user.uid}/tasks/${taskId}`));
      }
    });
  };

  const updateColumn = async (id: Id, title: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const columnRef = ref(database, `users/${user.uid}/columns/${id}`);
    await update(columnRef, { title });
  };

  // Task operations
  const createTask = async (columnId: Id) => {
    const user = auth.currentUser;
    if (!user) return;

    const tasksRef = ref(database, `users/${user.uid}/tasks`);
    const newTaskRef = push(tasksRef);
    await set(newTaskRef, {
      id: newTaskRef.key,
      columnId,
      content: `New Task ${tasks.length + 1}`,
      order: tasks.filter((t) => t.columnId === columnId).length,
    });
  };

  const deleteTask = async (id: Id) => {
    const user = auth.currentUser;
    if (!user) return;

    const taskRef = ref(database, `users/${user.uid}/tasks/${id}`);
    await remove(taskRef);
  };

  const updateTask = async (id: Id, content: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const taskRef = ref(database, `users/${user.uid}/tasks/${id}`);
    await update(taskRef, { content });
  };

  const deleteAllTasks = async (columnId: Id) => {
    console.log('deleted all tasks',columnId);
    const user = auth.currentUser;
    if (!user) return;

    const tasksSnapshot = await get(ref(database, `users/${user.uid}/tasks`));
    const tasks = tasksSnapshot.val() || {};
    Object.keys(tasks).forEach(async (taskId) => {
      if (tasks[taskId].columnId === columnId) {
        await remove(ref(database, `users/${user.uid}/tasks/${taskId}`));
      }
    });
  };

  // Drag and drop handlers
  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Handle column sorting
    if (
      active.data.current?.type === "Column" &&
      over.data.current?.type === "Column"
    ) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);
      const newColumns = arrayMove(columns, oldIndex, newIndex);

      const user = auth.currentUser;
      if (user) {
        const updates: { [path: string]: any } = {};
        newColumns.forEach((col, index) => {
          updates[`users/${user.uid}/columns/${col.id}/order`] = index;
        });
        await update(ref(database), updates);
      }
    }
  };

  const onDragOver = async (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    // const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (isActiveTask) {
      const activeTask = tasks.find((t) => t.id === activeId);
      const overTask = tasks.find((t) => t.id === overId);
      const overColumn = isOverColumn
        ? columns.find((col) => col.id === overId)
        : columns.find((col) => col.id === overTask?.columnId);

      if (!activeTask || !overColumn) return;

      // Calculate new position
      const newTasks = tasks.filter((t) => t.columnId === overColumn.id);
      const overIndex = newTasks.findIndex((t) => t.id === overId);
      const newOrder = overIndex >= 0 ? overIndex : newTasks.length;

      // Batch update database
      const user = auth.currentUser;
      if (user) {
        const updates: { [path: string]: any } = {};

        // Update previous column tasks
        if (activeTask.columnId !== overColumn.id) {
          const oldColumnTasks = tasks
            .filter((t) => t.columnId === activeTask.columnId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          oldColumnTasks.forEach((task, index) => {
            if (task.id !== activeId) {
              updates[`users/${user.uid}/tasks/${task.id}/order`] = index;
            }
          });
        }

        // Update moved task
        updates[`users/${user.uid}/tasks/${activeId}/columnId`] = overColumn.id;
        updates[`users/${user.uid}/tasks/${activeId}/order`] = newOrder;

        // Update new column tasks
        newTasks.forEach((task, index) => {
          if (task.id !== activeId) {
            const pos = index >= newOrder ? index + 1 : index;
            updates[`users/${user.uid}/tasks/${task.id}/order`] = pos;
          }
        });

        await update(ref(database), updates);
      }
    }
  };

  // Add task through input
  const addTask = async (columnId: string, content: string) => {
    const user = auth.currentUser;
    if (!user) return;

    if (!content.trim()) {
      ShowToast({ message: "Task cannot be empty", type: "warning" });
      return;
    }

    if (!columnId) {
      ShowToast({ message: "Please select a todo", type: "warning" });
      return;
    }

    const tasksRef = ref(database, `users/${user.uid}/tasks`);
    const newTaskRef = push(tasksRef);
    await set(newTaskRef, {
      id: newTaskRef.key,
      columnId,
      content,
      order: tasks.filter((t) => t.columnId === columnId).length,
    });
    setNewListName("");
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
      ShowToast({ message: "Successfully logged out" });
    } catch (error) {
      ShowToast({ message: "Error logging out", type: "error" });
    }
  };

  return (<>
      <ResponsiveHeader
        columns={columns.map((col) => ({ ...col, id: String(col.id) }))}
        selectedTodoId={selectedTodoId}
        setSelectedTodoId={setSelectedTodoId}
        newListName={newListName}
        setNewListName={setNewListName}
        addTask={addTask}
        userName={userName? userName : "Loading "}
        handleLogout={handleLogout}
        setIsModalOpen={setIsModalOpen}
      />
    <div className="m-auto -mt-[4.2rem] flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
      <BeautifulModal
        addTodoCard={createNewColumn}
        openModal={() => setIsModalOpen(true)}
        closeModal={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
      />

      {/* Header Section */}


      {/* Main Board Area */}
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4 mt-[6rem]">
          <div className="flex gap-4">
            <SortableContext items={columns.map((col) => col.id)}>
              {columns
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((col) => (
                  <ColumnContainer
                    key={col.id}
                    column={col}
                    deleteColumn={() => deleteColumn(col)} // Pass column instead of just ID
                    updateColumn={updateColumn}
                    createTask={createTask}
                    tasks={tasks
                      .filter((t) => t.columnId === col.id)
                      .sort((a, b) => (a.order || 0) - (b.order || 0))}
                    deleteTask={deleteTask}
                    updateTask={updateTask}
                    deleteAllTasks={deleteAllTasks}
                    allColumns={columns}
                  />
                ))}
            </SortableContext>
          </div>
        </div>

        {/* Drag Overlay */}
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                // deleteColumn={deleteColumn}
                deleteColumn={() => deleteColumn(activeColumn)}
                updateColumn={updateColumn}
                createTask={createTask}
                tasks={tasks.filter((t) => t.columnId === activeColumn.id)}
                deleteTask={deleteTask}
                updateTask={updateTask}
                deleteAllTasks={deleteAllTasks}
                allColumns={columns}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
    </>
  );
};

export default TodoApp;