import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "project-images";

// `value` is an array of public URLs (order = carousel order on the public
// card); `onChange` receives the full replacement array.
function ImageUploader({ value, onChange }) {
  const images = value ?? [];
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
    onChange([...images, data.publicUrl]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-image-uploader">
      {images.length > 0 && (
        <div className="admin-image-grid">
          {images.map((url, i) => (
            <div className="admin-image-preview" key={url}>
              <img src={url} alt={`Project ${i + 1}`} />
              <button type="button" className="admin-image-remove" onClick={() => removeAt(i)} aria-label={`Remove image ${i + 1}`}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="admin-image-drop">
        <Upload size={18} />
        <span>{uploading ? "Uploading…" : images.length > 0 ? "Add another image" : "Upload image"}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          hidden
        />
      </label>

      {error && <p className="tx-status-line tx-status-fail">✗ {error}</p>}
    </div>
  );
}

export default ImageUploader;
