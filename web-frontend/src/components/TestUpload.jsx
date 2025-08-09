import { useState } from "react";
import { api } from "../services/api";
import { toast } from "react-hot-toast";

function TestUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("File selected:", file.name, file.size, file.type);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      console.log("Starting upload...");
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await api.upload.image(formData);
      console.log("Upload response:", response.data);
      setUploadResult(response.data);
      toast.success("Upload successful!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed");
    }
  };

  const handleUpdateUser = async () => {
    if (!uploadResult || !uploadResult.filename) {
      toast.error("No uploaded file to update");
      return;
    }

    try {
      console.log("Updating user with photo:", uploadResult.filename);
      await api.users.updateProfile("EMP1748058961530", {
        photo: uploadResult.filename,
      });
      toast.success("User updated with new photo!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update failed");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Test Upload & Update</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Image:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full p-2 border rounded"
          />
        </div>

        {selectedFile && (
          <div className="p-2 bg-gray-100 rounded">
            <p>
              <strong>File:</strong> {selectedFile.name}
            </p>
            <p>
              <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
            <p>
              <strong>Type:</strong> {selectedFile.type}
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
        >
          Upload Image
        </button>

        {uploadResult && (
          <div className="p-2 bg-green-100 rounded">
            <p>
              <strong>Uploaded:</strong> {uploadResult.filename}
            </p>
            <p>
              <strong>URL:</strong> {uploadResult.url}
            </p>
          </div>
        )}

        <button
          onClick={handleUpdateUser}
          disabled={!uploadResult}
          className="w-full bg-green-500 text-white p-2 rounded disabled:bg-gray-300"
        >
          Update User Photo
        </button>
      </div>
    </div>
  );
}

export default TestUpload;
