"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Booking, Review } from "../../../lib/types/review";
import Rating from "../Rating";
import Button from "../ui/Button";

type ReviewsProps = {
  propertyId: string;
};

export default function Reviews({ propertyId }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userId, setUserId] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [bookingId, setBookingId] = useState("");

  const [editId, setEditId] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function getReviews() {
    const res = await axios.get("/api/properties/" + propertyId + "/reviews");
    setReviews(res.data.reviews || []);
    setAverageRating(res.data.averageRating || 0);
    setTotalReviews(res.data.totalReviews || 0);
  }

  async function getBookings() {
    const res = await axios.get("/api/bookings");
    const list = res.data.bookings || [];

    const goodBookings = list.filter(
      (b: Booking) =>
        b.property.id === propertyId &&
        b.status === "COMPLETED" &&
        b.review === null,
    );

    setBookings(goodBookings);
  }

  useEffect(() => {
    async function loadData() {
      try {
        await getReviews();
      } catch (err) {
        console.log(err);
      }

      try {
        const res = await axios.get("/api/profile");
        setUserId(res.data.id);
      } catch (err) {}

      try {
        await getBookings();
      } catch (err) {}

      setLoading(false);
    }

    loadData();
  }, [propertyId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (bookingId === "") {
      setError("Select a completed booking.");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post("/api/reviews", { bookingId, rating, comment });

      setMessage("Review submitted successfully.");
      setRating(0);
      setComment("");
      setBookingId("");

      await getReviews();
      await getBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit review.");
    }

    setSubmitting(false);
  }

  function startEdit(review: Review) {
    setEditId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
    setError("");
    setMessage("");
  }

  async function handleUpdate(id: string) {
    if (editRating === 0) {
      setError("Please select a rating.");
      return;
    }

    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await axios.patch("/api/reviews/" + id, {
        rating: editRating,
        comment: editComment,
      });

      setMessage("Review updated successfully.");
      setEditId("");
      await getReviews();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update review.");
    }

    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await axios.delete("/api/reviews/" + id);

      setMessage("Review deleted successfully.");
      await getReviews();
      await getBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete review.");
    }
  }

  if (loading) {
    return <p className="mt-8 text-gray-500">Loading reviews...</p>;
  }

  let ratingText = "No reviews yet";
  if (totalReviews > 0) {
    ratingText = averageRating + " out of 5 · " + totalReviews + " reviews";
  }

  return (
    <section className="mt-10 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-semibold">Guest reviews</h2>

      <div className="mt-3">
        <Rating value={averageRating} text={ratingText} />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-4 text-sm text-green-700">{message}</p>}

      <div className="mt-6 space-y-5">
        {reviews.map((review) => (
          <article key={review.id} className="border-b border-gray-200 pb-5">
            <div className="flex items-center justify-between gap-4">
              <p className="font-medium">{review.guest.name || "Guest"}</p>
              {editId !== review.id && <Rating value={review.rating} />}
            </div>

            {editId === review.id ? (
              <div className="mt-4">
                <p className="text-sm font-medium">Your rating</p>

                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      aria-label={"Rate " + star + " out of 5"}
                      className="text-2xl text-orange-500"
                    >
                      {editRating >= star ? <FaStar /> : <FaRegStar />}
                    </button>
                  ))}
                </div>

                <label className="mt-4 block text-sm font-medium">
                  Comment
                </label>

                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                />

                <div className="mt-3 flex gap-3">
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleUpdate(review.id)}
                    className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save changes"}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setEditId("")}
                    className="rounded-lg border border-gray-300 px-4 py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {review.comment && (
                  <p className="mt-2 leading-6 text-gray-600">
                    {review.comment}
                  </p>
                )}

                <p className="mt-2 text-sm text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>

                {userId && review.guestId === userId && (
                  <div className="mt-3 flex gap-3">
                    <Button
                      type="button"
                      onClick={() => startEdit(review)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                    >
                      Edit
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </>
            )}
          </article>
        ))}
      </div>

      {bookings.length > 0 && userId && (
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-xl border border-gray-200 p-5"
        >
          <h3 className="text-lg font-semibold">Write a review</h3>

          <label className="mt-4 block text-sm font-medium">
            Completed booking
          </label>

          <select
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
            required
          >
            <option value="">Select a booking</option>
            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.property.title} — {booking.id}
              </option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-medium">Your rating</label>

          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={"Rate " + star + " out of 5"}
                className="text-2xl text-orange-500"
              >
                {rating >= star ? <FaStar /> : <FaRegStar />}
              </Button>
            ))}
          </div>

          <label className="mt-5 block text-sm font-medium">
            Comment (optional)
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="How was your stay?"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />

          <Button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </Button>
        </form>
      )}
    </section>
  );
}
