import { useCallback, useState} from 'react'
import {useDropzone, FileWithPath} from 'react-dropzone'
import {Button} from "@/components/ui/button.tsx";

type FileUploaderProps = {
    fieldChange: (FILES: File[]) => void;
    mediaUrl?: string;

}

const FileUploader = ({fieldChange, mediaUrl}:FileUploaderProps ) => {
    const [fileUrl, setFileUrl] = useState('');

    const [file, setFile] = useState<File[]>([]);

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
        // Do something with the files
        setFile(acceptedFiles)
        fieldChange(acceptedFiles)
        setFileUrl(URL.createObjectURL(acceptedFiles[0]))
    }, [file])
    const {getRootProps, getInputProps} = useDropzone({onDrop,
        accept:{
        'image/*': ['.png', '.svg', '.jpg', '.jpeg']
        }


    })




    return (

        <div {...getRootProps()} className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer">
            <input {...getInputProps()} className={"cursor-pointer"}/>
            {
              fileUrl ? (
                  <>
                      <div className={"flex flex-1 justify-center w-full p-5 lg:p-10"}>
                          <img
                              src={fileUrl}
                              alt={"file"}
                              className={"file_uploader-img"}
                          />

                      </div>
                      <p className={"file_uploader-label"}>Click or drag photo to replace</p>
                  </>
              ) : (
                  <div className={"file_uploader-box"}>
                      <img src="/assets/icons/file-upload.svg"
                           alt="file-upload"
                           width={96}
                           height={77}
                      />
                      <h3 className={"base-medium mb-2 mt-6 text-light-2"}>Drag photo here</h3>
                      <p className={"text-light-4 small-regular mb-6"}>SVG,PNG,JPEG</p>
                      <Button className={"shad-button_dark_4"}>Upload</Button>
                  </div>

              )
                                }
        </div>
    )
}
export default FileUploader
