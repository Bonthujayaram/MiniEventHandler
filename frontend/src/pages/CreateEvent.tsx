import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Upload,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/contexts/EventsContext";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const { createEvent } = useEvents();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    address: "",
    capacity: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create events.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [isAuthenticated, navigate, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.capacity) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(formData.capacity) < 1) {
      toast({
        title: "Invalid Capacity",
        description: "Capacity must be at least 1",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const newEvent = await createEvent({
      title: formData.title,
      description: formData.description || "No description provided.",
      date: formData.date,
      time: formData.time,
      location: formData.location,
      address: formData.address,
      capacity: parseInt(formData.capacity),
      imageUrl: imagePreview || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
      creatorId: user!.id,
      creatorName: user!.name,
    });

    toast({
      title: "Event Created!",
      description: "Your event has been published successfully.",
    });

    setIsLoading(false);
    navigate(`/events/${newEvent.id}`);
  };

  const generateDescription = async () => {
    if (!formData.title) {
      toast({
        title: "Enter Title First",
        description: "Please enter an event title to generate a description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    toast({
      title: "Generating...",
      description: "AI is creating your event description.",
    });

    // Simulate AI generation with a more realistic delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const templates = [
      `Join us for ${formData.title}! This is going to be an incredible event where you'll have the opportunity to connect with like-minded individuals, learn from industry experts, and create lasting memories. Don't miss out on this unique experience - reserve your spot today!`,
      `We're excited to invite you to ${formData.title}! Whether you're a seasoned professional or just getting started, this event offers something for everyone. Network with peers, gain valuable insights, and be part of an unforgettable experience.`,
      `Mark your calendars for ${formData.title}! This exclusive event brings together passionate individuals for a day of inspiration, learning, and connection. Limited spots available - secure yours now!`,
    ];

    const generatedText = templates[Math.floor(Math.random() * templates.length)];

    setFormData((prev) => ({ ...prev, description: generatedText }));
    setIsGenerating(false);

    toast({
      title: "Description Generated!",
      description: "Feel free to edit the generated description.",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated onLogout={logout} />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Create New Event
          </h1>
          <p className="text-muted-foreground mb-8">
            Fill in the details below to publish your event
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Event Image
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer overflow-hidden ${imagePreview ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {imagePreview ? (
                  <div className="aspect-video">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center p-8 text-center">
                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Click or drag to upload an image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Event Title *
              </label>
              <Input
                id="title"
                placeholder="Give your event a catchy name"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="block text-sm font-medium text-foreground">
                  Description
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-primary"
                  onClick={generateDescription}
                  disabled={isGenerating}
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <textarea
                id="description"
                rows={5}
                placeholder="Tell people what your event is about..."
                className="flex w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-base font-body text-foreground ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date *
                </label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-foreground mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Time *
                </label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location *
              </label>
              <Input
                id="location"
                placeholder="Event venue name"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                Full Address (optional)
              </label>
              <Input
                id="address"
                placeholder="Street address, city, state"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-foreground mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Capacity *
              </label>
              <Input
                id="capacity"
                type="number"
                min="1"
                placeholder="Maximum number of attendees"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="hero"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Publishing..." : "Publish Event"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateEvent;
