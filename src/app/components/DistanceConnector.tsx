import { useState, useEffect } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  MapPin,
  Navigation,
  Loader2,
  Settings,
  Check,
  X,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  calculateDistance,
  formatDistance,
  getCurrentLocation,
  geocodeCity,
  getDistanceDescription,
  type Location,
} from "../utils/location";
import { projectId } from "../utils/supabase/info";

interface DistanceConnectorProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  partnerId?: string;
  partnerName: string;
  partnerAvatar?: string;
  accessToken: string;
}

interface UserLocation {
  userId: string;
  location: Location | null;
  locationType: "live" | "manual" | null;
  updatedAt?: string;
}

export function DistanceConnector({
  userId,
  userName,
  userAvatar,
  partnerId,
  partnerName,
  partnerAvatar,
  accessToken,
}: DistanceConnectorProps) {
  const [userLocation, setUserLocation] =
    useState<UserLocation | null>(null);
  const [partnerLocation, setPartnerLocation] =
    useState<UserLocation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userInitials =
    userName
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "?";
  const partnerInitials =
    partnerName
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "?";

  useEffect(() => {
    loadLocations();
  }, [userId, partnerId]);

  useEffect(() => {
    if (userLocation?.location && partnerLocation?.location) {
      const dist = calculateDistance(
        userLocation.location.latitude,
        userLocation.location.longitude,
        partnerLocation.location.latitude,
        partnerLocation.location.longitude,
      );
      setDistance(dist);
    } else {
      setDistance(null);
    }
  }, [userLocation, partnerLocation]);

  const loadLocations = async () => {
    if (!partnerId) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/couple-locations`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUserLocation(data.userLocation || null);
        setPartnerLocation(data.partnerLocation || null);
      }
    } catch (error) {
      console.error(
        "[DistanceConnector] Failed to load locations:",
        error,
      );
    }
  };

  const handleEnableLiveLocation = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();

      if (!location) {
        toast.error(
          "Unable to get your location. Please check permissions.",
        );
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/update-location`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            location,
            locationType: "live",
          }),
        },
      );

      if (!response.ok)
        throw new Error("Failed to save location");

      const locationText = location.city
        ? `${location.city}${location.country ? ", " + location.country : ""}`
        : "your location";

      toast.success(`📍 Location updated to ${locationText}`);
      await loadLocations();
      setShowSettings(false);
    } catch (error) {
      console.error(
        "[DistanceConnector] Error enabling live location:",
        error,
      );
      toast.error("Failed to enable live location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetManualLocation = async () => {
    if (!manualCity.trim()) {
      toast.error("Please enter a city name");
      return;
    }

    setIsSubmitting(true);
    try {
      const location = await geocodeCity(manualCity);

      if (!location) {
        toast.error(
          "City not found. Please try a different name.",
        );
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/update-location`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            location,
            locationType: "manual",
          }),
        },
      );

      if (!response.ok)
        throw new Error("Failed to save location");

      const locationText = location.city
        ? `${location.city}${location.country ? ", " + location.country : ""}`
        : manualCity;

      toast.success(`📍 Location set to ${locationText}`);
      await loadLocations();
      setShowSettings(false);
      setManualCity("");
    } catch (error) {
      console.error(
        "[DistanceConnector] Error setting manual location:",
        error,
      );
      toast.error("Failed to set location");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveLocation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/update-location`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Failed to remove location");

      toast.success("Location removed");
      await loadLocations();
      setShowSettings(false);
    } catch (error) {
      console.error(
        "[DistanceConnector] Error removing location:",
        error,
      );
      toast.error("Failed to remove location");
    } finally {
      setIsLoading(false);
    }
  };

  if (!partnerId) return null;

  return (
    <>
      <Card className="relative overflow-hidden border border-slate-100 bg-white rounded-2xl shadow-sm">
        {/* Soft Modern Aesthetic Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-50/60 via-purple-50/40 to-sky-50/60" />

        {/* Ambient floating elements in card container background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-sm select-none"
              style={{ left: `${20 + i * 20}%` }}
              initial={{ y: "120%", opacity: 0 }}
              animate={{
                y: "-20%",
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                delay: i * 2,
                ease: "linear",
              }}
            >
              🌸
            </motion.div>
          ))}
        </div>

        <CardContent className="p-5 relative z-10">
          {/* Settings Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>

          <div className="space-y-4">
            {/* Visual Arc Connector Layer */}
            <div className="relative flex items-center justify-between px-3 mt-4">
              {/* User Avatar */}
              <div className="relative">
                <Avatar className="w-16 h-16 border-4 border-white shadow-md ring-1 ring-slate-100 z-10">
                  <AvatarImage
                    src={userAvatar}
                    alt={userName}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-rose-600 text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {userLocation?.location && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow z-20">
                    <MapPin className="w-3 h-3 text-white fill-current" />
                  </div>
                )}
              </div>

              {/* Dynamic Connection Path Line & Floating Flying Hearts */}
              <div className="absolute left-[4.2rem] right-[4.2rem] top-0 bottom-0 flex flex-col items-center justify-center">
                {/* Distance Center Counter Badge */}
                <AnimatePresence>
                  {distance !== null && (
                    <motion.div
                      initial={{
                        scale: 0.8,
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{ scale: 1, opacity: 1, y: -16 }}
                      exit={{ scale: 0.8, opacity: 0, y: 10 }}
                      className="z-30 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-purple-100 flex items-center gap-1.5"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span className="text-xs font-bold text-slate-900 tracking-tight mx-[0px] my-[-6px]">
                        {formatDistance(distance)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SVG Curve Canvas Frame */}
                <svg
                  className="w-full h-12 overflow-visible absolute top-1/2 -translate-y-1/2"
                  viewBox="0 0 200 40"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="arcGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>

                    {/* Reusable Heart path definition for traveling nodes */}
                    <g id="traveling-heart">
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        fill="#f43f5e"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        transform="scale(0.6) translate(-12, -12)"
                      />
                    </g>
                  </defs>

                  {/* The Curved Path */}
                  <path
                    id="connector-curve-path"
                    d="M 0 30 Q 100 0, 200 30"
                    stroke="url(#arcGradient)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    className="opacity-40"
                  />

                  {/* High Contrast Moving Pulse Guide */}
                  <path
                    d="M 0 30 Q 100 0, 200 30"
                    stroke="url(#arcGradient)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="30 120"
                    className="animate-[dash_4s_linear_infinite]"
                    style={{ strokeDashoffset: 0 }}
                  />

                  {/* Continuous Stream of Traveling Hearts */}
                  {distance !== null && (
                    <>
                      {/* Heart Node 1 */}
                      <g className="animate-[heartTravel_3s_linear_infinite]">
                        <use href="#traveling-heart" />
                      </g>
                      {/* Heart Node 2 (Delayed) */}
                      <g
                        className="animate-[heartTravel_3s_linear_infinite]"
                        style={{ animationDelay: "1s" }}
                      >
                        <use href="#traveling-heart" />
                      </g>
                      {/* Heart Node 3 (Delayed) */}
                      <g
                        className="animate-[heartTravel_3s_linear_infinite]"
                        style={{ animationDelay: "2s" }}
                      >
                        <use href="#traveling-heart" />
                      </g>
                    </>
                  )}
                </svg>
              </div>

              {/* Partner Avatar */}
              <div className="relative">
                <Avatar className="w-16 h-16 border-4 border-white shadow-md ring-1 ring-slate-100 z-10">
                  <AvatarImage
                    src={partnerAvatar}
                    alt={partnerName}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-sky-500 to-sky-600 text-white font-semibold">
                    {partnerInitials}
                  </AvatarFallback>
                </Avatar>
                {partnerLocation?.location && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow z-20">
                    <MapPin className="w-3 h-3 text-white fill-current" />
                  </div>
                )}
              </div>
            </div>

            {/* Custom Global Styles for SVG CSS Animations */}
            <style>{`
              @keyframes dash {
                to {
                  stroke-dashoffset: -150;
                }
              }
              @keyframes heartTravel {
                0% {
                  motion-path: path('M 0 30 Q 100 0, 200 30');
                  motion-distance: 0%;
                  offset-path: path('M 0 30 Q 100 0, 200 30');
                  offset-distance: 0%;
                  transform: scale(0.6);
                  opacity: 0;
                }
                10% {
                  opacity: 1;
                }
                90% {
                  opacity: 1;
                }
                100% {
                  motion-path: path('M 0 30 Q 100 0, 200 30');
                  motion-distance: 100%;
                  offset-path: path('M 0 30 Q 100 0, 200 30');
                  offset-distance: 100%;
                  transform: scale(0.6);
                  opacity: 0;
                }
              }
            `}</style>

            {/* Names and Locations Metadata footer columns */}
            <div className="grid grid-cols-3 items-center text-center px-1">
              <div className="text-left truncate">
                <p className="text-xs font-bold text-slate-950">
                  {userLocation?.location?.city || "Not set"}
                </p>
              </div>

              <div className="flex justify-center">
                {distance !== null ? (
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                    {getDistanceDescription(distance) ||
                      "Connected"}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 italic">
                    Awaiting location
                  </span>
                )}
              </div>

              <div className="text-right truncate">
                <p className="text-xs font-bold text-slate-950">
                  {partnerLocation?.location?.city || "Not set"}
                </p>
              </div>
            </div>

            {/* Empty State Call to Action Link */}
            {!userLocation?.location && (
              <div className="text-center pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border-slate-200 shadow-sm h-8 px-4 rounded-xl"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                  Share Your Location
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Control Panel Dialog Settings */}
      <Dialog
        open={showSettings}
        onOpenChange={setShowSettings}
      >
        <DialogContent className="max-w-md rounded-2xl p-5 border-none shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-950">
              <MapPin className="w-5 h-5 text-rose-500" />
              Location Settings
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Share your location region with your partner to
              calculate distances.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {userLocation?.location && (
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 h-8 w-8">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Active Location Baseline
                  </h4>
                  <p className="text-sm font-semibold text-slate-950 mt-0.5">
                    {userLocation.location.city}
                    {userLocation.location.country
                      ? `, ${userLocation.location.country}`
                      : ""}
                  </p>
                  <span className="inline-block text-[10px] bg-white border border-emerald-200 text-emerald-700 font-bold px-1.5 py-0.5 rounded mt-1.5">
                    {userLocation.locationType === "live"
                      ? "📍 GPS LIVE Mode"
                      : "📌 Manual Entry"}
                  </span>
                </div>
              </div>
            )}

            {/* GPS Link Option */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-purple-600" />
                Automatic Device GPS
              </h4>
              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 rounded-xl shadow-sm"
                onClick={handleEnableLiveLocation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Acquiring satellite data...
                  </>
                ) : (
                  "Sync Live Location"
                )}
              </Button>
            </div>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold text-slate-400 uppercase">
                <span className="bg-white px-2">Or</span>
              </div>
            </div>

            {/* Manual Entry Column */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                Manual City Input
              </h4>
              <div className="flex gap-2">
                <Input
                  id="manual-city"
                  placeholder="e.g., Abu Dhabi, UAE"
                  value={manualCity}
                  onChange={(e) =>
                    setManualCity(e.target.value)
                  }
                  className="h-9 text-xs border-slate-200 focus:border-purple-500 rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleSetManualLocation();
                  }}
                />
                <Button
                  variant="outline"
                  onClick={handleSetManualLocation}
                  disabled={isSubmitting || !manualCity.trim()}
                  className="h-9 text-xs font-bold px-4 border-slate-200 rounded-xl whitespace-nowrap"
                >
                  {isSubmitting ? "Searching..." : "Set"}
                </Button>
              </div>
            </div>

            {/* Disconnect Location Node */}
            {userLocation?.location && (
              <Button
                variant="ghost"
                className="w-full text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-9 rounded-xl border border-transparent hover:border-rose-100"
                onClick={handleRemoveLocation}
                disabled={isLoading}
              >
                Clear Location History
              </Button>
            )}

            <p className="text-[10px] text-slate-400 text-center font-medium pt-1">
              🔒 Private: Location records are shared only
              within your connected partnership.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}