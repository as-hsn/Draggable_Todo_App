import { useEffect, useMemo, useRef, useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Column, Id } from "../types";
import { useSortable, SortableContext } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../types";
import TaskCard from "./TaskCard";
import ShowToast from "./ShowToast";
import { MdOutlineDelete } from "react-icons/md";

// Add ShowToast prop to handle the error message display
interface Props {
  column: Column;
  tasks: Task[];
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  allColumns: Column[]; 
  deleteAllTasks: (id: Id) => void;
}

const ColumnContainer = (props: Props) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setEditMode(false); 
      }
    };
    // setNewTitle("")
    document.addEventListener("mousedown", handleClickOutside); 
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [editMode, setEditMode] = useState(false);
  const [newTitle, setNewTitle] = useState(props.column.title);
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
    allColumns,
    deleteAllTasks,
  } = props;

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "Column", column },
    disabled: editMode,
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // Function to check for duplicate titles and handle column update
  const handleColumnUpdate = () => {
    if (newTitle === "") {
      ShowToast({
        message: "Please add some text to the column title",
        type: "warning",
      });
      return;
    }

    const titleExists = allColumns.some(
      (card) => card.title === newTitle && card.id !== column.id 
    );

    if (titleExists) {
      ShowToast({
        message: "Same name Todo already exists",
        type: "warning",
      });
      return;
    } else {
      updateColumn(column.id, newTitle);

      setTimeout(() => {
        setEditMode(false);
      }, 100);
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white
        w-[350px] h-[400px]
        mt-10
        border-2 border-rose-500
        max-h-[500px] rounded-md
        flex flex-col"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white
    w-[350px] h-[400px]
    mt-10
    max-h-[500px] rounded-md
    flex flex-col
    shadow-lg"
    >
      {/* Column Title*/}
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
        }}
        className="
                text-md font-bold
                h-[60px] p-3    
                cursor-grab
                rounded-b-none
                 border-b-[1px] border-black
                bg-white
                shadow-[0_2px_5px_-2px_rgba(0,0,0,0.1),0_-2px_5px_-2px_rgba(0,0,0,0.1),-2px_0_5px_-2px_rgba(0,0,0,0.1)]
                rounded
                flex items-center justify-between"
      >
        <div className="flex gap-2 text-black">
          <div className="flex justify-center items-center bg-indigo-500 text-white px-2.5 py-1 font-normal text-sm rounded-full">
            {tasks.length}
          </div>

          {/* Column title with ellipsis and tooltip */}
          {!editMode && (
            <div className="relative w-full max-w-[14rem]">
              <span
                className="block truncate"
                title={column.title}
                style={{
                  maxWidth: "14rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {column.title}
              </span>
            </div>
          )}

          {editMode && (
            <form
              ref={formRef} // Attach the ref to the form
              onSubmit={(e) => {
                e.preventDefault();
                handleColumnUpdate();
              }}
              className="flex items-center"
            >
              <input
                autoFocus
                className="bg-white focus:border-indigo-500 border-2 border-indigo-500 rounded outline-none px-2 max-w-[14rem]"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-normal py-1 px-3 rounded-lg transition duration-300 ease-in-out ml-2"
              >
                Save
              </button>
            </form>
          )}
        </div>

        {!editMode &&
          (column.isDefault ? null : (
            <button
              onClick={() => deleteColumn(column.id)}
              className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded py-2 px-2"
            >
              <TrashIcon />
            </button>
          ))}
      </div>

      {/* Column Task Container*/}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto  border-black  border-b-[1px] ">
        <SortableContext items={tasksIds}>
          {tasks.length === 0 ? (
            <p className="text-center text-base text-black mt-[35%]">
              Drag a task here or create a new one
            </p>
          ) : (
            tasks.map((task) => (
                <TaskCard
                columnName={column.title}
                key={task.id}
                task={task}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Column Footer*/}
      <div className="flex justify-between items-center bg-gradient-to-r from-white to-white shadow-[4px_4px_10px_rgba(0,0,0,0.2)] rounded-md p-4 h-[4rem]">
        <button
          onClick={() => {
            createTask(column.id);
          }}
          className="flex gap-1 items-center text-white bg-indigo-500 border-2 border-indigo-600 rounded-lg p-2 px-5 transition-all duration-300 ease-in-out transform hover:bg-indigo-600 hover:border-indigo-700 hover:scale-105 active:bg-indigo-700"
        >
          <span className="font-normal text-sm">Add Task</span>
        </button>

        {tasks.length > 0 ? (
          <button
            onClick={() => deleteAllTasks(tasks[0].columnId)}
            className="flex gap-1 items-center text-white bg-red-500 border-2 border-red-600 rounded-lg p-2 px-5 transition-all duration-300 ease-in-out transform hover:bg-red-600 hover:border-red-700 hover:scale-105 active:bg-red-700"
          >
            <MdOutlineDelete className="text-white text-lg" />
            <span className="font-normal text-sm">Delete All Tasks</span>
          </button>
        ) : (
          <p className="flex gap-1 items-center text-black border-[0.5px] border-gray-500 rounded-lg p-2 px-4">
            <span className="font-normal text-sm">You have no tasks</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ColumnContainer;
