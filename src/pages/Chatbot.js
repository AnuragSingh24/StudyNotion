import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import axios from "axios";

const ChatBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const formatResponse = (text) => {
        if (!text) return null;

        const lines = text.split("\n").map((line, index) => {
            if (line.trim() === "") return null;

            if (line.startsWith("**") && line.endsWith("**")) {
                return (
                    <h3 key={index} className="font-bold text-[#FCB045]">
                        {line.replace(/\*\*/g, "")}
                    </h3>
                );
            }

            if (line.startsWith("* ")) {
                return (
                    <li key={index} className="list-disc ml-6 text-richblack-100">
                        {line.replace("* ", "")}
                    </li>
                );
            }

            return (
                <p key={index} className="text-richblack-5">
                    {line}
                </p>
            );
        });

        return <div className="space-y-1">{lines}</div>;
    };

    const sendMessage = async () => {
        const trimmedInput = input.trim();

        if (!trimmedInput) {
            const defaultMessage =
                "👋 Hi there! Ask me anything related to StudyNotion, your courses, or tech in general.";
            setMessages((prev) => [...prev, { sender: "bot", text: defaultMessage }]);
            return;
        }

        setMessages((prev) => [...prev, { sender: "user", text: trimmedInput }]);
        setIsLoading(true);
        setInput("");

        try {
            const { data } = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/chatbot`,
                { query: trimmedInput }
            );
            setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "❌ Oops! Something went wrong. Try again later." },
            ]);
        }

        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-[90vh] max-h-[90vh] w-full bg-richblack-700 shadow-xl border border-richblack-600 overflow-hidden">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center mt-20 text-xl md:text-2xl font-semibold text-[#FCB045] animate-pulse">
                        👋 Start chatting with the bot ✨
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-4 max-w-xl rounded-xl shadow-sm border text-sm md:text-base whitespace-pre-wrap ${
                            msg.sender === "user"
                                ? " border-richblack-400 bg-richblack-700 text-yellow-900 ml-auto text-right"
                                : "bg-gray-100 text-richblack-400 mr-auto text-left"
                        }`}
                    >
                        {formatResponse(msg.text)}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-center space-x-2 text-richblack-300 animate-pulse">
                        <Loader2 className="animate-spin" size={24} />
                        <span>Thinking...</span>
                    </div>
                )}
            </div>

            {/* Input Area (Sticky Bottom) */}
            <div className="sticky bottom-0 flex items-center gap-3 p-5 border-t border-richblack-600 bg-richblack-800">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 p-3 border border-richblack-500 rounded-lg outline-none focus:ring-2 focus:ring-[#FCB045] bg-richblack-700 text-white"
                    disabled={isLoading}
                />
                <button
                    onClick={sendMessage}
                    className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white p-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
            </div>
        </div>
    );
};

export default ChatBot;
