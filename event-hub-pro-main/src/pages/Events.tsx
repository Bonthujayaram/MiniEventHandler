import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";
import { useEvents } from "@/contexts/EventsContext";
import { useAuth } from "@/contexts/AuthContext";

const Events = () => {
  const { events } = useEvents();
  const { isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    let result = events;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
    }

    // Category/time filters (simplified for demo)
    if (activeFilter === "thisWeek") {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      result = result.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= weekFromNow;
      });
    }

    return result;
  }, [events, searchQuery, activeFilter]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} onLogout={logout} />

      {/* Header */}
      <section className="pt-24 pb-8 lg:pt-28 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Discover Events
            </h1>
            <p className="text-muted-foreground text-lg">
              Find and join events that match your interests
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events by name, location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={activeFilter === "thisWeek" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
              onClick={() => setActiveFilter(activeFilter === "thisWeek" ? null : "thisWeek")}
            >
              <Calendar className="w-4 h-4" />
              This Week
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <MapPin className="w-4 h-4" />
              Near Me
            </Button>
            <Button variant="ghost" size="sm">
              Tech
            </Button>
            <Button variant="ghost" size="sm">
              Music
            </Button>
            <Button variant="ghost" size="sm">
              Art
            </Button>
            <Button variant="ghost" size="sm">
              Networking
            </Button>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                No events found matching your search.
              </p>
              <Button variant="outline" onClick={() => { setSearchQuery(""); setActiveFilter(null); }}>
                Clear Search
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredEvents.length} events
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
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
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
