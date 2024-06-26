"use client";
import React, { useState } from "react";
import { FirebaseError } from "firebase/app";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../../../lib/firebaseConfig";
import { poppins } from "../../../lib/fonts";
import { useRouter } from "next/navigation";
import Interests from "../../interests/page";

function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conpassword, setConPassword] = useState("");
  const [error, setError] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [firsttry, setfirsttry] = useState(true);
  const [next, setNext] = useState(false);
  const [firebaseError, setfirebaseError] = useState("");
  const [userId, setUserId] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setfirsttry(false);
    const emailValue = email;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@mbcet.ac.in$/;
    const validEmail = emailRegex.test(emailValue);
    console.log(validEmail);
    setIsValidEmail(validEmail);
    if (isValidEmail) {
      const extractedName = email.split("@")[0].split(".")[0];
      const capitalizedExtractedName =
        extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
      setName(capitalizedExtractedName);

      const userIdMatch = email.match(/\.(.*?)@/);
      if (userIdMatch) {
        setUserId(userIdMatch[1]);
      }

      setNext(true);
    }
  };

  const handleSignup = async () => {
    setError(false);
    setfirebaseError("");
    if (password != conpassword) {
      setError(true);
    } else {
      if (isValidEmail) {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = userCredential.user;

          // Send email verification
          await sendEmailVerification(user);
          setVerificationSent(true);

          await addData(name, user.uid);
          addCookie(user.uid);

          // Instead of redirecting, we'll show a message to check email
          // router.push("/interests");
        } catch (error) {
          const firebaseError = error as FirebaseError;
          const errorMessage = firebaseError.message;
          const match = errorMessage.match(/\(([^)]+)\)/);
          if (match) {
            setfirebaseError(match[1]);
            console.log(match[1]);
          } else {
            console.log("Error message format not recognized");
            alert("Sorry Database limit reached , pls send moni developers to buy a better plan.");
          }
        }
      }
    }
  };

  const addData = async (name: string, id: string) => {
    try {
      const userRef = doc(db, "users", id);
      await setDoc(userRef, {
        name,
        userId,
        Interests:[""],
        friends: [""], // Initialize empty friends array
        emailVerified: false // Add this field to track email verification status
      });
      console.log("User data written with ID: ", userRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const addCookie = (id: string) => {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    document.cookie = `userId=${id}; expires=${expires.toUTCString()}`;
  };

  return (
    <main className="flex h-full min-h-screen w-full flex-col items-center justify-center bg-[#ebebeb] ">
      {!next && (
        <div className="flex h-[600px] w-[500px] flex-col justify-between rounded-sm bg-white  p-10 shadow-md">
          <div className="w-full">
            <h1 className={` ${poppins.className}  pt-5 text-5xl`}>Sign Up</h1>
            {!isValidEmail && !firsttry && (
              <h2
                className={`${poppins.className} pt-4  text-xl  tracking-tighter text-red-500`}
              >
                Use valid college email id.
              </h2>
            )}
            <h2 className={`${poppins.className} py-4 pt-8 text-xl  tracking-tighter`}>
              Your email address
            </h2>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mx-auto w-[90%] rounded-xl border-2 border-transparent bg-[#f0f6ff] p-3 text-xl text-black transition-all focus:border-primary focus:outline-none"
              placeholder="johndoe@mbcet.ac.in"
            />

            <button
              onClick={() => handleSubmit()}
              className={`${poppins.className} my-4 w-fit rounded-3xl bg-blue-600 px-4  py-2 text-xl tracking-tighter text-white transition-all hover:bg-[#2727b6] hover:px-5`}
            >
              Sign Up -&gt;
            </button>
          </div>
          <div>
            By continuing, you agree to our terms and conditions and privacy policy.{" "}
            <br />
            <button
              onClick={() => router.push("/login")}
              className={`${poppins.className} w-full p-2 text-center text-xl  text-gray-600 underline hover:text-primary`}
            >
              Sign In Instead
            </button>
          </div>
        </div>
      )}
      {next && !verificationSent && (
        <div className="flex h-[600px] w-[400px] flex-col justify-between rounded-3xl bg-white  p-10 shadow-md">
          <div className="">
            <h1 className={` ${poppins.className}  pt-5 text-5xl`}>Hello ,</h1>
            <h1 className={` ${poppins.className}  pt-5 text-3xl`}>{name}</h1>
            {error && !firebaseError && (
              <h2
                className={`${poppins.className} pt-2  text-xl  tracking-tighter text-red-500`}
              >
                Passwords don&apos;t Match
              </h2>
            )}
            {firebaseError && (
              <h2
                className={`${poppins.className} pt-2  text-xl  tracking-tighter text-red-500`}
              >
                {firebaseError}
              </h2>
            )}
            <h2 className={`${poppins.className} py-4 pt-8 text-xl  tracking-tighter`}>
              Password
            </h2>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-2 border-transparent  bg-[#f0f6ff] p-3 text-xl text-black transition-all focus:border-primary focus:outline-none"
              placeholder=""
            />
            <h2 className={`${poppins.className} py-4 pt-8 text-xl  tracking-tighter`}>
              Confirm Password
            </h2>
            <input
              id="conpassword"
              name="conpassword"
              type="password"
              autoComplete="conpassword"
              required
              value={conpassword}
              onChange={(e) => setConPassword(e.target.value)}
              className="rounded-xl border-2 border-transparent  bg-[#f0f6ff] p-3 text-xl text-black transition-all focus:border-primary focus:outline-none"
              placeholder=""
            />

            <button
              onClick={() => handleSignup()}
              className={`${poppins.className} my-2 mt-6  w-fit rounded-3xl bg-[#2727e6] px-4  py-2 text-xl tracking-tighter text-white transition-all hover:bg-[#2727b6] hover:px-5 `}
            >
              Confirm
            </button>
          </div>
          <button
            onClick={() => setNext(false)}
            className={`${poppins.className} text-xl text-gray-600 underline hover:text-primary `}
          >
            Go Back
          </button>
        </div>
      )}
      {verificationSent && (
        <div className="flex h-[300px] w-[400px] flex-col items-center justify-center rounded-3xl bg-white p-10 shadow-md">
          <h1 className={`${poppins.className} mb-4 text-center text-3xl`}>
            Verification Email Sent
          </h1>
          <p className={`${poppins.className} mb-6 text-center text-xl`}>
            Please check your email and click on the verification link to complete your
            registration.
          </p>
          <button
            onClick={() => router.push("/login")}
            className={`${poppins.className} w-fit rounded-3xl bg-blue-600 px-4 py-2 text-xl tracking-tighter text-white transition-all hover:bg-[#2727b6] hover:px-5`}
          >
            Go to Login
          </button>
        </div>
      )}
    </main>
  );
}

export default Page;
