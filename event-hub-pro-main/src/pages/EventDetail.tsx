import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  Heart,
  Edit,
  Trash2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "@/contexts/EventsContext";
import { useAuth } from "@/contexts/AuthContext";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getEvent, rsvpEvent, cancelRsvp, isUserAttending, isUserOwner, deleteEvent } = useEvents();
  const { user, isAuthenticated, logout } = useAuth();
  const [isRSVPing, setIsRSVPing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const event = getEvent(id || "");
  const hasRSVP = user ? isUserAttending(id || "", user.id) : false;
  const isOwner = user ? isUserOwner(id || "", user.id) : false;

  useEffect(() => {
    if (!event && id) {
      // Event not found
      toast({
        title: "Event not found",
        description: "The event you're looking for doesn't exist.",
        variant: "destructive",
      });
      navigate("/events");
    }
  }, [event, id, navigate, toast]);

  if (!event) {
    return null;
  }

  const spotsLeft = event.capacity - event.attendees.length;
  const isFull = spotsLeft <= 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleRSVP = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to RSVP to events.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsRSVPing(true);

    if (hasRSVP) {
      // Cancel RSVP
      await new Promise((resolve) => setTimeout(resolve, 300));
      const success = await cancelRsvp(id || "", user!.id);
      if (success) {
        toast({
          title: "RSVP Cancelled",
          description: "You have left this event.",
        });
      }
    } else {
      // Join event
      await new Promise((resolve) => setTimeout(resolve, 300));
      const result = await rsvpEvent(id || "", user!.id);
      if (result.success) {
        toast({
          title: "RSVP Confirmed!",
          description: "You're going to this event. See you there!",
        });
      } else {
        toast({
          title: "RSVP Failed",
          description: result.error || "Could not complete RSVP",
          variant: "destructive",
        });
      }
    }

    setIsRSVPing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const success = await deleteEvent(id || "", user!.id);
    if (success) {
      toast({
        title: "Event Deleted",
        description: "Your event has been deleted.",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Error",
        description: "Could not delete the event.",
        variant: "destructive",
      });
    }
    setIsDeleting(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Event link has been copied to your clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} onLogout={logout} />

      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] mt-16">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Button
            variant="glass"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="glass" size="icon" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="glass" size="icon">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-20 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Status */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${isFull
                        ? "bg-destructive/20 text-destructive"
                        : spotsLeft <= 10
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                  >
                    {isFull ? "Sold Out" : `${spotsLeft} spots left`}
                  </span>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {event.title}
                  </h1>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/events/edit/${id}`)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Organizer */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {event.creatorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hosted by</p>
                  <p className="font-medium text-foreground">{event.creatorName}</p>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4">
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                  About This Event
                </h2>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {event.description}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RSVP Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-card sticky top-24">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-foreground">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{formatDate(event.date)}</p>
                    <p className="text-sm text-muted-foreground">{formatTime(event.time)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-foreground">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    {event.address && (
                      <p className="text-sm text-muted-foreground">{event.address}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-foreground">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{event.attendees.length} attending</p>
                    <p className="text-sm text-muted-foreground">
                      of {event.capacity} capacity
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${(event.attendees.length / event.capacity) * 100}%` }}
                  />
                </div>
              </div>

              {!isOwner && (
                <>
                  <Button
                    variant={hasRSVP ? "outline" : "hero"}
                    size="lg"
                    className="w-full"
                    onClick={handleRSVP}
                    disabled={isRSVPing || (isFull && !hasRSVP)}
                  >
                    {isRSVPing
                      ? "Please wait..."
                      : hasRSVP
                        ? "Cancel RSVP"
                        : isFull
                          ? "Event Full"
                          : "RSVP Now"}
                  </Button>

                  {hasRSVP && (
                    <p className="text-center text-sm text-primary mt-3">
                      ✓ You're attending this event
                    </p>
                  )}
                </>
              )}

              {isOwner && (
                <p className="text-center text-sm text-muted-foreground">
                  You created this event
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail;
