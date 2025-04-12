import { Copy, Download, LinkIcon, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch"; // ✅ Fixed import name to lowercase
import { deleteUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";
import { useState, useEffect } from "react";

const LinkCard = ({ url = {}, fetchUrls }) => {
  const [urlId, setUrlId] = useState(url?.id || ""); // ✅ Ensure stable ID reference

  useEffect(() => {
    setUrlId(url?.id || "");
  }, [url?.id]);

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl);

  const handleDelete = async () => {
    if (!urlId) return; // ✅ Prevents API call if ID is missing
    console.log("🗑️ Deleting URL ID:", urlId);

    try {
      await fnDelete({ id: urlId });
      fetchUrls(); // ✅ Refresh list after deletion
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const downloadImage = () => {
    if (!url?.qr) return; // ✅ Prevents error if QR code is missing

    const anchor = document.createElement("a");
    anchor.href = url.qr;
    anchor.download = url.title || "qr-code"; // ✅ Adds default filename
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 border p-4 bg-gray-900 rounded-lg">
      {url?.qr && (
        <img
          src={url.qr}
          className="h-32 object-contain ring ring-blue-500 self-start"
          alt="QR code"
        />
      )}

      <Link to={`/link/${urlId}`} className="flex flex-col flex-1">
        <span className="text-3xl font-extrabold hover:underline cursor-pointer">
          {url?.title || "Untitled"}
        </span>
        <span className="text-2xl text-blue-400 font-bold hover:underline cursor-pointer">
          https://tinyurlx.in/{url?.custom_url ? url?.custom_url : url?.short_url}
        </span>
        <span className="flex items-center gap-1 hover:underline cursor-pointer">
          <LinkIcon className="p-1" />
          {url?.original_url || "No URL provided"}
        </span>
        <span className="flex items-end font-extralight text-sm flex-1">
          {url?.created_at ? new Date(url.created_at).toLocaleString() : "Unknown date"}
        </span>
      </Link>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => navigator.clipboard.writeText(`https://tinyurlx.in/${url?.short_url}`)}
        >
          <Copy />
        </Button>

        <Button variant="ghost" onClick={downloadImage}>
          <Download />
        </Button>

        <Button
          variant="ghost"
          onClick={handleDelete}
          disabled={loadingDelete} // ✅ Fixed prop name
        >
          {loadingDelete ? <BeatLoader size={5} color="white" /> : <Trash />}
        </Button>
      </div>
    </div>
  );
};

export default LinkCard;
