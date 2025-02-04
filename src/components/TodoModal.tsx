import { useState, ChangeEvent, FormEvent } from "react"
import ShowToast from "./ShowToast";

interface BeautifulModalProps {
  openModal: () => void;
  closeModal: () => void;
  isOpen: boolean;
  addTodoCard: (inputValue: string) => void;
}

export default function BeautifulModal({ closeModal, isOpen, addTodoCard }: BeautifulModalProps) {
  const [inputValue, setInputValue] = useState<string>("") // State to store the input value

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value) // Update input value
  }

  const handleAdd = (e: FormEvent) => {
    e.preventDefault(); // Prevent the default form submission
    if (inputValue.trim() === "") {
      ShowToast({
        message: "Please enter a Value",
        type: "warning",
      });
    } else {
      addTodoCard(inputValue)
      setInputValue("")
    }
  }

  return (
    <>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Modal Container with Animation */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transform scale-95 transition-all duration-300 ease-in-out animate-modal">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Add Todo</h2>
              <button
                onClick={closeModal}
                className="cursor-pointer text-gray-600 hover:text-gray-800 transition duration-150 ease-in-out"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <form onSubmit={handleAdd}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Enter todo name"
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-150 ease-in-out"
                />
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={handleAdd}
                className="cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


