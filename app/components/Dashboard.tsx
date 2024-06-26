import Image from "next/image";
import React, { useState, useEffect } from "react";
import { jakartasmall } from "../utils/fonts";
import { RiArrowRightCircleFill, RiAddLine } from "react-icons/ri";
import CommunityBox from "./ui/CommunityBox";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";

import Link from "next/link";
import CreateJoinCommunityModal from "./ui/CreateCommunityModal";

interface User {
  name: string;
  friends: string[];
  userId: string;
  id: string;
  interests: string[];
  currentUserId: string;
}

interface Community {
  id: string;
  name: string;
  creator: string;
  members: string[];
  tags: string[];
}

function Dashboard({
  user,
  currentView,
  setCurrentView,
  state,
  setstate,
  currentUserId,
  ifUnread
}: {
  user: User;
  currentView: string;
  setCurrentView: (view: string) => void;
  state: boolean;
  setstate: (view: boolean) => void;
  currentUserId: string;
  ifUnread: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserCommunities();
    }
  }, [user, currentView]);

  const fetchUserCommunities = async () => {
    if (!user) return;

    const communitiesRef = collection(db, "communities");
    const q = query(communitiesRef, where("members", "array-contains", user.name));
    const querySnapshot = await getDocs(q);
    const userCommunities = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Community[];
    setCommunities(userCommunities);
  };

  const toggleFriendsView = () => {
    setCurrentView(currentView === "Friends" ? "Explore" : "Friends");
  };

  const [imageSrc, setImageSrc] = useState(
    currentUserId
      ? `https://firebasestorage.googleapis.com/v0/b/dosth-ac312.appspot.com/o/profilePics%2F${currentUserId}?alt=media&token=45a57484-33d7-46f0-972d-456a56bb7084`
      : "/logo.png"
  );
  const handleImageError = () => {
    setImageSrc("/logo.png");
  };
  return (
    <div className={`${jakartasmall.className} w-[26vw] px-5`}>
      <div className="flex w-full items-start justify-between">
        <nav className="flex flex-col items-start justify-start gap-4 py-5 text-start text-base">
          <Link
            href="#"
            onClick={() => setCurrentView("Explore")}
            className={currentView === "Explore" ? "text-blue-600" : ""}
          >
            Home
          </Link>
          <Link
            href="#"
            onClick={() => setCurrentView("Profile")}
            className={currentView === "Profile" ? "text-blue-600" : ""}
          >
            Profile
          </Link>
          <Link
            href="#"
            onClick={() => setCurrentView("Chat")}
            className={currentView === "Chat" ? "text-blue-600" : ""}
          >
            Chat {ifUnread && <span className="text-red-500">!</span>}
          </Link>
          <Link
            href="#"
            onClick={() => setCurrentView("Communities")}
            className={currentView === "Communities" ? "text-blue-600" : ""}
          >
            Communities
          </Link>
          <Link
            href="#"
            onClick={() => setCurrentView("Projects")}
            className={currentView === "Projects" ? "text-blue-600" : ""}
          >
            Projects
          </Link>
        </nav>
        <div className="flex h-52 w-52 flex-col items-center justify-center gap-4 rounded-lg bg-gray-100 p-2">
          <Image
            src={imageSrc}
            alt={currentUserId ? "User profile" : "Default logo"}
            width={100}
            height={100}
            className="m-1 w-3/5 rounded-2xl object-fill"
            onError={handleImageError}
          />
          <h1 className="text-xl">{user?.name || "Username"}</h1>
        </div>
      </div>
      <div className="flex w-full items-center justify-between py-5">
        <div className="flex flex-col items-center justify-center gap-0 leading-none">
          <h1 className="w-full text-start text-2xl text-blue-600">
            {user?.friends?.length - 1 || 0}
          </h1>
          <h2 className="text-lg text-gray-500">Friends</h2>
        </div>
        <button
          onClick={toggleFriendsView}
          className="flex h-fit w-[200px] items-center justify-between bg-blue-500 px-4 py-2 text-start text-base text-white transition-colors hover:bg-blue-600"
        >
          {currentView === "Friends" ? "Back to Home" : "See Friends"}{" "}
          <RiArrowRightCircleFill />
        </button>
      </div>
      <div className="my-5 w-full gap-4 rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">My Communities</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center rounded bg-blue-500 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-600"
          >
            <RiAddLine className="mr-1" /> Create or Join
          </button>
        </div>
        <div className="flex flex-wrap gap-2 overflow-auto py-4">
          {communities.map((community) => (
            <CommunityBox key={community.id} community={community} />
          ))}
        </div>
      </div>
      <div className="mt-5 w-full gap-4 rounded-lg bg-white p-4 shadow">
        <h1 className="mb-4 text-lg font-semibold">MyProjects</h1>
        <div className="flex flex-wrap gap-2 py-4">
          <CommunityBox />
          <CommunityBox />
          <CommunityBox />
        </div>
      </div>
      {showModal && (
        <CreateJoinCommunityModal
          onClose={() => setShowModal(false)}
          onCreateOrJoin={fetchUserCommunities}
          user={user}
          state={state}
          setstate={setstate}
          currentUserId={currentUserId}
          privateCommunity={false}
        />
      )}
    </div>
  );
}

export default Dashboard;
