import { useState, useRef, useEffect } from "react"
import PlusIcon from "../icons/PlusIcon"
import { FcAddDatabase } from "react-icons/fc"

export default function ResponsiveHeader({
  columns = [],
  selectedTodoId,
  setSelectedTodoId,
  newListName,
  setNewListName,
  addTask,
  userName,
  handleLogout,
  setIsModalOpen,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 300) // 300ms delay before closing
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="sticky top-0 z-50 w-full">
      <div className="bg-white shadow-md">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open menu</span>
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <select
                value={selectedTodoId}
                onChange={(e) => setSelectedTodoId(e.target.value)}
                className="cursor-pointer truncate max-w-[9rem] text-black border-2 border-black px-4 py-2 rounded-lg"
              >
                <option value="" disabled>
                  Select List
                </option>
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title.length > 16 ? `${col.title.substring(0, 14)}...` : col.title}
                  </option>
                ))}
              </select>

<form onSubmit={(e) => {e.preventDefault(); addTask(selectedTodoId, newListName)}}>
  <div className="flex gap-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter task"
                  className="text-black bg-zinc-100/50 border-2 border-indigo-400 px-3 py-2 rounded-lg w-48"
                />
                <button
                  className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-400"
                >
                  <PlusIcon />
                </button>
              </div>
</form>
              

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-zinc-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-zinc-800"
              >
                <FcAddDatabase className="text-xl" />
                Add Todo List
              </button>
            </div>

            {/* User Profile Section */}
            <div
              className="relative flex flex-col items-center right-6"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <p className="text-black capitalize text-base truncate max-w-[100px] flex items-center">
                  {userName}
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </p>
              </div>

              {isOpen && (
                <div className="absolute top-5 -right-8 w-24 bg-stone-100 rounded-lg shadow-lg p-2 text-sm sm:w-32 sm:p-4 sm:text-base sm:-right-10">
                <p className="hover:text-indigo-500 text-black cursor-pointer" onClick={handleLogout}>
                  Logout
                </p>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <select
              value={selectedTodoId}
              onChange={(e) => setSelectedTodoId(e.target.value)}
              className="cursor-pointer truncate w-full text-black border-2 border-black px-4 py-2 rounded-lg mb-2"
            >
              <option value="" disabled>
                Select List
              </option>
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title.length > 16 ? `${col.title.substring(0, 14)}...` : col.title}
                </option>
              ))}
            </select>

            <form  onSubmit={(e) => { e.preventDefault(); addTask(selectedTodoId, newListName); }}>
  <div className="flex gap-2 mb-2">
    <input
      type="text"
      value={newListName}
      onChange={(e) => setNewListName(e.target.value)}
      placeholder="Enter task"
      className="text-black bg-zinc-100/50 border-2 border-indigo-400 px-3 py-2 rounded-lg flex-grow"
    />
    <button
      type="submit"
      className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-400"
    >
      <PlusIcon />
    </button>
  </div>
</form>
              
            

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-zinc-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-800"
            >
              <FcAddDatabase className="text-xl" />
              Add Todo List
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}