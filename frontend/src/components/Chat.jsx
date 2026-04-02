// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// import { useSelector } from "react-redux";
// import { useSocket } from "../utils/useSocket";

// const Chat = () => {
//   const user = useSelector((state) => state.user);
//   const { targetUserID } = useParams();
//   const [message, setMessage] = useState("");
//   // eslint-disable-next-line no-unused-vars
//   const [messages, setMessages] = useState([{ text: "Hello" }, { text: "Hi" }]);

//   const connection = useSocket();

//   useEffect(() => {
//     if (!user.data) return;

//     connection.emit("joinChat", { fromUserID: user.data._id, firstName: user.data.firstName, toUserID: targetUserID });

//     return () => {
//       connection.disconnect();
//     };
//   }, [user, targetUserID, connection]);

//   function handleSubmit(e) {
//     e.preventDefault();

//     connection.emit("sendMessage", { fromUserID: user.data._id, firstName: user.data.firstName, toUserID: targetUserID, text: message });
//     // setMessages([...messages, { text: message }]);
//     setMessage("");
//   }

//   return (
//     <div>
//       <h1 className="my-4 text-3xl text-center">Chat</h1>
//       <div className="h-[400px] w-[65vw] bg-gray-200 overflow-y-auto">
//         {messages.map((m, index) => {
//           return (
//             <div key={index} className="chat chat-start">
//               <div className="chat-bubble chat-bubble-error">{m.text}</div>
//             </div>
//           );
//         })}
//       </div>
//       <form onSubmit={e => handleSubmit(e)}>
//         <input
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type a message"
//           className="input"
//         />
//         <button className="btn btn-primary">Send</button>
//       </form>
//     </div>
//   );
// };

// export default Chat;
