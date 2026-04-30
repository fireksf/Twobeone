import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  MapPin, 
  Navigation, 
  Heart, 
  Users,
  Loader2,
  Settings,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { 
  calculateDistance, 
  formatDistance, 
  getCurrentLocation,
  geocodeCity,
  getDistanceEmoji,
  getDistanceDescription,
  type Location 
} from '../utils/location';
import { projectId } from '../utils/supabase/info';

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
  locationType: 'live' | 'manual' | null;
  updatedAt?: string;
}

export function DistanceConnector({
  userId,
  userName,
  userAvatar,
  partnerId,
  partnerName,
  partnerAvatar,
  accessToken
}: DistanceConnectorProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [partnerLocation, setPartnerLocation] = useState<UserLocation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userInitials = userName?.split(' ').map(n => n[0]).join('') || '?';
  const partnerInitials = partnerName?.split(' ').map(n => n[0]).join('') || '?';

  useEffect(() => {
    loadLocations();
  }, [userId, partnerId]);

  useEffect(() => {
    if (userLocation?.location && partnerLocation?.location) {
      const dist = calculateDistance(
        userLocation.location.latitude,
        userLocation.location.longitude,
        partnerLocation.location.latitude,
        partnerLocation.location.longitude
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
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserLocation(data.userLocation || null);
        setPartnerLocation(data.partnerLocation || null);
      }
    } catch (error) {
      console.error('[DistanceConnector] Failed to load locations:', error);
    }
  };

  const handleEnableLiveLocation = async () => {
    setIsLoading(true);

    try {
      const location = await getCurrentLocation();
      
      if (!location) {
        toast.error('Unable to get your location. Please check permissions.');
        setIsLoading(false);
        return;
      }

      // Save location to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/update-location`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            location,
            locationType: 'live'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save location');
      }

      const locationText = location.city 
        ? `${location.city}${location.country ? ', ' + location.country : ''}`
        : 'your location';
      
      toast.success(`📍 Location updated to ${locationText}`);
      
      await loadLocations();
      setShowSettings(false);
    } catch (error) {
      console.error('[DistanceConnector] Error enabling live location:', error);
      toast.error('Failed to enable live location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetManualLocation = async () => {
    if (!manualCity.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    setIsSubmitting(true);

    try {
      const location = await geocodeCity(manualCity);
      
      if (!location) {
        toast.error('City not found. Please try a different name.');
        setIsSubmitting(false);
        return;
      }

      // Save location to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/update-location`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            location,
            locationType: 'manual'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save location');
      }

      const locationText = location.city 
        ? `${location.city}${location.country ? ', ' + location.country : ''}`
        : manualCity;
      
      toast.success(`📍 Location set to ${locationText}`);
      
      await loadLocations();
      setShowSettings(false);
      setManualCity('');
    } catch (error) {
      console.error('[DistanceConnector] Error setting manual location:', error);
      toast.error('Failed to set location');
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
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove location');
      }

      toast.success('Location removed');
      await loadLocations();
      setShowSettings(false);
    } catch (error) {
      console.error('[DistanceConnector] Error removing location:', error);
      toast.error('Failed to remove location');
    } finally {
      setIsLoading(false);
    }
  };

  if (!partnerId) {
    return null; // Don't show if no partner
  }

  return (
    <>
      {/* Distance Connector Card */}
      <Card className="relative overflow-hidden border-purple-200">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-rose-100 via-purple-100 to-blue-100"
          animate={{
            background: [
              'linear-gradient(135deg, #ffe4e6 0%, #f3e8ff 50%, #dbeafe 100%)',
              'linear-gradient(135deg, #fce7f3 0%, #e9d5ff 50%, #bfdbfe 100%)',
              'linear-gradient(135deg, #fecdd3 0%, #ddd6fe 50%, #93c5fd 100%)',
              'linear-gradient(135deg, #ffe4e6 0%, #f3e8ff 50%, #dbeafe 100%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Floating Flowers Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => {
            const flowers = ['🌸', '🌺', '🌼', '🌷', '🌸', '🌺', '🌼', '🌷'];
            const randomX1 = Math.random() * 50 - 25;
            const randomX2 = Math.random() * 50 - 25;
            const randomX3 = Math.random() * 50 - 25;
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  fontSize: `${28 + Math.random() * 20}px`
                }}
                initial={{ y: '110%', opacity: 0, rotate: 0 }}
                animate={{
                  y: '-110%',
                  opacity: [0, 0.5, 0.6, 0.5, 0],
                  rotate: [0, 90, 180, 270, 360],
                  x: [0, randomX1, randomX2, randomX3, 0]
                }}
                transition={{
                  duration: 15 + Math.random() * 8,
                  repeat: Infinity,
                  delay: i * 2.5,
                  ease: 'easeInOut'
                }}
              >
                {flowers[i]}
              </motion.div>
            );
          })}
        </div>

        <CardContent className="pt-6 pb-4 relative z-10">
          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-purple-600"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Main Content */}
          <div className="space-y-4">
            {/* Profile Pictures with Connection */}
            <div className="relative flex items-center justify-between px-4">
              {/* User Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative z-10"
              >
                <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                  {userAvatar ? (
                    <>
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                      {userInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                {userLocation?.location && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.div>

              {/* Connection Line with Distance */}
              <div className="absolute left-[4rem] right-[4rem] top-8 flex items-center justify-center">
                {/* Distance Badge - Positioned above the line */}
                <AnimatePresence>
                  {distance !== null && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', duration: 0.5, delay: 0.5 }}
                      className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-20 bg-white px-2 py-0.5 rounded-full shadow-md border border-purple-300"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{getDistanceEmoji(distance)}</span>
                        <span className="text-xs font-bold text-purple-900">
                          {formatDistance(distance)}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <svg
                  className="absolute inset-0 w-full h-12"
                  viewBox="0 0 300 48"
                  preserveAspectRatio="none"
                  style={{ overflow: 'visible' }}
                >
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  
                  {/* Curved line */}
                  <motion.path
                    d="M 10 24 Q 150 6, 290 24"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                  
                  {/* Animated hearts traveling along the path */}
                  <AnimatePresence>
                    {distance !== null && (
                      <>
                        {[0, 1, 2].map((index) => {
                          // Calculate bezier curve positions at different t values
                          const getPointOnCurve = (t: number) => {
                            // Quadratic Bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
                            const p0 = { x: 10, y: 24 };
                            const p1 = { x: 150, y: 6 };
                            const p2 = { x: 290, y: 24 };
                            
                            const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
                            const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
                            
                            return { x, y };
                          };

                          return (
                            <motion.g
                              key={index}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <motion.path
                                d="M0,-3 C-1.5,-5 -4,-5 -4,-2.5 C-4,0 0,3 0,5 C0,3 4,0 4,-2.5 C4,-5 1.5,-5 0,-3 Z"
                                fill="#ec4899"
                                stroke="#fff"
                                strokeWidth="0.5"
                                animate={{
                                  translateX: [
                                    getPointOnCurve(0).x,
                                    getPointOnCurve(0.5).x,
                                    getPointOnCurve(1).x
                                  ],
                                  translateY: [
                                    getPointOnCurve(0).y,
                                    getPointOnCurve(0.5).y,
                                    getPointOnCurve(1).y
                                  ],
                                  opacity: [0, 1, 1, 1, 0]
                                }}
                                transition={{
                                  duration: 4,
                                  repeat: Infinity,
                                  delay: index * 1.3,
                                  ease: 'easeInOut'
                                }}
                                style={{ transformOrigin: 'center' }}
                              />
                            </motion.g>
                          );
                        })}
                      </>
                    )}
                  </AnimatePresence>
                </svg>
              </div>

              {/* Partner Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5, delay: 0.2 }}
                className="relative z-10"
              >
                <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                  {partnerAvatar ? (
                    <>
                      <AvatarImage src={partnerAvatar} alt={partnerName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                        {partnerInitials}
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                      {partnerInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                {partnerLocation?.location && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Names and Locations */}
            <div className="flex items-start justify-between text-center text-sm px-2">
              {/* User Info */}
              <div className="flex-1">
                {userLocation?.location ? (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {userLocation.location.city || 'Location set'}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">No location</p>
                )}
              </div>

              {/* Distance Description */}
              {distance !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-shrink-0 px-3"
                >
                  <p className="text-xs font-medium text-purple-600">
                    {getDistanceDescription(distance)}
                  </p>
                </motion.div>
              )}

              {/* Partner Info */}
              <div className="flex-1">
                {partnerLocation?.location ? (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {partnerLocation.location.city || 'Location set'}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">No location</p>
                )}
              </div>
            </div>

            {/* Call to Action */}
            {!userLocation?.location && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="bg-white/80 backdrop-blur-sm text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Set Your Location
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Location Settings
            </DialogTitle>
            <DialogDescription>
              Share your location to see the distance between you and your partner
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Location Status */}
            {userLocation?.location && (
              <Card className="border-green-500 bg-green-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <Check className="w-4 h-4 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">Location Active</h3>
                      <p className="text-sm text-gray-600">
                        {userLocation.location.city 
                          ? `${userLocation.location.city}${userLocation.location.country ? ', ' + userLocation.location.country : ''}`
                          : 'Location set'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {userLocation.locationType === 'live' ? '📍 Live location' : '📌 Manual location'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Location Option */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4 text-purple-600" />
                Live Location
              </h4>
              <p className="text-sm text-gray-600">
                Use your device's GPS to automatically share your current location
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleEnableLiveLocation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 mr-2" />
                    Use Live Location
                  </>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>

            {/* Manual Location Option */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Set Location Manually
              </h4>
              <p className="text-sm text-gray-600">
                Enter your city name to set your location
              </p>
              <div className="space-y-2">
                <Label htmlFor="manual-city">City Name</Label>
                <Input
                  id="manual-city"
                  placeholder="e.g., Addis Ababa, Ethiopia"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSetManualLocation();
                    }
                  }}
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSetManualLocation}
                disabled={isSubmitting || !manualCity.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Set Location
                  </>
                )}
              </Button>
            </div>

            {/* Remove Location */}
            {userLocation?.location && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleRemoveLocation}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove Location
                </Button>
              </>
            )}

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 text-center">
              🔒 Your location is only shared with your partner
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}