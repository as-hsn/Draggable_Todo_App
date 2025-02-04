import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { IoEyeOffOutline } from "react-icons/io5";
import validator from "validator";
import { NavLink, useNavigate } from "react-router-dom";
import ShowToast from "../components/ShowToast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../components/firebase";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function Login() {
  const [state, setState] = useState("Login");
  const [name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(<IoEyeOffOutline size={16} />);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    name: Yup.string().when('state', {
      is: 'Sign Up',
      then: Yup.string().required('Full name is required'),
    }),
  });

  

  const handleOnSubmit = async (values) => {
    console.log("Form submitted with values:", values);

    if (state === "Login") {
      if (!values.email || !values.password) {
        
        return ShowToast({
          message: "Please fill in all fields",
          type: "error",
        });
      }
    }

    if (state === "Sign Up" && (!values.email || !values.password || !values.name)) {
      return ShowToast({
        message: "Please fill in all fields",
        type: "error",
      });
    }

    // Removed the backend logic

    if (state === "Login") {
      try {
        setLoading(true);
        await signInWithEmailAndPassword(auth, values.email, values.password);
        ShowToast({
          message: "Logged in Successful",
          type: "success",
        });
        navigate("/");
      } catch (error) {
        const firebaseError = error as { code: string; message: string };
        if (firebaseError.code === "auth/invalid-credential") {
          ShowToast({
            message: "Email or password is incorrect",
            type: "error",
          });
        } else {
          ShowToast({
            message: "An error occurred. Please try again.",
            type: "error",
          });
        }
        console.log("Firebase Error:", firebaseError.message);
      } finally {
        setLoading(false);
      }
    }
  };



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
      initialValues={{ email, password, name }}
      validationSchema={validationSchema}
      onSubmit={handleOnSubmit}
    >
      {({ values, handleChange, handleBlur, errors, touched }) => (
        <Form className="min-h-[80vh] mt-20 flex items-center">
          <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg mt-14">
            <p className="text-2xl font-semibold">
              {state === "Sign Up" ? "Create Account" : "Login"}
            </p>

            <p>
              Please {state === "Sign Up" ? "sign up" : "login"} to book an
              appointment
            </p>

            {state === "Sign Up" && (
              <div className="w-full">
                <p>Full Name</p>
                <Field
                  name="name"
                  type="text"
                  className="border border-[#DADADA] rounded w-full p-2 mt-1"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>
            )}

            <div className="w-full">
              <p>Email</p>
              <Field
                name="email"
                type="email"
                className="border border-[#DADADA] rounded w-full p-2 mt-1"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
              />
              <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="w-full relative">
              <p>Password</p>
              <Field
                name="password"
                type={type}
                className="border border-[#DADADA] rounded w-full p-2 mt-1 pr-10"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.password}
              />
              <span
                className="absolute right-3 eye-icon text-cyan-600 transform -translate-y-1/2 cursor-pointer mt-[1.5rem]"
                onClick={handleToggle}
              >
                {icon}
              </span>
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
            </div>

            <button
              type="submit"
              className={`bg-indigo-500 flex justify-center text-white w-full py-2 my-2 rounded-md text-base ${loading && 'pointer-events-none'}`}
            >
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
                Already have an account?{" "}
                <NavLink to="/login" className="text-primary underline cursor-pointer">
                  Login here
                </NavLink>
              </p>
            ) : (
              <p>
                Create a new account?{" "}
                <NavLink to="/register" className="text-indigo-500 underline cursor-pointer">
                  Click here
                </NavLink>
              </p>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default Login;