import { FormEvent, useEffect, useState } from 'react';

export function Chat() {
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/openai/getChats?name=test`)
      .then((res) => res.json())
      .then((data) => setChats(data))
      .catch((err) => console.error('get 실패', err));
  }, []);

  const chat = async (e: FormEvent, message: string) => {
    e.preventDefault();
    if (!message) return;
    setIsTyping(true);
    const msgs: any[] = chats;
    msgs.push({ role: 'user', content: message });
    setChats(msgs);

    setMessage('');

    fetch('http://localhost:8000/api/openai/sendChat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chats,
        name: 'test',
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        msgs.push(data.output);
        setChats(msgs);
        setIsTyping(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <>
      <h1>CHAT~</h1>

      <section>
        {chats && chats.length
          ? chats.map((chat, index) => (
              <p key={index} className={chat.role === 'user' ? 'user_msg' : ''}>
                <span>
                  <b>{chat.role.toUpperCase()}</b>
                </span>
                <span>:</span>
                <span>{chat.content}</span>
              </p>
            ))
          : ''}
      </section>

      <div className={isTyping ? '' : 'hide'}>
        <p>
          <i>{isTyping ? 'Typing' : ''}</i>
        </p>
      </div>

      <form action="" onSubmit={(e) => chat(e, message)}>
        <input
          type="text"
          name="message"
          value={message}
          placeholder="메세지 입력"
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
    </>
  );
}

export default Chat;
