import axios from "axios";
import { Alert, Button, Modal, Textarea } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Comment from "./Comment";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length === 0) {
      return setError("Comment cannot be empty");
    }
    if (comment.length > 200) {
      return setError("Comment cannot be more than 200 characters");
    }
    try {
      const res = await axios.post(
        "http://localhost:3000/api/comment/create",
        {
          content: comment,
          postId,
          userId: currentUser._id,
        },
        { withCredentials: true }
      );
      setComment("");
      setError(null);
      setComments([...comments, res.data]);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/comment/getPostComments/" + postId,
          { withCredentials: true }
        );
        const data = res.data;
        setComments(data);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchComments();
  }, [postId]);

  const handleLike = async (commentId) => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/comment/likeComment/" + commentId,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: data.likes,
                  numberOfLikes: data.likes.length,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (data) => {
    setComments(
      comments.map((comment) =>
        comment._id === data._id
          ? {
              ...comment,
              content: data.content,
            }
          : comment
      )
    );
  };

  const handleDelete = async () => {
    if (!currentUser) {
      navigate("/sign-in");
      return;
    }
    try {
      const res = await axios.delete(
        "http://localhost:3000/api/comment/deleteComment/" + commentToDelete,
        { withCredentials: true }
      );
      setComments(
        comments.filter((comment) => comment._id !== commentToDelete)
      );
    } catch (error) {
      console.log(error);
    }
    setShowModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-3">
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
          <p>Signed in as: </p>
          <img
            className="h-5 w-5 object-cover rounded-full"
            src={currentUser.photo}
            alt={currentUser.username}
          />
          <Link
            to={"/dashboard?tab=profile"}
            className="text-xs text-cyan-600 hover:underline"
          >
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className="text-sm text-teal-500 my-5 flex gap-1">
          You must sign in to comment.
          <Link className="text-blue-500 hover:underline" to={"/sign-in"}>
            Sign In
          </Link>
        </div>
      )}
      {currentUser && (
        <form
          onSubmit={handleSubmit}
          className="border border-teal-500 rounded-md p-3"
        >
          <Textarea
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            rows="3"
            maxLength="200"
            value={comment}
          />
          <div className="flex justify-between items-center mt-5">
            <p className="text-gray-500 text-xs">
              {200 - comment.length} characters remaining
            </p>
            <Button outline gradientDuoTone={"purpleToBlue"} type="submit">
              Submit
            </Button>
          </div>
          {error && (
            <Alert color={"failure"} className="mt-5">
              {error}
            </Alert>
          )}
        </form>
      )}
      {comments.length > 0 ? (
        <>
          <div className="text-sm my-5 flex items-center gap-1">
            <p>Comments</p>
            <div className="border border-gray-400 py-1 px-2 rounded-sm">
              <p>{comments.length}</p>
            </div>
          </div>
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onLike={handleLike}
              onSave={handleSave}
              onDelete={(commentId) => {
                setCommentToDelete(commentId);
                setShowModal(true);
              }}
            />
          ))}
        </>
      ) : (
        <p>No comments yet!</p>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size={"sm"}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this comment?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color={"failure"} onClick={handleDelete}>
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
