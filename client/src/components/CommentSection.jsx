import axios from "axios";
import { Alert, Button, Textarea } from "flowbite-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length === 0) {
      return setError("Comment cannot be empty");
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
    </div>
  );
}
