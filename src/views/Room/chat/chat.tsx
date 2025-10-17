import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { usePreferencesCtx } from '@/context';
import { BASE_WS_URL } from '@/utils/constants';

import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, SendHorizonalIcon } from 'lucide-react';
import Message from './components/message';
import Sidebar from '../Sidebar';

interface Props {
  open: boolean;
  onClose: () => void;
}

const Chat = ({ open, onClose }: Props) => {
  const { isChatExpanded, setIsChatExpanded } = usePreferencesCtx();
  const { id: roomID } = useParams<{ id: string }>();

  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const chatWS = useRef<WebSocket | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const connectChatWebSocket = useCallback(() => {
    if (!roomID) return;
    if (chatWS.current) return;
    const ws: WebSocket = new WebSocket(`${BASE_WS_URL}/ws/chat/${roomID}`);
    chatWS.current = ws;
    console.log('ws readyState ', ws.readyState);

    ws.onopen = () => {
      console.log('chat socket has opened!');
    };

    ws.onclose = () => {
      console.warn('Chat WebSocket closed');
    };

    ws.onerror = () => {
      console.error('chat socket has closed!');
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data.payload]);
        console.log('message data', data);
      } catch (error) {
        console.error(error);
      }
    };
  }, [roomID]);

  console.log('messages', messages);

  useEffect(() => {
    connectChatWebSocket();

    return () => {
      if (chatWS.current?.readyState === WebSocket.OPEN) {
        chatWS.current.close();
      }
      chatWS.current = null;
    };
  }, [connectChatWebSocket]);

  console.log(chatWS.current?.readyState);

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    const ws = chatWS.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({ payload: text }));
    setInputValue('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Sidebar title='Conversation' open={open} onClose={onClose}>
      <div className='h-[calc(100%-100px)] flex flex-col'>
        <div className='flex-1 flex flex-col justify-between items-center gap-4 w-full py-8 px-12 bg-white rounded-16 overflow-y-auto'>
          <div className='flex flex-col items-center gap-4 w-full '>
            <div className='flex items-center mt-4 self-start gap-24 w-full'>
              <div
                className='p-4 self-center rounded-8 bg-violet-100 hover:bg-violet-200 duration-150 cursor-pointer'
                onClick={() => setIsChatExpanded(!isChatExpanded)}
              >
                {isChatExpanded ? (
                  <ChevronRight size={20} className='text-violet-600' />
                ) : (
                  <ChevronLeft size={20} className='text-violet-600' />
                )}
              </div>
              <div className='flex items-center'>
                <div className='flex items-center gap-8 mr-8'>
                  <p className='self-center text-xs text-slate-800'>
                    Let everyone send messages
                  </p>
                  <Switch />
                </div>
                {/* <Separator orientation='vertical' className='h-6 bg-gray-200' />
                <div className='p-8 rounded-4 hover:scale-125 duration-300 cursor-pointer'>
                  <SettingsIcon size={16} className='text-violet-600' />
                </div> */}
              </div>
            </div>
            <Separator className='mt-4' />
          </div>
          <div className='flex-1 py-4 w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-white'>
            <div className='flex flex-col gap-8'>
              {messages.map((message, index) => (
                <Message key={index} message={message} index={index} />
              ))}
            </div>
            {messages.length > 0 && <div ref={messagesEndRef} />}
          </div>
          <div className='flex gap-4 w-full'>
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Send a message to everyone'
              className='flex-1 py-12 px-4 rounded-12 text-sm font-light indent-16 bg-gray-200 outline-hidden duration-300 ease-in-out hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 resize-none overflow-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                const lineHeight = 44;
                const maxHeight = lineHeight * 2.5;
                target.style.height =
                  Math.min(target.scrollHeight, maxHeight) + 'px';
                target.style.overflowY =
                  target.scrollHeight > maxHeight ? 'auto' : 'hidden';
              }}
            />
            <button
              onClick={sendMessage}
              className='p-12 h-44 self-center rounded-8 duration-200 hover:bg-green-200'
            >
              <SendHorizonalIcon size={20} className='text-green-600' />
            </button>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default Chat;
