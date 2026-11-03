import React, { useRef, useState } from 'react';
import { AttachmentItem } from '@helpdesk360/shared';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Paperclip, Download, Plus, FileText, Loader2, Image as ImageIcon } from 'lucide-react';

export interface AttachmentsListProps {
  ticketId: string;
  attachments?: AttachmentItem[];
  onAttachmentUploaded?: () => void;
  canUpload?: boolean;
}

export const AttachmentsList: React.FC<AttachmentsListProps> = ({
  ticketId,
  attachments = [],
  onAttachmentUploaded,
  canUpload = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await api.postFormData(`/tickets/${ticketId}/attachments`, formData);
      toast.success(`Attached ${file.name} successfully.`);
      if (onAttachmentUploaded) {
        onAttachmentUploaded();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload attachment.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (mimetype: string) => mimetype.startsWith('image/');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-text-muted" />
          Attachments ({attachments.length})
        </h4>

        {canUpload && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              className="hidden"
              accept="image/*,.pdf,.txt,.log,.csv"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-medium text-brand hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
              <span>Attach file</span>
            </button>
          </div>
        )}
      </div>

      {attachments.length === 0 ? (
        <div className="p-3 text-center text-[11px] text-text-muted bg-[#F7F8FA] rounded-md border border-dashed border-border">
          No files attached to this ticket.
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => {
            const fileName = att.fileName || att.filename || 'attachment';
            const mimeType = att.mimeType || att.mimetype || 'application/octet-stream';
            const fileSize = att.fileSize || att.size || 0;

            return (
              <div
                key={att.id}
                className="p-2.5 rounded-lg border border-border bg-surface hover:bg-[#F9FAFB] transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isImage(mimeType) ? (
                    <ImageIcon className="w-4 h-4 text-brand flex-shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#F79009] flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-text-primary truncate">{fileName}</div>
                    <div className="text-[10px] text-text-muted">
                      {formatFileSize(fileSize)} • {new Date(att.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <a
                  href={`/api/tickets/${ticketId}/attachments/${att.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  download={fileName}
                  className="p-1.5 rounded hover:bg-[#F2F4F7] text-text-muted hover:text-brand transition-colors flex-shrink-0"
                  title="Download attachment"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
