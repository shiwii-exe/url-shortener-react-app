import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "./ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Error from "./error";
import * as yup from "yup";
import useFetch from "@/hooks/use-fetch";
import { createUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";
import { UrlState } from "@/context";
import { QRCode } from "react-qrcode-logo";

export function CreateLink() {
  const { user } = UrlState() || {}; // Ensuring `user` exists
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    title: "",
    longUrl: longLink ? longLink : "",
    customUrl: "",
  });

  const schema = yup.object().shape({
    title: yup.string().required("Title is required"),
    longUrl: yup.string().url("Must be a valid URL").required("Long URL is required"),
    customUrl: yup.string(),
  });

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  const { loading, error, data, fn: fnCreateUrl } = useFetch(
    createUrl,
    null // Don't send initial request
  );

  useEffect(() => {
    console.log("🔍 API Response:", data);

    if (!error && data && Array.isArray(data) && data.length > 0 && data[0]?.id) {
      navigate(`/link/${data[0].id}`);
    }
  }, [error, data, navigate]);

  const createNewLink = async () => {
    setErrors({});
    try {
      await schema.validate(formValues, { abortEarly: false });

      if (user?.id) {
        const requestData = { ...formValues, user_id: user.id };

        console.log("📡 Sending API Request:", requestData); // ✅ Debug request data

        await fnCreateUrl(requestData);
      } else {
        setErrors({ user: "User is not logged in" });
      }
    } catch (e) {
      const newErrors = {};
      e?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    }
  };

  if (!user?.id) {
    return <p className="text-red-500">User not found. Please log in.</p>;
  }

  return (
    <Dialog
      defaultOpen={longLink}
      onOpenChange={(res) => {
        if (!res) setSearchParams({});
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">Create New Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">Create New</DialogTitle>
          <DialogDescription>Enter details to generate a short link.</DialogDescription>
        </DialogHeader>

        {formValues?.longUrl && <QRCode size={250} value={formValues.longUrl} />}

        <Input id="title" placeholder="Short Link's Title" value={formValues.title} onChange={handleChange} />
        {errors.title && <Error message={errors.title} />}

        <Input id="longUrl" placeholder="Enter your long URL" value={formValues.longUrl} onChange={handleChange} />
        {errors.longUrl && <Error message={errors.longUrl} />}

        <div className="flex items-center gap-2">
          <Card className="p-2">tinyurlx.in</Card> /
          <Input id="customUrl" placeholder="Custom Link (optional)" value={formValues.customUrl} onChange={handleChange} />
        </div>

        {error && <Error message={error.message} />}

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="destructive" onClick={createNewLink} disabled={loading}>
            {loading ? <BeatLoader size={10} color="white" /> : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
