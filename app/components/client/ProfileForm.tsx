"use client";

import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Profile } from "../../../lib/types/profile";
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";

type ProfileFormData = {
  name: string;
  image: FileList;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [imagePreview, setImagePreview] = useState(profile.profileImageUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: profile.name,
    },
  });

  async function onSubmit(data: ProfileFormData) {
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("name", data.name.trim());

    const image = data.image?.[0];

    if (image) {
      formData.append("image", image);
    }

    try {
      setLoading(true);

      const response = await axios.patch("/api/profile", formData);

      setImagePreview(response.data.profileImageUrl);
      setSuccess("Profile updated successfully.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to update profile.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const nameField = register("name", {
    required: "Name is required",
    validate: (value) => value.trim().length > 0 || "Name cannot be empty",
  });

  const imageField = register("image");

  return (
    <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-4">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Profile picture"
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-semibold text-gray-600">
            {profile.name.charAt(0).toUpperCase() || "U"}
          </div>
        )}

        <div>
          <h2 className="text-lg font-medium">{watch("name")}</h2>
          <p className="text-sm text-gray-500">{profile.role}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <FormInput
            label="Full name"
            id="name"
            type="text"
            {...nameField}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium">Email address</p>
          <p className="mt-1 text-gray-600">{profile.email}</p>
        </div>

        <div>
          <p className="text-sm font-medium">Account type</p>
          <p className="mt-1 text-gray-600">{profile.role}</p>
        </div>

        <div>
          <FormInput
            label="Profile Picture"
            id="profileImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            {...imageField}
            onChange={(e) => {
              imageField.onChange(e);

              const file = e.target.files?.[0];

              if (file) {
                setImagePreview(URL.createObjectURL(file));
              }
            }}
            className="block w-full text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {success && <p className="text-sm text-green-600">{success}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-5 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </section>
  );
}
