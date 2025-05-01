// SendMessage.tsx
import {useParams, useNavigate} from "react-router-dom";
import { useState } from "react";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { database } from "@/lib/firebase/config.ts";
import { useUserContext } from "@/context/AuthContext.tsx";
import { Button } from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Card, CardContent, CardFooter, CardTitle} from "@/components/ui/card.tsx";

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
        <>
        <div className="common-container">
            <Card className={"recipe-card"}>
                <CardTitle className={"h2-bold mb-4"}>Send Message</CardTitle>
                <CardContent>
                    <p className="text-light-4">Enter a subject line.</p>
                    <Input
                    className="w-full border rounded p-2 mb-4 text-black bg-light-2"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
                    <p className="text-light-4">Send a message to the user.</p>
                    <Textarea
                    className="w-full border rounded p-2 mb-4 text-black bg-light-2"
                    rows={5}
                    placeholder="Write your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                </CardContent>
                <CardFooter className={"flex-row gap-3"}>
                    <Button onClick={() => navigate(-1)} className="bg-dark-3 hover:bg-red transition rounded">
                        Cancel
                    </Button>
                    <Button onClick={handleSendMessage} className=" bg-dark-3 hover:bg-primary-500 transition rounded">
                        Send
                    </Button>
                </CardFooter>
            </Card>
        </div></>
    );
};

export default SendMessage;
