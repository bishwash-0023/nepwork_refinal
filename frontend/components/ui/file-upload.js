'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';

export function FileUpload({ onFileUploaded, currentFile = null, label = 'Upload File', accept = '.pdf,.doc,.docx' }) {
    const [fileName, setFileName] = useState(currentFile ? 'File Attached' : null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(!!currentFile);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (10MB for docs)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setFileName(file.name);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file); // Backend uses 'image' key for all uploads currently
            formData.append('context', 'applications');

            const response = await uploadAPI.uploadImage(formData);

            if (response.data.success && onFileUploaded) {
                onFileUploaded(response.data.data.path);
                setUploaded(true);
                toast.success(`${file.name} uploaded successfully`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to upload ${label}`);
            setFileName(null);
            setUploaded(false);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setFileName(null);
        setUploaded(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onFileUploaded) {
            onFileUploaded(null);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                {uploaded ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4" />}
                {label}
            </label>

            <div className={`relative border-2 rounded-2xl p-4 transition-all ${uploaded ? 'border-green-100 bg-green-50/30' : 'border-dashed border-muted-foreground/20 hover:border-primary/50 bg-muted/5'}`}>
                {uploaded ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center border">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold truncate max-w-[200px]">{fileName}</p>
                                <p className="text-[10px] text-green-600 font-bold uppercase">Ready to submit</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div
                        className="text-center cursor-pointer py-2"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors ${uploading ? 'animate-bounce text-primary' : 'text-muted-foreground/40'}`} />
                        <p className="text-sm font-medium text-muted-foreground">
                            {uploading ? 'Uploading your document...' : `Click to upload ${label}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">Maximum 10MB • PDF, DOCX</p>
                    </div>
                )}
            </div>

            <Input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
            />
        </div>
    );
}
