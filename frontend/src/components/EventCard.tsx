import { Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  attendees: number;
  imageUrl: string;
}

const EventCard = ({
  id,
  title,
  description,
  date,
  time,
  location,
  capacity,
  attendees,
  imageUrl,
}: EventCardProps) => {
  const spotsLeft = capacity - attendees;
  const isFull = spotsLeft <= 0;

  return (
    <Link to={`/events/${id}`} className="block group">
      <article className="rounded-xl border border-border bg-card overflow-hidden shadow-card transition-all duration-300 hover:shadow-elevated hover:border-primary/30 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                isFull
                  ? "bg-destructive/90 text-destructive-foreground"
                  : spotsLeft <= 5
                  ? "bg-primary/90 text-primary-foreground"
                  : "bg-secondary/90 text-secondary-foreground backdrop-blur-sm"
              }`}
            >
              {isFull ? "Sold Out" : `${spotsLeft} spots left`}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{date} • {time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="line-clamp-1">{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>{attendees} / {capacity} attending</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default EventCard;
