import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { HelpCircle, Share, Plus, Smartphone, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function PWAInstallHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-8">
          <HelpCircle className="w-16 h-16" />
          Install as App
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-8">
            <Smartphone className="w-20 h-20 text-violet-600" />
            Install TwoBeOne as an App
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="ios" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ios">iOS / Safari</TabsTrigger>
            <TabsTrigger value="android">Android / Chrome</TabsTrigger>
          </TabsList>

          <TabsContent value="ios" className="space-y-16 mt-16">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-16">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Important:</strong> This only works in Safari browser on iOS devices
              </p>
            </div>

            <div className="space-y-12">
              <div className="flex items-start gap-12">
                <div className="flex-shrink-0 w-32 h-32 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="text-violet-600 dark:text-violet-400">1</span>
                </div>
                <div className="flex-1 pt-4">
                  <h4 className="text-gray-900 dark:text-gray-100 mb-4">
                    Tap the Share button
                  </h4>
                  <div className="flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                    <Share className="w-20 h-20 text-blue-500" />
                    <span>Found at the bottom (iPhone) or top (iPad) of Safari</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-12">
                <div className="flex-shrink-0 w-32 h-32 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="text-violet-600 dark:text-violet-400">2</span>
                </div>
                <div className="flex-1 pt-4">
                  <h4 className="text-gray-900 dark:text-gray-100 mb-4">
                    Scroll down in the menu
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Look for "Add to Home Screen" option
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-12">
                <div className="flex-shrink-0 w-32 h-32 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="text-violet-600 dark:text-violet-400">3</span>
                </div>
                <div className="flex-1 pt-4">
                  <h4 className="text-gray-900 dark:text-gray-100 mb-4">
                    Tap "Add to Home Screen"
                  </h4>
                  <div className="flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                    <Plus className="w-20 h-20" />
                    <span>Then tap "Add" in the top right</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-12">
                <div className="flex-shrink-0 w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 pt-4">
                  <h4 className="text-gray-900 dark:text-gray-100 mb-4">
                    Done!
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    TwoBeOne will appear on your home screen like a native app
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-16">
              <h4 className="text-yellow-900 dark:text-yellow-200 mb-8">Troubleshooting</h4>
              <ul className="space-y-4 text-sm text-yellow-800 dark:text-yellow-300">
                <li>• Make sure you're using Safari (not Chrome or other browsers)</li>
                <li>• If already installed, delete it from home screen first</li>
                <li>• Try clearing Safari cache in Settings → Safari</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="android" className="space-y-16 mt-16">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-16">
              <p className="text-sm text-green-900 dark:text-green-200">
                <strong>Note:</strong> Works in Chrome, Edge, Firefox, and other browsers on Android
              </p>
            </div>

            <div className="space-y-12">
              <div className="flex items-start gap-12">
                <div className="flex-shrink-0 w-32 h-32 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="text-violet-600 dark:text-violet-400">1</span>
                </div>
                <div className="flex-1 pt-4">
                  <h4 className="text-gray-900 dark:text-gray-100 mb-4">
                    Tap the menu button
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Usually three dots (⋮) in the top right corner
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-12">
                <div className="flex-shrink-0 w-32 h-32 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="text-violet-600 dark:text-violet-400">2</span>
                </div>
                <div className="flex-1 pt-4">
                  <h4 className="text-gray-900 dark:text-gray-100 mb-4">
                    Look for "Install app" or "Add to Home screen"
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Chrome may show an install banner automatically
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-12">
                <div className="flex-shrink-0 w-32 h-32 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="text-violet-600 dark:text-violet-400">3</span>
                </div>
                <div className="flex-1 pt-4">
                  <h4 className="text-gray-900 dark:text-gray-100 mb-4">
                    Tap "Install"
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Confirm the installation when prompted
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-12">
                <div className="flex-shrink-0 w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 pt-4">
                  <h4 className="text-gray-900 dark:text-gray-100 mb-4">
                    Done!
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    TwoBeOne will appear in your app drawer and home screen
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-16 mt-16">
          <h4 className="text-violet-900 dark:text-violet-200 mb-8">✨ Benefits of Installing</h4>
          <ul className="space-y-4 text-sm text-violet-800 dark:text-violet-300">
            <li>• Launch directly from your home screen</li>
            <li>• Full-screen experience without browser UI</li>
            <li>• Faster loading with offline support</li>
            <li>• Receive notifications for devotionals and prayers</li>
            <li>• Works like a native app</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
