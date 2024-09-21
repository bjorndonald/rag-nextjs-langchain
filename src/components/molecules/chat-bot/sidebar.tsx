"use client";
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Plus, MessageSquare, Home } from 'lucide-react'
import React from 'react'

const SideBar = () => {
    return (
        <div className="w-64 bg-gray-900 text-white p-4 hidden md:block">
            <Button variant="ghost" className="w-full mb-4 text-white border-white hover:bg-gray-800 hover:text-white">
                <Home className="mr-2 h-4 w-4" /> Home
            </Button>
            <Button variant="outline" className="w-full mb-4 text-black border-white hover:bg-gray-800 hover:text-white">
                <Plus className="mr-2 h-4 w-4" /> New Chat
            </Button>
            <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="space-y-2">
                    {/* Chat history items would go here */}
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat 1
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat 2
                    </Button>
                </div>
            </ScrollArea>
        </div>
    )
}

export default SideBar