import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { useAuth } from "./AuthContext";

export interface Event {
  _id: string; // MongoDB uses _id
  id?: string; // For backward compatibility in UI if needed, we can map _id to id
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address?: string;
  capacity: number;
  attendees: string[]; // User IDs
  imageUrl: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
}

interface EventsContextType {
  events: Event[];
  createEvent: (event: Omit<Event, "_id" | "id" | "attendees" | "createdAt">) => Promise<Event>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<boolean>;
  deleteEvent: (id: string, userId: string) => Promise<boolean>;
  getEvent: (id: string) => Event | undefined;
  rsvpEvent: (eventId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  cancelRsvp: (eventId: string, userId: string) => Promise<boolean>;
  getUserCreatedEvents: (userId: string) => Event[];
  getUserAttendingEvents: (userId: string) => Event[];
  isUserAttending: (eventId: string, userId: string) => boolean;
  isUserOwner: (eventId: string, userId: string) => boolean;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth(); // We might need this to filter client-side if API returns all

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      // Map _id to id for frontend compatibility
      const mappedEvents = res.data.map((e: any) => ({ ...e, id: e._id }));
      setEvents(mappedEvents);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const createEvent = async (eventData: Omit<Event, "_id" | "id" | "attendees" | "createdAt">): Promise<Event> => {
    try {
      const res = await api.post('/events', eventData);
      const newEvent = { ...res.data, id: res.data._id };
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>): Promise<boolean> => {
    try {
      await api.put(`/events/${id}`, updates);
      fetchEvents(); // Refresh or optimistic update
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteEvent = async (id: string, userId: string): Promise<boolean> => {
    try {
      await api.delete(`/events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
      return true;
    } catch (err) {
      return false;
    }
  };

  const getEvent = (id: string): Event | undefined => {
    // We already have all events in state, so we can just find it
    // If you implemented single event fetching from API, do it here. 
    // For now, finding in loaded list is fine.
    return events.find((e) => e.id === id);
  };

  const rsvpEvent = async (eventId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.post(`/events/${eventId}/rsvp`, { userId }); // userId should ideally come from token in backend, but passing for now matched backend logic
      if (res.data.success) {
        // Optimistic update
        setEvents(prev => prev.map(e => {
          if (e.id === eventId) {
            return { ...e, attendees: [...e.attendees, userId] };
          }
          return e;
        }));
        return { success: true };
      }
      return { success: false, error: res.data.error };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || "RSVP failed" };
    }
  };

  const cancelRsvp = async (eventId: string, userId: string): Promise<boolean> => {
    try {
      const res = await api.post(`/events/${eventId}/cancel-rsvp`, { userId });
      if (res.data.success) {
        setEvents(prev => prev.map(e => {
          if (e.id === eventId) {
            return { ...e, attendees: e.attendees.filter(id => id !== userId) };
          }
          return e;
        }));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const getUserCreatedEvents = (userId: string): Event[] => {
    return events.filter((e) => e.creatorId === userId);
  };

  const getUserAttendingEvents = (userId: string): Event[] => {
    return events.filter((e) => e.attendees.includes(userId));
  };

  const isUserAttending = (eventId: string, userId: string): boolean => {
    const event = events.find((e) => e.id === eventId);
    return event?.attendees.includes(userId) ?? false;
  };

  const isUserOwner = (eventId: string, userId: string): boolean => {
    const event = events.find((e) => e.id === eventId);
    return event?.creatorId === userId;
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        createEvent,
        updateEvent,
        deleteEvent,
        getEvent,
        rsvpEvent,
        cancelRsvp,
        getUserCreatedEvents,
        getUserAttendingEvents,
        isUserAttending,
        isUserOwner,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};
