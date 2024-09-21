import ChatBot from '@/components/molecules/chat-bot'
import Image from 'next/image'
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-4">
      <ChatBot />
    </main>
  )
}
