"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType: string;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    itemType,
}: DeleteConfirmationModalProps) {
    const [confirmText, setConfirmText] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (confirmText === itemName) {
            onConfirm();
            setConfirmText("");
            setError("");
            onClose();
        } else {
            setError(`Please type "${itemName}" exactly to confirm deletion`);
        }
    };

    const handleClose = () => {
        setConfirmText("");
        setError("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-zinc-900">
                            Delete {itemType}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
                        >
                            <X className="h-5 w-5 text-zinc-400" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                            <p className="text-sm font-bold text-red-900">
                                ⚠️ This action cannot be undone
                            </p>
                            <p className="text-xs text-red-700 mt-2">
                                This will permanently delete the {itemType.toLowerCase()}{" "}
                                <span className="font-bold">"{itemName}"</span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                Type "{itemName}" to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => {
                                    setConfirmText(e.target.value);
                                    setError("");
                                }}
                                placeholder={itemName}
                                className={cn(
                                    "w-full bg-white border rounded-2xl py-3 px-4 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-zinc-900 font-medium",
                                    error ? "border-red-500" : "border-zinc-200"
                                )}
                                autoFocus
                            />
                            {error && (
                                <p className="text-xs text-red-600 font-medium ml-1">
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold py-3 px-6 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!confirmText}
                                className={cn(
                                    "flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg",
                                    !confirmText && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                Delete {itemType}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
