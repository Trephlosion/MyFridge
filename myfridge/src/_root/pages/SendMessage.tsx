import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { sendMessage } from "@/lib/firebase/sendMessage"; // ✅ adjust the path if needed

const SendMessage = () => {
    const { userId: toUserId } = useParams();
    const { user: sender } = useUserContext();
    const navigate = useNavigate();

    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        if (!toUserId || !subject || !message) {
            alert("Please fill out all fields");
            return;
        }

        const fromUserId = sender?.id;
        if (!fromUserId) return;

        const response = await sendMessage({
            toUserId,
            fromUserId,
            subject,
            text: message,
        });

        if (response.success) {
            alert("Message sent!");
            navigate("/inbox");
        } else {
            alert("Failed to send message.");
        }
    };

    return (
        <div className="common-container">
            <h2 className="h2-bold mb-4">Send Message</h2>

            <input
                className="w-full border border-gray-300 rounded-md p-2 mb-4 text-black"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />

            <textarea
                className="w-full border border-gray-300 rounded-md p-2 mb-4 text-black"
                rows={5}
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <Button onClick={handleSubmit} className="shad-button_primary">
                Send
            </Button>
        </div>
    );
};

export default SendMessage;








/*
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

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
            <h2 className="h2-bold mb-4">Send Message</h2>

            <input
                className="w-full border border-gray-300 rounded-md p-2 mb-4 text-black"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />

            <textarea
                className="w-full border border-gray-300 rounded-md p-2 mb-4 text-black"
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

 */





