"use client";

import { useState, useEffect } from "react";
import { Loader2, Camera, Trash2, Maximize2, X, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageGallery({ projectId }: { projectId: string }) {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        fetchImages();
    }, [projectId]);

    const fetchImages = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setImages(data.images || []);
            }
        } catch (error) {
            console.error("Failed to fetch images:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("Image is too large (max 10MB)");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = reader.result as string;

                // Using XMLHttpRequest to track upload progress
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `/api/projects/${projectId}/images`, true);
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        setUploadProgress(Math.round(percentComplete));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status === 200 || xhr.status === 201) {
                        setUploadProgress(100);
                        setTimeout(() => {
                            setUploading(false);
                            setUploadProgress(0);
                            fetchImages();
                        }, 500);
                    } else {
                        console.error("Upload failed with status:", xhr.status);
                        setUploading(false);
                        alert("Upload failed. Please try again.");
                    }
                };

                xhr.onerror = () => {
                    console.error("Upload error occurring during request");
                    setUploading(false);
                    alert("An error occurred during upload.");
                };

                xhr.send(JSON.stringify({ image: base64 }));
            };
        } catch (error) {
            console.error("Failed to process image:", error);
            setUploading(false);
        }
    };

    const handleDelete = async (imageUrl: string) => {
        if (!confirm("Remove this image?")) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/images`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl })
            });

            if (res.ok) {
                fetchImages();
            }
        } catch (error) {
            console.error("Failed to delete image:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Upload Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-zinc-900 text-white rounded-2xl">
                        <Camera className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 tracking-tight">Project Media Gallery</h2>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-0.5 opacity-60">Visual Progress Tracking</p>
                    </div>
                </div>
                <div className="relative">
                    <input
                        type="file"
                        id="img-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <label
                        htmlFor="img-upload"
                        className={cn(
                            "flex items-center space-x-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all cursor-pointer shadow-xl",
                            uploading && "opacity-50 pointer-events-none"
                        )}
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        <span>Upload View</span>
                    </label>
                </div>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
                <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-zinc-900 text-white rounded-xl">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Uploading Media...</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Please wait while we process your file</p>
                            </div>
                        </div>
                        <span className="text-lg font-black text-zinc-900">{uploadProgress}%</span>
                    </div>
                    <div className="h-4 bg-zinc-100 rounded-full overflow-hidden p-1 shadow-inner">
                        <div
                            className="h-full bg-zinc-900 rounded-full transition-all duration-300 ease-out shadow-lg flex items-center justify-end px-2"
                            style={{ width: `${uploadProgress}%` }}
                        >
                            <div className="h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse" />
                        </div>
                    </div>
                </div>
            )}

            {/* Warning for Base64 Implementation */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-tight text-yellow-800">
                    Note: Currently using Base64 storage for internal demonstration. Large images may affect performance.
                </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((img, idx) => (
                    <div key={idx} className="group relative aspect-square bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-200 hover:shadow-2xl transition-all duration-500">
                        <img
                            src={img}
                            alt={`Project update ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                            <button
                                onClick={() => setSelectedImage(img)}
                                className="p-3 bg-white text-zinc-900 rounded-xl hover:bg-zinc-100 transition-all scale-75 group-hover:scale-100 duration-300"
                            >
                                <Maximize2 className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => handleDelete(img)}
                                className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all scale-75 group-hover:scale-100 duration-300"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {images.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
                        <div className="p-4 bg-zinc-50 rounded-full inline-block mb-4">
                            <Camera className="h-8 w-8 text-zinc-300" />
                        </div>
                        <p className="text-zinc-400 font-bold italic">Gallery is empty. Start by uploading a project screenshot!</p>
                    </div>
                )}
            </div>

            {/* Zoom Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-8 right-8 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Zoomed project update"
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    />
                </div>
            )}
        </div>
    );
}
