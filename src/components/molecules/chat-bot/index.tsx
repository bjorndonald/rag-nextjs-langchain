"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Menu, Paperclip } from 'lucide-react'
import React, { FormEvent, useRef, useState } from 'react'

import UploadPdf from './upload-pdf';
import useChatBot from './store';
import { ChatWindowMessage } from '@/types/ChatWindowMessage';
import { Id, toast, ToastContainer } from 'react-toastify';


const ChatBot = () => {
    const messages = useChatBot(s => s.messages)
    const setMessages = useChatBot(s => s.setMessages)
    const [isPopupOpen, setIsPopupOpen] = useState(true)
    const [input, setInput] = useState('')

    async function streamingFetch(input: RequestInfo | URL, init?: RequestInit) {
        try {
            const response = await fetch(input, init)
            if (!response.ok) throw new Error("Network error")
            const reader = response.body?.getReader();

            return reader
        } catch (error) {
            throw error
        }
    }

    async function sendMessage(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log(input)
        if (!input) {
            return;
        }


        const initialInput = input;
        const initialMessages = [...messages];
        const newMessages = [...initialMessages, { role: "human" as const, content: input }];

        setMessages(newMessages)
        setInput("");

        try {
            console.log(input)
            const decoder = new TextDecoder('utf-8');
            // const stream = await queryStore(newMessages);
            // const reader = stream.getReader();

            const areader = await streamingFetch("/api/request", {
                method: "POST", body: JSON.stringify({ messages: newMessages })
            })

            let achunk = await areader?.read()
            // let chunk = await reader.read();
            if (!achunk?.value) {
                console.log("Wahala")
                return
            }
            // console.log(chunk.value)
            const aiResponseMessage: ChatWindowMessage = {
                content: "",
                role: "ai" as const,
            };

            setMessages([...newMessages, aiResponseMessage]);

            while (!achunk?.done) {
                aiResponseMessage.content = aiResponseMessage.content + decoder.decode(achunk?.value);
                setMessages([...newMessages, aiResponseMessage]);
                achunk = await areader?.read();
            }
        } catch (error: any) {
            setMessages(initialMessages);
            setInput(initialInput);
            toast(`There was an issue with querying your PDF: ${error.message}`, {
                theme: "dark",
            });
        }
    }

    return (
        <>
            <ToastContainer />
            <div className="flex w-full max-w-2xl mx-auto px-4 h-[calc(100vh-32px)] bg-gray-100">
                {/* Sidebar */}

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Pdf Dialog */}
                    <UploadPdf isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
                    {/* Mobile Header */}
                    <div className="bg-white border-b p-4 md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`mb-4 ${message.role === 'human' ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block p-2 rounded-lg ${message.role === 'human' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {message.content}
                                </div>
                            </div>
                        ))}
                    </ScrollArea>

                    {/* Input Area */}
                    <form onSubmit={sendMessage} className="border-t p-4">
                        <div className="flex items-center">
                            <Input
                                type="text"
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 mr-2"
                            // onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <Button type='button' variant={"ghost"} onClick={() => setIsPopupOpen(true)}>
                                <Paperclip className="h-4 mr-4 w-4" />
                            </Button>
                            <Button type='submit' variant={"ghost"}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default ChatBot