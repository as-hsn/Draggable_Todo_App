import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { IoEyeOffOutline } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";
import ShowToast from "../components/ShowToast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../components/firebase";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

interface FormValues {
  email: string;
  password: string;
  name?: string;
}

function Login() {
  const [state, setState] = useState<"Login" | "Sign Up">("Login");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(<IoEyeOffOutline size={16} />);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
    name: Yup.string().when([], {
      is: () => state === "Sign Up",
      then: (schema) => schema.required("Full name is required"),
    }),
  });

  const handleOnSubmit = async (values: FormValues) => {
    console.log("Form submitted with values:", values);
    setLoading(true);
    
    if (state === "Login") {
      try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        ShowToast({ message: "Logged in Successfully", type: "success" });
        navigate("/");
      } catch (error: any) {
        if (error.code === "auth/invalid-credential") {
          ShowToast({ message: "Email or password is incorrect", type: "error" });
        } else {
          ShowToast({ message: "An error occurred. Please try again.", type: "error" });
        }
        console.error("Firebase Error:", error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Toggle password visibility
  const handleToggle = () => {
    if (type === "password") {
      setIcon(<FaRegEye size={16} />);
      setType("text");
    } else {
      setIcon(<IoEyeOffOutline size={16} />);
      setType("password");
    }
  };

  return (
    <Formik
      initialValues={{ email: "", password: "", name: "" }}
      validationSchema={validationSchema}
      onSubmit={handleOnSubmit}
    >
      {({}) => (
        <Form className="min-h-[80vh] mt-20 flex items-center">
          <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg mt-14">
            <p className="text-2xl font-semibold">{state === "Sign Up" ? "Create Account" : "Login"}</p>
            <p>Please {state === "Sign Up" ? "sign up" : "login"} to book an appointment</p>

            {state === "Sign Up" && (
              <div className="w-full">
                <p>Full Name</p>
                <Field name="name" type="text" className="border border-[#DADADA] rounded w-full p-2 mt-1" />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>
            )}

            <div className="w-full">
              <p>Email</p>
              <Field name="email" type="email" className="border border-[#DADADA] rounded w-full p-2 mt-1" />
              <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="w-full relative">
              <p>Password</p>
              <Field name="password" type={type} className="border border-[#DADADA] rounded w-full p-2 mt-1 pr-10" />
              <span className="absolute right-3 eye-icon text-cyan-600 transform -translate-y-1/2 cursor-pointer mt-[1.5rem]" onClick={handleToggle}>
                {icon}
              </span>
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
            </div>

            <button type="submit" className={`bg-indigo-500 flex justify-center text-white w-full py-2 my-2 rounded-md text-base ${loading && "pointer-events-none"}`}>
              {loading ? (
                <>
                  <span className="mr-2">Verification in Progress...</span>
                  <div className="loader"></div>
                </>
              ) : (
                state === "Sign Up" ? "Create Account" : "Login"
              )}
            </button>

            {state === "Sign Up" ? (
              <p>
                Already have an account? <NavLink to="/login" className="text-primary underline cursor-pointer">Login here</NavLink>
              </p>
            ) : (
              <p>
                Create a new account? <NavLink to="/register" className="text-indigo-500 underline cursor-pointer">Click here</NavLink>
              </p>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default Login;