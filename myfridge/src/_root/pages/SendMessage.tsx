import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { database } from "@/lib/firebase/config";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const SendMessage = () => {
    const { userId } = useParams();
    const { user: admin } = useUserContext();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const messageRef = doc(database, "messages", userId!);
        const snapshot = await getDoc(messageRef);

        const newMessage = {
            text: message,
            sentAt: new Date(),
            fromUserId: admin.id,
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
            <textarea
                className="w-full border border-gray-300 rounded-md p-2 mb-4 text-black"
                rows={5}
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
