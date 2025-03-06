import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config"; // Firebase config
import { convertFileToUrl } from "@/lib/utils";

type ProfileUploaderProps = {
    fieldChange: (files: File[]) => void;
    mediaUrl: string; // Existing profile picture URL
};

const ProfileUploader = ({ fieldChange, mediaUrl }: ProfileUploaderProps) => {
    const [file, setFile] = useState<File[]>([]); // Local file state
    const [fileUrl, setFileUrl] = useState<string>(mediaUrl); // Uploaded file URL
    const [isUploading, setIsUploading] = useState<boolean>(false); // Upload state

    const uploadToFirebase = async (file: File) => {
        try {
            setIsUploading(true);

            // Firebase Storage reference
            const fileRef = ref(storage, `profilePictures/${file.name}`);
            await uploadBytes(fileRef, file);

            // Get uploaded file URL
            const downloadURL = await getDownloadURL(fileRef);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading file:", error);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const onDrop = useCallback(
        async (acceptedFiles: FileWithPath[]) => {
            const uploadedFile = acceptedFiles[0];

            if (!uploadedFile) return;

            // Update local state
            setFile(acceptedFiles);
            fieldChange(acceptedFiles);

            // Convert file to local URL
            const localUrl = convertFileToUrl(uploadedFile);
            setFileUrl(localUrl);

            // Upload file to Firebase and update URL
            const uploadedUrl = await uploadToFirebase(uploadedFile);
            if (uploadedUrl) {
                setFileUrl(uploadedUrl); // Update state with Firebase URL
            }
        },
        [fieldChange]
    );

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpeg", ".jpg"],
        },
    });

    return (
        <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} className="hidden" />
            <div className="cursor-pointer flex-center gap-4">
                {isUploading ? (
                    <p className="text-primary-500 small-regular md:bbase-semibold">
                        Uploading...
                    </p>
                ) : (
                    <>
                        <img
                            src={fileUrl || "/assets/icons/profile-placeholder.svg"}
                            alt="profile"
                            className="h-24 w-24 rounded-full object-cover object-top"
                        />
                        <p className="text-primary-500 small-regular md:base-semibold">
                            Change profile photo
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileUploader;
