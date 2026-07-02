import { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Shield, FileText, AlertCircle } from 'lucide-react';
import { PrivacyPolicy } from '../legal/privacy-policy';
import { TermsOfService } from '../legal/terms-of-service';

interface LegalConsentProps {
  language?: 'en' | 'am';
  onAccept: () => void;
  isLoading?: boolean;
}

export function LegalConsent({ language = 'en', onAccept, isLoading = false }: LegalConsentProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const canProceed = agreedToTerms && agreedToPrivacy;

  const content = language === 'am' ? {
    title: 'ህጋዊ ስምምነት ያስፈልጋል',
    description: 'እባክዎ ከመቀጠልዎ በፊት የሚከተሉትን ይንብቡ እና ይስማሙ',
    agreeTerms: 'የአገልግሎት ውሎችን አንብቤ እስማማለሁ',
    agreePrivacy: 'የግላዊነት ፖሊሲን አንብቤ እስማማለሁ',
    viewTerms: 'የአገልግሎት ውሎችን ይመልከቱ',
    viewPrivacy: 'የግላዊነት ፖሊሲን ይመልከቱ',
    importantNote: 'አስፈላጊ ማስታወሻ',
    noteText: 'ከአጋር ጋር በመገናኘት፣ አጋርዎ የተጋራ ይዘትዎን እንደሚደርስ ይስማማሉ። ለበለጠ ዝርዝር የግላዊነት ፖሊሲን ይመልከቱ።',
    continue: 'ቀጥል',
    mustAgree: 'ለመቀጠል ሁለቱንም መስማማት አለብዎ'
  } : {
    title: 'Legal Agreement Required',
    description: 'Please read and agree to the following before continuing',
    agreeTerms: 'I have read and agree to the Terms of Service',
    agreePrivacy: 'I have read and agree to the Privacy Policy',
    viewTerms: 'View Terms of Service',
    viewPrivacy: 'View Privacy Policy',
    importantNote: 'Important Note',
    noteText: 'By connecting with a partner, you agree that your partner will have access to your shared content. See Privacy Policy for details.',
    continue: 'Continue',
    mustAgree: 'You must agree to both to continue'
  };

  return (
    <>
      <div className="space-y-6 py-4">
        {/* Important Note */}
        <div className="bg-primary-50 border-l-4 border-primary-600 p-4 rounded">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-primary-900 mb-1">{content.importantNote}</h4>
              <p className="text-sm text-primary-800">{content.noteText}</p>
            </div>
          </div>
        </div>

        {/* Legal Checkboxes */}
        <div className="space-y-4">
          {/* Terms of Service */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="terms"
                  className="text-sm cursor-pointer leading-relaxed"
                >
                  {content.agreeTerms}
                </Label>
              </div>
            </div>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-primary-600 hover:text-primary-700 ml-8"
              onClick={() => setShowTerms(true)}
            >
              <FileText className="w-3 h-3 mr-1" />
              {content.viewTerms}
            </Button>
          </div>

          {/* Privacy Policy */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={agreedToPrivacy}
                onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="privacy"
                  className="text-sm cursor-pointer leading-relaxed"
                >
                  {content.agreePrivacy}
                </Label>
              </div>
            </div>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-primary-600 hover:text-primary-700 ml-8"
              onClick={() => setShowPrivacy(true)}
            >
              <Shield className="w-3 h-3 mr-1" />
              {content.viewPrivacy}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {!canProceed && (
          <p className="text-xs text-muted-foreground text-center">
            {content.mustAgree}
          </p>
        )}

        {/* Continue Button */}
        <Button
          className="w-full bg-primary-600 hover:bg-primary-700"
          disabled={!canProceed || isLoading}
          onClick={onAccept}
        >
          {content.continue}
        </Button>
      </div>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {language === 'am' ? 'የግላዊነት ፖሊሲ' : 'Privacy Policy'}
            </DialogTitle>
            <DialogDescription>
              {language === 'am' 
                ? 'የግላዊ መረጃዎን እንዴት እንሰበስብ፣ እንጠቀም እና እንጠብቅ' 
                : 'How we collect, use, and protect your personal information'}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            <PrivacyPolicy language={language} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {language === 'am' ? 'የአገልግሎት ውል' : 'Terms of Service'}
            </DialogTitle>
            <DialogDescription>
              {language === 'am' 
                ? 'የቱቤዎንን መተግበሪያ የመጠቀም ውል እና ሁኔታዎች' 
                : 'Agreement and conditions for using TwoBeOne app'}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            <TermsOfService language={language} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
