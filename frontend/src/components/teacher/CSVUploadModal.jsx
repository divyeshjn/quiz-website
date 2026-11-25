import { useRef, useState } from "react";

import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  X,
  AlertCircle,
} from "lucide-react";

import Button from "../common/Button";

import {
  downloadCSVTemplate,
} from "../../utils/csv";

export default function CSVUploadModal({
  onClose,
  onUpload,
  loading,
  errors = [],
}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef(null);

  const selectFile = (selectedFile) => {
    setError("");

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("Please select a CSV file");
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setFile(null);
      setError("File size must not exceed 2 MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragging(false);

    if (!loading) {
      selectFile(event.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    await onUpload(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-upload-title"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2
            id="csv-upload-title"
            className="text-xl font-semibold"
          >
            Upload Questions
          </h2>

          <button
            aria-label="Close upload dialog"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Upload multiple questions using a CSV file.
        </p>

        <button
          type="button"
          onClick={downloadCSVTemplate}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
        >
          <Download size={16} />
          Download CSV Template
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          disabled={loading}
          onChange={(event) => {
            selectFile(event.target.files[0]);
            event.target.value = "";
          }}
        />

        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`mt-5 flex w-full flex-col items-center rounded-xl border-2 border-dashed p-8 transition ${
            dragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 hover:bg-slate-50"
          }`}
        >
          <UploadCloud
            size={38}
            className="text-blue-600"
          />

          <p className="mt-3 text-sm font-medium">
            Click to upload or drag and drop
          </p>

          <p className="mt-1 text-xs text-slate-500">
            CSV files only · Maximum 2 MB
          </p>
        </button>

        {file && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
            <FileSpreadsheet
              size={22}
              className="shrink-0 text-green-600"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {file.name}
              </p>

              <p className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>

            <button
              aria-label="Remove selected file"
              disabled={loading}
              onClick={() => setFile(null)}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {errors.length > 0 && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
              <AlertCircle size={18} />
              CSV validation failed
            </div>

            <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
              {errors.map((item, index) => (
                <p
                  key={index}
                  className="text-xs text-red-700"
                >
                  {item.row
                    ? `Row ${item.row}: `
                    : ""}
                  {item.message || String(item)}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
          <p>Maximum 1,000 questions per upload.</p>

          <p className="mt-1">
            Each question must contain four distinct options
            and one correct answer.
          </p>

          <p className="mt-1">
            If any row is invalid, the entire upload will be
            rejected.
          </p>

          <p className="mt-1">
            Uploading the same file again may create duplicate
            questions.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            loading={loading}
            disabled={!file}
            onClick={handleUpload}
          >
            Upload Questions
          </Button>
        </div>
      </div>
    </div>
  );
}