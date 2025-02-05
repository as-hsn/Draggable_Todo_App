import { useState } from "react";
import { Id, Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdOutlineDelete } from "react-icons/md";
import { TbListDetails } from "react-icons/tb";
import DetailsModal from "./DetailsModal";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  columnName: string;
}

const TaskCard = ({ task, deleteTask, updateTask, columnName }: Props) => {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendIdToModal, setSendIdToModal] = useState<string>("");
  const [sendColumnIdToModal, setSendColumnIdToModal] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
    disabled: editMode,
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white opacity-30 p-2.5 h-[50px]
        min-h-[50px] items-center flex flex-left rounded-xl border-2
        border-rose-500 cursor-grab relative"
      />
    );
  }

  if (editMode) {
    return (
      <div
        {...attributes}
        {...listeners}
        ref={setNodeRef}
        style={style}
        className="bg-white text-black p-2.5 h-[50px]
            min-h-[50px] items-center flex flex-left rounded-xl
            hover:ring-2 hover:ring-inset hover:ring-rose-500
            cursor-grab relative task"
      >
        <input
          type="text"
          className="h-[90%] w-full resize-none border-none rounded bg-transparent text-black focus:outline-none"
          value={task.content}
          autoFocus
          placeholder="Task content here"
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.shiftKey && e.key === "Enter") toggleEditMode();
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
        />
      </div>
    );
  }

  

  return (
    <>
     {/* Modal Component */}
     <DetailsModal
        taskContent={task.content}
        openModal={() => setIsModalOpen(true)}
        isOpen={isModalOpen} 
        closeModal={() => setIsModalOpen(false)} 
        taskId = {sendIdToModal}
        columnId = {sendColumnIdToModal}
        columnName={columnName}
      />
   
    <div
      onClick={toggleEditMode}
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={style}
      className="bg-zinc-100 border-[1px] border-zinc-300 text-black text-base p-2.5 h-[50px]
        min-h-[50px] items-center flex flex-left rounded-md
        hover:ring-2 hover:ring-inset hover:ring-indigo-600
        cursor-grab relative"
    >
      <p
        title={task.content}
        className="my-auto h-[90%] w-[16rem] overflow-y-auto
             overflow-x-hidden truncate whitespace-pre-wrap
             pr-6 rtl:pr-0 rtl:pl-6
             scrollbar-thin scrollbar-track-transparent 
             scrollbar-thumb-gray-500 hover:scrollbar-thumb-gray-700 
             custom-scrollbar"
      >
        {task.content}
      </p>

      {mouseIsOver && (
        <>
        <button
          onClick={() => {
            deleteTask(task.id);
          }}
          className="stroke-white absolute right-2 top-1/2
                    -translate-y-1/2 p-2 rounded"
        >
          <MdOutlineDelete className="text-red-500 text-[1.35rem]" />
        </button>
        <button
        onClick={() => {setIsModalOpen(true); toggleEditMode(); setSendIdToModal(String(task.id)); setSendColumnIdToModal(String(task.columnId))}}
        className="stroke-white absolute right-10 top-1/2 -translate-y-1/2 p-2 rounded"
      >
        <TbListDetails className="text-stone-700 text-[1.35rem]" />
      </button>
        </>
      )}
    </div>
    </>
  );
};

export default TaskCard;
