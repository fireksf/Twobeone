import { Globe } from 'lucide-react';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useContentLanguage } from '../../contexts/ContentLanguageContext';

export function ContentLanguageSelector() {
  const { contentLanguage, setContentLanguage } = useContentLanguage();

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-5 h-5 text-sky-600" />
        <Label className="text-sm font-semibold text-sky-700">
          Content Language
        </Label>
      </div>
      <p className="text-xs text-sky-700 mb-3">
        Select the language for the content you're creating. This doesn't change the admin panel interface.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={contentLanguage === 'en' ? 'default' : 'outline'}
          onClick={() => setContentLanguage('en')}
          className={contentLanguage === 'en' ? 'bg-sky-600 hover:bg-sky-700' : ''}
        >
          English
        </Button>
        <Button
          type="button"
          size="sm"
          variant={contentLanguage === 'am' ? 'default' : 'outline'}
          onClick={() => setContentLanguage('am')}
          className={contentLanguage === 'am' ? 'bg-sky-600 hover:bg-sky-700' : ''}
        >
          Amharic (አማርኛ)
        </Button>
      </div>
      <div className="mt-2 text-xs text-sky-600 font-medium">
        Creating content in: {contentLanguage === 'en' ? 'English' : 'Amharic (አማርኛ)'}
      </div>
    </div>
  );
}
