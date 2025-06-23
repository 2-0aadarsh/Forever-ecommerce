/* eslint-disable react/prop-types */
import { useState } from "react";
import axios from "axios";
import { FiX, FiUpload, FiFile, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";

const FileUploadModal = ({
  show,
  onClose,
  title = "Upload File",
  endpoint,
  acceptedTypes = ".zip,.json",
  maxSize = 10, // in MB
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const validateFile = (selectedFile) => {
    // Check file type
    const fileType = selectedFile.name.split(".").pop().toLowerCase();
    const allowedTypes = acceptedTypes.replace(/\./g, "").split(",");

    if (!allowedTypes.includes(fileType)) {
      toast.error(`Invalid file type. Allowed types: ${acceptedTypes}`);
      return;
    }

    // Check file size (in MB)
    if (selectedFile.size > maxSize * 1024 * 1024) {
      toast.error(`File too large. Maximum size: ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setUploadProgress(0);
    setUploadComplete(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setUploadComplete(true);
      toast.success("File uploaded successfully!");
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              onDragEnter={handleDrag}
              className="mt-4"
            >
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300"
                } transition-colors duration-200`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  {uploadComplete ? (
                    <div className="flex flex-col items-center">
                      <FiCheckCircle className="h-12 w-12 text-green-500 mb-2" />
                      <p className="text-sm text-gray-600">Upload complete!</p>
                    </div>
                  ) : file ? (
                    <div className="flex flex-col items-center">
                      <FiFile className="h-12 w-12 text-indigo-500 mb-2" />
                      <p className="text-sm text-gray-900 font-medium truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                        >
                          <span>Select a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleChange}
                            accept={acceptedTypes}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {acceptedTypes} up to {maxSize}MB
                      </p>
                    </>
                  )}

                  {/* Progress bar */}
                  {loading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
