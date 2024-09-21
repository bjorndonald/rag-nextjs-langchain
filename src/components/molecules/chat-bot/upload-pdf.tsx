"use client";
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, FileText, X } from 'lucide-react'
import useChatBot from './store';
import { toast } from 'react-toastify';
import axios from 'axios'

interface PDFUploadPopupProps {
    isOpen: boolean
    onClose: () => void
}

const UploadPdf = ({ isOpen, onClose, }: PDFUploadPopupProps) => {

    const [embedding, setEmbedding] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const selectedPDF = useChatBot(s => s.selectedPdf)
    const setSelectedPDF = useChatBot(s => s.setSelectedPdf)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file && file.type === 'application/pdf') {
            setSelectedPDF(file)
            setUploadError(null)
            // Simulate upload progress
            let progress = 0
            const interval = setInterval(() => {
                progress += 10
                setUploadProgress(progress)
                if (progress >= 100) {
                    clearInterval(interval)
                }
            }, 200)
        } else {
            setUploadError('Please upload a valid PDF file.')
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    })

    async function embedPDF() {
        try {
            if (selectedPDF === null) {
                toast(`You must select a file to embed.`, {
                    theme: "dark",
                });
                return;
            }
            setEmbedding(true);
            // setLoading(true)
            const formData = new FormData()
            formData.append("pdf", selectedPDF)
            const res = await axios.post("/api/embed", formData)
            toast(`Embedding finished`, {
                theme: "dark",
            });
            handleClose()
        } catch (error) {
            setEmbedding(false)
            toast(`Embedding error:`, {
                theme: "dark",
            });
            setUploadError('Embedding error')
        }


    }

    const handleClose = () => {
        setSelectedPDF(null)
        setUploadProgress(0)
        setUploadError(null)
        onClose()
        setEmbedding(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => { handleClose }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload PDF</DialogTitle>
                </DialogHeader>
                {!selectedPDF ? (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                            Drag & drop your PDF here, or click to select a file
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-6 w-6 text-blue-500" />
                            <span className="font-medium">{selectedPDF.name}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto"
                                onClick={() => setSelectedPDF(null)}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove file</span>
                            </Button>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                        {uploadProgress === 100 && (
                            <div className="flex items-center text-green-600">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                <span>Upload complete!</span>
                            </div>
                        )}
                    </div>
                )}
                {uploadError && (
                    <div className="flex items-center text-red-600 mt-2">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        <span>{uploadError}</span>
                    </div>
                )}
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    {!!selectedPDF && <Button onClick={embedPDF} disabled={!selectedPDF || uploadProgress < 100}>
                        {uploadProgress < 100 ? 'Uploading...' : embedding ? "Embedding..." : "Embed"}
                    </Button>}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UploadPdf