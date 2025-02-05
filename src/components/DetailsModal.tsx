import React, { useState, useEffect } from "react";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  update,
  remove,
  onValue,
} from "firebase/database";
import { database } from "./firebase";

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  openModal: () => void;
  taskId: string;
  columnId: string;
  taskContent: string;
  columnName: string;
}
const DetailsModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  taskId,
  columnId,
  taskContent,
  columnName,
  openModal
}) => {
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [comments, setComments] = useState<{ id: string; text: string }[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [watch, setWatch] = useState(true);

  useEffect(() => {
    if (isOpen && taskId) {
      const taskRef = ref(database, `tasks/${taskId}`);

      // Get task data once when modal opens
      get(taskRef).then((snapshot) => {
        const taskData = snapshot.val();
        if (taskData) {
          setDescription(taskData.description || "");
          setComments(taskData.comments || []);
        }
      });

      // Real-time listener for task data updates
      const taskListener = ref(database, `tasks/${taskId}`);
      const unsubscribe = onValue(taskListener, (snapshot) => {
        const taskData = snapshot.val();
        if (taskData) {
          setDescription(taskData.description || "");
          setComments(taskData.comments || []);
        }
      });

      // Clean up listener when modal is closed
      return () => {
        // Detach listener to prevent memory leaks
        unsubscribe();
      };
    }
  }, [isOpen, taskId]);


  const handleSaveDescription = () => {
    const taskRef = ref(database, `tasks/${taskId}`);
    update(taskRef, { description: taskDescription });
    setTaskDescription("");
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const taskRef = ref(database, `tasks/${taskId}/comments`);
      const newCommentRef = push(taskRef);
      set(newCommentRef, { text: newComment });
      setNewComment("");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    handleAddComment()
    const commentRef = ref(database, `tasks/${taskId}/comments/${commentId}`);
    remove(commentRef);
  };

  const handleDeleteDescription = () => {
    const commentRef = ref(database, `tasks/${taskId}/description`);
    remove(commentRef);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 w-full overflow-y-scroll h-full z-50 top-0 flex justify-center backdrop-blur-md">
      <div className="text-[#b6c2cf] absolute top-0 left-0 right-0 mx-auto p-6 rounded-2xl w-[768px] md:min-h-[890px] md:max-h-full bg-slate-500 border-2 border-indigo-300 opacity-100 my-12 flex max-md:flex-col max-md:w-[80%] max-md:h-fit z-[9999]">
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="0"
          viewBox="0 0 512 512"
          className="absolute top-4 right-4 text-2xl  hover:bg-zinc-600 hover:text-white cursor-pointer        md:hidden"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"></path>
        </svg>

        <div className="w-[75%] flex flex-col gap-6 max-md:w-full">
          <div className="flex">
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 24 24"
              className="text-2xl"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 4.75C0 3.784.784 3 1.75 3h20.5c.966 0 1.75.784 1.75 1.75v14.5A1.75 1.75 0 0 1 22.25 21H1.75A1.75 1.75 0 0 1 0 19.25Zm1.75-.25a.25.25 0 0 0-.25.25v14.5c0 .138.112.25.25.25h20.5a.25.25 0 0 0 .25-.25V4.75a.25.25 0 0 0-.25-.25Z"></path>
              <path d="M5 8.75A.75.75 0 0 1 5.75 8h11.5a.75.75 0 0 1 0 1.5H5.75A.75.75 0 0 1 5 8.75Zm0 4a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Z"></path>
            </svg>

            <div className="ml-4 w-[87%]">
              <h1 className="text-xl mb-1 break-words w-full max-h-40 overflow-y-auto ">
                {taskContent}
              </h1>
              <h2 className="text-sm font-normal truncate max-w-32 ">
                in list
                <span className="px-1 rounded-sm font-normal text-slate-800  bg-zinc-400">
                  {columnName}
                </span>
              </h2>
            </div>
          </div>
          <div className="ml-10">
            <h2 className="text-sm mb-1">Notifications</h2>

            <div
              onClick={() => setWatch((prev) => !prev)}
              className="flex items-center gap-1 px-3  bg-zinc-400 cursor-pointer w-fit py-2 rounded"
            >
              {watch ? (
                <div className="flex items-center gap-1 px-3  bg-zinc-400 cursor-pointer w-fit py-2 rounded">
                  <svg
                  className="text-slate-800"
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <h3 className="text-slate-800">Watching</h3>
                  <svg
                  
                    stroke="currentColor"
                    fill="currentColor"
                    stroke-width="0"
                    viewBox="0 0 512 512"
                    className="text-slate-800"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="32"
                      d="M416 128 192 384l-96-96"
                    ></path>
                  </svg>
                </div>
              ) : (
                <>
                  <svg
                  className="text-slate-800"
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>

                  <h3 className="text-slate-800">Watch</h3>
                </>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <div className="text-xl">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="0.46" y="3.06" width="23.08" height="2.18"></rect>
                  <rect x="0.46" y="8.29" width="23.08" height="2.18"></rect>
                  <rect x="0.46" y="13.53" width="23.08" height="2.18"></rect>
                  <rect x="0.46" y="18.76" width="15.81" height="2.18"></rect>
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-lg mb-1">Description</h1>
              </div>
            </div>
            {description && !editMode ? (
              <div className="ml-10 mt-1">
                <div className=" bg-zinc-400 outline-none px-3 py-2 text-sm font-normal w-full rounded break-words max-h-28 text-slate-800">
                  <p>{description}</p>
                </div>
                <div className="flex items-center">
                  <p
                    className="text-[11px] flex items-center cursor-pointer hover:underline"
                    onClick={() => {
                      setTaskDescription(description);
                      setEditMode(true);
                    }}
                  >
                    <svg
                      stroke="currentColor"
                      fill="none"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="text-xl"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12.1" cy="12.1" r="1"></circle>
                    </svg>
                    Edit
                  </p>
                  <p className="text-[11px] flex items-center cursor-pointer hover:underline">
                    <svg
                      stroke="currentColor"
                      fill="none"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="text-xl"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12.1" cy="12.1" r="1"></circle>
                    </svg>
                    <button
                      onClick={() => {
                        handleDeleteDescription();
                        setEditMode(true);
                      }}
                    >
                      Delete
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div className="ml-10 mt-1">
                <textarea
                  className=" bg-zinc-400 text-slate-800 placeholder-slate-800 outline-none px-3 pt-2 pb-8 text-sm font-normal w-full rounded resize-none"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Edit task description..."
                ></textarea>
                <button
                  className="cursor-pointer bg-blue-800 text-white px-3 py-1 rounded-sm disabled:bg-blue-950"
                  onClick={() => {
                    handleSaveDescription();
                    setEditMode(false);
                  }}
                >
                  Save
                </button>
              </div>
            )}
          </div>
          <div>
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="text-xl">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    stroke-width="0"
                    viewBox="0 0 24 24"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="none"
                      stroke-linecap="round"
                      stroke-width="2"
                      d="M9,6 L21,6 M9,12 L21,12 M9,18 L17,18 M4,7 C4.55228475,7 5,6.55228475 5,6 C5,5.44771525 4.55228475,5 4,5 C3.44771525,5 3,5.44771525 3,6 C3,6.55228475 3.44771525,7 4,7 Z M4,13 C4.55228475,13 5,12.5522847 5,12 C5,11.4477153 4.55228475,11 4,11 C3.44771525,11 3,11.4477153 3,12 C3,12.5522847 3.44771525,13 4,13 Z M4,19 C4.55228475,19 5,18.5522847 5,18 C5,17.4477153 4.55228475,17 4,17 C3.44771525,17 3,17.4477153 3,18 C3,18.5522847 3.44771525,19 4,19 Z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h1 className="text-lg mb-1">
                    Comments{" "}
                    <span className="ml-1 text-sm font-extralight">
                      {comments.length === 0 && "0"}
                    </span>
                  </h1>
                  <div className="mb-2">
                    {/* {comments.map((comment) => (
                <div key={comment.id} className="flex justify-between items-center mb-2">
                  <p>{comment.text}</p>
                  <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500">
                    Delete
                  </button>
                </div>
              ))} */}
                  </div>
                </div>
              </div>
              <button className="px-3 py-1 text-slate-800  bg-zinc-400 rounded  hover:bg-zinc-600 hover:text-white cursor-pointer">
                Show Details
              </button>
            </div>
            <div className="ml-10 mt-2">
              <textarea
                className="bg-zinc-400 text-slate-800 placeholder-slate-800 outline-none px-3 py-2 text-sm font-normal w-full rounded resize-none h-20"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              ></textarea>

              <button
                className="cursor-pointer bg-blue-800 text-white px-3 py-1 rounded-sm disabled:bg-blue-950"
                onClick={handleAddComment}
              >
                Save
              </button>
            </div>
            {comments && (
              <div className="mt-8">
                <div className="max-h-[300px] overflow-x-hidden overflow-y-auto">
                  {Object.entries(comments).map(([id, com], index) => (
                    <div key={index}>
                      <div className="flex gap-2">
                        <div className="bg-zinc-400 text-slate-800 translate-x-12 outline-none px-3 py-2 text-sm w-60 overflow-hidden rounded text-wrap break-words">
                          {com.text}
                        </div>
                      </div>
                      <div className="flex translate-x-11">
                        <p className="text-[11px] flex items-center cursor-pointer hover:underline">
                          <svg
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-xl"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="12.1" cy="12.1" r="1"></circle>
                          </svg>
                          <button
                            onClick={() => {
                              handleDeleteComment(id);
                            }}
                          >
                            delete
                          </button>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="ml-10 flex flex-col gap-2 relative overflow-x-hidden       max-md:mb-5 "></div>
        </div>
        <div className="w-[25%] pl-5 flex flex-col justify-end relative max-md:pl-0 max-md:w-full">
          <svg
            onClick={() => {
              closeModal();
              setWatch(false);
            }}
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 512 512"
            className="absolute top-0 right-0 text-2xl  hover:bg-zinc-600 hover:text-white cursor-pointer max-md:hidden"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"></path>
          </svg>

          <div className="flex flex-col gap-2     max-md:flex-wrap max-md:flex-row">
            <button className="w-full flex items-center text-slate-800 bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                {" "}
                <svg
                  stroke="currentColor"
                  fill="none"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" x2="19" y1="8" y2="14"></line>
                  <line x1="22" x2="16" y1="11" y2="11"></line>
                </svg>
              </div>
              Join
            </button>
            <button className="w-full flex items-center text-slate-800  bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="none"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              Members
            </button>
            <button className="w-full flex items-center text-slate-800  bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="none"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              Labels
            </button>
            <button className="w-full flex items-center text-slate-800  bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="none"
                  stroke-width="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ transform: "rotate(135deg)" }}
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2 8V16C2 16.5523 2.44772 17 3 17H16.6202C16.9121 17 17.1895 16.8724 17.3795 16.6508L20.808 12.6508C21.129 12.2763 21.129 11.7237 20.808 11.3492L17.3795 7.34921C17.1895 7.12756 16.9121 7 16.6202 7H3C2.44772 7 2 7.44772 2 8ZM0 8V16C0 17.6569 1.34315 19 3 19H16.6202C17.496 19 18.328 18.6173 18.898 17.9524L22.3265 13.9524C23.2895 12.8289 23.2895 11.1711 22.3265 10.0476L18.898 6.04763C18.328 5.38269 17.496 5 16.6202 5H3C1.34315 5 0 6.34315 0 8Z"
                    fill="currentColor"
                  ></path>
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M15 13C15.5523 13 16 12.5523 16 12C16 11.4477 15.5523 11 15 11C14.4477 11 14 11.4477 14 12C14 12.5523 14.4477 13 15 13ZM15 15C16.6569 15 18 13.6569 18 12C18 10.3431 16.6569 9 15 9C13.3431 9 12 10.3431 12 12C12 13.6569 13.3431 15 15 15Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              Checklist
            </button>
            <button className="w-full flex items-center text-slate-800 bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 512 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M168.531 215.469l-29.864 29.864 96 96L448 128l-29.864-29.864-183.469 182.395-66.136-65.062zm236.802 189.864H106.667V106.667H320V64H106.667C83.198 64 64 83.198 64 106.667v298.666C64 428.802 83.198 448 106.667 448h298.666C428.802 448 448 428.802 448 405.333V234.667h-42.667v170.666z"></path>
                </svg>
              </div>
              Dates
            </button>
            <button className="w-full flex items-center text-slate-800 bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 512 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g fill-opacity=".9">
                    <path d="M255.8 48C141 48 48 141.2 48 256s93 208 207.8 208c115 0 208.2-93.2 208.2-208S370.8 48 255.8 48zm.2 374.4c-91.9 0-166.4-74.5-166.4-166.4S164.1 89.6 256 89.6 422.4 164.1 422.4 256 347.9 422.4 256 422.4z"></path>
                    <path d="M266.4 152h-31.2v124.8l109.2 65.5 15.6-25.6-93.6-55.5V152z"></path>
                  </g>
                </svg>
              </div>
              Attachment
            </button>
            <button className="w-full flex items-center text-slate-800 bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="none"
                    stroke-width="2"
                    d="M22,12 C22,12 19.0000009,15.0000004 13.0000004,21.0000004 C6.99999996,27.0000004 -2.00000007,18.0000004 3.99999994,12.0000004 C9.99999996,6.00000037 9,7.00000011 13,3.00000008 C17,-0.999999955 23,4.99999994 19,9.00000005 C15,13.0000002 12.0000004,16.0000007 9.99999995,18.0000004 C7.99999952,20 5,17 6.99999995,15.0000004 C8.99999991,13.0000007 16,6 16,6"
                  ></path>
                </svg>
              </div>
              Cover
            </button>
            <button className="w-full flex items-center text-slate-800 bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H3V5h18v11z"></path>
                </svg>
              </div>
              Custom Fields
            </button>
          </div>
          <div className="flex flex-col gap-4 my-6">
            <div className="flex flex-col gap-2">
              <h5 className="text-[12px]">Power-Ups</h5>
              <button className="w-full flex items-center py-2 pl-4 gap-2 rounded text-sm  hover:bg-zinc-600 hover:text-white">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g fill="none">
                    <path d="M0 0h24v24H0V0z"></path>
                    <path d="M0 0h24v24H0V0z" opacity=".87"></path>
                  </g>
                  <path d="M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14a2 2 0 0 0-2-2zM11 16l4-4-4-4v3H1v2h10v3zM21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14a2 2 0 0 0-2-2zM11 16l4-4-4-4v3H1v2h10v3z"></path>
                </svg>
                Add Power-Ups
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="text-[12px]">Automation</h5>
              <button className="w-full flex items-center py-2 pl-4 gap-2 rounded text-sm  hover:bg-zinc-600 hover:text-white">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 512 512"
                  className="text-xl"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M416 277.333H277.333V416h-42.666V277.333H96v-42.666h138.667V96h42.666v138.667H416v42.666z"></path>
                </svg>
                Add Button
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-slate-800  max-md:flex-wrap max-md:flex-row">
            <button className="w-full flex items-center  bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 512 512"
                  className="text-xl"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M416 277.333H277.333V416h-42.666V277.333H96v-42.666h138.667V96h42.666v138.667H416v42.666z"></path>
                </svg>
              </div>
              Move
            </button>
            <button className="w-full flex items-center  bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 448 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
                </svg>
              </div>
              Copy
            </button>
            <button className="w-full flex items-center  bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fill="none" d="M0 0h24v24H0z"></path>
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
                </svg>
              </div>
              Mirror
            </button>
            <button className="w-full flex items-center  bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0 4.75C0 3.784.784 3 1.75 3h20.5c.966 0 1.75.784 1.75 1.75v14.5A1.75 1.75 0 0 1 22.25 21H1.75A1.75 1.75 0 0 1 0 19.25Zm1.75-.25a.25.25 0 0 0-.25.25v14.5c0 .138.112.25.25.25h20.5a.25.25 0 0 0 .25-.25V4.75a.25.25 0 0 0-.25-.25Z"></path>
                  <path d="M5 8.75A.75.75 0 0 1 5.75 8h11.5a.75.75 0 0 1 0 1.5H5.75A.75.75 0 0 1 5 8.75Zm0 4a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Z"></path>
                </svg>
              </div>
              Make Template
            </button>
            <div className="w-full h-px bg-zinc-600     max-md:w-[92%]"></div>
            <button className="w-full flex items-center  bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g fill="none">
                    <path d="M0 0h24v24H0V0z"></path>
                    <path d="M0 0h24v24H0V0z" opacity=".87"></path>
                  </g>
                  <path d="M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14a2 2 0 0 0-2-2zM11 16l4-4-4-4v3H1v2h10v3zM21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14a2 2 0 0 0-2-2zM11 16l4-4-4-4v3H1v2h10v3z"></path>
                </svg>
              </div>
              Archive
            </button>
            <button className="w-full flex items-center  bg-zinc-400 py-2 pl-4 gap-1 rounded text-sm  hover:bg-zinc-600 hover:text-white cursor-pointer       max-md:text-[13px] max-md:pl-3 max-md:pr-1 max-md:w-[48%]">
              <div className="text-base">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 512 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M460 120H52c-2.2 0-4-1.8-4-4V96c0-17.7 14.3-32 32-32h352c17.7 0 32 14.3 32 32v20c0 2.2-1.8 4-4 4zM440 146H72c-4.4 0-8 3.6-8 8v262c0 17.6 14.4 32 32 32h320c17.6 0 32-14.4 32-32V154c0-4.4-3.6-8-8-8zM306 288h-99.6c-7.1 0-13.4-5.2-14.3-12.3-1-8.5 5.6-15.7 13.9-15.7h99.6c7.1 0 13.4 5.2 14.3 12.3 1 8.4-5.6 15.7-13.9 15.7z"></path>
                </svg>
              </div>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DetailsModal;
