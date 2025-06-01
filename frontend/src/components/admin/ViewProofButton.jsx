import { useState } from "react";
import api from "../../services/api"; // Adjust the import path to match your project structure

const ViewProofButton = ({ transaction }) => {
  const [isLoading, setIsLoading] = useState(false);

  const downloadProof = async () => {
    try {
      setIsLoading(true);

      // Extract filename from path
      const fileName = transaction.proofOfTransaction.split("/").pop();

      const response = await api({
        url: `/transactions/${transaction._id}/download-proof`,
        method: "GET",
        responseType: "blob", // Important for binary data
      });

      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download the proof. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={downloadProof}
      disabled={isLoading}
      className="text-blue-600 hover:text-blue-900 focus:outline-none"
    >
      {isLoading ? "Downloading..." : "View Proof"}
    </button>
  );
};

export default ViewProofButton;
