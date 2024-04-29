import { Alert, Button, Modal, TextInput } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

export default function DashProfile() {
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileProgress, setImageFileProgress] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [updateUserError, setUpdateUserError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileProgress(Math.round(progress));
      },
      (error) => {
        setFileUploadError("Not able to upload the image");
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileProgress(null);
        setImageFileUploading(false);
        return;
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, photo: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      // const res = await fetch(
      //   "http://localhost:3000/api/user/update/662e7c8985035b15d001ae19",
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(formData),
      //   },
      //   { credentials: "include" }
      // );
      // const data = await res.json();
      // console.log(data);
      const response = await axios.put(
        "http://localhost:3000/api/user/update/" + currentUser._id,
        formData,
        { withCredentials: true }
      );
      const data = await response.data;
      dispatch(updateUserSuccess(data));
    } catch (error) {
      setUpdateUserError(error.message);
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await axios.delete(
        "http://localhost:3000/api/user/delete/" + currentUser._id,
        { withCredentials: true }
      );
      dispatch(deleteUserSuccess());
      navigate("/sign-in");
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileRef}
          hidden
        />
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => fileRef.current.click()}
        >
          {/* {imageFileProgress && (
            <CircularProgressbar
              value={imageFileProgress || 0}
              text={`${imageFileProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  //   width: "100%",
                  //   height: "100%",
                  //   position: "absolute",
                  top: "-1000px",
                  //   left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${imageFileProgress / 100})`,
                },
              }}
            />
          )} */}
          <img
            src={imageFileUrl || currentUser.photo}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
              imageFileProgress && imageFileProgress < 100 && "opacity-60"
            }`}
          />
        </div>
        {imageFileProgress > 0 && imageFileProgress < 100 ? (
          <p className="text-center text-green-700">
            Uploading: {imageFileProgress}%
          </p>
        ) : fileUploadError ? (
          //   <p className="text-center text-red-700">
          //     Error while uploading image
          //   </p>
          <p></p>
        ) : imageFileProgress === 100 ? (
          <p className="text-center text-green-700">Uploaded</p>
        ) : (
          ""
        )}
        {fileUploadError && <Alert color="failure">{fileUploadError}</Alert>}
        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <TextInput
          type="password"
          id="password"
          placeholder="password"
          onChange={handleChange}
        />
        <Button
          type="submit"
          gradientDuoTone="purpleToBlue"
          outline
          disabled={loading || imageFileUploading}
        >
          {loading ? "Updating..." : "Update"}
        </Button>
      </form>
      {updateUserError && (
        <Alert className="mt-5" color="failure">
          Error occured while updating profile
        </Alert>
      )}
      <div className="text-red-500 flex justify-between mt-5">
        <span onClick={() => setShowModal(true)} className="cursor-pointer">
          Delete Account
        </span>
        <span className="cursor-pointer">Sign Out</span>
      </div>
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size={"md"}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete your account?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color={"failure"} onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color={"gray"} onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
