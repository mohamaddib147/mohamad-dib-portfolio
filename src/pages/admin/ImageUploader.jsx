import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "project-images";

function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="admin-image-uploader">
      {value ? (
        <div className="admin-image-preview">
          <img src={value} alt="Project" />
          <button type="button" className="admin-image-remove" onClick={() => onChange("")} aria-label="Remove image">
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="admin-image-drop">
          <Upload size={18} />
          <span>{uploading ? "Uploading…" : "Upload image"}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading}
            hidden
          />
        </label>
      )}
      {error && <p className="tx-status-line tx-status-fail">✗ {error}</p>}
    </div>
  );
}

export default ImageUploader;
