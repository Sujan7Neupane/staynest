import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

type RatingProps = {
  value: number;
  text?: string;
};

export default function Rating({ value, text }: RatingProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex text-orange-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {value >= star ? (
              <FaStar />
            ) : value >= star - 0.5 ? (
              <FaStarHalfAlt />
            ) : (
              <FaRegStar />
            )}
          </span>
        ))}
      </div>

      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
}
