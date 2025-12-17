import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users, MapPin, Edit, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/contexts/EventsContext";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const { getUserCreatedEvents, getUserAttendingEvents, deleteEvent } = useEvents();
  const [activeTab, setActiveTab] = useState<"created" | "attending">("created");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to view your dashboard.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [isAuthenticated, navigate, toast]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const myEvents = getUserCreatedEvents(user.id);
  const attendingEvents = getUserAttendingEvents(user.id);
  const events = activeTab === "created" ? myEvents : attendingEvents;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDelete = async (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    const success = await deleteEvent(eventId, user.id);
    if (success) {
      toast({
        title: "Event Deleted",
        description: "Your event has been deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: "Could not delete the event.",
        variant: "destructive",
      });
    }
  };

  const totalAttendees = myEvents.reduce((acc, e) => acc + e.attendees.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated onLogout={logout} />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-muted-foreground">
              Manage your events and RSVPs
            </p>
          </div>
          <Link to="/events/create">
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{myEvents.length}</p>
                <p className="text-sm text-muted-foreground">Events Created</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{attendingEvents.length}</p>
                <p className="text-sm text-muted-foreground">Events Attending</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalAttendees}</p>
                <p className="text-sm text-muted-foreground">Total Attendees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "created" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("created")}
          >
            My Events ({myEvents.length})
          </Button>
          <Button
            variant={activeTab === "attending" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("attending")}
          >
            Attending ({attendingEvents.length})
          </Button>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No events yet
            </h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === "created"
                ? "Create your first event and start building your community"
                : "Browse events and RSVP to join"}
            </p>
            <Link to={activeTab === "created" ? "/events/create" : "/events"}>
              <Button variant="hero">
                {activeTab === "created" ? "Create Event" : "Browse Events"}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="block group"
              >
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 transition-all duration-300 hover:border-primary/30 hover:shadow-card">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full sm:w-32 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.date)} • {formatTime(event.time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.attendees.length} / {event.capacity}
                      </span>
                    </div>
                  </div>
                  {activeTab === "created" && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/events/edit/${event.id}`);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(event.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div >
  );
};

export default Dashboard;
