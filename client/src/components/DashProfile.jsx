import { Alert, Button, TextInput } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
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

export default function DashProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileProgress, setImageFileProgress] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(null);
  const [formData, setFormData] = useState({});
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
        return;
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, photo: downloadURL });
        });
      }
    );
  };
  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form className="flex flex-col gap-4">
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
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
        />
        <TextInput type="password" id="password" placeholder="password" />
        <Button type="submit" gradientDuoTone="purpleToBlue" outline>
          Update
        </Button>
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <span className="cursor-pointer">Delete Account</span>
        <span className="cursor-pointer">Sign Out</span>
      </div>
    </div>
  );
}
