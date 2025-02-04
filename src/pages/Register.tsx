import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { IoEyeOffOutline } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";
import ShowToast from "../components/ShowToast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../components/firebase";
import { setDoc, doc } from "firebase/firestore";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function Register() {
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(<IoEyeOffOutline size={16} />);
  const navigate = useNavigate();

  // Validation Schema create and using this in Yup
  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    name: Yup.string().min(3, 'Name must be at least 3 characters').max(25, 'Name cannot be longer than 20 characters').required('Full name is required'),
  });

  
  // Handle form submission
  const handleOnSubmit = async (values, { setSubmitting }) => {
    const { email, password, name } = values;
    try {
      setSubmitting(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user);

      if (user) {
        // Save user to Firestore
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          name: name,
        });
        ShowToast({
          message: "Registration successful! You're now logged in.",
          type: "success",
        });
        navigate("/");
      }
    } catch (error) {
      const firebaseError = error as { code: string; message: string };
      if (firebaseError.code === "auth/email-already-in-use") {
        ShowToast({
          message: "This email is already in use. Please log in.",
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
      setSubmitting(false);
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
      initialValues={{ email: '', password: '', name: '' }}
      validationSchema={validationSchema}
      onSubmit={handleOnSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="min-h-[80vh] mt-8 flex items-center">
          <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg mt-14">
            <p className="text-2xl font-semibold">Create Account</p>
            <p>Please sign up to book an appointment</p>

            <div className="w-full">
              <p>Full Name</p>
              <Field
                name="name"
                type="text"
                className="border border-[#DADADA] rounded w-full p-2 mt-1"
              />
              <ErrorMessage name="name" component="div" className="text-red-500 text-xs" />
            </div>

            <div className="w-full">
              <p>Email</p>
              <Field
                name="email"
                type="email"
                className="border border-[#DADADA] rounded w-full p-2 mt-1"
              />
              <ErrorMessage name="email" component="div" className="text-red-500 text-xs" />
            </div>

            <div className="w-full relative">
              <p>Password</p>
              <Field
                name="password"
                type={type}
                className="border border-[#DADADA] rounded w-full p-2 mt-1 pr-10"
              />
              <span
                className="absolute right-3 eye-icon text-cyan-600 transform -translate-y-1/2 cursor-pointer mt-[1.5rem]"
                onClick={handleToggle}
              >
                {icon}
              </span>
              <ErrorMessage name="password" component="div" className="text-red-500 text-xs" />
            </div>

            <button
              type="submit"
              className={`bg-indigo-500 flex justify-center text-white w-full py-2 my-2 rounded-md text-base ${isSubmitting && 'pointer-events-none'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Verification in Progress...</span>
                  <div className="loader"></div>
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <p>
              Already have an account?{" "}
              <NavLink to="/login" className="text-indigo-500 underline cursor-pointer">
                Login here
              </NavLink>
            </p>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default Register;