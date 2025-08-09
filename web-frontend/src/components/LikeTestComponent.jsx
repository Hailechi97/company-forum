import { useState } from "react";
import { api } from "../services/api";
import toast from "react-hot-toast";

function LikeTestComponent({ postId = 41 }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testLike = async () => {
    setLoading(true);
    try {
      console.log("Testing like API...");
      console.log("Token:", localStorage.getItem("auth_token"));

      const response = await api.posts.like(postId, { isLike: true });
      console.log("Like response:", response);

      setResult(response.data);
      toast.success("Like thành công!");
    } catch (error) {
      console.error("Like error:", error);
      setResult({ error: error.message });
      toast.error("Like thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const testDislike = async () => {
    setLoading(true);
    try {
      console.log("Testing dislike API...");

      const response = await api.posts.like(postId, { isLike: false });
      console.log("Dislike response:", response);

      setResult(response.data);
      toast.success("Dislike thành công!");
    } catch (error) {
      console.error("Dislike error:", error);
      setResult({ error: error.message });
      toast.error("Dislike thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="text-lg font-semibold mb-4">
        Like/Dislike Test for Post {postId}
      </h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={testLike}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Like"}
        </button>

        <button
          onClick={testDislike}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Dislike"}
        </button>
      </div>

      {result && (
        <div className="p-3 bg-gray-100 rounded">
          <h4 className="font-medium mb-2">Result:</h4>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default LikeTestComponent;
