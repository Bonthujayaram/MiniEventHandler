import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/contexts/EventsContext";

const Index = () => {
  const { isAuthenticated, logout } = useAuth();
  const { events } = useEvents();

  // Get first 3 events as featured
  const featuredEvents = events.slice(0, 3);

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

  const totalAttendees = events.reduce((acc, e) => acc + e.attendees.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} onLogout={logout} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Discover amazing events near you</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Create & Join{" "}
              <span className="text-gradient">Unforgettable</span>{" "}
              Events
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              The modern platform for hosting and discovering events. Connect with your community, share experiences, and make memories.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/events">
                <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                  Explore Events
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to={isAuthenticated ? "/events/create" : "/auth?mode=signup"}>
                <Button variant="glass" size="xl" className="w-full sm:w-auto">
                  Start Hosting
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-foreground font-semibold">{events.length}</span>
                <span className="text-muted-foreground">Events</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-foreground font-semibold">{totalAttendees}</span>
                <span className="text-muted-foreground">Attendees</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-foreground font-semibold">98%</span>
                <span className="text-muted-foreground">Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Featured Events
              </h2>
              <p className="text-muted-foreground">
                Trending events you won't want to miss
              </p>
            </div>
            <Link to="/events">
              <Button variant="outline" className="gap-2">
                View All Events
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EventCard
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    date={formatDate(event.date)}
                    time={formatTime(event.time)}
                    location={event.location}
                    capacity={event.capacity}
                    attendees={event.attendees.length}
                    imageUrl={event.imageUrl}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events yet. Be the first to create one!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl bg-gradient-card border border-border p-8 md:p-12 lg:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Host Your Event?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of organizers who trust Evento to bring their vision to life. Create your first event in minutes.
              </p>
              <Link to={isAuthenticated ? "/events/create" : "/auth?mode=signup"}>
                <Button variant="hero" size="xl" className="gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
