import { X } from "lucide-react";
import { Button } from "./button";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  pdfUrl,
  title
}: PDFPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[90vh] mx-4 flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* PDF Viewer */}
        <div className="flex-1 p-4 bg-gray-100">
          <div className="w-full h-full bg-white rounded shadow-inner">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full rounded"
              title={`PDF Preview: ${title}`}
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-600">
            Use browser controls to zoom, download, or print
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => window.open(pdfUrl, '_blank')}
              variant="outline"
              size="sm"
            >
              Open in New Tab
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 