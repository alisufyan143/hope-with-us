import { useState } from "react";
import api from "../../services/api";
// Modal component for displaying case study details
const CaseStudyModal = ({ isOpen, onClose, study }) => {
  if (!isOpen || !study) return null;
  const downloadFile = async (studyId, docId, fileName) => {
    try {
      const response = await api({
        url: `case-studies/download/${studyId}/${docId}`,
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
      alert("Failed to download the file. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{study.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Case study details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Description</h3>
            <p className="text-gray-600">{study.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Financial Need
              </h3>
              <p className="text-gray-600">
                ${study.financialNeed.toLocaleString()}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700">Status</h3>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  study.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : study.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
              </span>
            </div>
          </div>

          {study.medicalCondition && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Medical Condition
              </h3>
              <p className="text-gray-600">{study.medicalCondition}</p>
            </div>
          )}

          {study.otherDetails && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Other Details
              </h3>
              <p className="text-gray-600">{study.otherDetails}</p>
            </div>
          )}

          {study.adminNotes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Admin Notes
              </h3>
              <p className="text-gray-600">{study.adminNotes}</p>
            </div>
          )}

          {/* Supporting Documents */}
          {study.supportingDocuments &&
            study.supportingDocuments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Supporting Documents
                </h3>
                <ul className="divide-y divide-gray-200">
                  {study.supportingDocuments.map((doc) => (
                    <li key={doc._id} className="py-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-gray-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-gray-600">{doc.name}</span>
                        </div>
                        <button
                          onClick={() =>
                            downloadFile(study._id, doc._id, doc.name)
                          }
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Uploaded:{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <div className="text-sm text-gray-500">
            <div>Created: {new Date(study.createdAt).toLocaleString()}</div>
            <div>
              Last Updated: {new Date(study.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Updated button component with modal integration
const ViewDetailsButton = ({ study }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-green-600 hover:text-green-900 mr-2"
      >
        View
      </button>

      <CaseStudyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        study={study}
      />
    </>
  );
};

export default ViewDetailsButton;
