// SendMessage.tsx
import {useParams, useNavigate, Link} from "react-router-dom";
import { useState } from "react";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";

const SendMessage = () => {
    const { userId } = useParams();
    const { user: sender } = useUserContext();
    const navigate = useNavigate();
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSendMessage = async () => {
        if (!message.trim() || !subject.trim()) return;

        const messageRef = doc(database, "messages", userId!);
        const snapshot = await getDoc(messageRef);

        const newMessage = {
            subject: subject.trim(),
            text: message.trim(),
            sentAt: new Date(),
            fromUserId: sender.id,
            fromUsername: sender.username,
            toUserId: userId
        };

        if (snapshot.exists()) {
            await updateDoc(messageRef, {
                inbox: arrayUnion(newMessage)
            });
        } else {
            await setDoc(messageRef, {
                inbox: [newMessage]
            });
        }

        navigate("/all-users");
    };

    return (
        <div className="common-container">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link className={"hover:text-accentColor"} to="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link className={"hover:text-accentColor"} to="/all-users">Users</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink>Send Message</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h2 className="h2-bold mb-4">Send Message</h2>

            <Input
                className="w-full border border-gray-300 rounded-md p-2 mb-4 text-black bg-dark-4"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />

            <Textarea
                className="w-full border border-gray-300 rounded-md p-2 mb-4 text-black bg-dark-4"
                rows={5}
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <Button onClick={handleSendMessage} className="shad-button_primary">
                Send
            </Button>
        </div>
    );
};

export default SendMessage;
