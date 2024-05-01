import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function UpdatePost() {
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [updating, setUpdating] = useState(false);
  const { postId } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/post/getPosts?postId=${postId}`
        );
        setFormData(res.data.posts[0]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPost();
  }, [postId]);

  const uploadImage = async () => {
    if (!imageFile) {
      setImageUploadError("Select at least one image to upload");
      return;
    }
    try {
      setImageUploading(true);
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + imageFile.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(Math.round(progress));
        },
        (error) => {
          setImageUploadError("Not able to upload image");
          setImageUploadProgress(null);
          setImageUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFormData({ ...formData, image: downloadURL });
            setImageUploadError(false);
            setImageUploading(false);
          });
        }
      );
    } catch (error) {
      setImageUploadError("Failed to upload image");
      setImageUploadProgress(null);
      setImageUploading(false);
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // try {
    //   setPublishError(null);
    //   const res = await axios.post(
    //     "http://localhost:3000/api/post/create",
    //     formData,
    //     { withCredentials: true }
    //   );
    //   const data = await res.data;
    //   navigate(`/post/${data.slug}`);
    // } catch (error) {
    //   setPublishError("Could not create post");
    //   console.log(error);
    // }
    try {
      setUpdating(true);
      setPublishError(null);
      const res = await axios.put(
        `http://localhost:3000/api/post/updatepost/${postId}/${currentUser._id}`,
        formData,
        { withCredentials: true }
      );
      const data = await res.data;
      setFormData({ ...formData, data });
      setUpdating(false);
    } catch (error) {
      setUpdating(false);
      setPublishError("Could not update post");
      console.log(error);
    }
  };
  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            value={formData.title}
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="uncategorized">Select a category</option>
            <option value="tech">Technology</option>
            <option value="fashion">Fashion</option>
            <option value="travel">Travel</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={uploadImage}
            disabled={imageUploading}
          >
            {imageUploading ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress}%`}
                />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        {imageUploadError && (
          <Alert color={"failure"}>{imageUploadError}</Alert>
        )}
        {formData.image && (
          <img
            src={formData.image}
            alt="cover_image"
            className="w-full h-72 object-cover"
          />
        )}
        <ReactQuill
          value={formData.content}
          theme="snow"
          placeholder="Writing area..."
          className="h-72 mb-12"
          required
          onChange={(e) => setFormData({ ...formData, content: e })}
        />
        <Button
          type="submit"
          gradientDuoTone={"purpleToPink"}
          disabled={
            imageUploading || updating || !formData.title || !formData.content
          }
        >
          Update
        </Button>
      </form>
      {publishError && <Alert color={"failure"}>{publishError}</Alert>}
    </div>
  );
}
