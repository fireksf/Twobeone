import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { FileText, Shield } from 'lucide-react';
import { useState } from 'react';
import { PrivacyPolicy } from '../legal/privacy-policy';
import { TermsOfService } from '../legal/terms-of-service';

interface LegalFooterProps {
  language?: 'en' | 'am';
}

export function LegalFooter({ language = 'en' }: LegalFooterProps) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      

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
